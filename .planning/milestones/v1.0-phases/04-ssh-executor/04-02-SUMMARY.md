---
phase: 04-ssh-executor
plan: "02"
subsystem: ssh
tags: [tdd, red-phase, ssh-executor, behavioral-contracts]
dependency_graph:
  requires: [04-01]
  provides: [ssh-executor-test-suite]
  affects: [04-03]
tech_stack:
  added: []
  patterns: [vi.mock-factory-self-contained, fake-timers-async-advance, grep-a1-guard]
key_files:
  created:
    - backend/src/tests/ssh-executor.test.ts
  modified: []
decisions:
  - vi.mock factory uses inline require() for EventEmitter to avoid vitest hoisting initialisation error
  - A1 grep excludes comment-only lines (grep -v '^\s*/') so architect warning comment in ssh-tools.ts does not trigger false positive
  - timedOut assertion does not pin exitCode value — lets 04-03 choose null or sentinel without test churn
metrics:
  duration: ~8 min
  completed: "2026-06-06"
  tasks_completed: 1
  files_created: 1
---

# Phase 04 Plan 02: SSH Executor Behavioral Tests (RED) Summary

One-liner: Failing vitest suite that defines the exact behavioral contracts for the SSH executor — timeout, output cap, result shape, bash-lc wrapping, and A1 anti-pattern guard.

## What Was Built

`backend/src/tests/ssh-executor.test.ts` — 14 `it()` blocks across 5 describe groups. The suite runs RED (13 fail + 1 passes) against the empty `executor.ts` stub. Plan 04-03 will make it GREEN by implementing the real executor.

| Group | Tests | Contract |
|-------|-------|----------|
| result shape | 6 | exactField set `{exitCode,stdout,stderr,durationMs,timedOut}`, correct types, exitCode 0, timedOut false |
| output cap | 3 | stdout and stderr each capped independently at `REDACTION_CAP_BYTES` |
| timeout | 2 | `timedOut: true` after 30s; resolves instead of hanging |
| bash-lc wrap + LANG=C | 2 | exec first-arg starts with `bash -lc`; opts includes `env: { LANG: 'C' }` |
| A1 guard | 1 | grep non-comment lines in `ai/tools/` for `executeApprovedCommand` — asserts empty |

## RED Verification

```
Tests  13 failed | 1 passed (14)
Failure: TypeError: executeApprovedCommand is not a function
```

The one passing test is the A1 grep guard — no implementation needed, just static analysis.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vitest hoisting broke EventEmitter reference in vi.mock factory**
- **Found during:** Task 1 (first run)
- **Issue:** `vi.mock()` is hoisted above imports by vitest; the mock factory closure captured `EventEmitter` from a not-yet-initialized module import, causing `ReferenceError: Cannot access '__vi_import_0__' before initialization`
- **Fix:** Moved all EventEmitter construction inside the `vi.mock` factory using an inline self-executing helper and `require`-style inline instantiation so no top-level import is referenced at hoist time
- **Files modified:** `backend/src/tests/ssh-executor.test.ts`
- **Commit:** 173758d (same commit)

**2. [Rule 1 - Bug] A1 grep matched architect warning comment, causing false positive**
- **Found during:** Task 1 (first run — all 14 tests failed including the A1 guard)
- **Issue:** `grep -r "executeApprovedCommand"` matched the comment `// Anti-pattern: executeApprovedCommand must NEVER be registered as a model tool` in `ssh-tools.ts`, returning non-empty output and failing the assertion
- **Fix:** Piped grep output through `grep -v '^\s*/'` to strip comment-only lines; the assertion now catches actual imports/calls, not documentation comments
- **Files modified:** `backend/src/tests/ssh-executor.test.ts`
- **Commit:** 173758d (same commit)

## Known Stubs

None — this plan creates tests only. No production code was added or modified.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Test file only.

## Self-Check: PASSED

- `backend/src/tests/ssh-executor.test.ts` — FOUND
- commit `173758d` — FOUND
