# Phase 1 Research: Dashboard Ownership and Data Contract

Generated: 2026-06-07

Purpose: identify what must be known before planning Phase 1 so implementation can establish a Next.js dashboard as the primary operational UI path without breaking the existing technician workflow.

## Executive Findings

Phase 1 is primarily an ownership, contract, and migration phase. The current product path is still `apps/frontend`, a Vite React 18 single-page technician workspace. It already implements the critical run workflow: ticket loading, run creation, `EventSource` SSE, `/next`, approval edit/approve/reject, activity draft/submit, audit timeline, and run close.

There is no Next.js app, no shadcn setup, no `components.json`, no Tailwind/PostCSS config, and no dashboard package in the Bun workspace today. Docker Compose still serves the Vite frontend on `5173`.

The backend already has most main-flow actions needed by a dashboard:

- `GET /health`
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `GET /api/tickets/:id/customer-system`
- `POST /api/runs`
- `GET /api/runs/:runId`
- `POST /api/runs/:runId/next`
- `POST /api/runs/:runId/abort`
- `GET /api/runs/:runId/events`
- `POST /api/runs/:runId/approvals/:approvalId/approve`
- `POST /api/runs/:runId/approvals/:approvalId/reject`
- `POST /api/runs/:runId/activity/draft`
- `POST /api/runs/:runId/activity/submit`

The backend does not currently expose list/summary endpoints for active runs, pending approvals, latest audit evidence, activity state across runs, memory status, or observability status beyond `/health`. Planning should decide whether to add a narrow read-only dashboard aggregation endpoint, likely `GET /api/dashboard`, rather than teaching the Next.js app to query internal store details.

The most important planning decisions are:

1. Where the Next.js dashboard package lives and which command becomes the primary UI command.
2. Whether to pin Next to the previous research recommendation (`next@15.5.19`) or use current latest (`next@16.x` with React 19-era defaults).
3. How shared API/SSE contracts move out of duplicated frontend/backend files and into a reusable boundary.
4. Which dashboard surfaces are live, seed-labeled, or deferred in Phase 1.
5. How Vite remains available as a temporary fallback without continuing to be the primary product path.

## Source Inputs Read

- `.planning/phases/01-dashboard-ownership-and-data-contract/01-CONTEXT.md`
- `.planning/phases/01-dashboard-ownership-and-data-contract/01-UI-SPEC.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/research/SUMMARY.md`
- `AGENTS.md`
- `package.json`
- `apps/backend/package.json`
- `apps/frontend/package.json`
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/types.ts`
- `apps/backend/src/app.ts`
- `apps/backend/src/routes/tickets.ts`
- `apps/backend/src/routes/runs.ts`
- `apps/backend/src/routes/events.ts`

Additional files read because they define the real contracts Phase 1 must preserve:

- `apps/backend/src/routes/approvals.ts`
- `apps/backend/src/routes/activity.ts`
- `apps/backend/src/routes/health.ts`
- `apps/backend/src/events/sse.ts`
- `apps/backend/src/store/db.ts`
- `apps/backend/src/store/runs.ts`
- `apps/backend/src/store/audit.ts`
- `apps/backend/src/store/schema.ts`
- `apps/backend/src/phoenix/types.ts`
- `apps/backend/src/phoenix/mock.ts`
- `apps/backend/src/sandbox/scenarios.json`
- `.env.example`
- `docker-compose.yml`
- `docs/API.md`

External current-version sources checked:

- Next.js installation docs: https://nextjs.org/docs/app/getting-started/installation
- Next.js Vite migration guide: https://nextjs.org/docs/app/guides/migrating/from-vite
- shadcn installation docs: https://ui.shadcn.com/docs/installation
- shadcn Next.js docs: https://ui.shadcn.com/docs/installation/next
- shadcn blocks docs: https://ui.shadcn.com/docs/_blocks
- `npm view next react shadcn lucide-react` on 2026-06-07

## Current Repository State

### Workspace And Scripts

Root `package.json` has only two workspaces:

- `apps/backend`
- `apps/frontend`

Root scripts currently point to Vite as the frontend:

- `bun run dev:backend` -> `techbold-track-backend dev`
- `bun run dev:frontend` -> `techbold-track-frontend dev`
- `bun run build` -> frontend build only
- `bun run check` -> lint, typecheck, test, build

Planning implication: if Next.js is the primary dashboard path, Phase 1 must update workspace membership, scripts, Docker Compose, and docs so the primary path is unambiguous. Leaving `dev:frontend` as Vite while declaring Next primary would not satisfy DASH-04 cleanly.

### Frontend

`apps/frontend` is a Vite React package with:

- `react@18.3.1`
- `react-dom@18.3.1`
- `vite@5.4.11`
- Vitest
- no routing library
- no component library
- direct inline styles in `App.tsx`

`App.tsx` is the only substantial UI file. It contains useful behavior to port or extract:

- API helper based on `VITE_API_BASE`, default `http://localhost:8000`
- ticket list load from `GET /api/tickets`
- run create through `POST /api/runs`
- run refresh through `GET /api/runs/:runId`
- SSE subscription to `GET /api/runs/:runId/events`
- approve path with optional `editedCommand`
- reject path with reason fallback
- abort path
- activity draft and submit paths
- audit payload summarization

