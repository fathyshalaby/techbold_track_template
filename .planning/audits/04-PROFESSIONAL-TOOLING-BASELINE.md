# v1.1 Professional Tooling Baseline

**Generated:** 2026-06-07T05:11:49Z  
**Scope:** package scripts, workspace install/runtime commands, lockfiles, Dockerfiles, CI, README/docs/env examples, and command reality checks.  
**Mode:** report only (no source/package files modified).

## Executive Assessment

The repo does **not** yet have a professional but lightweight baseline. The core app has a usable test/typecheck/build stack, but tooling is fragmented across `pnpm`, `npm`, and `bun`; formatter/lint/quality gates are missing; and lock/CI/docs are out of sync with command truth.

## Baseline Checklist

| Area | Required | Found | Status |
| --- | --- | --- | --- |
| One package manager for core runtime | Enforced (single PM) | Core workspace uses `pnpm`; frontend Docker uses `npm`; demo/remotion and bun artifacts are present | ❌ |
| Pinned runtime | Version pin at repo boundary | CI says Node 22; frontend Docker says Node 20; no `.nvmrc`/`.tool-versions`/`packageManager` field | ❌ |
| Install command | One authoritative install command in docs | README says `pnpm install`; backend frontend Docker and frontend lock strategy deviate | ⚠️ |
| Dev command (core) | `pnpm --filter ...` style scripts or `pnpm dev` | Backend/frontend each have local `dev`; root has no `dev` | ⚠️ |
| Build command | Team build alias present | `pnpm build` exists at root (`pnpm --dir frontend build`) | ✅ |
| Typecheck command | `typecheck` script | `pnpm exec tsc --noEmit` only; no `typecheck` script in any package | ❌ |
| Lint command | `lint` script | none in root/backend/frontend/demo/sandbox | ❌ |
| Format command | `format` script | none in root/backend/frontend/demo/sandbox | ❌ |
| Quality command | `quality` script (lint + typecheck + tests) | none | ❌ |
| Format decision | Biome OR Prettier declared | none configured | ❌ |
| Husky + lint-staged | Hooks present | none | ❌ |
| Editor config baseline | `.editorconfig`/formatter settings | none found | ❌ |
| Dependency cleanup | One lock policy + remove stale lock artifacts | mixed `pnpm-lock.yaml`, tracked npm lockfiles, and untracked `frontend/bun.lock` | ❌ |
| Env example + runtime truth | `.env.example`, startup docs, and code schema aligned | `.env.example` present; docs and env schema mostly align | ✅/⚠️ |
| README command truth | Command list matches real scripts | mostly yes, but stale test-count + stale phrasing; no lint/format/quality commands listed | ⚠️ |
| CI suitability | Core + frontend + quality gates | CI currently only backend `tsc --noEmit` + backend tests | ❌ |
| Conflicting formatters | multiple formatters running with inconsistent configs | none detected | ✅ (but no baseline yet)

## Evidence by command (safe/local)

| Command | Exit | Useful output | Likely root cause | Smallest fix |
| --- | --- | --- | --- | --- |
| `pnpm install --frozen-lockfile` | 1 | `ERR_PNPM_OUTDATED_LOCKFILE` + `2 dependencies were added: @vitest/coverage-v8@^4.1.8, vitest@^4.1.8` | `frontend/package.json` is ahead of `pnpm-lock.yaml` | Run `pnpm install` once and commit refreshed `pnpm-lock.yaml`, then keep CI `--frozen-lockfile` as-is |
| `pnpm run` (repo root) | 0 | lifecycle `test`, `build` only; no `dev/lint/format/typecheck/quality` | Missing script surface | Add root scripts for dev/typecheck/lint/format/quality |
| `pnpm --dir backend run` | 0 | `dev`, `start`, `test`; no `lint/format/typecheck/quality` | Missing quality gates in backend package | Add package scripts (`typecheck`, `lint`, `format`) or keep root contract scripts using direct commands |
| `pnpm --dir frontend run` | 0 | `dev`, `build`, `preview`, `test`; no `lint/format/typecheck/quality` | Missing quality gates in frontend package | Add scripts or root-level quality pipeline |
| `pnpm --dir backend exec tsc --noEmit` | 0 | _no output (passes)_ | Typecheck currently succeeds when run directly | Expose as `typecheck` script |
| `pnpm --dir frontend exec tsc --noEmit` | 0 | _no output (passes)_ | Typecheck currently succeeds when run directly | Expose as `typecheck` script |
| `pnpm --dir frontend build` | 0 | `vite build` completes, dist created | Build is healthy | Keep as build target |
| `pnpm --dir backend test` | 0 | backend suite passes, many tests | Backend tests pass | Keep in CI |
| `pnpm --dir frontend test` | 0 | 1 test file / 19 passed | Frontend tests pass | Keep in CI |
| `pnpm test` | 0 | `26` files / `556` tests passed | Combined root test works | README should not say `~500` anymore |
| `pnpm --dir backend dev` | 1 (when env absent) | `Missing or invalid required env var: PHOENIX_API_BASE_URL` | README assumes install/run works without env bootstrap; `getEnv()` fails on default non-mock mode | Require `.env` copy before run path in docs and entrypoint docs; mention required vars path explicitly |
| `cd frontend && npm run` | 0 | scripts include `dev/build/test`; no lockfile-based consistency | Non-root package manager for same workspace path | Migrate this to `pnpm` path or make dual-PM policy explicit |
| `cd demo && npm run record` | 1 | `ERR_MODULE_NOT_FOUND` for `playwright` | Missing install/lock policy for demo package | Add/confirm demo install prerequisites and lock consistency, or remove from baseline |
| `cd demo/remotion && npm run studio` | 127 | `sh: remotion: command not found` | Demo package lacks installed `remotion` binary in this workspace session | Ensure `npm install` + lockfile hygiene or exclude from core tool baseline |
| `rg --files -g '*(editorconfig|prettierrc|prettier.config|biome.json|husky|lint-staged|.eslintrc*|eslint.config.*)'` | 1 | no matches | No formatter/lint tooling config files at repo root | Introduce one tool policy and matching configs |

