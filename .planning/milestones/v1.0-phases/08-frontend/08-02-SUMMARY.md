---
phase: 08-frontend
plan: "02"
subsystem: frontend
tags: [hooks, react, sse, data-fetching]
dependency_graph:
  requires:
    - frontend/src/types.ts
    - frontend/src/api.ts
  provides:
    - frontend/src/hooks/useTickets.ts
    - frontend/src/hooks/useRun.ts
    - frontend/src/hooks/useRunEvents.ts
  affects:
    - Phase-08 component plans (08-03, 08-04, 08-05 consume these hooks)
tech_stack:
  added: []
  patterns:
    - Custom hooks centralise fetch + error-to-string handling
    - Native EventSource subscription with per-event-type listeners
    - refresh() counter pattern for manual re-fetch
key_files:
  created:
    - frontend/src/hooks/useTickets.ts
    - frontend/src/hooks/useRun.ts
    - frontend/src/hooks/useRunEvents.ts
  modified: []
decisions:
  - "useRunEvents exposes { events, connected } only; pendingApproval and phase are derived by components from useRun(runId), per plan contract"
  - "useRunEvents registers one listener per SSE_EVENT_TYPES entry; keepalive has no listener so it is silently ignored"
  - "EventSource is not closed on error — browser-native retry handles reconnection; only closed on unmount"
metrics:
  duration: "~4 min"
  completed: "2026-06-07"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 08 Plan 02: Custom Data Hooks Summary

Built the three custom hooks the view layer consumes so no component fetches data directly. `useTickets` and `useRun` wrap the typed API functions with loading/error state; `useRunEvents` subscribes to the backend SSE stream via native EventSource.

## What Was Built

### Task 1 — `useTickets` and `useRun`

- `useTickets(params?)` returns `{ tickets, loading, error }`, re-fetching when filter params change (keyed on `JSON.stringify(params)`). Surfaces backend error messages as strings; renders the ERP-unavailable degraded state per ERP-05.
- `useRun(runId)` returns `{ run, loading, error, refresh }`. `refresh()` bumps an internal counter to trigger a re-fetch; components call it after each approve/reject/advance/abort decision.

### Task 2 — `useRunEvents`

`useRunEvents(runId)` returns `{ events, connected }`. Opens `new EventSource(getEventsUrl(runId))` only when `runId` is non-null, registers one listener for each of the 14 `SSE_EVENT_TYPES`, appends parsed `SseEvent`s via functional setState, and closes the connection on unmount. `getEventsUrl` is imported from `api.ts` — no inline `VITE_API_BASE`.

## Deviations from Plan

None — all three hooks built as specified.

## Known Stubs

None.

## Threat Flags

SSE payloads typed as `unknown` and rendered as React-escaped text by consumers (T-08-04 accepted). Error strings come from the backend already-redacted (T-08-05 accepted). EventSource relies on browser-native backoff, no manual retry loop (T-08-06 accepted).

## Self-Check: PASSED

- `frontend/src/hooks/useTickets.ts` — FOUND
- `frontend/src/hooks/useRun.ts` — FOUND
- `frontend/src/hooks/useRunEvents.ts` — FOUND
- Commit `69d87a7` (Task 1) — FOUND
- Commit `7fb1423` (Task 2) — FOUND
- `tsc --noEmit` — clean

> Note: This SUMMARY.md was written by the orchestrator after the executor agent completed both tasks and committed them but was terminated by a provider quota limit (HTTP 402 MONTHLY_REQUEST_COUNT) before writing its own summary. Work verified via git log + tsc.
