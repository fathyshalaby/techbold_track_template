---
phase: 02-erp-client-ticket-routes
reviewed: 2026-06-06T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - backend/src/phoenix/types.ts
  - backend/src/phoenix/client.ts
  - backend/src/phoenix/mock.ts
  - backend/src/routes/tickets.ts
  - backend/src/app.ts
  - backend/src/tests/phoenix-client.test.ts
  - backend/src/tests/phoenix-types.test.ts
  - backend/src/tests/mock-phoenix.test.ts
  - backend/src/tests/tickets.test.ts
findings:
  critical: 2
  warning: 5
  info: 2
  total: 9
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-06-06T00:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Reviewed the Phoenix ERP client, mock, type schemas, ticket routes, and their test suites. The overall structure is sound — error class hierarchy, retry logic, and Zod boundary validation are correctly implemented. Three issues require fixes before this code can be trusted in production or with a real Phoenix instance: the `loc` field type in `PhoenixValidationErrorSchema` will throw at parse time on any FastAPI list-field validation error; `PhoenixValidationError` bubbles to a 500 in the ticket routes because catch blocks don't handle it; and `setStatus` on the mock permanently mutates the shared fixture array, which contaminates test isolation across files.

---

## Critical Issues

### CR-01: `PhoenixValidationErrorSchema.loc` typed as `z.array(z.string())` — integer indices cause runtime parse failure

**File:** `backend/src/phoenix/types.ts:92`

**Issue:** FastAPI includes the integer array index in `loc` when validation fails on a list element — e.g. `["body", 0, "field_name"]`. The schema types `loc` as `z.array(z.string())`, so any 422 response for a list field fails Zod parsing inside `request()`, throwing a `PhoenixValidationError` with a misleading "Response shape mismatch" message instead of the correct "Phoenix returned 422" mapping. The 422 switch case in `client.ts` line 157 is therefore unreachable for the most common FastAPI validation errors.

**Fix:**
```typescript
// types.ts line 92
loc: z.array(z.union([z.string(), z.number()])),
```

The test in `phoenix-types.test.ts` at line 219 only exercises string-only `loc` arrays and must also be updated:
```typescript
it('parses a validation error with integer loc index', () => {
  expect(() =>
    PhoenixValidationErrorSchema.parse({
      detail: [{ loc: ['body', 0, 'ticket_id'], msg: 'field required', type: 'missing' }],
    }),
  ).not.toThrow();
});
```

---

### CR-02: `PhoenixValidationError` not caught in ticket route handlers — schema mismatch returns 500 with Zod error detail

**File:** `backend/src/routes/tickets.ts:31-42`, `74-88`, `54-65`

**Issue:** The `request()` method in `client.ts` throws `PhoenixValidationError` in two cases: a 422 response from Phoenix (line 157) and a Zod parse failure on an otherwise-OK response (line 146). Neither the `GET /` list handler nor the `GET /:id` or `GET /:id/customer-system` handlers catch `PhoenixValidationError`. It propagates to `app.onError`, which returns `{ error: err.message }` with status 500. The `err.message` for a parse failure contains the full Zod error string including field paths and received values — this leaks schema internals to the client. For a 422, the correct mapping per the architecture is a 502 (upstream rejected the request).

**Fix:**
```typescript
// Add to all three route catch blocks, alongside the existing PhoenixNetworkError case:
import { PhoenixAuthError, PhoenixNotFoundError, PhoenixNetworkError, PhoenixValidationError } from '../phoenix/client.js';

// In each catch block:
if (err instanceof PhoenixValidationError) {
  return c.json({ error: 'ERP returned an unexpected response' }, 502);
}
```

Add a corresponding test to `tickets.test.ts` that spies on `listTickets` throwing `PhoenixValidationError` and asserts 502.

---

## Warnings

### WR-01: `MockPhoenixClient.setStatus` mutates the shared `MOCK_TICKETS` array in place

**File:** `backend/src/phoenix/mock.ts:121`

**Issue:** `ticket.status = status` modifies the object reference inside the module-level `MOCK_TICKETS` array. `listTickets` uses `[...MOCK_TICKETS]` (shallow array copy), so the mutated ticket objects are shared across all consumers. Any test in any file that calls `setStatus` without cleanup leaves the fixture in a modified state for subsequent tests in the same Vitest worker. `tickets.test.ts` works around this with a manual `beforeEach` reset (lines 26-33) keyed to hardcoded `{ 1: 'OPEN', 2: 'OPEN', 3: 'PENDING', 4: 'DONE' }` — which will silently break if fixture data changes.

**Fix:** Return a cloned object rather than mutating in place, and stop leaking the mutation:
```typescript
async setStatus(ticketId: number, status: TicketStatus): Promise<Ticket> {
  this.validateTicketId(ticketId);
  const idx = MOCK_TICKETS.findIndex((t) => t.id === ticketId);
  if (idx === -1) throw new PhoenixNotFoundError(`Ticket ${ticketId} not found`);
  MOCK_TICKETS[idx] = { ...MOCK_TICKETS[idx], status };
  return Promise.resolve({ ...MOCK_TICKETS[idx] });
}
```

