# Phase 3 Summary: Vertical-Slice Coverage

## Status

Complete.

## What Changed

- Added `backend/src/tests/vertical-slice.test.ts`.
- Extended `backend/src/tests/store-jsonl.test.ts` with adapter regression cases.
- Fixed the JSONL adapter in `backend/src/store/db.ts` so mock-mode route behavior matches the SQL shapes already used by the app:
  - `get()` now supports simple non-id `WHERE <column> = ?` lookups.
  - `get()` returns the latest matching row for `ORDER BY ... DESC LIMIT 1`.
  - `UPDATE` parsing now applies numeric literal assignments such as `submitted = 1`.

## Defects Addressed

- V-002: approval, command, validation, and activity flow now has deterministic app-level coverage.
- BL-002: future regressions in the critical workflow are covered by a backend vertical-slice test.
- PLAN-01: the only production change is the JSONL adapter fix exposed by this V-002 coverage.

## Behavior Covered

The new test covers:

1. `POST /api/runs` creates a run and loads ticket/customer context.
2. `POST /api/runs/:runId/next` reaches diagnostic approval.
3. `GET /api/runs/:runId/events` streams the `approval.required` event as SSE output.
4. `POST /api/runs/:runId/approvals/:approvalId/approve` accepts an edited diagnostic command and persists the executed command result.
5. The run advances through root cause, fix proposal, fix approval, validation, and activity review.
6. `POST /api/runs/:runId/activity/draft` returns grounded activity fields.
7. `POST /api/runs/:runId/activity/submit` completes the run and records submission/status audit events.

## Verification

- `pnpm --dir backend test -- vertical-slice store-jsonl` passed, 27 test files and 559 tests.
- `pnpm --dir backend typecheck` passed.

## Notes

Vitest currently runs the full backend suite when invoked with positional filters in this project configuration. That is acceptable evidence for this phase; the vertical-slice and store-jsonl tests are included in the passing run.