`apps/frontend/src/types.ts` defines the canonical frontend SSE event list and frontend route response types. The backend has a duplicated `SSE_EVENT_TYPES` list in `apps/backend/src/events/sse.ts`.

Planning implication: Phase 1 should not reimplement the workflow from scratch. It should extract or port the Vite behavior into typed dashboard client modules, preserving endpoint calls and SSE event names.

### Backend

`apps/backend/src/app.ts` mounts:

- `/health`
- `/api/tickets`
- `/api/runs` routes for runs, approvals, events, and activity

The backend remains the source of truth for:

- Phoenix access
- SSH execution
- LLM/orchestrator behavior
- safety classification and edited-command recheck
- approvals
- audit writes
- activity submission
- redaction
- SSE

The store is currently SQLite when available, with an in-memory JSONL adapter only in mock mode when SQLite is unavailable. `/health` reports:

```json
{
  "status": "ok",
  "mode": "mock",
  "store": { "mode": "sqlite", "durable": true }
}
```

Planning implication: Phase 1 can honestly display current store durability from `/health`, but should not imply Postgres readiness, memory retrieval, or observability signals before later phases.

## Current Backend Contracts To Preserve

### Tickets

`GET /api/tickets` returns Phoenix-shaped tickets:

- `id`
- `title`
- `description`
- `priority`
- `status`: `OPEN | PENDING | DONE`
- `customer_id`
- `customer_name`
- optional `tags`
- optional `sla_due_at`
- optional `created_at`

Query supports optional `status`, `priority`, and `sort`.

`GET /api/tickets/:id/customer-system` returns a Phoenix-shaped wrapper:

```ts
{
  ticket_id: number
  customer_id: number
  system: {
    ip: string
    port: number
    username: string
    os: string
    notes?: string
  }
}
```

`POST /api/runs`, however, returns normalized `customerSystem` directly:

```ts
{
  ip: string
  port: number
  username: string
  os: string
}
```

Planning implication: the dashboard needs a clear normalized target-system shape. Otherwise ticket detail, run creation, and direct run detail loads will have inconsistent data.

### Runs

`POST /api/runs` accepts:

```ts
{ ticketId: number }
```

and returns:

```ts
{
  runId: string
  status: "LOADED_CONTEXT"
  ticket: {
    id: number
    title: string
    priority: string
    status: string
    customer_name: string
  }
  customerSystem: {
    ip: string
    port: number
    username: string
    os: string
  }
}
```

`GET /api/runs/:runId` returns:

```ts
{
  runId: string
  status: string
  phase: string
  timeline: AuditEvent[]
  pendingApproval: CommandApproval | null
  activityDraft: ActivityDraft | null
}
```

Gap: `GET /api/runs/:runId` does not include `ticketId`, `customerSystemId`, `ticket`, or normalized target metadata. The current Vite UI keeps target metadata in component state from `POST /api/runs`, so direct navigation to a run detail URL cannot fully reconstruct context.

Planning implication: Phase 1 should extend the run detail response, or the dashboard aggregation endpoint, with safe run context:

- `ticketId`
- `customerSystemId` or parsed `target.host` and `target.port`
- optional ticket summary
- optional source label

Avoid returning secrets. Host, port, username, and OS are already treated as approved target metadata by existing APIs.

### Approvals

Approve:

```http
POST /api/runs/:runId/approvals/:approvalId/approve
```

Body:

```ts
{
  editedCommand?: string
  reason?: string
}
```

