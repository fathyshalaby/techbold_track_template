---
phase: "02"
plan: "03"
subsystem: mock-and-ticket-routes
tags: [mock, hono, routes, phoenix, tdd, vitest]
dependency_graph:
  requires:
    - TicketSchema
    - CustomerSystemSchema
    - EmployeeSchema
    - ActivitySchema
    - ActivityCreateSchema
    - PhoenixClient
    - PhoenixAuthError
    - PhoenixNotFoundError
    - PhoenixNetworkError
    - resolveClientMode
  provides:
    - MockPhoenixClient
    - MOCK_TICKETS
    - MOCK_CUSTOMER_SYSTEMS
    - ticketsRouter
    - GET /api/tickets
    - GET /api/tickets/:id
    - GET /api/tickets/:id/customer-system
  affects:
    - backend/src/app.ts
    - backend/src/routes/tickets.ts
    - backend/src/phoenix/mock.ts
tech_stack:
  added: []
  patterns:
    - MockPhoenixClient mirrors PhoenixClient method signatures exactly — drop-in swap via resolveClientMode
    - Route handlers construct client lazily inside handler (not at module level) — keeps module importable in tests without populated env
    - Error class → HTTP status mapping: PhoenixAuthError→502, PhoenixNotFoundError→404, PhoenixNetworkError→502
    - parseInt + NaN guard on :id path param before any client call (T-02-09)
    - PRIORITY_ORDER map for deterministic sort — avoids locale-dependent string comparison
key_files:
  created:
    - backend/src/tests/mock-phoenix.test.ts
    - backend/src/tests/tickets.test.ts
  modified:
    - backend/src/phoenix/mock.ts
    - backend/src/routes/tickets.ts
    - backend/src/app.ts
decisions:
  - "MockPhoenixClient exported as default class with named MOCK_TICKETS and MOCK_CUSTOMER_SYSTEMS — matches plan artifact spec and allows spyOn in tests"
  - "listTickets returns spread copy of MOCK_TICKETS array to prevent caller mutations from affecting the module-level constant"
  - "PhoenixNotFoundError on list route returns 200 [] rather than 404 — an empty list is a valid response for a filtered query"
  - "resolveClientMode('phoenix') checked lazily inside each handler — consistent with env.ts lazy-load pattern; client never constructed at import time"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-06"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 02 Plan 03: Mock Client and Ticket Routes Summary

In-memory MockPhoenixClient with generic fixture data, three Hono ticket routes with full error mapping, and app.ts mount — completing the mock vertical slice for GET /api/tickets.

## What Was Built

### Task 1: MockPhoenixClient (`backend/src/phoenix/mock.ts`)

`MockPhoenixClient` covers all six `PhoenixClient` methods:

- `listTickets`: filters by `status`/`priority`, sorts by `date` (id asc) / `priority` (fixed order map) / `status` (locale compare). Returns a shallow spread copy of `MOCK_TICKETS`.
- `getTicket`: validates positive integer, throws `PhoenixNotFoundError` if missing.
- `getCustomerSystem`: same validation + lookup in `MOCK_CUSTOMER_SYSTEMS`.
- `getMe`: static demo employee `{ id:1, firstname:'Demo', lastname:'Tech', ... }`.
- `createActivity`: copies input fields, injects `id:1, team_id:1, team_name:'Support', employee_id:1`, defaults `description` to `''`.
- `setStatus`: mutates ticket in-place (state resets on server restart — intentional for demo), throws `PhoenixNotFoundError` if unknown.

`MOCK_TICKETS`: 4 generic tickets — ids 1–4, 2× OPEN / 1× PENDING / 1× DONE, priorities high/high/medium/low. No hostnames, no real IPs in ticket content.

`MOCK_CUSTOMER_SYSTEMS`: keyed by ticket id 1–4, all using `10.0.0.X` private-range IPs, port 22, `azureuser`, `Ubuntu 22.04 LTS`.

### Task 2: Ticket routes + app.ts (`backend/src/routes/tickets.ts`, `backend/src/app.ts`)

Three routes on `ticketsRouter`:

- `GET /` — parses `status`/`priority`/`sort` query params via manual Zod; invalid sort defaults rather than 400 (lenient per plan). Error mapping: `PhoenixAuthError`→502, `PhoenixNetworkError`→502, `PhoenixNotFoundError`→200 `[]`.
- `GET /:id` — `parseInt` + NaN guard → 400; `PhoenixNotFoundError`→404; auth/network→502.
- `GET /:id/customer-system` — same id parsing; `PhoenixNotFoundError`→404 "customer system not found".

`app.ts`: added `import { ticketsRouter }` and `app.route('/api/tickets', ticketsRouter)`.

## Test Results

102/102 tests passing (`npm test`). Zero TypeScript errors (`tsc --noEmit`). No tests skipped beyond pre-existing safety/orchestrator stubs.

- `src/tests/mock-phoenix.test.ts` — 24 cases: MOCK_TICKETS shape, MOCK_CUSTOMER_SYSTEMS shape, all six MockPhoenixClient methods including filter/sort, shallow-copy invariant, in-place mutation via `setStatus`.
- `src/tests/tickets.test.ts` — 11 cases: list with/without filter and sort, single ticket happy path, 404, 400 on non-integer id, customer-system happy path + 404 + 400, PhoenixAuthError→502 mapping.

## Deviations from Plan

None — plan executed exactly as written.

## TDD Gate Compliance

- Task 1 RED commit: 3dce47f — `test(02-03): add failing tests for MockPhoenixClient` (24 failures confirmed)
- Task 1 GREEN commit: bae4235 — `feat(02-03): implement MockPhoenixClient with generic fixture data` (91/91 passing)
- Task 2 RED commit: ee1e930 — `test(02-03): add failing tests for ticket routes` (10 failures confirmed)
- Task 2 GREEN commit: f799bb5 — `feat(02-03): implement ticket routes and mount at /api/tickets` (102/102 passing)

## Known Stubs

None. All six client methods are implemented. All three routes return real data in mock mode.

## Threat Surface Scan

New network endpoints introduced at `/api/tickets`, `/api/tickets/:id`, `/api/tickets/:id/customer-system`. All threat model mitigations from the plan applied:

| Flag | File | Description |
|------|------|-------------|
| New inbound surface | backend/src/routes/tickets.ts | Three GET routes exposed — covered by plan threat model T-02-08 through T-02-12 |

Mitigations confirmed:
- T-02-08: Error responses return only generic string; `PhoenixAuthError` detail and token never included.
- T-02-09: `parseInt` + NaN check on `:id` before client call; non-integer returns 400.
- T-02-10: `getEnv()` called lazily inside handler; token only passed to `PhoenixClient` constructor.
- T-02-12: `resolveClientMode('phoenix')` gates mock vs real; defaults to real in production env.

## Self-Check: PASSED
