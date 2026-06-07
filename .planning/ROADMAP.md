# Roadmap: Service Desk Autopilot

## Milestones

- [x] **v1.0 milestone** - Service Desk Autopilot hackathon submission slice (shipped 2026-06-07)
  - Archive: `.planning/milestones/v1.0-ROADMAP.md`
- [x] **v1.1 Professional Skeleton Rescue** - skeleton rescue and buildability (shipped 2026-06-07)
  - Archive: `.planning/milestones/v1.1-ROADMAP.md`
- [x] **v1.2 Professional Skeleton Rescue Follow-up** - live validation, vertical-slice evidence, and submission handoff readiness (shipped 2026-06-07)
  - Archive: `.planning/milestones/v1.2-ROADMAP.md`

## Active Milestone: v1.3 Product Dashboard, RAG Memory, and Observability

Phase numbering is reset for this milestone.

- [ ] **Phase 1: Dashboard Ownership and Data Contract**
- [ ] **Phase 2: Postgres Store Foundation**
- [ ] **Phase 3: pgvector Retrieval Contract**
- [ ] **Phase 4: RAG Memory Loop**
- [ ] **Phase 5: Observability Baseline**
- [ ] **Phase 6: End-to-End v1.3 Integration and Handoff**

| # | Phase | Goal | Requirements | Success Criteria |
|---|---|---|---|---|
| 01 | Dashboard Ownership and Data Contract | Establish the Next.js dashboard as the primary operational UI path and bind every dashboard surface to real backend data or a documented ownership decision. | DASH-01, DASH-02, DASH-03, DASH-04 | 4 criteria |
| 02 | Postgres Store Foundation | Move the main persistence path to Postgres with pgvector-ready local infrastructure, migrations, typed store boundaries, restart durability, and safe health reporting. | PG-01, PG-02, PG-03, PG-04, PG-05 | 5 criteria |
| 03 | pgvector Retrieval Contract | Define and verify the redacted embedding and top-k retrieval contract, including source references and technician-visible retrieval evidence. | VEC-01, VEC-02, VEC-03, VEC-04 | 4 criteria |
| 04 | RAG Memory Loop | Integrate accepted memory into the proposal flow as advisory context while preserving safety, approval, validation, and audit invariants. | MEM-01, MEM-02, MEM-03, MEM-04, MEM-05 | 5 criteria |
| 05 | Observability Baseline | Add correlation, structured logs, OpenTelemetry coverage, vendor-neutral export, and dashboard-readable operational status for the main flow. | OBS-01, OBS-02, OBS-03, OBS-04, OBS-05 | 5 criteria |
| 06 | End-to-End v1.3 Integration and Handoff | Prove the full v1.3 mock-mode product path from dashboard through persisted memory and observability, then update handoff documentation. | INT-01, INT-02, INT-03, INT-04 | 4 criteria |

## Phase Details

### Phase 1: Dashboard Ownership and Data Contract

Goal: Establish the Next.js dashboard as the primary operational UI path and bind every dashboard surface to real backend data or a documented ownership decision.

Requirements: DASH-01, DASH-02, DASH-03, DASH-04

Success criteria:
1. The Next.js dashboard presents tickets, runs, approvals, audit evidence, activity state, memory visibility, and observability status through project-specific operational views.
2. Dashboard data comes from backend APIs and durable state, with no shadcn sample records, local-only constants, fake metrics, or inert main-path controls.
3. Dashboard navigation into the run workflow preserves existing safety, approval, SSE, audit, and activity behavior.
4. The Vite frontend path has a documented ownership decision: replaced, temporarily retained with retirement criteria, or moved out of the main path.

### Phase 2: Postgres Store Foundation

Goal: Move the main persistence path to Postgres with pgvector-ready local infrastructure, migrations, typed store boundaries, restart durability, and safe health reporting.

Requirements: PG-01, PG-02, PG-03, PG-04, PG-05