Important invariant: the backend reclassifies the final command and returns `422` when an edited command is blocked by safety policy. The dashboard approval UI must preserve this flow and must not run commands outside this endpoint.

Reject:

```http
POST /api/runs/:runId/approvals/:approvalId/reject
```

Body:

```ts
{ reason: string }
```

Gap: there is no endpoint to list pending approvals across runs. Current Vite only surfaces an approval after the technician is already inside a run.

Planning implication: the overview and `/dashboard/approvals` need either:

- a read-only dashboard aggregate endpoint that lists pending approvals with run and ticket context, or
- a new `GET /api/approvals?status=PENDING` endpoint.

The aggregate endpoint is lower scope for Phase 1 because it can be read-only and dashboard-specific.

### Activity

Draft:

```http
POST /api/runs/:runId/activity/draft
```

Submit:

```http
POST /api/runs/:runId/activity/submit
```

Submit can leave the ticket open when validation evidence is absent. The dashboard must not claim resolution merely because an activity was submitted or a run reached activity review.

Gap: no cross-run activity queue endpoint exists.

Planning implication: show activity state primarily in run detail, and use the dashboard aggregate only for read-only summary counts or latest activity drafts.

### SSE

The canonical event names are identical in `apps/frontend/src/types.ts` and `apps/backend/src/events/sse.ts`:

- `run.started`
- `agent.thought_summary`
- `command.proposed`
- `command.blocked`
- `approval.required`
- `command.executing`
- `command.completed`
- `observation.added`
- `fix.proposed`
- `validation.completed`
- `activity.drafted`
- `activity.submitted`
- `run.completed`
- `run.failed`

The SSE stream backfills audit events and then streams live `runEventBus` events. Keepalive events are sent with event type `keepalive` and empty data.

Planning implications:

- Promote this event list into a shared contract package or one canonical source.
- Do not invent dashboard-specific event names.
- The run detail page should continue to use `EventSource`.
- If Next.js proxies backend calls, take special care not to break SSE streaming. The simpler Phase 1 route is client-side `EventSource` to the Hono backend using a public API base.

## Data Contract Recommendation

Create a small shared contracts package and a narrow dashboard aggregate endpoint.

### Shared Contract Package

Current `packages/contracts` contains reference files but is not a Bun workspace package. Phase 1 should decide whether to turn it into a real TypeScript package.

Recommended minimal shape:

- Add `packages/contracts/package.json`.
- Add `packages/contracts/src/api.ts` or focused files such as:
  - `tickets.ts`
  - `runs.ts`
  - `dashboard.ts`
  - `events.ts`
- Export:
  - shared `SSE_EVENT_TYPES`
  - `SseEventType`
  - dashboard response types
  - run/ticket/approval/activity response types needed by the dashboard
- Prefer Zod schemas if runtime parsing will be used in both backend tests and dashboard client code.

Why: typed backend response contracts are a Phase 1 decision. Keeping duplicated shapes in `apps/frontend/src/types.ts`, `apps/backend/src/events/sse.ts`, and a new Next app would make the dashboard contract weaker than the existing Vite code.

Package consideration: root `workspaces` must include `packages/contracts` if it becomes importable code.

### Dashboard Aggregate Endpoint

Add a read-only route such as:

```http
GET /api/dashboard
```

Proposed response shape:

```ts
{
  generatedAt: string
  source: {
    type: "live" | "mock" | "seed"
    label: "Live backend" | "Mock backend" | "Seed data"
  }
  health: {
    status: "ok" | "degraded"
    mode: "mock" | "real"
    store: { mode: "sqlite" | "jsonl"; durable: boolean }
  }
  tickets: {
    items: DashboardTicket[]
    counts: { open: number; pending: number; done: number; total: number }
  }
  runs: {
    active: DashboardRunSummary[]
    terminal: DashboardRunSummary[]
  }
  approvals: {
    pending: DashboardApprovalSummary[]
  }
  audit: {
    latest: DashboardAuditSummary[]
  }
  activity: {
    drafts: DashboardActivitySummary[]
    submittedCount: number
  }
  memory: {
    status: "deferred"
    label: "Deferred"
    message: "Memory evidence is deferred to Phase 3 and Phase 4."
  }
  observability: {
    status: "deferred" | "health-only"
    label: "Deferred" | "Live backend"
    message: string
  }
}
```

Dashboard item types should carry source labels where the UI needs to distinguish live backend, mock backend, seed data, and deferred status.

