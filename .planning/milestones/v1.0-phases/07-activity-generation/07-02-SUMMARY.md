---
phase: "07"
plan: "02"
subsystem: "routes"
tags: [tdd, routes, activity, hono, phoenix]
dependency_graph:
  requires: [07-01]
  provides: [activityRouter, SubmitBodySchema]
  affects:
    - backend/src/routes/activity.ts
    - backend/src/tests/activity.test.ts
tech_stack:
  added: []
  patterns: [Hono router, phase-guard allowlist, agent call with error boundary, non-retried Phoenix POST, audit+bus symmetry, camelCase→snake_case field merge]
key_files:
  created:
    - backend/src/tests/activity.test.ts
  modified:
    - backend/src/routes/activity.ts
decisions:
  - "Test file uses standalone testApp = new Hono().route('/api/runs', activityRouter) — avoids dependency on app.ts mount order (plan 07-03)"
  - "Test 7 spies on MockPhoenixClient.prototype.createActivity directly — getPhoenixClient() returns MockPhoenixClient when resolveClientMode is 'mock', so prototype spy intercepts the instance call without module re-wiring"
  - "getDb() used directly in submit handler for UPDATE activity_drafts SET submitted — no dedicated store helper exists; direct SQL keeps the function boundary narrow"
  - "createActivity is never retried — non-idempotent POST; matching the existing client policy comment in phoenix/client.ts"
metrics:
  duration: "5 min"
  completed: "2026-06-07"
  tasks: 2
  files: 2
---

# Phase 07 Plan 02: Activity Routes (Draft + Submit) Summary

Implemented `activityRouter` with TDD: phase-guarded draft generation calling `runActivityLogGenerator` and a one-shot Phoenix submit that merges technician overrides, writes an audit event, emits to the event bus, and marks the run COMPLETED.

## What Was Built

| Symbol | File |
|--------|------|
| `activityRouter` (Hono router) | `backend/src/routes/activity.ts` |
| `SubmitBodySchema` (5 optional override fields) | `backend/src/routes/activity.ts` |
| TDD test suite (11 tests) | `backend/src/tests/activity.test.ts` |

## TDD Gate Compliance

- RED commit: `a7a999b` — `test(07-02): add failing tests for activity draft + submit routes` (11 tests, all failing — 501)
- GREEN commit: `681d777` — `feat(07-02): implement activityRouter draft + submit handlers` (11 tests, all passing)
- REFACTOR: not needed — implementation was clean on first pass

## Test Coverage

1. Draft happy path — WAITING_FOR_ACTIVITY_REVIEW → 200 with all 5 snake_case fields non-empty
2. Draft phase guard (too early) — LOADED_CONTEXT → 409 with "phase" in error
3. Draft COMPLETED allowed — re-draft returns 200
4. Draft agent unavailable — AgentUnavailableError → 502 `{ error: 'agent unavailable' }`
5. Draft unknown run — 404
6. Submit happy path — existing draft, no body overrides → 200 with Phoenix Activity record
7. Submit field overrides — `{ summary: 'technician edit' }` → createActivity called with edited summary
8. Submit no draft + no body — 409 `{ error: 'no draft to submit' }`
9. Submit Phoenix failure — PhoenixNetworkError → 502
10. Submit unknown run — 404
11. Submit audit event — after success, `getAuditEvents` includes `activity.submitted`

## Route Details

**POST `/:runId/activity/draft`**
- Phase allowlist: `WAITING_FOR_ACTIVITY_REVIEW`, `DRAFTING_ACTIVITY`, `COMPLETED`; all others → 409
- Calls `runActivityLogGenerator` with audit events, command results, observations, ticket description
- Redacts each of 5 fields with `redactSecrets` before persistence (T-07-04 defence-in-depth)
- Persists via `saveActivityDraft`; returns the stored `ActivityDraft` (snake_case fields)

**POST `/:runId/activity/submit`**
- Merges technician body overrides over stored draft fields
- Derives `start_datetime` from first audit event ts; `end_datetime` from `new Date()`
- Calls `getPhoenixClient().createActivity(...)` once — no retry (T-07-05)
- On success: `appendAuditEvent(runId, 'activity.submitted', ...)` + `runEventBus.emit(...)` (audit↔bus symmetry), marks draft submitted in DB, calls `markRunCompleted`

## Deviations from Plan

None — plan executed exactly as written. Test file already existed as untracked from the WIP scaffold commit (`0035a41`) with all 11 tests fully written; stub in `activity.ts` already returned 501. RED gate confirmed by running vitest (11/11 failing), then GREEN implemented.

## Pre-existing Issue (Out of Scope)

The `activity-log-generator.test.ts` timeout test (plan 07-01) leaks an unhandled `AgentUnavailableError` rejection after the fake-timer test completes. This was present before plan 07-02 and is not caused by these changes. All 473 tests pass; the error is a test-isolation issue in the prior plan's fake-timer teardown.

## Threat Surface Scan

- `redactSecrets` applied to all 5 draft fields before persistence (T-07-04 ✓)
- `createActivity` not retried — duplicate ERP record risk eliminated (T-07-05 ✓)
- Phase guard allowlist enforced before any agent call (T-07-06 ✓)
- `activity.submitted` audit payload contains only `activityId` — no draft text (T-07-08 ✓)
- No new trust boundaries introduced beyond those in the plan threat model

## Known Stubs

None — all routes are fully implemented and wired to real store/agent/Phoenix dependencies.

## Self-Check: PASSED

- `backend/src/routes/activity.ts` — FOUND
- `backend/src/tests/activity.test.ts` — FOUND
- `.planning/phases/07-activity-generation/07-02-SUMMARY.md` — FOUND
- RED commit `a7a999b` — FOUND
- GREEN commit `681d777` — FOUND
- All 11 activity route tests pass; 473 total tests green

## Self-Check: PASSED

- `backend/src/routes/activity.ts` — FOUND
- `backend/src/tests/activity.test.ts` — FOUND
- RED commit `a7a999b` — FOUND
- GREEN commit `681d777` — FOUND
- All exports verified: `activityRouter`, `SubmitBodySchema`
- 11/11 tests passing; 473/473 full suite passing
