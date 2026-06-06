"""Runs — the human-in-the-loop state machine.
(rubric C/D: every action proposed, approved/edited/rejected, executed, and logged; abort anytime.)

A run holds the LLM conversation, an ordered list of proposed Steps, and a full audit trail.
The agent proposes ONE command; the run pauses (awaiting_approval) until the technician approves
(optionally edited), rejects, or aborts. Approved commands pass the safety layer, run over SSH,
and the (redacted) result is fed back so the agent proposes the next step — until it concludes.

In-memory store (single-user hackathon demo). Swap RUNS for a DB to persist.
"""
from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Optional

from . import activity as activity_mod
from . import agent, llm, safety
from .config import settings
from .erp import PhoenixClient
from .ssh import SSHError, SSHRunner

erp = PhoenixClient()

_MAX_AUTO_ADVANCE = 6  # guard against runaway auto-advance (safety-blocked / no-tool-call loops)


class RunError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Step:
    id: str
    index: int
    kind: str
    command: str
    rationale: str
    tool_call_id: str
    risk: str = "needs_review"
    safety: dict = field(default_factory=dict)
    status: str = "pending_approval"
    edited_command: Optional[str] = None
    result: Optional[dict] = None
    created_at: str = field(default_factory=_now)
    decided_at: Optional[str] = None
    ran_at: Optional[str] = None

    def as_dict(self) -> dict:
        return asdict(self)


@dataclass
class AuditEntry:
    ts: str
    actor: str
    type: str
    step_id: Optional[str] = None
    command: Optional[str] = None
    exit_code: Optional[int] = None
    note: Optional[str] = None

    def as_dict(self) -> dict:
        return asdict(self)


class Run:
    def __init__(self, run_id: str, ticket: dict, system: dict):
        self.id = run_id
        self.ticket_id = ticket.get("id")
        self.ticket = ticket
        self.system = system
        self.status = "analyzing"
        self.created_at = _now()
        self.updated_at = self.created_at
        self.steps: list[Step] = []
        self.audit: list[AuditEntry] = []
        self.messages: list[dict] = []
        self.conclusion: Optional[dict] = None
        self.activity_draft: Optional[dict] = None
        self.pending_step_id: Optional[str] = None
        self._ssh: Optional[SSHRunner] = None
        self._auto = 0

    def touch(self) -> None:
        self.updated_at = _now()

    def log(self, actor: str, type_: str, **kw) -> None:
        self.audit.append(AuditEntry(ts=_now(), actor=actor, type=type_, **kw))
        self.touch()

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "ticket": self.ticket,
            "system": self.system,
            "pending_step_id": self.pending_step_id,
            "steps": [s.as_dict() for s in self.steps],
            "audit": [a.as_dict() for a in self.audit],
            "conclusion": self.conclusion,
            "activity_draft": self.activity_draft,
        }


RUNS: dict[str, Run] = {}


def _get(run_id: str) -> Run:
    run = RUNS.get(run_id)
    if run is None:
        raise RunError(f"run {run_id} not found", 404)
    return run


def _find_step(run: Run, step_id: str) -> Optional[Step]:
    return next((s for s in run.steps if s.id == step_id), None)


def resolve_key_path(ticket: dict, system: dict) -> str:
    # TODO: map the per-VM key (case1..5) — e.g. by customer_id or system notes.
    # For now use the single active key from env.
    return settings.ssh_private_key_path


# ---- lifecycle ----------------------------------------------------------------------

def create_run(ticket_id: int) -> Run:
    ticket = erp.get_ticket(ticket_id)
    cs = erp.get_customer_system(ticket_id)
    system = cs.get("system", cs)
    run = Run("run_" + uuid.uuid4().hex[:8], ticket, system)
    RUNS[run.id] = run
    run.messages = agent.initial_messages(ticket, system)
    run._ssh = SSHRunner(
        host=system.get("ip"),
        port=int(system.get("port") or 22),
        username=system.get("username"),
        key_path=resolve_key_path(ticket, system),
    )
    run.log("system", "run_created", note=f"ticket {ticket_id}")
    _advance(run)
    return run


def _advance(run: Run) -> None:
    """Drive the agent forward until it proposes a command that needs human approval, or concludes."""
    run._auto = 0
    while True:
        if run.status in ("done", "aborted", "error"):
            return
        if run._auto >= _MAX_AUTO_ADVANCE:
            run.status = "error"
            run.log("system", "error", note="too many automatic advances without a human-approvable step")
            return
        run._auto += 1

        try:
            action = agent.next_action(run.messages)
        except llm.LLMError as exc:
            run.status = "error"
            run.log("system", "error", note=str(exc))
            return

        run.messages.append(action["assistant_message"])
        atype = action["type"]

        if atype == "conclude":
            run.conclusion = action.get("args", {})
            run.status = "done"
            run.pending_step_id = None
            run.log("agent", "validated", note=safety.redact(run.conclusion.get("validation_result", "")))
            if run._ssh:
                run._ssh.close()
            return

        if atype == "run_command":
            args = action.get("args", {})
            command = (args.get("command") or "").strip()
            step = Step(
                id=f"step_{len(run.steps)}",
                index=len(run.steps),
                kind=args.get("purpose") or "diagnose",
                command=command,
                rationale=args.get("rationale") or "",
                tool_call_id=action["tool_call_id"],
            )
            verdict = safety.classify(command)
            step.safety = verdict
            step.risk = verdict["risk"]
            run.steps.append(step)

            if verdict["classification"] == "blocked":
                step.status = "blocked"
                run.log("system", "blocked", step_id=step.id, command=safety.redact(command), note=verdict["reason"])
                run.messages.append(
                    agent.tool_result_message(
                        step.tool_call_id,
                        f"BLOCKED by safety layer: {verdict['reason']}. This command will NOT run. "
                        "Propose a safer, more targeted approach.",
                    )
                )
                continue  # auto-advance for an alternative

            run.log("agent", "proposed", step_id=step.id, command=safety.redact(command), note=step.rationale)

            # Selective human-in-the-loop: auto-run READ-ONLY diagnostics; gate every write.
            if (
                verdict["classification"] == "low_risk"
                and settings.auto_run_readonly
                and run._auto < _MAX_AUTO_ADVANCE
            ):
                _execute(run, step, command, auto=True)
                continue  # diagnostic ran automatically; keep going until a write or conclusion

            step.status = "pending_approval"
            run.pending_step_id = step.id
            run.status = "awaiting_approval"
            return

        # No tool call -> nudge the model back to the tools.
        run.messages.append({"role": "user", "content": "Use the run_command tool to propose ONE command, or call conclude."})


