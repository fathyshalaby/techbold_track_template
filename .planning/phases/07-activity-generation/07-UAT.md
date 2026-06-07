---
status: testing
phase: 07-activity-generation
source: [07-VERIFICATION.md]
started: 2026-06-07T02:35:00Z
updated: 2026-06-07T02:35:00Z
---

## Current Test

number: 1
name: Draft grounding quality — real LLM path
expected: |
  All 5 fields contain non-empty text that references actual commands and
  outcomes from the audit trail — not placeholder text, not invented facts.
awaiting: user response

## Tests

### 1. Draft grounding quality — real LLM path
expected: Start the backend with the real LLM path, POST to `/api/runs/:id/activity/draft` on a run with real (or seeded) audit events and command results. All 5 fields reference actual audit data — no fabrications, no placeholders.
result: [pending]

### 2. Phoenix activity submission — real mode
expected: Set `MOCK_PHOENIX=false` and POST to `/api/runs/:id/activity/submit` with a seeded draft. A Phoenix activity record is created with a real Phoenix-assigned `id`, correct `ticket_id`, time window, and all 5 fields, visible in the ticket history.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
