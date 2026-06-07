# API Reference — Service Desk Autopilot (backend)

The HTTP + SSE contract our **own backend** exposes to the frontend. This is distinct from the upstream **Phoenix ERP** contract ([`phoenix-openapi.yaml`](phoenix-openapi.yaml)), which only the backend consumes. The product rule: the backend holds the Phoenix token and the SSH key; **the browser never talks to Phoenix, SSH, or the LLM directly.**

> **Status legend.** ✅ implemented & mounted today · 🟡 planned (route file scaffolded, lands in the noted phase). The implemented routes are documented from the **actual code** (`backend/src/routes/`); planned routes follow the locked contract in [PRD.md §9](PRD.md) and may refine on implementation.

- **Base URL:** `NEXT_PUBLIC_API_BASE` for the primary Next.js dashboard and `VITE_API_BASE` for the temporary Vite fallback. Both default to `http://localhost:8000`.
- **Content type:** `application/json` for all request/response bodies; `text/event-stream` for the SSE endpoint.
- **Auth:** none on our backend — it is a single-team local tool (see [SECURITY.md](SECURITY.md)). The only secret is the Phoenix token, held server-side.
- **CORS:** open (`*`) — appropriate for a single-machine tool with no cookies.
- **Error shape:** unhandled errors return `{ "error": "Internal Server Error" }` with HTTP 500 and **never** leak the thrown message or stack (regression-guarded in `app.test.ts`). Handled errors return `{ "error": "<short reason>" }` with an appropriate status.

---

## Implemented endpoints

### ✅ `GET /health`
Liveness probe (also used by the Docker `HEALTHCHECK`).

```jsonc
// 200
{ "status": "ok", "mode": "mock" }   // mode is "mock" if any MOCK_* flag is set, else "real"
```

### ✅ `GET /api/tickets`
List the technician's assigned tickets (proxies Phoenix `/me/tickets`).

**Query parameters** (all optional, validated):
| Param | Type | Notes |
|---|---|---|
| `status` | `OPEN \| PENDING \| DONE` | filter by Phoenix ticket status |
| `priority` | string | filter by priority |
| `sort` | `date \| priority \| status` | sort key |

**Responses**
- `200` — JSON array of tickets (title, customer, priority, status, …).
- `200 []` — if the upstream reports *not found*, the list degrades to **empty**, never an error (rubric A: "empty states don't break the workflow").
- `400` — `{ "error": "invalid query parameters" }` (e.g. an unknown `sort` value).
- `502` — upstream failure, mapped to a clean reason: `"upstream authentication failed"` (Phoenix 401), `"ERP unavailable"` (network), or `"ERP returned an unexpected response"` (schema mismatch). The raw upstream status/body is never forwarded.

### ✅ `GET /api/tickets/:id`
One ticket by numeric id.
- `200` — the ticket object.
- `400` — `{ "error": "invalid ticket id" }` (non-numeric id).
- `404` — `{ "error": "ticket not found" }`.
- `502` — upstream failure (as above).

### ✅ `GET /api/tickets/:id/customer-system`
The SSH target metadata for a ticket — the customer system the run will connect to.
- `200` — `{ ip, port, username, os, notes }` (no secrets; the private key is never returned).
- `400` — `{ "error": "invalid ticket id" }`.
- `404` — `{ "error": "customer system not found" }`.
- `502` — upstream failure.

> **Note on error semantics:** by design the backend **does not** pass through raw upstream 401/404 codes. Auth/network/schema failures from Phoenix become `502` with a sanitized reason; a missing resource becomes `404` (single ticket / customer-system) or an empty `200 []` (list). This keeps the frontend's states clean and prevents leaking upstream internals.

### ✅ `GET /api/dashboard`
Read-only dashboard aggregate for the primary Next.js dashboard.

**Query parameters** (all optional, validated):

| Param | Type | Notes |
|---|---|---|
| `limit` | integer `1..50` | Caps ticket, run, audit, approval, and activity summary lists. Defaults to `20`. |

**Response fields**

