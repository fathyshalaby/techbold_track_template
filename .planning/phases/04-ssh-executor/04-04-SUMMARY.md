---
phase: 04-ssh-executor
plan: "04"
subsystem: ssh
tags: [ssh, mock, tdd, offline-demo, ci]
dependency_graph:
  requires: [04-01]
  provides: [MockSshExecutor, createMockSshExecutor, MOCK_SSH_FIXTURES, DEFAULT_FALLBACK_RESULT]
  affects: [orchestrator (phase 05), resolveClientMode swap]
tech_stack:
  added: []
  patterns: [SshExecutor interface implementation, exact-command fixture map, preflight caching]
key_files:
  created:
    - backend/src/ssh/mock.ts
    - backend/src/tests/ssh-mock.test.ts
  modified: []
decisions:
  - "Adapted executeApprovedCommand and runPreflight signatures to match actual types.ts (3-param with approvalId; runPreflight takes target not runId) — plan described older interface variant"
  - "Preflight idempotence test adapted: caches by target.host key since runPreflight has no runId param in actual interface"
  - "PreflightResult.lang set to 'C' (string) matching actual interface — plan described langIsC: boolean which does not exist in types.ts"
metrics:
  duration: 2 minutes
  completed_date: "2026-06-06T20:27:51Z"
  tasks_completed: 2
  files_count: 2
---

# Phase 04 Plan 04: SSH Mock Executor Summary

TDD implementation of `MockSshExecutor` — scripted SSH responses covering the full diagnose→fix→validate practice loop for offline demo and CI.

## What Was Built

`MockSshExecutor` implements `SshExecutor` identically to the real executor. The orchestrator can swap implementations via `resolveClientMode` with no other code change. Eleven command fixtures cover the complete practice sequence: `uname -a`, `systemctl status`, `journalctl`, `ss -tulpn`, `sudo kill`, `restart`, `enable`, `is-active`, `curl` health check, `df -h`, `free -m`. Unmatched commands return `DEFAULT_FALLBACK_RESULT` instead of throwing.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED — test(04-04) | 1156206 | PASS |
| GREEN — feat(04-04) | 4a494c1 | PASS |

## Tasks

| Task | Description | Commit |
|------|-------------|--------|
| 1 — RED | Write 14 failing tests in ssh-mock.test.ts | 1156206 |
| 2 — GREEN | Implement backend/src/ssh/mock.ts | 4a494c1 |

## Verification Results

- `vitest run src/tests/ssh-mock.test.ts`: 14/14 PASS
- `tsc --noEmit` scoped to mock.ts: no errors (pre-existing executor stub error in 04-02 is out of scope)
- `grep "import.*ssh2" backend/src/ssh/mock.ts`: empty — zero ssh2 dependency
- Full suite: 271 pass, 13 fail (all failures are pre-existing RED state from 04-02 executor stub — no regressions)

## Deviations from Plan

### Interface Reconciliation (Rule 1 — correctness)

**Found during:** Task 1 (RED) — reading actual `types.ts`

**Issue:** Plan described `executeApprovedCommand(command, target)` (2-param) and `runPreflight(runId, target)` (with runId), and `PreflightResult.langIsC: boolean`. The actual `types.ts` exported from 04-01 has `executeApprovedCommand(approvalId, command, target)` (3-param), `runPreflight(target)` (no runId), and `PreflightResult.lang: string`.

**Fix:** Tests and implementation written against actual `types.ts` interface. Preflight cache keyed by `target.host`. `lang` field set to `'C'`. No types.ts changes needed.

**Files modified:** `backend/src/tests/ssh-mock.test.ts`, `backend/src/ssh/mock.ts`

## Threat Flags

None — fixture data is fully synthetic (no real credentials, IPs are fictional). Anti-pattern A1 guard (T-04M-A1) confirmed passing: `ai/tools/ssh-tools.ts` is an empty stub with no import of `executeApprovedCommand`.

## Known Stubs

None — all exports are fully implemented with realistic fixture values.

## Self-Check

- [x] `backend/src/ssh/mock.ts` exists
- [x] `backend/src/tests/ssh-mock.test.ts` exists
- [x] Commit 1156206 exists (RED)

## Self-Check: PASSED
- [x] Commit 4a494c1 exists (GREEN)
