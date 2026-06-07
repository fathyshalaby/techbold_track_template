# Phase 1 Pattern Mapping: Dashboard Ownership and Data Contract

Generated: 2026-06-07

Purpose: map the files Phase 1 is expected to create or modify to the closest existing repository patterns, so planning can preserve current Hono, Vite workflow, safety, SSE, and audit behavior while introducing a Next.js dashboard as the primary UI path.

## Source-Derived Target File List

The phase inputs imply these files or file groups.

| File or group | Change | Role | Data flow | Closest existing analog |
|---|---:|---|---|---|
| `apps/dashboard/package.json` | Create | Next.js dashboard workspace package | Bun workspace command target; browser UI calls Hono backend | `apps/frontend/package.json`, `apps/backend/package.json` |
| `apps/dashboard/app/layout.tsx` | Create | Dashboard root shell | Renders service desk navigation and global providers | `apps/frontend/src/App.tsx` top-level `App()` state shell |
| `apps/dashboard/app/dashboard/page.tsx` | Create | Operational overview route | Reads dashboard aggregate and health/ticket/run summaries | `apps/frontend/src/App.tsx` ticket list view |
| `apps/dashboard/app/dashboard/tickets/page.tsx` | Create | Ticket queue route | Calls `GET /api/tickets`; filters and starts runs | `apps/frontend/src/App.tsx` `loadTickets()` and ticket map |
| `apps/dashboard/app/dashboard/tickets/[ticketId]/page.tsx` | Create | Ticket detail route | Calls `GET /api/tickets/:id` and `GET /api/tickets/:id/customer-system`; starts run | `apps/backend/src/routes/tickets.ts`; `App.tsx` `startRun()` |
| `apps/dashboard/app/dashboard/runs/[runId]/page.tsx` | Create | Existing run workflow route | Calls run detail, `/next`, approve/reject, abort, activity, SSE | `apps/frontend/src/App.tsx` run mode |
| `apps/dashboard/app/dashboard/approvals/page.tsx` | Create | Pending approval queue | Reads aggregate pending approvals and links to run detail | `apps/backend/src/routes/approvals.ts`; `App.tsx` `ApprovalCard` |
| `apps/dashboard/app/dashboard/audit/page.tsx` | Create | Read-only audit evidence entry point | Reads aggregate latest audit or per-run audit summaries | `apps/frontend/src/App.tsx` `AuditTrail` |
| `apps/dashboard/app/dashboard/activity/page.tsx` | Create | Activity visibility entry point | Reads aggregate activity state; run detail owns draft/submit actions | `apps/backend/src/routes/activity.ts`; `App.tsx` `DraftPanel` |
| `apps/dashboard/app/dashboard/memory/page.tsx` | Create | Deferred status surface | Displays explicit Phase 3/4 deferred state unless backend status exists | No current live feature; use `/health` status pattern |
| `apps/dashboard/app/dashboard/observability/page.tsx` | Create | Deferred or health-only status surface | Displays `/health` and Phase 5 deferred state | `apps/backend/src/routes/health.ts` |
| `apps/dashboard/components/*` | Create | Source-owned shadcn components and service desk panels | Render typed dashboard data and route actions | `apps/frontend/src/App.tsx` component functions |
| `apps/dashboard/lib/api.ts` | Create | Dashboard HTTP client | Browser-safe fetch to Hono API base; typed responses; scoped errors | `apps/frontend/src/App.tsx` `api<T>()` |
| `apps/dashboard/lib/events.ts` | Create | Dashboard SSE client/helper | `EventSource` to Hono `/api/runs/:runId/events`; consumes shared event names | `apps/frontend/src/App.tsx` `openStream()` |
| `apps/dashboard/components.json` | Create | shadcn registry config | Official shadcn initialization only | No analog; required by UI spec |
| `apps/dashboard/app/globals.css`, `tailwind.config.*`, `postcss.config.*` | Create | shadcn/Tailwind styling contract | Applies restrained operational palette and component tokens | `apps/frontend/src/App.tsx` inline style tokens, but migrate to shadcn/Tailwind |
| `apps/dashboard/next.config.*`, `tsconfig.json`, test config | Create | Next build/type/test config | Build, typecheck, component tests | `apps/frontend/vite.config.ts`, `apps/frontend/tsconfig.json` |
| `packages/contracts/package.json` | Create | Shared contract package | Makes contracts importable by backend and dashboard | Existing `packages/contracts/*` reference files |
| `packages/contracts/src/events.ts` | Create | Canonical SSE contract | Export one `SSE_EVENT_TYPES` source for backend, Vite fallback, dashboard | `apps/frontend/src/types.ts`; `apps/backend/src/events/sse.ts` |
| `packages/contracts/src/tickets.ts` | Create | Ticket/customer system response types | Shared Phoenix-shaped and normalized safe target metadata | `apps/frontend/src/types.ts`; `apps/backend/src/phoenix/types.ts` |
| `packages/contracts/src/runs.ts` | Create | Run, approval, activity, audit response types | Shared run lifecycle contract for routes and UI | `apps/frontend/src/types.ts`; `apps/backend/src/store/schema.ts` |
| `packages/contracts/src/dashboard.ts` | Create | Dashboard aggregate contract | Typed `GET /api/dashboard` response with source/deferred labels | Research recommendation; no current endpoint analog |
| `packages/contracts/src/index.ts` | Create | Package barrel | Single import boundary for app packages | No current analog |
| `apps/backend/src/routes/dashboard.ts` | Create | Read-focused aggregation route | Composes tickets, runs, pending approvals, audit, activity, health/deferred statuses | `apps/backend/src/routes/tickets.ts`, `runs.ts`, `health.ts` |
| `apps/backend/src/app.ts` | Modify | Hono route registration | Mounts `/api/dashboard` alongside existing route modules | Existing `app.route(...)` registrations |
| `apps/backend/src/routes/runs.ts` | Modify | Run detail contract extension | Add safe direct-navigation context: ticket id, customer system id/target, optional ticket summary/source label | Existing `POST /api/runs` response construction |
| `apps/backend/src/events/sse.ts` | Modify | Backend SSE producer | Import shared event list/type; keep stream behavior and redaction | Existing `createSseStream()` |
| `apps/frontend/src/types.ts` | Modify | Vite fallback contract consumer | Re-export shared SSE/types or stay aligned during fallback period | Existing canonical frontend type file |
| `apps/backend/src/store/runs.ts` | Modify | Store query helpers | List run summaries without exposing raw DB rows to Next.js | Existing `createRun()`, `getRunById()` CRUD helpers |
| `apps/backend/src/store/audit.ts` | Modify | Store query helpers | List latest audit, pending approvals, activity drafts for aggregate | Existing `getAuditEvents()`, `getActivityDraft()`, `createPendingApproval()` |
| `apps/backend/src/tests/dashboard.test.ts` | Create | Backend contract tests | Verify aggregate shape, source labels, no secret/sample leakage, deferred labels | `apps/backend/src/tests/runs.test.ts`, `tickets.test.ts` |
| `apps/backend/src/tests/runs.test.ts` | Modify | Run detail contract tests | Assert extended run context and no protocol/secret leakage | Existing run endpoint tests |
| `apps/backend/src/tests/sse-audit-symmetry.test.ts` or contract test | Modify/Create | SSE contract test | Assert backend imports same canonical event list as contracts/dashboard | Existing SSE symmetry test |
| `apps/dashboard/**/*.test.tsx` | Create | Dashboard component/client tests | Verify data mapping, empty/error states, run navigation path | `apps/frontend/src/types.test.ts` as minimal frontend test analog |
| `package.json` | Modify | Workspace ownership scripts | Add `apps/dashboard` and `packages/contracts`; make primary UI script explicit | Current root scripts point `dev:frontend` to Vite |
| `docker-compose.yml` | Modify | Runtime ownership | Serve Next dashboard as primary UI or name Vite as fallback | Current `frontend` service builds `apps/frontend` on `5173` |
| `apps/dashboard/Dockerfile` | Create | Dashboard container | Build/run Next dashboard | `apps/frontend/Dockerfile`, `apps/backend/Dockerfile` |
| `docs/API.md` | Modify | API contract documentation | Document `/api/dashboard`, extended run detail, source labels, SSE contract ownership | Existing endpoint documentation |
| `docs/ARCHITECTURE.md` or dashboard handoff doc | Modify/Create | Ownership documentation | Record Next primary path and Vite fallback/retirement plan | Existing architecture folder ownership sections |

