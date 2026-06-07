---
phase: 07-activity-generation
verified: 2026-06-07T02:35:00Z
status: human_needed
score: 16/16 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "POST /api/runs/:id/activity/draft against a run with real audit events and command results"
    expected: "All 5 fields contain non-empty text grounded in the actual audit data — no invented facts, no placeholder text"
    why_human: "Tests mock runActivityLogGenerator; grounding quality of the real LLM path can only be assessed by running against a live or pre-seeded run with real audit data"
  - test: "POST /api/runs/:id/activity/submit verifies a Phoenix activity record is created in the ERP"
    expected: "Activity record visible in Phoenix (or mock fixture) with correct ticket_id, time window, and all 5 fields"
    why_human: "Tests use MockPhoenixClient; real-mode Phoenix submission path (credentials, network, ERP response) cannot be verified without a running Phoenix instance"
---

# Phase 07: Activity Generation Verification Report

**Phase Goal:** A technician can review and submit a complete ERP activity report built entirely from the audit trail
**Verified:** 2026-06-07T02:35:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `POST /api/runs/:id/activity/draft` returns all 5 graded fields (`summary`, `root_cause`, `actions_taken`, `commands_summary`, `validation_result`) populated from the audit trail | ✓ VERIFIED | Route implemented in `routes/activity.ts`; assembles `ActivityLogGeneratorInput` from `getAuditEvents`, `command_results`, `observations`; 5 fields returned in 11-test suite (Test 1 passes: status 200, all fields non-empty snake_case) |
| 2 | `POST /api/runs/:id/activity/submit` creates a real Phoenix activity via `createActivity` and returns the created record | ✓ VERIFIED | Route implemented; calls `getPhoenixClient().createActivity(...)` with all 5 fields + ticket_id + time window; returns Phoenix Activity record (Test 6 passes: status 200, body has `id` and `ticket_id`) |
| 3 | `runActivityLogGenerator` returns an object with all 5 camelCase fields populated | ✓ VERIFIED | `activity-log-generator.ts` implements `generateObject` with `ActivityDraftFieldsSchema`; Test 1 of agent suite asserts all 5 fields match scripted output |
| 4 | `MOCK_ACTIVITY_DRAFT` is an exported constant with all 5 non-empty string fields | ✓ VERIFIED | Exported at line 20–26 of `activity-log-generator.ts`; all 5 fields are non-empty strings; Test 2 passes |
| 5 | `AgentUnavailableError` is thrown when the model times out or rejects | ✓ VERIFIED | `Promise.race` with 30s timeout; catch-all re-throws as `AgentUnavailableError`; Tests 3 and 4 pass |
| 6 | `ActivityDraftFieldsSchema` is exported from `ai/types.ts` with all 5 required string fields | ✓ VERIFIED | Lines 46–52 of `ai/types.ts`; `z.object({ summary, rootCause, actionsTaken, commandsSummary, validationResult })` all `z.string()` |
| 7 | `ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT` is exported from `ai/prompts.ts` | ✓ VERIFIED | Lines 85–108 of `ai/prompts.ts`; opens with `${SAFETY_PREAMBLE}`; role line present; no-fabrication instruction; commandsSummary constraint explicit |
| 8 | Draft route returns 409 when run phase is too early | ✓ VERIFIED | `DRAFT_ALLOWED_PHASES` set enforces allowlist; Test 2 (LOADED_CONTEXT → 409 with "phase" in error) passes |
| 9 | Draft route returns 502 when agent throws `AgentUnavailableError` | ✓ VERIFIED | Lines 98–103 of `routes/activity.ts`; Test 4 passes |
| 10 | Submit route merges technician-edited fields over the stored draft | ✓ VERIFIED | Lines 136–140 of `routes/activity.ts`; each field uses `override ?? draft.field ?? ''`; Test 7 passes (summary override propagates to `createActivity`) |
| 11 | Submit returns 409 when no draft exists and no body fields supplied | ✓ VERIFIED | Lines 131–134; Test 8 passes |
| 12 | `createActivity` is not retried (non-idempotent) | ✓ VERIFIED | Single `await client.createActivity(...)` call; no retry wrapper; matches plan intent and CONTEXT.md decision D-02 |
| 13 | `activityRouter` is exported from `routes/activity.ts` | ✓ VERIFIED | Line 22 of `routes/activity.ts`: `export const activityRouter = new Hono()` |
| 14 | `activityRouter` is mounted in `app.ts` under `/api/runs` | ✓ VERIFIED | Lines 9 and 28 of `app.ts`; grep confirms 2 occurrences (import + mount); mounted after `eventsRouter` |
| 15 | `POST /api/runs/:id/activity/draft` and `POST /api/runs/:id/activity/submit` are reachable via the main app | ✓ VERIFIED | `app.route('/api/runs', activityRouter)` present; routes defined as `/:runId/activity/draft` and `/:runId/activity/submit` |
| 16 | Full test suite is green with no regressions | ✓ VERIFIED | `npx vitest run`: 20 test files, 473 tests passed, 0 failures |