| Field | Meaning |
|---|---|
| `generatedAt` | ISO timestamp for when the aggregate was assembled. |
| `source` | Dashboard data source label, either `Live backend`, `Mock backend`, `Seed data`, or `Deferred`. |
| `health` | Backend health summary: `status`, `mode`, store mode, durability, and source. |
| `tickets.items` | Ticket summaries from Phoenix or the mock Phoenix client. |
| `tickets.counts` | Open, pending, done, and total ticket counts derived from the returned ticket set. |
| `runs.active` | Non-terminal run summaries from the backend store. |
| `runs.terminal` | Completed, failed, or aborted run summaries from the backend store. |
| `pendingApprovals` | Pending command approvals with run, ticket, command, risk, created timestamp, and source. |
| `auditEvidence` | Recent append-only audit evidence summaries with redacted payload summaries. |
| `activityStates` | Per-run activity draft/submission state summaries. |
| `memory` | Read-only memory status. Phase 1 returns a deferred status until later memory phases implement live behavior. |
| `observability` | Read-only observability status. Phase 1 returns a deferred or health-only status until Phase 5 instrumentation lands. |

Source labels come from the shared `@techbold/contracts` `SourceLabel` contract. `live` renders as `Live backend`, `mock` renders as `Mock backend`, `seed` renders as `Seed data`, and `deferred` renders as `Deferred`.

The route is read-only. It does not advance runs, create approvals, execute SSH, write audit rows, submit activity, call the LLM, or mutate Phoenix.

---

## Run lifecycle endpoints

These follow [PRD.md §9](PRD.md). These routes are implemented and covered by the backend test suite (585 tests).

### ✅ `POST /api/runs` — create a troubleshooting run
```jsonc
// request
{ "ticketId": 7001 }
// 201
{ "runId": "run_01H…", "status": "LOADED_CONTEXT",
  "ticket": { "id": 7001, "title": "…", "priority": "high", "status": "OPEN", "customer_name": "…" },
  "customerSystem": { "ip": "10.0.0.5", "port": 22, "username": "azureuser", "os": "Ubuntu 22.04 LTS" } }
```

### ✅ `GET /api/runs/:runId` — run state
Returns run status/phase, the timeline (audit events), any pending approval, the current activity draft, and direct-navigation context for the dashboard:

| Field | Meaning |
|---|---|
| `runId` | Backend run identifier. |
| `status` | Current run status. |
| `phase` | Current state-machine phase. |
| `timeline` | Append-only audit events for the run. |
| `pendingApproval` | Current pending command approval or `null`. |
| `activityDraft` | Current activity draft or `null`. |
| `ticketId` | Phoenix ticket id associated with the run. |
| `customerSystemId` | Backend target identifier, stored without secrets. |
| `ticket` | Safe ticket summary when available. |
| `target` | Safe target metadata when available: host/ip, port, username, and OS only. |
| `source` | `live`, `mock`, `seed`, or `deferred` source label. |

### ✅ `GET /api/runs/:runId/events` — **SSE** stream
`Content-Type: text/event-stream`. Each event: `{ "type": string, "runId": string, "ts": ISO8601, "payload": object }`. Event types:

`run.started` · `agent.thought_summary` · `command.proposed` · `command.blocked` · `approval.required` · `command.executing` · `command.completed` · `observation.added` · `fix.proposed` · `validation.completed` · `activity.drafted` · `activity.submitted` · `run.completed` · `run.failed` *(+ v2: `agent.question` · `manual.command.executed` · `command.undone`)*.

### ✅ `POST /api/runs/:runId/next` — advance the agent
Runs one planning turn; stops at `WAITING_FOR_APPROVAL` (with `pendingApproval`), `completes`, `fails`, or hits the max-step cap.
```jsonc
// 200 — paused on an approval
{ "status": "WAITING_FOR_APPROVAL",
  "pendingApproval": { "id": "appr_01H…", "proposedCommand": "systemctl status status-api --no-pager",
    "purpose": "…", "expectedSignal": "…", "riskLevel": "SAFE_READ_ONLY", "safetyNotes": "…", "isReadOnly": true } }
```

