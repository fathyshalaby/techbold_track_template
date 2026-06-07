---
status: testing
phase: 08-frontend
source: [08-VERIFICATION.md]
started: 2026-06-07T01:36:17Z
updated: 2026-06-07T01:36:17Z
---

## Current Test

number: 1
name: Ticket list rendering — rows, badges, filter toolbar
expected: |
  A populated ticket list loads at :5173; each row shows title, customer name,
  priority badge, and status badge. Changing the status/sort selects updates the
  displayed tickets without a page refresh.
awaiting: user response

## Tests

### 1. Ticket list rendering — rows, badges, filter toolbar
expected: A populated ticket list with functional filter toolbar (status/sort selects change the displayed tickets)
result: [pending]

### 2. createRun → customerSystem flow
expected: Clicking a ticket opens RunView with the customer-system header showing real ip/port/username/os from the createRun response (no "–" fallbacks)
result: [pending]

### 3. SSE timeline live updates
expected: Clicking Advance appends events to the timeline live (no page refresh); each row shows a timestamp, icon, and label; timeline auto-scrolls to the latest entry
result: [pending]

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
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
