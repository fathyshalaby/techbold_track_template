---
phase: "05"
plan: "04"
subsystem: orchestrator
tags: [state-machine, pure-reducer, tdd, orchestrator]
dependency_graph:
  requires: ["05-01", "05-02"]
  provides: ["05-05"]
  affects: ["backend/src/ai/orchestrator.ts"]
tech_stack:
  added: []
  patterns: [pure-reducer, discriminated-union, tdd-red-green]
key_files:
  created: []
  modified:
    - backend/src/ai/orchestrator.ts
    - backend/src/tests/orchestrator.test.ts
decisions:
  - "reduce() imports only types and schema enum values — zero store/SSH/event-bus imports enforced by grep gate"
  - "MAX_STEPS=12 transitions to WAITING_FOR_ACTIVITY_REVIEW (not TRIAGING) so a capped run reaches human review, not infinite loop"
  - "Terminal guard is the first check in reduce() — COMPLETED/FAILED/ABORTED return {nextState: state, sideEffects: []} unconditionally"
  - "SideEffect union keeps updateRunPhase and updateRunStatus as explicit effects so the async driver (Plan 05) has a complete effect list with no implicit state writes"
metrics:
  duration: "~8 min"
  completed: "2026-06-06"
  tasks_completed: 2
  files_changed: 2
---

# Phase 05 Plan 04: Pure Orchestrator Reducer (State Machine) Summary

Pure `reduce(state, event) → {nextState, sideEffects}` function implementing all run-phase transitions for the Service Desk Autopilot orchestrator, with zero I/O and a full TDD test suite covering all 15 transition cases.

## What Was Built

`backend/src/ai/orchestrator.ts` exports:

- `reduce(state, event)` — pure function, no async, no imports from store/SSH/event-bus
- `OrchestratorState` — typed run snapshot (`runId`, `phase`, `status`, `stepCount`, `ticketId`, `customerSystemId`, `errorMessage?`)
- `OrchestratorEvent` — discriminated union of 11 event types covering the full diagnostic loop
- `SideEffect` — discriminated union of 6 effect types; the async driver (Plan 05) executes these
- `ReducerResult` — `{nextState, sideEffects[]}`
- `MAX_STEPS = 12` — exported constant used by the cap guard

All 15 transition cases from the plan truth table are implemented and tested.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (failing tests) | 8ca2dde | PASS — 15 failed, 35 passed |
| GREEN (implementation) | 662973d | PASS — 50/50 passed |
| REFACTOR | — | Not needed — code is readable as written |

## Transition Table Implemented

| From Phase | Event | To Phase | Key Side Effects |
|------------|-------|----------|-----------------|
| TRIAGING | diagnostic_proposal_ready | WAITING_FOR_APPROVAL | createPendingApproval, emitEvent(approval.required) |
| TRIAGING | command_blocked | TRIAGING | appendAuditEvent(command.blocked) |
| WAITING_FOR_APPROVAL | command_rejected | TRIAGING | appendAuditEvent(command.rejected) |
| EXECUTING_COMMAND | command_result | OBSERVING | appendObservation, appendAuditEvent(command.completed) |
| OBSERVING | root_cause_found | PLANNING_FIX | — |
| OBSERVING | more_diagnosis_needed | TRIAGING | — |
| PLANNING_FIX | fix_proposal_ready | WAITING_FOR_APPROVAL | createPendingApproval, emitEvent(approval.required) |
| VALIDATING | validation_complete (VERIFIED/LIKELY_FIXED) | DRAFTING_ACTIVITY | — |
| VALIDATING | validation_complete (NOT_FIXED) | TRIAGING | — |
| any active | abort | ABORTED | updateRunStatus(ABORTED) |
| any | unrecoverable_error | FAILED | updateRunStatus(FAILED) |
| any (stepCount >= 12) | diagnostic/fix_proposal_ready | WAITING_FOR_ACTIVITY_REVIEW | appendAuditEvent(run.steps_capped) |
| COMPLETED/FAILED/ABORTED | any | (unchanged) | [] — terminal guard |

## Verification Results

```
Tests:  50 passed (50 total)
tsc --noEmit: clean
grep import.*store/audit|store/runs|ssh/executor|run-event-bus → empty
```

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Coverage

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-05-10 | Explicit transition table with default no-op; terminal guard on COMPLETED/FAILED/ABORTED |
| T-05-11 | MAX_STEPS=12 guard fires before any transition; routes to WAITING_FOR_ACTIVITY_REVIEW |
| T-05-12 | Every non-trivial transition emits at least one appendAuditEvent side effect |

## Self-Check: PASSED

- `backend/src/ai/orchestrator.ts` — FOUND
- `backend/src/tests/orchestrator.test.ts` — FOUND
- RED commit 8ca2dde — FOUND
- GREEN commit 662973d — FOUND
