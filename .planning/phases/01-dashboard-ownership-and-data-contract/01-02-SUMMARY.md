---
phase: 01-dashboard-ownership-and-data-contract
plan: 02
subsystem: backend-dashboard
tags: [typescript, hono, dashboard, contracts, store]
requires:
  - 01-01
provides:
  - Read-only backend dashboard aggregate at GET /api/dashboard
  - Extended RunDetail response with direct-navigation context
  - Store-level dashboard summary helpers for runs, approvals, audit evidence, and activity state
  - Regression coverage for dashboard mount, run detail, pending approvals, SSE, approvals, and activity behavior
affects: [backend, dashboard, runs, audit, activity]
requirements-completed: [DASH-02]
completed: 2026-06-07
---

# Phase 01 Plan 02: Backend Dashboard Data Surface Summary

Implemented the narrow backend dashboard data surface using the shared `@techbold/contracts` package from Plan 01 while preserving the existing Hono-owned run workflow.

## Accomplishments

- Added read-only store helpers for run summaries, safe target parsing, pending approval summaries, audit evidence summaries, and activity state summaries.
- Extended `GET /api/runs/:runId` with `ticketId`, `customerSystemId`, safe parsed `target`, optional safe `ticket`, and backend `source`.
- Added `GET /api/dashboard` and mounted it at `/api/dashboard`, composing Phoenix ticket summaries, store-backed run/approval/audit/activity summaries, health, and explicit deferred memory/observability statuses.
- Added focused tests for dashboard contract behavior, sanitized upstream failures, direct run navigation fields, pending approval preservation, SSE availability, and existing approval/activity invariants.

## Task Commits

1. **Task 01: Add read-only store summary helpers** - `50f450c`
2. **Task 02: Extend run detail for direct dashboard navigation** - `487ee33`
3. **Task 03: Add GET /api/dashboard aggregate route** - `15764a6`
4. **Task 04: Protect existing main-flow behavior with regression tests** - `477d439`
5. **Task 03 parser follow-up: simplify dashboard limit parsing** - `9906f19`

## Files Created/Modified

- `apps/backend/src/routes/dashboard.ts` - New read-only dashboard aggregate route.
- `apps/backend/src/app.ts` - Mounted `/api/dashboard`.
- `apps/backend/src/routes/runs.ts` - Extended run detail response while preserving existing `/next` AI-unavailable 502 behavior.
- `apps/backend/src/store/runs.ts` - Added run summary and safe target helpers.
- `apps/backend/src/store/audit.ts` - Added pending approval, audit evidence, and activity state summary helpers.
- `apps/backend/src/tests/dashboard.test.ts` - Added dashboard route coverage.
- `apps/backend/src/tests/runs.test.ts` - Added run detail, pending approval, and SSE regression coverage.
- `apps/backend/src/tests/app.test.ts` - Added dashboard mount coverage and deterministic JSONL store setup.

## Deviations from Plan

**[Rule 2 - Verification follow-up] Dashboard limit parser simplification** - Found during: post-task verification | Issue: a small unstaged parser adjustment remained in a planned route file after the task commits | Fix: committed the Zod coercion parser follow-up in `9906f19` | Files modified: `apps/backend/src/routes/dashboard.ts` | Verification: dashboard tests and backend typecheck passed.

**Total deviations:** 1 auto-fixed.
**Impact:** No scope expansion. The route still enforces default `20` and bounds `1..50`.

## Issues Encountered

- An early backend typecheck run surfaced a pre-existing dirty-worktree SSH type mismatch. Final backend typecheck passed after completing the plan work; no unrelated SSH files were staged by this plan.

## Verification

- `bun run --filter techbold-track-backend test -- dashboard` - PASS
- `bun run --filter techbold-track-backend test -- runs` - PASS
- `bun run --filter techbold-track-backend test -- app runs approvals activity` - PASS
- `bun run --filter techbold-track-backend typecheck` - PASS
- `bun run --filter @techbold/contracts typecheck` - PASS

## Self-Check: PASSED

- Dashboard route is read-only and does not call run advancement, approval, activity, SSH, model, or Phoenix mutation methods.
- Run detail preserves existing response fields and adds direct-navigation context.
- Memory and observability return explicit deferred statuses only.
- No unrelated dirty-worktree files were staged.