## Existing Patterns To Preserve

### Hono Route Modules

Current backend routes are small modules exported as `new Hono()` instances and mounted in `app.ts`.

Relevant excerpts:

```ts
export const app = new Hono();

app.route("/health", healthRouter);
app.route("/api/tickets", ticketsRouter);
app.route("/api/runs", runsRouter);
app.route("/api/runs", approvalsRouter);
app.route("/api/runs", eventsRouter);
app.route("/api/runs", activityRouter);

app.onError(errorHandler);
```

Pattern for Phase 1:

- Add `dashboardRouter` in `apps/backend/src/routes/dashboard.ts`.
- Mount it in `apps/backend/src/app.ts` as `app.route("/api/dashboard", dashboardRouter)`.
- Keep backend-owned behavior in Hono. Next.js may render or adapt responses, but must not query Phoenix, SSH, LLM, or store internals directly.

### Backend Validation And Sanitized Errors

`tickets.ts` validates input with Zod and maps upstream failures to clean frontend states:

```ts
const parsed = ListQuerySchema.safeParse(c.req.query());
if (!parsed.success) {
  return c.json({ error: "invalid query parameters" }, 400);
}

try {
  const tickets = await getClient().listTickets(query);
  return c.json(tickets, 200);
} catch (err) {
  if (err instanceof PhoenixAuthError) {
    return c.json({ error: "upstream authentication failed" }, 502);
  }
  if (err instanceof PhoenixNotFoundError) {
    return c.json([], 200);
  }
  if (err instanceof PhoenixNetworkError) {
    return c.json({ error: "ERP unavailable" }, 502);
  }
  throw err;
}
```

