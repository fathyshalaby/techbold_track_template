---
phase: 03-safety-layer-run-store
plan: "04"
subsystem: safety-layer
tags: [safety, tdd, testing, blocklist, redaction, classifier]
dependency_graph:
  requires: [03-01, 03-02, 03-03]
  provides: [safety.test.ts consolidated §9 gate]
  affects: [rubric-C evidence, safety regression detection]
tech_stack:
  added: []
  patterns: [TDD RED→GREEN→REFACTOR, consolidated integration gate]
key_files:
  created:
    - backend/src/tests/safety.test.ts
  modified:
    - backend/src/safety/command-policy.ts
decisions:
  - "Placed kill -9 -1 under mass-kill describe block (not db-destruction) for accurate category mapping"
  - "Task 1 RED and Task 2 GREEN collapsed: suite was immediately GREEN except one chown -R bug; fix committed as separate feat commit per TDD protocol"
metrics:
  duration: "108 seconds"
  completed: "2026-06-06"
  tasks_completed: 3
  files_modified: 2
---

# Phase 03 Plan 04: §9 Consolidated Safety Test Suite Summary

Populated `safety.test.ts` with the full §9 test checklist from SAFETY_POLICY.md — a consolidated gate that imports from all three public safety modules (command-policy, classifier, redaction) and exercises them together as rubric-C evidence.

## What Was Built

`backend/src/tests/safety.test.ts` replaced the `describe.skip` stub with 65 live test cases across 7 nested describes matching the §9 categories:

1. `blocklist — HIGH_RISK_BLOCKED` — every category: rm-rf-system-paths, disk-wipe, block-device-write, shutdown-reboot, fork-bomb, broad-chmod-chown, disable-security, secret-exposure, hide-tracks, exfiltration, db-destruction (including TRUNCATE TABLE), mass-kill
2. `obfuscation variants` — extra-spaces, quoted-path, env-var-wrapper, backtick-wrapper, quoted-command-name, chained-semicolon
3. `targeted variants — not blocked` — chown/chmod on specific paths, systemctl restart
4. `edited-command recheck — SAFE-05` — same `validateCommandAgainstPolicy` function blocks dangerous edit
5. `redaction` — password=, token=, secret=, api_key=, api-key=, Authorization: Bearer, postgres:// connection string, multi-line PEM block, 16 KB cap, harmless passthrough
6. `allowlist — SAFE_READ_ONLY` — 7 typical diagnosis commands
7. `unknown commands — default MEDIUM` — 2 unknown commands confirm MEDIUM_RISK_CHANGE

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `chown -R root:root /` not blocked**
- **Found during:** Task 1 RED run (1 of 65 cases failed)
- **Issue:** The `broad-chmod-chown` blocklist pattern `/\bchown\s+-[a-zA-Z]*R[a-zA-Z]*\s+(\/|\/etc|...)/i` required the system path to appear immediately after the flag, but `chown -R root:root /` has the owner argument (`root:root`) between the flag and the path.
- **Fix:** Updated regex to `\bchown\s+-[a-zA-Z]*R[a-zA-Z]*\s+\S+\s+(\/|\/etc|\/var|\/home|\/srv|\/usr|\/boot)` — allows an owner argument before the path.
- **Files modified:** `backend/src/safety/command-policy.ts`
- **Commit:** 67c61f6

**2. [Refactor] Moved `kill -9 -1` test to correct `mass-kill` describe block**
- **Found during:** Task 3 REFACTOR review
- **Issue:** The test case was placed inside `db-destruction` describe block — wrong category.
- **Fix:** Extracted into its own `mass-kill` describe block.
- **Files modified:** `backend/src/tests/safety.test.ts`
- **Commit:** 27ab18c

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED  | 1c26258 `test(03-04): add §9 consolidated safety test suite` | PASS |
| GREEN | 67c61f6 `feat(03-04): safety §9 test suite green` | PASS |
| REFACTOR | 27ab18c `refactor(03-04): clean up §9 safety test suite` | PASS |

## Test Results

```
Tests: 250 passed (250)
Test Files: 9 passed | 1 skipped (10)
safety.test.ts: 65 tests — all pass
safety-policy.test.ts: 48 tests — all pass (no regression)
safety-redaction.test.ts: 29 tests — all pass (no regression)
```

## Known Stubs

None. All test cases exercise real implementations.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Test file only — no production surface added.

## Self-Check: PASSED

- FOUND: backend/src/tests/safety.test.ts
- FOUND: backend/src/safety/command-policy.ts
- FOUND: .planning/phases/03-safety-layer-run-store/03-04-SUMMARY.md
- FOUND commit: 1c26258 (test RED)
- FOUND commit: 67c61f6 (feat GREEN)
- FOUND commit: 27ab18c (refactor)
