---
phase: 08-frontend
plan: "03"
subsystem: frontend
tags: [react, view-state, ticket-list, ui]
dependency_graph:
  requires: [08-02]
  provides: [App-shell, TicketListView, RunView-stub, ActivityView-stub]
  affects: [frontend/src/App.tsx, frontend/src/components/]
tech_stack:
  added: []
  patterns: [view-state-switch, custom-hook-integration, plain-css]
key_files:
  created:
    - frontend/src/components/RunView.tsx
    - frontend/src/components/ActivityView.tsx
    - frontend/src/components/TicketListView.tsx
  modified:
    - frontend/src/App.tsx
    - frontend/src/index.css
decisions:
  - "No router library — three views switched via useState<'list'|'run'|'activity'>"
  - "TicketListView receives creating prop to disable rows during run creation"
  - "onBack in ActivityView navigates back to run (not list) so technician can continue"
metrics:
  duration: "15min"
  completed: "2026-06-07"
  tasks: 2
  files: 5
---

# Phase 8 Plan 3: App Shell and Ticket List Summary

App.tsx replaced with a view-state shell owning `currentView`, `activeRunId`, `customerSystem`, and `activityDraft`; TicketListView built with filter toolbar, ERP error banner, empty state, and per-ticket rows with priority/status badges.

## What Was Built

**Task 1 — App.tsx view-state shell + stubs (b39b5cb)**

- `App.tsx` replaced with the full view-state shell: three views (`list` / `run` / `activity`) via `useState`, no router library
- State owned: `currentView`, `activeRunId`, `activeTicketTitle`, `customerSystem: CustomerSystem | null`, `activityDraft: ActivityDraft | null`, `creating`, `createError`, `draftingActivity`
- `onSelectTicket` calls `createRun(ticket.id)`, stores `customerSystem` from response, transitions to run view
- `onActivityReady` calls `draftActivity(activeRunId)`, stores `ActivityDraft`, transitions to activity view
- Error banner (`.error-banner`) renders `createError` as text node — XSS safe (T-08-08 mitigated)
- Drafting overlay (`.drafting-overlay`) non-blocking — abort button in RunView remains accessible
- Header bar with "← Back to tickets" button when not on list view; clears `activeRunId` and `customerSystem`
- `RunView.tsx` stub: props `{ runId, ticketTitle, customerSystem, onActivityReady }` — exact contract for plan 08-04
- `ActivityView.tsx` stub: props `{ runId, activityDraft, onBack }` — `onBack` not `onDone`; exact contract for plan 08-05

**Task 2 — TicketListView + CSS (461271d)**

- `TicketListView.tsx`: props `{ onSelectTicket, creating }`
- Uses `useTickets(params)` with local `statusFilter` and `sortField` state; params serialised via JSON.stringify to avoid object identity churn (mirrors hook's own dep strategy)
- Filter toolbar (`.filter-toolbar`): status select (All / OPEN / PENDING / DONE) and sort select (Default / by Date / by Priority / by Status)
- ERP error banner (`.erp-banner`) renders error string as text child — XSS safe (T-08-07 mitigated); persists above list even when tickets=[]
- Loading state (`.loading-text`), empty state (`.empty-state`)
- Ticket list (`.ticket-list`): each row is a `<button class="ticket-row">` showing title, customer_name, priority badge, status badge; disabled when `creating=true` to prevent double-submit
- Badge classes: `badge priority-high/medium/low`, `badge status-open/pending/done` — lowercased from API values
- `index.css` extended: header bar, error/drafting overlays, filter toolbar, ERP banner, ticket list/row, badge color scale (high=red, medium=amber, low=grey; open=blue, pending=orange, done=green); max-width 900px centered layout

## Verification

```
tsc --noEmit: PASSED (no errors)
```

All threat model mitigations confirmed:
- T-08-07: `ticket.title`, `customer_name` rendered as React text children
- T-08-08: `createError` rendered as `{createError}` text node
- T-08-09: `createRun` sends only `ticketId` to backend; Phoenix token stays server-side

## Deviations from Plan

None — plan executed exactly as written.

The only sequencing note: `TicketListView.tsx` was written before committing Task 1 because `App.tsx` imports it and `tsc` would fail without it. Task 1 was committed first (b39b5cb), Task 2 second (461271d), matching the plan order.

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `frontend/src/components/RunView.tsx` | Renders placeholder div | Full implementation in plan 08-04 |
| `frontend/src/components/ActivityView.tsx` | Renders placeholder div | Full implementation in plan 08-05 |

These stubs do not block the plan's goal — the ticket list and view-state shell are fully functional. RunView and ActivityView are replaced in subsequent plans with the contracts defined here.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced beyond what the plan modelled.

## Self-Check: PASSED

- `frontend/src/App.tsx` — exists, correct
- `frontend/src/components/RunView.tsx` — exists, correct props
- `frontend/src/components/ActivityView.tsx` — exists, `onBack` prop confirmed
- `frontend/src/components/TicketListView.tsx` — exists, correct
- `frontend/src/index.css` — extended with all introduced class names
- Task 1 commit b39b5cb — confirmed in git log
- Task 2 commit 461271d — confirmed in git log
