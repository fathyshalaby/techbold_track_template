---
phase: 05-agent-loop-orchestrator
verified: 2026-06-07T00:15:00Z
status: human_needed
score: 13/13 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Run advance() through the full TRIAGING → WAITING_FOR_APPROVAL → EXECUTING_COMMAND → OBSERVING → PLANNING_FIX → VALIDATING → DRAFTING_ACTIVITY chain end-to-end with a real LLM API key against the mock SSH fixtures"
    expected: "State machine traverses all phases in order, each agent returns a valid structured-output object, fix is reversible with rollback, validator reaches VERIFIED_FIXED or LIKELY_FIXED, run transitions to WAITING_FOR_ACTIVITY_REVIEW"
    why_human: "No LLM API key available in this environment; the mock generateObject returns '{}' which is rejected by Zod schemas — the full multi-phase chain cannot be driven by the built-in mock model without scripted per-agent responses. Only the isolated unit tests (which inject scripted models) and the integration tests (which vi.spyOn the runner functions) are executable offline."
  - test: "Verify OBSERVING phase auto-advance logic handles the root_cause_found vs more_diagnosis_needed decision correctly when driven by a real agent"
    expected: "After executing a diagnostic command, the problem_analyzer in OBSERVING either emits root_cause_found (→ PLANNING_FIX) or more_diagnosis_needed (→ TRIAGING). The orchestrator does not have an auto-advance handler for OBSERVING — Phase 6 routes are expected to deliver that event via POST /next with an explicit event payload."
    why_human: "OBSERVING has no agentDispatch branch in advance() — the phase waits for an external event. This is by design (Phase 6 wires the HTTP event delivery), but needs a human to confirm the Phase 5 → Phase 6 handoff contract is correctly understood and documented."
---

# Phase 05: Agent Loop + Orchestrator Verification Report

**Phase Goal:** The AI can diagnose a Linux service incident end-to-end — from ranked hypotheses through a fix proposal to a validated, persistence-checked resolution — under deterministic orchestrator control
**Verified:** 2026-06-07T00:15:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | RunPhase enum contains all 14 ARCHITECTURE §4 phases and rejects the old 5-value set | VERIFIED | `store/schema.ts` lines 5–20: exact 14-value z.enum; `RunPhase.parse('ANALYSIS')` throws (test 1 of 10 in RunPhase block); grep returns 0 matches for `ANALYSIS\|DIAGNOSIS\|REPORT` |
| 2 | DiagnosticProposalSchema validates ranked hypotheses array with cause/evidence/confidence plus one command | VERIFIED | `ai/types.ts` lines 3–18: z.array(...).min(1) with confidence z.number().min(0).max(1); 4 parse/reject tests all green |
| 3 | FixProposalSchema validates rootCause, command, rationale, rollbackCommand, isReversible, persistenceNote | VERIFIED | `ai/types.ts` lines 20–27: all 6 fields present; 2 parse/reject tests green |
| 4 | ValidationResultSchema validates status enum VERIFIED_FIXED\|LIKELY_FIXED\|NOT_FIXED and benefitCheck/persistenceCheck with superRefine enforcing VERIFIED_FIXED requires non-null persistenceCheck | VERIFIED | `ai/types.ts` lines 29–44: superRefine present; 5 parse/reject/superRefine tests all green |
| 5 | All exported TS types are inferred from Zod schemas — no manual interface duplication | VERIFIED | `ai/types.ts` lines 46–48: all three types via `z.infer<>`; `orchestrator.ts` imports `type` from `types.js`, not re-declared |
| 6 | getModel() returns real openai provider or mock LanguageModelV1 depending on resolveClientMode('llm') | VERIFIED | `ai/model.ts` lines 5–29: MOCK_MODEL object with specificationVersion:'v1', modelId:'mock'; real path calls `createOpenAI({apiKey: env.OPENAI_API_KEY})(env.LLM_MODEL)` |
| 7 | Four prompt strings exported; none contain hardcoded incident data (DIAG-02) | VERIFIED | `ai/prompts.ts` all 4 exports present; grep for `status-api\|vm-01\|localhost:8080\|EADDRINUSE\|ticket_123\|azureuser` returns exit 1 (no matches); 7 generalization tests green |
| 8 | All four agents use generateObject with their Zod schema and degrade to AgentUnavailableError on failure | VERIFIED | All 4 agent files import `generateObject` from 'ai', pass their respective schema, wrap in Promise.race with 30s timeout, catch-all → `AgentUnavailableError`; degradation tests green |
| 9 | reduce(state, event) is a pure function — no async, no I/O, no imports of store or SSH | VERIFIED | `orchestrator.ts` line 81: `reduce()` is synchronous; all I/O imports (store, event-bus, ssh) are only used by `advance()` and `agentDispatch()`; `reduce()` imports only types and schema values |
| 10 | All 13 reducer transition cases from plan truth table implemented and tested | VERIFIED | 15 reducer tests in describe 'reducer transitions' all green (344/344 total); transitions: TRIAGING→WAITING_FOR_APPROVAL, TRIAGING loop on blocked, WAITING_FOR_APPROVAL→TRIAGING on reject, EXECUTING_COMMAND→OBSERVING, OBSERVING→PLANNING_FIX, OBSERVING→TRIAGING, PLANNING_FIX→WAITING_FOR_APPROVAL, VALIDATING→DRAFTING_ACTIVITY (VERIFIED/LIKELY), VALIDATING→TRIAGING (NOT_FIXED), max-steps cap→WAITING_FOR_ACTIVITY_REVIEW, abort→ABORTED, unrecoverable_error→FAILED, terminal guard |
| 11 | advance(runId) drives happy path CREATED→WAITING_FOR_APPROVAL and all 7 integration scenarios pass | VERIFIED | 7 integration tests in describe 'orchestrator driver — integration' all green; happy path, blocked command, rejection, approval+SSH execution, max-steps cap, agent failure degradation, generalisation check |
| 12 | A blocked command triggers audit command.blocked and loops back to TRIAGING without creating an approval row | VERIFIED | Test 2: `cat /etc/shadow` blocked by policy → phase=TRIAGING, audit contains 'command.blocked', command_approvals table has 0 rows |
| 13 | Agent failure degrades gracefully: advance() resolves with TRIAGING unchanged, audit 'agent.unavailable', no approval row | VERIFIED | Test 6: mock throws 'LLM timeout' → phase=TRIAGING, audit 'agent.unavailable' with message matching /LLM timeout/i, advance() resolves |

