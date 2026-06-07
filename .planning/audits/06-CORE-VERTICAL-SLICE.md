# Core Vertical Slice Audit

Owner: GPT-5 / Codex
Date: 2026-06-07
Mode: REPORT ONLY
Scope: README route intent, package scripts, tests, and core source paths

This report is audit-only. Source files were not modified.

## Method
- Infer flows from user-facing docs and route/test signatures.
- Trace each flow across backend endpoints, frontend consumers, and event transport.
- Flag only break/fake/unimplemented points that block a truthful v1.1 skeleton.

## Flow A — Technician troubleshooting loop
**Claimed path**: `ticket list -> run start -> next step -> approvals -> execute command -> validate -> close loop`

### End-to-end trace
1. `README.md` defines the loop in plain language: inspect tickets, run one command at a time, require technician approval, validate, draft and submit ERP activity.
2. `backend/src/routes/tickets.ts` and `backend/src/routes/runs.ts` expose `GET /api/tickets` and `POST /api/runs`.
3. `backend/src/routes/runs.ts` exposes step transitions with `POST /api/runs/:runId/next` and terminal action `POST /api/runs/:runId/abort`.
4. `backend/src/routes/approvals.ts` handles `approve` and `reject` with `POST /api/runs/:runId/approvals/:approvalId/*`.
5. `backend/src/routes/runs.ts` exposes state refresh on `GET /api/runs/:runId`.
6. `frontend/src/main.tsx` mounts only `frontend/src/App.tsx`, and `App.tsx` drives this exact contract with local fetch logic.

