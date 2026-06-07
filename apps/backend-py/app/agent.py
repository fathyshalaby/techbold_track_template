"""Agent — builds the prompt + tools and asks the LLM for the NEXT single action.

Step-wise human-in-the-loop: one model call -> one proposed command (or `conclude`). The
runs module executes approved commands over SSH and calls back for the next step. Keeping it
one-command-at-a-time is what makes the per-command approval gate clean and auditable.

Operational system prompt mirrors shared/agent-spec.md — keep them in sync.
"""

from __future__ import annotations

import json
from typing import Any

from . import knowledge, llm

SYSTEM_PROMPT = (
    """You are an expert Linux service-desk technician's copilot. You troubleshoot ONE \
customer incident on a remote Ubuntu server over SSH, under the technician's control.

You never run anything yourself. You propose ONE command at a time via the run_command tool. A human \
approves, edits, or rejects each one; you only see a command's output after it has been approved and \
executed. Work strictly from the evidence you have — never assume a command ran.

Method (diagnosis-first):
1. Start with READ-ONLY diagnostics (status, logs, ports, configs) to find the technical ROOT CAUSE, \
not just the symptom. Briefly state your leading hypothesis before acting.
2. Propose the SMALLEST, most targeted fix that addresses the root cause. Prefer editing the real \
config / enabling the unit over a runtime-only patch.
3. Ensure PERSISTENCE: the fix must survive a reboot or service restart (systemctl enable --now, \
persisted config, correct permissions/fstab) — the grader reboots.
4. VALIDATE with concrete proof the customer benefit is restored (service active, port listening, \
endpoint returns 200, etc.).
5. When resolved (or blocked), call conclude.

Safety contract (non-negotiable):
- One command per run_command call. Avoid chaining with ; && | $() or backticks unless truly required \
and justified.
- Minimal changes. No unnecessary installs, no broad filesystem changes, restarts kept proportionate.
- NEVER propose: deleting/reinitialising databases or customer data; chmod -R 777 on system dirs; \
deleting /etc, /home, /var/lib/postgresql; disabling the firewall/audit/security controls; clearing \
logs or history; running the app as root to dodge DB permissions.
- NEVER read, echo, or exfiltrate secrets (keys, passwords, tokens). Inspect structure/permissions, \
not secret contents.
- Give a one-or-two-sentence rationale a technician can verify for every command.

Be decisive and economical — fewer, well-targeted commands score better. You are facing an incident \
you have never seen; reason from first principles, do not assume a specific product.

"""
    + knowledge.DIAGNOSTIC_METHOD
)

TOOLS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": (
                "Propose ONE shell command to run on the customer's Ubuntu VM over SSH. A human "
                "approves, edits, or rejects it before it runs; you only see output after approval."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "One shell command. No secrets. No chaining unless justified.",
                    },
                    "purpose": {
                        "type": "string",
                        "enum": ["diagnose", "fix", "validate"],
                    },
                    "rationale": {
                        "type": "string",
                        "description": "Why this command, in one or two sentences.",
                    },
                },
                "required": ["command", "purpose", "rationale"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "conclude",
            "description": "Call when the incident is resolved (or you are blocked). Ends the session.",
            "parameters": {
                "type": "object",
                "properties": {
                    "root_cause": {
                        "type": "string",
                        "description": "The technical root cause, not the symptom.",
                    },
                    "fixed": {"type": "boolean"},
                    "validation_result": {
                        "type": "string",
                        "description": "Concrete proof, or why still blocked.",
                    },
                },
                "required": ["root_cause", "fixed", "validation_result"],
            },
        },
    },
]


def initial_messages(ticket: dict, system: dict) -> list[dict]:
    user = (
        f"Ticket #{ticket.get('id')}: {ticket.get('title')}\n"
        f"Customer: {ticket.get('customer_name')}\n"
        f"Priority: {ticket.get('priority')}\n"
        f"Customer report (symptom only): {ticket.get('description')}\n\n"
        f"Customer system: {system.get('os')} at {system.get('ip')}:{system.get('port')} "
        f"as user {system.get('username')}.\n"
        f"Notes: {system.get('notes', '') or '(none)'}\n\n"
        "Begin with read-only diagnostics to find the technical root cause, then propose a minimal, "
        "persistent fix, then validate. Propose ONE command at a time via run_command; call conclude "
        "when done."
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user},
    ]
    # Route the relevant runbook slice by symptom (ticket title + description) and add it as
    # per-incident context — the method lives in the system prompt; this is the matched runbook.
    runbook = knowledge.select_runbooks(
        f"{ticket.get('title', '')} {ticket.get('description', '')}"
    )
    if runbook:
        messages.append(
            {
                "role": "system",
                "content": f"Relevant runbook for this symptom class:\n{runbook}",
            }
        )
    return messages


def _assistant_to_dict(msg: Any) -> dict:
    d: dict[str, Any] = {"role": "assistant", "content": msg.content or ""}
    if getattr(msg, "tool_calls", None):
        d["tool_calls"] = [
            {
                "id": tc.id,
                "type": "function",
                "function": {
                    "name": tc.function.name,
                    "arguments": tc.function.arguments,
                },
            }
            for tc in msg.tool_calls
        ]
    return d


def tool_result_message(tool_call_id: str, content: str) -> dict:
    return {"role": "tool", "tool_call_id": tool_call_id, "content": content}


def _safe_json(arguments: str) -> dict:
    try:
        return json.loads(arguments or "{}")
    except json.JSONDecodeError:
        # light repair: trailing commas + smart quotes
        cleaned = (arguments or "").replace("“", '"').replace("”", '"')
        cleaned = cleaned.rstrip().rstrip(",")
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {}


def next_action(messages: list[dict]) -> dict:
    """Ask the LLM for the next action.

    Returns one of:
      {"type": "run_command", "args": {...}, "tool_call_id": str, "assistant_message": dict}
      {"type": "conclude",    "args": {...}, "tool_call_id": str, "assistant_message": dict}
      {"type": "message",     "content": str, "assistant_message": dict}   # no tool call -> runs layer nudges
    """
    msg = llm.chat(messages, tools=TOOLS, tool_choice="auto")
    assistant = _assistant_to_dict(msg)
    tool_calls = getattr(msg, "tool_calls", None)
    if tool_calls:
        tc = tool_calls[0]
        args = _safe_json(tc.function.arguments)
        return {
            "type": tc.function.name
            if tc.function.name in ("run_command", "conclude")
            else "message",
            "args": args,
            "tool_call_id": tc.id,
            "assistant_message": assistant,
        }
    return {
        "type": "message",
        "content": msg.content or "",
        "assistant_message": assistant,
    }
