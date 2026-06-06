---
phase: "02"
plan: "02"
subsystem: phoenix-client
tags: [http-client, phoenix, erp, auth, retry, zod, tdd]
dependency_graph:
  requires:
    - TicketSchema
    - CustomerSystemSchema
    - EmployeeSchema
    - ActivitySchema
    - ActivityCreateSchema
    - TicketStatusSchema
  provides:
    - PhoenixClient
    - PhoenixAuthError
    - PhoenixNotFoundError
    - PhoenixValidationError
    - PhoenixNetworkError
  affects:
    - backend/src/routes/tickets.ts
    - backend/src/routes/runs.ts
    - backend/src/ai/orchestrator.ts
tech_stack:
  added: []
  patterns:
    - AbortController with 8s timeout on every fetch
    - Retry loop (max 2 attempts) on 5xx/network; 4xx never retried
    - Zod schema.parse() on every 2xx response — no `as T` cast
    - Private fetchWithRetry extracted for clean request method
    - ticketId integer validation before URL construction (SSRF prevention)
key_files:
  created: []
  modified:
    - backend/src/phoenix/client.ts
    - backend/src/tests/phoenix-client.test.ts
decisions:
  - "Constructor takes explicit baseUrl+token — no getEnv() in constructor, keeps class testable without env"
  - "fetchWithRetry extracted as private method — request method stays under 30 lines"
  - "4xx errors (401, 404, 422) never retried — prevents hammering auth endpoint (T-02-07)"
  - "ticketId validated as integer > 0 before URL construction — prevents path traversal (T-02-05)"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-06"
  tasks_completed: 1
  tasks_total: 1
---

# Phase 02 Plan 02: PhoenixClient HTTP Wrapper Summary

Typed Phoenix ERP HTTP client with Bearer auth, 8s AbortController timeout, single retry on 5xx/network errors, four typed error classes, and Zod-validated responses on every 2xx.

## What Was Built

`backend/src/phoenix/client.ts` exports:

- `PhoenixClient` class with six methods: `listTickets`, `getTicket`, `getCustomerSystem`, `getMe`, `createActivity`, `setStatus`
- Four typed error classes: `PhoenixAuthError`, `PhoenixNotFoundError`, `PhoenixValidationError`, `PhoenixNetworkError`

Key implementation details:
- Private `fetchWithRetry(url, options)` — AbortController per attempt (8s), retries once after 200ms on 5xx or thrown network errors, never on 4xx
- Private `request<T>(schema, method, path, body?, query?)` — builds URL with optional query params, sets auth header, delegates to fetchWithRetry, parses 2xx with `schema.parse()`, maps error status codes to typed error classes
- `ticketId` validated as positive integer before URL construction (prevents path traversal)
- No `getEnv()` call in constructor — caller passes baseUrl and token explicitly

`backend/src/tests/phoenix-client.test.ts` — 17 test cases covering:
- `listTickets`: happy path, empty list, 401, query param forwarding
- `getTicket`: happy path, 404, invalid ticketId TypeError
- `getCustomerSystem`: happy path
- `getMe`: happy path
- `createActivity`: happy path (201), 422
- `setStatus`: happy path
- Retry behaviour: succeeds on second attempt after network error, throws PhoenixNetworkError after two failures, no retry on 401, no retry on 404
- Authorization header present on every request

## Test Results

67/67 tests passing (`npm test` in `backend/`). Zero TypeScript errors (`tsc --noEmit`). `describe.skip` count: 0.

## Deviations from Plan

None — plan executed exactly as written. The REFACTOR step (extracting `fetchWithRetry`) was applied inline during GREEN since the structure was clear from the plan description.

## TDD Gate Compliance

- RED commit: 0b436ee — `test(02-02): add failing tests for PhoenixClient` (17 failures confirmed)
- GREEN commit: 85b2d8b — `feat(02-02): implement PhoenixClient with auth, timeout, retry, and error mapping` (67/67 passing)

## Self-Check: PASSED

All files verified on disk. Both commits confirmed in git log.

## Threat Surface Scan

No new network endpoints or auth paths introduced. The client is an outbound-only HTTP wrapper.

All threat model mitigations applied:
- T-02-03: Token only in Authorization header; never in error messages or logs
- T-02-04: All responses parsed via `schema.parse()` — no `as T` casts
- T-02-05: `ticketId` validated as positive integer before URL construction
- T-02-06: AbortController with 8000ms applied to every fetch attempt
- T-02-07: Retry only on 5xx/network; 401/404/422 throw immediately without retry

## Self-Check: PASSED
