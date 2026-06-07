# Service Desk Autopilot

## Current Milestone: v1.1 Professional Skeleton Rescue

**Goal:** Make the existing skeleton clean, connected, and buildable by removing contract drift, deleting or wiring duplicate UI surfaces, and aligning tooling baselines.

**Target features:**

- Restore deterministic end-to-end event contracts between backend run events and frontend SSE consumers.
- Consolidate frontend execution into a single mounted path and remove duplicate surface trees.
- Normalize package manager, Docker, and CI behavior across backend and frontend.

**Current focus:** Defining requirements and creating a phase roadmap for the v1.1 skeleton rescue milestone.

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

## Active Requirements

- [ ] **EVNT-01**: Canonicalize SSE event names and payload shapes across backend and frontend.
- [ ] **EVNT-02**: Implement a shared event contract for run, approval, validation, and activity state updates.
- [ ] **FEIN-01**: Remove or migrate disconnected frontend surfaces into the mounted App flow.
- [ ] **FEIN-02**: Ensure the runtime entry path exposes the full technician flow with no dead feature branches.
- [ ] **TOOL-01**: Align package-manager assumptions and lockfile strategy across backend, frontend, and CI.
- [ ] **TOOL-02**: Normalize Docker scripts and image builds for deterministic frontend + backend setup.
- [ ] **TOOL-03**: Add deterministic monorepo scripts for install, lint, test, and build.
- [ ] **STOR-01**: Make persistence mode selection explicit at startup.
- [ ] **STOR-02**: Define documented fallback behavior when durable persistence is unavailable.

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
| Event and store repair work is now a controlled v1.1 objective | Current progress shows risk concentration outside the happy path | Pending |

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

- v1.1 Professional Skeleton Rescue is now active and focused on skeleton rescue completion.
- After v1.1, start manual live validation milestones once the core contract and tooling baseline are clean.

---
*Last updated: 2026-06-07 after v1.1 milestone start*
