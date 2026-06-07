# Phase 6: Run API + Approvals + SSE - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose the full incident-run lifecycle over HTTP and stream run events to the browser live. This phase wires the existing deterministic orchestrator (`advance()` from Phase 5) into Hono routes — run create/get/next/abort, approve/reject with safety re-check + execution — and a per-run SSE stream fed by `runEventBus`. The orchestrator, safety layer, store, agents, and SSH executor already exist; this phase adds only the HTTP + SSE surface and request validation. No new business logic, no frontend, no activity generation (Phase 7).

Contract is fixed by PRD §9. Requirements: API-01, API-02, API-03.

</domain>

<decisions>
## Implementation Decisions

### HTTP API Contract & Validation
- Validate every request body with a Zod schema via `safeParse`, returning 400 on failure — matches the established `routes/tickets.ts` pattern.
- `POST /api/runs` accepts `{ ticketId: number, customerSystemId: string }` and bootstraps a run via `createRun` + `createInitialState`.
- `GET /api/runs/:id` returns an aggregate view: the run row (phase/status), the latest pending approval, and the ordered audit timeline — one fetch the UI can render directly.
- Unknown `:id` returns 404 `{ error: "run not found" }`, mirroring the typed-error mapping in `tickets.ts`.

### Approval / Reject / Next / Abort Semantics
- `POST /api/runs/:id/approve` with `{ approvalId, editedCommand? }`; finalCommand = editedCommand ?? proposedCommand; delegates to `advance(id, { type: 'command_approved', ... })`, which already re-validates the final command against the safety policy before any execution.
- A dangerous edited command is caught by the safety re-check inside `advance` (emits `command.blocked`); the route returns **422** `{ error, riskLevel }` and leaves the run in `WAITING_FOR_APPROVAL` so the technician can edit again.
- `POST /api/runs/:id/reject` with `{ approvalId, reason }` (reason required) → `advance(id, { type: 'command_rejected', reason })`; the agent proposes an alternative on the next `/next` call.
- `POST /api/runs/:id/next` drives auto-advance phases by calling `advance(id)` with no event (triage, planning-fix, validating, drafting) and returns the new state.
- `POST /api/runs/:id/abort` calls `advance(id, { type: 'abort' })`; only abortable phases transition (reducer enforces `ABORTABLE_PHASES`).

### SSE Stream Delivery
- Wire SSE with Hono `streamSSE`, subscribing to `runEventBus` per-run; the SSE `event:` field carries the event type (`run.started`, `approval.required`, `command.completed`, …).
- On connect, replay the run's prior audit events (backfill), then switch to live — a browser connecting mid-run sees history. Demo resilience over flaky Wi-Fi.
- Each event is JSON `{ type, ts, payload }`, mirroring audit rows.
- Send a periodic comment heartbeat (`:keepalive`) ~every 15s to hold the connection open through long idle diagnosis.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `advance(runId, event?, db?)` in `backend/src/ai/orchestrator.ts` — the single async driver; already handles approve→re-check→execute→observe, reject, abort, and auto-advance. Routes are thin wrappers.
- `createInitialState(run)` and `createRun(ticketId, customerSystemId)` — run bootstrap.
- `getRunById`, `updateRunPhase/Status` in `store/runs.ts`.
- `getAuditEvents(runId)` in `store/audit.ts` — ordered timeline for `GET` aggregate + SSE backfill.
- `runEventBus` (`events/run-event-bus.ts`) — per-run EventEmitter with `emit/on/off/removeAllListeners`, already emitting `approval.required` from the orchestrator.
- `validateCommandAgainstPolicy` — safety re-check (also already invoked inside `advance`).
- Pending-approval lookup: query `command_approvals` where `status = 'PENDING'` for the run.

### Established Patterns
- Hono routers per resource file under `routes/`, mounted in `app.ts` via `app.route('/api/...', router)`.
- Route handlers: `safeParse` query/body → typed-error mapping → `c.json(data, status)`. Phoenix typed errors map to 502/404; reuse the same shape for run errors.
- `app.onError` returns a generic 500 — never leak internal/secret-bearing error text.
- All output already redacted at the store layer (`appendAuditEvent`, `appendCommandResult` call `redactSecrets`), so SSE/GET payloads sourced from the store are safe.

### Integration Points
- Mount `runsRouter` at `/api/runs`, `eventsRouter` (SSE) at `/api/runs/:id/events` (or `/api/events`), and approval routes either on the runs router or a dedicated `approvals.ts` mounted under `/api/runs`.
- `app.ts` currently mounts only `/health` and `/api/tickets` — add the new routers there.
- `events/sse.ts` is a stub for the `streamSSE` wiring helper; `routes/events.ts` is the route stub.

</code_context>

<specifics>
## Specific Ideas

- Honor PRD §9 endpoint names and the run-phase state machine in `docs/ARCHITECTURE.md` exactly — no renaming.
- The model never executes; routes only ever call `advance()`, which gates execution behind the deterministic safety re-check. `executeApprovedCommand` must never be reachable except inside the `command_approved` path (A1 anti-pattern guard).
- Approve/reject must operate on an `approvalId` so a stale or duplicate approval can be detected (guard against approving an already-decided approval → 409 or 422).

</specifics>

<deferred>
## Deferred Ideas

- Human-driven manual-command path (HCR-01) — v2.
- Agent→human question channel (`agent.question` event + answer endpoint, HCR-05) — v2.
- Plan-approval for read-only batches (HCR-03) — v2.

</deferred>
