"""FastAPI entrypoint — backend-py.

Implements the shared HTTP contract (../../shared/api-contract.md). The ERP passthrough is
wired here today; the run/agent routes (POST /api/runs, approve/reject/abort, SSE, activity
draft/submit) are added next on top of the erp/ssh/safety/agent/runs modules.
Keep the Phoenix token + SSH key on the backend — never in the browser.
"""
from __future__ import annotations

import json
import queue
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from . import runs
from .case_source import set_case_source, status as case_source_status
from .config import settings
from .erp import ERPError, PhoenixClient
from .ssh import SSHRunner

app = FastAPI(title="techbold AI Service Desk Autopilot — backend-py")

# Open CORS for local dev so the React app can call this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

erp = PhoenixClient()


def _guard(fn):
    """Run an ERP call and map ERPError -> a clean HTTP error (rubric A: don't break on auth/404)."""
    try:
        return fn()
    except ERPError as exc:
        raise HTTPException(
            status_code=exc.status or 502,
            detail={"error": {"code": "erp_error", "message": str(exc)}},
        )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "backend": "python",
        "llm_provider": settings.llm_provider,
        **case_source_status(),
    }


class CaseSourceBody(BaseModel):
    source: str


@app.get("/api/case-source")
def get_case_source():
    return case_source_status()


@app.post("/api/case-source")
def update_case_source(body: CaseSourceBody):
    try:
        set_case_source(body.source)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail={"error": {"code": "case_source_error", "message": str(exc)}})
    return health()


@app.get("/api/me")
def get_me():
    return _guard(lambda: erp.me())


@app.get("/api/tickets")
def list_tickets(
    status: str | None = Query(None),
    priority: str | None = Query(None),
    sort: str = Query("date"),
):
    return _guard(lambda: erp.list_tickets(status, priority, sort))


@app.get("/api/tickets/{ticket_id}")
def get_ticket(ticket_id: int):
    return _guard(lambda: erp.get_ticket(ticket_id))


@app.get("/api/tickets/{ticket_id}/system")
def get_ticket_system(ticket_id: int):
    data = _guard(lambda: erp.get_customer_system(ticket_id))
    # Connection metadata only — the private key never leaves the backend.
    return data.get("system", data)


@app.get("/api/tickets/{ticket_id}/connection")
def get_ticket_connection(ticket_id: int):
    data = _guard(lambda: erp.get_customer_system(ticket_id))
    system = data.get("system", data)
    runner = SSHRunner(
        host=system.get("ip"),
        port=int(system.get("port") or 22),
        username=system.get("username"),
    )
    started = datetime.now(timezone.utc)
    try:
        runner.connect()
        return {
            "status": "connected",
            "reachable": True,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "latency_ms": int((datetime.now(timezone.utc) - started).total_seconds() * 1000),
        }
    except Exception:
        return {
            "status": "unreachable",
            "reachable": False,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "latency_ms": int((datetime.now(timezone.utc) - started).total_seconds() * 1000),
            "message": "SSH is not reachable or authentication failed.",
        }
    finally:
        runner.close()


@app.post("/api/reset")
def reset():
    return _guard(lambda: erp.reset())


# ---- run / agent routes (shared/api-contract.md §2) ----

class CreateRunBody(BaseModel):
    ticket_id: int


class ApproveBody(BaseModel):
    step_id: str
    edited_command: str | None = None


class RejectBody(BaseModel):
    step_id: str
    reason: str | None = None


class ActivityDraftBody(BaseModel):
    ticket_id: int | None = None
    start_datetime: str | None = None
    end_datetime: str | None = None
    summary: str | None = None
    root_cause: str | None = None
    actions_taken: str | None = None
    commands_summary: str | None = None
    validation_result: str | None = None
    description: str | None = None


def _guard_run(fn):
    try:
        return fn()
    except runs.RunError as exc:
        raise HTTPException(status_code=exc.status, detail={"error": {"code": "run_error", "message": str(exc)}})
    except ERPError as exc:
        raise HTTPException(status_code=exc.status or 502, detail={"error": {"code": "erp_error", "message": str(exc)}})
    except Exception as exc:  # noqa: BLE001 — surface SSH/LLM failures cleanly
        raise HTTPException(status_code=502, detail={"error": {"code": "internal", "message": str(exc)}})


@app.post("/api/runs")
def create_run(body: CreateRunBody):
    return _guard_run(lambda: runs.create_run(body.ticket_id).as_dict())


@app.get("/api/runs/{run_id}")
def get_run(run_id: str):
    return _guard_run(lambda: runs._get(run_id).as_dict())


@app.get("/api/runs/{run_id}/events")
def run_events(run_id: str):
    """Server-Sent Events: stream a full run snapshot on every state change (live trace)."""
    try:
        run = runs._get(run_id)
    except runs.RunError as exc:
        raise HTTPException(status_code=exc.status, detail={"error": {"code": "run_error", "message": str(exc)}})
    q = run.subscribe()

    def gen():
        try:
            yield f"data: {json.dumps(run.as_dict())}\n\n"
            while True:
                try:
                    snap = q.get(timeout=15)
                except queue.Empty:
                    yield ": ping\n\n"
                    continue
                yield f"data: {json.dumps(snap)}\n\n"
                if snap.get("status") in ("done", "aborted", "error"):
                    break
        finally:
            run.unsubscribe(q)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@app.post("/api/runs/{run_id}/approve")
def approve(run_id: str, body: ApproveBody):
    return _guard_run(lambda: runs.approve_step(run_id, body.step_id, body.edited_command).as_dict())


@app.post("/api/runs/{run_id}/reject")
def reject(run_id: str, body: RejectBody):
    return _guard_run(lambda: runs.reject_step(run_id, body.step_id, body.reason).as_dict())


@app.post("/api/runs/{run_id}/abort")
def abort(run_id: str):
    return _guard_run(lambda: runs.abort(run_id).as_dict())


@app.post("/api/runs/{run_id}/activity/draft")
def activity_draft(run_id: str):
    return _guard_run(lambda: runs.draft_activity(run_id))


@app.post("/api/runs/{run_id}/activity/submit")
def activity_submit(run_id: str, body: ActivityDraftBody):
    return _guard_run(lambda: runs.submit_activity(run_id, body.model_dump(exclude_none=True)))
