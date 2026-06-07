# Shared HTTP API contract (frontend ⇄ backend)

**Both backends (`backend-py` on :8000, `backend-node` on :8001) implement this identical
contract.** The Next.js dashboard is backend-agnostic and talks to whichever
`NEXT_PUBLIC_API_BASE` points at. The Phoenix token and the SSH key live **only** on the backend
and are never exposed to the browser.

> This is the single source of truth. If you change a shape here, change it in both backends
> and the frontend.

---

## Conventions

- JSON everywhere. Times are ISO-8601 UTC (`2026-06-07T10:00:00Z`).
- Errors: `{ "error": { "code": string, "message": string } }` with an appropriate HTTP status.
  - `401` upstream Phoenix auth problem · `404` unknown ticket/run · `502` Phoenix/SSH/LLM failure · `422` bad body.
- The backend **proxies** Phoenix (adds the bearer token) and adds the agent/run layer on top.
- **No secrets cross this boundary.** `/system` returns connection metadata (ip/port/username/os)
  but never the private key; command output is redacted before it is stored or returned.

---

## 1. ERP passthrough (wraps Phoenix)

| Method | Path | Purpose | Maps to Phoenix |
|--------|------|---------|-----------------|
| GET | `/health` | Liveness `{status, backend}` | - |
| GET | `/api/me` | Logged-in technician (`Employee`) | `GET /api/v1/me` |
| GET | `/api/tickets?status=&priority=&sort=` | Ticket list (`Ticket[]`) | `GET /api/v1/me/tickets` |
| GET | `/api/tickets/{id}` | One ticket (`Ticket`) | `GET /api/v1/tickets/{id}` |
| GET | `/api/tickets/{id}/system` | SSH target metadata (`SystemInfo`, no secrets) | `GET /api/v1/tickets/{id}/customer-system` |
| POST | `/api/reset` | Dev: clear activities + reboot VMs | `POST /api/v1/me/reset` |

- `status` ∈ `OPEN | PENDING | DONE` · `sort` ∈ `date | priority | status` (default `date`).
- `Ticket`, `Employee`, `SystemInfo` mirror `docs/phoenix-openapi.yaml` exactly.

---

## 2. Troubleshooting runs (the agent + human-in-the-loop layer)

A **run** is one troubleshooting session for one ticket. It holds an ordered list of
**steps** (proposed commands) and a full **audit** trail. The agent proposes; the technician
approves/edits/rejects **every** command; only then does it execute over SSH.

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| POST | `/api/runs` | `{ ticket_id }` | Create a run; agent produces the first proposed step. Returns `Run`. |
| GET | `/api/runs/{id}` | - | Full run state (poll fallback). Returns `Run`. |
| GET | `/api/runs/{id}/events` | - | **SSE** stream of `RunEvent` (live progress + logs). |
| POST | `/api/runs/{id}/approve` | `{ step_id, edited_command? }` | Approve (optionally edited) the pending command -> safety re-check -> execute over SSH -> agent proposes the next step. |
| POST | `/api/runs/{id}/reject` | `{ step_id, reason? }` | Reject; the reason is fed back so the agent re-plans. |
| POST | `/api/runs/{id}/abort` | - | Stop the run immediately. |
| POST | `/api/runs/{id}/activity/draft` | - | Generate the activity draft from the audit log (LLM). Returns `ActivityDraft`. Does **not** submit. |
| POST | `/api/runs/{id}/activity/submit` | `ActivityDraft` (technician-edited) | Submit to Phoenix `activities/create`, then set ticket `DONE`. Returns `{ activity, submitted }`. |

**Why draft/submit are split:** the technician reviews/edits the documentation before it lands
in the ERP (rubric D: review; rubric A: complete activity).

---

## 3. Data shapes

```jsonc
// SystemInfo - SSH target metadata, NO secrets (key stays on backend)
{ "ip": "10.0.0.5", "port": 22, "username": "azureuser", "os": "Ubuntu 22.04 LTS", "notes": "" }

// Run
{
  "id": "run_abc123",
  "ticket_id": 7001,
  "status": "analyzing | awaiting_approval | running | validating | done | aborted | error",
  "created_at": "...", "updated_at": "...",
  "ticket": { /* Ticket */ },
  "system": { /* SystemInfo */ },
  "hypotheses": [ { "cause": "...", "evidence": "...", "confidence": 0.0 } ],  // optional, ranked
  "steps": [ /* Step */ ],
  "audit": [ /* AuditEntry */ ],
  "activity_draft": { /* ActivityDraft */ }   // present once drafted
}

// Step - one proposed shell command
{
  "id": "step_1",
  "index": 0,
  "kind": "diagnose | fix | validate",
  "command": "systemctl status nginx",
  "rationale": "Check whether nginx is running before touching config.",
  "risk": "low | needs_review | blocked",          // from the safety layer
  "safety": { "classification": "low_risk", "matched_rule": null, "reason": null },
  "status": "pending_approval | approved | rejected | running | succeeded | failed | blocked | skipped",
  "edited_command": null,                            // set if the technician edited before approving
  "result": { "exit_code": 0, "stdout": "...", "stderr": "...", "duration_ms": 120, "truncated": false },
  "created_at": "...", "decided_at": "...", "ran_at": "..."
}

// AuditEntry - every command + key action (rubric C: complete audit trail). Secrets redacted.
{
  "ts": "...",
  "actor": "agent | technician | system",
  "type": "proposed | approved | edited | rejected | executed | blocked | validated | activity_submitted | aborted",
  "step_id": "step_1",
  "command": "systemctl status nginx",   // redacted
  "exit_code": 0,
  "note": "free text"
}

// ActivityDraft - the graded documentation (rubric B). Submitted to Phoenix activities/create.
{
  "ticket_id": 7001,
  "start_datetime": "...", "end_datetime": "...",
  "summary": "One-sentence summary of what was restored.",
  "root_cause": "The technical root cause - not the symptom.",
  "actions_taken": "Diagnosis and fix steps, in order.",
  "commands_summary": "Relevant commands / command classes - no secret output.",
  "validation_result": "Concrete proof the customer benefit is restored.",
  "description": "Longer free-text (Phoenix requires `description`)."
}

// RunEvent (SSE `data:` payloads)
{ "type": "status", "status": "running" }
{ "type": "step_proposed", "step": { /* Step */ } }
{ "type": "step_running", "step_id": "step_1" }
{ "type": "step_result", "step_id": "step_1", "result": { /* ... */ } }
{ "type": "log", "level": "info|warn|error", "message": "..." }
{ "type": "hypotheses", "hypotheses": [ /* ... */ ] }
{ "type": "activity_ready", "draft": { /* ActivityDraft */ } }
{ "type": "error", "message": "..." }
```

---

## 4. The loop (sequence)

```
POST /api/runs {ticket_id}
   backend loads ticket + system, starts agent  ->  step_proposed (pending_approval)
technician reviews -> POST /approve {step_id}     ->  safety re-check -> SSH exec -> step_result
   agent reads result, proposes next             ->  step_proposed ...
   (reject -> re-plan;  abort -> stop)
agent decides it's fixed + validated             ->  status: validating -> done
POST /activity/draft                             ->  ActivityDraft (technician edits)
POST /activity/submit {draft}                    ->  Phoenix activities/create + ticket DONE
```

Hard rule (rubric C, case requirement #4): **no command executes without an explicit human
approval for that specific command.** Safety-`blocked` commands never execute, even if approved.
