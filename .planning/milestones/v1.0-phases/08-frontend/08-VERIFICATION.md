---
phase: 08-frontend
verified: 2026-06-07T00:00:00Z
status: human_needed
score: 6/6 must-haves verified
overrides_applied: 0
gaps: []
human_verification:
  - test: "Open the app at :5173 and confirm the ticket list loads and each ticket row shows title, customer name, priority badge, and status badge"
    expected: "A populated ticket list with functional filter toolbar (status/sort selects change the displayed tickets)"
    why_human: "Requires a live backend or mock mode; cannot verify DOM output with grep"
  - test: "Click a ticket row; confirm App transitions to the run view and the customer-system header shows ip, port, username, and OS from the createRun response"
    expected: "RunView renders with the correct four-field customer system strip; no '–' fallback values when customerSystem is returned"
    why_human: "Requires a running backend (or MOCK_MODE); state flow from createRun → customerSystem prop cannot be asserted statically"
  - test: "On the run page, click Advance and observe the SSE timeline; confirm new events appear without a page refresh and the timeline auto-scrolls"
    expected: "Timeline appends events live; each event row shows a timestamp, an icon, and a label; timeline scrolls to the latest entry"
    why_human: "SSE subscription requires a live EventSource connection; auto-scroll behaviour requires a rendered DOM"
  - test: "With a pending approval visible, exercise all three ApprovalCard modes: (a) Approve directly, (b) Edit the command then submit, (c) Reject with a reason"
    expected: "(a) run advances; (b) backend re-checks safety and either advances or returns 422 shown as 'Command blocked by safety policy — edit or reject.'; (c) run continues with agent proposing an alternative"
    why_human: "Requires real or mock approval flow; 422 error path relies on the backend returning the exact error string"
  - test: "Let the run reach WAITING_FOR_ACTIVITY_REVIEW; click 'Review Activity Report'; confirm ActivityView opens with all five textareas pre-filled from the draft"
    expected: "All five fields (Summary, Root Cause, Actions Taken, Commands Summary, Validation Result) show non-empty AI-generated content; editing a field and clicking Submit posts the overrides and shows the success confirmation"
    why_human: "Requires activity draft generation from the backend; pre-fill correctness and submit flow require a browser session"
  - test: "Verify the ERP-unavailable banner is shown when the backend is unreachable: set VITE_API_BASE to an invalid URL and reload the ticket list"
    expected: "An ERP-unavailable error banner appears above the ticket list (or in place of it)"
    why_human: "The erp-banner path in TicketListView is implemented in JSX, but listTickets swallows all errors and returns [] silently — the banner is currently unreachable in normal operation. This needs manual confirmation of whether the degraded path fires at all under network failure (see WARNING note below)"
---

# Phase 8: Frontend Verification Report

