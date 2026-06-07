# Phase 7: Senior Cleanup - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Clean touched code paths according to AGENTS.md without broad repo churn.
</domain>

<decisions>
## Implementation Decisions

### Cleanup
- Remove disconnected frontend abstractions rather than preserving dead layers.
- Remove new em dashes, emojis, eslint-disable comments, and empty catch blocks from touched files.
- Replace the dynamic require lint suppression with `createRequire`.

### the agent's Discretion
Do not rewrite unrelated legacy comments or docs outside the rescue path.
</decisions>

<code_context>
## Existing Code Insights

### Integration Points
- `frontend/src/App.tsx`
- `backend/src/store/db.ts`
- `backend/src/routes/activity.ts`
- `README.md`
- `docs/INFRASTRUCTURE.md`
</code_context>

<specifics>
## Specific Ideas

Trace: A-001, A-002, S-002, DEL-002.
</specifics>

<deferred>
## Deferred Ideas

Whole-repo prose cleanup remains backlog.
</deferred>
