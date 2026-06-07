---
phase: 01-dashboard-ownership-and-data-contract
plan: 04
subsystem: dashboard-ownership
tags: [nextjs, docker-compose, bun, dashboard, documentation, traceability]
requires:
  - 01-01
  - 01-02
  - 01-03
provides:
  - Dashboard-first root scripts with explicit Vite fallback
  - Next.js dashboard Dockerfile and primary Compose frontend service
  - Dashboard ownership, API contract, fallback, and limitations documentation
  - Phase 1 DASH traceability after verification
affects: [dashboard, frontend-ownership, docker, docs, requirements]
tech-stack:
  added: []
  patterns:
    - Root frontend scripts route to Next.js while Vite stays explicit as dev:vite
    - Docker Compose primary frontend service uses apps/dashboard on port 3000
    - Vite fallback is isolated behind a non-default Compose profile
key-files:
  created:
    - apps/dashboard/Dockerfile
  modified:
    - package.json
    - .env.example
    - docker-compose.yml
    - docs/ARCHITECTURE.md
    - docs/API.md
    - docs/README.md
    - docs/LIMITATIONS.md
    - .planning/REQUIREMENTS.md
key-decisions:
  - "Keep dev:frontend as the primary Next.js dashboard command and dev:vite as the explicit compatibility fallback."
  - "Keep the Hono backend as source of truth for Phoenix, SSH, LLM, safety, approvals, audit, SSE, activity, memory rules, and observability rules."
  - "Treat Plan 03 dashboard runtime/component tests as the required proof for source labels, main-path actions, empty/error states, sidebar routes, and sample-content absence."
patterns-established:
  - "Default Docker Compose frontend is the Next.js dashboard on port 3000; Vite is available only through the fallback profile."
  - "Phase traceability moves DASH requirements to Covered only after full verification passes."
requirements-completed: [DASH-04]
duration: 11 min
completed: 2026-06-07
---

# Phase 01 Plan 04: Dashboard Ownership and Data Contract Summary

**Dashboard-first operational path through root scripts, Docker Compose, ownership docs, API docs, and verified Phase 1 traceability**

## Performance

- **Duration:** 11 min
- **Started:** 2026-06-07T06:08:41Z
- **Completed:** 2026-06-07T06:19:49Z
- **Tasks:** 4
- **Files modified:** 9

## Accomplishments

- Updated root scripts so `bun run dev:frontend` starts `techbold-track-dashboard`, while `bun run dev:vite` keeps the temporary Vite fallback explicit.
- Added dashboard and Vite API base examples to `.env.example` without removing existing SSH key directory guidance or local/model adapter examples.
- Added `apps/dashboard/Dockerfile` and moved the default Compose `frontend` service to the Next.js dashboard on port 3000.
- Preserved the model Compose profile/service and `model-hf-cache` volume, and moved Vite to `frontend-vite` behind the `fallback` profile.
- Documented dashboard ownership, Vite retirement criteria, `GET /api/dashboard`, extended run detail fields, local commands, and Phase 1 deferred memory/observability limits.
- Marked DASH-01 through DASH-04 covered only after verification passed, leaving PG, VEC, MEM, OBS, and INT requirements pending.

## Task Commits

1. **Task 01: Update root scripts and environment for dashboard primary path** - `82f5ed0`
2. **Task 02: Move Docker Compose primary frontend service to dashboard** - `722fd94`
3. **Task 03: Document dashboard ownership, API contracts, and Vite retirement criteria** - `a3b3244`
4. **Task 02 verification follow-up: include workspace manifests in dashboard image** - `6624ba0`
5. **Task 04: Add final smoke and traceability verification** - `b08aa27`

**Plan metadata:** this summary commit.

## Files Created/Modified

- `package.json` - Routes `dev:frontend` to the dashboard, adds `dev:vite`, and includes contracts, dashboard, and Vite fallback in root build/test/typecheck scripts.
- `.env.example` - Adds `NEXT_PUBLIC_API_BASE` and `VITE_API_BASE` while preserving existing SSH and local/model adapter guidance.
- `apps/dashboard/Dockerfile` - Builds and runs the Next.js dashboard from the root Bun workspace.
- `docker-compose.yml` - Makes the dashboard the default `frontend` service on port 3000 and moves Vite to `frontend-vite` behind the `fallback` profile.
- `docs/ARCHITECTURE.md` - Documents primary dashboard ownership, Hono source-of-truth boundaries, and Vite retirement criteria.
- `docs/API.md` - Documents `GET /api/dashboard`, source labels, deferred memory/observability statuses, and extended `GET /api/runs/:runId` fields.
- `docs/README.md` - Lists primary local backend/dashboard commands and the Vite fallback command.
- `docs/LIMITATIONS.md` - Records deferred Postgres, pgvector, RAG memory, observability instrumentation, and full v1.3 integration boundaries.
- `.planning/REQUIREMENTS.md` - Marks DASH-01 through DASH-04 covered after verification.

