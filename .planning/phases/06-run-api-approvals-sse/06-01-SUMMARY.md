---
phase: 06-run-api-approvals-sse
plan: "01"
subsystem: backend/routes
tags: [routes, hono, tdd, run-lifecycle, phoenix-client]
dependency_graph:
  requires:
    - backend/src/ai/orchestrator.ts
    - backend/src/store/runs.ts
    - backend/src/store/audit.ts
    - backend/src/store/db.ts
    - backend/src/phoenix/client.ts
    - backend/src/phoenix/mock.ts
    - backend/src/env.ts
  provides:
    - runsRouter (POST /, GET /:runId, POST /:runId/next, POST /:runId/abort)
  affects:
    - backend/src/app.ts
tech_stack:
  added: []
  patterns:
    - Hono router with Zod safeParse for request validation
    - Direct updateRunPhase() to LOADED_CONTEXT without calling advance() (PRD §9 compliance)
    - getPendingApproval via db.all() + filter to support both SQLite and JSONL adapters
    - vi.clearAllMocks() in afterEach to preserve vi.mock() factory stubs across tests
key_files:
  created:
    - backend/src/tests/runs.test.ts
  modified:
    - backend/src/routes/runs.ts
    - backend/src/app.ts
decisions:
  - "POST / calls updateRunPhase(id, LOADED_CONTEXT) directly instead of advance() — advance() auto-recurses CREATED→LOADED_CONTEXT→TRIAGING→LLM agent, violating the 201-response contract"
  - "getPendingApproval uses db.all() filtered in code, not a compound WHERE run_id=? AND status=? query — the JSONL adapter get() only handles single-column WHERE clauses"
  - "vi.clearAllMocks() replaces vi.restoreAllMocks() in afterEach — restoreAllMocks resets vi.fn() instances inside vi.mock() factories back to original implementations, breaking mocks for subsequent tests"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-07"
  tasks: 2
  files: 3
---

# Phase 06 Plan 01: Run Lifecycle Routes Summary

TDD implementation of the four core run lifecycle routes — create, get, advance, abort — as thin Hono wrappers over the existing orchestrator. 13 contract tests, all green. No regressions in the full 357-test suite.

## What Was Built

`runsRouter` in `backend/src/routes/runs.ts` exposes:

- `POST /api/runs` — validates `{ ticketId }` with Zod, fetches ticket + customer system from Phoenix (mock in tests), creates a run, transitions it to `LOADED_CONTEXT` synchronously, returns 201 with the full response shape from PRD §9
- `GET /api/runs/:runId` — returns run phase/status, ordered audit timeline, pending approval (null or CommandApproval), and activity draft
- `POST /api/runs/:runId/next` — calls `advance(runId)` and returns new state + pending approval
- `POST /api/runs/:runId/abort` — calls `advance(runId, { type: 'abort' })` and returns final state

`runsRouter` is mounted at `/api/runs` in `app.ts`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vi.restoreAllMocks() broke vi.mock() factory stubs across tests**
- **Found during:** GREEN phase — 6 of 13 tests failing after first test's afterEach
- **Issue:** `vi.restoreAllMocks()` restores `vi.fn()` instances created inside `vi.mock()` factories back to their original implementations. After the first test completed, `resolveClientMode` reverted to the real function which called `getEnv()`, which crashed because real env vars weren't set.
- **Fix:** Changed `vi.restoreAllMocks()` to `vi.clearAllMocks()` in `afterEach` — clears call history and return values but does not restore the mock factory's implementations. Matches the pattern used in `tickets.test.ts`.
- **Files modified:** `backend/src/tests/runs.test.ts`
- **Commit:** 817d1c8

## TDD Gate Compliance

- RED gate commit: `553bd7c` — `test(06-01): add failing contract tests for run lifecycle routes` (12/13 failing)
- GREEN gate commit: `817d1c8` — `feat(06-01): implement run lifecycle routes with contract tests` (13/13 passing)
- REFACTOR: no structural cleanup needed; `getPendingApproval` helper already extracted

## Self-Check: PASSED

- `backend/src/routes/runs.ts` — exists, exports `runsRouter`
- `backend/src/tests/runs.test.ts` — exists, 13 tests passing
- `backend/src/app.ts` — mounts `runsRouter` at `/api/runs`
- Commit `553bd7c` — RED gate present
- Commit `817d1c8` — GREEN gate present
