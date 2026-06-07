# Limitations: Service Desk Autopilot

Last updated: 2026-06-07.

This file lists current limits and accepted blockers. It is intentionally conservative.

## Scope Limits

| Limit | Current stance |
|---|---|
| Fully autonomous remediation | Out of scope. A human approves or edits every command before execution. |
| Enterprise deployment hardening | Out of scope. No auth layer, RBAC, queue, Kubernetes, or multi-tenant controls. |
| Generic shell assistant | Out of scope. The product is scoped to service-desk incidents from Phoenix tickets. |
| Hidden VM guarantee | Not claimed. The system is designed for generalization, but this workspace lacks real VM access. |
| Production frontend hosting | Out of scope. The primary UI is the local Next.js dashboard on port 3000. |
| Vite frontend ownership | The Vite app is a temporary compatibility fallback on port 5173 until documented dashboard parity and retirement criteria are satisfied. |
| Postgres and pgvector | Deferred (not in this build); uses the current backend store path. |
| RAG memory implementation | Deferred (not in this build); memory panels show a read-only deferred status. |
| Observability instrumentation | Deferred (not in this build); observability panels show read-only / health-only status. |
| Full dashboard + memory + observability integration | Deferred (not in this build). |

## Current External Blockers

| Area | Blocker | Effect |
|---|---|---|
| Phoenix | Placeholder `PHOENIX_API_TOKEN` | Live API calls return `401 Invalid team token`. |
| SSH | Missing `/keys/your-key.pem` | No real VM command can be attempted safely. |
| VM target | No real host/port from Phoenix | SSH and sudo cannot be validated. |
| LLM | Placeholder `OPENAI_API_KEY` | Real model loop cannot be validated. |

Exact real-integration evidence is in `.planning/phases/04-real-integration-validation/04-VERIFICATION.md`.

## Mock-Mode Boundaries

Mock mode is verified and useful for demo resilience, but it is not real infrastructure evidence.

Mock mode proves:

- The backend and frontend start from a clean clone.
- The mounted UI can drive the run, approval, SSE, audit, and activity path.
- The orchestrator, safety checks, mock SSH executor, and activity submission path work together.
- Deterministic tests cover the primary vertical slice.

Mock mode does not prove:

- Phoenix credentials are valid.
- SSH can reach a practice VM.
- `azureuser` has passwordless sudo.
- A real LLM can complete the troubleshooting loop.
- A hidden VM incident can be solved.
- Postgres, pgvector, RAG memory, or observability instrumentation is implemented.

## Safety Boundaries

The deterministic gate reduces hard-fail risk, but it is not a sandbox.

- Static command classification cannot prove arbitrary shell intent.
- Any command that cannot be classified safely should be blocked or sent back for a narrower proposal.
- Read-only commands can still read irrelevant files, so technician approval and audit review still matter.
- Redaction is pattern-based and should not be treated as permission to print whole secret-bearing files.

## Operational Limits

- The app is single-process and single-node.
- SQLite is the durable store in Docker Compose through the `autopilot-data` volume.
- The JSONL adapter is an in-memory mock/test fallback and is not durable.
- `MOCK_MODE=true` is the recommended demo setting until real credentials and keys are provided.
- The dashboard uses backend contracts for source labels and deferred memory/observability states. It must not present those deferred states as live memory retrieval, live Phoenix validation, live SSH validation, sudo validation, live LLM validation, or real observability telemetry.

## Demo Fallbacks

| Risk | Fallback |
|---|---|
| Phoenix token missing or expired | Keep `MOCK_MODE=true` and use seeded mock tickets. |
| SSH key or VM unavailable | Use mock SSH in the deterministic demo path. |
| LLM key unavailable or rate-limited | Use the built-in mock model path. |
| Browser plugin unavailable | Use the recorded fallback browser UAT evidence. |
| Real validation requested | Use the real-integration blocker notes and list exact missing inputs. |