### Findings for Flow A
- Severity: High
- **Path(s)**: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/components/TicketListView.tsx`, `frontend/src/components/RunView.tsx`
- **Evidence**:
  - `main.tsx` mounts only `App.tsx`.
  - `TicketListView.tsx` and `RunView.tsx` provide an alternate workflow path with hooks and reusable modules but are not part of the mounted runtime.
- **Why this harms team velocity**:
  - The team sees two implemented-looking paths and may fix bugs in the wrong one.
  - Onboarding and maintenance time rises because ownership is ambiguous.
- **Smallest senior cleanup**:
  - Choose one authoritative frontend path before touching behavior.
  - Either mount the component/hook architecture from one entry shell, or delete/relocate the unused flow as backlog-only scaffolding.

- Severity: High
- **Path(s)**: `frontend/src/App.tsx`, `backend/src/routes/runs.ts`, `backend/src/routes/approvals.ts`
- **Evidence**:
  - `App.tsx` has inline request logic and local types for runs/tickets, duplicating backend contract structures rather than consuming `frontend/src/api.ts` and shared types.
- **Why this harms team velocity**:
  - Any API change touches multiple manual shapes and increases drift risk.
  - Refactoring becomes slower and more error-prone because the same domain is encoded repeatedly.
- **Smallest senior cleanup**:
  - Move the data calls and request contracts to `frontend/src/api.ts` + shared types, then keep `App.tsx` as a thin orchestrator.

- Severity: Medium
- **Path(s)**: `frontend/src/App.tsx`
- **Evidence**:
  - Tickets are loaded through `/api/tickets` without using query params for `status`, `priority`, or `sort`, while backend and README explicitly support those filter/sort modes.
- **Why this harms team velocity**:
  - Main demo path cannot exercise core filtering/sorting use cases the docs advertise.
  - Teams spend time testing API correctness while the UI cannot surface it.
- **Smallest senior cleanup**:
  - Add status/priority/sort controls on the active list path and pass through query params to `GET /api/tickets`.

## Flow B — Live operations trace to activity submit
**Claimed path**: `run state -> event stream -> audit trail review -> activity draft -> activity submit`

### End-to-end trace
1. `backend/src/routes/events.ts` exposes `GET /api/runs/:runId/events`.
2. `backend/src/events/sse.ts` writes backfill events from audit and forwards live `runEventBus` payloads.
3. `frontend/src/App.tsx` opens `EventSource` and refreshes run state on incoming messages.
4. `frontend/src/hooks/useRunEvents.ts` and `frontend/src/components/RunView.tsx` are an alternate event-driven path expecting named event channels.
5. `backend/src/routes/activity.ts` generates draft on `/api/runs/:runId/activity/draft` and submits on `/api/runs/:runId/activity/submit`.
6. Tests in `backend/src/tests/activity.test.ts`, `backend/src/tests/approvals.test.ts`, and `backend/src/tests/runs.test.ts` define the endpoint contracts.

### Findings for Flow B
- Severity: High
- **Path(s)**: `backend/src/events/sse.ts`, `frontend/src/hooks/useRunEvents.ts`, `frontend/src/types.ts`
- **Evidence**:
  - Backend SSE stream writes default unnamed frames and places event type in JSON body.
  - Alternate frontend consumer subscribes with `addEventListener(eventType, ...)`, expecting named SSE events.
  - `SseEventType` includes event names not reliably produced as SSE event names.
- **Why this harms team velocity**:
  - The flow appears implemented but does not behave as intended in the modular path; debugging live behavior becomes trial-and-error.
  - Hidden mismatch causes silent runtime regressions when flow is extended.
- **Smallest senior cleanup**:
  - Standardize one SSE contract: either named events end-to-end or one parser branch that handles JSON `type` from unnamed messages.
  - Align `SseEventType` and event-listener registration with the backend names.

- Severity: Medium
- **Path(s)**: `backend/src/ai/orchestrator.ts`, `backend/src/events/sse.ts`, `frontend/src/types.ts`
- **Evidence**:
  - Orchestrator emits `validation.complete` and `activity.draft_ready` in audit events.
  - Frontend event type union expects `validation.completed` and `activity.drafted`.
- **Why this harms team velocity**:
  - Live timeline, refresh logic, and human visibility become inconsistent with true run state.
  - Teams think validations/drafting happened while the UI contract does not reliably observe them.
- **Smallest senior cleanup**:
  - Normalize event naming to one stable canonical set and update either orchestrator/audit emission or frontend mapping in one pass.

- Severity: Medium
- **Path(s)**: `backend/src/ai/orchestrator.ts`, `backend/src/routes/activity.ts`, `frontend/src/components/ActivityView.tsx`
- **Evidence**:
  - Orchestrator appends `activity.draft_ready` when entering review but does not emit a matching live event through the event bus in that transition.
  - Activity draft still works only through explicit `/activity/draft` polling/submit from run polling.
- **Why this harms team velocity**:
  - The UI cannot reliably show deterministic “draft ready” timing from stream events.
  - Teams must rely on polling or manual guesswork to progress from validation to draft review.
- **Smallest senior cleanup**:
  - Emit a canonical stream event during `DRAFTING_ACTIVITY` transition or keep `activity ready` visible via a guaranteed poll+state contract and document it explicitly.

- Severity: Low
- **Path(s)**: `frontend/src/App.tsx`, `backend/src/routes/activity.ts`
- **Evidence**:
  - Activity endpoints exist and work, but activity workflow is currently embedded only in `App.tsx` while a full activity page exists in `frontend/src/components/ActivityView.tsx` and is disconnected from entry.
- **Why this harms team velocity**:
  - Teams must hard-wire changes in two locations for the same feature, then reconcile what users actually see.
- **Smallest senior cleanup**:
  - Wire one coherent activity review screen into the active run flow or delete/relocate the unused screen behind explicit backlog marker.

## Recommended primary v1.1 vertical slice
Pick **Flow A + B on the mounted `App.tsx` path only**, with a strict backend/frontend contract pass for events.

Acceptance for v1.1 slice:
- `main.tsx` -> authoritative run shell is explicit and single-path.
- Backend APIs exercised in flow order: `GET /api/tickets` -> `POST /api/runs` -> `POST /api/runs/:id/next` -> `POST /api/runs/:id/approvals/...` -> `GET /api/runs/:id/events` -> `POST /api/runs/:id/activity/draft` -> `POST /api/runs/:id/activity/submit`.
- SSE contract is unified and tested in both `sse.ts` and `useRunEvents` or replaced with the App-compatible parser.
- Event names for validation and draft readiness are consistent across orchestrator, audit, and frontend typing.
- Package scripts remain meaningful for this flow (`pnpm --dir backend dev`, `pnpm --dir frontend dev`, `pnpm test`).
