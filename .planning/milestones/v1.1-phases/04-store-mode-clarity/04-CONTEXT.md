# Phase 4: Store Mode Clarity - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix D-003, S-001, STOR-01, and STOR-02 by making the active store mode observable and documenting fallback behavior truthfully.
</domain>

<decisions>
## Implementation Decisions

### Runtime Status
- Health response includes store mode and durability.
- Startup logs report the active store mode.

### Fallback
- SQLite remains durable mode.
- In-memory fallback is mock/test only; real mode refuses to start without SQLite.

### the agent's Discretion
Do not introduce migrations or a new database abstraction in this phase.
</decisions>

<code_context>
## Existing Code Insights

### Integration Points
- `backend/src/store/db.ts`
- `backend/src/routes/health.ts`
- `backend/src/index.ts`
- `docs/INFRASTRUCTURE.md`
</code_context>

<specifics>
## Specific Ideas

Trace: D-003, S-001, STOR-01, STOR-02.
</specifics>

<deferred>
## Deferred Ideas

Durable store selection/migration guidance remains backlog.
</deferred>
