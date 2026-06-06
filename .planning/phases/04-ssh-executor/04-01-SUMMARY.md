---
phase: "04"
plan: "01"
subsystem: ssh
tags: [types, interfaces, tdd]
dependency_graph:
  requires: []
  provides:
    - backend/src/ssh/types.ts (CommandResult, PreflightResult, SshConnectionError, SshTarget, SshExecutor)
  affects:
    - backend/src/ssh/executor.ts
    - backend/src/ssh/mock.ts
    - backend/src/ssh/client.ts
tech_stack:
  added: []
  patterns:
    - Interface-first type contracts (TypeScript interfaces only, no Zod in types.ts)
    - Typed error class extending Error with explicit name override
key_files:
  created:
    - backend/src/tests/ssh-types.test.ts
  modified:
    - backend/src/ssh/types.ts
decisions:
  - No Zod schemas in types.ts — pure TypeScript interfaces; boundary validation deferred to store layer (Phase 6)
  - approvalId included in SshExecutor.executeApprovedCommand now to lock the contract before Phase 6 wiring
  - SshTarget carries only the key path string, never key bytes — enforced at interface level
metrics:
  duration: "< 1 minute"
  completed: "2026-06-06"
  tasks_completed: 1
  files_changed: 2
---

# Phase 04 Plan 01: SSH Layer Type Contracts Summary

TypeScript interface-first contracts for the entire SSH layer — `CommandResult`, `PreflightResult`, `SshConnectionError`, `SshTarget`, and `SshExecutor` — committed before any implementation code so plans 04-02 through 04-05 have an unambiguous shared contract.

## What Was Built

`backend/src/ssh/types.ts` replaced the empty `export {}` stub with five named exports:

- `SshTarget` — connection parameters (host, port, username, privateKeyPath)
- `CommandResult` — exactly 5 fields matching ARCHITECTURE.md §3: exitCode, stdout, stderr, durationMs, timedOut
- `PreflightResult` — sudoAvailable (Safety Policy G7 hook), lang, path
- `SshConnectionError` — class extending Error; `this.name = 'SSHConnectionError'`; optional typed `cause`
- `SshExecutor` — interface with `executeApprovedCommand(approvalId, command, target)` and `runPreflight(target)`

Two vitest tests in `backend/src/tests/ssh-types.test.ts` verify runtime and structural correctness.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | 701f103 | test(04-01): add failing tests — `SshConnectionError is not a constructor` confirmed failure |
| GREEN | 7690e83 | feat(04-01): implement types — both tests pass, tsc clean |
| REFACTOR | — | Not needed; contracts are minimal |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns introduced. `SshTarget.privateKeyPath` is a string field on an interface — key bytes never touch this type. Consistent with T-04-01 disposition (mitigate: path only, never bytes).

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `backend/src/ssh/types.ts` exists | FOUND |
| `backend/src/tests/ssh-types.test.ts` exists | FOUND |
| `04-01-SUMMARY.md` exists | FOUND |
| commit 701f103 (RED) | FOUND |
| commit 7690e83 (GREEN) | FOUND |
| vitest run ssh-types.test.ts | 2 passed, 0 failed |
