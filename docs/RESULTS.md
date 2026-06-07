# Results: Service Desk Autopilot

Last verified: 2026-06-07.

This file records verified behavior, not intended behavior. Mock-mode evidence and real-integration blockers are separated.

## Verified Commands

```bash
bun run --filter techbold-track-backend test -- vertical-slice store-jsonl
bun run --filter techbold-track-backend typecheck
bun run check
docker compose up --build
```

Results:

| Check | Result | Evidence |
|---|---|---|
| Backend tests | Pass, 27 files and 585 tests in the Phase 3 focused run | `.planning/phases/03-vertical-slice-coverage/03-VERIFICATION.md` |
| Backend typecheck | Pass | `.planning/phases/03-vertical-slice-coverage/03-VERIFICATION.md` |
| Fresh Docker Compose startup | Pass in mock mode | `.planning/phases/01-fresh-clone-runtime-validation/01-VERIFICATION.md` |
| Browser UAT | Pass in mock mode | `.planning/phases/02-browser-sse-uat/02-VERIFICATION.md` |
| Real integrations | Blocked by exact missing inputs | `.planning/phases/04-real-integration-validation/04-VERIFICATION.md` |

## Current Build Status

| Area | Status | Notes |
|---|---|---|
| Backend API | Built | Hono routes for tickets, runs, approvals, SSE, activity draft, and activity submit. |
| Frontend | Built | React/Vite workspace at `apps/frontend/src/App.tsx`. |
| Safety gate | Built and tested | Proposal check and edited-command recheck before execution. |
| Audit trail | Built and tested | SQLite durable store plus JSONL mock fallback. |
| Mock Phoenix, SSH, LLM | Built and tested | Supports offline demo and deterministic coverage. |
| Real Phoenix | Blocked | Endpoint reachable, placeholder token returns `401 Invalid team token`. |
| Real SSH and sudo | Blocked | Missing key at `/keys/your-key.pem`; no real VM host/port available without Phoenix token. |
| Real LLM | Blocked | `OPENAI_API_KEY` is a placeholder. |

## Vertical Slice Evidence

The deterministic vertical-slice test covers:

1. Create a run from a Phoenix ticket.
2. Advance to diagnostic approval.
3. Consume `approval.required` from the SSE route.
4. Approve an edited diagnostic command.
5. Persist and return the executed command result.
6. Advance through root cause, fix proposal, fix approval, validation, activity draft, and activity submission.
7. Verify completed run status and audit events.

This maps to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md` entries V-002 and BL-002.

## Demo Status

The recommended demo path is mock mode:

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`

Mock mode is the only fully verified path in this workspace. It demonstrates the primary workflow without Phoenix credentials, SSH key material, or LLM credentials.

## Real Integration Status

Real integration validation did not succeed because required external inputs are missing.

| Integration | Status | Exact blocker |
|---|---|---|
| Phoenix | Blocked | `PHOENIX_API_TOKEN` is still `your-phoenix-token-here`; `/api/v1/me` returns 401. |
| SSH | Blocked | `/keys/your-key.pem` does not exist and no real VM host/port is available. |
| Sudo | Blocked | Cannot run `sudo -n true` until SSH succeeds. |
| LLM | Blocked | `OPENAI_API_KEY` is still `your-openai-key-here`. |

## Requirement Status

The v1.2 milestone requirements in `.planning/REQUIREMENTS.md` are complete as either verified behavior or exact blockers:

- LIVE-01, LIVE-02: complete.
- UAT-01, UAT-02: complete.
- E2E-01: complete.
- REAL-01, REAL-02, REAL-03: complete as blocked with exact failure modes.
- SUBM-01, PLAN-01, PLAN-02: complete after Phase 5 handoff.

## What Is Not Claimed

- No real hidden VM incident has been solved from this workspace.
- No real Phoenix activity has been submitted from this workspace.
- No real SSH command has been executed from this workspace.
- No real LLM call has been validated from this workspace.

Those are blocked by missing external credentials and key material, not by successful mock-mode evidence.
