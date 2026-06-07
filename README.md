# techbold | AI Sphinx

Technician-controlled AI troubleshooting for the techbold START Hack Vienna track. The backend loads tickets from Phoenix ERP, proposes one diagnostic command at a time, runs only human-approved commands over SSH through a safety layer, validates fixes, and drafts an ERP activity from the audit trail.

The AI never executes on its own.

## Stack

| Layer            | Technology                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Backend          | Node 22, Hono, TypeScript, Vercel AI SDK, ssh2, better-sqlite3, Zod |
| Frontend         | Next.js 16, React 19, TypeScript                                    |
| Tooling          | Bun workspaces, Biome, Vitest, Husky, Docker Compose                |
| Model            | Mac MLX trained adapter (`apps/model`, `bun run model:serve`)           |

## Layout

```
apps/backend/       Hono API, orchestrator, safety, SSH, Phoenix, store
apps/dashboard/     Technician workspace (Next.js)
apps/model/         Train + serve the MSP adapter on Mac (MLX, Apple Silicon)
packages/contracts/ API and safety reference contracts
infra/sandbox/      Docker VM archetypes
docs/               Architecture, API, safety, scoring
docs/knowledge/     Runbooks (encoded into backend agents)
```

## Quick start (one command)

```bash
bun run start
```

That single command brings up the entire stack. It auto-creates `.env` from
`.env.example` if missing, generates the sandbox SSH keypair if missing, builds
and starts `db` + `backend` + `frontend` (detached), waits for real health
checks, then prints the access URLs and the resolved live/mock mode.

- Dashboard: http://localhost:3000
- Health: http://localhost:8000/health
- Postgres: localhost:5432 (`autopilot`/`autopilot`)

Add layers as needed, and tear it all down with one command:

```bash
bun run start -- --sandbox    # also build + seed the 5 fake-VM incidents
bun run start -- --model      # also serve the MLX adapter on the Mac host (:8011)
bun run start -- --logs       # follow backend + frontend logs once healthy
bun run start -- --no-build   # fast restart, skip image rebuild
bun run stop                  # stop everything (add -- --purge to drop volumes)
```

`.env.example` sets `MOCK_MODE=true` (mock Phoenix, SSH, and LLM) so a fresh
clone demos the full flow offline with no credentials.

The root `docker-compose.yml` is the single source of truth for the Mac dev
stack. `bun run start` wraps it; you can still drive Compose directly:

```bash
docker compose up --build                         # core demo (backend + frontend)
docker compose --profile sandbox up sandbox       # build + run the 5 fake-VM incidents
```

The trained adapter runs on the **Mac host** via MLX. Train and serve it:

```bash
bun run model:train    # fine-tune MLX adapter (Apple Silicon)
bun run model:serve    # OpenAI-compatible server on :8011 (blocks)
```

The dashboard uses **MSP Autopilot (Mac MLX)** automatically. Set `MOCK_LLM=false` in
`.env` for live agent calls against the adapter.

### Local development

Requires Node 22+ and [Bun](https://bun.sh).

```bash
bun install
bun run dev:backend     # API on :8000
bun run dev:frontend    # Next.js dashboard on :3000
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

| Variable                                      | Purpose                                           |
| --------------------------------------------- | ------------------------------------------------- |
| `PHOENIX_API_BASE_URL`, `PHOENIX_API_TOKEN`   | ERP API                                           |
| `SSH_PRIVATE_KEY_PATH`, `SSH_USERNAME`        | Customer VM SSH                                   |
| `OPENAI_API_KEY`, `LLM_PROVIDER`, `LLM_MODEL` | LLM provider                                      |
| `NEXT_PUBLIC_API_BASE`                        | Browser API URL (default `http://localhost:8000`) |

`env.ts` fails fast on missing required vars. Never commit `.env` or keys.

## API surface

Backend routes: see `docs/API.md`. Phoenix contract: `docs/phoenix-openapi.yaml`.

Core loop: load ticket -> propose command -> approve/edit/reject -> safety check -> SSH execute -> observe -> repeat -> validate -> draft activity -> submit.

## Scoring

See `docs/scoring.md`. B (troubleshooting) + C (safety and audit) are 55 of 100 points. Hard-fail commands (destructive ops, secret leaks) zero the incident.

MIT licensed. See `LICENSE`.
