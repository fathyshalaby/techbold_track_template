# v1.3 Feature Research

Reader: requirements author for the next milestone.
Post-read action: select a scoped v1.3 requirements set that is visible in the app or operationally testable.

## Feature Categories

| Category | Candidate capability | Typical behavior | Depends on existing capability | Operational test |
|---|---|---|---|---|
| Operational dashboard | Ticket and run overview | Shows assigned tickets, active runs, pending approvals, failed validations, activity draft state, and recent audit events from real backend data. | Phoenix ticket routes, run workflow, approval gates, audit timeline, activity draft and submit routes. | Seed known tickets and runs, load dashboard, verify counts and rows match API/store state. |
| Operational dashboard | Live run status | Dashboard updates active run state without refresh and clearly marks disconnected SSE, stale data, or failed backend calls. | Existing SSE lifecycle and canonical run events. | Start a mock run, consume SSE, verify dashboard changes as run events arrive. |
| Operational dashboard | Technician action queue | Surfaces only real next actions such as approve command, edit command, reject command, retry, abort, draft activity, or submit activity. | Existing main-path handlers and UI workflow. | Each dashboard action calls a real handler and mutates backend state. |
| Operational dashboard | Run drill-down | Opens the current run, proposed command, safety classification, command output, audit trail, and activity draft context. | Run detail API, safety policy, SSH executor result, audit store. | Select a run and verify all displayed evidence comes from stored run and audit data. |
| Postgres foundation | Main-path Postgres store | Replaces SQLite as the primary store for runs, audit events, approvals, activities, retrieval records, embeddings, and observability events. | Current store schemas and JSONL fallback behavior. | Fresh database migration, seed, run vertical slice, restart, verify persisted state. |
| Postgres foundation | Explicit migrations and seeds | Versioned schema setup and deterministic seed data for dashboard, RAG, and smoke checks. | Existing deterministic mock mode and vertical-slice coverage. | Drop database, migrate, seed, run smoke checks with stable expected rows. |
| Postgres foundation | pgvector embedding tables | Stores embedding vectors with source type, fingerprint, model name, dimensions, normalized text, redaction status, and acceptance state. | Redaction, audit events, accepted activity/result records, future embedding provider config. | Insert seeded embeddings and retrieve nearest matches with deterministic test vectors. |
| RAG memory | Error fingerprinting | Converts observed incidents into stable fingerprints using ticket text, service name, command output symptoms, exit code, and validation result. | Ticket detail, command output, validation events, redaction. | Same symptom creates same fingerprint; materially different symptom creates a distinct fingerprint. |
| RAG memory | Accepted-solution persistence | Saves memory only when the technician accepts or submits the solution, with command, rationale, outcome, and audit evidence. | Human approval gate, activity submission, append-only audit trail. | Rejected or failed attempts are not stored as solved memory; submitted successful activity is stored. |
| RAG memory | Top-k retrieval for proposals | Before proposing the next diagnostic or fix, retrieves similar prior accepted solutions and passes bounded, cited context to the model. | Orchestrator, AI role calls, safety gate, embedding store. | Given seeded solved incidents, proposal includes retrieved evidence IDs and still requires approval. |
| Retrieval quality | Match transparency | UI shows why memory was used: similarity score, fingerprint fields, accepted outcome, age, and source run. | RAG retrieval records, dashboard run drill-down. | Technician can inspect each retrieved memory and see whether it influenced a proposal. |
| Retrieval quality | Retrieval telemetry | Records query text hash, top-k count, similarity scores, selected context IDs, empty-result cases, and latency. | Observability baseline and RAG retrieval service. | Trigger retrieval and verify one trace or structured event per query. |
| Retrieval quality | Feedback loop | Technician can mark retrieved memory as useful, irrelevant, stale, or dangerous. Feedback affects dashboard visibility and future retrieval weighting only after clear rules are defined. | Dashboard actions, memory store, audit trail. | Feedback writes a durable event and does not silently rewrite the original memory. |
| Observability | Correlation IDs | Every run, approval, SSH execution, model call, embedding call, retrieval query, DB operation group, and SSE connection carries a correlation ID. | Run IDs, event bus, route handlers, store layer. | One run can be followed through logs, traces, audit events, and dashboard state. |
| Observability | Structured logs | Logs use typed event names, severity, run ID, ticket ID, operation, duration, status, and redacted error detail. | Existing redaction and route error handling. | Failure injection emits useful redacted logs without leaking secrets. |
| Observability | Vendor-neutral traces and metrics | Captures spans and counters for route latency, run transitions, model calls, embeddings, retrieval latency, database operations, SSE connects, and approval outcomes. | Backend routes, orchestrator, store, event stream. | Local collector or stdout exporter receives spans during deterministic smoke tests. |
| Observability | Health and readiness | Health reports app mode, database connectivity, migration state, pgvector availability, mock/live integration mode, and configured observability exporter. | Existing health route and startup config. | Health fails or degrades when Postgres or pgvector is unavailable. |
| Integration | End-to-end v1.3 smoke path | Seed tickets and memories, start app, open dashboard, run a mock incident, retrieve memory, approve/edit command, submit activity, inspect trace and persisted data. | All v1.2 primary flow capabilities plus new dashboard, database, RAG, and observability. | One deterministic command verifies user-visible and operationally testable behavior. |

