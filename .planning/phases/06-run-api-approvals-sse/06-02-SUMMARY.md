---
phase: "06-run-api-approvals-sse"
plan: "02"
subsystem: "approvals-routes"
tags: ["hono", "tdd", "approvals", "safety", "api"]
dependency_graph:
  requires: ["06-01"]
  provides: ["approvalsRouter", "approve-route", "reject-route"]
  affects: ["backend/src/app.ts"]
tech_stack:
  added: []
  patterns: ["hono sub-router", "zod body validation", "vi.spyOn advance mocking", "defence-in-depth 422 detection"]
key_files:
  created:
    - backend/src/routes/approvals.ts
    - backend/src/tests/approvals.test.ts
  modified:
    - backend/src/app.ts
decisions:
  - "approvalsRouter uses full path segments (/:runId/approvals/:approvalId/approve) and is mounted separately at /api/runs in app.ts — matches ARCHITECTURE.md pattern and avoids nested router complexity"
  - "422 blocked detection: if state.phase === WAITING_FOR_APPROVAL after a command_approved advance() call, the safety gate fired — no need to inspect audit events separately"
  - "safetyRecheck.riskLevel reads approval.risk_level from the DB row, never hardcoded — test verifies this with LOW_RISK_CHANGE fixture"
metrics:
  duration: "~4 minutes"
  completed_date: "2026-06-06T22:52:40Z"
  tasks_completed: 2
  files_changed: 3
---

# Phase 06 Plan 02: Approval and Rejection Routes Summary

TDD implementation of the two approval routes: POST /:runId/approvals/:approvalId/approve and POST /:runId/approvals/:approvalId/reject, with defence-in-depth 422 detection for blocked commands and 409 replay guard for already-decided approvals.

## What Was Built

`approvalsRouter` in `backend/src/routes/approvals.ts` — a Hono router mounted at `/api/runs` in `app.ts` (alongside `runsRouter`) handling:

- `POST /api/runs/:runId/approvals/:approvalId/approve` — looks up run + approval, checks PENDING status, calls `advance(runId, { type: 'command_approved', approvalId, finalCommand })`, detects blocked command via phase === WAITING_FOR_APPROVAL → 422, otherwise returns 200 with `safetyRecheck.riskLevel` from the stored DB row
- `POST /api/runs/:runId/approvals/:approvalId/reject` — Zod enforces non-empty reason, checks PENDING status, calls `advance(runId, { type: 'command_rejected', reason })`, returns 200

15 contract tests in `backend/src/tests/approvals.test.ts` cover all safety-critical paths: 422-on-blocked, 409-on-duplicate, 400-on-empty-reason, 404-on-unknown-run, 404-on-unknown-approval, and riskLevel-not-hardcoded.

## TDD Gate Compliance

- RED commit: `b4697f3` — test(06-02): 15 failing tests
- GREEN commit: `0612db3` — feat(06-02): implementation passes all 15

## Commits

| Hash | Message |
|------|---------|
| b4697f3 | test(06-02): add failing contract tests for approval/reject routes |
| 0612db3 | feat(06-02): implement approvalsRouter — approve and reject routes |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Coverage

| Threat | Mitigation | Verified |
|--------|-----------|---------|
| T-06-05: editedCommand tampering | advance() re-validates via validateCommandAgainstPolicy; 422 if blocked | Yes — test case mocks advance returning WAITING_FOR_APPROVAL |
| T-06-06: duplicate/stale approval replay | Route checks approval.status === 'PENDING' before calling advance(); 409 otherwise | Yes — test verifies APPROVED and EXECUTED both return 409 |
| T-06-07: 422 information disclosure | 422 returns only riskLevel + error string, no raw command | Yes — response shape verified in test |
| T-06-08: empty-reason reject | z.string().min(1) → 400 before any state change | Yes — test verifies empty string and missing reason both return 400 |

## Self-Check: PASSED

All files and commits verified on disk.
