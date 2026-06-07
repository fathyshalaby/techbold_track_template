# Roadmap: Service Desk Autopilot

## Overview

Nine phases derived directly from the locked build-order critical path in docs/TASKS.md. The path runs: repo foundation → ERP client → safety + store (parallel) → SSH executor → agent loop → API routes + approvals → activity generation → frontend → tests + submission. Each phase unblocks the next; nothing is invented. The goal is a working demo on Sun Jun 7 14:00 that solves hidden Linux-service incidents safely, auditably, and generalisably.

## Phases

**Phase Numbering:**

- Integer phases (1–9): The locked hackathon build order
- Decimal phases: Inserted only under /gsd-phase --insert if urgent work appears mid-stream

- [x] **Phase 1: Repo Foundation** - Migrate to Node 22 + Hono + TS; validated env; mock mode toggle (completed 2026-06-06)
- [x] **Phase 2: ERP Client + Ticket Routes** - Phoenix client with auth/retry/mock; ticket list + detail endpoints (completed 2026-06-06)
- [ ] **Phase 3: Safety Layer + Run Store** - Deterministic blocklist/classifier/redaction + tests; append-only SQLite audit log
- [ ] **Phase 4: SSH Executor** - ssh2 single-command executor with timeout/redaction/output-cap + mock + preflight hardening
- [ ] **Phase 5: Agent Loop + Orchestrator** - problem_analyzer, problem_solver, validator agents + deterministic state machine
- [x] **Phase 6: Run API + Approvals + SSE** - Run CRUD routes, approval/reject/edit with safety re-check, SSE event stream (completed 2026-06-06)
- [x] **Phase 7: Activity Generation** - activity_log_generator from audit trail only; draft + submit to Phoenix (completed 2026-06-07)
- [ ] **Phase 8: Frontend** - Ticket list, run page, approval card, audit timeline, activity editor
- [ ] **Phase 9: Tests + Submission Polish** - phoenix-client + orchestrator tests; README; MIT license; REPORT.md; demo video; secret scan

## Phase Details

### Phase 1: Repo Foundation

**Goal**: The project runs on the correct stack and every environment concern is handled before any feature work begins
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-01, PLAT-02, PLAT-03, PLAT-04
**Success Criteria** (what must be TRUE):

  1. `docker compose up` builds without error and `GET /health` returns `{status:"ok"}`
  2. Frontend loads at :5173 in both real and mock mode
  3. Starting the server with a missing required env var prints a readable error and exits immediately
  4. `MOCK_MODE=true` drives the full loop offline — no real Phoenix, SSH, or LLM calls needed
  5. `.env` and `keys/` are git-ignored; `.env.example` contains only placeholders and is committed

**Plans**: TBD

### Phase 2: ERP Client + Ticket Routes

**Goal**: Technicians can see their assigned tickets and SSH target details pulled from the live Phoenix ERP
**Depends on**: Phase 1
**Requirements**: ERP-01, ERP-02, ERP-03, ERP-04, ERP-05, ERP-06
**Success Criteria** (what must be TRUE):

  1. `GET /api/tickets` returns assigned tickets with title, customer, priority, and status from Phoenix (or mock)
  2. `GET /api/tickets/:id/customer-system` returns the SSH target for a ticket
  3. Ticket list supports sort or filter by at least one of: status, priority, date
  4. A 401, 404, or empty ticket list from Phoenix degrades gracefully without crashing the server
  5. The in-memory mock returns valid fixtures for every client method used in the agent loop

**Plans**: 3 plans
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Phoenix Zod type schemas (TDD: schema parsing contracts)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Phoenix HTTP client with auth/retry/timeout + rubric-E tests (TDD)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — In-memory mock + ticket route wiring

**UI hint**: yes

### Phase 3: Safety Layer + Run Store

**Goal**: Every command is deterministically classified and every run event is durably persisted before any SSH command can execute
**Depends on**: Phase 1
**Requirements**: SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05, SAFE-06, API-04
**Success Criteria** (what must be TRUE):

  1. `safety.test.ts` is green — every blocklist pattern (including obfuscation variants) returns `HIGH_RISK_BLOCKED`
  2. An edited command is re-validated at approval time; a dangerous edit is blocked with 422 + `BLOCKED` audit entry
  3. Secret redaction strips secrets from every string before it reaches the audit log, UI, or model
  4. Run store creates a `runs` row and `run.started` audit entry on run creation; no delete path exists
  5. SQLite store persists approvals, results, observations, and activity drafts; JSONL fallback activates when SQLite is unavailable

