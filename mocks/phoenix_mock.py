"""Offline mock of the Phoenix ERP — run the whole app without Builder Base credentials.

Endpoints mirror docs/phoenix-openapi.yaml. Bearer auth accepts any non-empty token.

Run (uses the backend-py venv which already has fastapi/uvicorn):
    backend-py/.venv/bin/uvicorn mocks.phoenix_mock:app --port 9000

Then point your backend at it:
    PHOENIX_API_BASE_URL=http://localhost:9000   (Docker: http://host.docker.internal:9000)
    PHOENIX_API_TOKEN=anything

Note: the sample systems use a non-routable TEST-NET IP, so the ERP workflow + UI are fully
testable offline, but the SSH/agent part still needs a real reachable VM.
"""
from __future__ import annotations

import copy
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Query
from pydantic import BaseModel

app = FastAPI(title="Phoenix ERP Mock")


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


_NOW = datetime(2026, 6, 6, 12, 0, 0, tzinfo=timezone.utc)
_REPO_ROOT = Path(__file__).resolve().parents[1]
_DATASET = os.getenv("PHOENIX_MOCK_DATASET", "legacy").strip().lower()
_SANDBOX_SSH_HOST = os.getenv("SANDBOX_SSH_HOST", "127.0.0.1").strip() or "127.0.0.1"


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    return max(0, value)


_SANDBOX_CASE_COUNT = _env_int("SANDBOX_CASE_COUNT", 0)

_TICKETS: dict[int, dict] = {
    7001: {
        "id": 7001,
        "title": "Website returns 502 Bad Gateway",
        "description": "Since this morning our shop shows '502 Bad Gateway'. Customers can't check out.",
        "priority": "high",
        "status": "OPEN",
        "customer_id": 5001,
        "customer_name": "Nordlicht Logistik GmbH",
        "tags": ["web", "nginx"],
        "sla_due_at": _iso(_NOW + timedelta(hours=2)),
        "created_at": _iso(_NOW - timedelta(hours=1)),
    },
    7002: {
        "id": 7002,
        "title": "Backup service not running after reboot",
        "description": "Our nightly backup didn't run. The service seems to be stopped.",
        "priority": "medium",
        "status": "OPEN",
        "customer_id": 5002,
        "customer_name": "Alpenblick Hotels AG",
        "tags": ["systemd", "backup"],
        "sla_due_at": _iso(_NOW + timedelta(hours=8)),
        "created_at": _iso(_NOW - timedelta(hours=4)),
    },
    7003: {
        "id": 7003,
        "title": "Disk almost full on application server",
        "description": "Staff report the internal tool is very slow and sometimes errors when saving.",
        "priority": "low",
        "status": "PENDING",
        "customer_id": 5003,
        "customer_name": "Donau Werkzeug e.U.",
        "tags": ["disk", "performance"],
        "sla_due_at": _iso(_NOW + timedelta(hours=24)),
        "created_at": _iso(_NOW - timedelta(hours=20)),
    },
}

_SYSTEMS: dict[int, dict] = {
    7001: {"ip": "203.0.113.10", "port": 22, "username": "azureuser", "os": "Ubuntu 22.04 LTS", "notes": "Single web node, nginx + gunicorn."},
    7002: {"ip": "203.0.113.11", "port": 22, "username": "azureuser", "os": "Ubuntu 22.04 LTS", "notes": "Backup via systemd timer 'backup.service'."},
    7003: {"ip": "203.0.113.12", "port": 22, "username": "azureuser", "os": "Ubuntu 20.04 LTS", "notes": "App writes large logs under /var/log/app."},
}
_INITIAL_LEGACY_TICKETS = copy.deepcopy(_TICKETS)


def _load_sandbox_dataset() -> tuple[dict[int, dict], dict[int, dict]]:
    scenarios_path = _REPO_ROOT / "sandbox" / "scenarios" / "scenarios.json"
    scenarios = json.loads(scenarios_path.read_text(encoding="utf-8"))
    tickets: dict[int, dict] = {}
    systems: dict[int, dict] = {}
    for scenario in scenarios[:_SANDBOX_CASE_COUNT]:
        ticket = copy.deepcopy(scenario["ticket"])
        system = copy.deepcopy(scenario["system"])
        system["ip"] = _SANDBOX_SSH_HOST
        tickets[int(ticket["id"])] = ticket
        systems[int(ticket["id"])] = system
    return tickets, systems


_SANDBOX_TICKETS, _SANDBOX_SYSTEMS = _load_sandbox_dataset()
_INITIAL_SANDBOX_TICKETS = copy.deepcopy(_SANDBOX_TICKETS)

