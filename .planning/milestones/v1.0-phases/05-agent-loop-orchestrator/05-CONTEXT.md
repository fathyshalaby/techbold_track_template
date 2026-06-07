# Phase 5: Agent Loop + Orchestrator - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the AI troubleshooting engine: the deterministic orchestrator state machine plus the structured-output agents (`problem_analyzer`, `customer_system_analyzer`, `problem_solver`, `validator`) that let the system diagnose a Linux-service incident end-to-end — from ranked hypotheses, through a human-gated diagnostic loop, to a minimal reversible fix and a persistence-checked validation — all under deterministic orchestrator control where the AI only ever proposes.

In scope: `orchestrator.ts` (pure reducer + async driver), agent modules with Zod schemas, `model.ts` wiring + mock LLM, prompt templates, orchestrator↔safety↔store integration, and an in-process `advance()` loop driven by tests.

Out of scope (deferred to Phase 6): HTTP run/approval routes, SSE event streaming. Out of scope (Phase 7): `activity_log_generator`. The orchestrator emits events and creates PENDING approvals; the route layer that exposes them over HTTP is Phase 6.
</domain>

<decisions>
## Implementation Decisions

### State Machine Phases & Mechanics
- Adopt ARCHITECTURE.md §4 rich phase names as the locked spec — migrate the existing simplified `RunPhase` enum in `store/schema.ts` (`ANALYSIS/DIAGNOSIS/FIX/VALIDATION/REPORT`) to the full set: `CREATED, LOADED_CONTEXT, TRIAGING, WAITING_FOR_APPROVAL, EXECUTING_COMMAND, OBSERVING, PLANNING_FIX, VALIDATING, DRAFTING_ACTIVITY, WAITING_FOR_ACTIVITY_REVIEW, SUBMITTING_ACTIVITY, COMPLETED, FAILED, ABORTED`. The ROADMAP goal and the §4 state diagram are authoritative.
- Orchestrator is a pure function `(state, event) → {nextState, sideEffects}` plus a thin async driver that performs the effects — honors the ARCHITECTURE "pure function of (currentState, event)" mandate and keeps transitions unit-testable.
- max-steps cap = 12 proposed commands per run (ARCHITECTURE example). On cap, transition to `WAITING_FOR_ACTIVITY_REVIEW` with an honest "could not fully validate" rather than looping.
- Phase persists in the existing `runs.current_phase` column, written by the orchestrator on every transition; one audit event emitted per transition.

### Agent Structured-Output Schemas
- `DiagnosticProposal`: `{ hypotheses: {cause, evidence, confidence}[], command, purpose, expectedSignal, riskNotes, isReadOnly }` — per ARCHITECTURE §8 plus the ranked-hypotheses-with-evidence rule (SC1).
- `FixProposal`: `{ rootCause, command, rationale, rollbackCommand, isReversible, persistenceNote }` — captures minimal + reversible + captured rollback + reboot-persistence (SC4).
- `ValidationResult`: `{ status: VERIFIED_FIXED | LIKELY_FIXED | NOT_FIXED, benefitCheck, persistenceCheck, evidence }` — proves customer benefit (never `is-active`) and checks persistence; single success → `LIKELY_FIXED`, repeated → `VERIFIED_FIXED` (SC5).
- All agent output enforced via Zod schemas through AI SDK `generateObject`, one file per agent, exported types.

### Mock LLM & Generalization
- Mock LLM: scripted deterministic agent responses keyed by run phase (NOT ticket ID/symptom), driving the full loop offline against the Phase-4 mock SSH fixtures.
- Generalization enforced structurally: agent prompts reference only ticket + observations as runtime data; a test greps agent prompt sources for hardcoded hostnames, ticket IDs, or symptom strings (SC2).
- Model wiring: single provider behind `model.ts` reading env (`OPENAI_API_KEY`, `LLM_MODEL`); `resolveClientMode('llm')` switches to the mock.
- Agent failure degradation: AI call timeout + 1 retry → on failure emit "agent unavailable, propose manually"; never degrade to an unsafe default.

### Orchestrator ↔ Safety / Store Integration
- The orchestrator runs `validateCommandAgainstPolicy` on every agent-proposed command before creating a PENDING approval; a block writes audit `command.blocked` and loops back to `TRIAGING` to ask for an alternative.
- The orchestrator creates the PENDING `command_approvals` row and emits `approval.required`; the route layer (Phase 6) handles approve/execute.
- After each command result, the orchestrator writes a redacted `observations` row that agents read on the next turn.
- Phase 5 scope = orchestrator engine + agents + in-process `advance()` driven by tests; HTTP routes and SSE are Phase 6.

### Claude's Discretion
- Internal file organization within `ai/agents/`, prompt-template structure in `prompts.ts`, event-name constants, and test layout are at Claude's discretion within the contracts above.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `store/runs.ts` — `createRun`, `getRunById`, `updateRunPhase`, `updateRunStatus`, `markRunCompleted/Failed/Aborted` already exist; orchestrator drives these.
- `store/schema.ts` — `RunSchema`, `CommandApprovalSchema`, `CommandResultSchema`, `ObservationSchema`, `ActivityDraftSchema` defined. `RunPhase` enum needs migration to the rich §4 set.
- `safety/command-policy.ts` — `validateCommandAgainstPolicy` (deterministic gate) from Phase 3.
- `safety/classifier.ts`, `safety/risk-levels.ts` — risk classification; LLM may only raise, never lower.
- `safety/redaction.ts` — `redactSecrets`, `REDACTION_CAP_BYTES`; run before any string reaches observations/audit/model.
- `ssh/mock.ts` — `MockSshExecutor` + 11-command `MOCK_SSH_FIXTURES` (Phase 4) drives the offline loop.
- `ai/tools/ssh-tools.ts` — `proposeSshCommand` (no execute), `createSshExecutor` factory (Phase 4).
- `store/audit.ts` — append-only audit writer (Phase 3); every transition/side-effect audits.
- `env.ts` — `resolveClientMode('llm')`, `getEnv()`; LLM mock switch.

### Established Patterns
- Structured output only when the backend must act (`generateObject` + Zod) — never free-form.
- Append-only audit; payload redacted before write; `actor` tags source.
- `executeApprovedCommand` is backend-only, never a model tool (anti-pattern A1).
- Mock-first: every external dependency (Phoenix, SSH, LLM) has a first-class mock.

### Integration Points
- Orchestrator → safety (`validateCommandAgainstPolicy`), store (`runs`, `command_approvals`, `observations`, `audit_events`), agents (`generateObject`), ssh tools (`proposeSshCommand`).
- Phase 6 will wrap `advance()` in `POST /api/runs/:id/next` and consume emitted events over SSE.
</code_context>

<specifics>
## Specific Ideas

- Agent role names must use the brief's vocabulary (`problem_analyzer`, `customer_system_analyzer`, `problem_solver`, `validator`/`activity_log_generator`) so the jury recognizes the structure (ARCHITECTURE §7).
- Validation honesty (PRD G2): proof is the customer-benefit test, never `systemctl is-active`; for intermittent symptoms, repeat the test over an interval — a single green → `LIKELY_FIXED`, not `VERIFIED_FIXED`.
- Prefer reboot-persistent fixes (enable the unit, fix persistent config) — persistence is graded (rubric B).
</specifics>

<deferred>
## Deferred Ideas

- HTTP run/approval routes + SSE streaming — Phase 6.
- `activity_log_generator` (5 ERP fields from audit trail) — Phase 7.
- Real-LLM response replay fixtures, per-agent model config, configurable max-steps via env — not needed for v1.
</deferred>
