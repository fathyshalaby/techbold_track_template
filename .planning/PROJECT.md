# Service Desk Autopilot

## Current State

**Shipped:** v1.0 milestone on 2026-06-07
**Archive:** `.planning/milestones/v1.0-ROADMAP.md`
**Audit:** `.planning/milestones/v1.0-MILESTONE-AUDIT.md`
**Status:** Built and verified in automated/mock mode; manual live validation remains.

## What This Is

A technician-controlled AI troubleshooting copilot for the techbold START Hack Vienna '26 track. It loads Phoenix ERP tickets and customer-system details, lets an AI propose one diagnostic or fix command at a time, requires the technician to approve, edit, or reject every command, executes only through deterministic backend code, records an append-only audit trail, and drafts the Phoenix activity report from that audit trail.

The AI never acts on its own. It proposes structured outputs; the backend owns safety, approval, SSH execution, persistence, event streaming, and Phoenix writes.

## Core Value

Win B+C on the scoring rubric: solve hidden Linux-service incidents on fresh VMs, safely and auditably. The highest-value proof is a real run that restores customer benefit, survives persistence checks, and leaves a complete redacted audit trail.

## Validated In v1.0

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
- Root `pnpm test`, README, MIT license, REPORT.md, and reviewed secret scan.

## Manual Validation Debt

These items were accepted at milestone close and are tracked in the milestone audit:

- Fresh-clone `docker compose up --build` check.
- Real Phoenix token validation.
- Real SSH `.pem` validation against practice VMs.
- Real LLM loop validation.
- Browser SSE/UAT pass.
- Demo video recording and external submission form.
- Passwordless `sudo -n true` confirmation for `azureuser`.

## Out Of Scope

- Fully autonomous remediation.
- Multi-tenant auth, RBAC, SSO.
- WebSockets, queues, Redis, background workers, Kubernetes, or microservices.
- RAG/vector database.
- Analytics, charts, theming, or design-system polish beyond the demo path.
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

## Next Milestone Goals

No active next milestone is defined. If work continues, start with `$gsd-new-milestone` and decide whether the next slice is live validation hardening, browser E2E coverage, or v2 human-control boosters.

---
*Last updated: 2026-06-07 after v1.0 milestone completion*

