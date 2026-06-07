---
phase: 08-frontend
plan: "01"
subsystem: frontend
tags: [types, api, mappers, vitest, tdd]
dependency_graph:
  requires: []
  provides:
    - frontend/src/types.ts
    - frontend/src/api.ts
    - frontend/src/utils/mappers.ts
  affects:
    - All subsequent phase-08 plans (consume types + api wrappers)
tech_stack:
  added:
    - vitest@4.1.8 (test runner, devDependency)
    - "@vitest/coverage-v8@4.1.8" (devDependency)
  patterns:
    - Typed fetch wrapper with apiFetch<T> centralising error extraction
    - Pure mapper functions with exhaustive switch + default fallback
    - TDD RED/GREEN cycle for mappers
key_files:
  created:
    - frontend/src/types.ts
    - frontend/src/api.ts
    - frontend/src/utils/mappers.ts
    - frontend/src/utils/mappers.test.ts
  modified:
    - frontend/vite.config.ts (added Vitest test config block)
    - frontend/package.json (added test script + vitest devDeps)
    - frontend/tsconfig.json (added vite/client to types for import.meta.env)
decisions:
  - "Added vite/client to tsconfig.json types array to resolve import.meta.env TS2339 error — required for VITE_API_BASE access"
  - "Vitest installed as devDependency; vite.config.ts extended with test.environment=node to avoid jsdom overhead for pure-function tests"
  - "listTickets swallows network errors and returns [] per ERP-05 resilience requirement; all other wrappers propagate via apiFetch"
  - "ActivityDraft in frontend types.ts uses snake_case field names matching backend store schema; submitActivity maps them to camelCase keys per SubmitBodySchema"
metrics:
  duration: "~12 min"
  completed: "2026-06-07"
  tasks_completed: 2
  files_created: 4
  files_modified: 3
---

# Phase 08 Plan 01: Shared Types, API Wrappers, and Mappers Summary

Established the contract layer for the frontend: all shared TypeScript types in `types.ts`, typed fetch wrappers for every backend endpoint in `api.ts` (with centralised error extraction), and two pure mapper functions with full Vitest test coverage (19/19 green, TDD RED→GREEN cycle confirmed).

## What Was Built

### Task 1 — Shared TypeScript types (`types.ts`)

Defines ten exported types mirroring the backend schema exactly:

- `RiskLevel` — string union of the four backend values
- `SseEventType` — string union of all 14 `SSE_EVENT_TYPES` entries from `sse.ts`
- `SseEvent`, `Ticket`, `CustomerSystem`, `CommandApproval`, `ActivityDraft`, `Run`, `AuditEvent`, `CreateRunResult`

`CommandApproval` mirrors `CommandApprovalSchema` in `backend/src/store/schema.ts` field-for-field (including `null`-able `edited_command`, `final_command`, `technician_reason`, `decided_at`, `executed_at`).

### Task 2 — API wrappers (`api.ts`) + pure mappers with tests

**api.ts:** Exports `BASE` (reads `VITE_API_BASE` env var with `http://localhost:8000` fallback) and `getEventsUrl(runId)`. Central `apiFetch<T>` helper extracts the backend `error` field from non-2xx responses and throws `Error(message)`, so every caller surfaces the exact backend message via `err.message`. Exports 11 typed wrappers: `listTickets`, `getTicket`, `getCustomerSystem`, `createRun`, `getRun`, `advanceRun`, `abortRun`, `approveCommand`, `rejectCommand`, `draftActivity`, `submitActivity`. `approveCommand` does not catch 422 — the thrown error propagates so the caller receives "command blocked by safety policy" (T-08-03 mitigation).

**mappers.ts:** `riskBadge(level)` returns `{ label, colorClass }` for all four `RiskLevel` values (`badge--safe`, `badge--low`, `badge--medium`, `badge--high`). `sseEventLabel(type)` returns `{ icon, label }` for all 14 `SseEventType` values with `{ icon: "•", label: type }` default.

**mappers.test.ts:** 19 Vitest assertions — 4 for `riskBadge`, 15 for `sseEventLabel`. TDD RED phase confirmed all 19 failing before implementation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vitest not installed**
- **Found during:** Task 2 setup
- **Issue:** `package.json` had no Vitest dependency; `npx vitest run` would download an unverified transient version
- **Fix:** Installed `vitest@4.1.8` and `@vitest/coverage-v8@4.1.8` as devDependencies via `bun add -d`; added `"test": "vitest run"` script; configured `test.environment: "node"` in `vite.config.ts`
- **Files modified:** `frontend/package.json`, `frontend/vite.config.ts`
- **Commit:** 1cfdd61

**2. [Rule 3 - Blocking] `import.meta.env` TypeScript error (TS2339)**
- **Found during:** Task 2 tsc verification
- **Issue:** `tsconfig.json` did not include `vite/client` in its `types` array, so TypeScript did not recognise `import.meta.env`
- **Fix:** Added `"types": ["vite/client"]` to `tsconfig.json` `compilerOptions`
- **Files modified:** `frontend/tsconfig.json`
- **Commit:** 1cfdd61

## Known Stubs

None — this plan creates pure types and functions with no UI rendering or data sources.

## Threat Flags

No new network endpoints, auth paths, or schema changes introduced. `api.ts` uses `VITE_API_BASE` (non-secret, T-08-01 accepted). Error messages surfaced verbatim as text strings (T-08-02 accepted, backend redacts before sending). `approveCommand` propagates 422 without catching (T-08-03 mitigated).

## Self-Check: PASSED

- `frontend/src/types.ts` — FOUND
- `frontend/src/api.ts` — FOUND
- `frontend/src/utils/mappers.ts` — FOUND
- `frontend/src/utils/mappers.test.ts` — FOUND
- Commit `8c8923c` (Task 1) — FOUND
- Commit `1cfdd61` (Task 2) — FOUND
- `tsc --noEmit` — clean
- Vitest 19/19 — green