Pattern for Phase 1:

- Validate any dashboard query params with Zod.
- Return shaped empty states and short `{ error }` messages.
- Do not forward Phoenix tokens, SSH key paths, raw upstream bodies, or raw thrown messages.

### Run Creation And Direct Navigation Gap

`POST /api/runs` already returns safe ticket and target metadata:

```ts
return c.json(
  {
    runId: run.id,
    status: "LOADED_CONTEXT" as const,
    ticket: {
      id: ticket.id,
      title: ticket.title,
      priority: ticket.priority,
      status: ticket.status,
      customer_name: ticket.customer_name,
    },
    customerSystem: {
      ip: system.ip,
      port: system.port,
      username: system.username,
      os: system.os,
    },
  },
  201,
);
```

`GET /api/runs/:runId` currently returns workflow state only:

```ts
return c.json({
  runId: run.id,
  status: run.status,
  phase: run.current_phase,
  timeline,
  pendingApproval,
  activityDraft,
});
```

Pattern for Phase 1:

- Extend run detail, or aggregate run summaries, with safe direct-navigation context so `/dashboard/runs/:runId` can load without relying on component state from run creation.
- Safe target metadata already exposed by existing routes is `ip`, `port`, `username`, and `os`; secrets remain server-side.
- Preserve `ticket_id` and `customer_system_id` as backend store fields, but expose normalized dashboard names.

### Approval Safety Invariant

Approval execution is backend-only and rechecks the final command:

```ts
const finalCommand = parsed.data.editedCommand ?? approval.proposed_command;
let state: Awaited<ReturnType<typeof advance>>;
try {
  state = await advance(runId, { type: "command_approved", approvalId, finalCommand });
} finally {
  inFlightApprovals.delete(approvalId);
}

if (state.phase === "WAITING_FOR_APPROVAL") {
  return c.json(
    { error: "command blocked by safety policy", riskLevel: "HIGH_RISK_BLOCKED" },
    422,
  );
}
```

