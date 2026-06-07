# v1.3 Research Summary

Reader: requirements and roadmap authors.

Post-read action: scope v1.3 requirements around the product dashboard, Postgres/pgvector memory, and observability without adding disconnected skeleton work or new product scope.

## Stack Additions

- Add a Next.js dashboard only if it becomes the single primary product dashboard path by the end of v1.3. Use shadcn dashboard-01 as source-owned layout scaffolding, then replace sample content with service-desk operational data.
- Prefer `next@15.5.19` with the existing React 18 stack for the lower-risk milestone path. Next 16 and React 19 add migration surface that is not required for v1.3.
- Add Postgres as the main product store and migrate behind the existing backend store boundary. Use `pg`, Drizzle, explicit migrations, `DATABASE_URL`, and a Docker Compose Postgres service with persistent storage.
- Enable pgvector through the first database migration and keep RAG memory in the same Postgres schema as runs, approvals, audit events, activity drafts, and observations. Avoid a separate vector database.
- Reuse the existing AI SDK stack for embeddings where possible. Add embedding provider, model, and dimension config with startup validation.
- Add vendor-neutral observability with OpenTelemetry, OTLP exporter config, structured logs, and correlation context. Keep vendor SDKs out.
- Add React Query only if the dashboard needs client-side polling or SSE hydration beyond simple fetch/SSE handling.

## Feature Table Stakes

- Dashboard data must come from backend APIs and durable state, not local constants, decorative charts, or shadcn sample records.
- The dashboard must improve the technician workflow: open tickets, active runs, pending approvals, latest audit evidence, memory visibility, observability status, and activity state.
- Every visible main-path dashboard action needs a real handler with a state change, or a clear read-only purpose.
- Postgres must be the v1.3 main persistence path, with migrations, seed data, health reporting, and deterministic verification.
- pgvector must be exercised as behavior: vector storage, configured dimensions, top-k retrieval, source references, and similarity tests.
- RAG memory must learn only from redacted, audited, technician-accepted outcomes. Failed, rejected, unsafe, or unverified attempts may be recorded as attempts, not solved memory.
- Retrieved memory must remain inspectable and advisory. It can inform a proposed command, but the existing safety gate, approval gate, edited-command recheck, validation, and audit trail remain mandatory.
- Observability must cover the v1.3 flow end to end: route handling, run transitions, model calls, embeddings, retrieval, database work, SSE, approvals, SSH execution, and activity submission.
- Verification must include a deterministic vertical slice with seeded database state and no dependence on live Phoenix, SSH, sudo, or LLM credentials.

## Architecture Direction

- Keep the Hono backend as the operational source of truth. Next.js may render and adapt typed backend responses, but must not own Phoenix, SSH, LLM, approval, safety, audit, activity, or memory acceptance rules.
- Introduce the dashboard beside the existing Vite frontend first, then retire or retain Vite deliberately after the dashboard covers ticket list, run detail, approvals, activity draft/submit, SSE, and tests.
- Migrate persistence behind the current store modules before changing routes or orchestrator behavior. Routes and orchestrator code should not import `pg` or migration code directly.
- Preserve the audit trail as the source of truth for activity reports, SSE backfill, memory references, and operational evidence.
- Add memory as a narrow backend domain: deterministic fingerprinting, embedding boundary, Postgres repository, retrieval service, accepted-solution recording, and read-focused dashboard routes.
- Integrate memory into the orchestrator at two points only: retrieve relevant accepted memories before proposal generation, and record candidate memory after validation/activity completion.
- Add observability through backend middleware and helpers: correlation IDs, structured logging, OpenTelemetry bootstrap, route/store/provider spans, and redacted status APIs.
- Extend canonical SSE and API contracts instead of copying event shapes into a second frontend-specific model.

## Watch Outs

- Do not leave Vite and Next.js as competing primary UIs. One mounted primary path, one CI gate, and a deletion or ownership plan are required.
- Do not ship shadcn placeholders, fake metrics, inert controls, or charts not backed by persisted data.
- Do not duplicate backend service layers in Next.js route handlers or dashboard-specific services.
- Do not let SQLite, JSONL, or in-memory stores silently remain on the production main path after Postgres becomes default.
- Do not treat pgvector installation as sufficient. Retrieval behavior, dimension handling, indexes, source audit IDs, and deterministic top-k checks must be verified.
- Do not persist solved memory before technician acceptance and validation evidence.
- Do not embed or log secrets, raw command output, Phoenix tokens, private key material, or unredacted model context.
- Do not let retrieved memory weaken the human-in-the-loop invariant or make commands executable outside the existing approval and safety flow.
- Do not add observability package sprawl, SaaS-specific telemetry, or local flows that require an external vendor.
- Do not claim live integration capability while Phoenix, SSH, sudo, and real LLM validation remain externally blocked.
- Do not expand v1.3 into auth, RBAC, queues, Redis, Kubernetes, broad analytics, autonomous remediation, or generic document RAG.

## Requirement Implications

- Requirements should declare dashboard ownership early, including whether Next.js replaces the Vite main path in v1.3 or runs temporarily beside it with an explicit retirement plan.
- Each dashboard requirement should map visible surfaces to backend callers, store data, SSE events, handlers, or a non-main-path backlog disposition.
- Store requirements should define Postgres as the product default, the allowed mock/test fallback behavior, migration commands, seed data, health output, and persistence-after-restart verification.
- Memory requirements should define fingerprint inputs, redaction rules, embedding config, accepted-solution criteria, retrieval top-k contract, retrieval evidence shown to technicians, and feedback event behavior.
- AI requirements should state that memory is advisory context only and cannot bypass proposal parsing, deterministic safety classification, technician approval, SSH execution rules, validation, or audit writes.
- Observability requirements should specify typed log fields, correlation propagation, redaction, span/metric coverage, local exporter behavior, and dashboard-readable status without vendor lock-in.
- Verification requirements should reject source-grep, pass-always, placeholder snapshot, and mock-only tests. They should require Postgres migration smoke, pgvector insert/query, dashboard-to-backend contract checks, memory retrieval tests, observability redaction/correlation checks, and a full deterministic smoke path.
- Documentation requirements should separate verified mock-mode evidence from blocked live credentials and should not use production-ready language until credentialed paths have actually run.

## Roadmap Implications

- Phase 1: Dashboard ownership and data contract. Decide primary frontend path, remove or plan sample UI deletion, map every dashboard surface to real backend data or backlog, and verify live run state.
- Phase 2: Postgres store foundation. Add Postgres and pgvector to local infrastructure, implement migrations and health checks, migrate behind the store boundary, and prove run/audit persistence after restart.
- Phase 3: pgvector retrieval contract. Add memory schema, embedding boundary, deterministic fingerprinting, redaction fixtures, seeded vectors, top-k similarity checks, and source audit references.
- Phase 4: RAG memory loop. Retrieve accepted memories before proposal generation, record memory only after validated technician acceptance, expose retrieval evidence, and preserve safety and approval sequencing.
- Phase 5: Observability baseline. Add correlation IDs, structured logs, OpenTelemetry spans/metrics, redaction checks, and local vendor-neutral export for the main run, DB, RAG, embedding, model, SSE, and activity paths.
- Phase 6: End-to-end v1.3 integration and handoff. Run a fresh-clone mock-mode smoke path from dashboard ticket selection through run, retrieval, approved command, activity submission, persisted data, and observable traces; then update docs with verified evidence and remaining live blockers.