Implementation note for planning: this endpoint can compose public route-equivalent data and store summaries inside the Hono backend. It should not expose raw SQL rows directly and should not return secret-bearing payloads.

Store helper functions likely needed:

- `listRuns(limit?: number)`
- `listRunsByStatus(statuses: RunStatusValue[])`
- `listPendingApprovals()`
- `getLatestAuditEvents(limit: number)`
- `listLatestActivityDrafts(limit: number)`
- optional `getRunDashboardContext(runId)`

Keep these in `apps/backend/src/store/*` rather than querying `getDb()` directly from Next.js.

## Frontend Ownership Options

### Option A: Add `apps/dashboard` As The Next.js Primary App

This is the lowest-risk path for Phase 1.

Likely changes:

- Add `apps/dashboard/package.json`.
- Add Next.js app files under `apps/dashboard/app` or `apps/dashboard/src/app`.
- Add `apps/dashboard/components` and `apps/dashboard/lib`.
- Add `apps/dashboard/components.json`.
- Add `apps/dashboard/tailwind.config.*` or Tailwind v4 config shape from current shadcn/Next setup.
- Add `apps/dashboard/postcss.config.*` if required by selected Tailwind version.
- Add `apps/dashboard/next.config.*`.
- Update root `package.json` workspaces to include `apps/dashboard` and maybe `packages/contracts`.
- Add root scripts:
  - `dev:dashboard`
  - `build:dashboard`
  - `test:dashboard`
  - possibly make `dev:frontend` point to dashboard and add `dev:vite` for fallback.
- Update Docker Compose so the primary UI service runs the Next dashboard, or add a clearly named dashboard service and mark Vite as fallback.

Pros:

- Does not destroy the known-good Vite workflow while parity is being proven.
- Makes the Vite retirement plan explicit.
- Avoids mixing Vite and Next config in one package.

Cons:

- Requires root script and Docker ownership decisions.
- Can create two UI packages if documentation remains ambiguous.

### Option B: Convert `apps/frontend` From Vite To Next.js

This more directly makes `dev:frontend` the dashboard path.

Pros:

- Strong primary path signal.
- Fewer long-term UI packages.

Cons:

- Higher risk because the existing Vite run workflow is the current working path.
- Requires preserving or moving the fallback before migration.
- Requires cleanup of Vite files (`index.html`, `vite.config.ts`, `src/main.tsx`) only after parity.

Planning recommendation: choose Option A for implementation, but make root scripts and docs show the Next dashboard as primary by the end of Phase 1. For example, use `apps/dashboard` for Next and keep `apps/frontend` as "Vite fallback during v1.3 only". If the team wants `bun run dev:frontend` to mean "primary UI", update it to run the dashboard and create a separate `dev:vite` script for the fallback.

## Current-Version Assumptions

As of 2026-06-07:

- Official Next.js docs page opened during research shows latest version `16.2.2`.
- `npm view next version` returned `16.2.7`.
- `npm view next dist-tags.backport` returned `15.5.19`.
- `npm view react version` returned `19.2.7`.
- `npm view shadcn version` returned `4.10.0`.
- `npm view lucide-react version` returned `1.17.0`.

The milestone research summary recommended `next@15.5.19` with the existing React 18 stack as the lower-risk path. Current official Next installation docs now default to TypeScript, Tailwind CSS, App Router, Turbopack, and current React behavior.

Planning implication: do not use `next@latest` casually. The plan should explicitly choose one:

- Conservative: pin `next@15.5.19` if the goal is to minimize framework-version drift during Phase 1.
- Current-default: use Next 16 and React 19 in a separate `apps/dashboard` package if the team accepts a newer framework surface for the new dashboard.

Either way, record the chosen versions in the phase plan and package files. This is especially important because the existing Vite app is React 18.

## shadcn Dashboard-01 Integration Constraints

No shadcn setup exists today.

Official shadcn docs state that supported templates include `next` and that monorepo projects can use a monorepo flag or specify the workspace path when adding components. The Next.js shadcn docs also expect Tailwind CSS and a working `@/*` import alias. The blocks docs show `dashboard-01` as a block whose page target is `app/dashboard/page.tsx`.

Planning constraints:

- Initialize shadcn only in the selected Next dashboard package.
- Use the official registry only.
- Use `dashboard-01` as source-owned scaffolding, not as product content.
- Remove all generated sample teams, users, documents, chart data, fake metrics, and Acme/sample organization references before making it the main path.
- Do not add third-party registries in Phase 1.
- Avoid shadcn chart blocks unless backed by real persisted data. The UI spec explicitly rejects fake metrics and decorative charts.
- Keep only reusable layout pieces: sidebar, top bar, responsive shell, table/list layout, detail panels, buttons, badges, dialog/sheet/tooltip/skeleton.
- Use `lucide-react` icons for navigation and icon buttons.
- Keep the service-desk palette and typography from `01-UI-SPEC.md`, not the generated dashboard theme if it conflicts.

Important fixture concern: `apps/backend/src/phoenix/mock.ts` still contains generic older mock tickets with `Acme Corp`, `Globex Industries`, etc. `.env.example` defaults `MOCK_SCENARIOS=true`, which uses realistic sandbox tickets from `apps/backend/src/sandbox/scenarios.json`. Phase 1 smoke verification should run with `MOCK_SCENARIOS=true` and source labels. If tests run against the older 4-ticket fixture, the dashboard must label it as backend seed/mock data and should not confuse those records with shadcn content.

## Next.js Runtime And Environment Decisions

The current Vite app uses:

```ts
import.meta.env.VITE_API_BASE
```

Next.js client-exposed environment variables use `NEXT_PUBLIC_` prefixes. The Next Vite migration guide explicitly calls out the prefix change from `VITE_` to `NEXT_PUBLIC_`.

Planning decisions needed:

- Use `NEXT_PUBLIC_API_BASE=http://localhost:8000` for client-side fetch and `EventSource`, or
- Use same-origin Next route handlers as a proxy for normal JSON requests while keeping SSE direct to Hono, or
- Proxy SSE too, which is more risk and not necessary for Phase 1.

Recommendation: use direct client calls to Hono with `NEXT_PUBLIC_API_BASE` for Phase 1. The backend already has open CORS for this local single-machine tool, and direct `EventSource` preserves the existing SSE model.

Build risk: if Next server components fetch `http://localhost:8000` during `next build`, builds may fail when the backend is not running. Plan dashboard data loading as client-side fetch for the operational surfaces, or mark any server-fetched pages dynamic and ensure build does not require a live backend.

## Vite Ownership Decision

DASH-04 requires an explicit decision. The plan should include a document update with one of these states:

Recommended state for Phase 1:

```text
Next.js dashboard is the primary v1.3 operational UI path. The Vite app in apps/frontend is retained only as a temporary compatibility fallback until the Next dashboard proves ticket selection, run creation, run detail, approval edit/approve/reject, SSE, audit timeline, and activity draft/submit in mock mode. Later v1.3 phases extend Next.js only. Vite may be deleted or moved out of the main path after parity smoke passes.
```

Docs likely to update:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/README.md`
- `docs/SUBMISSION_HANDOFF.md` if it mentions the old UI path
- `.planning/STATE.md` after phase completion
- root `package.json` scripts
- `docker-compose.yml`
- frontend/dashboard Dockerfile ownership

Planning should also decide whether `bun run dev:frontend` remains the Vite fallback or becomes the primary dashboard command. If it remains Vite, add `bun run dev:dashboard` and make the docs unmistakable.

## Likely Files To Create

For an `apps/dashboard` implementation:

- `apps/dashboard/package.json`
- `apps/dashboard/tsconfig.json`
- `apps/dashboard/next.config.*`
- `apps/dashboard/components.json`
- `apps/dashboard/app/layout.tsx`
- `apps/dashboard/app/page.tsx` redirecting or linking to `/dashboard`
- `apps/dashboard/app/dashboard/page.tsx`
- `apps/dashboard/app/dashboard/tickets/page.tsx`
- `apps/dashboard/app/dashboard/tickets/[ticketId]/page.tsx`
- `apps/dashboard/app/dashboard/runs/[runId]/page.tsx`
- `apps/dashboard/app/dashboard/approvals/page.tsx`
- `apps/dashboard/app/dashboard/audit/page.tsx`
- `apps/dashboard/app/dashboard/activity/page.tsx`
- `apps/dashboard/app/dashboard/memory/page.tsx`
- `apps/dashboard/app/dashboard/observability/page.tsx`
- `apps/dashboard/components/app-sidebar.tsx`
- `apps/dashboard/components/dashboard-shell.tsx`
- `apps/dashboard/components/source-badge.tsx`
- `apps/dashboard/components/status-badge.tsx`
- `apps/dashboard/components/ticket-table.tsx`
- `apps/dashboard/components/run-summary-list.tsx`
- `apps/dashboard/components/approval-panel.tsx`
- `apps/dashboard/components/audit-trail.tsx`
- `apps/dashboard/components/activity-panel.tsx`
- `apps/dashboard/lib/api.ts`
- `apps/dashboard/lib/dashboard-contract.ts` if not fully shared through `packages/contracts`
- `apps/dashboard/lib/sse.ts`
- `apps/dashboard/app/globals.css`
- `apps/dashboard/Dockerfile`

For shared contracts:

- `packages/contracts/package.json`
- `packages/contracts/tsconfig.json`
- `packages/contracts/src/events.ts`
- `packages/contracts/src/tickets.ts`
- `packages/contracts/src/runs.ts`
- `packages/contracts/src/dashboard.ts`
- `packages/contracts/src/index.ts`

For backend aggregation:

- `apps/backend/src/routes/dashboard.ts`
- `apps/backend/src/store/dashboard.ts` or focused helper exports in existing store modules
- `apps/backend/src/tests/dashboard.test.ts`
- possibly `apps/backend/src/tests/dashboard-contract.test.ts`

For documentation:

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/README.md`
- `AGENTS.md`
- `.planning/STATE.md` after implementation

