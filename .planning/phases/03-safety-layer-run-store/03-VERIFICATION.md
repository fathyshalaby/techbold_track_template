---
phase: 03-safety-layer-run-store
verified: 2026-06-06T21:35:00Z
status: human_needed
score: 4/5 must-haves verified
overrides_applied: 0
deferred:
  - truth: "An edited command is re-validated at approval time; a dangerous edit is blocked with 422 + BLOCKED audit entry"
    addressed_in: "Phase 6"
    evidence: "Phase 6 success criteria #2: 'Approve (with optional edit) → safety re-check → execute → observation recorded; reject-with-reason → agent proposes alternative'. The approvals.ts route is a deliberate stub (export {}) in Phase 3; the HTTP-level 422 + audit write at the route layer is Phase 6 work. The underlying pure-function re-check (validateCommandAgainstPolicy, SAFE-05) is fully implemented and tested in Phase 3."
human_verification:
  - test: "Verify the safety.test.ts §9 gate is the visible rubric-C evidence the judges will see"
    expected: "Running `npm test` from backend/ shows 65 tests passing in src/tests/safety.test.ts with no skips, covering all §9 categories"
    why_human: "The test runner output is confirmed programmatically (253 passed, 0 failed), but the judge-visible presentation (CI output, README reference, judge walkthrough) requires human confirmation that the test suite is discoverable and readable as rubric-C evidence"
  - test: "Confirm the JSONL fallback mode activates gracefully in the hackathon environment if better-sqlite3 native bindings fail"
    expected: "When better-sqlite3 binaries are unavailable, console.warn '[store] SQLite unavailable — using JSONL fallback' appears and run/audit operations continue correctly"
    why_human: "The fallback path requires deliberately breaking native bindings to exercise — cannot trigger programmatically in the normal test run"
---

# Phase 3: Safety Layer + Run Store — Verification Report

**Phase Goal:** Every command is deterministically classified and every run event is durably persisted before any SSH command can execute
**Verified:** 2026-06-06T21:35:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | `safety.test.ts` is green — every blocklist pattern (including obfuscation variants) returns `HIGH_RISK_BLOCKED` | ✓ VERIFIED | 65 tests in safety.test.ts all pass; 253 total suite green; covers rm-rf, disk-wipe, block-device-write, shutdown-reboot, fork-bomb, broad-chmod-chown, disable-security, secret-exposure, hide-tracks, exfiltration, db-destruction (TRUNCATE TABLE), mass-kill, all obfuscation variants |
| 2 | An edited command is re-validated at approval time; a dangerous edit is blocked with 422 + `BLOCKED` audit entry | ⬇ DEFERRED | The pure-function re-check (validateCommandAgainstPolicy, SAFE-05) is implemented and tested. The HTTP-level 422 + audit write requires approvals.ts route — which is a deliberate stub (`export {}`) wired in Phase 6. See deferred section. |
| 3 | Secret redaction strips secrets from every string before it reaches the audit log, UI, or model | ✓ VERIFIED | `redactSecrets` implemented with 12 named patterns. `appendAuditEvent` calls `redactSecrets(JSON.stringify(payload))` before writing. `appendCommandResult` also redacts the command string. 29 redaction tests green. |
| 4 | Run store creates a `runs` row and `run.started` audit entry on run creation; no delete path exists | ✓ VERIFIED | `createRun` inserts into `runs` table with ULID-prefixed id. `appendAuditEvent` is the only write path for `audit_events`. No delete/update exported from audit.ts. SQLite BEFORE UPDATE/DELETE triggers enforce append-only at DB level. JSONL adapter throws on UPDATE/DELETE audit_events. |
| 5 | SQLite store persists approvals, results, observations, and activity drafts; JSONL fallback activates when SQLite is unavailable | ✓ VERIFIED | All 6 tables created in CREATE_TABLES DDL. `getDb()` uses dynamic require for better-sqlite3 with catch → JSONL fallback. store-jsonl.test.ts (3 tests) covers JSONL path. `mode` field exposed on adapter. |

