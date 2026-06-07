---
phase: 01-dashboard-ownership-and-data-contract
status: passed
verified_at: 2026-06-07T06:22:57Z
verifier: codex
requirements_verified:
  - DASH-01
  - DASH-02
  - DASH-03
  - DASH-04
---

# Phase 01 Verification: Dashboard Ownership and Data Contract

## Result

Status: passed

Phase 01 satisfies the four dashboard success criteria. Evidence covers the Next.js operational dashboard, backend-owned data contracts, preserved run workflow navigation, and the documented Vite fallback ownership decision. No Phase 01 evidence claims completion of PG, VEC, MEM, OBS, or INT requirements.

## Fresh Verification Commands

Run on 2026-06-07 after reviewing the current files:

- `bun run --filter techbold-track-dashboard test` - PASS, 1 test file and 8 tests.
- `bun run --filter techbold-track-backend test -- dashboard runs app approvals activity` - PASS, 6 test files and 59 tests.
- `bun run --filter @techbold/contracts test && bun run --filter @techbold/contracts typecheck` - PASS, 1 test file and 5 tests; typecheck exit 0.
- `bun run check` - PASS:
  - Biome checked 153 files with no fixes applied.
  - Contracts, backend, dashboard, and Vite fallback typechecks all exited 0.
  - Contracts, backend, dashboard, and Vite fallback tests passed: 5, 574, 8, and 2 tests respectively.
  - Dashboard and Vite fallback builds both completed successfully.

## Criterion Evidence

### 1. Next.js dashboard presents project-specific operational views

Passed.

Evidence:

- `apps/dashboard/app/dashboard/` contains real routes for overview, tickets, ticket detail, runs, run detail, approvals, audit, activity, memory, observability, and backend status.
- `apps/dashboard/app/dashboard/page.tsx` renders ticket counts, ticket queue, run summaries, pending approvals, audit evidence, activity states, memory status, observability status, and backend health from `getDashboard()`.
- `apps/dashboard/app/dashboard/dashboard.test.tsx` covers rendered source labels, sidebar routes, empty/error states, start-run navigation, and sample-content absence.
- Fresh dashboard test result: 8/8 tests passed.

Requirement coverage: DASH-01.

### 2. Dashboard data comes from backend APIs and durable state

Passed.

Evidence:

- `packages/contracts/src/dashboard.ts` defines the typed `DashboardResponse` contract for health, tickets, runs, pending approvals, audit evidence, activity states, memory, and observability.
- `apps/backend/src/routes/dashboard.ts` implements read-only `GET /api/dashboard`, composing tickets from Phoenix/mock Phoenix, run summaries from store helpers, pending approvals, audit evidence, activity states, health, and explicit deferred memory/observability statuses.
- `apps/backend/src/routes/runs.ts` extends `GET /api/runs/:runId` with direct-navigation context: `ticketId`, `customerSystemId`, safe `target`, optional `ticket`, and `source`.
- Runtime/sample-content guard evidence is command-based: Plan 03 and Plan 04 summaries record `bun run --filter techbold-track-dashboard test` passing, and the fresh dashboard test run also passed. Source grep is recorded only as supplemental hygiene.
- Current supplemental search found sample-content guard strings only in `apps/dashboard/app/dashboard/dashboard.test.tsx`, not runtime dashboard content.

Requirement coverage: DASH-02.

### 3. Dashboard navigation preserves safety, approval, SSE, audit, and activity behavior

Passed.

Evidence:

- `apps/dashboard/components/run-workflow.tsx` calls dashboard API helpers for `advanceRun`, `approveCommand`, `rejectCommand`, `abortRun`, `draftActivity`, and `submitActivity`.
- `apps/dashboard/lib/api.ts` sends all main-path workflow actions to existing Hono endpoints under `/api/runs`.
- `apps/dashboard/lib/events.ts` uses direct browser `EventSource` against `/api/runs/:runId/events` and registers canonical `SSE_EVENT_TYPES` from `@techbold/contracts`.
- `apps/backend/src/routes/approvals.ts` still accepts `editedCommand` and performs backend safety handling through the existing approval path.
- Focused backend regression command passed: 6 files and 59 tests for dashboard, runs, app, approvals, and activity.

Requirement coverage: DASH-03.

### 4. Vite frontend path has a documented ownership decision

Passed.

Evidence:

- `package.json` routes `bun run dev:frontend` to `techbold-track-dashboard` and keeps `bun run dev:vite` as the explicit Vite fallback.
- `docker-compose.yml` uses the dashboard as the default `frontend` service on port 3000 and moves Vite to `frontend-vite` behind the fallback profile.
- `docs/ARCHITECTURE.md` states that `apps/dashboard` is the primary operational UI path for v1.3 onward and that `apps/frontend` is a temporary Vite compatibility fallback.
- `docs/ARCHITECTURE.md` lists concrete Vite retirement criteria tied to mock-mode smoke verification, run workflow parity, sample-content absence, passing runtime/component assertions, and no active milestone requirement pointing to Vite.
- `docs/README.md` documents dashboard port 3000 as the primary frontend path and Vite port 5173 as fallback.

Requirement coverage: DASH-04.

## Summary Evidence Review

The plan summaries contain passing command evidence rather than source-grep-only proof:

- `01-01-SUMMARY.md`: records `bun install`, contracts tests/typecheck, backend SSE contract test, Vite type test, backend typecheck, and frontend typecheck passing.
- `01-02-SUMMARY.md`: records backend dashboard, runs, app/runs/approvals/activity tests, backend typecheck, and contracts typecheck passing.
- `01-03-SUMMARY.md`: records dashboard tests, typecheck, build, lint, and supplemental sample-content grep.
- `01-04-SUMMARY.md`: records contracts tests/typecheck, full backend tests, dashboard tests/typecheck/build, Vite tests/typecheck, `bun run check`, supplemental sample-content grep, and `docker compose build frontend` passing after a Dockerfile follow-up.

The required runtime/component proof comes from `bun run --filter techbold-track-dashboard test`; source grep is supplemental only.

## Requirement Boundary Check

Passed.

- DASH-01 through DASH-04 are marked covered in `.planning/REQUIREMENTS.md`.
- PG-01 through PG-05 remain pending.
- VEC-01 through VEC-04 remain pending.
- MEM-01 through MEM-05 remain pending.
- OBS-01 through OBS-05 remain pending.
- INT-01 through INT-04 remain pending.

Phase 01 memory and observability surfaces are deferred statuses only:

- Backend memory message: `Memory evidence is deferred to Phase 3 and Phase 4.`
- Backend observability message: `Operational signals are deferred to Phase 5.`
- `docs/LIMITATIONS.md` states Postgres, pgvector, RAG memory implementation, observability instrumentation, and full v1.3 integration are deferred to later phases.

## Residual Risks

- Browser-level manual smoke was documented but not rerun during this verification. Current command evidence covers unit/component/runtime assertions, backend regressions, typechecks, and builds.
- `docs/API.md` uses shortened source-label wording in one explanatory sentence, while the actual contract and implementation use the typed labels from `@techbold/contracts`. This is documentation wording drift, not a Phase 01 functional gap.
- The repository has unrelated dirty and untracked files outside this verification artifact. They were not modified or reverted.

