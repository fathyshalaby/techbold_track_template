# Service Desk Autopilot

Technician-controlled AI troubleshooting copilot for the techbold START Hack Vienna '26 track.

The app loads Phoenix ERP tickets, retrieves the affected customer system, lets an AI propose exactly one diagnostic or fix command at a time, and requires the technician to approve, edit, or reject every command before deterministic backend code can execute it over SSH. Every action is redacted, audited, streamed to the browser, and used to draft the final Phoenix activity report.

The model never executes commands. It proposes structured outputs; the backend owns safety, state, approval, SSH, persistence, and Phoenix writes.

## What Is Built

- `backend/` - Node 22, Hono, TypeScript API.
- `frontend/` - React 18, Vite technician workspace.
- `backend/src/phoenix/` - typed Phoenix client plus in-memory mock.
- `backend/src/safety/` - deterministic command policy, risk classifier, and redaction.
- `backend/src/store/` - append-only run/audit store with SQLite and JSONL fallback.
- `backend/src/ssh/` - single-command SSH executor plus scripted mock.
- `backend/src/ai/` - specialist agent roles and deterministic orchestrator.
- `frontend/src/components/` - ticket list, run page, approval card, audit timeline, activity editor.

## Prerequisites

- Docker Desktop or Docker Engine with Compose.
- Node 22 and pnpm for local backend development.
- Node 20+ or Node 22 for local frontend development.
- Phoenix ERP token from Builder Base for real mode.
- SSH private key placed under `keys/` for real VM mode.
- Optional OpenAI-compatible API key for real LLM mode.

Mock mode is enabled by default in `.env.example`, so a fresh clone can boot offline without Phoenix, SSH, or LLM credentials.

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:8000/health

The default `.env.example` uses `MOCK_MODE=true`. To run against real services, fill in Phoenix, SSH, and LLM values, then set `MOCK_MODE=false`.

## Environment

| Variable | Purpose |
| --- | --- |
| `PHOENIX_API_BASE_URL` | Phoenix ERP base URL. |
| `PHOENIX_API_TOKEN` | Bearer token for Phoenix. |
| `SSH_PRIVATE_KEY_PATH` | Path inside the backend container, usually `/keys/your-key.pem`. |
| `SSH_USERNAME` | SSH user, usually `azureuser`. |
| `LLM_PROVIDER` | Currently `openai`. |
| `LLM_MODEL` | Model name used by the AI SDK provider. |
| `OPENAI_API_KEY` | Bring-your-own LLM key for real mode. |
| `MOCK_MODE` | Forces Phoenix, SSH, and LLM clients offline when true. |
| `MOCK_PHOENIX` / `MOCK_SSH` / `MOCK_LLM` | Per-service mock overrides. |
| `PORT` | Backend port, default `8000`. |

Secrets stay out of git:

- `.env` is ignored.
- `keys/*` is ignored except `keys/.gitkeep`.
- `*.pem` and `*.key` are ignored.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run backend:

```bash
cd backend
pnpm dev
```

Run frontend:

```bash
cd frontend
pnpm dev
```

Run all tests from the repository root:

```bash
pnpm test
```

Run checks individually:

```bash
pnpm --dir backend test
pnpm --dir frontend test
pnpm --dir frontend build
```

## Workflow

1. Technician opens the ticket list and selects a ticket.
2. Backend loads the ticket and customer-system data from Phoenix or mock fixtures.
3. Technician starts a run.
4. Orchestrator asks the diagnostic agent for ranked hypotheses and one proposed command.
5. Safety policy classifies the command and blocks forbidden commands before approval.
6. Technician approves, edits then approves, or rejects the proposal.
7. Approval re-runs safety validation on the final command.
8. SSH executor runs one non-interactive command with timeout, output cap, and redaction.
9. Audit events and SSE events record the same meaningful side effects.
10. The loop continues through diagnosis, fix proposal, validation, activity draft, and submission.

## Safety Model

The safety guarantee is deterministic:

- Human approval is required for every SSH command.
- Edited commands are rechecked before execution.
- `HIGH_RISK_BLOCKED` commands never execute.
- The model cannot call the SSH executor.
- Output is capped and redacted before audit, UI, or model reuse.
- The audit log is append-only; there is no delete path.

Blocked classes include broad recursive deletes, mass permissions changes, DB destruction, security disabling, log/history clearing, private key dumping, and remote-code execution patterns such as `curl ... | sh`.

## API Surface

Backend routes are mounted under `/api`:

- `GET /health`
- `GET /api/me`
- `GET /api/tickets`
- `GET /api/tickets/:ticketId`
- `GET /api/tickets/:ticketId/customer-system`
- `POST /api/runs`
- `GET /api/runs/:runId`
- `POST /api/runs/:runId/next`
- `POST /api/runs/:runId/abort`
- `POST /api/runs/:runId/approvals/:approvalId/approve`
- `POST /api/runs/:runId/approvals/:approvalId/reject`
- `GET /api/runs/:runId/events`
- `POST /api/runs/:runId/activity/draft`
- `POST /api/runs/:runId/activity/submit`

## Tests

Current automated coverage includes:

- Phoenix client happy paths, auth errors, not-found handling, retries, and activity creation.
- Safety policy blocklist, obfuscation variants, redaction, and edited-command recheck.
- SSH executor timeout, output cap, mock behavior, and command wrapping.
- Orchestrator happy path, rejection path, blocked-command path, validation, and activity handoff.
- Route tests for tickets, runs, approvals, SSE/audit symmetry, and activity draft/submit.
- Frontend mapper tests.

Run:

```bash
pnpm test
pnpm --dir frontend build
```

## Real-Mode Checklist

Before evaluating against real VMs:

1. Put the assigned `.pem` file under `keys/`.
2. Set `SSH_PRIVATE_KEY_PATH=/keys/<file>.pem`.
3. Fill `PHOENIX_API_TOKEN`.
4. Fill `OPENAI_API_KEY` and choose `LLM_MODEL`.
5. Set `MOCK_MODE=false`.
6. Confirm `azureuser` can run `sudo -n true` on target VMs.
7. Run a harmless preflight such as `uname -a` through the UI.

## Submission Notes

- License: MIT, included in `LICENSE`.
- Report: see `REPORT.md`.
- Architecture docs: see `docs/ARCHITECTURE.md`, `docs/SAFETY_POLICY.md`, and `docs/AGENT_PIPELINE.md`.
- Phoenix API contract: see `docs/phoenix-openapi.yaml`.

