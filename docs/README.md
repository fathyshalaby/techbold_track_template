# Documentation

## Start here

| Reader | Documents |
|--------|-----------|
| Judge / reviewer | [../REPORT.md](../REPORT.md), [pitch/PITCH_DECK.md](pitch/PITCH_DECK.md), [SUBMISSION_HANDOFF.md](SUBMISSION_HANDOFF.md), [RESULTS.md](RESULTS.md), [LIMITATIONS.md](LIMITATIONS.md) |
| Developer | [../README.md](../README.md), [ARCHITECTURE.md](ARCHITECTURE.md), [API.md](API.md) |
| Operator | [SAFETY_POLICY.md](SAFETY_POLICY.md), [SECURITY.md](SECURITY.md), [SUBMISSION_HANDOFF.md](SUBMISSION_HANDOFF.md) |

## Local commands

| Command | Purpose |
|---|---|
| `bun run dev:backend` | Start the Hono backend on port 8000. |
| `bun run dev:frontend` | Start the primary Next.js dashboard on port 3000. |
| `bun run dev:vite` | Start the temporary Vite fallback on port 5173. |

## Core docs

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, state machine, module boundaries |
| [API.md](API.md) | Backend HTTP and SSE contract |
| [DATA_MODEL.md](DATA_MODEL.md) | Persisted schema and audit model |
| [SAFETY_POLICY.md](SAFETY_POLICY.md) | Command gate and risk classification |
| [SECURITY.md](SECURITY.md) | Threat model and secret handling |
| [scoring.md](scoring.md) | Rubric and hard-fail rules |
| [RESULTS.md](RESULTS.md) | Verified behavior and blockers |
| [LIMITATIONS.md](LIMITATIONS.md) | Scope limits and fallback paths |
| [SUBMISSION_HANDOFF.md](SUBMISSION_HANDOFF.md) | Demo checklist and evidence |
| [phoenix-openapi.yaml](phoenix-openapi.yaml) | Phoenix ERP API contract |
| [knowledge/](knowledge/) | Human-readable runbooks |

## Pitch

| Doc | Purpose |
|-----|---------|
| [pitch/PITCH_DECK.md](pitch/PITCH_DECK.md) | Pitch deck source |
| [pitch/PITCH_DECK.html](pitch/PITCH_DECK.html) | Rendered deck |
