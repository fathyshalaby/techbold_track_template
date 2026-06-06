# Phase 2: ERP Client + Ticket Routes - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Technicians can see their assigned tickets and SSH target details pulled from the live Phoenix ERP. This phase delivers the typed Phoenix client (auth, retries, timeouts), its in-memory mock, the Zod schemas mirroring `docs/phoenix-openapi.yaml`, and the backend ticket routes that proxy Phoenix. It does NOT include the frontend ticket UI (Phase 8) or any agent/run logic (Phase 5+).

</domain>

<decisions>
## Implementation Decisions

### Route Surface & Response Shape
- Expose `GET /api/tickets`, `GET /api/tickets/:id`, and `GET /api/tickets/:id/customer-system`. Covers all Phase 2 success criteria.
- Return the Phoenix `Ticket[]` shape as-is (typed and Zod-validated) — no envelope wrapper. Mirrors the OpenAPI contract 1:1.
- Build the full typed Phoenix client surface now: `listTickets`, `getTicket`, `getCustomerSystem`, `getMe`, `createActivity`, `setStatus` — so later phases (5/7) reuse it without additions. Only the three routes above are wired in Phase 2.
- Pass through all Phoenix `Ticket` fields; the frontend selects what to display.

### Error Handling & Resilience
- Client maps Phoenix errors to typed errors: 401 → `PhoenixAuthError`, 404 → `PhoenixNotFoundError`, 422 → `PhoenixValidationError`. Retry once on 5xx/network, never on 4xx (per ARCHITECTURE.md).
- Routes surface client errors as clean HTTP: upstream 401 → 502, 404 → 404, empty list → 200 `[]`. Never crash the server with a 500.
- 8s connect/read timeout via `AbortController` (ERP-01).
- 1 retry on 5xx/network with short backoff, idempotent GETs only.

### Mock Fixtures & Sort/Filter
- Mock ships 3–5 tickets spanning OPEN/PENDING/DONE and varied priority, each with a customer-system SSH target. Covers every client method used in the loop.
- Fixtures are generic placeholders — no real symptom strings, hostnames, or per-incident data. Generalisation rule forbids hardcoding.
- Sort/filter happens in the route handler, passing `status`/`priority`/`sort` query params through to Phoenix (OpenAPI supports them). The mock applies the same logic in-memory.
- Mock toggle reuses the existing `resolveClientMode('phoenix')` helper from `env.ts` (built in Phase 1).

### Claude's Discretion
- Exact backoff duration, file/module layout within `phoenix/`, and Zod schema decomposition are at Claude's discretion, guided by codebase conventions.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/env.ts` — `resolveClientMode('phoenix')` and `isMockMode()` already decide mock vs real; reuse directly.
- `backend/src/app.ts` — Hono app with open CORS and `app.onError` JSON handler; mount the tickets router here.
- `backend/src/routes/health.ts` — established route pattern (`new Hono()`, `c.json(...)`, `.js` import suffix).
- Stub files already exist and must be filled: `phoenix/client.ts`, `phoenix/mock.ts`, `phoenix/types.ts`, `routes/tickets.ts`.

### Established Patterns
- ESM with explicit `.js` import suffixes; Zod for all validation; typed errors over generic throws.
- Lazy env access (`getEnv()`), no import-time side effects — keep the client importable in tests without full env.

### Integration Points
- `app.route('/api/tickets', ticketsRouter)` in `app.ts`.
- Phoenix base URL + token from `env.ts` (`PHOENIX_API_URL`, `PHOENIX_API_TOKEN`).
- `docs/phoenix-openapi.yaml` is the locked schema source: `Ticket`, `CustomerSystem`, `SystemInfo`, `Employee`, `Customer`, `Activity`, `TicketStatus`. Phoenix paths are under `/api/v1/...`.

</code_context>

<specifics>
## Specific Ideas

- Phoenix endpoints: `GET /api/v1/me/tickets`, `GET /api/v1/tickets/{id}`, `GET /api/v1/tickets/{id}/customer-system`. Bearer token auth on every call.
- Ticket list query params per spec: `status` (OPEN|PENDING|DONE), `priority` (string), `sort` (date|priority|status, default date).
- `phoenix-client.test.ts` is the named rubric-E test module: cover tickets, 401, 404, empty, and activity create with mocked fetch.

</specifics>

<deferred>
## Deferred Ideas

- `GET /api/me` route and `setStatus`/`createActivity` route wiring — client methods built now, routes deferred to Phases 6/7 where they are used.

</deferred>
