---
phase: "05"
plan: "02"
subsystem: ai-model-and-prompts
tags: [ai-sdk, language-model, prompts, mock-llm, generalization, tdd]
dependency_graph:
  requires: ["05-01"]
  provides: ["getModel", "PROBLEM_ANALYZER_SYSTEM_PROMPT", "CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT", "PROBLEM_SOLVER_SYSTEM_PROMPT", "VALIDATOR_SYSTEM_PROMPT"]
  affects: ["backend/src/ai/agents/*", "backend/src/ai/orchestrator.ts"]
tech_stack:
  added: []
  patterns: ["MockLanguageModelV1 via hand-rolled object satisfying LanguageModelV1 interface", "TDD RED/GREEN for prompt generalization (DIAG-02/SC2)"]
key_files:
  created: []
  modified:
    - backend/src/ai/model.ts
    - backend/src/ai/prompts.ts
    - backend/src/tests/orchestrator.test.ts
decisions:
  - "Hand-rolled LanguageModelV1 mock object instead of importing ai/test MockLanguageModelV1 to keep test-only deps out of production code"
  - "MOCK_MODEL declared as module-level const (not per-call) — safe because it is stateless and has no per-call state to isolate"
  - "prompts.ts exports plain string consts; no template functions — runtime context (ticket, observations) is injected as user-turn content by agent callers, never baked into system prompts"
metrics:
  duration: "~10min"
  completed: "2026-06-06"
  tasks: 2
  files: 3
---

# Phase 05 Plan 02: AI Model Factory + System Prompts Summary

Wire the AI SDK provider behind a single `getModel()` factory switching between real `@ai-sdk/openai` and a deterministic mock, and define the four agent system prompt strings — enforced clean of incident-specific data by a TDD generalization gate.

## What Was Built

### `backend/src/ai/model.ts`

`getModel(): LanguageModelV1` — reads `resolveClientMode('llm')` from `env.ts`:
- `'mock'` → returns a hand-rolled object satisfying `LanguageModelV1` with `specificationVersion: 'v1'`, `provider: 'mock'`, `modelId: 'mock'`, `defaultObjectGenerationMode: 'json'`, `doGenerate` returning a minimal `{ rawCall, finishReason, usage, text: '{}' }`.
- `'real'` → `createOpenAI({ apiKey: env.OPENAI_API_KEY })(env.LLM_MODEL)`.

`OPENAI_API_KEY` is read from `getEnv()` at call time and never logged or returned to callers.

### `backend/src/ai/prompts.ts`

Four exported string constants, each opening with the shared safety preamble:
> "You propose; you never execute. A human approves every command. Use only facts from the provided ticket and observations. Never invent results. One command per turn. State the expected signal. Exhaust diagnosis before proposing any fix. Fixes must be minimal and reversible."

| Export | Role |
|--------|------|
| `PROBLEM_ANALYZER_SYSTEM_PROMPT` | Local Linux service diagnosis — ranked hypotheses + evidence, one read-only diagnostic command |
| `CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT` | Read-only OS/service/port/resource survey before diagnosis |
| `PROBLEM_SOLVER_SYSTEM_PROMPT` | Root-cause fix with rollback, reboot-persistent preference, no broad destructive ops |
| `VALIDATOR_SYSTEM_PROMPT` | Customer-benefit proof; `LIKELY_FIXED` (single success) vs `VERIFIED_FIXED` (persistence-checked); `NOT_FIXED` on failure; never `is-active` as sole proof |

No hostname, ticket ID, port number, or service name from the practice VMs appears in any prompt.

### `backend/src/tests/orchestrator.test.ts` (appended)

Added `describe('Prompt generalization (DIAG-02 / SC2)')` block with 7 tests:
- Regex blocklist for `status-api`, `vm-01`, `EADDRINUSE`, `8080`, `ticket[_-]?\d+` per prompt
- `length > 200` assertion per prompt
- `LIKELY_FIXED` and `VERIFIED_FIXED` present in `VALIDATOR_SYSTEM_PROMPT`
- `is-active` absent from `VALIDATOR_SYSTEM_PROMPT`

## TDD Gate Compliance

| Gate | Commit | Message |
|------|--------|---------|
| RED | `872bf46` | `test(05-02): add failing generalization tests for prompt constants (DIAG-02 / SC2)` |
| GREEN | `f4d612e` | `feat(05-02): implement four agent system prompt constants` |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created files found on disk. All task commits verified in git log:
- `a99d24c` feat(05-02): implement getModel() factory — real openai or deterministic mock
- `872bf46` test(05-02): add failing generalization tests for prompt constants (DIAG-02 / SC2)
- `f4d612e` feat(05-02): implement four agent system prompt constants

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| T-05-03 (mitigated) | `backend/src/ai/model.ts` | `OPENAI_API_KEY` read via `getEnv()` at call time, never logged, never returned in any response; `env.ts` already masks values in error messages |
| T-05-04 (mitigated) | `backend/src/ai/prompts.ts` | System prompt strings are static module constants; runtime context (ticket description, observations) is injected as user-turn content by agent callers, not merged into the system prompt |
| T-05-05 (mitigated) | `backend/src/ai/prompts.ts` | Generalization tests (SC2) assert no fixture hostnames/IDs in prompt strings; 7 tests now in CI |

## Known Stubs

None — `model.ts` and `prompts.ts` are fully wired. The mock `doGenerate` returns `'{}'` which is intentionally minimal; agents inject their own scripted mock responses at the call site (Plan 03).

## Self-Check

Files exist:
- `backend/src/ai/model.ts` — FOUND
- `backend/src/ai/prompts.ts` — FOUND
- `backend/src/tests/orchestrator.test.ts` — FOUND

Commits:
- `a99d24c` feat(05-02): implement getModel() factory
- `872bf46` test(05-02): add failing generalization tests
- `f4d612e` feat(05-02): implement four agent system prompt constants

All 315 tests passing (15 test files). tsc --noEmit exit 0.

## Self-Check: PASSED
