---
phase: 01-dashboard-ownership-and-data-contract
plan: 01
subsystem: contracts
tags: [typescript, bun, sse, dashboard, vite, hono]
requires: []
provides:
  - Importable @techbold/contracts Bun workspace package
  - Canonical shared SSE event tuple with agent.unavailable preserved
  - Shared dashboard, ticket, run, approval, audit, activity, health, memory, and observability response contracts
  - Backend and Vite fallback imports from shared SSE contracts
affects: [dashboard, backend, frontend, sse, phase-01]
tech-stack:
  added: [@techbold/contracts]
  patterns:
    - Shared TypeScript contract package consumed by app workspaces
    - Public app modules re-export canonical SSE contracts
key-files:
  created:
    - packages/contracts/package.json
    - packages/contracts/tsconfig.json
    - packages/contracts/src/events.ts
    - packages/contracts/src/tickets.ts
    - packages/contracts/src/runs.ts
    - packages/contracts/src/dashboard.ts
    - packages/contracts/src/index.ts
    - packages/contracts/src/contracts.test.ts
  modified:
    - package.json
    - bun.lock
    - apps/backend/package.json
    - apps/backend/src/events/sse.ts
    - apps/backend/src/tests/sse-audit-symmetry.test.ts
    - apps/frontend/package.json
    - apps/frontend/src/types.ts
    - apps/frontend/src/types.test.ts
key-decisions:
  - "Use @techbold/contracts as the single source for the canonical SSE tuple and shared dashboard response types."
  - "Keep Vite fallback compatibility through public re-exports from apps/frontend/src/types.ts."
  - "Represent memory and observability as typed deferred-capable status contracts until later roadmap phases implement live behavior."
patterns-established:
  - "Shared response contracts live in packages/contracts/src and are imported by backend and frontend workspaces."
  - "SSE tuple equality is verified through public backend and frontend modules against @techbold/contracts."
requirements-completed: [DASH-02]
duration: 6 min
completed: 2026-06-07
---

# Phase 01 Plan 01: Dashboard Ownership and Data Contract Summary

**Shared TypeScript contracts package for dashboard data, run context, deferred status surfaces, and canonical SSE events**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-07T05:31:59Z
- **Completed:** 2026-06-07T05:37:38Z
- **Tasks:** 4
- **Files modified:** 16

## Accomplishments

- Created `@techbold/contracts` as an importable Bun workspace package with strict NodeNext TypeScript settings.
- Defined the canonical 15-entry `SSE_EVENT_TYPES` tuple, preserving `agent.unavailable`, plus shared dashboard, ticket, run, approval, audit, activity, source label, memory, observability, and health contracts.
- Updated backend SSE and Vite fallback type exports to consume the shared contract package, with focused tests proving both public modules match the shared tuple.
- Added contract package Vitest coverage for SSE order, source labels, deferred statuses, direct-navigation run fields, and unsupported dashboard metric fields.

## Task Commits

1. **Tasks 01-02: Create contracts workspace package and define contracts** - `aeea227`
2. **Task 03: Consume shared event contract in backend and Vite fallback** - `b98f73e`
3. **Task 04: Add contract package verification** - `ed44603`

**Plan metadata:** this summary commit.

## Files Created/Modified

- `package.json` - Added `packages/contracts` to root workspaces.
- `bun.lock` - Recorded the workspace package and app workspace dependencies.
- `packages/contracts/package.json` - Declared `@techbold/contracts` with typecheck and test scripts.
- `packages/contracts/tsconfig.json` - Added strict NodeNext no-emit TypeScript config.
- `packages/contracts/src/events.ts` - Added canonical SSE tuple and event payload type.
- `packages/contracts/src/tickets.ts` - Added ticket, target, customer system, and typed source label contracts.
- `packages/contracts/src/runs.ts` - Added run detail, approval, audit, activity, and dashboard run summary contracts.
- `packages/contracts/src/dashboard.ts` - Added dashboard aggregate, health, memory, and observability contracts.
- `packages/contracts/src/index.ts` - Added contract barrel exports.
- `packages/contracts/src/contracts.test.ts` - Added contract verification fixtures and assertions.
- `apps/backend/package.json` - Added `@techbold/contracts` dependency.
- `apps/backend/src/events/sse.ts` - Re-exported shared SSE tuple and type while preserving stream behavior.
- `apps/backend/src/tests/sse-audit-symmetry.test.ts` - Added backend public tuple equality assertion.
- `apps/frontend/package.json` - Added `@techbold/contracts` dependency.
- `apps/frontend/src/types.ts` - Re-exported shared SSE and core response type aliases for the Vite fallback.
- `apps/frontend/src/types.test.ts` - Added Vite fallback public tuple equality assertion.

## Decisions Made

- Use TypeScript interfaces only for this plan because runtime parsing was not requested and the plan only required typed response contracts.
- Keep `apps/frontend/src/types.ts` as the compatibility boundary for the Vite fallback instead of changing `App.tsx`.
- Do not update roadmap or state in this execution because the user explicitly reserved phase-level routing for the orchestrator.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope changes.

## Issues Encountered

None.

## Verification

- `bun install` - PASS
- `bun run --filter @techbold/contracts test` - PASS
- `bun run --filter @techbold/contracts typecheck` - PASS
- `bun run --filter techbold-track-backend test -- sse-audit-symmetry` - PASS
- `bun run --filter techbold-track-frontend test -- types` - PASS
- `bun run --filter techbold-track-backend typecheck` - PASS
- `bun run --filter techbold-track-frontend typecheck` - PASS

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 02 can use `@techbold/contracts` for the dashboard endpoint and run-detail response contracts. The backend and Vite fallback now share the same public SSE event source.

---
*Phase: 01-dashboard-ownership-and-data-contract*
*Completed: 2026-06-07*
