# techbold | AI Service Desk Autopilot

Technician-controlled AI troubleshooting for the techbold START Hack Vienna track. The backend loads tickets from Phoenix ERP, proposes one diagnostic command at a time, runs only human-approved commands over SSH through a safety layer, validates fixes, and drafts an ERP activity from the audit trail.

The AI never executes on its own.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Node 22, Hono, TypeScript, Vercel AI SDK, ssh2, better-sqlite3, Zod |
| Frontend | React 18, Vite, TypeScript |
| Tooling | Bun workspaces, Biome, Vitest, Husky, Docker Compose |
| Model (optional) | Python sidecar in `apps/model` for LoRA adapter training |

## Layout

```
apps/backend/       Hono API, orchestrator, safety, SSH, Phoenix, store
apps/frontend/      Technician workspace (src/App.tsx)
apps/model/         Python LoRA training sidecar
packages/contracts/ API and safety reference contracts
infra/sandbox/      Docker VM archetypes
docs/               Architecture, API, safety, scoring
docs/knowledge/     Runbooks (encoded into backend agents)
```

## Quick start (mock mode, no credentials)

```bash
cp .env.example .env
docker compose up --build
```

- Workspace: http://localhost:5173
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