## Likely Files To Modify

- `package.json`
  - add workspaces
  - add dashboard scripts
  - decide primary build/check path
- `docker-compose.yml`
  - add or replace frontend service with dashboard
  - set `NEXT_PUBLIC_API_BASE`
- `apps/backend/src/app.ts`
  - mount `/api/dashboard` if added
- `apps/backend/src/events/sse.ts`
  - optionally import shared `SSE_EVENT_TYPES`
- `apps/frontend/src/types.ts`
  - optionally import shared `SSE_EVENT_TYPES`, or leave Vite fallback isolated
- `apps/frontend/package.json`
  - if Vite remains checked as fallback, ensure tests still run
- `.env.example`
  - add `NEXT_PUBLIC_API_BASE` if dashboard uses client-side direct fetch

## Dashboard Surfaces And Ownership

| Surface | Phase 1 Source | Needed Planning Decision |
|---|---|---|
| Backend health | `GET /health` | Display mode/store; do not invent uptime or telemetry. |
| Tickets | `GET /api/tickets` or `GET /api/dashboard` composed from it | Source-label mock/seed/live. Prefer `MOCK_SCENARIOS=true` for smoke. |
| Ticket detail | `GET /api/tickets/:id`, `GET /api/tickets/:id/customer-system` | Normalize target metadata shape. |
| Start run | `POST /api/runs` | Navigate to `/dashboard/runs/:runId` after success. |
| Run detail | `GET /api/runs/:runId` | Extend with ticket/target context or compose via aggregate. |
| Advance run | `POST /api/runs/:runId/next` | Disable when pending approval or terminal. |
| SSE events | `GET /api/runs/:runId/events` | Reuse canonical event types; handle keepalive/disconnect. |
| Approval panel | existing approve/reject endpoints | Preserve edited-command safety recheck and reject reason. |
| Audit evidence | run `timeline`; optional aggregate latest events | Redacted summaries only. No raw secret-like output. |
| Activity state | existing draft/submit endpoints | Submit does not imply fixed unless backend run status says so. |
| Memory | deferred label in Phase 1 | No solved-memory claims. |
| Observability | `/health` or deferred label | No fake operational metrics. |

## Verification Strategy

Phase 1 should verify ownership, contracts, and main-path behavior. Suggested gates:

1. Static/package gate
   - `bun install`
   - `bun run check`
   - ensure root check includes the Next dashboard package once it is primary

2. Backend contract tests
   - `GET /api/dashboard` returns source labels, health, ticket summaries, run summaries, pending approvals, latest audit, activity, memory deferred, and observability deferred/health-only.
   - response validates against the shared contract schema.
   - no secret sentinel leaks through dashboard response.

3. SSE contract tests
   - one canonical `SSE_EVENT_TYPES` source is used by backend and dashboard, or a test proves they match.
   - keepalive is ignored without breaking client state.

4. Dashboard mapping/component tests
   - ticket rows render from backend/mock response, not local constants.
   - empty/loading/error states match the UI spec.
   - source labels render for live/mock/seed/deferred surfaces.
   - no shadcn sample labels remain on main dashboard routes.