Note: `mock-phoenix.test.ts` line 177 explicitly asserts the in-place mutation (`expect(MOCK_TICKETS.find(...).status).toBe('DONE')`). That assertion tests an implementation detail that becomes incorrect after this fix — update it to assert only the returned value.

---

### WR-02: `ListQuerySchema` parse failure silently falls back to no-filter — invalid query params return wrong data with 200

**File:** `backend/src/routes/tickets.ts:25-26`

**Issue:** `const query = parsed.success ? parsed.data : {}` means a request like `GET /api/tickets?status=INVALID` parses `status` as undefined (Zod enum rejection), falls back to `{}`, and returns all tickets. The caller has no indication their filter was ignored. An invalid `status` value should be a 400.

**Fix:**
```typescript
ticketsRouter.get('/', async (c) => {
  const parsed = ListQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'invalid query parameters' }, 400);
  }
  // ...rest of handler using parsed.data
});
```

---

### WR-03: `sort=date` sorts by `id`, not by `created_at`

**File:** `backend/src/phoenix/mock.ts:76`

**Issue:** The real `PhoenixClient.listTickets` passes `sort=date` directly to Phoenix as a query parameter, which presumably sorts by ticket creation date. The mock implements `sort=date` as `result.sort((a, b) => a.id - b.id)`. This only produces correct results because the fixture IDs are insertion-ordered. If fixtures are ever reordered or IDs become non-sequential, mock sort-by-date diverges from real API behavior. All `created_at` values are present in the fixtures — use them.

**Fix:**
```typescript
} else if (query?.sort === 'date') {
  result.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aTime - bTime;
  });
}
```

---

### WR-04: `SystemInfoSchema` is not `.strict()` — breaks the trust boundary stated in T-02-01

**File:** `backend/src/phoenix/types.ts:7-13`

**Issue:** `TicketSchema` and `CustomerSystemSchema` both call `.strict()` with the comment "rejects unknown keys at the Phoenix → backend trust boundary (T-02-01)". `SystemInfoSchema` is embedded inside both and is not `.strict()`, so an attacker-controlled Phoenix response can inject arbitrary fields into `system` (e.g. `system.command`, `system.token`) and they will pass validation silently. The strict boundary is only as strong as its deepest nested schema.

**Fix:**
```typescript
export const SystemInfoSchema = z.object({
  ip: z.string(),
  port: z.number(),
  username: z.string(),
  os: z.string(),
  notes: z.string().optional(),
}).strict();
```

Add a test asserting `SystemInfoSchema.safeParse({ ip: '...', port: 22, username: 'u', os: 'Linux', injected: 'x' }).success === false`.

---

### WR-05: `app.onError` returns `err.message` verbatim — leaks internal details on unhandled errors

**File:** `backend/src/app.ts:15`

**Issue:** `c.json({ error: err.message }, 500)` will echo Zod parse errors (field paths, received values), `TypeError` messages with internal type names, and any other unhandled exception message directly to the HTTP client. With no backend auth this is a lower-severity leak, but it still exposes schema structure and internal state.

**Fix:**
```typescript
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal server error' }, 500);
});
```

Log the original error server-side for debugging.

---

## Info

### IN-01: `mock-phoenix.test.ts` hardcodes `MOCK_TICKETS` fixture expectations by position and count

**File:** `backend/src/tests/mock-phoenix.test.ts:13-22`, `171-178`

**Issue:** Tests assert exactly 4 tickets, exactly 2 OPEN, priority distribution `['high','high','low','medium']`, and the `setStatus` mutation test hard-selects the first OPEN ticket by live array search. These assertions couple test validity to fixture specifics. If a fixture is added or statuses change, these tests fail for reasons unrelated to the code under test. Consider either making fixture counts dynamic or documenting that these are intentional fixture-contract tests.

---

### IN-02: `PhoenixValidationError` name exists in both `types.ts` (Zod inferred type) and `client.ts` (Error subclass)

**File:** `backend/src/phoenix/types.ts:110`, `backend/src/phoenix/client.ts:29`

**Issue:** Both modules export a symbol named `PhoenixValidationError`. `types.ts` exports it as a TypeScript type (Zod inferred). `client.ts` exports it as a runtime class. Any file that imports from both will need aliasing. Currently `routes/tickets.ts` only imports from `client.ts`, so no collision at runtime — but this is a maintenance trap. Rename the Zod-inferred type to avoid future confusion:

```typescript
// types.ts
export type PhoenixValidationErrorBody = z.infer<typeof PhoenixValidationErrorSchema>;
```

---

_Reviewed: 2026-06-06T00:00:00Z_
_Reviewer: Kiro (gsd-code-reviewer)_
_Depth: standard_
