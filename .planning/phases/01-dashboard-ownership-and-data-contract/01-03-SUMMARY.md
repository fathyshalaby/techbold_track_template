---
phase: 01-dashboard-ownership-and-data-contract
plan: 03
subsystem: dashboard
tags: [nextjs, react, shadcn, dashboard, sse, contracts]
requires:
  - 01-01
  - 01-02
provides:
  - Next.js dashboard workspace package at apps/dashboard
  - Source-owned service desk dashboard shell
  - Typed dashboard API and EventSource clients
  - Dashboard routes for tickets, runs, approvals, audit, activity, memory, observability, and backend status
  - Run detail workflow preserving backend safety, approval, SSE, abort, and activity endpoints
  - Focused dashboard ownership tests and sample-content guards
affects: [dashboard, frontend-ownership, contracts, phase-01]
tech-stack:
  added: [next@15.5.19, react@18.3.1, react-dom@18.3.1, lucide-react, radix-dialog, radix-tooltip, tailwindcss, vitest, testing-library]
  patterns:
    - Next.js App Router server pages backed by Hono API clients
    - Client components only for actions and EventSource state
    - Source-owned shadcn-style UI primitives
key-files:
  created:
    - apps/dashboard/package.json
    - apps/dashboard/app/dashboard/page.tsx
    - apps/dashboard/app/dashboard/tickets/page.tsx
    - apps/dashboard/app/dashboard/tickets/[ticketId]/page.tsx
    - apps/dashboard/app/dashboard/runs/page.tsx
    - apps/dashboard/app/dashboard/runs/[runId]/page.tsx
    - apps/dashboard/app/dashboard/approvals/page.tsx
    - apps/dashboard/app/dashboard/audit/page.tsx
    - apps/dashboard/app/dashboard/activity/page.tsx
    - apps/dashboard/app/dashboard/memory/page.tsx
    - apps/dashboard/app/dashboard/observability/page.tsx
    - apps/dashboard/app/dashboard/backend-status/page.tsx
    - apps/dashboard/components/run-workflow.tsx
    - apps/dashboard/components/ticket-table.tsx
    - apps/dashboard/lib/api.ts
    - apps/dashboard/lib/events.ts
    - apps/dashboard/lib/source-labels.ts
    - apps/dashboard/app/dashboard/dashboard.test.tsx
  modified:
    - package.json
    - bun.lock
key-decisions:
  - "Keep Next.js at 15.5.19 and React/React DOM at 18.3.1 as required."
  - "Use direct Hono API and EventSource calls from the dashboard; Next.js does not own SSH, Phoenix, model, safety, audit, or memory behavior."
  - "Display memory and observability as explicit backend-provided deferred statuses until later phases implement live behavior."
  - "Configure Next to transpile @techbold/contracts and resolve its source .js specifiers to TypeScript files for the monorepo build."
requirements-completed: [DASH-01, DASH-03]
duration: 36 min
completed: 2026-06-07
---

# Phase 01 Plan 03: Next.js Dashboard Package Summary

Created the source-owned Next.js dashboard package and bound the primary operational dashboard path to the existing backend dashboard aggregate and run workflow endpoints.

## Performance

- **Duration:** 36 min
- **Started:** 2026-06-07T05:31:59Z
- **Completed:** 2026-06-07T06:06:40Z
- **Tasks:** 5
- **Files modified:** 45

## Accomplishments

- Added `apps/dashboard` as `techbold-track-dashboard` with Next.js 15.5.19, React 18.3.1, shadcn-style source-owned components, Tailwind tokens, and a dashboard dev script.
- Added typed dashboard API helpers using `NEXT_PUBLIC_API_BASE`, defaulting only in `apps/dashboard/lib/api.ts`, plus direct browser EventSource subscription over `/api/runs/:runId/events`.
- Implemented App Router pages for overview, ticket queue/detail, run queue/detail, approvals, audit, activity, memory, observability, and backend status.
- Preserved the run workflow through backend-owned `/next`, approve, reject, abort, activity draft, activity submit, and SSE endpoints.
- Added tests for source labels, empty/error states, start-run navigation, edited-command approval wiring, sidebar route coverage, source-label propagation, and sample-content guards.