Success criteria:
1. Documented local commands and environment configuration start Postgres with pgvector enabled.
2. Explicit migrations create schemas for runs, approvals, audit events, activity drafts, incidents or errors, solutions, embeddings, retrieval events, feedback, and observability-linked metadata.
3. Backend routes and orchestrator code persist through typed store boundaries without direct database-driver imports.
4. Run and audit data survive backend restart on the Postgres-backed main path.
5. Health output reports Postgres and pgvector readiness without credentials or sensitive connection details.

### Phase 3: pgvector Retrieval Contract

Goal: Define and verify the redacted embedding and top-k retrieval contract, including source references and technician-visible retrieval evidence.

Requirements: VEC-01, VEC-02, VEC-03, VEC-04

Success criteria:
1. Redacted error embeddings are stored with provider, model, dimensions, source audit IDs, and timestamps.
2. Top-k pgvector retrieval returns deterministic ordering, similarity scores, and source references for similar historical errors.
3. Deterministic retrieval checks prove vector insertion, dimension handling, indexing assumptions, and top-k query behavior.
4. Dashboard retrieval evidence shows source, similarity, outcome, and accepted-solution status as advisory context.

### Phase 4: RAG Memory Loop

Goal: Integrate accepted memory into the proposal flow as advisory context while preserving safety, approval, validation, and audit invariants.

Requirements: MEM-01, MEM-02, MEM-03, MEM-04, MEM-05

Success criteria:
1. Backend creates deterministic redacted error fingerprints from pipeline failure context, command output, ticket context, and audit evidence.
2. Accepted memory is retrieved before proposal generation and passed only as advisory context to the existing AI proposal path.
3. Solved memory is persisted only after technician approval, command execution, validation evidence, and activity or audit confirmation show acceptance.
4. Failed, rejected, unsafe, or unverified attempts are recorded as attempts or feedback without promotion to solved memory.
5. Retrieved memory cannot bypass output parsing, deterministic safety classification, edited-command recheck, technician approval, SSH execution rules, validation, or audit writes.

### Phase 5: Observability Baseline

Goal: Add correlation, structured logs, OpenTelemetry coverage, vendor-neutral export, and dashboard-readable operational status for the main flow.

Requirements: OBS-01, OBS-02, OBS-03, OBS-04, OBS-05

Success criteria:
1. Correlation IDs propagate across route handling, run transitions, SSE, approvals, SSH execution, model calls, embeddings, retrieval, database operations, and activity submission.
2. Structured logs include typed fields, redaction, correlation IDs, run IDs, ticket IDs, and main-flow error context.
3. OpenTelemetry spans cover route handling, store operations, model calls, embedding calls, retrieval, SSH execution, SSE streaming, approvals, and activity submission.
4. Local observability export works through OTLP or console-compatible configuration without requiring a SaaS vendor.
5. Dashboard observability status and recent operational signals come from real backend state or clearly labeled seed data.

### Phase 6: End-to-End v1.3 Integration and Handoff

Goal: Prove the full v1.3 mock-mode product path from dashboard through persisted memory and observability, then update handoff documentation.

Requirements: INT-01, INT-02, INT-03, INT-04

Success criteria:
1. A deterministic v1.3 smoke path runs from dashboard ticket selection through run creation, memory retrieval, approved command, activity submission, persisted data, and observable traces.
2. Local seed data covers dashboard views, Postgres, pgvector, memory, retrieval events, and observability checks without presenting seed data as live production data.
3. Verification covers dashboard-to-backend contracts, Postgres migrations, pgvector insert/query behavior, memory acceptance rules, observability redaction and correlation, and the main mock-mode flow.
4. Documentation explains local setup, migrations, seed data, dashboard usage, RAG memory behavior, observability usage, verified mock-mode evidence, and remaining live Phoenix, SSH, sudo, and LLM blockers.

## Traceability Update Rule

After each phase, update `.planning/REQUIREMENTS.md` traceability statuses.

- v1.3 requirements mapped: 27/27
- Unmapped: 0

---
*Roadmap created for v1.3 on 2026-06-07*
