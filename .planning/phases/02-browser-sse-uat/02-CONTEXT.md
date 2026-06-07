# Phase 2: Browser SSE UAT - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning
**Mode:** Autonomous smart discuss, recommendations auto-accepted

<domain>
## Phase Boundary

This phase validates the mounted browser workflow for the primary technician path. It covers ticket selection, run creation, agent advancement, approval handling, audit timeline visibility, live SSE event visibility, and activity draft/submission readiness in mock mode. The phase should change production code only when browser UAT exposes a real blocker in the existing primary path.

</domain>

<decisions>
## Implementation Decisions

### Browser Scope
- Use the mounted `frontend/src/main.tsx` and `frontend/src/App.tsx` runtime path only.
- Run the app through Docker Compose or equivalent local services so the frontend talks to the backend over the documented `VITE_API_BASE`.
- Exercise one complete mock-mode ticket flow far enough to prove ticket, run, approval, audit, live event, and activity states.
- Do not broaden this phase into visual redesign or design-system work.

### SSE Evidence
- Confirm live events appear in the UI without refreshing the page.
- Treat backend audit entries and frontend live-event rows as separate evidence surfaces.
- Capture exact event names observed in the browser where possible.
- If SSE fails, classify the blocker as frontend listener, backend stream, event contract, environment, or test-data related.

### Interaction Rules
- Use Browser plugin automation for the user-facing path.
- Prefer stable visible controls from the current DOM snapshot.
- Do not submit real external data; mock-mode activity submission is allowed.
- Preserve human-in-the-loop behavior: commands are only executed after an approval action in the UI.

### the agent's Discretion
The agent may choose the ticket and exact interaction sequence, provided it exercises the primary path and records enough evidence to support or reject `UAT-01` and `UAT-02`.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/App.tsx` contains the active ticket list, run view, approval card, audit trail, live events panel, and activity draft panel.
- `frontend/src/types.ts` exports the canonical `SSE_EVENT_TYPES` list used by the frontend event subscription.
- `backend/src/events/sse.ts` backfills audit events and writes named SSE events for live run updates.
- Mock Phoenix, SSH, and LLM paths allow the browser flow to run without live credentials.

### Established Patterns
- The frontend uses a single React component file with direct API calls and inline styles.
- The backend exposes run creation, run advancement, approval, activity, and event routes under `/api`.
- The UI keeps live SSE rows separate from the audit trail.
- The prior phase proved Docker Compose can start backend and frontend in mock mode.

### Integration Points
- Browser UAT uses `http://localhost:5173` for the frontend and `http://localhost:8000` for backend health/API.
- Potential code changes are likely in `frontend/src/App.tsx`, `frontend/src/types.ts`, or backend SSE/event route files if UAT exposes drift.
- Evidence belongs in `02-VERIFICATION.md` and `02-01-SUMMARY.md`.

</code_context>

<specifics>
## Specific Ideas

No user-provided Phase 2 overrides. Use the roadmap success criteria and the existing primary technician workflow.

</specifics>

<deferred>
## Deferred Ideas

Deterministic automated vertical-slice test coverage belongs to Phase 3. Real Phoenix, SSH, and LLM validation belongs to Phase 4.

</deferred>