**Plans**: 4 plans
Plans:
**Wave 1** *(independent — run in parallel)*

- [x] 03-01-PLAN.md — Blocklist + classifier TDD (command-policy.ts, classifier.ts)
- [x] 03-02-PLAN.md — Redaction TDD (redaction.ts)
- [x] 03-03-PLAN.md — Run store (schema.ts, db.ts, runs.ts, audit.ts)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-04-PLAN.md — Safety §9 consolidated test gate (safety.test.ts)

### Phase 4: SSH Executor

**Goal**: The backend can execute a single approved command on a remote VM safely, with output captured and redacted, driving the practice loop offline via mock
**Depends on**: Phase 1, Phase 3
**Requirements**: DIAG-06
**Success Criteria** (what must be TRUE):

  1. Real VM: `uname -a` executes and returns captured output, exit code, and duration
  2. A command that exceeds the timeout is marked `timedOut`; output is capped at 16 KB
  3. SSH mock drives the full agent loop offline without a real VM
  4. Preflight step confirms `sudo -n true`, `LANG=C`, and PATH via `bash -lc` before any command runs

**Plans**: 5 plans
Plans:
**Wave 1** *(independent)*

- [x] 04-01-PLAN.md — SSH layer type contracts (types.ts)

**Wave 2** *(blocked on Wave 1 completion — 04-02 and 04-04 run in parallel)*

- [x] 04-02-PLAN.md — Executor logic TDD: result shape, output cap, timeout, bash-lc wrap, A1 guard (test file only)
- [x] 04-04-PLAN.md — Mock SSH TDD + mock.ts: fixture map, fallback, preflight, SshExecutor conformance

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-03-PLAN.md — Real ssh2 client + executor implementation (client.ts + executor.ts)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 04-05-PLAN.md — ssh-tools.ts proposeSshCommand + createSshExecutor factory wiring

### Phase 5: Agent Loop + Orchestrator

**Goal**: The AI can diagnose a Linux service incident end-to-end — from ranked hypotheses through a fix proposal to a validated, persistence-checked resolution — under deterministic orchestrator control
**Depends on**: Phase 3, Phase 4
**Requirements**: DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05
**Success Criteria** (what must be TRUE):

  1. `problem_analyzer` returns a typed `DiagnosticProposal` with ranked root-cause hypotheses, evidence, and one read-only diagnostic command (purpose + expected signal + risk level)
  2. Agent prompts contain no branches keyed to ticket IDs, hostnames, or symptom strings
  3. Orchestrator drives phases TRIAGING → WAITING_FOR_APPROVAL → EXECUTING → OBSERVING → … → DRAFTING_ACTIVITY with a max-steps cap; a blocked command triggers an alternative proposal
  4. `problem_solver` returns a `FixProposal` that is minimal, reversible, and includes a captured rollback command
  5. `validator` proves the customer benefit is restored (not just `is-active`) and checks reboot/restart persistence; single success → `LIKELY_FIXED`, repeated → `VERIFIED_FIXED`

**Plans**: 5 plans
Plans:
**Wave 1** *(independent)*

- [x] 05-01-PLAN.md — RunPhase enum migration + agent Zod schemas (DiagnosticProposal, FixProposal, ValidationResult)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 05-02-PLAN.md — model.ts provider + prompts.ts system prompts for all four agent roles

**Wave 3** *(blocked on Wave 2 completion — 05-03 and 05-04 run in parallel)*

- [x] 05-03-PLAN.md — Agent implementations TDD (problem-analyzer, customer-system-analyzer, problem-solver, validator)
- [x] 05-04-PLAN.md — Orchestrator reducer TDD (pure state, event → nextState, sideEffects reducer + max-steps cap)

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 05-05-PLAN.md — Orchestrator async driver + full in-process integration test

### Phase 6: Run API + Approvals + SSE

**Goal**: The full run lifecycle is accessible over HTTP and the browser sees live events as they happen
**Depends on**: Phase 5
**Requirements**: API-01, API-02, API-03
**Success Criteria** (what must be TRUE):

  1. `POST /api/runs`, `GET /api/runs/:id`, `POST /api/runs/:id/next`, `POST /api/runs/:id/abort` behave per PRD §9
  2. Approve (with optional edit) → safety re-check → execute → observation recorded; reject-with-reason → agent proposes alternative
  3. Browser EventSource receives `run.started`, `approval.required`, and `command.completed` events live
  4. Every meaningful side-effect emits and audits the same event (no silent state changes)

