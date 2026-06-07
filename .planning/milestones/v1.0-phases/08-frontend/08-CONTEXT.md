# Phase 8: Frontend - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the technician workspace in the browser: a React 18 + Vite single-page app
that drives a complete run end-to-end — ticket list → ticket detail (customer
system) → live run timeline (SSE) → per-command approval decisions → activity
editor → submit to Phoenix. Covers UX-01..UX-07. The UI is worth 10 rubric
points (D); it must be clear and functional, not polished. All backend contracts
already exist (`/api/tickets`, `/api/runs`, approvals, activity, SSE events) and
are consumed via `import.meta.env.VITE_API_BASE` (default `http://localhost:8000`).

Out of scope: design-system polish, animations, theming, charts, auth, router
libraries, state-management libraries.

</domain>

<decisions>
## Implementation Decisions

### App Structure & Tech
- Routing: single-page view-state (no router lib) — three views (list / run / activity) switched by `useState`.
- Server state / data fetching: plain `fetch` + `useState`/`useEffect` in custom hooks (e.g. `useTickets`, `useRun`). No TanStack Query / SWR.
- SSE consumption: native `EventSource` in a `useRunEvents` hook; append events to timeline state; backend backfills prior audit events on connect.
- Styling: plain CSS in `index.css` plus small co-located CSS. No CSS framework.

### Run Page & Approval UX
- Timeline render: vertical chronological list of audit events, newest at bottom, auto-scroll; icon + label per SSE event type.
- Approval card placement: sticky pinned card at the top of the run page when `approval.required` fires.
- Approval controls: Approve / Edit-then-approve (editable command textarea) / Reject-with-reason (required text). Card shows command, purpose, expected signal, risk badge, and safety notes.
- Risk display: color-coded badge (green `SAFE_READ_ONLY` → red `HIGH_RISK_BLOCKED`) plus the level label.

### Activity Editor, Controls & States
- Activity editor: form with 5 editable textareas (`summary`, `rootCause`, `actionsTaken`, `commandsSummary`, `validationResult`) prefilled from the draft; Submit posts overrides to `/activity/submit`.
- Retry / Abort: Abort button always visible on the run page (`POST /api/runs/:id/abort`); Retry = re-propose via reject-with-reason (no dedicated retry endpoint exists).
- Loading / error states: per-action inline states — spinner while pending, error banner on failure, surface backend 4xx/5xx messages.
- Empty / degraded: ticket list shows an empty state and an ERP-unavailable banner (handles 502 and empty array) per ERP-05.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/App.tsx` — skeleton single default export to replace with the workspace shell.
- `frontend/src/main.tsx` — React 18 `createRoot` + StrictMode entry; no changes needed.
- `frontend/src/index.css` — minimal reset (`box-sizing`, bare `body`); extend here.
- `import.meta.env.VITE_API_BASE` — API base URL (default `http://localhost:8000`, set in docker-compose).

### Established Patterns
- Functional components only, single default export per file, PascalCase `.tsx`.
- TypeScript strict mode; interfaces/types PascalCase, camelCase vars.
- No frontend tests configured yet; no ESLint/Biome configured.

### Integration Points (backend API contract — all live)
- `GET /api/tickets?status&priority&sort` → ticket list (200; 502 on ERP auth/network; `[]` on 404).
- `GET /api/tickets/:id` → ticket detail. `GET /api/tickets/:id/customer-system` → SSH target (ip, port, username, os).
- `POST /api/runs {ticketId}` → 201 `{runId, status:"LOADED_CONTEXT", ticket, customerSystem}`.
- `GET /api/runs/:runId` → `{runId, status, phase, timeline, pendingApproval, activityDraft}`.
- `POST /api/runs/:runId/next` → advance state machine → `{status, phase, pendingApproval}`.
- `POST /api/runs/:runId/abort` → `{status, phase}`.
- `POST /api/runs/:runId/approvals/:approvalId/approve {editedCommand?, reason?}` → `{status, phase, approvalId, safetyRecheck, result}`; 422 if edited command blocked.
- `POST /api/runs/:runId/approvals/:approvalId/reject {reason}` → `{status, phase}`.
- `POST /api/runs/:runId/activity/draft` → draft (5 fields). `POST /api/runs/:runId/activity/submit {…overrides}` → Phoenix activity.
- `GET /api/runs/:runId/events` → SSE; event types: `run.started`, `agent.thought_summary`, `command.proposed`, `command.blocked`, `approval.required`, `command.executing`, `command.completed`, `observation.added`, `fix.proposed`, `validation.completed`, `activity.drafted`, `activity.submitted`, `run.completed`, `run.failed`. Backfills prior audit events on connect; `keepalive` every 15s.
- Pending approval shape comes from `command_approvals` (proposed_command, purpose, expected signal, risk_level, safety notes).

</code_context>

<specifics>
## Specific Ideas

- The run advances via explicit `POST /next` calls — the UI must drive the state machine forward (e.g. an Advance/Continue action) between approval gates, since the backend does not auto-recurse past the 201 create contract.
- Risk badge color scale maps the four risk levels: `SAFE_READ_ONLY`, `LOW_RISK_CHANGE`, `MEDIUM_RISK_CHANGE`, `HIGH_RISK_BLOCKED`.

</specifics>

<deferred>
## Deferred Ideas

- BOOST-01 ranked-hypotheses picker, BOOST-02 redaction preview, BOOST-05 blast-radius on approval card — v2 UX boosters, out of scope.

</deferred>