_EMPLOYEE = {"id": 1001, "firstname": "Max", "lastname": "Mustermann", "username": "m.mustermann", "teamname": "Remote Support"}

_ACTIVITIES: list[dict] = []
_PRIORITY_RANK = {"high": 0, "medium": 1, "low": 2}


def _auth(authorization: str | None) -> None:
    if not authorization or not authorization.startswith("Bearer ") or len(authorization) < 8:
        raise HTTPException(status_code=401, detail="Missing or invalid bearer token")


def _use_sandbox() -> bool:
    return _DATASET == "sandbox"


def _tickets() -> dict[int, dict]:
    return _SANDBOX_TICKETS if _use_sandbox() else _TICKETS


def _systems() -> dict[int, dict]:
    return _SANDBOX_SYSTEMS if _use_sandbox() else _SYSTEMS


def _reset_ticket_statuses() -> None:
    active = _tickets()
    initial = _INITIAL_SANDBOX_TICKETS if _use_sandbox() else _INITIAL_LEGACY_TICKETS
    for ticket_id, original in initial.items():
        active[ticket_id]["status"] = original["status"]


@app.get("/api/v1/me")
def get_me(authorization: str | None = Header(None)):
    _auth(authorization)
    return _EMPLOYEE


@app.get("/api/v1/me/tickets")
def list_tickets(
    status: str | None = Query(None),
    priority: str | None = Query(None),
    sort: str = Query("date"),
    authorization: str | None = Header(None),
):
    _auth(authorization)
    items = list(_tickets().values())
    if status:
        items = [t for t in items if t["status"] == status]
    if priority:
        items = [t for t in items if t["priority"] == priority]
    if sort == "priority":
        items.sort(key=lambda t: _PRIORITY_RANK.get(t["priority"], 9))
    elif sort == "status":
        items.sort(key=lambda t: t["status"])
    else:  # date (newest first)
        items.sort(key=lambda t: t.get("created_at") or "", reverse=True)
    return copy.deepcopy(items)


@app.get("/api/v1/tickets/{ticket_id}")
def get_ticket(ticket_id: int, authorization: str | None = Header(None)):
    _auth(authorization)
    active = _tickets()
    if ticket_id not in active:
        raise HTTPException(status_code=404, detail="ticket not found")
    return copy.deepcopy(active[ticket_id])


@app.get("/api/v1/tickets/{ticket_id}/customer-system")
def get_customer_system(ticket_id: int, authorization: str | None = Header(None)):
    _auth(authorization)
    active_tickets = _tickets()
    active_systems = _systems()
    if ticket_id not in active_systems:
        raise HTTPException(status_code=404, detail="ticket not found")
    t = active_tickets[ticket_id]
    return {"ticket_id": ticket_id, "customer_id": t["customer_id"], "system": copy.deepcopy(active_systems[ticket_id])}


class StatusUpdate(BaseModel):
    status: str


@app.patch("/api/v1/tickets/{ticket_id}/status")
def set_status(ticket_id: int, body: StatusUpdate, authorization: str | None = Header(None)):
    _auth(authorization)
    active = _tickets()
    if ticket_id not in active:
        raise HTTPException(status_code=404, detail="ticket not found")
    if body.status not in ("OPEN", "PENDING", "DONE"):
        raise HTTPException(status_code=422, detail="invalid status")
    active[ticket_id]["status"] = body.status
    return copy.deepcopy(active[ticket_id])


class ActivityCreate(BaseModel):
    ticket_id: int
    start_datetime: str
    end_datetime: str
    description: str | None = None
    summary: str | None = None
    root_cause: str | None = None
    actions_taken: str | None = None
    commands_summary: str | None = None
    validation_result: str | None = None


@app.post("/api/v1/activities/create", status_code=201)
def create_activity(body: ActivityCreate, authorization: str | None = Header(None)):
    _auth(authorization)
    if body.ticket_id not in _tickets():
        raise HTTPException(status_code=404, detail="ticket not found")
    activity = {
        "id": 9000 + len(_ACTIVITIES) + 1,
        "team_id": 1,
        "team_name": _EMPLOYEE["teamname"],
        "employee_id": _EMPLOYEE["id"],
        "created_at": _iso(_NOW),
        **body.model_dump(),
    }
    _ACTIVITIES.append(activity)
    return activity


@app.post("/api/v1/me/reset")
def reset(authorization: str | None = Header(None)):
    _auth(authorization)
    _ACTIVITIES.clear()
    _reset_ticket_statuses()
    return {
        "message": "reset complete",
        "detail": {
            "activities_cleared": True,
            "dataset": "sandbox" if _use_sandbox() else "legacy",
            "vms_rebooted": False if _use_sandbox() else True,
        },
    }
