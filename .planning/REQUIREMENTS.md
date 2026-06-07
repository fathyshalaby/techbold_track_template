# Requirements: Service Desk Autopilot v1.3

**Defined:** 2026-06-07
**Core Value:** Win B+C on the scoring rubric: solve hidden Linux-service incidents on fresh VMs, safely and auditably.

## v1.3 Requirements

Requirements for Product Dashboard, RAG Memory, and Observability. Each requirement maps to exactly one roadmap phase.

### Dashboard

- [ ] **DASH-01**: Technician can use a Next.js dashboard as the primary operational UI for tickets, runs, approvals, audit evidence, activity state, memory visibility, and observability status.
- [ ] **DASH-02**: Technician can view dashboard data loaded from backend APIs and durable state without shadcn sample records, local-only constants, or fake operational metrics on the main path.
- [ ] **DASH-03**: Technician can navigate from dashboard summaries into the existing run workflow without bypassing safety, approval, SSE, audit, or activity behavior.
- [ ] **DASH-04**: Maintainer can see a documented ownership decision for the previous Vite frontend path: replaced, retained temporarily with a retirement plan, or explicitly moved out of the main path.

### Postgres Store

- [ ] **PG-01**: Developer can start local Postgres with pgvector through documented project commands and environment configuration.
- [ ] **PG-02**: Developer can run explicit migrations that create schemas for runs, approvals, audit events, activity drafts, incidents or errors, solutions, embeddings, retrieval events, feedback, and observability-linked metadata.
- [ ] **PG-03**: Backend uses Postgres as the main persistence path through typed store boundaries instead of direct route or orchestrator imports of database driver code.
- [ ] **PG-04**: Developer can verify run and audit persistence across backend restart using Postgres-backed storage.
- [ ] **PG-05**: Health output reports Postgres and pgvector readiness without leaking credentials or sensitive connection details.

### Vector Retrieval

- [ ] **VEC-01**: Backend can store redacted error embeddings with configured provider, model, dimensions, source audit IDs, and timestamps.
- [ ] **VEC-02**: Backend can retrieve top-k similar historical errors through pgvector with deterministic ordering, similarity scores, and source references.
- [ ] **VEC-03**: Developer can run deterministic retrieval checks that prove vector insertion, dimension handling, indexing assumptions, and top-k query behavior.
- [ ] **VEC-04**: Dashboard can show retrieval evidence as advisory context, including source, similarity, outcome, and whether the solution was accepted.

### RAG Memory

- [ ] **MEM-01**: Backend can create a deterministic redacted error fingerprint from pipeline failure context, command output, ticket context, and audit evidence.
- [ ] **MEM-02**: Backend retrieves accepted memory before proposal generation and passes it only as advisory context to the existing AI proposal path.
- [ ] **MEM-03**: Backend records solved memory only after technician approval, command execution, validation evidence, and activity or audit confirmation show the solution was accepted.
- [ ] **MEM-04**: Backend records failed, rejected, unsafe, or unverified attempts as attempts or feedback without promoting them to solved memory.
- [ ] **MEM-05**: Retrieved memory cannot bypass model output parsing, deterministic safety classification, edited-command recheck, technician approval, SSH execution rules, validation, or audit writes.

### Observability

- [ ] **OBS-01**: Backend assigns and propagates correlation IDs across route handling, run state transitions, SSE events, approvals, SSH execution, model calls, embeddings, retrieval, database operations, and activity submission.
- [ ] **OBS-02**: Backend emits structured logs with typed fields, redaction, correlation IDs, run IDs, ticket IDs, and error context needed to debug the main flow.
- [ ] **OBS-03**: Backend emits OpenTelemetry spans for route handling, store operations, model calls, embedding calls, retrieval, SSH execution, SSE streaming, approvals, and activity submission.
- [ ] **OBS-04**: Backend exposes vendor-neutral local observability configuration through OTLP or console-compatible export without requiring a SaaS vendor.
- [ ] **OBS-05**: Dashboard can show observability health and recent operational signals from real backend state or clearly labeled seed data.

### Integration And Handoff

- [ ] **INT-01**: Developer can run a deterministic v1.3 smoke path from dashboard ticket selection through run creation, memory retrieval, approved command, activity submission, persisted data, and observable traces.
- [ ] **INT-02**: Developer can seed local data for dashboard, Postgres, pgvector, memory, retrieval events, and observability checks without disguising seed data as live production data.
- [ ] **INT-03**: Tests or smoke checks cover dashboard-to-backend contracts, Postgres migrations, pgvector insert/query behavior, memory acceptance rules, observability redaction and correlation, and the main mock-mode flow.
- [ ] **INT-04**: Documentation explains local setup, migration commands, seed data, dashboard usage, RAG memory behavior, observability usage, verified mock-mode evidence, and remaining live Phoenix, SSH, sudo, and LLM blockers.

## Future Requirements

Deferred to future milestones. Tracked but not in the current roadmap.

### Live Integration

- **LIVE-01**: Technician can validate the full flow against real Phoenix, SSH, sudo, and LLM credentials after those external inputs are available.
- **LIVE-02**: Maintainer can record and submit external demo evidence using credentialed practice VM runs.

### Product Expansion

- **PROD-01**: Team can add auth, RBAC, multi-tenant controls, and richer analytics after the operational product foundation is verified.
- **PROD-02**: Team can add advanced memory ranking, reinforcement learning, or autonomous remediation only after accepted-memory safety behavior is proven.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---|---|
| Fully autonomous remediation | Violates the human-in-the-loop safety invariant and scoring priority. |
| Generic document RAG | v1.3 memory is scoped to error-to-solution learning from accepted outcomes. |
| Separate vector database | pgvector in Postgres is sufficient for v1.3 and avoids duplicate storage. |
| LangChain or broad agent framework migration | Adds framework surface without solving the narrow memory requirement. |
| SaaS-specific observability vendor lock-in | The milestone requires vendor-neutral local observability. |
| Queues, Redis, Kubernetes, or microservices | Not required for the local deterministic product foundation. |
| Fake dashboard metrics or decorative charts | Dashboard surfaces must use real backend data or clearly labeled seed data. |
| Claiming live Phoenix, SSH, sudo, or LLM validation | Those paths remain externally blocked until credentials and VM details exist. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|---|---|---|
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |
| PG-01 | TBD | Pending |
| PG-02 | TBD | Pending |
| PG-03 | TBD | Pending |
| PG-04 | TBD | Pending |
| PG-05 | TBD | Pending |
| VEC-01 | TBD | Pending |
| VEC-02 | TBD | Pending |
| VEC-03 | TBD | Pending |
| VEC-04 | TBD | Pending |
| MEM-01 | TBD | Pending |
| MEM-02 | TBD | Pending |
| MEM-03 | TBD | Pending |
| MEM-04 | TBD | Pending |
| MEM-05 | TBD | Pending |
| OBS-01 | TBD | Pending |
| OBS-02 | TBD | Pending |
| OBS-03 | TBD | Pending |
| OBS-04 | TBD | Pending |
| OBS-05 | TBD | Pending |
| INT-01 | TBD | Pending |
| INT-02 | TBD | Pending |
| INT-03 | TBD | Pending |
| INT-04 | TBD | Pending |

**Coverage:**

- v1.3 requirements: 27 total
- Mapped to phases: 0
- Unmapped: 27

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after initial definition*
