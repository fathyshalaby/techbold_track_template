# v1.2 Product Dashboard, RAG Memory, and Observability

## Goal

Build on the v1.1 professional skeleton and add the first real product foundation:

1. A clean Next.js dashboard UI based on shadcn dashboard-01.
2. A Postgres replacement for SQLite.
3. pgvector-backed RAG memory for error -> solution learning.
4. Observability for the UI, backend, pipeline, RAG retrieval, and database interactions.

This milestone should make the project feel like a real product foundation, not just a working skeleton.

## Non-goals

- Do not rebuild the entire app.
- Do not add unrelated product features.
- Do not over-design a full enterprise platform.
- Do not add observability vendor lock-in.
- Do not create a complex RAG agent framework.
- Do not keep SQLite compatibility unless explicitly required for local dev.
- Do not add UI screens that are not connected to real data or clear placeholders.
- Do not add fake charts, fake metrics, or fake RAG results without clear seed/demo labeling.

## Style Rules

Follow AGENTS.md.

Additional rules:
- No emojis.
- No em dash characters.
- Minimal comments.
- Clean Senior AI/ML Software Engineer style.
- Prefer typed boundaries.
- Prefer simple working pipelines over clever abstractions.
- Every dashboard card should either show real data, seed/demo data clearly marked, or be deferred.
- Every RAG memory table should have a real writer and reader.
- Every observability metric or span should answer a real debugging question.

## Source of Truth

Use these files as context before planning:

- AGENTS.md
- .planning/audits/V1.1-MASTER-DEFECT-MAP.md
- .planning/audits/V1.1-FINAL-SKELETON-READINESS.md if present
- .planning/codebase/
- .planning/graphs/
- package.json
- existing database code
- existing pipeline code
- existing UI or route structure
- README and development docs

## Product Direction

The dashboard should become the operational home for the project.

It should show:
- pipeline runs
- recent errors
- known solutions
- RAG memory entries
- retrieval quality signals
- observability health
- system status
- basic project or run statistics

Use the shadcn dashboard-01 block as the UI starting point, then modify it to match this project. Do not leave generic Acme/demo content in core screens.

## Database Direction

Replace SQLite with Postgres.

Add pgvector so the project can store embeddings alongside relational data.

The migration should include:
- schema for pipeline runs
- schema for errors or incidents
- schema for solutions
- schema for embeddings
- schema for retrieval events
- schema for feedback or accepted fixes
- migrations
- seed data for local development if useful
- connection config
- env example updates
- README setup updates

## RAG Memory Direction

The RAG memory should support this loop:

1. Pipeline sees an error or failure.
2. The system creates a normalized error fingerprint.
3. The system embeds the error context.
4. The system searches similar historical errors in pgvector.
5. The system retrieves candidate solutions.
6. The pipeline uses the candidate solution as context.
7. When a solution is confirmed as correct, the system stores or updates:
   - error fingerprint
   - error context
   - solution text
   - source phase or run
   - embedding
   - outcome
   - confidence or feedback
   - timestamps

The first implementation should be small and reliable:
- embed
- store
- retrieve top-k
- record accepted solution
- display in dashboard

Do not build complex reinforcement learning, ranking models, or autonomous correction loops yet.

## Observability Direction

Add a minimal vendor-neutral observability baseline.

Use OpenTelemetry concepts:
- traces for pipeline runs
- spans for RAG retrieval
- spans for embedding calls
- spans or metrics for database operations
- metrics for retrieval hit rate
- metrics for solution acceptance
- metrics for pipeline success and failure
- structured logs with correlation IDs

Local stack can be one of:
- OpenTelemetry Collector plus Grafana stack
- OpenTelemetry Collector plus simple console/exporter mode for local dev
- existing project-compatible observability backend

Prefer the smallest setup that lets developers debug:
- why a pipeline run failed
- whether RAG retrieval found a useful solution
- whether embeddings were stored
- whether Postgres is healthy
- whether the dashboard is reading live data

## Required Phases

Phase 1:
Architecture and migration design for dashboard, Postgres, pgvector, RAG memory, and observability.

Phase 2:
Next.js dashboard foundation using shadcn dashboard-01, modified to project-specific routes, layout, navigation, and data contracts.

Phase 3:
Postgres and pgvector migration, replacing SQLite paths with typed database access and migrations.

Phase 4:
RAG memory pipeline for error -> solution embedding, storage, retrieval, and accepted-solution updates.

Phase 5:
Observability baseline with tracing, metrics, structured logs, correlation IDs, and local dev visibility.

Phase 6:
Integration pass connecting dashboard to pipeline, database, RAG memory, and observability data.

Phase 7:
Verification, smoke tests, docs, seed data, and team handoff.

## Definition of Done

- Dashboard route works locally.
- shadcn dashboard-01 has been modified into project-specific UI.
- Generic demo content is removed or clearly marked as seed/demo content.
- SQLite is no longer used on the main path.
- Postgres setup works from README instructions.
- pgvector extension is enabled and used.
- RAG memory can store an error and solution embedding.
- RAG memory can retrieve similar historical errors.
- Accepted solutions are persisted.
- Dashboard can show recent runs, errors, and solution memory.
- Observability captures at least pipeline run traces, RAG retrieval spans, database timing, and structured logs.
- Local dev setup is documented.
- Tests or smoke checks prove the main flow works.
- No fake tests.
- No disconnected dashboard components.
- No empty core files.
- No unexplained placeholder services.
