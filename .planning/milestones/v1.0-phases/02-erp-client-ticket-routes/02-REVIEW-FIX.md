---
status: all_fixed
phase: 02-erp-client-ticket-routes
source: 02-REVIEW.md
fix_scope: critical_warning
findings_in_scope: 7
fixed: 7
skipped: 0
iteration: 1
updated: 2026-06-06
---

# Phase 02 Code Review Fix Report

The fixer agent applied 4 findings (CR-01, CR-02, WR-01, WR-02) in an isolated
worktree but crashed before merging back or writing this report. The orchestrator
recovered the worktree commits via fast-forward merge, then applied the remaining
3 warnings (WR-03, WR-04, WR-05) directly. All 7 Critical+Warning findings resolved.
`tsc --noEmit` clean; 105 tests pass.

## Fixed

### CR-01 — PhoenixValidationErrorSchema.loc rejects integer indices
`loc` widened from `z.array(z.string())` to `z.array(z.union([z.string(), z.number()]))`.
FastAPI emits integer path indices for list-field errors (e.g. `["body", 0, "field"]`),
which previously threw a parse error and made the 422 branch unreachable.
Commit `545f47c`. Test added in `phoenix-types.test.ts`.

### CR-02 — PhoenixValidationError uncaught in ticket routes
Added `PhoenixValidationError → 502` (opaque message) to all three route catch blocks.
Previously propagated to `app.onError`, leaking the full Zod error string as a 500.
Commit `ae2ae9c`. Test added in `tickets.test.ts`.

### WR-01 — setStatus mutated shared MOCK_TICKETS fixture
`setStatus` now replaces the array slot with a clone (`{ ...slot, status }`) and returns
a copy instead of mutating in place. Commit `1aaba0e`. Mutation-assertion test relaxed.

### WR-02 — invalid query params silently returned all tickets
`GET /api/tickets` now returns 400 on an invalid `status`/`sort` param instead of
falling back to no filter. Commit `3226e4a`. Test added.

### WR-03 — mock sort=date sorted by id
`listTickets` `sort=date` now sorts by `created_at` (falling back to `id` when absent),
matching real API semantics rather than relying on fixture ordering.
Commit `a230215`.

### WR-04 — SystemInfoSchema not .strict()
Added `.strict()` to `SystemInfoSchema`, closing the T-02-01 trust-boundary gap where
unknown fields in the `system` sub-object passed validation silently. Commit `a230215`.

### WR-05 — app.onError leaked err.message
Global error handler now returns an opaque `{ error: 'internal server error' }` instead
of echoing `err.message` (which leaked Zod parse errors and TypeErrors). Commit `a230215`.

## Skipped

None.

## Info (out of scope)

CR-Info findings (2) were not in the critical_warning fix scope and remain documented
in 02-REVIEW.md for future reference.
