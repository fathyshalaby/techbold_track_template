# techbold | AI Service Desk Autopilot

Technician-controlled AI troubleshooting for the techbold START Hack Vienna track. The backend loads tickets from Phoenix ERP, proposes one diagnostic command at a time, runs only human-approved commands over SSH through a safety layer, validates fixes, and drafts an ERP activity from the audit trail.

The AI never executes on its own.

## Status

- **Demo-ready (mock mode): ✓** — the full ticket → diagnose → approve → fix → validate → activity flow runs offline, no credentials.
- **Live integrations (Phoenix / SSH / LLM):** wired and verified reachable; gated by **credentials**, not code. Drop your team token + an LLM key into `.env` and a key into `keys/`. See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).
- **Built for the rubric:** 55 of 100 points are **B (troubleshooting) + C (safety & audit)** — see [docs/scoring.md](docs/scoring.md). The design optimizes for those, not UI polish alone.

## How it works

```
Phoenix ERP ──tickets──▶ Backend (Hono)
                            │  ai/agents propose ONE command + ranked hypotheses
                            ▼
                       Safety gate (deterministic blocklist + classifier)  ──blocks dangerous──▶ ✗
                            │  proposal
                            ▼
                       Technician: approve / edit / reject / abort   ◀── human confirms EVERY command
                            │  approved + re-checked
                            ▼
                       SSH executor (one command, timeout, output cap, redacted)
                            │  observe → iterate → minimal reversible fix → validate (survives reboot)
                            ▼
                       Append-only audit trail ──▶ ERP activity (5 fields, drafted only from the trail)
```

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Node 22, Hono, TypeScript, Vercel AI SDK, ssh2, better-sqlite3, Zod |
| Frontend | React 18, Vite, TypeScript |
| Tooling | Bun workspaces, Biome, Vitest, Husky, Docker Compose |
| Model (optional) | Python sidecar in `apps/model` for LoRA adapter training |

## Layout

```
apps/backend/       Hono API, orchestrator, safety, SSH, Phoenix, store (PRIMARY)
apps/backend-py/    FastAPI mirror (secondary; auto-drive variant, node parity)
apps/dashboard/     Technician workspace — Next.js (PRIMARY UI, :3000)
apps/frontend/      Vite workspace (fallback UI, :5173)
apps/model/         Python LoRA training sidecar
packages/contracts/ API and safety reference contracts
infra/sandbox/      Docker VM archetypes
docs/               Architecture, API, safety, scoring, DEMO_SCRIPT
docs/knowledge/     Runbooks (encoded into backend agents)
```

## Quick start (mock mode, no credentials)

```bash
cp .env.example .env
docker compose up --build
```

- Workspace (primary): http://localhost:3000  (Next.js dashboard — use this for the demo)
- Workspace (fallback): http://localhost:5173  (Vite; start with `docker compose --profile fallback up`)
- Health: http://localhost:8000/health

`.env.example` sets `MOCK_MODE=true` (mock Phoenix, SSH, and LLM). Demo the full flow offline.

### Local development

Requires Node 22+ and [Bun](https://bun.sh).

```bash
bun install
bun run dev:backend     # API on :8000
bun run dev:frontend    # UI on :5173
```

### Quality gates

```bash
bun run lint            # Biome
bun run typecheck
bun run test
bun run build
bun run check           # all of the above
```

Pre-commit hooks run lint-staged (Biome + Ruff on staged files).

## Going live

Set vars in `.env` and disable mocks (`MOCK_MODE=false` or per-service flags):

| Variable | Purpose |
|----------|---------|
| `PHOENIX_API_BASE_URL`, `PHOENIX_API_TOKEN` | ERP API |
| `SSH_PRIVATE_KEY_PATH`, `SSH_USERNAME` | Customer VM SSH |
| `OPENAI_API_KEY`, `LLM_PROVIDER`, `LLM_MODEL` | LLM provider |
| `VITE_API_BASE` | Browser API URL (default `http://localhost:8000`) |

`env.ts` fails fast on missing required vars. Never commit `.env` or keys.

## API surface

Backend routes: see `docs/API.md`. Phoenix contract: `docs/phoenix-openapi.yaml`.

Core loop: load ticket -> propose command -> approve/edit/reject -> safety check -> SSH execute -> observe -> repeat -> validate -> draft activity -> submit.

## Scoring

See `docs/scoring.md`. B (troubleshooting) + C (safety and audit) are 55 of 100 points. Hard-fail commands (destructive ops, secret leaks) zero the incident.

MIT licensed. See `LICENSE`.