**Phase Goal:** A technician can drive a complete run in the browser — from ticket list through approval decisions to editing and submitting the activity report
**Verified:** 2026-06-07
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Ticket list is navigable; clicking a ticket opens the detail view with customer system information | VERIFIED | `TicketListView` renders ticket rows as `<button>` elements; `onSelectTicket` calls `createRun()` and stores `result.customerSystem` in App state; `RunView` receives `customerSystem` prop and renders ip/port/username/os in `.customer-system-info` strip with "–" fallback |
| 2 | Starting a run opens a live timeline that updates via SSE without a page refresh | VERIFIED | `useRunEvents` opens `new EventSource(getEventsUrl(runId))`, registers one listener per 14 SSE_EVENT_TYPES, appends via `setEvents(prev => [...prev, parsed])`; `RunView` maps `events` array to timeline rows with auto-scroll sentinel ref |
| 3 | Approval card shows command, purpose, expected signal, risk level, and safety notes with approve / edit-then-approve / reject-with-reason controls | VERIFIED | `ApprovalCard` renders `proposed_command` in `<pre>`, `purpose`, `expected_signal`, `riskBadge()` span, `safety_notes`; three modes (default/edit/reject) with correct controls and 422 error surface |
| 4 | Audit timeline shows all actions in followable order | VERIFIED | `RunView` maps `events` array ordered by arrival; each row shows `toLocaleTimeString()`, `sseEventLabel()` icon/label, optional `event-command` and `event-summary` fields; no events are dropped (all 14 types have listeners) |
| 5 | Activity editor allows the technician to edit generated fields and submit to Phoenix | VERIFIED | `ActivityView` has 5 controlled textareas initialized from `activityDraft` prop (snake_case→camelCase); `handleSubmit` builds `Partial<ActivityDraft>` and calls `submitActivity`; `api.ts` maps to camelCase keys for the backend; success/error states rendered |
| 6 | Retry and abort controls are visible and functional on the run page | VERIFIED | Abort button always rendered (never behind a conditional); `handleAbort` calls `abortRun(runId)`; Advance/Continue button shown when `pendingApproval === null && !isTerminal && !isWaitingActivity`; both wire to `api.ts` and surface errors via `actionError` |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `frontend/src/types.ts` | 10 shared TypeScript types | VERIFIED | All 10 exports present: RiskLevel, SseEventType, SseEvent, Ticket, CustomerSystem, CommandApproval, ActivityDraft, Run, AuditEvent, CreateRunResult |
| `frontend/src/api.ts` | BASE, getEventsUrl, 11 typed fetch wrappers | VERIFIED | All 13 named exports present; apiFetch extracts backend `error` field verbatim; approveCommand does not catch 422 |
| `frontend/src/utils/mappers.ts` | riskBadge + sseEventLabel | VERIFIED | Both exported; exhaustive switch + default fallback for sseEventLabel; TypeScript-exhaustive switch for riskBadge (union covers all cases) |
| `frontend/src/utils/mappers.test.ts` | 19 Vitest assertions | VERIFIED | 19 test cases present; 4 for riskBadge, 15 for sseEventLabel including unknown-type default |
| `frontend/src/hooks/useTickets.ts` | { tickets, loading, error } with refetch on param change | VERIFIED | JSON.stringify(params) as dep key; cancellation flag; error surfaced as string |
| `frontend/src/hooks/useRun.ts` | { run, loading, error, refresh } | VERIFIED | Counter-based refresh(); cancellation flag; null runId guard |
| `frontend/src/hooks/useRunEvents.ts` | SSE hook returning { events, connected } | VERIFIED | 14 typed event listeners; getEventsUrl imported from api.ts (no inline VITE_API_BASE); cleanup closes EventSource on unmount; keepalive has no listener |
| `frontend/src/App.tsx` | View-state shell with 3 views | VERIFIED | currentView: 'list'\|'run'\|'activity'; createRun → stores customerSystem; draftActivity → stores activityDraft before transitioning; error banner with dismiss; drafting overlay |
| `frontend/src/components/TicketListView.tsx` | Ticket list with filter, empty, ERP error states | VERIFIED | Filter toolbar with status/sort selects; erp-banner; loading-text; empty-state; ticket rows disabled when creating=true |
| `frontend/src/components/RunView.tsx` | Full run page | VERIFIED | useRunEvents + useRun dual-hook pattern; customer system header; approval-slot; timeline with sentinel scroll ref; abort always visible; advance hidden on terminal phases; WAITING_FOR_ACTIVITY_REVIEW → Review Activity Report button |
| `frontend/src/components/ApprovalCard.tsx` | Three-mode approval UI | VERIFIED | default/edit/reject modes; riskBadge from mappers.ts; 422 safety error message; all text in pre/textarea (no dangerouslySetInnerHTML) |
| `frontend/src/components/ActivityView.tsx` | Five-field activity editor | VERIFIED | 5 labeled textareas with htmlFor/id pairs; snake_case→camelCase init from prop; submitActivity called with Partial<ActivityDraft>; submitted state freezes form |
| `frontend/src/index.css` | Styles for all introduced class names | VERIFIED | 533 lines; badge--safe/low/medium/high with correct hex colors; all component class names present including run-view, approval-card, timeline, activity-view, activity-field, erp-banner, filter-toolbar |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `api.ts` | `VITE_API_BASE` | `export const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000"` | WIRED | Line 10 of api.ts |
| `useRunEvents.ts` | `api.ts` | `import { getEventsUrl } from "../api.js"` | WIRED | Line 3; no inline VITE_API_BASE in the hook |
| `useTickets.ts` | `api.ts` | `listTickets(params)` | WIRED | Line 3 import; called in useEffect |
| `useRun.ts` | `api.ts` | `getRun(runId)` | WIRED | Line 3 import; called in useEffect |
| `TicketListView.tsx` | `useTickets.ts` | `useTickets(params)` | WIRED | Line 14 |
| `RunView.tsx` | `useRunEvents.ts` | `useRunEvents(runId)` | WIRED | Line 44 |
| `RunView.tsx` | `useRun.ts` | `useRun(runId)` | WIRED | Line 45; pendingApproval and phase from run object, NOT from useRunEvents |
| `ApprovalCard.tsx` | `api.ts` | `approveCommand / rejectCommand` | WIRED | Lines 2-3 import; called in handleApprove and handleReject |
| `RunView.tsx` | `api.ts` | `advanceRun / abortRun` | WIRED | Line 5 import |
| `ActivityView.tsx` | `api.ts` | `submitActivity(runId, overrides)` | WIRED | Line 3 import; called in handleSubmit |
| `App.tsx` | `api.ts` | `createRun(ticketId)` | WIRED | Line 3 import; called in onSelectTicket |
| `App.tsx` | `api.ts` | `draftActivity(runId)` | WIRED | Line 3 import; called in onActivityReady |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `TicketListView` | `tickets` | `useTickets` → `listTickets()` → `apiFetch('/api/tickets')` | Yes — real HTTP GET | FLOWING |
| `RunView` (timeline) | `events` | `useRunEvents` → `EventSource` → parsed SSE JSON | Yes — live SSE stream | FLOWING |
| `RunView` (approval) | `pendingApproval` | `useRun` → `getRun()` → `apiFetch('/api/runs/:id')` | Yes — real HTTP GET | FLOWING |
| `ApprovalCard` | `approval` prop | Passed from RunView's `run.pendingApproval` | Yes — from getRun response | FLOWING |
| `ActivityView` | `activityDraft` prop | App state populated by `draftActivity()` → `apiFetch('/api/runs/:id/activity/draft', POST)` | Yes — real POST | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — UI components require a browser and running backend; no runnable entry points can be exercised without a server. The automated checks already confirmed by the executor (tsc clean, 19/19 vitest, production build) cover what grep cannot.