## Task Commits

1. **Task 01: Create the Next.js dashboard package and shadcn foundation** - `f337d1b`
2. **Task 02: Build the typed dashboard API and EventSource clients** - `fc0c593`
3. **Task 03: Implement dashboard routes and source-owned operational surfaces** - `75760fe`
4. **Task 04: Implement run detail workflow without bypassing backend safety** - `9a4374f`
5. **Task 05: Add focused dashboard tests** - `2890dd9`

**Plan metadata:** this summary commit.

## Files Created/Modified

- `package.json` - Added `apps/dashboard` workspace and `dev:dashboard` script.
- `bun.lock` - Recorded Next/dashboard workspace dependencies.
- `apps/dashboard/package.json` - Declared dashboard scripts, dependencies, and source-scoped lint script.
- `apps/dashboard/next.config.ts` - Added contract package transpilation and TypeScript source extension resolution.
- `apps/dashboard/app/*` - Added App Router layout, redirect, dashboard route pages, and global CSS tokens.
- `apps/dashboard/components/*` - Added dashboard shell, sidebar, status panels, ticket actions, run workflow, and source-owned UI primitives.
- `apps/dashboard/lib/*` - Added typed API, SSE, source-label, and class-name utilities.
- `apps/dashboard/app/dashboard/dashboard.test.tsx` - Added focused dashboard ownership and guard tests.
- `apps/dashboard/vitest.config.ts` - Added jsdom test config with OXC JSX transform for Next-compatible `jsx: preserve`.

## Decisions Made

- Kept `apps/frontend/src/App.tsx` and the frontend Dockerfile untouched because they were dirty from unrelated work and the plan did not require modifying them.
- Did not add a Next.js Docker service or change Compose ownership in this plan because the requested scope was the dashboard package and backend endpoint binding.
- Used a narrow Next webpack `extensionAlias` for `@techbold/contracts` because the shared package uses NodeNext-style `.js` source specifiers while Next builds TypeScript source directly from the workspace.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact:** No scope changes.

## Issues Encountered

- Next build required `@types/node`; it was added to the dashboard dev dependencies so Next would not try to invoke `pnpm` during build.
- Next requires `tsconfig.json` `jsx: preserve`; Vitest needed an explicit OXC JSX transform in `vitest.config.ts` so tests and build can both pass.

## Verification

- `bun install` - PASS
- `bun run --filter techbold-track-dashboard test` - PASS, 8 tests
- `bun run --filter techbold-track-dashboard typecheck` - PASS
- `bun run --filter techbold-track-dashboard build` - PASS
- `bun run --filter techbold-track-dashboard lint` - PASS
- `rg 'http://localhost:8000' apps/dashboard -g '!**/.next/**'` - PASS, only `apps/dashboard/lib/api.ts`
- `rg -i 'acme|sample team|fake metric|fake chart|placeholder document|throughput|conversion|revenue|lorem' apps/dashboard -g '!**/.next/**'` - PASS, only test guard strings

## Self-Check: PASSED

- `/dashboard` renders tickets, runs, approvals, audit evidence, activity state, memory status, observability status, and backend health from `GET /api/dashboard`.
- Every sidebar route has a corresponding page file and rendered test coverage.
- Run detail uses backend API helpers and direct Hono SSE only; no dashboard code imports backend internals or calls SSH, Phoenix, model, safety, store, or audit modules.
- Approval controls send `editedCommand` through the backend API helper and keep backend errors visible.
- Memory and observability use the required deferred messages unless the backend contract provides a real status.
- No unrelated dirty-worktree files were staged or reverted.

## User Setup Required

None.

## Next Phase Readiness

Plan 04 can document the dashboard ownership decision and retirement criteria for the Vite fallback. Later phases can extend `apps/dashboard` as the primary operational UI path.
