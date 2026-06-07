---
phase: 08-frontend
plan: "05"
subsystem: frontend
tags: [react, activity-editor, ux]
dependency_graph:
  requires: [08-04]
  provides: [ActivityView]
  affects: [frontend/src/App.tsx]
tech_stack:
  added: []
  patterns: [controlled-form, optimistic-disable, override-diff]
key_files:
  created: []
  modified:
    - frontend/src/components/ActivityView.tsx
    - frontend/src/index.css
decisions:
  - "Pass Partial<ActivityDraft> (snake_case) to submitActivity — api.ts wrapper handles camelCase mapping to backend, so component state maps back to snake_case keys at submit time"
  - "Non-empty field check for overrides — matches backend logic: missing fields fall back to saved draft"
metrics:
  duration: "~2min"
  completed: "2026-06-07T01:29:38Z"
  tasks: 1
  files: 2
---

# Phase 08 Plan 05: ActivityView Activity Editor Summary

Five-field activity editor replacing the stub; technician reviews AI-drafted report, edits freely, and submits overrides to Phoenix via POST /api/runs/:id/activity/submit.

## What Was Built

`ActivityView` replaces the placeholder stub with a fully functional form:
- Five labeled textareas (Summary, Root Cause, Actions Taken, Commands Summary, Validation Result) initialized from `activityDraft` prop via snake_case→camelCase state mapping
- Submit builds `Partial<ActivityDraft>` overrides from non-empty fields and calls `submitActivity(runId, overrides)` — the api.ts wrapper remaps to camelCase for the backend
- Submitting state disables all fields and the Submit button, showing "Submitting…"
- Success path: `submitted=true` freezes form, renders `.activity-success` confirmation
- Error path: `.activity-error` banner with message string
- Back button always enabled; calls `onBack()` synchronously

`index.css` extended with `.activity-view`, `.activity-subtitle`, `.activity-field`, `.activity-controls`, `.activity-success`, `.activity-error`, `.btn-back`, `.btn-submit`, plus `.btn` display override (`inline-flex`).

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: ActivityView five-field editor | 8200bbe | frontend/src/components/ActivityView.tsx, frontend/src/index.css |

## Verification

- `tsc --noEmit` passed with zero errors across the entire frontend
- Props interface (`runId`, `activityDraft`, `onBack`) unchanged from stub
- Five textareas present, each bound to state, each labeled with matching `htmlFor`/`id`
- `submitActivity` called with `Partial<ActivityDraft>` (snake_case keys); api.ts maps to camelCase for backend
- `submitted=true` freezes form and shows success message
- `error` state shown on failure
- Back button calls `onBack()` with no async side effects

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All five fields are wired to state and submitted via `submitActivity`.

## Threat Flags

None. All five trust boundaries addressed:
- T-08-15 (XSS): fields rendered as controlled textarea values — no innerHTML
- T-08-16 (info disclosure): backend redacts before draft reaches frontend
- T-08-17 (tampering): backend re-redacts on submit; no client bypass path

## Self-Check: PASSED

- `/Users/julianschmidt/Documents/GitHub/techbold_track_template/frontend/src/components/ActivityView.tsx` — exists, 120 lines
- `/Users/julianschmidt/Documents/GitHub/techbold_track_template/frontend/src/index.css` — exists, 534 lines
- Commit `8200bbe` — verified present in git log