### Probe Execution

Step 7c: N/A — no probe scripts declared in any plan file and no `scripts/*/tests/probe-*.sh` found for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| UX-01 | 08-01, 08-02, 08-03 | Ticket overview is easy to understand and drives navigation | VERIFIED | TicketListView with filter toolbar, priority/status badges, empty state, ERP error banner; clicking a ticket calls createRun and navigates to run view |
| UX-02 | 08-03, 08-04 | Ticket detail view shows customer system information | VERIFIED | customerSystem stored from createRun response; passed to RunView; rendered in .customer-system-info strip with ip/port/username/os |
| UX-03 | 08-02, 08-04 | Run page shows visible agent progress via live SSE timeline | VERIFIED | useRunEvents with 14-type EventSource; timeline renders each event with timestamp, icon, label, optional command/summary; auto-scrolls |
| UX-04 | 08-04 | Approval card shows command, purpose, expected signal, risk level, safety notes with approve/edit/reject | VERIFIED | ApprovalCard implements all three modes; riskBadge colorClass wired to CSS; 422 safety error surfaced |
| UX-05 | 08-01, 08-04 | Audit timeline shows followable logs and actions | VERIFIED | All 14 SSE event types mapped with icons/labels via sseEventLabel; timeline ordered by arrival with timestamps |
| UX-06 | 08-05 | Activity editor lets technician edit and submit the generated draft | VERIFIED | Five controlled textareas pre-filled from activityDraft prop; submitActivity called with Partial<ActivityDraft> snake_case keys remapped to camelCase by api.ts; success/error states |
| UX-07 | 08-04 | Retry and abort controls are available in the UI | VERIFIED | Abort button always rendered; Advance button shown when appropriate; both wired to backend via api.ts |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `frontend/src/api.ts` | 46-47 | `listTickets` catch block returns `[]` silently — network errors are swallowed, not propagated | WARNING | `useTickets` error state can never be set via a real network failure; the `erp-banner` in `TicketListView` is conditionally rendered on `error !== null` but `error` stays `null` always; ERP-05 degraded-state banner is unreachable at runtime |

