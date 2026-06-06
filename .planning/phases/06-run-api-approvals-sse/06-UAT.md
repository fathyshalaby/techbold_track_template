---
status: testing
phase: 06-run-api-approvals-sse
source: [06-VERIFICATION.md]
started: 2026-06-07T01:00:00.000Z
updated: 2026-06-07T01:00:00.000Z
---

## Current Test

number: 1
name: SSE live event delivery to a browser EventSource
expected: |
  With the server running, connecting a browser EventSource to
  GET /api/runs/:runId/events and advancing the run via POST /api/runs/:runId/next
  causes run events (run.started, approval.required, command.completed, etc.)
  to appear in the browser console in real time.
awaiting: user response

## Tests

### 1. SSE live event delivery to a browser EventSource
expected: |
  Start the server (`docker compose up` or `node src/index.ts`). In the browser console:
  `const es = new EventSource('http://localhost:8000/api/runs/{runId}/events')`.
  Advance the run via `POST /api/runs/{runId}/next`. Events appear in the console live.
  (curl --no-buffer also works as a CLI alternative.)
result: [pending]

### 2. SSE listener cleanup on disconnect
expected: |
  Connect an EventSource as above, then close the tab or call `es.close()`.
  After disconnect, runEventBus listener count for the run drops to zero for all
  14 event types; server memory is stable over repeated connect/disconnect cycles.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