**Score:** 13/13 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/src/store/schema.ts` | RunPhase enum with 14 rich values | VERIFIED | Lines 5–20: 14-value z.enum; old values absent |
| `backend/src/ai/types.ts` | DiagnosticProposalSchema, FixProposalSchema, ValidationResultSchema + inferred types | VERIFIED | All 6 exports present (3 schemas + 3 inferred types) |
| `backend/src/ai/model.ts` | getModel() factory — real openai or mock LanguageModelV1 | VERIFIED | Fully implemented, not a stub; both paths present |
| `backend/src/ai/prompts.ts` | 4 system prompt string constants | VERIFIED | All 4 exports present; each >200 chars; safety preamble present in all |
| `backend/src/ai/agents/problem-analyzer.ts` | runProblemAnalyzer, AgentUnavailableError, MOCK_DIAGNOSTIC_PROPOSAL | VERIFIED | All 3 exports present; generateObject wired with DiagnosticProposalSchema |
| `backend/src/ai/agents/customer-system-analyzer.ts` | runCustomerSystemAnalyzer, CustomerSystemContextSchema | VERIFIED | Both exports present; schema `{summary: z.string().min(1)}` |
| `backend/src/ai/agents/problem-solver.ts` | runProblemSolver | VERIFIED | Export present; generateObject wired with FixProposalSchema from types.ts |
| `backend/src/ai/agents/validator.ts` | runValidator, MOCK_VALIDATION_RESULT_LIKELY | VERIFIED | Both exports present; ValidationResultSchema imported from types.ts (preserves superRefine) |
| `backend/src/ai/orchestrator.ts` | reduce(), advance(), createInitialState(), setStepCountForTest(), MAX_STEPS, all types | VERIFIED | All exports present; reduce() is pure; advance() is async driver with full side-effect performer |
| `backend/src/events/run-event-bus.ts` | RunEventBus class with emit()/subscribe(), runEventBus singleton | VERIFIED | Implemented from stub during Plan 05; imported and used in advance() performSideEffects |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `ai/types.ts` | `ai/agents/problem-analyzer.ts` | DiagnosticProposalSchema passed to generateObject | VERIFIED | `problem-analyzer.ts` line 4: `import { DiagnosticProposalSchema } from '../types.js'`; line 44: `schema: DiagnosticProposalSchema` |
| `ai/types.ts` | `ai/agents/validator.ts` | ValidationResultSchema imported (preserving superRefine) | VERIFIED | `validator.ts` line 5: `import { ValidationResultSchema } from '../types.js'` — not re-declared |
| `store/schema.ts` | `ai/orchestrator.ts` | RunPhaseValue type constrains reducer nextState | VERIFIED | `orchestrator.ts` line 1: `import type { RunPhaseValue, RunStatusValue, ... }` from schema; OrchestratorState.phase typed as RunPhaseValue |
| `ai/orchestrator.ts` (driver) | `store/audit.ts` | appendAuditEvent, createPendingApproval, appendObservation side-effect handlers | VERIFIED | `orchestrator.ts` lines 8–13: all 5 audit functions imported; performSideEffects calls each |
| `ai/orchestrator.ts` (driver) | `events/run-event-bus.ts` | emitEvent side-effect handler calls runEventBus.emit | VERIFIED | `orchestrator.ts` line 14: `import { runEventBus }`; line 345: `runEventBus.emit(...)` |
| `ai/orchestrator.ts` (driver) | `ai/agents/problem-analyzer.ts` | TRIAGING phase calls runProblemAnalyzer | VERIFIED | `orchestrator.ts` line 17: import; line 406: `await runProblemAnalyzer(...)` in TRIAGING case |
| `ai/orchestrator.ts` (driver) | `safety/command-policy.ts` | validateCommandAgainstPolicy called on proposal.command | VERIFIED | `orchestrator.ts` line 15: import; lines 411, 465, 557: called before any approval creation |
| `ai/model.ts` | `ai/agents/problem-analyzer.ts` | getModel() used as default model | VERIFIED | `problem-analyzer.ts` line 3: `import { getModel }`; line 41: `model ?? getModel()` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `advance()` TRIAGING path | `proposal` (DiagnosticProposal) | `runProblemAnalyzer()` → generateObject → Zod parse | Yes — in real mode; mock model returns '{}' which Zod rejects (by design, tests inject scripted mocks via vi.spyOn) | FLOWING (mock-gated) |
| `advance()` command_approved path | `cmdResult` | `MockSshExecutor.executeApprovedCommand()` | Yes — MockSshExecutor returns MOCK_SSH_FIXTURES keyed to command strings | FLOWING |
| `advance()` observation write | `appendObservation(... redactSecrets(stdout))` | SSH result → redactSecrets → appendObservation | Yes — redacted stdout written to observations table | FLOWING |
| `advance()` audit writes | audit_events rows | appendAuditEvent calls in performSideEffects | Yes — queryable in integration tests via getAuditEvents() | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full test suite passes | `npx vitest run` from backend/ | 344/344 tests, 15 files, exit 0 | PASS |
| tsc type-check clean | `npx tsc --noEmit` | exit 0 | PASS |
| Old RunPhase values absent | grep ANALYSIS\|DIAGNOSIS\|REPORT in schema.ts | 0 matches | PASS |
| New mid-phase values present | grep PLANNING_FIX\|LOADED_CONTEXT\|WAITING_FOR_APPROVAL | 5 matches found | PASS |
| No hardcoded fixture strings in agents/prompts | grep status-api\|vm-01\|localhost:8080\|EADDRINUSE\|ticket_123\|azureuser | 0 matches | PASS |
| A1 guard: executeApprovedCommand only in command_approved handler | grep executeApprovedCommand in orchestrator.ts | 1 match at line 581 (inside command_approved branch only) | PASS |
| reduce() has no I/O imports | grep import.*store/audit\|store/runs\|ssh/executor\|run-event-bus in pure reduce() scope | I/O imports exist in file but only used by advance()/agentDispatch(); reduce() body is free of I/O calls | PASS |

### Probe Execution

No probe scripts declared in plans or present under `scripts/*/tests/`. Step skipped — not applicable for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DIAG-01 | 05-01, 05-03, 05-05 | problem_analyzer returns ranked hypotheses with evidence + one read-only diagnostic command | SATISFIED | DiagnosticProposalSchema enforces hypotheses[].{cause,evidence,confidence} + command + isReadOnly; runProblemAnalyzer tested with scripted mock returning isReadOnly:true |
| DIAG-02 | 05-02, 05-05 | Agent prompts generalise — no branches keyed to ticket IDs, hostnames, or symptom strings | SATISFIED | 7 generalization tests green; grep returns 0 matches for all forbidden strings in prompts.ts and agents/ |
| DIAG-03 | 05-04, 05-05 | Deterministic orchestrator drives phases with max-steps cap; block → ask alternative | SATISFIED | 15 reducer tests + 7 integration tests all green; cap at stepCount=12 → WAITING_FOR_ACTIVITY_REVIEW confirmed; blocked command → TRIAGING loop with no approval row confirmed |
| DIAG-04 | 05-01, 05-03 | problem_solver proposes minimal reversible fix with rollback | SATISFIED | FixProposalSchema enforces rollbackCommand + isReversible + persistenceNote; runProblemSolver wired to schema |
| DIAG-05 | 05-01, 05-03 | validator proves customer benefit restored; LIKELY_FIXED vs VERIFIED_FIXED; never is-active | SATISFIED | ValidationResultSchema: VERIFIED_FIXED requires non-null persistenceCheck (superRefine); VALIDATOR_SYSTEM_PROMPT contains both status names and does not contain 'is-active'; MOCK_VALIDATION_RESULT_LIKELY has status:'LIKELY_FIXED' |

Note: REQUIREMENTS.md marks DIAG-03 as "Pending" in the traceability table. The table entry appears to be stale — the implementation and its test suite fully satisfy the requirement as verified above. The roadmap's success criteria for Phase 5 are met.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `orchestrator.ts` | 383–396 | Dummy DiagnosticProposal with empty strings passed to reduce() for max-steps trigger | Info | Not a stub — the reducer short-circuits to WAITING_FOR_ACTIVITY_REVIEW before acting on the proposal fields. The empty values never reach a createPendingApproval or SSH call. Intentional design; no impact. |
| `orchestrator.ts` | 574–578 | SSH target username hardcoded as `'azureuser'` and privateKeyPath as `'/keys/id_rsa'` | Warning | Phase 5 uses MockSshExecutor exclusively, so the hardcoded values are never exercised. Phase 6 is expected to inject a factory that reads these from the run's customer system record. Not a blocker for Phase 5's goal but should be resolved before Phase 6 wires the real SSH executor. |

No TBD, FIXME, or XXX markers found in any phase-5-modified files.

### Human Verification Required

#### 1. Full end-to-end multi-phase run with real LLM

**Test:** Set `MOCK_MODE=false` and a valid `OPENAI_API_KEY`/`LLM_MODEL`. Create a run, call `advance()` repeatedly (or via Phase 6 routes once available) through TRIAGING → WAITING_FOR_APPROVAL → EXECUTING_COMMAND → OBSERVING → PLANNING_FIX → VALIDATING → DRAFTING_ACTIVITY using the mock SSH fixtures.

**Expected:** Each agent returns a valid structured-output object (Zod parse succeeds). The state machine traverses all phases in order. The validator reaches VERIFIED_FIXED or LIKELY_FIXED. The run transitions to WAITING_FOR_ACTIVITY_REVIEW. No agent invents facts; no hardcoded incident strings appear in proposals.

**Why human:** No LLM API key is available in this environment. The mock `doGenerate` returns `'{}'` which Zod correctly rejects — the multi-phase chain cannot complete without scripted per-agent responses or a real LLM. The integration tests exercise this path via `vi.spyOn` with scripted mock return values, but real LLM structured-output conformance cannot be verified programmatically here.

#### 2. OBSERVING phase — event delivery contract with Phase 6

**Test:** After a command executes and the run reaches OBSERVING, confirm how the `root_cause_found` or `more_diagnosis_needed` event is delivered. Check whether Phase 6's `POST /api/runs/:id/next` is expected to carry this event as a body payload, or whether `advance()` should auto-dispatch from OBSERVING.

**Expected:** Either (a) `agentDispatch` in `advance()` handles OBSERVING by calling an agent and emitting root_cause_found/more_diagnosis_needed, or (b) Phase 6 routes deliver this event externally. Currently `agentDispatch` has no OBSERVING case — it falls through to `default: return currentState`. This is intentional for Phase 5 scope but must be confirmed as the correct contract before Phase 6 is planned.

**Why human:** The gap is a design boundary question (Phase 5 vs Phase 6 responsibility split), not a bug. The Phase 5 tests drive OBSERVING→PLANNING_FIX transitions by passing an explicit `root_cause_found` event to `advance()`, which is correct for the unit tests. But the production flow requires a decision on whether a second agent call (re-running problem_analyzer with updated observations) should be auto-triggered or externally triggered.

### Gaps Summary

No gaps. All 13 must-have truths are verified. 344/344 tests pass. tsc clean. The two human verification items are design-boundary questions and a real-LLM conformance check — neither indicates missing or broken code.

---

_Verified: 2026-06-07T00:15:00Z_
_Verifier: Claude (gsd-verifier)_
