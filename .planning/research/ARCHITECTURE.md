# v1.3 Architecture Research

## Existing Architecture Constraints

- The backend is the product spine: Node 22, Hono, TypeScript, Zod env/config, deterministic orchestrator, safety gate, Phoenix/SSH/LLM clients, run APIs, approval APIs, activity APIs, SSE, and append-only audit storage.
- The human approval invariant must not move into the dashboard or model layer. The model proposes, the backend safety layer classifies, and only the approval route executes SSH after re-checking the final command.
- Current persistence is accessed through `backend/src/store/db.ts`, `runs.ts`, `audit.ts`, and `schema.ts`. v1.3 should replace the adapter and schema implementation behind those modules before route/orchestrator changes.
- SQLite fallback remains useful for tests and mock demos, but main-path product persistence should become Postgres. The JSONL/in-memory fallback should stay test/mock-only unless deliberately removed in a later migration.
- The audit trail is the source of truth for activity reports and SSE backfill. New memory and observability features must reference audit/run IDs, not create a competing event history.
- Current frontend is a single Vite `App.tsx` mounted path. v1.3 can introduce a Next.js dashboard, but it should consume the existing backend API first rather than reimplement backend workflows in Next route handlers.
- Current docs/codebase maps contain some stale Python/FastAPI references. Treat `README.md`, `.planning/PROJECT.md`, and actual `backend/src`/`frontend/src` code as current source of truth.
- Production changes must trace to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`. v1.3 should create phase findings that extend BL-001, BL-002, T-001, D-002, and S-001 instead of bypassing the rescue workflow.

## Proposed Components

### New Components

- `apps/dashboard/` or `dashboard/`: Next.js app router dashboard using shadcn `dashboard-01` as the shell only. Replace sample `data.json`, generic nav, chart labels, and sample cards with project-specific run, ticket, memory, and observability views.
- `dashboard/src/lib/api-client.ts`: typed browser-safe client for the existing Hono API. It should own fetch errors, SSE subscription setup, and response types copied from backend contracts.
- `dashboard/src/app/dashboard/page.tsx`: operational overview with live runs, tickets, approval queue, store status, RAG memory health, and observability status.
- `dashboard/src/app/runs/[runId]/page.tsx`: run detail replacing the current Vite main path over time: timeline, pending approval, command edit/reject/approve, activity draft, and SSE events.
- `dashboard/src/app/memory/page.tsx`: RAG memory surface showing stored fingerprints, accepted solutions, retrieval hits, similarity scores, source run IDs, and last embedding status.
- `backend/src/db/postgres.ts`: Postgres connection pool, transaction helper, health check, and query wrapper. Keep it small and dependency-local.
- `backend/src/db/migrations/`: SQL migrations for core tables, pgvector extension, memory tables, indexes, and constraints.
- `backend/src/store/postgres-adapter.ts`: implementation of the existing `DbAdapter` contract or a narrow replacement store interface. This is the bridge that prevents route/orchestrator rewrites.
- `backend/src/memory/schema.ts`: Zod types for error fingerprints, memory entries, retrieval hits, accepted-solution records, and embedding metadata.
- `backend/src/memory/fingerprint.ts`: deterministic incident fingerprint builder from ticket context, redacted observations, command results, and validation outcome.
- `backend/src/memory/embeddings.ts`: provider-neutral embedding boundary with mock implementation and real provider selected by env. It should not import route code.
- `backend/src/memory/repository.ts`: Postgres/pgvector CRUD and similarity search for memories.
- `backend/src/memory/service.ts`: orchestration boundary for `recordRunMemory`, `retrieveRelevantMemory`, and `acceptSolutionMemory`.
- `backend/src/routes/memory.ts`: read-focused dashboard API for memory entries, retrieval previews, and accepted-solution metadata.
- `backend/src/observability/`: OpenTelemetry bootstrap, correlation ID middleware, structured logger, span helpers, and metric names.
- `backend/src/routes/observability.ts`: lightweight dashboard API for service status, recent pipeline metrics from the store if persisted, and active config with secrets removed.

### Modified Components

- `package.json`, `pnpm-workspace.yaml`: add dashboard workspace and root scripts for dashboard build/typecheck/test.
- `docker-compose.yml`: add Postgres with pgvector, database volume, env wiring, and dashboard service if the Vite frontend is no longer the served UI.
- `.env.example`, `backend/src/env.ts`: add `DATABASE_URL`, `STORE_PROVIDER`, embedding provider/model/dimension config, OpenTelemetry exporter config, and dashboard base URL. Preserve mock defaults.
- `backend/src/store/db.ts`: move from SQLite-first to provider-selected adapter. SQLite can remain mock/test fallback; Postgres becomes default main path when `STORE_PROVIDER=postgres`.
- `backend/src/store/schema.ts`, `runs.ts`, `audit.ts`: keep public function names where possible, but align schema with Postgres migrations and add typed read helpers needed by memory and dashboard.
- `backend/src/app.ts`: mount `memoryRouter`, `observabilityRouter`, and correlation middleware.
- `backend/src/ai/orchestrator.ts`: add two narrow hooks only: retrieve memory before diagnostic/fix agent calls, and record/offer memory after validation/activity completion. Do not change approval/execution sequencing.
- `backend/src/ai/agents/*`: include retrieved memory as additional context in prompts. The memory must be advisory evidence, not authority to skip validation or approval.
- `backend/src/events/sse.ts`, `frontend/src/types.ts` or dashboard equivalent: extend the canonical event list for `memory.retrieved`, `memory.recorded`, `embedding.completed`, and observability-friendly run events.
- `backend/src/routes/health.ts`: report store provider, Postgres connectivity, pgvector availability, embedding provider mode, and telemetry exporter mode.
- `README.md`, `docs/DATA_MODEL.md`, `docs/API.md`: update only after implementation proves the new paths.

## Data Flow

### Dashboard Flow

1. Next.js dashboard loads overview data from existing Hono endpoints: `/health`, `/api/tickets`, `/api/runs/:id`, and new `/api/memory` and `/api/observability` endpoints.
2. Approval actions still call Hono approval routes directly. Next.js does not execute commands or hold Phoenix/SSH/LLM credentials.
3. Run pages subscribe to `/api/runs/:runId/events` over SSE and backfill from the audit timeline exactly as the current Vite app does.
4. Dashboard charts and tables read operational data from backend APIs, not local sample files.

### Postgres Store Flow

1. Backend startup parses `STORE_PROVIDER` and `DATABASE_URL`.
2. Migration step creates core run/audit tables first, then pgvector extension and memory tables.
3. Existing route and orchestrator code continues to call store functions.
4. Store functions call Postgres adapter in main mode, SQLite/jsonl adapter in mock/test mode.
5. `/health` exposes selected store mode and pgvector readiness.

### RAG Memory Flow

1. Run creation seeds Phoenix ticket context as an observation as it does today.
2. Before diagnostic or fix agent dispatch, `memory.service.retrieveRelevantMemory` builds a fingerprint from ticket context plus redacted observations, embeds it, and retrieves top-k similar accepted memories.
3. Retrieved memories are appended to agent prompt context with source run IDs, similarity scores, and accepted-solution status.
4. The orchestrator still proposes one command and waits for human approval.
5. After validation and activity review, `memory.service.recordRunMemory` stores the fingerprint, embedding, summary, root cause, commands, validation result, and source audit IDs.
6. A technician-facing action can mark or unmark a memory as accepted. Accepted memories rank higher, but unaccepted memories remain inspectable for learning.

### Observability Flow

1. Correlation middleware creates or propagates a request/run correlation ID and returns it in response headers.
2. Hono route handlers, store calls, Phoenix calls, SSH execution, LLM calls, embedding calls, RAG retrieval, and activity submission emit spans/metrics using OpenTelemetry APIs.
3. Structured logs include correlation ID, run ID, phase, event type, store provider, and provider mode, with secrets redacted.
4. Vendor-neutral export uses OTLP configuration. Console exporters are acceptable in mock/dev; no vendor SDK should be required.
5. Dashboard observability views read status and recent persisted operational events from backend APIs. They should not scrape stdout.

## Migration Boundaries

- Frontend boundary: introduce Next.js beside the Vite app first. Do not delete Vite until dashboard covers ticket list, run detail, approvals, activity draft/submit, SSE, and tests.
- Store boundary: migrate behind store modules. Routes and orchestrator should not import `pg` or migration code directly.
- Main-path persistence boundary: Postgres becomes product default after migrations and tests pass. SQLite/jsonl remain mock/test paths with explicit health/status labels.
- Memory boundary: RAG reads from redacted observations, command results, activity drafts, and ticket context only. It must not read raw SSH output or secrets.
- Agent boundary: retrieved memory is context, not control flow. It cannot bypass safety checks, human approval, max-step guard, validation, or audit writes.
- Observability boundary: instrumentation must be dependency-light and vendor-neutral. Logs/spans must never include raw command output, tokens, key paths beyond configured file path names, or unredacted env values.
- Dashboard data boundary: Next.js server components may call backend APIs, but should not become a second backend for Phoenix/SSH/LLM/store behavior.
- Migration execution boundary: add repeatable migrations and a clean dev bootstrap before replacing SQLite in Docker Compose.

## Suggested Build Order

1. Create v1.3 defect-map extension entries that reference BL-001, BL-002, T-001, D-002, and S-001 from the v1.1 master map.
2. Add Postgres plus pgvector to Docker Compose, `.env.example`, backend env parsing, and health checks without changing application writes.
3. Add migration tooling and SQL migrations for existing core tables. Verify an empty Postgres can boot and report ready.
4. Implement `postgres-adapter` behind the current store API. Run current backend tests against SQLite/jsonl and Postgres.
5. Switch main-path Docker/dev config to Postgres while preserving mock-mode SQLite/jsonl fallback. Update store status output.
6. Add memory schema, repository, embedding boundary, and mock embeddings. Test deterministic fingerprinting and top-k retrieval without agent changes.
7. Add pgvector indexes after memory table shape stabilizes. Start with cosine HNSW for the selected embedding dimension and add metadata indexes for ticket/status filters.
8. Integrate memory retrieval into orchestrator prompts, then memory recording after validation/activity completion. Verify no approval or safety sequencing changed.
9. Add memory routes and dashboard-ready response types.
10. Add OpenTelemetry bootstrap, correlation middleware, structured logger, and spans around route, store, Phoenix, SSH, LLM, embedding, RAG retrieval, and activity operations.
11. Scaffold Next.js dashboard with shadcn `dashboard-01`. Replace sample data and generic nav immediately with project-specific pages and API calls.
12. Port the existing Vite main workflow into dashboard run pages: tickets, run creation, SSE, approval edit/approve/reject, abort, activity draft, submit.
13. Add dashboard memory and observability pages after backend APIs exist.
14. Run full verification: backend typecheck/tests, dashboard typecheck/build/tests, Docker Compose mock-mode startup, browser UAT through ticket to activity, Postgres persistence restart check, RAG retrieval smoke, and observability export smoke.
15. Retire or keep the Vite app deliberately. If retired, delete it and update root scripts/docs in the same phase.

## Architecture Risks

- Dashboard rewrite risk: replacing Vite too early can recreate B-002/D-001 disconnected frontend problems. Keep both until dashboard proves the full main path.
- Store rewrite risk: changing route/orchestrator code at the same time as replacing SQLite makes regressions hard to isolate. Keep the store API boundary stable through the first Postgres phase.
- JSONL ambiguity risk: fallback semantics are useful in tests but dangerous as product persistence. Health output and env defaults must make store mode obvious.
- pgvector filter risk: approximate vector indexes can return fewer rows after metadata filtering. Use metadata indexes, explicit top-k behavior, and tests for filtered retrieval.
- Embedding dimension drift: changing embedding model dimensions can break vector columns and indexes. Store provider/model/dimension metadata and require a migration for dimension changes.
- Memory authority risk: accepted memories can bias the agent into repeating an old fix. Prompts and tests must preserve diagnostic validation and human approval.
- Observability leakage risk: spans and logs can accidentally capture command output, env values, or tokens. Redaction must be applied before log/span attributes.
- ESM/OpenTelemetry startup risk: instrumentation must load before app code. Node 22 and ESM require careful `--import`/loader wiring in dev, start, Docker, and tests.
- shadcn sample-data risk: `dashboard-01` ships with generic dashboard files and `data.json`. Those must be replaced immediately or moved out of the main path.
- Scope creep risk: auth, RBAC, queues, Redis, and enterprise tracing backends are not required for v1.3. Keep the milestone to product dashboard, Postgres/pgvector memory, and vendor-neutral observability.
