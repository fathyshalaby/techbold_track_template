---
phase: "05"
plan: "01"
subsystem: store/schema + ai/types
tags: [zod, schema, state-machine, tdd, types]
dependency_graph:
  requires: []
  provides:
    - RunPhase enum (14 ARCHITECTURE §4 values)
    - DiagnosticProposalSchema
    - FixProposalSchema
    - ValidationResultSchema
  affects:
    - backend/src/store/schema.ts
    - backend/src/ai/orchestrator.ts
    - backend/src/ai/agents/
tech_stack:
  added: []
  patterns:
    - Zod schema-first — inferred TS types, never manual interface duplication
    - superRefine for cross-field validation (VERIFIED_FIXED requires non-null persistenceCheck)
key_files:
  created:
    - backend/src/ai/types.ts
  modified:
    - backend/src/store/schema.ts
    - backend/src/tests/orchestrator.test.ts
decisions:
  - "RunPhase locked to 14-value ARCHITECTURE §4 set; old 7-value enum (ANALYSIS/DIAGNOSIS/FIX/VALIDATION/REPORT) fully removed"
  - "ValidationResultSchema uses superRefine to enforce VERIFIED_FIXED requires non-null persistenceCheck"
  - "All TS types inferred via z.infer<> — no manual interface duplication"
metrics:
  duration: "2 min"
  completed: "2026-06-06"
  tasks_completed: 2
  files_modified: 3
---

# Phase 05 Plan 01: RunPhase Migration + Agent Zod Schemas Summary

RunPhase enum migrated to all 14 ARCHITECTURE §4 states, and three structured-output Zod schemas (DiagnosticProposal, FixProposal, ValidationResult) defined and unit-tested — locking the contracts every downstream agent and orchestrator reducer compiles against.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing tests for RunPhase + agent schemas | 0b0ec5d | backend/src/tests/orchestrator.test.ts |
| 1 (GREEN) | Migrate RunPhase to 14-value set | 5ad2cd3 | backend/src/store/schema.ts |
| 2 (GREEN) | Define DiagnosticProposal, FixProposal, ValidationResult | af2ff23 | backend/src/ai/types.ts |

## What Was Built

### Task 1 — RunPhase Enum Migration

Replaced the 7-value stale enum (`CREATED, ANALYSIS, DIAGNOSIS, FIX, VALIDATION, REPORT, COMPLETED`) with the 14-value ARCHITECTURE §4 set:

`CREATED, LOADED_CONTEXT, TRIAGING, WAITING_FOR_APPROVAL, EXECUTING_COMMAND, OBSERVING, PLANNING_FIX, VALIDATING, DRAFTING_ACTIVITY, WAITING_FOR_ACTIVITY_REVIEW, SUBMITTING_ACTIVITY, COMPLETED, FAILED, ABORTED`

`RunStatus` is unchanged. `runs.ts` required no changes — `createRun` hardcodes `'CREATED'` (still valid) and `updateRunPhase` already accepts `string`.

### Task 2 — Agent Structured-Output Zod Schemas

Created `backend/src/ai/types.ts` with:

- **DiagnosticProposalSchema** — `hypotheses[].confidence` uses `z.number().min(0).max(1)`; `hypotheses` is `.min(1)`; plus `command`, `purpose`, `expectedSignal`, `riskNotes`, `isReadOnly`.
- **FixProposalSchema** — `rootCause`, `command`, `rationale`, `rollbackCommand`, `isReversible`, `persistenceNote`.
- **ValidationResultSchema** — status enum `VERIFIED_FIXED | LIKELY_FIXED | NOT_FIXED`; `persistenceCheck: z.string().nullable()`; `superRefine` enforces `VERIFIED_FIXED` requires non-null `persistenceCheck`.
- Inferred TS types exported: `DiagnosticProposal`, `FixProposal`, `ValidationResult`.

## Test Results

- 21 tests in `orchestrator.test.ts`: all GREEN
- Full suite: 308 tests across 15 files — all GREEN, zero regressions

## Deviations from Plan

None — plan executed exactly as written.

One note: the plan's final verification command `grep -c 'ANALYSIS\|DIAGNOSIS\|FIX\|VALIDATION\|REPORT'` returns 1 because `PLANNING_FIX` (a new legitimate phase) contains the substring `FIX`. This is a false positive in the grep pattern, not a bug. The old standalone `FIX` value is absent, confirmed by the passing Zod tests that reject `RunPhase.parse('FIX')`.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries beyond what the plan specified.

## Known Stubs

None.

## Self-Check: PASSED

- `backend/src/ai/types.ts` — FOUND
- `backend/src/store/schema.ts` — FOUND (LOADED_CONTEXT + 13 other phases present)
- `backend/src/tests/orchestrator.test.ts` — FOUND (21 tests)
- Commits: 0b0ec5d, 5ad2cd3, af2ff23 — all present in git log
