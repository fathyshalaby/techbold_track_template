# Requirements: Service Desk Autopilot

**Defined:** 2026-06-07
**Milestone:** v1.2 Professional Skeleton Rescue Follow-up
**Core Value:** Win B+C on the scoring rubric: solve hidden Linux-service incidents on fresh VMs, safely and auditably.

## v1.2 Requirements

Requirements for the current follow-up milestone. Each maps to one roadmap phase.

### Live Validation

- [ ] **LIVE-01**: Operator can run a fresh clone through `docker compose up --build` without hidden manual repair steps.
- [ ] **LIVE-02**: Operator can follow documented setup commands that match the actual package, Docker, and environment baseline.

### Browser Workflow

- [ ] **UAT-01**: Operator can complete a browser UAT pass for the primary technician ticket, run, approval, audit, and activity flow.
- [ ] **UAT-02**: Operator can observe backend SSE lifecycle updates in the mounted frontend without manual refresh.

### Vertical-Slice Coverage

- [x] **E2E-01**: Developer can run deterministic vertical-slice coverage for run creation, SSE updates, approval edit/execute, and activity flow.

### Real Integrations

- [ ] **REAL-01**: Operator can validate Phoenix API access with real credentials or record the exact blocker.
- [ ] **REAL-02**: Operator can validate SSH `.pem` access and passwordless `sudo -n true` against a practice VM or record the exact blocker.
- [ ] **REAL-03**: Operator can validate the real LLM orchestrator loop or record the exact blocker.

### Submission Handoff

- [ ] **SUBM-01**: Operator has a demo-video checklist and external submission handoff notes grounded in verified behavior.

### Planning Hygiene

- [x] **PLAN-01**: Developer can trace every v1.2 production change back to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`.
- [ ] **PLAN-02**: Developer can rely on planning/docs artifacts that distinguish completed evidence, deferred work, and blocked manual validation.

## Future Requirements

Deferred to future releases. Tracked but not in the current roadmap.

### Product Expansion

- **HCR-01..06**: Human-control extensions.
- **BOOST-01..06**: UX and safety boosters.

### Architecture and Operations

- **STORE-FUTURE-01**: Durable store selection, migration guidance, and production persistence policy.
- **GRAPH-FUTURE-01**: Automated planning graph refresh or drift check.

## Out of Scope

Explicit exclusions for this milestone.

| Feature | Reason |
|---------|--------|
| New product features | v1.2 is a rescue follow-up focused on proof, validation, and evidence cleanup. |
| Enterprise hardening | Auth, RBAC, SSO, queues, Redis, Kubernetes, and multi-tenant controls do not support the current scoring path. |
| Fully autonomous remediation | The project invariant remains human approval before command execution. |
| Generic Linux admin assistant | The product remains focused on the incident ticket and service-restoration workflow. |
| Speculative architecture rewrites | The goal is a clean skeleton foundation, not a broad redesign. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LIVE-01 | Phase 1 | Complete |
| LIVE-02 | Phase 1 | Complete |
| UAT-01 | Phase 2 | Complete |
| UAT-02 | Phase 2 | Complete |
| E2E-01 | Phase 3 | Complete |
| REAL-01 | Phase 4 | Pending |
| REAL-02 | Phase 4 | Pending |
| REAL-03 | Phase 4 | Pending |
| SUBM-01 | Phase 5 | Pending |
| PLAN-01 | Phase 3 | Complete |
| PLAN-02 | Phase 5 | Pending |

**Coverage:**
- v1.2 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after v1.2 roadmap creation*