## Lockfile and package-manager consistency

Observed lock files:
- `pnpm-lock.yaml` (root, tracked)
- `backend/package-lock.json` (tracked)
- `demo/package-lock.json` (tracked)
- `demo/remotion/package-lock.json` (tracked)
- `frontend/bun.lock` (untracked)

This is a mixed lock ecosystem, and only one command path can be used safely in CI. Root/pnpx installs currently target `pnpm`, but frontend/docker and demo paths still rely on npm/bun workflows.

## README / docs truth checks

- README dev instructions (`pnpm install`, `cd backend && pnpm dev`, `cd frontend && pnpm dev`) align with pnpm workspace intent.
- README claims `~500` tests, while actual root test run prints `556` passed (still green but stale statement).
- README and docs still describe tooling as if a single command/tooling baseline exists for lint/format/quality, but those commands are currently absent.
- Runtime drift remains visible: backend container uses `node:22-slim` with pnpm, frontend container uses `node:20-slim` with npm.

## Risked impact by area

- **Build reproducibility:** medium — lockfile drift blocks frozen installs.
- **Developer onboarding:** medium — missing baseline commands and multiple PM expectations.
- **Code quality gates:** high — no lint/prettier/biome/easy formatting or quality gates are wired.
- **CI robustness:** medium-high — frontend, non-core packages, and quality steps are not enforced.

## v1.1 smallest fixes (exact and scoped)

1. **Normalize one PM for core repos**
   - Remove `backend/package-lock.json` from tracked files.
   - Decide whether to keep demo toolchains out of the core baseline or convert them to explicit optional targets.
   - In `.gitignore` (if needed), ignore non-core lock artifacts created during ad-hoc local workflows.
2. **Add command contract scripts (root package.json)**
   - Add `dev`, `typecheck`, `lint`, `format`, `quality` scripts.
   - Suggested:
     - `dev`: `pnpm --dir backend dev & pnpm --dir frontend dev`
     - `typecheck`: `pnpm --dir backend exec tsc --noEmit && pnpm --dir frontend exec tsc --noEmit`
     - `lint`: `pnpm --dir backend exec eslint . && pnpm --dir frontend exec eslint .` (or Biome equivalent)
     - `format`: `biome format .` (or `prettier . --check`)
     - `quality`: `pnpm run lint && pnpm run typecheck && pnpm test`
3. **Pick one formatting strategy now**
   - Choose **Biome** (lightweight all-in-one) or **Prettier + ESLint**. Do not mix.
   - Add root config (`biome.json` or `.eslintrc` + `.prettierrc` + scripts) and enforce via `quality`.
4. **Add editor baseline**
   - Add `.editorconfig` with explicit line endings/indentation defaults.
   - Add `format` and `lint` CI hooks if using Husky; otherwise document manual-only checks.
5. **Add lightweight quality hooks**
   - If team wants hooks, add Husky + lint-staged only after command contract is in place.
   - Until then, document that `pnpm quality` is the required pre-merge command.
6. **Fix CI suitability**
   - Extend CI to include:
     - `pnpm install --frozen-lockfile`
     - `pnpm run typecheck`
     - `pnpm run lint`
     - `pnpm --dir frontend test`
     - `pnpm --dir frontend build`
     - keep backend tests as current
7. **Make env/readme truth explicit**
   - Update README to:
     - replace `~500` with `556` (or remove exact count)
     - show both `backend` and `frontend` script paths consistently
     - make runtime prereqs explicit (`Node 20 for frontend container`, `Node 22 for backend`), or remove container/host contradiction.

## Final judgement

Current v1.1 tooling baseline is **not yet met**. Core build/test/typecheck are good, but baseline mechanics for reproducibility, command contracts, formatting, quality gates, and one-package-manager consistency are incomplete.