### ✅ `POST /api/runs/:runId/approvals/:approvalId/approve`
Approve (optionally edited) → **safety re-check** → execute over SSH.
```jsonc
// request (editedCommand optional)
{ "editedCommand": "systemctl status status-api --no-pager -l", "reason": "want full lines" }
// 200
{ "status": "EXECUTING_COMMAND", "approvalId": "appr_01H…",
  "safetyRecheck": { "riskLevel": "SAFE_READ_ONLY", "allowed": true },
  "result": { "command": "…", "exitCode": 3, "stdoutRedacted": "…", "stderrRedacted": "", "durationMs": 412, "timedOut": false } }
// 422 — a dangerous edit is blocked at approval, audited as BLOCKED
{ "error": "command blocked by safety policy", "riskLevel": "HIGH_RISK_BLOCKED", "reason": "…" }
```

### ✅ `POST /api/runs/:runId/approvals/:approvalId/reject`
```jsonc
{ "reason": "Don't touch systemd yet — check the port first." }   // → 200 { "status": "TRIAGING" }
```

### ✅ `POST /api/runs/:runId/abort` — abort the run (revert partials → `ABORTED`).
### ✅ `POST /api/runs/:runId/activity/draft` — (re)generate the 5-field activity draft from the audit trail.
### ✅ `POST /api/runs/:runId/activity/submit` — submit the activity to Phoenix; then optionally PATCH ticket → `DONE`.
```jsonc
// request — all 5 graded fields
{ "summary": "…", "root_cause": "…", "actions_taken": "…", "commands_summary": "…", "validation_result": "…" }
// 201 → the created Phoenix Activity object
```

Approval, activity, and SSE endpoints remain backend-owned and unchanged by the dashboard ownership change. The primary dashboard calls these same endpoints instead of introducing a second workflow.

### 🟡 `PATCH /api/tickets/:ticketId/status` — set Phoenix `OPEN`/`PENDING`/`DONE` *(unscored courtesy; never gates a run)*.

### v2 human-control endpoints (deferred — see [REQUIREMENTS.md](../.planning/REQUIREMENTS.md))
- `POST /api/runs/:id/manual-command` — technician runs their own command through the same safety + audit path.
- `POST /api/runs/:id/undo` — revert the last change via the captured rollback; re-run the benefit test.
- `POST /api/runs/:id/questions/:qid/answer` — answer an `agent.question`.

---

## Internal run statuses vs Phoenix statuses

The backend keeps **rich run phases** internally (state machine in [ARCHITECTURE.md §4](ARCHITECTURE.md)); the persisted `runs` table uses a coarser enum (`status`, `current_phase` — see [DATA_MODEL.md](DATA_MODEL.md)). **Phoenix only ever sees `OPEN`/`PENDING`/`DONE`**, and only at submit time. The mapping: any active phase → optional `PENDING`; `COMPLETED` (after a validated fix + submitted activity) → `DONE`; `ABORTED`/`FAILED` → left `OPEN`/`PENDING`, never `DONE` without a validated fix.

---

*Companions: [DATA_MODEL.md](DATA_MODEL.md) (what gets persisted) · [SECURITY.md](SECURITY.md) (auth/secret posture) · [PRD.md §9](PRD.md) (the locked contract) · [phoenix-openapi.yaml](phoenix-openapi.yaml) (the upstream ERP).*

## System endpoints

| Method | Path | Returns | Notes |
|--------|------|---------|-------|
| GET | `/api/me` | `Employee` | The logged-in technician (Phoenix `/api/v1/me`). |
| GET | `/api/case-source` | `{ case_source, erp_source, sandbox_case_count, sandbox_available }` | Whether tickets come from the sandbox catalog or the real ERP. |
| POST | `/api/reset` | `{ message }` | Clears this team's activities and reboots the VMs (Phoenix `/api/v1/me/reset`) — used to retest that a fix survives a reboot. |
| GET | `/api/tickets/:id/system` | `CustomerSystem` | Alias of `/customer-system` (path parity with the Python backend). |
| GET | `/api/tickets/:id/connection` | `{ reachable, latencyMs }` | SSH connectivity preflight for the ticket's VM (multi-key). |
