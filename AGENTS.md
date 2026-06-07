# Agent Instructions

Sphinx: a technician-controlled troubleshooting copilot for the techbold START Hack Vienna track.

## Stack

- TypeScript monorepo: `apps/backend` (Hono), `apps/dashboard` (Next.js)
- Python sidecar: `apps/model` (Mac MLX train + serve for the trained adapter)
- Package manager: Bun (`bun install`, `bun run check`)
- Formatting: Biome (TS/JS), Ruff (Python)

## Layout

```
apps/backend/     API, orchestrator, safety layer, SSH, Phoenix client, store
apps/dashboard/   Technician workspace (Next.js)
apps/model/       MSP adapter training sidecar
packages/contracts/  API and safety contracts (reference)
infra/sandbox/    Docker VM archetypes for realistic incidents
docs/knowledge/   Human-readable runbooks (encoded in backend agents)
```

## Rules

- The model proposes commands; humans approve; the backend executes after safety checks.
- No incident-specific hardcoding (ticket IDs, hostnames, symptom strings).
- Secrets stay server-side. Redact before audit, UI, or model context.
- Comments: rare, intent-only. No emojis. No em dashes. ASCII punctuation in source.
- Every endpoint and UI action on the main path must have a real effect.
- Prefer small functions, typed boundaries, explicit errors.

## Commands

```bash
cp .env.example .env
bun install
bun run check          # lint, typecheck, test, build
bun run dev:backend    # :8000
bun run dev:frontend   # :3000
docker compose up --build
```

Local model id: `techbold/msp-autopilot` (Mac MLX). The dashboard always routes to it.
`getModel()` uses `CUSTOM_MODEL_BASE_URL` (default `http://127.0.0.1:8011/v1`; compose
uses `http://host.docker.internal:8011/v1`). Train with `bun run model:train`, serve with
`bun run model:serve`. Set `MOCK_LLM=false` for live agent calls.

## Docs

Authoritative design: `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/SAFETY_POLICY.md`.
