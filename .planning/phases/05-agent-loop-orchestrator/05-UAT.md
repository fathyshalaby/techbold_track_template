---
status: testing
phase: 05-agent-loop-orchestrator
source: [05-VERIFICATION.md]
started: 2026-06-07T00:20:00Z
updated: 2026-06-07T00:20:00Z
---

## Current Test

number: 1
name: Full agent-loop chain end-to-end with a real LLM
expected: |
  State machine traverses TRIAGING → WAITING_FOR_APPROVAL → EXECUTING_COMMAND →
  OBSERVING → PLANNING_FIX → VALIDATING → DRAFTING_ACTIVITY in order, each agent
  returns a valid structured-output object, fix is reversible with rollback,
  validator reaches VERIFIED_FIXED or LIKELY_FIXED, run transitions to
  WAITING_FOR_ACTIVITY_REVIEW.
awaiting: user response

## Tests

### 1. Full agent-loop chain end-to-end with a real LLM
expected: |
  Run advance() through the full TRIAGING → … → DRAFTING_ACTIVITY chain with a
  real LLM API key (MOCK_MODE=false) against the mock SSH fixtures. Each agent
  produces schema-conformant structured output; the run reaches
  WAITING_FOR_ACTIVITY_REVIEW.
why_human: |
  No LLM API key in this environment; the built-in mock generateObject returns
  '{}' which Zod rejects by design. The full multi-phase chain cannot be driven
  offline without scripted per-agent responses. Unit + integration tests (scripted
  models / vi.spyOn) cover the logic offline.
result: [pending]

### 2. OBSERVING-phase event-delivery contract (Phase 5 → Phase 6 handoff)
expected: |
  After a diagnostic command executes, the problem_analyzer in OBSERVING emits
  either root_cause_found (→ PLANNING_FIX) or more_diagnosis_needed (→ TRIAGING).
  advance() has no auto-dispatch handler for OBSERVING — Phase 6 HTTP routes
  deliver that event via POST /next with an explicit event payload. Confirm the
  handoff contract is understood and documented before Phase 6 wiring.
why_human: |
  OBSERVING has no agentDispatch branch (by design). A human must confirm the
  Phase 6 event-delivery decision (external POST /next payload vs auto-dispatch
  a second problem_analyzer call from OBSERVING).
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
