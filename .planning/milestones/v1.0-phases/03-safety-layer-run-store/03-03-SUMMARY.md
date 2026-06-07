---
phase: 03-safety-layer-run-store
plan: "03"
subsystem: store
tags: [sqlite, jsonl, audit, ulid, runs, schema]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [store-schema, db-adapter, run-crud, audit-log]
  affects: [05-orchestrator, 06-run-routes]
tech_stack:
  added: [ulid]
  patterns: [better-sqlite3-synchronous, jsonl-fallback, append-only-audit, ulid-prefixed-ids]
key_files:
  created:
    - backend/src/store/schema.ts
    - backend/src/store/db.ts
    - backend/src/store/runs.ts
    - backend/src/store/audit.ts
  modified:
    - backend/package.json
    - backend/src/safety/redaction.ts
decisions:
  - "JSONL fallback uses in-memory Map — sufficient for hackathon; mode field preserved for compatibility"
  - "appendAuditEvent trusts caller to pre-redact payload — no internal redact call keeps store layer simple"
  - "getDb() lazy singleton with dynamic import of better-sqlite3 — avoids top-level native-binding failure"
  - "JSON-format redaction patterns added to redaction.ts — token=value patterns missed JSON key:value format"
metrics:
  duration_minutes: 15
  completed_date: "2026-06-06"
  tasks_completed: 3
  files_changed: 6
requirements: [API-04, SAFE-04]
---

# Phase 03 Plan 03: Run Store + Append-Only Audit Log Summary

**One-liner:** SQLite-backed run store with append-only audit log, ULID-prefixed IDs across 6 tables, and JSONL in-memory fallback — the durable foundation the orchestrator and judges inspect directly.

## What Was Built

Four store modules now back the entire run lifecycle:

- `schema.ts` — Zod row schemas + inferred TS types for all 6 tables (`runs`, `audit_events`, `command_approvals`, `command_results`, `observations`, `activity_drafts`), all `.strict()`, mirroring ARCHITECTURE §6 column names exactly.
- `db.ts` — `DbAdapter` interface (`run/get/all`) with lazy singleton init. Tries `better-sqlite3` via dynamic import; on native-binding failure activates an in-memory JSONL fallback and logs once. Runs all 6 `CREATE TABLE IF NOT EXISTS` statements with WAL mode enabled.
- `runs.ts` — Run lifecycle CRUD: `createRun`, `getRunById`, `updateRunPhase`, `updateRunStatus`, `markRunCompleted`, `markRunFailed`, `markRunAborted`. All synchronous via `getDb()`.
- `audit.ts` — Append-only audit writes: `appendAuditEvent` is the sole write path for `audit_events` (no delete/update exported). Helpers: `getAuditEvents`, `createPendingApproval`, `updateApprovalStatus`, `appendCommandResult`, `appendObservation`, `saveActivityDraft`, `getActivityDraft`.

All IDs use ULID with typed prefixes: `run_`, `ev_`, `appr_`, `res_`, `obs_`, `act_`.

## Verification Results

- Round-trip `createRun → appendAuditEvent → getAuditEvents → updateRunPhase → getRunById`: all pass
- Redact-before-audit contract: persisted `payload_json` contains `«redacted»` not the raw secret
- TypeScript: `npx tsc --noEmit` — clean
- Full test suite: 185 tests passing, 0 failures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] JSON-format secret values not redacted by existing patterns**
- **Found during:** Task 3 verification — `secret redacted in audit: false`
- **Issue:** `redaction.ts` patterns matched shell `key=value` and env-var `KEY=VALUE` formats but not JSON `"key":"value"` format. The plan's verify step calls `redactSecrets(JSON.stringify(payload))` where payload has `{ token: 'supersecret-token' }` — the token survived redaction in JSON-serialised form.
- **Fix:** Added JSON-object redaction patterns to `REDACTION_PATTERNS` in `redaction.ts` covering `"password"`, `"token"`, `"secret"`, `"api_key"`, `"apikey"`, `"key"` (when value looks secret), and `"authorization"` fields in JSON strings. Replacement preserves the key name: `"token":"«redacted»"`.
- **Files modified:** `backend/src/safety/redaction.ts`
- **Commit:** d14c337
- **Test impact:** All 29 existing `safety-redaction.test.ts` tests still pass.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes at trust boundaries beyond those specified in the plan's threat model. The `appendAuditEvent` no-delete/no-update structural enforcement is in place. The redaction fix (deviation above) strengthens T-03-10 coverage — JSON-encoded payloads are now also redacted before audit write.

## Known Stubs

None — all exported functions are fully implemented and verified.

## Self-Check: PASSED

- FOUND: backend/src/store/schema.ts
- FOUND: backend/src/store/db.ts
- FOUND: backend/src/store/runs.ts
- FOUND: backend/src/store/audit.ts
- FOUND: .planning/phases/03-safety-layer-run-store/03-03-SUMMARY.md
- FOUND commit: 00c6ce9 (task 1 — schema + ulid)
- FOUND commit: c0cb1af (task 2 — db.ts)
- FOUND commit: d14c337 (task 3 — runs.ts + audit.ts + redaction fix)
