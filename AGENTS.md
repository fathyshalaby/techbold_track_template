# Agent Instructions

Service Desk Autopilot: a technician-controlled troubleshooting copilot for the techbold START Hack Vienna track.

## Stack

- TypeScript monorepo: `apps/backend` (Hono), `apps/frontend` (React/Vite)
- Python sidecar: `apps/model` (LoRA adapter training, optional)
- Package manager: Bun (`bun install`, `bun run check`)
- Formatting: Biome (TS/JS), Ruff (Python)

## Layout

```
apps/backend/     API, orchestrator, safety layer, SSH, Phoenix client, store
apps/frontend/    Technician workspace (App.tsx)
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
bun run dev:frontend   # :5173
docker compose up --build
```

## Docs

Authoritative design: `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/SAFETY_POLICY.md`.
