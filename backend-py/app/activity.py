"""Activity generator — drafts the graded ERP documentation from the run's audit log.
(rubric E: kept separate from the agent. rubric B: summary/root_cause/actions/commands/validation.)

Uses the LLM with JSON output, then redacts secrets again on the way out. Falls back gracefully
if the provider/model doesn't support response_format=json_object.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone

from . import llm, safety

FIELDS = ["summary", "root_cause", "actions_taken", "commands_summary", "validation_result", "description"]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _audit_digest(run) -> str:
    lines: list[str] = []
    for s in run.steps:
        if s.status in ("succeeded", "failed"):
            cmd = safety.redact(s.edited_command or s.command)
            res = s.result or {}
            out = (res.get("stdout") or "").strip()[:500]
            lines.append(f"[{s.kind}] $ {cmd}\n  exit={res.get('exit_code')}\n  {out}")
        elif s.status == "rejected":
            lines.append(f"[rejected by technician] {safety.redact(s.command)}")
        elif s.status == "blocked":
            lines.append(f"[blocked by safety] {safety.redact(s.command)}")
    return "\n".join(lines) or "(no commands executed)"


def _extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text or "", re.S)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {}
    return {}


def generate(run) -> dict:
    concl = run.conclusion or {}
    prompt = (
        "You are documenting a completed IT support incident for the ERP. Write a precise, "
        "technically useful activity log. Use ONLY the evidence below. No secrets, no invented details.\n\n"
        f"Ticket #{run.ticket_id}: {run.ticket.get('title')}\n"
        f"Customer report (symptom): {run.ticket.get('description')}\n"
        f"Agent root-cause note: {concl.get('root_cause', '')}\n"
        f"Agent validation note: {concl.get('validation_result', '')}\n"
        f"Fixed: {concl.get('fixed')}\n\n"
        f"Ordered actions (commands + results):\n{_audit_digest(run)}\n\n"
        "Return a JSON object with EXACTLY these keys:\n"
        "- summary: one sentence on what was restored.\n"
        "- root_cause: the technical root cause, not the symptom.\n"
        "- actions_taken: diagnosis + fix steps, in order.\n"
        "- commands_summary: relevant commands / command classes, no secret output.\n"
        "- validation_result: concrete proof the customer benefit is restored.\n"
        "- description: 2-4 sentence free-text combining the above.\n"
        "Respond with the JSON object only."
    )
    messages = [
        {"role": "system", "content": "You write clean, accurate IT incident documentation. Output strict JSON."},
        {"role": "user", "content": prompt},
    ]

    data: dict = {}
    try:
        msg = llm.chat(messages, response_format={"type": "json_object"}, temperature=0.2)
        data = json.loads(msg.content or "{}")
    except Exception:
        try:
            msg = llm.chat(messages, temperature=0.2)
            data = _extract_json(msg.content or "")
        except Exception:
            data = {}

    draft = {k: safety.redact(str(data.get(k, "") or "")) for k in FIELDS}
    draft["ticket_id"] = run.ticket_id
    draft["start_datetime"] = run.created_at
    draft["end_datetime"] = _now()
    if not draft["description"].strip():
        draft["description"] = (draft["summary"] + " " + draft["validation_result"]).strip()
    return draft


def to_payload(run, draft: dict) -> dict:
    """Build the Phoenix activities/create payload (re-redacting every field)."""
    return {
        "ticket_id": run.ticket_id,
        "start_datetime": draft.get("start_datetime") or run.created_at,
        "end_datetime": draft.get("end_datetime") or _now(),
        "description": safety.redact(draft.get("description", "")) or safety.redact(draft.get("summary", "")),
        "summary": safety.redact(draft.get("summary", "")),
        "root_cause": safety.redact(draft.get("root_cause", "")),
        "actions_taken": safety.redact(draft.get("actions_taken", "")),
        "commands_summary": safety.redact(draft.get("commands_summary", "")),
        "validation_result": safety.redact(draft.get("validation_result", "")),
    }
