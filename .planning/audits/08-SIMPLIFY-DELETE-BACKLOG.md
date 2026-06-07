# 08-SIMPLIFY-DELETE-BACKLOG

Report-only. This audit identifies skeleton debt that reduces team velocity and should be cleaned for v1.1 without adding features.

## Scope

- Source files and folders currently present in `/Users/julianschmidt/Documents/GitHub/techbold_track_template`
- README/route/docs context plus package/build/runtime files
- Planning artifacts that create maintenance debt for the next engineer

## 1) Unused package: backend depends on a validator package without use

- `Path(s)`: `backend/package.json`, `backend/package-lock.json`, `backend/src`
- `Evidence`: `@hono/zod-validator` is declared in package files, but backend source code has no `zValidator` imports/usages.
- `Why this hurts velocity`: it creates lockfile churn and misleads builders into expecting middleware-based body/query validation that does not exist.
- `Recommendation`: **simplify**. Remove `@hono/zod-validator` from dependency declarations and lockfile unless the team commits to reintroducing that layer for request validation.

## 2) Frontend has parallel disconnected UI stack

- `Path(s)`: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/components/*.tsx`, `frontend/src/hooks/*.ts`
- `Evidence`: runtime entry mounts only `App.tsx`, while `RunView.tsx`, `TicketListView.tsx`, `ApprovalCard.tsx`, `ActivityView.tsx`, `useTickets.ts`, `useRun.ts`, `useRunEvents.ts` are only imported internally among themselves.
- `Why this hurts velocity`: newcomers edit a second UI architecture that never appears in the app, causing duplicated bug fixing and false confidence.
- `Recommendation`: **delete** unused parallel surface or **wire** one path end-to-end. For v1.1 cleanup bias, delete the disconnected surface and keep `App.tsx` as the single technician path unless product work reuses the component graph.

## 3) Duplicate domain model surfaces across backend and frontend

- `Path(s)`: `backend/src/store/schema.ts`, `backend/src/ai/types.ts`, `backend/src/phoenix/types.ts`, `frontend/src/types.ts`, `frontend/src/api.ts`
- `Evidence`: each file redefines overlapping `Ticket`, `Approval`, `Run`, and event-related shapes with slightly different field names and casing conventions.
- `Why this hurts velocity`: manual map-heavy boundaries grow quickly and invite contract drift between routes, UI state, and persistence.
- `Recommendation`: **simplify** by introducing one canonical contract per boundary (`store` ↔ `routes` ↔ `frontend`) and narrow mappers to explicit translation points.

## 4) Fake/unused plugin-like extension path: top-level `sandbox` package

- `Path(s)`: `sandbox/package.json`, `sandbox/scenarios/registry.ts`, `sandbox/scenarios/scenarios.json`, `sandbox/README.md`
- `Evidence`: package exports `./scenarios` and `./scenarios/types`, Bun-only scripts (`up`, `down`, `reset`, `test`), but the backend imports only `backend/src/sandbox/registry.ts`.
- `Why this hurts velocity`: two scenario layers and a separate tooling package create uncertainty about which incident catalog the product actually uses.
- `Recommendation`: **simplify** by collapsing sandbox scenario ownership to one in-repo package or mark sandbox tooling as **backlog** if optional local VM repro is planned.

## 5) Duplicate scenario catalog: same incidents in two places

- `Path(s)`: `backend/src/sandbox/scenarios.json`, `backend/src/sandbox/registry.ts`, `sandbox/scenarios/scenarios.json`, `sandbox/scenarios/registry.ts`
- `Evidence`: both trees contain nearly identical incident catalogs; comments in backend registry explicitly call out mirroring/absorption from top-level sandbox.
- `Why this hurts velocity`: editing one dataset without the other yields hidden behavioral mismatch and fragile demo/test parity.
- `Recommendation`: **delete** one source of truth. Keep the catalog used by runtime (`backend/src/sandbox`) and move Docker-VM catalog details to sandbox docs only if needed in later milestones.

## 6) Shared artifacts are historical and not production-wired

- `Path(s)`: `shared/safety-rules.json`, `shared/agent-spec.md`, `shared/tests/check_safety.mjs`, `shared/tests/check_safety.py`
- `Evidence`: safety and policy behavior is implemented in `backend/src/safety/*`; no production imports from `shared` and safety checks in `shared/tests` are not in scripts/build path.
- `Why this hurts velocity`: two competing safety narratives plus dead checks consume onboarding time and can mask what the enforced contract actually is.
- `Recommendation`: **delete** if no longer used, or **backlog** with explicit follow-up issue and acceptance criteria for each file.

## 7) Demo layer is detached from core skeleton

- `Path(s)`: `demo/package.json`, `demo/record.mjs`, `demo/README.md`, `demo/remotion/package.json`, `demo/remotion/src/*`, `demo/remotion/package-lock.json`, `demo/remotion/public/.gitkeep`
- `Evidence`: demo tooling is outside workspace, uses its own npm/Playwright/Remotion chain, and selectors in `demo/record.mjs` reference old UI labels not in current flow.
- `Why this hurts velocity`: build/test commands no longer reflect demo status; stale script drift creates setup breakage during release prep.
- `Recommendation`: **delete** demo scaffolding from core skeleton, or move to a separate branch/artifact repo; for v1.1 choose deletion to protect clean baseline.

## 8) Frontend build/runtime is inconsistent with project workspace baseline

- `Path(s)`: `frontend/Dockerfile`, `frontend/package.json`, `.planning/codebase/STACK.md`
- `Evidence`: Dockerfile uses `node:20-slim` + `npm install` + `npm run dev`, while workspace/runtime conventions are pnpm-based and backend Dockerfile is Node 22 with pnpm.
- `Why this hurts velocity`: mixed package-manager and runtime assumptions slow onboarding, make reproducibility checks confusing, and weaken v1.1 “one-toolchain” baseline.
- `Recommendation`: **simplify** by aligning frontend container and docs to the workspace package-manager strategy and explicit environment assumptions.

## 9) Non-workspace lock artifacts and stale package-manager remnants

- `Path(s)`: `frontend/bun.lock`, `demo/package-lock.json`, `demo/remotion/package-lock.json`, `backend/node_modules`, `frontend/node_modules`
- `Evidence`: lock artifacts for external tooling outside pnpm workspace; `bun.lock` sits at frontend root while frontend itself uses npm scripts plus workspace pnpm.
- `Why this hurts velocity`: dependency provenance becomes unclear and cleanup work (upgrade/install) is duplicated across tooling stacks.
- `Recommendation`: **delete** tracked or generated lockfiles/scripts not required by v1.1 build path; keep only one dependency model (`pnpm-lock.yaml`).

## 10) Phase-leftover artifacts clutter the root working context

- `Path(s)`: `.planning/milestones/v1.0-phases/*`, `.planning/STATE.md`, `.planning/PROJECT.md`
- `Evidence`: milestone v1.0 is archived but phase docs are still in the root planning surface with status wording that signals active work while `.planning/STATE.md` also says awaiting next milestone.
- `Why this hurts velocity`: engineers must parse what is active vs historical before making any decision.
- `Recommendation`: **backlog** for planning hygiene or **delete/archive** old phase files into a history folder and point team docs to a single active milestone status summary.

## Senior-style v1.1 cleanup priority (minimum set)

1. Delete disconnected frontend `components/` + `hooks/` path under `frontend/src` unless actively reused.
2. Remove unused `@hono/zod-validator` dependency and align docs around actual validation layer.
3. Collapse scenario catalogs to one source (`backend/src/sandbox`) and remove or isolate top-level sandbox scenario artifacts.
4. Remove stale demo/sandbox lock/build surfaces from core skeleton path.
5. Align frontend build/runtime surface with workspace toolchain (`pnpm`, not mixed toolchains).