def _execute(run: Run, step: Step, command: str, auto: bool) -> None:
    """Run an approved (or auto-approved read-only) command over SSH; feed the redacted result back."""
    step.status = "running"
    step.decided_at = _now()
    run.status = "running"
    run.pending_step_id = None
    run.log(
        "agent" if auto else "technician",
        "auto_executed" if auto else "approved",
        step_id=step.id,
        command=safety.redact(command),
    )
    try:
        result = run._ssh.run(command)  # type: ignore[union-attr]
    except SSHError as exc:
        step.status = "failed"
        step.result = {"exit_code": 255, "stdout": "", "stderr": str(exc), "duration_ms": 0, "truncated": False}
        run.log("system", "error", step_id=step.id, note=f"ssh error: {exc}")
        run.messages.append(agent.tool_result_message(step.tool_call_id, f"SSH ERROR: {exc}"))
        return
    step.ran_at = _now()
    redacted = {
        "exit_code": result.exit_code,
        "stdout": safety.redact(result.stdout),
        "stderr": safety.redact(result.stderr),
        "duration_ms": result.duration_ms,
        "truncated": result.truncated,
    }
    step.result = redacted
    step.status = "succeeded" if result.exit_code == 0 else "failed"
    run.log("system", "executed", step_id=step.id, command=safety.redact(command), exit_code=result.exit_code)
    tool_content = f"exit_code={result.exit_code}\nstdout:\n{redacted['stdout']}\nstderr:\n{redacted['stderr']}"
    run.messages.append(agent.tool_result_message(step.tool_call_id, tool_content[:8000]))


def approve_step(run_id: str, step_id: str, edited_command: Optional[str] = None) -> Run:
    run = _get(run_id)
    step = _find_step(run, step_id)
    if step is None or step.status != "pending_approval" or run.pending_step_id != step_id:
        raise RunError("no pending step with that id", 409)

    command = (edited_command or step.command).strip()
    if edited_command and command != step.command:
        step.edited_command = command
        run.log("technician", "edited", step_id=step.id, command=safety.redact(command))

    # Re-check safety on the FINAL command (it may have been edited).
    verdict = safety.classify(command)
    step.safety = verdict
    step.risk = verdict["risk"]
    if verdict["classification"] == "blocked":
        step.status = "blocked"
        run.pending_step_id = None
        run.status = "analyzing"
        run.log("system", "blocked", step_id=step.id, command=safety.redact(command), note=verdict["reason"])
        run.messages.append(
            agent.tool_result_message(step.tool_call_id, f"BLOCKED by safety layer: {verdict['reason']}. Propose a safer approach.")
        )
        _advance(run)
        return run

    _execute(run, step, command, auto=False)
    _advance(run)
    return run


def reject_step(run_id: str, step_id: str, reason: Optional[str] = None) -> Run:
    run = _get(run_id)
    step = _find_step(run, step_id)
    if step is None or step.status != "pending_approval":
        raise RunError("no pending step with that id", 409)
    step.status = "rejected"
    step.decided_at = _now()
    run.pending_step_id = None
    run.status = "analyzing"
    run.log("technician", "rejected", step_id=step.id, note=reason or "")
    run.messages.append(
        agent.tool_result_message(
            step.tool_call_id,
            f"REJECTED by technician: {reason or 'no reason given'}. Propose a different approach.",
        )
    )
    _advance(run)
    return run


def abort(run_id: str) -> Run:
    run = _get(run_id)
    if run._ssh:
        run._ssh.close()
    run.status = "aborted"
    run.pending_step_id = None
    run.log("technician", "aborted")
    return run


def draft_activity(run_id: str) -> dict:
    run = _get(run_id)
    draft = activity_mod.generate(run)
    run.activity_draft = draft
    run.touch()
    return draft


def submit_activity(run_id: str, draft: dict) -> dict:
    run = _get(run_id)
    payload = activity_mod.to_payload(run, draft)
    created = erp.create_activity(payload)
    try:
        erp.set_status(run.ticket_id, "DONE")
    except Exception as exc:  # don't fail the submit if status update hiccups
        run.log("system", "error", note=f"set_status DONE failed: {exc}")
    run.activity_draft = draft
    run.log("technician", "activity_submitted", note=f"activity created for ticket {run.ticket_id}")
    if run._ssh:
        run._ssh.close()
    return {"activity": created, "submitted": payload}
