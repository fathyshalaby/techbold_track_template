# Phase 9: Tests + Submission Polish - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning
**Mode:** Autonomous; prior human-needed validation items deferred by user choice

<domain>
## Phase Boundary

Phase 9 closes the hackathon submission surface: root-level test command, green automated checks, current README, MIT license confirmation, repo secret scan, REPORT.md, and planning/roadmap state updates. Demo video recording and the external submission form are manual out-of-repo actions and should be surfaced as remaining manual work, not fabricated.

</domain>

<decisions>
## Implementation Decisions

### Verification First
- Run existing backend and frontend tests before editing docs.
- Treat Vitest unhandled errors as failures even when assertions pass.
- Add a repository-root `pnpm test` script because the roadmap explicitly names `pnpm test`.
- Keep frontend build verification separate from test verification.

### Documentation Scope
- Replace the starter README with current implementation instructions.
- Keep setup runnable in default mock mode.
- Document real-mode credential steps without including secrets.
- Write `REPORT.md` honestly: mock-mode and automated checks are verified; live VM results require external credentials.

### Secret Scan
- Use git-based scanning for common token/key patterns.
- Treat `.env.example` placeholders and test redaction fixtures as non-secret false positives when reviewing results.
- Preserve `.env`, keys, `*.pem`, and `*.key` ignore rules.

### the agent's Discretion
All edits should stay submission-focused. Do not broaden product scope or add new runtime features unless test failures require it.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Backend scripts: `backend/package.json` has `dev`, `start`, and `test`.
- Frontend scripts: `frontend/package.json` has `dev`, `build`, `preview`, and `test`.
- `LICENSE` already contains the MIT license.
- `.env.example` defaults to `MOCK_MODE=true`.

### Established Patterns
- Backend tests use Vitest and direct module imports.
- Frontend tests use Vitest.
- Planning files use phase-numbered `PLAN`, `SUMMARY`, `VERIFICATION`, and `UAT` artifacts.

### Integration Points
- Root `pnpm-workspace.yaml` includes `backend` and `frontend`.
- Docker Compose builds backend from the repo root and frontend from `frontend/`.
- README and REPORT are root-level submission-facing files.

</code_context>

<specifics>
## Specific Ideas

Focus on ENG-01 through ENG-04:

- `pnpm test` green at repo root.
- README complete enough for a fresh mock-mode run.
- LICENSE present and secret scan reviewed.
- REPORT.md documents approach, agents, safety model, and verification status.

</specifics>

<deferred>
## Deferred Ideas

- Demo video recording.
- External submission form.
- Live VM proof using Phoenix/SSH/LLM credentials.
- Broader browser E2E automation.

</deferred>

