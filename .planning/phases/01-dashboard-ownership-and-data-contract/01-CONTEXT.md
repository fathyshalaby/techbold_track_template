# Phase 1: Dashboard Ownership and Data Contract - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 establishes the Next.js dashboard as the target primary operational UI path and binds every visible dashboard surface to real backend data contracts, existing workflow navigation, or a documented ownership decision. It may create the dashboard shell, routing, layout, navigation, typed response contracts, backend aggregation endpoints, and verification for dashboard ownership. It must not implement the deeper Postgres, pgvector, RAG memory, or observability behavior reserved for later phases.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Ownership
- Next.js becomes the target primary dashboard path, with Vite retained only until parity is proven.
- Use shadcn dashboard-01 as source-owned layout scaffolding, replacing all sample content with service desk data contracts.
- Document a Vite retirement plan and keep the existing Vite app as compatibility fallback only during v1.3.
- Phase 1 may implement data contracts, routing, layout shell, navigation, and real backend callers. Deeper database and RAG behavior is deferred to later phases.

### Dashboard Data And Actions
- Main dashboard cards may show only real backend data or clearly labeled seed/demo data with source labels.
- Every main-path action must call an existing backend endpoint, change UI state, or be omitted.
- Dashboard summaries should navigate into ticket and run detail while preserving current safety, approval, SSE, audit, and activity behavior.
- Missing backend data should be handled with empty, loading, error, and seed-labeled states without pretending unavailable data is live.

### Contracts And Boundaries
- Define typed backend response contracts and reuse them in the dashboard rather than duplicating ad hoc frontend shapes.
- Next.js may adapt or proxy backend responses, but Hono remains source of truth for Phoenix, SSH, LLM, approval, safety, audit, and memory rules.
- Preserve the canonical existing SSE event contract and consume it from the dashboard without inventing a second event model.
- Phase 1 may add read-focused dashboard aggregation endpoints and contract tests only where existing endpoints cannot provide needed dashboard data.

### Verification And Handoff
- Prove dashboard ownership with a local dashboard smoke check against mock backend data and documentation of the primary UI path.
- Add contract or component tests for dashboard data mapping plus a smoke path for navigation into the run workflow.
- Explicitly verify no generic Acme/sample records or fake metrics remain on the main path.
- Documentation must record the primary UI path, Vite fallback or retirement plan, dashboard data sources, and known deferred data from later phases.

### the agent's Discretion
No user-selected discretion items. Implementation choices should follow the accepted decisions, roadmap success criteria, existing project conventions, and AGENTS.md constraints.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/frontend/src/App.tsx` contains the existing React/Vite technician workflow with ticket loading, run creation, EventSource SSE consumption, approval edit/approve/reject, activity draft/submit, and run close behavior.
- `apps/frontend/src/types.ts` contains canonical frontend SSE event type exports used by the current workflow.
- `apps/backend/src/routes/tickets.ts`, `apps/backend/src/routes/runs.ts`, `apps/backend/src/routes/approvals.ts`, `apps/backend/src/routes/activity.ts`, and `apps/backend/src/routes/events.ts` are the backend integration points for dashboard data and actions.
- `apps/backend/src/events/sse.ts` and `apps/backend/src/events/run-event-bus.ts` are the existing event stream contract points to preserve.

### Established Patterns
- Backend routes are Hono route modules with Zod validation and typed boundaries.
- Backend source of truth remains the Hono API and deterministic orchestrator; frontend code calls HTTP APIs and SSE rather than owning Phoenix, SSH, model, safety, approval, or audit behavior.
- Current frontend uses React 18, direct fetch calls, explicit loading/error state, and EventSource subscription.
- The active worktree has already moved source from `backend/` and `frontend/` into `apps/backend/` and `apps/frontend/`; Phase 1 should work with the current app layout without reverting user changes.

### Integration Points
- Dashboard API calls should use existing `/api/tickets`, `/api/runs`, `/api/runs/:runId`, `/api/runs/:runId/events`, approval, run control, and activity endpoints where possible.
- Any new dashboard aggregation endpoint must live in the Hono backend and expose typed response data that the dashboard can reuse.
- Next.js dashboard setup must coexist with current workspace restructuring and avoid leaving Vite and Next.js as competing primary UI paths.
- Verification should account for `.planning/` being ignored and for unrelated staged worktree changes that must not be reverted.

</code_context>

<specifics>
## Specific Ideas

- Use the shadcn dashboard-01 layout only as scaffolding; do not keep generic Acme, sample team, fake chart, or placeholder operational content on the main path.
- The dashboard should make tickets, current runs, pending approvals, audit evidence, activity state, memory visibility, and observability status visible, but Phase 1 may label memory and observability as deferred where later phases provide live data.
- The primary UI path decision must be explicit enough for later phases to know whether they should extend Next.js or the Vite fallback.

</specifics>

<deferred>
## Deferred Ideas

- Postgres-backed dashboard data, pgvector retrieval, accepted-solution memory, observability spans/metrics, and full v1.3 end-to-end smoke coverage are deferred to later roadmap phases.

</deferred>
