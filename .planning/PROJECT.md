# Service Desk Autopilot

## Current Milestone: v1.2 Professional Skeleton Rescue Follow-up

**Goal:** Close the remaining skeleton-readiness gaps left after v1.1 by validating the live/demo path, adding evidence-backed vertical-slice confidence, and cleaning planning/docs artifacts without adding new product features.

**Target features:**

- Fresh-clone Docker Compose validation for the current skeleton.
- Browser SSE and primary technician workflow UAT.
- Deterministic vertical-slice coverage for run creation, SSE updates, approval edit/execute, and activity flow.
- Real Phoenix, SSH, and LLM validation where credentials, keys, and practice VMs are available.
- Demo video and external submission handoff readiness.
- Planning and docs cleanup tied back to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`.

## What This Is

A technician-controlled AI troubleshooting copilot for the techbold START Hack Vienna '26 track. It loads Phoenix ERP tickets and customer-system details, lets an AI propose one diagnostic or fix command at a time, requires the technician to approve, edit, or reject every command, executes only through deterministic backend code, records an append-only audit trail, and drafts the Phoenix activity report from that audit trail.

The AI never acts on its own. It proposes structured outputs; the backend owns safety, approval, SSH execution, persistence, event streaming, and Phoenix writes.

## Core Value

Win B+C on the scoring rubric: solve hidden Linux-service incidents on fresh VMs, safely and auditably. The highest-value proof is a real run that restores customer benefit, survives persistence checks, and leaves a complete redacted audit trail.

## Validated in v1.0

- Node 22 + Hono + TypeScript backend with Zod-validated environment configuration.
- React 18 + Vite frontend technician workspace.
- Mock mode for Phoenix, SSH, and LLM paths.
- Typed Phoenix ERP client and in-memory mock.
- Ticket list/detail routes with customer-system data and graceful error handling.
- Deterministic safety layer with blocklist, classifier, redaction, and edited-command recheck.
- Append-only run/audit store with SQLite and JSONL fallback.
- ssh2 single-command executor with timeout, output cap, redaction, mock mode, and preflight behavior.
- Specialist AI roles: problem analyzer, customer-system analyzer, problem solver, validator, and activity log generator.
- Deterministic orchestrator state machine with approval, rejection, blocked-command, validation, and activity handoff paths.
- Run API, approval API, SSE stream, and activity draft/submit routes.
- Frontend ticket list, run view, approval card, audit timeline, retry/abort controls, and activity editor.
- Root `pnpm test`, README, REPORT, and reviewed secret scan.

## Manual Validation Debt

- Fresh-clone `docker compose up --build` check.
- Real Phoenix token validation.
- Real SSH `.pem` validation against practice VMs.
- Real LLM loop validation.
- Browser SSE/UAT pass.
- Demo video recording and external submission form.
- Passwordless `sudo -n true` confirmation for `azureuser`.

## Requirements

Completed in v1.1:

- [x] **EVNT-01**: Standardize backend SSE event names for run lifecycle state transitions.
- [x] **EVNT-02**: Publish event payloads from a single shared contract used by backend and frontend.
- [x] **FEIN-01**: Remove or migrate disconnected frontend app trees not mounted by `frontend/src/main.tsx`.
- [x] **FEIN-02**: Ensure technician workflow rendering uses one runtime path with complete route handling.
- [x] **TOOL-01**: Align package-manager assumptions and lockfile strategy across backend, frontend, and CI.
- [x] **TOOL-02**: Normalize frontend Dockerfile and workspace build assumptions to the repository baseline.
- [x] **TOOL-03**: Add and document monorepo scripts for install, typecheck, test, and build.
- [x] **STOR-01**: Make persistence mode explicit in startup configuration and runtime logs.
- [x] **STOR-02**: Document and enforce fallback semantics when durable persistence is disabled.

Deferred:

- **E2E-01**: Add deterministic vertical-slice coverage for run creation, SSE updates, approval edit/execute, and activity flow.
- **PLAN-01**: Remove stale planning artifacts and regenerate evidence-only docs after milestone close.

Active in v1.2:

- [ ] **LIVE-01**: Operator can run a fresh clone through `docker compose up --build` with documented setup and no hidden manual repair steps.
- [ ] **LIVE-02**: Operator can complete a browser UAT pass for the primary technician run flow with SSE updates visible in the mounted frontend.
- [ ] **E2E-01**: Developer can run deterministic vertical-slice coverage for run creation, SSE updates, approval edit/execute, and activity flow.
- [ ] **REAL-01**: Operator can validate Phoenix, SSH, and LLM paths against real credentials, keys, and practice VMs when those inputs are available.
- [ ] **SUBM-01**: Operator has evidence needed for demo video recording and external submission handoff.
- [ ] **PLAN-01**: Developer can rely on evidence-only planning/docs artifacts that trace unresolved work back to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`.

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
| --- | --- | --- |
| Node 22 + Hono replaced the FastAPI skeleton | Same language across API, agents, safety, and frontend types | Good |
| Mock mode is first-class | Demo and tests must survive missing live credentials | Good |
| Deterministic state machine owns truth | Keeps AI useful without making it dangerous | Good |
| Model proposes; backend executes | Core human-in-the-loop safety invariant | Good |
| SSE instead of WebSockets | One-way event stream matches the product flow | Good |
| SQLite with JSONL fallback | Durable local audit trail without extra services | Good |
| Audit trail is the activity source | Prevents invented actions in Phoenix reports | Good |
| Event and store repair work was completed as a controlled v1.1 objective | Reduced skeleton risk before new feature expansion | Good |

## Evolution

PROJECT.md evolves at phase transitions and milestone boundaries.

### After each phase transition

1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. "What This Is" still accurate? Update if drifted.

### After each milestone

1. Full review of all sections.
2. Core Value check to confirm priority is still right.
3. Audit Out of Scope and keep reasons current.
4. Update context with what changed in usage and validation state.

## Next Milestone Goals

- Complete v1.2 follow-up validation and evidence cleanup before adding new product features.
- Start a new product requirements cycle only after the skeleton is proven clean, connected, buildable, and team-ready.

---
*Last updated: 2026-06-07 after v1.2 milestone start*