## Table Stakes

- Dashboard data must come from backend APIs and durable state, not local constants or decorative charts.
- The dashboard must make the current technician workflow easier: open tickets, active runs, pending approvals, latest audit evidence, and activity status.
- Every visible dashboard action must have a real handler with a state change or a clear read-only purpose.
- Postgres must be the main path for v1.3 persistence, with migrations, seed data, and a documented fallback or no fallback.
- pgvector must be enabled by a real migration and verified by a query that exercises vector similarity.
- RAG memory must learn only from accepted, audited, redacted outcomes. Failed, rejected, or unverified attempts can be recorded as attempts, not solved memory.
- Retrieval must be inspectable. A technician or developer should see which memories were retrieved, their scores, and which proposal used them.
- The AI must remain suggestion-only. Retrieved memory can inform a proposed command, but the approval gate and safety gate remain mandatory.
- Observability must cover the v1.3 flow end to end: route, run, model, embedding, retrieval, database, SSE, and activity submission.
- Health and startup logs must tell the truth about mock mode, live integration blockers, Postgres, pgvector, and observability exporter configuration.
- Verification must include at least one deterministic vertical slice with seeded database state and no dependence on live Phoenix, SSH, or LLM credentials.

## Differentiators

- Memory is grounded in successful, technician-accepted outcomes rather than generic Linux docs.
- Retrieved memories are shown as operational evidence, not hidden prompt material.
- The dashboard emphasizes blockers and next actions over broad analytics.
- The system can explain why a prior solution matched the current incident using fingerprint fields and similarity scores.
- Retrieval quality is measurable through empty-result rate, accepted-memory usage, technician feedback, stale memory flags, and proposal outcome.
- Observability ties AI behavior to operational outcomes: a run can be traced from ticket selection through retrieval, proposal, approval, execution, validation, and activity submission.
- Seeded demo data can show a real learning loop: first run creates accepted memory, later similar run retrieves it.
- The memory store can preserve negative evidence without poisoning solved-solution retrieval.
- Dashboard drill-down can join audit events, retrieved memories, command proposals, and traces into one technician-facing incident record.

## Anti-Features

- Do not build charts whose numbers are not backed by persisted data.
- Do not add a separate dashboard that bypasses the existing ticket and run workflow.
- Do not create memory from model suggestions, rejected commands, failed validations, or mock-only claims as if they were real fixes.
- Do not let RAG memory auto-execute commands or weaken approval and safety checks.
- Do not add arbitrary document RAG before the error-to-solution memory loop works.
- Do not add broad analytics, tenant management, RBAC, queues, Kubernetes, or enterprise alerting for v1.3.
- Do not build hidden prompt stuffing where retrieved context cannot be inspected or tested.
- Do not introduce duplicate service layers for storage, embeddings, or observability.
- Do not expose secrets, raw SSH output, Phoenix tokens, or unredacted model context in memory, logs, traces, or dashboard views.
- Do not rely on fake pass-always tests, source-grep tests, or screenshots that only prove a component rendered.
- Do not keep SQLite and Postgres as competing main-path stores unless the split is explicitly documented and tested.

## Complexity Notes

- Dashboard scope can balloon quickly. Keep v1.3 to operational status, next actions, run drill-down, memory visibility, and observability signals.
- Postgres migration is a foundation change. Risk comes from replacing the current store while preserving run, audit, approval, activity, SSE, and mock-mode behavior.
- pgvector adds schema and dependency complexity. Verify extension availability during startup and migrations instead of discovering failure during retrieval.
- Embedding dimensions and model names must be stored with each vector. Changing embedding providers later should not corrupt existing records.
- Fingerprinting needs deterministic rules. If fingerprints are too broad, bad matches will look plausible. If too narrow, retrieval will rarely help.
- Retrieval quality needs real measurements but should start small: top-k scores, empty results, selected context IDs, latency, and technician feedback.
- Accepted-solution memory must distinguish root cause, diagnostic command, fix command, validation evidence, and final activity text. Mixing them makes retrieval noisy.
- Observability can become vendor lock-in. Prefer neutral span/log/metric boundaries and keep exporter configuration replaceable.
- Traces and logs must run through redaction. Observability that leaks secrets is worse than no observability.
- Deterministic verification is the main risk reducer. Seeded tickets, seeded memories, mock embeddings, and mock model outputs should prove wiring before live credentials are used.
- Real Phoenix, SSH, sudo, and LLM validation remains externally blocked until credentials and VM details are available. v1.3 should not claim live behavior until those blockers are cleared.
