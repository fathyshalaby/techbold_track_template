---
phase: 06-run-api-approvals-sse
verified: 2026-06-07T01:02:00Z
status: human_needed
score: 15/15 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Connect a browser EventSource to GET /api/runs/:runId/events on a running server; advance the run through /next; confirm events appear in the browser console in real time"
    expected: "Browser receives backfill events immediately on connect, then live run.started / approval.required events as the orchestrator advances; keepalive comment arrives every ~15s on an idle connection"
    why_human: "streamSSE streaming behaviour cannot be tested with app.request() in Vitest — the SSE response body is a ReadableStream; verifying actual event delivery over a live HTTP/1.1 connection requires a real server and EventSource"
  - test: "Disconnect the EventSource mid-stream (close the tab or call eventSource.close()); verify on the server side that no listener leak occurs"
    expected: "After disconnect, runEventBus has no remaining listeners for the run's 14 event types; server memory is stable"
    why_human: "onAbort callback correctness under real HTTP disconnect (FIN/RST) cannot be validated in the in-process Vitest harness"
---

# Phase 06: Run API, Approvals, SSE Verification Report

**Phase Goal:** The full run lifecycle is accessible over HTTP and the browser sees live events as they happen
**Verified:** 2026-06-07T01:02:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | POST /api/runs returns 201 with status exactly "LOADED_CONTEXT", runId, ticket, customerSystem | VERIFIED | `runs.ts:76-95` returns `c.json({ runId, status: 'LOADED_CONTEXT' as const, ticket, customerSystem }, 201)`; test `runs.test.ts:36-47` asserts `res.status === 201` and `body.status === 'LOADED_CONTEXT'` |
| 2 | POST /api/runs does NOT call advance() | VERIFIED | `runs.ts:70-74` calls `createRun()` then `updateRunPhase(run.id, 'LOADED_CONTEXT')` directly; no `advance()` call in the handler; test `runs.test.ts:67-78` spies on `advance` and asserts `not.toHaveBeenCalled()` |
| 3 | customerSystemId stored as `ip:port` (colon-separated, no protocol prefix) | VERIFIED | `runs.ts:68` constructs `` `${system.ip}:${system.port}` `` with comment explaining the split rationale; test `runs.test.ts:80-94` asserts `createRunSpy` called with `'10.0.0.1:22'` and `not.toMatch(/^https?:\/\//)` |
| 4 | GET /api/runs/:runId returns runId, status, phase, timeline array, pendingApproval, activityDraft | VERIFIED | `runs.ts:98-117` returns all six fields; test `runs.test.ts:141-166` asserts all fields present including `Array.isArray(body.timeline)` |
| 5 | POST /api/runs/:runId/next calls advance() and returns status + pendingApproval | VERIFIED | `runs.ts:119-134` calls `advance(runId)` and returns `{ status, phase, pendingApproval }`; test `runs.test.ts:180-205` mocks advance and asserts 200 with expected shape |
| 6 | POST /api/runs/:runId/abort calls advance with abort event and returns status ABORTED | VERIFIED | `runs.ts:136-149` calls `advance(runId, { type: 'abort' })`; test `runs.test.ts:218-241` mocks advance returning ABORTED state and asserts `body.status === 'ABORTED'` |
| 7 | Unknown runId returns 404 `{ error: "run not found" }` on all four run endpoints | VERIFIED | All four handlers call `getRunById(runId)` and return `c.json({ error: 'run not found' }, 404)` on miss; tested explicitly in `runs.test.ts:161-166`, `199-204`, `237-242` |
| 8 | Invalid request body returns 400 | VERIFIED | `runs.ts:39-43` uses `CreateRunBodySchema.safeParse` → 400; tests `runs.test.ts:96-116` verify missing and non-integer ticketId both return 400 |
| 9 | Approve with no edit calls advance with finalCommand = proposedCommand | VERIFIED | `approvals.ts:51` sets `finalCommand = parsed.data.editedCommand ?? approval.proposed_command`; test `approvals.test.ts:86-100` asserts 200 with phase OBSERVING |
| 10 | Approve with editedCommand calls advance with finalCommand = editedCommand | VERIFIED | Same `??` chain; test `approvals.test.ts:102-121` asserts `advance` called with `finalCommand: 'systemctl status nginx --no-pager'` |
| 11 | Blocked edited command returns 422 `{ error, riskLevel: "HIGH_RISK_BLOCKED" }` | VERIFIED | `approvals.ts:54-56` checks `state.phase === 'WAITING_FOR_APPROVAL'` → 422; test `approvals.test.ts:123-138` mocks advance returning WAITING state and asserts `res.status === 422` and `body.riskLevel === 'HIGH_RISK_BLOCKED'` |
| 12 | Already-decided approval returns 409 | VERIFIED | `approvals.ts:41-43` checks `approval.status !== 'PENDING'` → 409; tests `approvals.test.ts:140-162` cover EXECUTED and APPROVED; reject path `approvals.test.ts:282-298` covers REJECTED |
| 13 | Reject with empty reason returns 400 | VERIFIED | `approvals.ts:81-83` uses `RejectBodySchema.safeParse` with `z.string().min(1)` → 400; tests `approvals.test.ts:248-280` cover empty string and missing reason |
| 14 | SSE stream: backfill, live events, keepalive, onAbort cleanup, 404 before stream open | VERIFIED | `sse.ts:26-72` implements full sequence — backfill loop, listener map for 14 event types, `onAbort` cleanup, 15s keepalive loop; `events.ts:7-12` checks `getRunById` before `createSseStream`; `SSE_EVENT_TYPES` exports all 14 PRD §9 names |
| 15 | Audit↔runEventBus symmetry: approval.required appears in both audit log and runEventBus | VERIFIED | `sse-audit-symmetry.test.ts:42-87` drives run to WAITING_FOR_APPROVAL, collects bus emissions, asserts `auditTypes.has('approval.required')` AND `emitted.get('approval.required').length >= 1`; test passes (1/1 green) |

