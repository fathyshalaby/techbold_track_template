---
phase: 06-run-api-approvals-sse
plan: "03"
subsystem: backend/events + backend/routes
tags: [sse, events, streaming, audit, symmetry]
dependency_graph:
  requires:
    - "06-01 (runsRouter, createRun, getRunById)"
    - "06-02 (approvalsRouter — parallel, no dependency)"
    - "05-05 (runEventBus, appendAuditEvent, orchestrator emitEvent pattern)"
  provides:
    - "eventsRouter: GET /api/runs/:runId/events SSE stream"
    - "createSseStream: backfill + live subscription + keepalive + cleanup"
    - "SSE_EVENT_TYPES: 14-element PRD §9 event type list"
  affects:
    - "backend/src/app.ts (eventsRouter mounted at /api/runs)"
tech_stack:
  added: []
  patterns:
    - "Hono streamSSE with EventEmitter fan-out"
    - "Backfill-then-subscribe SSE pattern (no events missed on connect)"
    - "onAbort cleanup for listener leak prevention"
key_files:
  created:
    - "backend/src/events/sse.ts"
    - "backend/src/routes/events.ts"
    - "backend/src/tests/sse-audit-symmetry.test.ts"
  modified:
    - "backend/src/app.ts"
decisions:
  - "run.started is written via direct appendAuditEvent in agentDispatch, not via runEventBus.emit — symmetry test asserts it appears in audit log only; approval.required is the canonical bus event verified in both"
  - "SSE_EVENT_TYPES exported as const array so events.ts and tests share a single source of truth for the 14 PRD §9 event names"
  - "Listener map (Map<string, listener>) used instead of closure array so each eventType maps to exactly one registered listener, making onAbort cleanup O(1) per type"
metrics:
  duration: "15 min"
  completed: "2026-06-07"
  tasks: 3
  files: 4
---

# Phase 06 Plan 03: SSE Event Stream Summary

SSE event stream wired end-to-end: backfill of prior audit events on connect, live fan-out via runEventBus, 15s keepalive, onAbort listener cleanup, and 404 guard before stream open. Symmetry test proves approval.required appears in both getAuditEvents() and runEventBus emissions on the WAITING_FOR_APPROVAL path.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | SSE wiring helper | 24dee81 | backend/src/events/sse.ts |
| 2 | Events route + app.ts mount | b8e1ff8 | backend/src/routes/events.ts, backend/src/app.ts |
| 3 | Audit↔bus symmetry test | 3634c80 | backend/src/tests/sse-audit-symmetry.test.ts |

## Verification

- `npx tsc --noEmit` — passes clean after each task
- `npx vitest run tests/sse-audit-symmetry.test.ts` — 1/1 pass
- Full suite `npx vitest run` — 373/373 tests across 18 files pass

## Decisions Made

1. **run.started bus vs audit asymmetry:** `agentDispatch` writes `run.started` directly via `appendAuditEvent` (not via the `emitEvent` side-effect path). This means `run.started` is in the audit log but never emitted on `runEventBus`. The symmetry test documents this with an inline comment and only asserts bus emission for `approval.required`, which does use the `emitEvent` path (both bus + audit). `command.completed` is excluded because it only fires after EXECUTING_COMMAND, not on the WAITING_FOR_APPROVAL path.

2. **SSE_EVENT_TYPES as exported const:** Both `events.ts` and tests import this array — single definition prevents drift between what the route subscribes to and what tests expect.

3. **Listener map for cleanup:** Each eventType gets a stable listener reference stored in a `Map` so `onAbort` can call `runEventBus.off` with the exact same function reference, satisfying the T-06-10 listener-leak threat mitigation.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

T-06-09 (backfill payload): audit rows are already redacted at write time via `appendAuditEvent → redactSecrets`; backfill reads pre-redacted rows — no additional redaction needed. Confirmed.

T-06-10 (listener leak): `stream.onAbort` unregisters all 14 event type listeners via the listener map. Confirmed.

T-06-11 (unknown runId): `getRunById` check returns 404 before any listener is registered. Confirmed.

No new threat surface introduced beyond what the plan's threat model covers.

## Self-Check: PASSED

- `backend/src/events/sse.ts` — exists, exports `createSseStream` and `SSE_EVENT_TYPES` (14 types)
- `backend/src/routes/events.ts` — exists, exports `eventsRouter`
- `backend/src/tests/sse-audit-symmetry.test.ts` — exists, 1 test passing
- `backend/src/app.ts` — eventsRouter mounted at `/api/runs`
- Commits: 24dee81, b8e1ff8, 3634c80 — all present in git log
