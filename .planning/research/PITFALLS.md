# v1.3 Pitfalls: Dashboard, Postgres RAG Memory, Observability

Audience: requirements, roadmap, and phase planning.

Context: v1.2 verified the mock-mode vertical slice and backend workflow. v1.3 adds a Next.js operational dashboard, Postgres with pgvector, RAG memory, and vendor-neutral observability. The main risk is reintroducing disconnected skeleton work after v1.1 cleaned it out.

Traceability: these pitfalls extend the v1.1 defect themes around event contracts, disconnected frontend surfaces, store-mode clarity, vertical-slice coverage, truthful docs, and tooling gates.

## Pitfalls

| ID | Pitfall | Why it is specific to v1.3 |
|---|---|---|
| P-01 | Adding a Next.js dashboard beside the existing Vite app without deciding ownership. | The project just removed disconnected frontend surfaces. A second frontend can recreate the same defect under a newer framework. |
| P-02 | Shipping shadcn dashboard-01 as a themed shell with placeholder charts, fake rows, or inert controls. | v1.3 asks for a product dashboard, not design-system polish. Every visible dashboard element needs real run, ticket, memory, or observability data. |
| P-03 | Duplicating backend logic in Next.js route handlers, server actions, or dashboard-specific service layers. | Hono already owns safety, approvals, run state, audit, Phoenix, SSH, and activity behavior. A dashboard BFF can split truth across two APIs. |
| P-04 | Breaking the run/SSE contract while adapting live state for the dashboard. | v1.1 and v1.2 spent effort proving canonical event names, mounted frontend behavior, and SSE lifecycle visibility. |
| P-05 | Replacing SQLite with Postgres but keeping SQLite, JSONL, or in-memory paths alive on the main path. | v1.3 changes persistence. Skeleton mode forbids duplicate service layers and unclear fallback behavior. |
| P-06 | Treating pgvector as an installed dependency instead of a verified retrieval system. | A vector column is not RAG memory. The milestone needs embedding storage, top-k retrieval, accepted-solution persistence, and dashboard visibility. |
| P-07 | Persisting memory before validation or technician acceptance. | The current product value depends on audit-trail truth and human approval. Memory must not learn failed, rejected, unsafe, or hallucinated remedies. |
| P-08 | Embedding secrets, raw command output, or customer-specific sensitive data. | SSH stdout, Phoenix fields, and activity drafts can contain secrets. Redaction currently protects audit/UI paths and must also protect memory. |
| P-09 | Letting retrieved memory influence execution outside the existing safety loop. | RAG suggestions must remain context. Commands still need model structure checks, deterministic safety classification, technician approval, and edited-command recheck. |
| P-10 | Adding observability as noisy package sprawl rather than an operational baseline. | The target is vendor-neutral observability for runs, RAG, embeddings, DB, logs, and correlation IDs, not enterprise hardening. |
| P-11 | Logging sensitive values or losing correlation across API, run, DB, RAG, and model calls. | Observability will touch the most sensitive paths. Unredacted logs or missing run IDs make debugging worse and can violate safety expectations. |
| P-12 | Creating tests that only prove mocks work while Postgres, pgvector, dashboard wiring, and observability remain unexercised. | v1.2 improved test credibility. v1.3 can regress by adding integration-heavy features with fake pass-always coverage. |
| P-13 | Claiming live product capability while Phoenix, SSH, sudo, or real LLM validation remains externally blocked. | v1.2 accepted these as exact blockers. v1.3 docs and dashboard states must keep mock evidence separate from live claims. |
| P-14 | Expanding scope into analytics, auth, RBAC, queues, background workers, or autonomous remediation. | The project goal is a clean product foundation. These are outside the current milestone unless required to connect dashboard, memory, database, and observability. |

## Warning Signs

- P-01: `frontend/` and a new Next.js app both contain primary user journeys; README points to two first screens; CI builds only one frontend; old Vite routes still look current after Next.js lands.
- P-02: dashboard cards show hardcoded counts, lorem-style labels, sample shadcn users, disabled controls, buttons without handlers, or charts whose data never comes from the backend.
- P-03: dashboard code creates run, approval, memory, or activity business rules outside the Hono backend; endpoint names drift between app and backend; two clients map the same domain objects differently.
- P-04: dashboard live state uses different event names than backend SSE; polling hides SSE breakage; browser UAT only checks initial render; event payload types are copied instead of shared.
- P-05: SQLite and Postgres store modules both remain importable by production bootstrap; config silently falls back to memory or JSONL; `/health` does not expose active store mode; migrations are optional.
- P-06: pgvector is installed but no test proves nearest-neighbor retrieval; embedding dimensions are implicit; query results do not include source audit IDs; no index or deterministic top-k behavior is verified.
- P-07: memory rows are written during proposal, rejection, failed command, or unvalidated fix steps; accepted solution state is not tied to validation and technician action.
- P-08: embedding inputs use raw SSH output or activity drafts directly; redaction tests do not cover memory ingestion; logs show API keys, host notes, private paths, tokens, or command secrets.
- P-09: retrieved commands bypass approval UI; RAG output is rendered as a runnable command without safety metadata; edited commands are not rechecked after memory-assisted suggestions.
- P-10: OpenTelemetry, collectors, dashboards, or vendors are added before a minimal structured event/log contract exists; observability dependencies are unused; config requires external SaaS to run locally.
- P-11: logs have no `runId`, `ticketId`, `correlationId`, retrieval ID, or model call ID; catch blocks only log generic errors; errors are swallowed to keep the dashboard green.
- P-12: tests grep for package names, assert mocks were called, snapshot dashboard placeholders, or skip Postgres because Docker is unavailable; no fresh-clone verification covers migrations.
- P-13: docs or dashboard labels say "production ready", "live RAG", or "real integrations verified" without separating mock-mode proof from missing Phoenix, SSH, sudo, and LLM credentials.
- P-14: roadmap items introduce login systems, queues, workers, Redis, Kubernetes, autonomous fix execution, or broad analytics before the core v1.3 slice is connected and verified.