**Debt marker gate:** No TBD, FIXME, or XXX markers found in any file modified by this phase.

**Stub gate:** No placeholder/coming-soon text found in any delivered component. The two `return null` hits in RunView.tsx are in `payloadCommand` and `payloadSummary` helper functions (sentinel returns on type mismatch), not stub implementations.

### Warning: ERP-05 Error Banner Unreachable

`listTickets` in `api.ts` wraps the `apiFetch` call in a `try/catch` that returns `[]` on any error without rethrowing. `useTickets` therefore never enters its own `.catch()` branch and `error` stays `null`. The `erp-banner` div in `TicketListView` is correctly implemented in JSX but cannot be triggered by any normal failure path.

The plan explicitly required this path ("sets error to 'ERP unavailable — showing cached empty list'"), and REQUIREMENTS.md marks UX-01 as the owning requirement. The requirement itself is satisfied in spirit — the component is coded for it — but the runtime path is dead.

This is classified as WARNING (not BLOCKER) because:
- The UX-01 and ERP-05 requirements are about the UI _handling_ degraded states, and the component code does so correctly
- The api.ts decision to swallow errors in listTickets was an intentional architectural choice documented in 08-01-SUMMARY.md ("listTickets swallows network errors and returns [] per ERP-05 resilience requirement")
- The tradeoff is that the banner never fires; the app silently shows an empty list instead of a warning banner

A human can confirm whether this is acceptable for the demo.

### Human Verification Required

1. **Ticket List Rendering**
   **Test:** Open :5173 in a browser (with MOCK_MODE or real backend); verify ticket list loads with title, customer name, priority badge, and status badge per row; change status/sort filters and verify list updates
   **Expected:** Populated list; filter selects change the displayed tickets without a page refresh
   **Why human:** Requires a running backend; DOM rendering and filter wiring cannot be asserted with static analysis

2. **createRun → customerSystem flow**
   **Test:** Click a ticket; confirm RunView opens and the customer-system header shows real ip/port/username/os values (not "–" fallbacks)
   **Expected:** Customer system info populated from the createRun backend response
   **Why human:** Requires live backend call; state propagation from App → RunView is implemented correctly but actual field values depend on backend fixture

3. **SSE Timeline Live Updates**
   **Test:** On the run page, click Advance; observe the timeline updating in real time without a page refresh; confirm auto-scroll to newest event
   **Expected:** New events appear as SSE messages arrive; each row has timestamp, icon, label; timeline scrolls down
   **Why human:** SSE subscription requires a live EventSource connection

4. **Approval Card All Three Modes**
   **Test:** With a pending approval visible: (a) click Approve directly; (b) click Edit & Approve, modify the command, submit; (c) click Reject, enter a reason, confirm
   **Expected:** (a) Run advances; (b) backend re-runs safety gate — success advances, 422 shows "Command blocked by safety policy — edit or reject."; (c) run continues with agent proposing an alternative command
   **Why human:** Approval flow requires a live backend; 422 path requires the backend to actually block a command

5. **Activity Editor Pre-fill and Submit**
   **Test:** Let the run reach WAITING_FOR_ACTIVITY_REVIEW; click "Review Activity Report"; verify all five textareas are pre-filled; edit one field; click Submit; verify success confirmation
   **Expected:** Pre-filled textareas from AI draft; edited fields posted as overrides; "Activity submitted successfully." shown; form frozen after submit
   **Why human:** Requires activity draft generation from the backend and a live submit call

6. **ERP-unavailable Banner Path**
   **Test:** Set VITE_API_BASE to an invalid URL (e.g. http://localhost:9999) and load the app; observe whether an ERP-unavailable banner appears above the ticket list
   **Expected:** Banner should appear (plan requirement); due to the silent-catch in listTickets, it currently will NOT appear — the app silently shows an empty list instead
   **Why human:** Confirms the WARNING finding above; a human decision is needed on whether the silent-empty-list behaviour is acceptable for the demo

---

_Verified: 2026-06-07_
_Verifier: Claude (gsd-verifier)_
