---
phase: "07"
plan: "03"
subsystem: backend/routes
tags: [routing, hono, activity]
dependency_graph:
  requires: [07-02]
  provides: [ACT-02]
  affects: [backend/src/app.ts]
tech_stack:
  added: []
  patterns: [hono-route-mount]
key_files:
  modified:
    - backend/src/app.ts
decisions: []
metrics:
  duration: "~2 min"
  completed: "2026-06-07T00:28:30Z"
---

# Phase 07 Plan 03: Mount activityRouter Summary

**One-liner:** activityRouter mounted on `/api/runs` in app.ts — POST /draft and /submit now reachable through the main Hono app.

## What Was Built

Added one import line and one `app.route` call to `backend/src/app.ts`, wiring `activityRouter` alongside `runsRouter`, `approvalsRouter`, and `eventsRouter` under `/api/runs`. No other changes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Mount activityRouter in app.ts + verify full suite | 7456e23 | backend/src/app.ts |

## Verification

Full vitest run: 20 test files, 473 tests passed, 0 failures. The single "Unhandled Rejection" reported is a pre-existing Vitest fake-timer artifact from the activity-log-generator timeout test (AgentUnavailableError escapes the microtask queue after test completion); it was present before this plan and is not caused by this change.

`grep -c 'activityRouter' backend/src/app.ts` → 2 (import + mount)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new trust boundaries introduced.

## Self-Check: PASSED

- `backend/src/app.ts` modified: FOUND
- Commit 7456e23: FOUND
- 473 tests green: CONFIRMED
