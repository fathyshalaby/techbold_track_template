# Phase 2: Frontend Surface Consolidation - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix B-002 and D-001 by removing the disconnected frontend surface not mounted by `frontend/src/main.tsx`.
</domain>

<decisions>
## Implementation Decisions

### Runtime Surface
- `frontend/src/main.tsx` mounts `frontend/src/App.tsx`; that is the only runtime UI path.
- Delete orphaned component, hook, utility, and API layers that are not imported by the mounted tree.

### Tests
- Remove tests tied only to deleted mapping utilities.
- Keep focused contract coverage for event names used by the active app.

### the agent's Discretion
Do not redesign the UI in this phase.
</decisions>

<code_context>
## Existing Code Insights

### Integration Points
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/types.ts`
</code_context>

<specifics>
## Specific Ideas

Trace: B-002, D-001, DEL-002.
</specifics>

<deferred>
## Deferred Ideas

Future component extraction can happen after the single runtime path is stable.
</deferred>