**Plans**: 4 plans
Plans:
**Wave 1** *(independent — run in parallel)*

- [x] 06-01-PLAN.md — Run routes TDD (POST /api/runs, GET /api/runs/:id, /next, /abort)
- [x] 06-02-PLAN.md — Approval routes TDD (approve with safety re-check, reject with reason)
- [x] 06-03-PLAN.md — SSE events route (streamSSE, backfill, keepalive, bus cleanup)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 06-04-PLAN.md — Mount runs + approvals + events routers in app.ts

### Phase 7: Activity Generation

**Goal**: A technician can review and submit a complete ERP activity report built entirely from the audit trail
**Depends on**: Phase 5, Phase 6
**Requirements**: ACT-01, ACT-02
**Success Criteria** (what must be TRUE):

  1. `POST /api/runs/:id/activity/draft` returns all 5 graded fields (`summary`, `root_cause`, `actions_taken`, `commands_summary`, `validation_result`) populated from the audit trail — no invented facts, no secrets
  2. `POST /api/runs/:id/activity/submit` creates a real Phoenix activity via `createActivity` and returns the created record

**Plans**: 3 plans
Plans:
**Wave 1** *(independent)*

- [x] 07-01-PLAN.md — Activity log generator agent TDD (ActivityDraftFieldsSchema, runActivityLogGenerator, MOCK_ACTIVITY_DRAFT)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 07-02-PLAN.md — Activity routes TDD (POST /activity/draft, POST /activity/submit)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 07-03-PLAN.md — Mount activityRouter in app.ts

### Phase 8: Frontend

**Goal**: A technician can drive a complete run in the browser — from ticket list through approval decisions to editing and submitting the activity report
**Depends on**: Phase 2, Phase 6, Phase 7
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07
**Success Criteria** (what must be TRUE):

  1. Ticket list is navigable; clicking a ticket opens the detail view with customer system information
  2. Starting a run opens a live timeline that updates via SSE without a page refresh
  3. Approval card shows command, purpose, expected signal, risk level, and safety notes with approve / edit-then-approve / reject-with-reason controls
  4. Audit timeline shows all actions in followable order
  5. Activity editor allows the technician to edit generated fields and submit to Phoenix
  6. Retry and abort controls are visible and functional on the run page

**Plans**: 5 plans
Plans:

**Wave 1** *(independent)*

- [x] 08-01-PLAN.md — Shared types, API fetch wrappers, pure mappers (TDD)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 08-02-PLAN.md — Custom hooks (useTickets, useRunEvents)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 08-03-PLAN.md — App shell + TicketListView

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 08-04-PLAN.md — RunView + ApprovalCard + abort/advance controls

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 08-05-PLAN.md — ActivityView + CSS finalization

**UI hint**: yes

### Phase 9: Tests + Submission Polish

**Goal**: The repo passes all grading checks — tests green, README complete, secrets clean, REPORT.md written, demo video recorded, and the submission form filed before the freeze
**Depends on**: Phase 8
**Requirements**: ENG-01, ENG-02, ENG-03, ENG-04
**Success Criteria** (what must be TRUE):

  1. `pnpm test` is green — phoenix-client and orchestrator tests cover happy path + reject path with mocked fetch, SSH, and model
  2. A fresh clone runs end-to-end via `docker compose up` following only the README
  3. MIT LICENSE is present; secret scan (`git grep`) finds no tokens, keys, or credentials in the repo
  4. `REPORT.md` documents approach, agent design, safety model, and results on the 5 practice VMs

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

Note: Phases 2 and 3 can run in parallel lanes (ERP client is independent of safety+store). Phase 4 needs Phase 3 (safety) complete. All other dependencies are sequential per the critical path.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Repo Foundation | 3/3 | Complete    | 2026-06-06 |
| 2. ERP Client + Ticket Routes | 3/3 | Complete    | 2026-06-06 |
| 3. Safety Layer + Run Store | 4/4 | Complete    | 2026-06-06 |
| 4. SSH Executor | 5/5 | Complete    | 2026-06-06 |
| 5. Agent Loop + Orchestrator | 4/5 | In Progress|  |
| 6. Run API + Approvals + SSE | 4/4 | Complete   | 2026-06-06 |
| 7. Activity Generation | 3/3 | Complete   | 2026-06-07 |
| 8. Frontend | 4/5 | In Progress|  |
| 9. Tests + Submission Polish | 0/TBD | Not started | - |