## Prevention Strategy

- P-01: Decide frontend ownership in the first dashboard phase. Either migrate the primary UI to Next.js and retire the Vite main path, or explicitly document a temporary split with one mounted primary path, one CI gate, and a deletion plan.
- P-02: Require a dashboard data contract before UI implementation. Every visible card, table, filter, chart, button, and empty state must map to a backend caller, local handler, or explicit non-main-path backlog item.
- P-03: Keep Hono as the source of operational truth. Next.js may render, fetch, and adapt typed responses, but must not reimplement run orchestration, safety decisions, audit writes, Phoenix writes, or memory acceptance rules.
- P-04: Extend the existing event contract instead of copying it. Add shared types for any new dashboard event shape and verify live updates through browser UAT plus backend event/audit symmetry tests.
- P-05: Create a Postgres store migration plan with one production store path. Verification must prove migration creation, schema application, run/audit persistence after restart, `/health` store reporting, and failure on missing required DB config.
- P-06: Treat pgvector as behavior. Define embedding model, dimensions, distance metric, indexes, source references, and top-k contract. Add a seeded retrieval test where the expected incident is ranked above distractors.
- P-07: Gate memory writes on validated outcomes. Accepted memory should require an audit-linked successful validation result and technician-visible acceptance state. Rejected, unsafe, failed, or aborted attempts must not become accepted solutions.
- P-08: Redact before embedding, logging, and dashboard display. Add memory-specific redaction fixtures with SSH stdout, Phoenix notes, tokens, private keys, hostnames if sensitive, and activity text.
- P-09: Preserve the human-in-the-loop invariant. RAG can provide evidence, prior solution context, and confidence, but any proposed command must still pass the current proposal parser, safety layer, approval UI, SSH executor, audit append, and validation loop.
- P-10: Start with a small vendor-neutral contract. Structured logs and spans/events should cover run lifecycle, command approval/execution, DB query/migration, embedding call, retrieval call, model call, and activity submission without requiring an external collector.
- P-11: Add correlation middleware and typed log fields. Verification should show one `correlationId` flowing from API request to run event, DB write, RAG retrieval, model call, and error response, with redacted log output.
- P-12: Add integration checks that exercise real new infrastructure. At minimum: Postgres migration smoke, pgvector insert/query, dashboard-to-backend contract test, memory ingestion/retrieval test, observability redaction/correlation test, and full `pnpm check`.
- P-13: Keep status language truthful. Dashboard and docs must label mock-mode data as mock, live blockers as blocked, and real integrations as verified only when the credentialed path has actually run.
- P-14: Add an explicit scope guard to requirements. New infra is allowed only when it connects dashboard, Postgres, RAG memory, or observability to the existing service-desk copilot flow.

## Phase Placement

| Recommended v1.3 phase | Risks to address | Verification checks |
|---|---|---|
| Phase 1: Dashboard Ownership and Data Contract | P-01, P-02, P-03, P-04, P-14 | One primary frontend path is declared; every dashboard surface has a real backend caller or backlog disposition; no inert main-path controls; CI builds the chosen frontend; browser UAT covers live run state. |
| Phase 2: Postgres Store Foundation | P-05, P-12, P-13 | Postgres and pgvector boot in Docker Compose; migrations apply deterministically; run/audit data persists after restart; `/health` reports store mode; SQLite/JSONL is removed from production bootstrap or documented as non-main-path dev-only behavior. |
| Phase 3: pgvector Retrieval Contract | P-06, P-08, P-12 | Embedding dimensions and distance metric are configured; redacted seeded incidents are inserted; top-k retrieval ranks expected matches above distractors; results include source audit references; tests run without fake pass-always assertions. |
| Phase 4: RAG Memory Loop | P-07, P-08, P-09, P-13 | Memory writes only after validated technician-accepted outcomes; rejected/failed/unsafe runs are excluded; retrieved context is visible but not executable without the approval and safety path; dashboard distinguishes learned memory from mock seed data. |
| Phase 5: Observability Baseline | P-10, P-11, P-12 | Structured logs/events include correlation IDs across API, run, DB, RAG, embedding, model, and activity paths; logs are redacted; no external vendor is required for local verification; errors are explicit and not silently swallowed. |
| Phase 6: End-to-End v1.3 Integration and Handoff | P-01 through P-14 | Fresh clone starts with dashboard, backend, Postgres, pgvector, and mock services; one smoke path covers ticket to run to RAG retrieval to approved command to activity visibility; `pnpm check` passes; docs separate verified mock evidence from accepted live blockers. |