5. Browser smoke
   - start backend in mock mode.
   - start Next dashboard.
   - open `/dashboard`.
   - confirm backend health/source labels render.
   - open a realistic sandbox ticket.
   - start a run.
   - land on `/dashboard/runs/:runId`.
   - advance to an approval or terminal state.
   - verify SSE events and audit timeline update.
   - verify approval edit/approve/reject controls call backend endpoints, not local-only handlers.
   - verify activity draft/submit path if the run reaches activity review.

6. Sample-content guard
   - search generated dashboard source for `Acme`, `sample`, `placeholder`, `Revenue`, `Documents`, shadcn demo user/team strings, and fake chart data.
   - This should be a guardrail, not the only verification. The stronger check is rendering with backend data and source labels.

7. Vite ownership proof
   - docs state Vite is fallback only or retired.
   - root scripts and Docker Compose align with that decision.
   - later phases know to extend Next.js, not Vite.

## Risks And Open Questions

1. Next version drift
   - Previous research recommended Next 15.5.19. Current `latest` is Next 16.2.x. The phase plan must pin a version deliberately.

2. React version split
   - Existing Vite uses React 18. Current Next latest pairs with React 19-era defaults. Separate packages can tolerate this, but shared UI code should not assume one React version unless dependencies are aligned.

3. Build-time backend fetches
   - Next build should not require the Hono backend to be running. Prefer client fetch for operational data in Phase 1, or explicitly dynamic server rendering.

4. Duplicate contracts
   - Existing frontend and backend duplicate SSE event constants. Adding a third copy in Next would violate the contract intent. A shared package or explicit parity test is needed.

5. Run detail direct navigation
   - Current Vite relies on in-memory `customerSystem` from run creation. A routed dashboard needs `GET /api/runs/:runId` or an aggregate endpoint to include enough safe context.

6. Dashboard aggregate scope
   - Too much aggregation can become a parallel backend domain. Keep it read-focused and composed from existing store/API semantics.

7. Mock data naming
   - Older mock tickets include generic names like `Acme Corp`. Use realistic sandbox scenarios for dashboard smoke, and label any backend seed data clearly.

8. Docker ownership
   - Compose currently builds `apps/frontend/Dockerfile`. If the primary UI is Next, Compose must be updated or the docs will contradict the runtime path.

9. shadcn sample cleanup
   - `dashboard-01` is useful layout scaffolding but dangerous if sample charts/users/documents remain. Plan cleanup as a first-class task with tests.

10. Observability and memory claims
   - Phase 1 may show status surfaces only. It must not claim RAG memory, pgvector, traces, or recent operational signals until later phases provide real backend data.

## Planning Checklist

Before writing the Phase 1 plan, decide:

- Next package location: `apps/dashboard` vs converting `apps/frontend`.
- Primary UI command: `dev:dashboard`, changed `dev:frontend`, or both with one clearly primary.
- Version pin: Next 15 backport vs current Next 16.
- shadcn initialization command and exact package path.
- Whether `packages/contracts` becomes a real workspace package.
- Whether to add `GET /api/dashboard`.
- Exact dashboard aggregate response schema.
- How `GET /api/runs/:runId` gets safe ticket/target context for direct route loads.
- How source labels are represented in data and UI.
- Whether dashboard JSON calls use direct Hono fetch or Next route handlers.
- Whether SSE remains direct to Hono.
- How root `bun run check` includes dashboard verification.
- What docs record the Vite fallback/retirement plan.

## Recommended Planning Direction

Plan Phase 1 as these slices:

1. Workspace ownership
   - Add a Next dashboard package, update workspaces/scripts, record Vite fallback decision.

2. Shared contracts
   - Promote SSE event names and dashboard response types to a shared package or equivalent canonical source.

3. Backend dashboard read model
   - Add a small Hono `/api/dashboard` endpoint plus store query helpers for overview data.

4. shadcn shell
   - Initialize shadcn in the dashboard package, install only required official components, and replace all dashboard-01 sample content.

5. Run workflow port
   - Port the current Vite ticket/run/approval/SSE/activity behavior into routed Next dashboard pages.

6. Verification and docs
   - Add contract/component tests, browser smoke, sample-content guard, and documentation updates proving Next ownership and Vite fallback status.

This keeps Phase 1 inside DASH-01 through DASH-04 and avoids pulling in Postgres, pgvector, RAG memory, or observability implementation ahead of their roadmap phases.
