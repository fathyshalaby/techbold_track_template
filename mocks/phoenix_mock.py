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
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Header, HTTPException, Query
from pydantic import BaseModel

app = FastAPI(title="Phoenix ERP Mock")


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


_NOW = datetime(2026, 6, 6, 12, 0, 0, tzinfo=timezone.utc)

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

_EMPLOYEE = {"id": 1001, "firstname": "Max", "lastname": "Mustermann", "username": "m.mustermann", "teamname": "Remote Support"}

_ACTIVITIES: list[dict] = []
_PRIORITY_RANK = {"high": 0, "medium": 1, "low": 2}


def _auth(authorization: str | None) -> None:
    if not authorization or not authorization.startswith("Bearer ") or len(authorization) < 8:
        raise HTTPException(status_code=401, detail="Missing or invalid bearer token")


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
    items = list(_TICKETS.values())
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
    if ticket_id not in _TICKETS:
        raise HTTPException(status_code=404, detail="ticket not found")
    return copy.deepcopy(_TICKETS[ticket_id])


@app.get("/api/v1/tickets/{ticket_id}/customer-system")
def get_customer_system(ticket_id: int, authorization: str | None = Header(None)):
    _auth(authorization)
    if ticket_id not in _SYSTEMS:
        raise HTTPException(status_code=404, detail="ticket not found")
    t = _TICKETS[ticket_id]
    return {"ticket_id": ticket_id, "customer_id": t["customer_id"], "system": copy.deepcopy(_SYSTEMS[ticket_id])}


class StatusUpdate(BaseModel):
    status: str


@app.patch("/api/v1/tickets/{ticket_id}/status")
def set_status(ticket_id: int, body: StatusUpdate, authorization: str | None = Header(None)):
    _auth(authorization)
    if ticket_id not in _TICKETS:
        raise HTTPException(status_code=404, detail="ticket not found")
    if body.status not in ("OPEN", "PENDING", "DONE"):
        raise HTTPException(status_code=422, detail="invalid status")
    _TICKETS[ticket_id]["status"] = body.status
    return copy.deepcopy(_TICKETS[ticket_id])


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
    if body.ticket_id not in _TICKETS:
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
    for t in _TICKETS.values():
        t["status"] = "PENDING" if t["id"] == 7003 else "OPEN"
    return {"message": "reset complete", "detail": {"activities_cleared": True, "vms_rebooted": True}}