**Score:** 16/16 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/src/ai/types.ts` | `ActivityDraftFieldsSchema` + `ActivityDraftFields` type | ✓ VERIFIED | Lines 46–57; 5 required string fields, camelCase |
| `backend/src/ai/prompts.ts` | `ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT` | ✓ VERIFIED | Lines 85–108; opens with SAFETY_PREAMBLE; no-fabrication, commandsSummary constraint |
| `backend/src/ai/agents/activity-log-generator.ts` | `runActivityLogGenerator`, `MOCK_ACTIVITY_DRAFT`, `ActivityLogGeneratorInput` | ✓ VERIFIED | All 3 exported; implementation is substantive (51 lines); optional model param, Promise.race, AgentUnavailableError |
| `backend/src/tests/activity-log-generator.test.ts` | TDD test suite, 5 tests | ✓ VERIFIED | 183 lines; 5 tests: happy path, mock constant, agent-unavailable, timeout, grounding |
| `backend/src/routes/activity.ts` | `activityRouter` + `SubmitBodySchema`, draft + submit handlers | ✓ VERIFIED | 184 lines; both routes fully implemented with phase guard, agent call, redaction, audit+bus |
| `backend/src/tests/activity.test.ts` | TDD test suite, 11 tests | ✓ VERIFIED | 282 lines; 11 tests covering all specified behaviours |
| `backend/src/app.ts` | `activityRouter` mounted under `/api/runs` | ✓ VERIFIED | Import line 9, mount line 28 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `activity-log-generator.ts` | `ai/types.ts` | import `ActivityDraftFieldsSchema` | ✓ WIRED | Line 5: `import { ActivityDraftFieldsSchema } from '../types.js'` |
| `activity-log-generator.ts` | `ai/prompts.ts` | import `ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT` | ✓ WIRED | Line 4: `import { ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT } from '../prompts.js'` |
| `routes/activity.ts` | `ai/agents/activity-log-generator.ts` | import `runActivityLogGenerator` | ✓ WIRED | Line 3: `import { runActivityLogGenerator, AgentUnavailableError }` |
| `routes/activity.ts` | `store/audit.ts` | `saveActivityDraft` + `getActivityDraft` + `appendAuditEvent` + `getAuditEvents` | ✓ WIRED | Lines 6–11; all 4 functions imported and used in handlers |
| `routes/activity.ts` | `store/runs.ts` | `getRunById` + `markRunCompleted` | ✓ WIRED | Line 4; both used: `getRunById` in both handlers, `markRunCompleted` in submit |
| `app.ts` | `routes/activity.ts` | import `activityRouter` | ✓ WIRED | Line 9 import, line 28 `app.route('/api/runs', activityRouter)` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `routes/activity.ts` draft handler | `auditEvents` | `getAuditEvents(runId)` → SQLite `audit_events` table | Yes — DB query via store function | ✓ FLOWING |
| `routes/activity.ts` draft handler | `commandResultRows` | `getDb().all(... FROM command_results WHERE run_id = ?)` | Yes — direct SQLite query | ✓ FLOWING |
| `routes/activity.ts` submit handler | `draft` | `getActivityDraft(runId)` → SQLite `activity_drafts` table | Yes — DB query via store function | ✓ FLOWING |
| `routes/activity.ts` submit handler | `activity` | `getPhoenixClient().createActivity(...)` | Yes — Phoenix client POST (mock in tests, real in production) | ✓ FLOWING |

### Behavioral Spot-Checks

Step 7b skipped — routes require a running server with seeded DB state; no runnable entry point is available for stateless spot-checks.

### Probe Execution

Step 7c: No `probe-*.sh` files found in `scripts/`. Not a migration/tooling phase. Skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| ACT-01 | 07-01, 07-02 | `activity_log_generator` produces all 5 graded fields from audit trail only — no invented facts, no secrets | ✓ SATISFIED | `runActivityLogGenerator` + `ActivityDraftFieldsSchema` in `ai/agents/activity-log-generator.ts`; system prompt instructs no fabrication; defence-in-depth `redactSecrets` on all 5 fields before persistence |
| ACT-02 | 07-02, 07-03 | `POST /api/runs/:id/activity/draft` and `/activity/submit` create a Phoenix activity via `createActivity` | ✓ SATISFIED | Both routes implemented and mounted; `/submit` calls `createActivity` once (no retry); 11 TDD tests green |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `activity-log-generator.test.ts` | ~148–170 | Timeout test leaks unhandled `AgentUnavailableError` rejection after fake-timer teardown | ⚠ Warning | Vitest reports "1 unhandled error" — does not cause any test to fail (473/473 pass) but could mask real unhandled rejections in future runs. Pre-existing before this phase per 07-02-SUMMARY.md. |

No `TBD`, `FIXME`, or `XXX` markers found in phase-modified files.

### Human Verification Required

#### 1. Draft grounding quality — real LLM path

**Test:** Start the backend in mock LLM mode, POST to `/api/runs/:id/activity/draft` on a run that has gone through several diagnostic steps with real (or seeded) audit events and command results
**Expected:** All 5 fields contain non-empty text that references actual commands and outcomes from the audit trail — not placeholder text, not invented facts
**Why human:** Every test in the suite mocks `runActivityLogGenerator` via `vi.spyOn`; the real `generateObject` call is never exercised in CI. The system prompt instructs grounding, but prompt quality and LLM compliance can only be judged by a human reading the actual output.

#### 2. Phoenix activity submission — real mode

**Test:** Set `MOCK_PHOENIX=false` (or equivalent) and POST to `/api/runs/:id/activity/submit` with a seeded draft
**Expected:** A Phoenix activity record is created in the ERP; the response body contains a real `id` assigned by Phoenix; the activity is visible in the ticket's history
**Why human:** Tests use `MockPhoenixClient`; the real HTTP path (auth, payload serialisation, Phoenix-assigned IDs) has not been exercised against a live ERP instance.

### Gaps Summary

No blocking gaps. All 16 must-haves are verified in the codebase. The unhandled rejection in the timeout test is a pre-existing warning-level issue and does not block goal achievement.

The two human verification items are the standard boundary between automated verification and live-system/LLM-quality checks that cannot be resolved by grep and static analysis.

---

_Verified: 2026-06-07T02:35:00Z_
_Verifier: Claude (gsd-verifier)_