**Score:** 4/5 truths verified (SC-2 deferred to Phase 6 — not a gap)

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|------|-------------|---------|
| 1 | Edited command blocked with 422 + BLOCKED audit entry (HTTP route layer) | Phase 6 | Phase 6 SC-2: "Approve (with optional edit) → safety re-check → execute → observation recorded" — the approvals.ts route is a deliberate empty stub in Phase 3 |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/src/safety/command-policy.ts` | validateCommandAgainstPolicy, BLOCKLIST, BlocklistRule, PolicyResult | ✓ VERIFIED | All 4 exports present. 14 rule categories. Normalizer + segment splitter + unresolvable sentinel implemented. |
| `backend/src/safety/classifier.ts` | classifyCommand | ✓ VERIFIED | Exports classifyCommand. SAFE_READ_ONLY allowlist, LOW_RISK_CHANGE patterns, MEDIUM_RISK_CHANGE fallback. Never returns SAFE_READ_ONLY for unknown commands. |
| `backend/src/safety/risk-levels.ts` | RiskLevel enum | ✓ VERIFIED | Enum with 4 values including HIGH_RISK_BLOCKED. Pre-existing, not redefined. |
| `backend/src/safety/redaction.ts` | redactSecrets, REDACTION_CAP_BYTES, RedactionPattern | ✓ VERIFIED | All 3 exports present. 12 named patterns. 16384 cap. Pure function — no side effects. |
| `backend/src/store/schema.ts` | 6 Zod schemas + 6 inferred types | ✓ VERIFIED | RunSchema, AuditEventSchema, CommandApprovalSchema, CommandResultSchema, ObservationSchema, ActivityDraftSchema. All .strict(). RiskLevel nativeEnum on CommandApproval. |
| `backend/src/store/db.ts` | getDb, DbAdapter, StoreMode | ✓ VERIFIED | All 3 exports. Lazy singleton. SQLite WAL + 6 CREATE TABLE IF NOT EXISTS. Append-only triggers. JSONL fallback with in-memory Map. |
| `backend/src/store/runs.ts` | 7 run lifecycle functions | ✓ VERIFIED | createRun, getRunById, updateRunPhase, updateRunStatus, markRunCompleted, markRunFailed, markRunAborted — all exported. ULID `run_` prefix. |
| `backend/src/store/audit.ts` | appendAuditEvent, getAuditEvents + 6 helpers | ✓ VERIFIED | 8 functions exported. No delete/update on audit_events. redactSecrets called inside appendAuditEvent (post-review fix CR-02b). ULID prefixes: ev_, appr_, res_, obs_, act_. |
| `backend/src/tests/safety-policy.test.ts` | Policy + classifier tests | ✓ VERIFIED | 48 tests, all passing. |
| `backend/src/tests/safety-redaction.test.ts` | Redaction tests | ✓ VERIFIED | 29 tests, all passing. |
| `backend/src/tests/safety.test.ts` | §9 consolidated gate, ≥30 test cases | ✓ VERIFIED | 65 tests (35 `it`/`it.each` declarations expanding to 65 cases). All passing. No describe.skip. |
| `backend/src/tests/store-jsonl.test.ts` | JSONL fallback regression tests | ✓ VERIFIED | 3 tests covering COALESCE UPDATE path, append-only guard, INSERT/GET round-trip. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `classifier.ts` | `risk-levels.ts` | RiskLevel enum import | ✓ WIRED | `import { RiskLevel } from './risk-levels.js'` line 1 |
| `command-policy.ts` | `classifier.ts` | classifyCommand called in step 5 | ✓ WIRED | `import { classifyCommand } from './classifier.js'` line 2; called at line 361 |
| `command-policy.ts` | `risk-levels.ts` | RiskLevel import | ✓ WIRED | `import { RiskLevel } from './risk-levels.js'` line 1 |
| `audit.ts` | `db.ts` | getDb() | ✓ WIRED | `import { getDb } from './db.js'` line 2; called on every function |
| `runs.ts` | `db.ts` | getDb() | ✓ WIRED | `import { getDb } from './db.js'` line 2; called on every function |
| `db.ts` | `schema.ts` | CREATE TABLE column names mirror schema | ✓ WIRED | All 6 tables in CREATE_TABLES DDL match schema.ts column names exactly |
| `audit.ts` | `redaction.ts` | redactSecrets called before audit write | ✓ WIRED | `import { redactSecrets } from '../safety/redaction.js'` line 3; `redactSecrets(JSON.stringify(payload))` line 26 |
| `safety.test.ts` | `command-policy.ts` | validateCommandAgainstPolicy | ✓ WIRED | Import confirmed; 65-test gate exercises the function |
| `safety.test.ts` | `classifier.ts` | classifyCommand | ✓ WIRED | Import confirmed; SAFE_READ_ONLY and MEDIUM cases covered |
| `safety.test.ts` | `redaction.ts` | redactSecrets | ✓ WIRED | Import confirmed; 10 redaction test cases including multi-line PEM |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `audit.ts → appendAuditEvent` | payloadJson | `redactSecrets(JSON.stringify(payload))` | Yes — caller-supplied payload, redacted before write | ✓ FLOWING |
| `runs.ts → createRun` | Run row | `db.get('SELECT * FROM runs WHERE id = ?')` after INSERT | Yes — reads back from SQLite/JSONL | ✓ FLOWING |
| `audit.ts → getAuditEvents` | AuditEvent[] | `db.all('SELECT * FROM audit_events WHERE run_id = ?')` | Yes — queries actual table | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 253 tests pass | `npm test` (backend/) | 253 passed, 0 failed, 1 skipped (orchestrator stub) | ✓ PASS |
| safety.test.ts 65 cases all green | npm test output | `✓ src/tests/safety.test.ts (65 tests)` | ✓ PASS |
| safety-policy.test.ts 48 cases green | npm test output | `✓ src/tests/safety-policy.test.ts (48 tests)` | ✓ PASS |
| safety-redaction.test.ts 29 cases green | npm test output | `✓ src/tests/safety-redaction.test.ts (29 tests)` | ✓ PASS |
| store-jsonl.test.ts 3 JSONL regression cases green | npm test output | `✓ src/tests/store-jsonl.test.ts (3 tests)` | ✓ PASS |
| TypeScript compiles clean | `npx tsc --noEmit` | No output (clean) | ✓ PASS |

### Probe Execution

Step 7c: SKIPPED — no probe-*.sh files declared in PLAN frontmatter and no `scripts/*/tests/probe-*.sh` found.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SAFE-01 | 03-01, 03-04 | Deterministic blocklist classifies every dangerous command as HIGH_RISK_BLOCKED including obfuscation variants | ✓ SATISFIED | BLOCKLIST with 14+ rules in command-policy.ts; 65-test gate green including all obfuscation variants (extra spaces, quotes, ${VAR}, backtick, chained) |
| SAFE-02 | 03-01, 03-04 | Risk classifier assigns a level to every command; LLM may only raise, never lower | ✓ SATISFIED | classifyCommand defaults unknown commands to MEDIUM_RISK_CHANGE, never SAFE_READ_ONLY; tested with `someobscurecommand` in safety-policy.test.ts |
| SAFE-03 | 03-02, 03-04 | Secret redaction strips secrets from every string before audit/UI/model | ✓ SATISFIED | redactSecrets with 12 patterns implemented; appendAuditEvent redacts at write time; 29-test redaction suite green |
| SAFE-04 | 03-03 | Append-only audit log records every action; no delete path | ✓ SATISFIED | No delete/update exported from audit.ts; SQLite BEFORE UPDATE/DELETE triggers; JSONL adapter throws on audit_events mutation |
| SAFE-05 | 03-01, 03-04 | Edited commands re-validated at approval time; dangerous edit blocked | ✓ SATISFIED | validateCommandAgainstPolicy is a pure stateless function — calling it on the edited command is structurally identical to proposal-time check; SAFE-05 test in safety.test.ts passes. HTTP 422 response is Phase 6 work (approvals.ts stub). |
| SAFE-06 | 03-04 | Safety layer covered by tests — every blocklist pattern, obfuscation, recheck, redaction | ✓ SATISFIED | Three test suites: safety-policy.test.ts (48), safety-redaction.test.ts (29), safety.test.ts (65) — all green. Covers all §9 categories. |
| API-04 | 03-03 | Run store persists runs, approvals, results, observations, activity drafts (SQLite, JSONL fallback) | ✓ SATISFIED | All 6 tables created. createRun, createPendingApproval, appendCommandResult, appendObservation, saveActivityDraft all implemented and wired to getDb(). JSONL fallback tested in store-jsonl.test.ts. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `backend/src/routes/approvals.ts` | 1-2 | `export {}` stub | ℹ Info | Deliberate — Phase 6 will implement. Not a Phase 3 deliverable. |
| `backend/src/tests/orchestrator.test.ts` | — | 0 tests (skipped) | ℹ Info | Deliberate — Phase 5 will implement orchestrator. |

No TBD/FIXME/XXX/TODO markers found in the Phase 3 implementation files (command-policy.ts, classifier.ts, redaction.ts, schema.ts, db.ts, runs.ts, audit.ts, safety*.test.ts, store-jsonl.test.ts).

### Human Verification Required

#### 1. Safety Test Suite as Rubric-C Evidence

**Test:** Run `cd backend && npm test` and confirm the safety test output is visible, readable, and lists all §9 categories passing with no skips.
**Expected:** Terminal output shows `✓ src/tests/safety.test.ts (65 tests)` with nested describe blocks for blocklist, obfuscation variants, targeted variants, edited-command recheck, redaction, allowlist, and unknown commands — all green.
**Why human:** The test runner result is machine-verified (253 passed), but whether the output reads as clear rubric-C evidence to a judge during a live demo walkthrough is a presentation judgment, not a grep check.

#### 2. JSONL Fallback Activation

**Test:** Temporarily remove or rename the `better-sqlite3` native binding and start the backend.
**Expected:** Console shows `[store] SQLite unavailable — using JSONL fallback` once on startup; a full run cycle (createRun → appendAuditEvent → getAuditEvents) succeeds without error.
**Why human:** Requires deliberately breaking native bindings — cannot be triggered in the standard test environment; store-jsonl.test.ts exercises the adapter in isolation but not the `getDb()` fallback path end-to-end.

### Gaps Summary

No gaps. All five Phase 3 success criteria are either fully verified or explicitly deferred to Phase 6 (the approval route HTTP layer). The deferred item has clear ownership in Phase 6 SC-2 and does not block Phase 3 goal achievement — the underlying pure-function safety re-check (SAFE-05) is implemented and tested.

---

_Verified: 2026-06-06T21:35:00Z_
_Verifier: Claude (gsd-verifier)_
