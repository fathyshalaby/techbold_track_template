# Service Desk Autopilot

## Current State

**Latest shipped milestone:** v1.2 Professional Skeleton Rescue Follow-up

**Status:** v1.3 planning is open for product dashboard, RAG memory, and observability work.

**Primary verified path:** mock-mode demo and deterministic backend vertical slice.

**Real integration status:** blocked by missing external inputs, recorded in `.planning/milestones/v1.2-MILESTONE-AUDIT.md`.

## Current Milestone: v1.3 Product Dashboard, RAG Memory, and Observability

**Goal:** Turn the cleaned skeleton into a real product foundation with an operational dashboard, Postgres-backed memory, pgvector retrieval, and vendor-neutral observability.

**Target features:**

- Next.js dashboard foundation based on shadcn dashboard-01, rewritten around project-specific operational data.
- Postgres replacement for SQLite on the main path, with pgvector enabled for embedding storage and retrieval.
- RAG memory loop for error fingerprinting, embedding, top-k retrieval, accepted-solution persistence, and dashboard visibility.
- Observability baseline for pipeline runs, RAG retrieval, embedding calls, database operations, structured logs, and correlation IDs.
- Integration and verification pass that connects dashboard, pipeline, database, RAG memory, observability, seed data, smoke checks, and docs.

## What This Is

A technician-controlled AI troubleshooting copilot for the techbold START Hack Vienna '26 track. It loads Phoenix ERP tickets and customer-system details, lets an AI propose one diagnostic or fix command at a time, requires the technician to approve, edit, or reject every command, executes only through deterministic backend code, records an append-only audit trail, and drafts the Phoenix activity report from that audit trail.

The AI never acts on its own. It proposes structured outputs; the backend owns safety, approval, SSH execution, persistence, event streaming, and Phoenix writes.

## Core Value

Win B+C on the scoring rubric: solve hidden Linux-service incidents on fresh VMs, safely and auditably. The highest-value proof remains a real run that restores customer benefit, survives persistence checks, and leaves a complete redacted audit trail.

## Validated Milestones

### v1.0

- Node 22 + Hono + TypeScript backend with Zod-validated environment configuration.
- React 18 + Vite frontend technician workspace.
- Mock mode for Phoenix, SSH, and LLM paths.
- Typed Phoenix ERP client and in-memory mock.
- Ticket list/detail routes with customer-system data and graceful error handling.
- Deterministic safety layer with blocklist, classifier, redaction, and edited-command recheck.
- Append-only run/audit store with SQLite and JSONL fallback.
- ssh2 single-command executor with timeout, output cap, redaction, mock mode, and preflight behavior.
- Specialist AI roles and deterministic orchestrator state machine.
- Run API, approval API, SSE stream, and activity draft/submit routes.
- Frontend ticket list, run view, approval card, audit timeline, retry/abort controls, and activity editor.

### v1.1

- Standardized backend/frontend SSE event contracts and canonical event names.
- Removed disconnected frontend surfaces so the mounted app has one runtime path.
- Aligned package manager, root scripts, CI checks, frontend Docker build, and lockfile ownership on pnpm.
- Exposed store durability through startup logs and `/health`.
- Updated README, infrastructure docs, requirements traceability, and phase artifacts.

### v1.2

- Proved fresh-clone Docker Compose startup in mock mode.
- Completed browser UAT for the mounted frontend and SSE lifecycle in mock mode.
- Added deterministic backend vertical-slice coverage for run creation, SSE, approval edit/execute, validation, and activity submission.
- Fixed JSONL mock-store query/update drift exposed by the vertical-slice test.
- Recorded exact real integration blockers for Phoenix, SSH, sudo, and LLM.
- Added submission handoff docs and refreshed active result/limitation docs.

## Current External Blockers

- Phoenix real access needs a real `PHOENIX_API_TOKEN`.
- SSH real validation needs a private key mounted at the configured `SSH_PRIVATE_KEY_PATH`.
- SSH and sudo validation need real VM host/port from Phoenix customer-system data.
- Real LLM validation needs credentials for the selected provider.

## Out Of Scope

- Fully autonomous remediation.
- Multi-tenant auth, RBAC, SSO.
- WebSockets, queues, Redis, background workers, Kubernetes, or microservices.
- RAG/vector database.
- Analytics, charts, or design-system polish beyond the primary flow.
- A generic Linux admin assistant beyond the incident ticket.
- Setting ticket status `DONE` as a scoring gate.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Node 22 + Hono replaced the FastAPI skeleton | Same language across API, agents, safety, and frontend types | Good |
| Mock mode is first-class | Demo and tests must survive missing live credentials | Good |
| Deterministic state machine owns truth | Keeps AI useful without making it dangerous | Good |
| Model proposes; backend executes | Core human-in-the-loop safety invariant | Good |
| SSE instead of WebSockets | One-way event stream matches the product flow | Good |
| SQLite with JSONL fallback | Durable local audit trail without extra services | Good |
| Audit trail is the activity source | Prevents invented actions in Phoenix reports | Good |
| v1.1 and v1.2 rescue milestones were run before feature expansion | Reduced skeleton risk before new product work | Good |

## Next Milestone Candidates

- Real Phoenix, SSH, sudo, and LLM validation after credentials and key material are available.
- Demo recording and external submission execution using `docs/SUBMISSION_HANDOFF.md`.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check: still the right priority?
3. Audit Out of Scope: reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-07 after v1.3 milestone start*
