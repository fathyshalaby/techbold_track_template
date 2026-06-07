# v1.3 Stack Research

Research date: 2026-06-07

Scope: stack additions for the v1.3 product dashboard, Postgres main path, pgvector RAG memory, and vendor-neutral observability. This is report-only research; production changes still need to trace back to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`.

## Recommended Stack Additions

### Next.js + shadcn dashboard

- Add a Next.js dashboard app only if it becomes the single mounted product dashboard path by the end of v1.3. Do not leave both the Vite app and a Next app as competing primary UIs.
- Recommended pin: `next@15.5.19` with existing `react@18.3.1` and `react-dom@18.3.1` for the lowest-risk milestone path.
- Latest checked: `next@16.2.7`, `react@19.2.7`, `react-dom@19.2.7`. Next 16 is viable for a fresh app, but it adds React 19.2, cache, routing, compiler, and migration surface that is not required for v1.3.
- Add `shadcn@4.10.0` as a generator/dev workflow, not as runtime product logic. Use dashboard-01 as a starting layout, then replace all sample content with service-desk operational data.
- Runtime UI dependencies expected from shadcn/dashboard work:
  - `tailwindcss@4.3.0`, `@tailwindcss/postcss@4.3.0`, `tw-animate-css@1.4.0`
  - `lucide-react@1.17.0`
  - `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.6.0`
  - Radix primitives as used by real components, for example `@radix-ui/react-slot@1.2.5`, `@radix-ui/react-dialog@1.1.16`, `@radix-ui/react-dropdown-menu@2.1.17`, `@radix-ui/react-tabs@1.1.14`, `@radix-ui/react-tooltip@1.2.9`
  - Dashboard data UI: `@tanstack/react-table@8.21.3`, `recharts@3.8.1`
- Add `@tanstack/react-query@5.101.0` if the dashboard keeps client-side polling/SSE hydration. If the Next dashboard proxies through server components only, keep API fetching simple and skip React Query until repeated cache invalidation appears.

Why: v1.3 needs an operational dashboard with sidebar, tables, charts, run detail, approvals, activity, RAG memory, and observability views. shadcn gives component source that can be owned and simplified instead of a black-box UI kit.

### Postgres main path

- Add Postgres as the durable store replacing SQLite on the main path.
- Recommended DB version: PostgreSQL 18.x for new development. Latest stable checked from postgresql.org: `18.4`; PostgreSQL 19 is beta and should stay out of v1.3.
- Add `pg@8.21.0` and `@types/pg@8.20.0`.
- Add `drizzle-orm@0.45.2` and `drizzle-kit@0.31.10` for typed schema and migrations.
- Keep one database access layer under `backend/src/store/`. Do not add a parallel repository/service layer for RAG.
- Add `DATABASE_URL`, migration scripts, and a compose Postgres service with a persistent volume.
- Retire `better-sqlite3` from production/main-path storage once Postgres migrations cover runs, approvals, audit events, activity drafts, and observations. It may remain only for a clearly named legacy migration/export helper or be deleted.

Why: the existing append-only run and audit store already has clear ownership. Postgres should strengthen that same store, not create a second persistence model.

### pgvector RAG memory

- Enable the Postgres `vector` extension through the first database migration: `CREATE EXTENSION IF NOT EXISTS vector`.
- Use pgvector extension `0.8.2` where available. Treat hosted/image availability as an environment pin because extension packaging can lag behind Postgres minor releases.
- Add `pgvector@0.3.0` for JavaScript vector serialization/type registration if direct `pg` queries need it. If Drizzle vector column support covers all inserts and queries cleanly, keep `pgvector` out.
- Reuse the existing Vercel AI SDK stack for embeddings where possible. Current lockfile has `ai@4.3.19` and `@ai-sdk/openai@1.3.24`; do not add LangChain just to call embeddings.
- Add config for embedding provider/model and dimension. Suggested default shape: `EMBEDDING_PROVIDER=openai`, `EMBEDDING_MODEL=text-embedding-3-small`, `EMBEDDING_DIMENSIONS=1536`, with startup validation that the DB vector dimension matches the configured model.
- Add tables for error fingerprints, accepted solutions, embedding records, retrieval hits, and feedback/acceptance events in the same Postgres schema as runs.

Why: v1.3 memory is error-to-solution learning tied to technician-accepted outcomes. pgvector keeps retrieval close to the audit/run data and avoids a separate vector database for a small product foundation.

### Vendor-neutral observability

- Add OpenTelemetry for traces and metrics:
  - `@opentelemetry/api@1.9.1`
  - `@opentelemetry/sdk-node@0.218.0`
  - `@opentelemetry/auto-instrumentations-node@0.76.0`
  - `@opentelemetry/exporter-trace-otlp-http@0.218.0`
  - `@opentelemetry/exporter-metrics-otlp-http@0.218.0`
  - `@opentelemetry/instrumentation-http@0.218.0`
  - `@opentelemetry/instrumentation-pg@0.70.0`
  - `@opentelemetry/semantic-conventions@1.41.1`
- Optional Hono middleware: `@hono/otel@1.1.2`. Use it only if it fits the existing Hono route structure. Otherwise keep Node HTTP auto-instrumentation plus explicit spans.
- Add `pino@10.3.1` for structured logs. Use Node `AsyncLocalStorage` for correlation/run/request context rather than adding another context package.
- Emit explicit spans/metrics for pipeline advance, safety decisions, approval handling, SSH execution, embedding calls, RAG retrieval, DB migrations/queries, Phoenix calls, and activity submission.
- Add OTLP env vars only: `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`. Keep vendor SDKs out.

Why: the milestone asks for observability without vendor lock-in. OTLP plus structured logs gives enough traceability for run debugging, RAG quality, and DB performance without introducing an APM-specific dependency.

## Existing Stack Impact

- Root workspace must include any new dashboard package, for example `dashboard`, or deliberately replace `frontend`. Current `pnpm-workspace.yaml` includes only `backend` and `frontend`.
- Root scripts must include dashboard build/typecheck/test once the dashboard is on the main path.
- Backend remains Node 22 + Hono + TypeScript. No framework change is needed for v1.3 backend work.
- Existing backend store modules should be migrated rather than bypassed:
  - `backend/src/store/db.ts`
  - `backend/src/store/schema.ts`
  - `backend/src/store/runs.ts`
  - `backend/src/store/audit.ts`
- Existing SSE APIs remain useful for live run state. Next should consume or proxy the same backend API; do not replace SSE with WebSockets.
- Existing mock Phoenix, SSH, and LLM paths should stay. Add deterministic Postgres/RAG seed data so the dashboard can run offline in mock mode.
- `.planning/codebase/STACK.md` is stale and still describes the old Python/FastAPI skeleton. Treat `README.md`, `.planning/PROJECT.md`, package files, and `.planning/codebase/ARCHITECTURE.md` as the current stack evidence.

## Version Notes

Installed versions from `pnpm-lock.yaml`:

| Area | Installed |
|---|---|
| Backend framework | `hono@4.12.23`, `@hono/node-server@1.19.14` |
| AI SDK | `ai@4.3.19`, `@ai-sdk/openai@1.3.24` |
| Current DB | `better-sqlite3@11.10.0` |
| Frontend | `react@18.3.1`, `react-dom@18.3.1`, `vite@5.4.21` |
| TypeScript | `typescript@5.9.3` resolved in lockfile |
| Test | backend `vitest@3.2.6`, frontend `vitest@4.1.8` |

Registry versions checked on 2026-06-07:

| Package | Current checked version | Recommendation |
|---|---:|---|
| `next` | `16.2.7` | Prefer `15.5.19` for React 18 compatibility and lower migration risk |
| `shadcn` | `4.10.0` | Use generator/source workflow |
| `tailwindcss` | `4.3.0` | Use for shadcn dashboard |
| `drizzle-orm` | `0.45.2` | Use |
| `drizzle-kit` | `0.31.10` | Use |
| `pg` | `8.21.0` | Use |
| `pgvector` JS | `0.3.0` | Use only if needed for vector encoding |
| `@opentelemetry/sdk-node` | `0.218.0` | Use |
| `@opentelemetry/auto-instrumentations-node` | `0.76.0` | Use |
| `@hono/otel` | `1.1.2` | Optional |
| `pino` | `10.3.1` | Use |

External version checks:

- PostgreSQL official site listed stable releases `18.4`, `17.10`, `16.14`, `15.18`, and `14.23` on 2026-06-04, plus PostgreSQL 19 beta. Use stable PostgreSQL, not beta.
- pgvector latest stable found: `0.8.2`.
- Next.js 16 docs identify React 19.2, compiler, and caching changes as part of the v16 upgrade surface. That is why `next@15.5.19` is the scoped v1.3 recommendation despite `16.2.7` being latest.

## Integration Points

- `backend/src/env.ts`: add typed `DATABASE_URL`, embedding config, RAG limits, and OTEL config. Fail fast on invalid vector dimensions or missing production DB URL.
- `backend/src/store/`: migrate schema and store functions to Postgres/Drizzle. Keep append-only audit semantics.
- `backend/src/ai/orchestrator.ts`: retrieve similar memories before proposal generation and persist accepted solution signals after technician acceptance/validation.
- `backend/src/ai/model.ts`: expose embedding generation beside existing structured object generation. Keep provider selection config-driven.
- `backend/src/routes/runs.ts`: include memory summaries and retrieval metadata in run detail where the dashboard needs it.
- New backend route group, if needed: `backend/src/routes/memory.ts` for dashboard-visible accepted solutions, retrieval history, and memory feedback. Add only with a real dashboard caller.
- `backend/src/events/`: emit RAG and observability-relevant run events only when the frontend consumes them. Prefer canonical event names and typed payloads.
- Dashboard app: use backend API/SSE as the source of truth. Required views are live runs, approvals, audit/activity timeline, RAG memories, retrieval evidence, and observability summaries.
- `docker-compose.yml`: add Postgres with pgvector, healthcheck, volume, and backend dependency. Optional local OpenTelemetry Collector can be added for development if it exports through OTLP and has no vendor-specific default.
- Tests: add real Postgres integration coverage for migrations, audit append/read, approval lifecycle, vector insert/search, and RAG persistence. Avoid source-grep or pass-always tests.

## Not Recommended

- Do not add LangChain, LlamaIndex, CrewAI, AutoGen, or a generic agent framework. The current deterministic orchestrator and AI SDK structured output path are the product safety boundary.
- Do not add Pinecone, Weaviate, Qdrant, Chroma, Milvus, Redis, or Elasticsearch for v1.3 RAG memory. pgvector is enough and keeps memory tied to run/audit data.
- Do not add Prisma unless there is a separate reason to replace Drizzle. For this codebase, Drizzle plus `pg` is smaller and easier to align with explicit migrations and vector SQL.
- Do not add GraphQL, tRPC, WebSockets, queues, Redis, Kubernetes, service mesh, or multi-service backend structure.
- Do not add auth/RBAC/SSO as part of this milestone. It is outside the stated product-dashboard/RAG/observability scope.
- Do not add vendor-specific telemetry SDKs such as Datadog, New Relic, Honeycomb Beeline, Sentry tracing, or Axiom-specific log clients. OTLP and structured logs are enough for vendor-neutral export.
- Do not keep SQLite as a hidden production fallback after Postgres becomes the main path. If a fallback exists for tests or local demos, label it explicitly and keep it off the production path.
- Do not keep shadcn demo records, fake dashboard metrics, or UI controls without handlers on the main path. Replace samples with run, approval, audit, RAG, and observability data or delete them.