## Decisions Made

- Kept Vite as an explicit fallback rather than deleting or hiding it because Phase 1 requires a documented retirement path.
- Used a Compose `fallback` profile for `frontend-vite` so `docker compose up` does not expose two frontend services by default.
- Recorded dashboard sample-content proof through `bun run --filter techbold-track-dashboard test`; source search is supplemental hygiene only.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Dashboard Dockerfile workspace manifest fix**
- **Found during:** Task 04 final Docker verification
- **Issue:** `docker compose build frontend` failed because Bun validates every workspace listed in root `package.json`, but the Dockerfile dependency stage copied only dashboard and contracts package manifests.
- **Fix:** Copied `apps/backend/package.json` and `apps/frontend/package.json` as workspace manifest stubs before `bun install --frozen-lockfile --filter techbold-track-dashboard`.
- **Files modified:** `apps/dashboard/Dockerfile`
- **Verification:** `docker compose build frontend` passed on retry.
- **Committed in:** `6624ba0`

**Total deviations:** 1 auto-fixed (1 blocking).
**Impact on plan:** Required for the planned dashboard Docker build. No scope expansion.

## Issues Encountered

- `docker compose build frontend` first failed on missing workspace manifests in the dashboard Dockerfile. The fix was committed and the command passed on retry.
- Supplemental source search found only the sample-content guard strings inside `apps/dashboard/app/dashboard/dashboard.test.tsx`, not runtime dashboard content.

## Verification

- `bun install` - PASS, no dependency changes.
- `bun run --filter @techbold/contracts test` - PASS, 1 file and 5 tests.
- `bun run --filter @techbold/contracts typecheck` - PASS.
- `bun run --filter techbold-track-backend test` - PASS, 28 files and 574 tests.
- `bun run --filter techbold-track-dashboard test` - PASS, 1 file and 8 tests covering rendered source labels, real sidebar routes, main-path actions, empty/error states, and absence of sample records, fake metrics, fake charts, placeholder documents, throughput, conversion, revenue, and lorem content.
- `bun run --filter techbold-track-dashboard typecheck` - PASS.
- `bun run --filter techbold-track-dashboard build` - PASS.
- `bun run --filter techbold-track-frontend test` - PASS, 1 file and 2 tests; existing Vite plugin deprecation warnings were printed.
- `bun run --filter techbold-track-frontend typecheck` - PASS.
- `bun run check` - PASS, lint, typecheck, test, and build.
- `rg -i 'acme|sample team|fake metric|fake chart|placeholder document|throughput|conversion|revenue|lorem' apps/dashboard -g '!**/.next/**'` - PASS as supplemental hygiene; matches were only in the dashboard test guard.
- `docker compose build frontend` - PASS after the Dockerfile workspace-manifest fix.

## Manual Smoke Instructions

1. Start `bun run dev:backend`.
2. Start `bun run dev:frontend`.
3. Open `http://localhost:3000/dashboard`.
4. Verify the dashboard loads mock backend data.
5. Start a ticket run from the dashboard.
6. Navigate to `/dashboard/runs/:runId`.
7. Approve or reject through backend endpoints.
8. Confirm activity draft and submission state remains backend-owned.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 1 dashboard ownership is ready for Phase 2. Later phases should extend `apps/dashboard` as the primary UI path and leave `apps/frontend` as a temporary fallback until the documented retirement criteria are met.

## Self-Check: PASSED

- Key files listed in the plan exist on disk.
- `git log --oneline --grep="(01-04)"` returns production commits for every task plus the verification follow-up.
- All task acceptance criteria and plan verification commands were run.
- No unrelated dirty backend AI/SSH/model files, frontend Dockerfile, LICENSE, model files, or untracked case/provider docs were staged.

---
*Phase: 01-dashboard-ownership-and-data-contract*
*Completed: 2026-06-07*
