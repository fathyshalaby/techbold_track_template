# Phase 7: Activity Generation - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend-only delivery of the ERP activity report path: the `activity-log-generator`
agent that drafts all 5 graded fields strictly from the audit trail, plus the two
HTTP routes `POST /api/runs/:id/activity/draft` (generate + persist a draft) and
`POST /api/runs/:id/activity/submit` (create the Phoenix activity from the
technician-reviewed draft). No frontend. The draft is built only from persisted
audit data — never invented, never carrying secrets.

</domain>

<decisions>
## Implementation Decisions

### Draft Generation
- Use the LLM (`generateObject` + Zod schema) as the production path, mirroring the
  other four agents: `activity-log-generator.ts` exports a `runActivityLogGenerator`
  with an optional `model?: LanguageModelV1` param for test injection, plus an
  exported `MOCK_ACTIVITY_DRAFT` constant — identical pattern to `validator.ts`.
- The agent input is assembled deterministically from the store ONLY: audit events,
  command results (redacted stdout/stderr + exit codes), observations, and the
  validation outcome. The prompt instructs: every field must trace to supplied audit
  data; invent nothing; if evidence is missing, say so plainly rather than fabricate.
- Output schema covers exactly the 5 graded fields: `summary`, `rootCause`,
  `actionsTaken`, `commandsSummary`, `validationResult` (camelCase in the agent,
  mapped to snake_case for the store/Phoenix).
- `commandsSummary` is grounded by enumerating the executed `command_results` rows
  (final command + exit code) so it can be traced back to real execution.
- Redaction is already applied at store-write time (`appendCommandResult`,
  `appendAuditEvent` redact on insert), so audit input is pre-redacted; the draft
  text is additionally passed through `redactSecrets` before persistence as
  defence-in-depth.
- Agent-unavailable degrades the same way as other agents: throw
  `AgentUnavailableError`; the route surfaces a clean 502/"agent unavailable" rather
  than writing a fabricated draft.

### Draft Persistence & Idempotency
- `POST /activity/draft` (re)generates and persists via the existing
  `saveActivityDraft`, then returns the freshly stored draft (all 5 fields + ids).
- Repeat calls are allowed and regenerate — each call inserts a new draft row;
  `getActivityDraft` already returns the most recent by `created_at DESC`. This makes
  "draft" idempotent in effect (latest wins) without a unique constraint, matching
  the existing append-only store shape.
- Phase guard: draft is allowed once the run has reached a state where a resolution
  exists — `WAITING_FOR_ACTIVITY_REVIEW` (and `DRAFTING_ACTIVITY`). Calling draft
  from an earlier phase returns 409/conflict with a clear message rather than
  drafting from an incomplete trail. Do not hard-block on terminal COMPLETED so a
  re-draft remains possible if needed.
- Route returns 404 for unknown run, 502 on agent-unavailable, 200 with the stored
  draft on success.

### Submit Contract
- `POST /activity/submit` accepts an OPTIONAL body carrying the 5 editable fields
  (the technician's edits). If a field is provided it overrides the stored draft
  value; omitted fields fall back to the latest persisted draft. This honors the
  "technician edits then submits" requirement without forcing the client to resend
  everything.
- If no draft exists yet and no body is supplied → 409 ("no draft to submit").
- Builds `ActivityCreate` for `createActivity`: maps the 5 fields, sets `ticket_id`
  from the run, and derives `start_datetime`/`end_datetime` from the run's audit
  timeline (run start → now/last event) so the activity has a real time window.
- On success: mark the draft `submitted=1` + `submitted_at`, transition the run to
  SUBMITTING_ACTIVITY → COMPLETED, append `activity.submitted` audit event + emit the
  same on the event bus (audit↔bus symmetry), and return the created Phoenix Activity
  record. Returns 502 if Phoenix rejects/￼is unavailable; createActivity is NOT
  retried (non-idempotent — duplicate-record risk, per existing client policy).
- Setting ticket status DONE is explicitly out of scope (unscored) — do not gate
  submit on it.

### Claude's Discretion
All three grey areas were deferred to Claude's discretion. The above reflects the
chosen approach, grounded in existing codebase patterns (agent test-injection,
append-only store, audit↔bus symmetry, Phoenix retry policy).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `store/audit.ts`: `saveActivityDraft`, `getActivityDraft`, `getAuditEvents`,
  `appendAuditEvent` — draft persistence and audit reads already exist.
- `store/schema.ts`: `ActivityDraftSchema` already models all 5 fields + submitted flag.
- `phoenix/types.ts`: `ActivityCreateSchema`/`ActivitySchema` already include the 5
  graded fields as optional; `phoenix/client.ts:createActivity` posts to
  `/api/v1/activities/create` (no retry — non-idempotent).
- `phoenix/mock.ts`: mock client for offline submit path in tests.
- `ai/agents/validator.ts`: canonical agent shape to mirror (optional model param,
  exported MOCK constant, `generateObject` + timeout + `AgentUnavailableError`).
- `routes/runs.ts:getPhoenixClient()`: mode-aware Phoenix client factory to reuse.
- `safety/redaction.ts:redactSecrets`: applied at store boundaries already.

### Established Patterns
- Routes are Hono routers; `runsRouter` mounts under `/api/runs`. Activity routes
  should mount on the same prefix (`activity.ts` currently a stub).
- Orchestrator owns phase transitions; emitEvent side-effect mirrors to audit log
  (symmetry verified by a Phase 6 test).
- Agents return structured output via Zod; never free-form when the backend acts on it.

### Integration Points
- `routes/activity.ts` (stub) → implement `activityRouter`, mount in `app.ts`
  alongside runs/approvals/events.
- `ai/agents/activity-log-generator.ts` (stub) → implement `runActivityLogGenerator`.
- `ai/prompts.ts` → add `ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT`.
- `ai/types.ts` → add `ActivityDraftFieldsSchema` (5 fields) for the agent output.

</code_context>

<specifics>
## Specific Ideas

- All 5 graded fields must always be populated (rubric A awards the "complete"
  activity) — the agent must fill every field, using an explicit "insufficient
  evidence" sentence if the trail lacks data rather than leaving a field blank.
- Trace-back requirement (PRD §C): any claim in the activity must map to a real
  command result in the audit log. `commandsSummary` enumerates executed commands.

</specifics>

<deferred>
## Deferred Ideas

- Setting ticket status `DONE` after submit — unscored courtesy (P2), out of scope.
- Redaction preview / "output was redacted" UI affordance (BOOST-02) — frontend, v2.

</deferred>
