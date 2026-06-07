# Phase 6: Primary Vertical Slice - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Keep the main demo flow buildable end to end after event, frontend, and tooling cleanup.
</domain>

<decisions>
## Implementation Decisions

### Slice
- The primary user path remains `frontend/src/App.tsx` -> backend `/api/*` routes -> SSE -> activity submit.
- Event names and store status changes must not break existing backend route and orchestrator tests.

### the agent's Discretion
Use existing Vitest coverage and production build as automated smoke evidence; live VM/browser validation remains manual.
</decisions>

<code_context>
## Existing Code Insights

### Integration Points
- `frontend/src/App.tsx`
- `backend/src/app.ts`
- `backend/src/routes/*`
- `backend/src/ai/orchestrator.ts`
</code_context>

<specifics>
## Specific Ideas

Trace: V-001, V-002, BL-002.
</specifics>

<deferred>
## Deferred Ideas

Full browser E2E for approve/edit/execute remains backlog.
</deferred>
