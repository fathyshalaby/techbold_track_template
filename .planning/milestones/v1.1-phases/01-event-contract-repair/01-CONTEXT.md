# Phase 1: Event Contract Repair - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix B-001 and V-001 from `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`: backend and frontend must use one canonical event-name set, and SSE transport must deliver those names as SSE channels.
</domain>

<decisions>
## Implementation Decisions

### Contract
- Canonical event names are the dotted frontend names already used by the active UI, including `validation.completed` and `activity.drafted`.
- Do not keep legacy aliases such as `validation.complete` or `activity.draft_ready`.

### Transport
- SSE frames use the `event` field for the channel and include the event type in JSON payload data.
- The active mounted app listens to every canonical event type.

### the agent's Discretion
Keep this phase narrow to event names, SSE delivery, and tests.
</decisions>

<code_context>
## Existing Code Insights

### Integration Points
- `backend/src/events/sse.ts`
- `backend/src/ai/orchestrator.ts`
- `backend/src/routes/activity.ts`
- `frontend/src/App.tsx`
- `frontend/src/types.ts`
</code_context>

<specifics>
## Specific Ideas

Trace: B-001, V-001.
</specifics>

<deferred>
## Deferred Ideas

Broader route/consumer matrix remains outside Phase 1.
</deferred>