Pattern for Phase 1:

- Dashboard approval controls must call `POST /api/runs/:runId/approvals/:approvalId/approve`.
- Edited commands must be sent as `editedCommand`; the dashboard must not locally classify or execute them.
- Reject must send a non-empty reason to `POST /api/runs/:runId/approvals/:approvalId/reject`.

### Activity Submit Honesty

Activity submit creates Phoenix activity, then only closes the ticket when validation evidence exists:

```ts
const validated = auditEvents.some((e) => {
  if (e.type !== "validation.completed") return false;
  const p = parseAuditPayload(e.payload_json);
  return p?.status === "VERIFIED_FIXED" || p?.status === "LIKELY_FIXED";
});

if (validated) {
  await client.setStatus(run.ticket_id, "DONE");
  appendAuditEvent(runId, "ticket.status_updated", "system", {
    ticketId: run.ticket_id,
    status: "DONE",
  });
} else {
  appendAuditEvent(runId, "ticket.left_open_unvalidated", "system", { ticketId: run.ticket_id });
}
```

Pattern for Phase 1:

- Dashboard copy must not claim that submission closes or fixes an incident unless the backend reports that result.
- Activity pages should primarily be read-focused summaries; draft and submit actions remain run-detail actions backed by existing endpoints.

### SSE Contract And Stream Shape

The event list is duplicated today in `apps/frontend/src/types.ts` and `apps/backend/src/events/sse.ts`:

```ts
export const SSE_EVENT_TYPES = [
  "run.started",
  "agent.thought_summary",
  "command.proposed",
  "command.blocked",
  "approval.required",
  "command.executing",
  "command.completed",
  "observation.added",
  "fix.proposed",
  "validation.completed",
  "activity.drafted",
  "activity.submitted",
  "run.completed",
  "run.failed",
] as const;
```

The backend stream backfills audit and then streams live events:

```ts
const backfill = getAuditEvents(runId);
for (const event of backfill) {
  await stream.writeSSE({
    event: event.type,
    data: JSON.stringify({
      type: event.type,
      runId: event.run_id,
      ts: event.ts,
      payload: JSON.parse(event.payload_json),
    }),
    id: event.id,
  });
}
```

The current Vite UI subscribes by event type:

```ts
const es = new EventSource(`${API_BASE}/api/runs/${runId}/events`);
for (const eventType of SSE_EVENT_TYPES) {
  es.addEventListener(eventType, handleEvent);
}
```

Pattern for Phase 1:

- Move `SSE_EVENT_TYPES` to `packages/contracts/src/events.ts`.
- Backend, Vite fallback, and dashboard should import or re-export the same list.
- Keep `EventSource` as the dashboard run-detail mechanism.
- Do not proxy SSE through Next.js in Phase 1 unless streaming behavior is explicitly tested; direct browser `EventSource` to Hono is the simpler path.

### Store Helper Boundary

The backend currently keeps SQL access inside store modules:

```ts
export function getRunById(id: string): Run | undefined {
  const row = getDb().get("SELECT * FROM runs WHERE id = ?", [id]);
  if (!row) return undefined;
  return RunSchema.parse(row);
}

export function getAuditEvents(runId: string): AuditEvent[] {
  const rows = getDb().all<AuditEvent>(
    "SELECT * FROM audit_events WHERE run_id = ? ORDER BY ts ASC",
    [runId],
  );
  return rows.map((r) => AuditEventSchema.parse(r));
}
```

Pattern for Phase 1:

- Add dashboard read helpers in `apps/backend/src/store/runs.ts` and `apps/backend/src/store/audit.ts`.
- Keep SQL and JSONL adapter compatibility behind store helpers.
- Parse rows with existing Zod schemas before returning them to route code.
- Do not query `getDb()` from the Next.js dashboard.

### Frontend API And Workflow Behavior

Current Vite `api<T>()` centralizes JSON fetch and error extraction:

```ts
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const msg = (body as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}
```

The main workflow actions are already mapped to real endpoints:

```ts
const next = () => act(() => api(`/api/runs/${run!.runId}/next`, { method: "POST" }));
const abort = () => act(() => api(`/api/runs/${run!.runId}/abort`, { method: "POST" }));
const approve = (a: Approval) =>
  act(() => {
    const edited = editCmd.trim();
    const reqBody = edited && edited !== a.proposed_command ? { editedCommand: edited } : {};
    return api(`/api/runs/${run!.runId}/approvals/${a.id}/approve`, {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
  });
```

Pattern for Phase 1:

- Port this behavior into dashboard client modules and route components.
- Keep explicit loading, busy, and scoped error state.
- Every main-path button must call one of these backend endpoints, navigate to a real dashboard route, or be removed.

### Component Extraction Analog

`App.tsx` already separates repeated UI sections into local functions:

```ts
function AuditTrail({
  card,
  timeline,
}: { card: React.CSSProperties; timeline: RunView["timeline"] }) {
  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>
        Audit trail{" "}
        <span style={{ color: "#666", fontWeight: 400, fontSize: 13 }}>
          - {timeline.length} events - redacted, append-only
        </span>
      </h3>
      ...
    </div>
  );
}
```

Pattern for Phase 1:

- Convert local functions into dashboard components: `AuditTrail`, `ApprovalPanel`, `ActivityDraftPanel`, `RunControls`, `TicketQueue`, `BackendStatus`.
- Replace inline styles with shadcn/Tailwind tokens from the UI spec.
- Preserve domain copy and redacted/append-only language.

## Data Contract Patterns For Planner

### Recommended Dashboard Aggregate Shape

Use a narrow read-only endpoint when existing endpoints cannot provide cross-run summaries:

```ts
interface DashboardResponse {
  generatedAt: string;
  source: DashboardSource;
  health: DashboardHealth;
  tickets: {
    items: DashboardTicket[];
    counts: { open: number; pending: number; done: number; total: number };
  };
  runs: {
    active: DashboardRunSummary[];
    terminal: DashboardRunSummary[];
  };
  approvals: {
    pending: DashboardApprovalSummary[];
  };
  audit: {
    latest: DashboardAuditSummary[];
  };
  activity: {
    drafts: DashboardActivitySummary[];
    submittedCount: number;
  };
  memory: DeferredStatus;
  observability: DeferredStatus | HealthOnlyStatus;
}
```

Source labels should be explicit values, not inferred by the UI:

```ts
type DashboardSource =
  | { type: "live"; label: "Live backend" }
  | { type: "mock"; label: "Mock backend" }
  | { type: "seed"; label: "Seed data" };

type DeferredStatus = {
  status: "deferred";
  label: "Deferred";
  message: string;
};
```

### Current Health Shape

`GET /health` returns a small status object:

```ts
{
  status: "ok",
  mode: isMockMode() ? "mock" : "real",
  store: getStoreStatus(),
}
```

Pattern for Phase 1:

- Reuse this shape in `/api/dashboard.health`.
- Observability can be `health-only` in Phase 1.
- Memory and observability must use explicit deferred labels when no backend capability exists.

## Test Patterns

### Backend Route Tests

Existing route tests use `app.request(...)` with JSONL store setup:

```ts
beforeEach(() => {
  setDb(makeJsonlAdapter());
});

const res = await app.request("/api/runs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ticketId: 1 }),
});
expect(res.status).toBe(201);
```

Pattern for Phase 1:

- Add `apps/backend/src/tests/dashboard.test.ts`.
- Test `GET /api/dashboard` against mock mode and JSONL store.
- Assert source labels, deferred memory/observability, pending approval summaries, latest audit summaries, and no secret-looking fields.
- Update `runs.test.ts` to cover any run detail response extension.

### SSE Contract Tests

Existing frontend test asserts event list uniqueness and no legacy aliases:

```ts
expect(SSE_EVENT_TYPES).toContain("validation.completed");
expect(SSE_EVENT_TYPES).toContain("activity.drafted");
expect(SSE_EVENT_TYPES).not.toContain("validation.complete");
expect(SSE_EVENT_TYPES).not.toContain("activity.draft_ready");
expect(new Set(SSE_EVENT_TYPES).size).toBe(SSE_EVENT_TYPES.length);
```

Pattern for Phase 1:

- Move this test intent to the shared contracts package.
- Add backend/dashboard import tests only if necessary to prove both consumers use the same contract.

### Dashboard Component/Client Tests

No React Testing Library setup exists yet. If Phase 1 adds dashboard component tests, keep them focused:

- data mapping from `DashboardResponse` to ticket/run/approval UI
- empty states from UI spec
- backend error banner copy
- navigation from ticket start-run result to `/dashboard/runs/:runId`

Avoid broad visual tests in Phase 1 unless a smoke tool is already added.

## Workspace And Ownership Patterns

### Current Workspace

Root scripts currently make Vite the frontend:

```json
"workspaces": ["apps/backend", "apps/frontend"],
"scripts": {
  "build": "bun run --filter techbold-track-frontend build",
  "dev:backend": "bun run --filter techbold-track-backend dev",
  "dev:frontend": "bun run --filter techbold-track-frontend dev",
  "test": "bun run --filter techbold-track-backend test && bun run --filter techbold-track-frontend test",
  "typecheck": "bun run --filter techbold-track-backend typecheck && bun run --filter techbold-track-frontend typecheck"
}
```

Pattern for Phase 1:

- Add `apps/dashboard` and `packages/contracts` to workspaces if they become packages.
- Make the primary UI command unambiguous. A likely pattern is:
  - `dev:frontend` or `dev:dashboard` runs the Next dashboard.
  - `dev:vite` runs the fallback Vite app during v1.3.
- Update `check` to include contracts and dashboard tests/typecheck/build.

### Docker Compose

Current Compose serves Vite as `frontend`:

```yaml
frontend:
  build:
    context: .
    dockerfile: apps/frontend/Dockerfile
  environment:
    VITE_API_BASE: http://localhost:8000
  ports:
    - "5173:5173"
  depends_on:
    - backend
```

Pattern for Phase 1:

- Either replace `frontend` with the Next dashboard service or add a `dashboard` service and clearly mark Vite as fallback.
- Use a public dashboard API base equivalent to current `VITE_API_BASE`.
- Keep backend on `8000`.

## Documentation Patterns

### API Docs

`docs/API.md` already documents backend as the browser-facing contract and states the browser never talks to Phoenix, SSH, or LLM directly:

> The product rule: the backend holds the Phoenix token and the SSH key; the browser never talks to Phoenix, SSH, or the LLM directly.

Pattern for Phase 1:

- Add `GET /api/dashboard`.
- Update `GET /api/runs/:runId` if response context is extended.
- Record source labels and deferred statuses.
- Keep the Hono backend as source of truth.

### Architecture / Ownership Docs

`docs/ARCHITECTURE.md` still describes an older `backend/` path in its folder structure, while the actual workspace uses `apps/backend` and `apps/frontend`.

Pattern for Phase 1:

- Account for current `apps/` paths in any ownership update.
- Record: Next dashboard is primary, Vite is fallback during v1.3 only, and retirement criteria are tied to parity of ticket, run, approval, SSE, audit, and activity workflows.

## Planner Guardrails

- Do not keep shadcn dashboard-01 sample content, Acme teams, fake charts, fake documents, fake users, fake metrics, or local-only operational constants on the main dashboard path.
- Keep the backend as the only owner of Phoenix, SSH execution, LLM/orchestrator, safety, approval, audit, activity submit, redaction, and SSE stream generation.
- Prefer one shared contract package over duplicating TypeScript shapes across Vite, Next, and backend.
- Add backend aggregation only where current endpoints cannot provide dashboard summaries.
- Keep memory and observability as explicit deferred/read-only surfaces in Phase 1.
- Preserve current `apps/` workspace paths and do not revert unrelated worktree changes.