**Score:** 15/15 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/src/routes/runs.ts` | runsRouter with POST /, GET /:runId, POST /:runId/next, POST /:runId/abort | VERIFIED | Exports `runsRouter`, `CreateRunBodySchema`, `getPhoenixClient`; all four handlers substantive |
| `backend/src/tests/runs.test.ts` | 13 contract tests covering all four endpoints | VERIFIED | 13 tests, all passing |
| `backend/src/routes/approvals.ts` | approvalsRouter with approve and reject routes | VERIFIED | Exports `approvalsRouter`, `ApproveBodySchema`, `RejectBodySchema`; both handlers substantive |
| `backend/src/tests/approvals.test.ts` | 15 contract tests covering safety-critical paths | VERIFIED | 15 tests, all passing |
| `backend/src/events/sse.ts` | createSseStream + SSE_EVENT_TYPES (14 types) | VERIFIED | Both exported; 14 PRD §9 event types match spec exactly |
| `backend/src/routes/events.ts` | eventsRouter with GET /:runId/events | VERIFIED | Exports `eventsRouter`; 404 guard before stream open |
| `backend/src/tests/sse-audit-symmetry.test.ts` | Symmetry test for approval.required | VERIFIED | 1 test, passing; documents run.started and command.completed exclusions with inline rationale |
| `backend/src/app.ts` | Three app.route('/api/runs', ...) mounts | VERIFIED | Lines 24-26: `runsRouter`, `approvalsRouter`, `eventsRouter` all mounted at `/api/runs` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `backend/src/routes/runs.ts` | `backend/src/ai/orchestrator.ts` | `advance(runId)` — only from /next and /abort | VERIFIED | `advance` imported and called at lines 127, 143; NOT called from POST / handler |
| `backend/src/routes/runs.ts` | `backend/src/store/runs.ts` | `createRun` / `getRunById` / `updateRunPhase` | VERIFIED | All three imported and used in handlers |
| `backend/src/routes/runs.ts` | `backend/src/store/audit.ts` | `getAuditEvents` for timeline + `getActivityDraft` | VERIFIED | Both imported and called in GET /:runId handler |
| `backend/src/routes/approvals.ts` | `backend/src/ai/orchestrator.ts` | `advance(runId, { type: 'command_approved', ... })` | VERIFIED | `advance` imported at line 3; called at lines 52, 86 |
| `backend/src/routes/approvals.ts` | `backend/src/store/db.ts` | `getDb().get(...)` for CommandApproval lookup | VERIFIED | `getApproval` helper at line 20 uses `getDb().get(...)` |
| `backend/src/routes/events.ts` | `backend/src/events/sse.ts` | `createSseStream(c, runId)` | VERIFIED | Imported at line 3; called at line 11 |
| `backend/src/events/sse.ts` | `backend/src/events/run-event-bus.ts` | `runEventBus.on` / `runEventBus.off` inside streamSSE | VERIFIED | `runEventBus.on` called for each of 14 event types at line 56; `runEventBus.off` in onAbort at line 60-62 |
| `backend/src/events/sse.ts` | `backend/src/store/audit.ts` | `getAuditEvents(runId)` for backfill | VERIFIED | Called at line 26; results iterated for backfill writes |
| `backend/src/app.ts` | `backend/src/routes/runs.ts` | `app.route('/api/runs', runsRouter)` | VERIFIED | Line 24 |
| `backend/src/app.ts` | `backend/src/routes/approvals.ts` | `app.route('/api/runs', approvalsRouter)` | VERIFIED | Line 25 |
| `backend/src/app.ts` | `backend/src/routes/events.ts` | `app.route('/api/runs', eventsRouter)` | VERIFIED | Line 26 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `runs.ts` GET /:runId | `timeline` | `getAuditEvents(runId)` reads `audit_events` table | Yes — DB query, no static fallback | FLOWING |
| `runs.ts` GET /:runId | `pendingApproval` | `getPendingApproval` calls `db.all(...)` filtered in code | Yes — queries `command_approvals` table | FLOWING |
| `runs.ts` POST / | `ticket` / `customerSystem` | `client.getTicket()` / `client.getCustomerSystem()` from Phoenix (mock in tests) | Yes — Phoenix client returns real fixture data | FLOWING |
| `approvals.ts` approve | `approval.risk_level` | `getApproval()` reads `command_approvals` table row | Yes — DB read, `safetyRecheck.riskLevel` comes from stored row not hardcode | FLOWING |
| `sse.ts` | backfill `events` | `getAuditEvents(runId)` | Yes — real DB rows | FLOWING |

---

### Behavioral Spot-Checks

Build and test infrastructure used in-process via `app.request()` — spot-checks run as part of the 373-test suite.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| POST /api/runs returns 201 LOADED_CONTEXT | `npx vitest run tests/runs.test.ts` | 13/13 pass | PASS |
| advance() not called on POST / | spy assertion in runs.test.ts | passes | PASS |
| 422 on blocked command | approvals.test.ts blocked-command test | passes | PASS |
| 409 on replay | approvals.test.ts already-EXECUTED and APPROVED tests | passes | PASS |
| Symmetry: approval.required in audit + bus | sse-audit-symmetry.test.ts | 1/1 pass | PASS |
| Full suite regression | `npx vitest run` | 373/373 pass | PASS |
| TypeScript compile | `npx tsc --noEmit` | zero errors | PASS |

---

### Probe Execution

No phase-declared probes. Step 7c: SKIPPED (no probe-*.sh files for this phase).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| API-01 | 06-01, 06-04 | Run routes per PRD §9: POST /api/runs, GET /api/runs/:id, POST /:id/next, POST /:id/abort | SATISFIED | All four endpoints implemented and tested in runs.ts / runs.test.ts; mounted in app.ts |
| API-02 | 06-02, 06-04 | Approval routes: approve (safety re-check) + reject-with-reason | SATISFIED | Both endpoints in approvals.ts; 15 tests cover 422/409/400/404 paths; advance() wired |
| API-03 | 06-03, 06-04 | SSE stream with live events + every side-effect emits and audits the same event | SATISFIED | sse.ts + events.ts implemented; symmetry test verifies audit↔bus pairing for approval.required |

Note: REQUIREMENTS.md traceability table and requirement checkboxes still show API-01 and API-03 as "Pending" / `[ ]`. This is a stale tracking artifact — REQUIREMENTS.md was not updated to mark them complete after Phase 6 executed. The code, tests, and SUMMARY documents are consistent with completion. No code gap.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No TBD, FIXME, or XXX markers in any Phase 6 files. No placeholder return values or empty handlers. The comment at `runs.ts:67` (`// Split on ':' in advance() at orchestrator.ts:576 — no protocol prefix`) is a legitimate constraint note explaining a non-obvious coupling, not a debt marker.

