# Phase 1: Fresh-Clone Runtime Validation - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning
**Mode:** Autonomous smart discuss, recommendations auto-accepted

<domain>
## Phase Boundary

This phase proves whether the current skeleton can be started from a clean checkout through the documented Docker Compose path. It is a validation and documentation-correction phase, not a feature expansion phase. The work covers `LIVE-01` and `LIVE-02`: fresh-clone startup, package-manager command truth, Docker Compose behavior, environment defaults, startup logs, and documentation drift discovered by the validation attempt.

</domain>

<decisions>
## Implementation Decisions

### Validation Scope
- Use a temporary local clone or equivalent clean worktree to avoid relying on local generated files.
- Run the documented setup path first: copy `.env.example` when present, then run `docker compose up --build`.
- Treat Docker availability, network access, and local port conflicts as environment findings only when the command cannot reach application code.
- Preserve the current no-new-feature rule; only fix files when validation exposes setup or documentation drift.

### Evidence Standard
- Capture exact commands, exit codes, and concise failure or success evidence in phase artifacts.
- Do not claim fresh-clone success unless the Docker Compose stack actually builds and reaches expected startup or health behavior.
- If an environment blocker prevents completion, record the blocker with reproduction steps and the next manual action.
- Keep mock-mode startup separate from live Phoenix, SSH, and LLM claims.

### Documentation Corrections
- Prefer small documentation corrections over broad rewrites.
- Align README and infrastructure docs only to observed behavior and current source files.
- Leave stale generated codebase-map notes for the planning hygiene phase unless they directly mislead Phase 1 validation.
- Keep wording direct, ASCII-only, and free of unsupported status claims.

### the agent's Discretion
The agent may choose the temporary clone location, log file names, and exact health checks. The agent may skip destructive cleanup while Docker containers are running and should avoid changing source code unless validation proves a skeleton-startup defect.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docker-compose.yml` defines backend and frontend services, a durable `autopilot-data` volume, and a read-only `keys/` mount.
- `.env.example` is the documented offline mock-mode template.
- `package.json` declares `pnpm@10.28.2` and root scripts for `typecheck`, `test`, `build`, and `check`.
- `README.md` documents Docker Compose startup and non-Docker pnpm commands.

### Established Patterns
- Current source uses Node 22, Hono, TypeScript, React 18, Vite, pnpm, Vitest, and Docker Compose.
- The active frontend runtime is `frontend/src/App.tsx` mounted from `frontend/src/main.tsx`.
- The backend health route exposes runtime and store-mode information.
- Existing codebase-map files still contain older Python/FastAPI notes, so Phase 1 should prefer current source, README, package files, and Dockerfiles over stale maps.

### Integration Points
- Phase validation touches `README.md`, `docs/INFRASTRUCTURE.md`, Dockerfiles, `docker-compose.yml`, `.env.example`, and root package scripts if drift is proven.
- Evidence belongs in `01-VERIFICATION.md` and `01-01-SUMMARY.md`.
- Any production change must trace back to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`.

</code_context>

<specifics>
## Specific Ideas

No user-provided Phase 1 overrides. Use the roadmap success criteria and repository rules as the source of truth.

</specifics>

<deferred>
## Deferred Ideas

Browser workflow UAT belongs to Phase 2. Vertical-slice test additions belong to Phase 3. Real Phoenix, SSH, and LLM validation belongs to Phase 4.

</deferred>
