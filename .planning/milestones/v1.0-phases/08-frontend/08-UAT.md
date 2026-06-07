---
status: testing
phase: 08-frontend
source: [08-VERIFICATION.md]
started: 2026-06-07T01:36:17Z
updated: 2026-06-07T02:05:00Z
---

## Current Test

number: 3
name: SSE timeline live updates
expected: |
  Clicking Advance appends events to the timeline live (no page refresh); each
  row shows a timestamp, icon, and label; timeline auto-scrolls to the latest
  entry.
awaiting: user response

## Tests

### 1. Ticket list rendering — rows, badges, filter toolbar
expected: A populated ticket list with functional filter toolbar (status/sort selects change the displayed tickets)
result: pass

### 2. createRun → customerSystem flow
expected: Clicking a ticket opens RunView with the customer-system header showing real ip/port/username/os from the createRun response (no "–" fallbacks)
result: pass

### 3. SSE timeline live updates
expected: Clicking Advance appends events to the timeline live (no page refresh); each row shows a timestamp, icon, and label; timeline auto-scrolls to the latest entry
result: issue
reported: "its just at triaging and then nothing appears"
severity: blocker

### 4. Approval card all three modes
expected: (a) Approve advances the run; (b) edit-then-approve re-runs the safety gate — success advances, a 422 shows "Command blocked by safety policy — edit or reject."; (c) reject-with-reason continues with the agent proposing an alternative
result: [pending]

### 5. Activity editor pre-fill and submit
expected: At WAITING_FOR_ACTIVITY_REVIEW, "Review Activity Report" opens ActivityView with all five textareas pre-filled from the draft; editing a field and clicking Submit posts the overrides and shows the success confirmation
result: [pending]

### 6. ERP-unavailable banner path
expected: With VITE_API_BASE set to an invalid URL, the ticket list shows an ERP-unavailable banner. NOTE: listTickets currently swallows errors and returns [] — the banner is unreachable; this item is a decision point (accept silent-empty for demo, or fix listTickets to rethrow)
result: [pending]

## Summary

total: 6
passed: 2
issues: 1
pending: 3
skipped: 0
blocked: 0

## Gaps

- truth: "Clicking Advance appends events to the timeline live; the run progresses past TRIAGING into WAITING_FOR_APPROVAL"
  status: failed
  reason: "User reported: its just at triaging and then nothing appears"
  severity: blocker
  test: 3
  root_cause: "In mock LLM mode, getModel() returns MOCK_MODEL whose doGenerate emits text '{}'. generateObject validates '{}' against the strict DiagnosticProposalSchema, which fails, so runProblemAnalyzer throws AgentUnavailableError; the orchestrator catches it, audits 'agent.unavailable', and stays at TRIAGING. The MOCK_DIAGNOSTIC_PROPOSAL / MOCK_VALIDATION_RESULT_LIKELY / MOCK fix constants are exported by each agent but never returned — the mock-mode short-circuit was never wired in. Same gap in all three agents (problem-analyzer, problem-solver, validator)."
  artifacts:
    - path: "backend/src/ai/model.ts"
      issue: "MOCK_MODEL.doGenerate returns text '{}' which cannot satisfy any structured-output schema"
    - path: "backend/src/ai/agents/problem-analyzer.ts"
      issue: "runProblemAnalyzer always calls getModel()/generateObject; MOCK_DIAGNOSTIC_PROPOSAL is exported but unused — no mock short-circuit"
    - path: "backend/src/ai/agents/problem-solver.ts"
      issue: "runProblemSolver has the same gap; mock fix-proposal constant unused"
    - path: "backend/src/ai/agents/validator.ts"
      issue: "runValidator has the same gap; MOCK_VALIDATION_RESULT_LIKELY unused"
  missing:
    - "Wire mock-mode short-circuit in each agent: when resolveClientMode('llm') === 'mock', return the agent's MOCK_* constant instead of calling generateObject"
  debug_session: ""
