---
phase: "05"
plan: "03"
subsystem: ai-agents
tags: [ai-sdk, generateObject, zod, structured-output, tdd, degradation, mock-llm]
dependency_graph:
  requires: ["05-01", "05-02"]
  provides:
    - runProblemAnalyzer
    - runCustomerSystemAnalyzer
    - runProblemSolver
    - runValidator
    - AgentUnavailableError
    - MOCK_DIAGNOSTIC_PROPOSAL
    - MOCK_VALIDATION_RESULT_LIKELY
    - CustomerSystemContextSchema
  affects:
    - backend/src/ai/orchestrator.ts
tech_stack:
  added: []
  patterns:
    - "generateObject + Zod schema — structured output, never free-form"
    - "Promise.race with 30s timeout for LLM calls"
    - "Optional model injection parameter for testability without module mocking"
    - "AgentUnavailableError catch-all — any model throw degrades gracefully"
key_files:
  created: []
  modified:
    - backend/src/ai/agents/problem-analyzer.ts
    - backend/src/ai/agents/customer-system-analyzer.ts
    - backend/src/ai/agents/problem-solver.ts
    - backend/src/ai/agents/validator.ts
    - backend/src/tests/orchestrator.test.ts
decisions:
  - "Optional model parameter on each runner function (model?: LanguageModelV1) enables direct injection in tests without vi.mock — avoids module-mock complexity"
  - "AgentUnavailableError declared in problem-analyzer.ts and re-exported from each agent — single source of truth, no shared errors module needed at this stage"
  - "ValidationResultSchema imported from ai/types.ts in validator.ts — preserves superRefine VERIFIED_FIXED constraint; re-declaring would lose it"
  - "MOCK_DIAGNOSTIC_PROPOSAL and MOCK_VALIDATION_RESULT_LIKELY exported as named consts from their respective agent files for orchestrator integration test use"
  - "30s timeout via Promise.race — no AbortSignal complexity needed; any rejection (timeout or model error) lands in the catch block → AgentUnavailableError"
metrics:
  duration: "~2min"
  completed: "2026-06-06"
  tasks: 2
  files: 5
---

# Phase 05 Plan 03: Structured-Output Agent Functions Summary

Four AI agent runner functions implemented with Zod-validated structured output via `generateObject` — problem_analyzer, customer_system_analyzer, problem_solver, validator — each degrading to `AgentUnavailableError` on any model failure.

## What Was Built

### `backend/src/ai/agents/problem-analyzer.ts`

`runProblemAnalyzer(input, model?)` — calls `generateObject` with `DiagnosticProposalSchema` (imported from `ai/types.ts`), wraps in `Promise.race` with 30s timeout, catches any throw and re-throws as `AgentUnavailableError`.

Exports:
- `runProblemAnalyzer` — async runner
- `AgentUnavailableError` — error class (name: 'AgentUnavailableError')
- `MOCK_DIAGNOSTIC_PROPOSAL` — valid fixture for orchestrator integration tests
- `DiagnosticProposalSchema`, `DiagnosticProposal` type (re-exported from types.ts)
- `ProblemAnalyzerInput` type

### `backend/src/ai/agents/customer-system-analyzer.ts`

`runCustomerSystemAnalyzer(input, model?)` — calls `generateObject` with `CustomerSystemContextSchema` (declared here: `{ summary: z.string().min(1) }`), same timeout + degradation pattern.

Exports:
- `runCustomerSystemAnalyzer`
- `CustomerSystemContextSchema` — the only schema not in types.ts (scoped to this agent)
- `CustomerSystemContext` type
- `CustomerSystemAnalyzerInput` type

### `backend/src/ai/agents/problem-solver.ts`

`runProblemSolver(input, model?)` — calls `generateObject` with `FixProposalSchema` (from types.ts).

Exports:
- `runProblemSolver`
- `FixProposalSchema`, `FixProposal` type (re-exported from types.ts)
- `ProblemSolverInput` type

### `backend/src/ai/agents/validator.ts`

`runValidator(input, model?)` — calls `generateObject` with `ValidationResultSchema` (imported from types.ts, preserving the `.superRefine()` VERIFIED_FIXED constraint).

Exports:
- `runValidator`
- `MOCK_VALIDATION_RESULT_LIKELY` — fixture with `status: 'LIKELY_FIXED'`
- `ValidationResultSchema`, `ValidationResult` type (re-exported from types.ts)
- `ValidatorInput` type

### `backend/src/tests/orchestrator.test.ts` (appended)

Three new describe blocks:

| Block | Tests |
|-------|-------|
| `agent schemas` | CustomerSystemContextSchema parse/reject (3 tests) |
| `agent degradation` | runProblemAnalyzer + throwing model → AgentUnavailableError (2 tests) |
| `agent mock output` | runProblemAnalyzer scripted mock → hypotheses≥1 + isReadOnly=true; runValidator scripted mock → LIKELY_FIXED (2 tests) |

Total: 35 tests (28 prior + 7 new), all passing.

## TDD Gate Compliance

| Gate | Commit | Message |
|------|--------|---------|
| RED | `1f43fa9` | `test(05-03): add failing agent schema, degradation, and mock output tests` |
| GREEN | `bb9630e` | `feat(05-03): implement four structured-output agent functions` |

RED: 5 new tests failed, 30 prior tests passed.
GREEN: 35/35 pass, `tsc --noEmit` clean.

## Verification

```
npx vitest run src/tests/orchestrator.test.ts  → 35/35 PASS
npx tsc --noEmit                               → exit 0
grep -rn 'generateText\b' backend/src/ai/agents/  → empty
grep -rn 'executeApprovedCommand' backend/src/ai/agents/ → empty
```

## Deviations from Plan

### Auto-added (Rule 2): Optional model injection parameter

The plan's implementation spec shows `generateObject({ model: getModel(), ... })` as the call pattern but the degradation tests pass a custom `LanguageModelV1` as a second argument. To satisfy this without `vi.mock`, each runner accepts `model?: LanguageModelV1` and falls back to `getModel()` when omitted. This is a correctness requirement for the test suite — not an architectural addition.

## Threat Surface

T-05-06 (mitigated): Observations injected as `JSON.stringify(...)` user-turn content; system prompts are static string constants from `prompts.ts` — no runtime content merges into the system prompt.

T-05-08 (mitigated): `Promise.race` with 30s timeout on every `generateObject` call; any overrun throws `AgentUnavailableError`.

## Known Stubs

None — all four agent functions are fully wired. The `MOCK_*` fixtures are intentional exports for use by the orchestrator integration test in Plan 05.

## Self-Check: PASSED

Files exist:
- `backend/src/ai/agents/problem-analyzer.ts` — FOUND
- `backend/src/ai/agents/customer-system-analyzer.ts` — FOUND
- `backend/src/ai/agents/problem-solver.ts` — FOUND
- `backend/src/ai/agents/validator.ts` — FOUND
- `backend/src/tests/orchestrator.test.ts` — FOUND

Commits:
- `1f43fa9` test(05-03): add failing agent schema, degradation, and mock output tests
- `bb9630e` feat(05-03): implement four structured-output agent functions

35/35 tests passing. tsc --noEmit exit 0.
