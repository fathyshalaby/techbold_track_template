# Milestones

## v1.2 Professional Skeleton Rescue Follow-up (Shipped: 2026-06-07)

**Phases completed:** 5 phases, 5 plans

**Archive:**

- Roadmap: `.planning/milestones/v1.2-ROADMAP.md`
- Requirements: `.planning/milestones/v1.2-REQUIREMENTS.md`
- Audit: `.planning/milestones/v1.2-MILESTONE-AUDIT.md`
- Phase artifacts: `.planning/milestones/v1.2-phases/`

**Key accomplishments:**

- Proved fresh-clone Docker Compose startup in mock mode.
- Completed browser UAT and SSE lifecycle validation in mock mode.
- Added deterministic vertical-slice coverage for run creation, SSE, approval edit/execute, validation, and activity submission.
- Fixed JSONL mock-store query/update drift exposed by vertical-slice coverage.
- Recorded exact real integration blockers for Phoenix, SSH, sudo, and LLM.
- Packaged current results, limitations, and submission handoff docs.

**Audit status:** passed

Known external blockers at close: real Phoenix token, SSH key and VM target, passwordless sudo confirmation, and real LLM credentials.

---

## v1.1 (Shipped: 2026-06-07)

**Phases completed:** 8 phases, 8 plans, 0 tasks

**Key accomplishments:**

- Repaired backend/frontend SSE event contracts and canonical event names.
- Deleted the disconnected frontend surface so `frontend/src/App.tsx` is the only runtime UI path.
- Aligned package manager, root scripts, CI checks, frontend Docker build, and lockfile ownership on pnpm.
- Exposed store durability through startup logs and `/health`.
- Updated README, infrastructure docs, requirements traceability, and phase artifacts.

**Audit status:** passed

---

## v1.0 milestone (Shipped: 2026-06-07)

**Phases completed:** 9 phases, 35 plans

**Archive:**

- Roadmap: `.planning/milestones/v1.0-ROADMAP.md`
- Requirements: `.planning/milestones/v1.0-REQUIREMENTS.md`
- Audit: `.planning/milestones/v1.0-MILESTONE-AUDIT.md`
- Phase artifacts: `.planning/milestones/v1.0-phases/`

**Key accomplishments:**

- Migrated the starter skeleton into a Node 22 + Hono + TypeScript backend and React/Vite frontend.
- Implemented Phoenix ERP client, ticket routes, customer-system loading, and offline fixtures.
- Built deterministic safety, redaction, run store, append-only audit, SSH executor, and mock SSH.
- Implemented specialist AI roles and a deterministic orchestrator with approval/rejection/control paths.
- Added run, approval, SSE, and activity APIs plus the technician frontend workflow.
- Closed submission polish with root tests, README, REPORT.md, MIT license, and reviewed secret scan.

**Audit status:** tech_debt

Manual validation debt was accepted at close: live Phoenix/SSH/LLM validation, browser SSE/UAT, fresh-clone Docker check, demo video, and external submission form.

---
