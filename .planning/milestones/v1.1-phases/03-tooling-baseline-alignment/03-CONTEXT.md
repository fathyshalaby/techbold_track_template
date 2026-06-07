# Phase 3: Tooling Baseline Alignment - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix B-003, BR-001, BR-002, BR-003, and T-001 by making pnpm the documented and enforced workspace package manager.
</domain>

<decisions>
## Implementation Decisions

### Package Manager
- Root `packageManager` pins pnpm 10.28.2, matching the local lockfile owner.
- Stale npm and bun lockfiles are deleted.

### Scripts
- Root scripts expose `typecheck`, `test`, `build`, `check`, `dev:backend`, and `dev:frontend`.
- Backend and frontend each expose `typecheck`.

### CI and Docker
- CI runs workspace install, typecheck, test, and build.
- Frontend Dockerfile uses Node 22, corepack, pnpm, and the root workspace lockfile.
</decisions>

<code_context>
## Existing Code Insights

### Integration Points
- `package.json`
- `backend/package.json`
- `frontend/package.json`
- `.github/workflows/ci.yml`
- `frontend/Dockerfile`
- `docker-compose.yml`
</code_context>

<specifics>
## Specific Ideas

Trace: B-003, BR-001, BR-002, BR-003, T-001, DEL-001.
</specifics>

<deferred>
## Deferred Ideas

A formatter/linter package is not added without an explicit dependency decision.
</deferred>
