---
phase: 08-frontend
plan: "04"
subsystem: frontend
tags: [react, sse, approval-workflow, ui]
dependency_graph:
  requires: [08-01, 08-02, 08-03]
  provides: [RunView, ApprovalCard]
  affects: [frontend/src/App.tsx]
tech_stack:
  added: []
  patterns: [three-mode-approval-ui, sse-driven-timeline, refresh-on-key-events]
key_files:
  created:
    - frontend/src/components/ApprovalCard.tsx
  modified:
    - frontend/src/components/RunView.tsx
    - frontend/src/index.css
decisions:
  - "ApprovalCard distinguishes 422 blocked by inspecting err.message for 'blocked'/'safety' substrings — backend sends 'command blocked by safety policy' verbatim so no status code parsing needed"
  - "refresh() called both on onDecided callback and on key SSE event types (approval.required, command.executing, command.completed, run.completed, run.failed, validation.completed) to keep pendingApproval and phase in sync"
  - "Terminal phases COMPLETED/FAILED/ABORTED/WAITING_FOR_ACTIVITY_REVIEW all hide the Advance button; WAITING_FOR_ACTIVITY_REVIEW renders the Review Activity Report button instead"
metrics:
  duration: "~15 min"
  completed: "2026-06-07"
  tasks_completed: 2
  files_changed: 3
---

# Phase 08 Plan 04: RunView + ApprovalCard Summary

Full run page implemented: SSE-driven timeline, three-mode approval card, customer system header, abort/advance controls, and WAITING_FOR_ACTIVITY_REVIEW path.

## What Was Built

**ApprovalCard** (`frontend/src/components/ApprovalCard.tsx`): Three-mode approval UI (default / edit / reject). Risk badge via `riskBadge()` from `mappers.ts` using `badge--safe/low/medium/high` CSS classes. Approve calls `approveCommand` with no edited command in default mode, with `editedCommand` in edit mode. Reject requires a non-empty reason. 422/safety errors surface as "Command blocked by safety policy — edit or reject." Other errors show `err.message` directly. All command text in `pre`/`textarea` elements — no `dangerouslySetInnerHTML`.

**RunView** (`frontend/src/components/RunView.tsx`): Replaces the stub. Hooks: `useRunEvents(runId)` for the event stream, `useRun(runId)` for `pendingApproval` and `phase` (these never come from the SSE hook). `useEffect` on `events.length` calls `refresh()` when a key event type arrives. Timeline auto-scrolls via a sentinel ref. `ApprovalCard` rendered in `.approval-slot` when `pendingApproval` is non-null; `onDecided` wired to `refresh()`. Abort button always visible; Advance button hidden on terminal phases and `WAITING_FOR_ACTIVITY_REVIEW`; Review Activity Report button shown only in `WAITING_FOR_ACTIVITY_REVIEW`. Customer system header shows ip/port/username/os with "–" fallback when null.

**index.css**: Extended with all required class names including risk badge colors using `badge--safe/low/medium/high` double-dash convention.

## Tasks Completed

| Task | Name | Commit |
|------|------|--------|
| 1 | ApprovalCard component | 605540b |
| 2 | RunView with timeline, header, controls | b082f0d |

## Verification

- `tsc --noEmit` passes cleanly after both tasks
- `riskBadge()` imported from `frontend/src/utils/mappers.ts` (not a non-existent `riskBadge.ts`)
- `pendingApproval` and `phase` sourced from `useRun().run`, not `useRunEvents`
- `refresh()` called after approve/reject and on 6 key SSE event types
- All SSE payload strings rendered as text children in `pre`/`p` elements

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both components are fully wired to real hooks and API calls.

## Threat Flags

No new security surface beyond what the plan's threat model covers. All SSE payload fields (`command`, `summary`) rendered as React text children. Edited commands sent to `/approve` where the backend re-runs the safety gate.

## Self-Check: PASSED

All files verified on disk. All task commits verified in git log.

## Self-Check: PASSED