---

### Human Verification Required

#### 1. SSE Live Event Delivery

**Test:** Start the server (`docker compose up` or `node src/index.ts`). Open the browser console and connect: `const es = new EventSource('http://localhost:8000/api/runs/{runId}/events')`. Advance the run via `POST /api/runs/{runId}/next`. Watch the console.
**Expected:** Browser receives backfill events immediately on connect (prior audit rows as SSE messages with correct `event:` field), then live `approval.required` event within milliseconds of the `/next` response. The keepalive comment (`: keepalive`) appears after ~15s of inactivity.
**Why human:** Hono `streamSSE` writes to a `ReadableStream`; `app.request()` in Vitest does not exercise real HTTP chunked transfer or the EventSource protocol. Live delivery requires a real server and browser (or curl `--no-buffer`).

#### 2. Listener Cleanup on Disconnect

**Test:** Connect an EventSource as above. Inspect `runEventBus` listener counts (add a temporary `console.log(runEventBus.listenerCount(runId, 'approval.required'))` or check via Node `--inspect`). Close the tab or call `es.close()`.
**Expected:** After disconnect, listener count for the run drops to zero for all 14 event types. Server memory is stable over repeated connect/disconnect cycles.
**Why human:** `stream.onAbort` fires on actual TCP-level disconnection; Vitest in-process requests do not simulate this lifecycle.

---

### Gaps Summary

No gaps. All 15 must-haves are VERIFIED. Two human verification items remain for SSE live-stream behaviour — these require a running server and cannot be validated programmatically.

The REQUIREMENTS.md traceability staleness (API-01 and API-03 still marked Pending) is a documentation artifact to clean up, not a functional gap. The phase goal is achieved in the codebase.

---

_Verified: 2026-06-07T01:02:00Z_
_Verifier: Claude (gsd-verifier)_
