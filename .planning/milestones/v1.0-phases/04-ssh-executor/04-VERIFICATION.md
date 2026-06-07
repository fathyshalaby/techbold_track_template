---
phase: 04-ssh-executor
verified: 2026-06-06T23:06:30Z
status: human_needed
score: 3/4 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Run `uname -a` against a real VM using the configured SSH key"
    expected: "Result contains exitCode (0), non-empty stdout with kernel info, stderr empty or minimal, durationMs > 0, timedOut false"
    why_human: "No live SSH credentials or VM are available in CI/this environment. The code path (createSshClient → conn.exec → bash -lc) is correct and fully tested against the mock, but actual socket-level connectivity can only be confirmed with a real target."
deferred:
  - truth: "Generalising loop (DIAG-06) solves all 5 practice VMs cleanly with zero safety flags"
    addressed_in: "Phase 5"
    evidence: "Phase 5 goal: 'The AI can diagnose a Linux service incident end-to-end — from ranked hypotheses through a fix proposal to a validated, persistence-checked resolution — under deterministic orchestrator control'. DIAG-06 is a full-loop requirement; Phase 4 delivers the SSH execution substrate only."
---

# Phase 4: SSH Executor Verification Report

**Phase Goal:** The backend can execute a single approved command on a remote VM safely, with output captured and redacted, driving the practice loop offline via mock
**Verified:** 2026-06-06T23:06:30Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC1 | Real VM: `uname -a` executes and returns captured output, exit code, and duration | ? UNCERTAIN | Code path is correct; live VM not available in this environment — see Human Verification |
| SC2 | A command that exceeds the timeout is marked `timedOut`; output is capped at 16 KB | ✓ VERIFIED | `executor.ts` lines 65–76: 30s `setTimeout` calls `channel.destroy()`, resolves `timedOut: true`, exitCode `-1`. Cap applied via `.subarray(0, REDACTION_CAP_BYTES)` on both streams independently (lines 67, 92–93). Test group "timeout" and "output cap" all pass (14/14 green). |
| SC3 | SSH mock drives the full agent loop offline without a real VM | ✓ VERIFIED | `MockSshExecutor` implements `SshExecutor` identically. Fixture map covers 11 commands: uname, systemctl status, journalctl, ss, sudo kill, restart, enable, is-active, curl health, df -h, free -m. `DEFAULT_FALLBACK_RESULT` handles unknown commands. 14/14 ssh-mock tests pass. |
| SC4 | Preflight step confirms `sudo -n true`, `LANG=C`, and PATH via `bash -lc` before any command runs | ✓ VERIFIED | `executor.ts` lines 129–149: `runPreflight` runs three `executeApprovedCommand` calls (`sudo -n true`, `echo $LANG`, `echo $PATH`) serially, each wrapped via `bash -lc` by the executor. Cache keyed by `runId`. Mock preflight always returns `sudoAvailable: true, lang: 'C', path: non-empty`. One noted deviation: `createSshExecutor()` in `executor.ts` adapts `runPreflight(runId, target)` to the interface signature `runPreflight(target)` by hard-coding `'default'` as the runId — this caps the real-executor preflight cache to one entry system-wide when called via the `SshExecutor` interface. Not a blocker for SC4 as written; Phase 5 orchestrator callers can call `runPreflight(runId, target)` directly. |

**Score:** 3/4 truths verified (SC1 requires human)

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | DIAG-06: Generalising loop solves all 5 practice VMs cleanly, reboot-persistent, zero safety flags | Phase 5 | Phase 5 success criteria: full diagnose→fix→validate loop under orchestrator control. Phase 4 delivers the SSH execution substrate; the complete loop requires the orchestrator and agent chain from Phase 5. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/src/ssh/types.ts` | 5 type exports: CommandResult, PreflightResult, SshConnectionError, SshTarget, SshExecutor | ✓ VERIFIED | All 5 named exports present. CommandResult has exactly 5 fields. SshExecutor interface has correct 3-param `executeApprovedCommand` and `runPreflight(target)`. `SshConnectionError.name = 'SSHConnectionError'` verified by test. |
| `backend/src/ssh/client.ts` | `createSshClient(target, keyPath)` — connects with 10s timeout, throws SshConnectionError on failure | ✓ VERIFIED | `readyTimeout: 10_000` confirmed (line 29). Throws `SshConnectionError` on `'error'` event (lines 14–22). Logs `host:port` only — no key bytes or credentials in logs. |
| `backend/src/ssh/executor.ts` | `executeApprovedCommand`, `runPreflight`, `createSshExecutor`; output cap; timeout kill; raw output | ✓ VERIFIED | All three exports present. `REDACTION_CAP_BYTES` imported from `safety/redaction.js` (not hardcoded). Raw-output contract documented with single comment on line 1. `preflightCache` is module-level Map. 14/14 executor tests pass. |
| `backend/src/ssh/mock.ts` | `MockSshExecutor`, `createMockSshExecutor`, `MOCK_SSH_FIXTURES`, `DEFAULT_FALLBACK_RESULT` | ✓ VERIFIED | All 4 exports present. 11-command fixture map confirmed. No ssh2 import. `MockSshExecutor implements SshExecutor`. 14/14 mock tests pass. |
| `backend/src/ai/tools/ssh-tools.ts` | `proposeSshCommand` tool, `executeApprovedCommand` backend fn, `createSshExecutor` factory | ✓ VERIFIED | `proposeSshCommand` uses `tool()` with 5-field `parameters` schema and no `execute` property. `createSshExecutor()` delegates to mock or real via `resolveClientMode('ssh')`. `executeApprovedCommand` has backend-only comment. 38-line module. |
| `backend/src/tests/ssh-executor.test.ts` | 14 tests across 5 groups: shape, cap, timeout, bash-lc, A1 guard | ✓ VERIFIED | 14 tests, all pass. Groups: result shape (6), output cap (3), timeout (2), bash-lc/LANG=C (2), A1 guard (1). |
| `backend/src/tests/ssh-mock.test.ts` | 14 tests across fixture lookup, fallback, preflight, interface conformance, practice loop | ✓ VERIFIED | 14 tests, all pass. |
| `backend/src/tests/ssh-tools-guard.test.ts` | A1 enforcement guard: proposeSshCommand defined, executeApprovedCommand never wrapped in tool() | ✓ VERIFIED | 3 tests, all pass. Source-level regex guard permanent. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `executor.ts` | `types.ts` | `import { CommandResult, PreflightResult, SshExecutor, SshTarget }` | ✓ WIRED | Confirmed at executor.ts line 3 |
| `executor.ts` | `client.ts` | `import { createSshClient }` | ✓ WIRED | Confirmed at executor.ts line 2 |
| `executor.ts` | `safety/redaction.ts` | `import { REDACTION_CAP_BYTES }` | ✓ WIRED | Confirmed at executor.ts line 4; used for cap on lines 67, 92, 93 |
| `mock.ts` | `types.ts` | `implements SshExecutor` | ✓ WIRED | `MockSshExecutor implements SshExecutor` at mock.ts line 99 |
| `ssh-tools.ts` | `executor.ts` | `import { createSshExecutor as createRealSshExecutor }` | ✓ WIRED | Confirmed at ssh-tools.ts line 7; used in `createSshExecutor()` factory |
| `ssh-tools.ts` | `mock.ts` | `import { createMockSshExecutor }` | ✓ WIRED | Confirmed at ssh-tools.ts line 9; used in mock branch |
| `ssh-tools.ts` | `env.ts` | `import { resolveClientMode }` | ✓ WIRED | Confirmed at ssh-tools.ts line 10; drives mock/real selection |

### Data-Flow Trace (Level 4)

Not applicable — this phase produces execution infrastructure (executor, mock, type contracts), not components that render dynamic data. Behavioral checks cover the data-flow concern.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 33 phase-4 tests pass | `npx vitest run src/tests/ssh-executor.test.ts src/tests/ssh-mock.test.ts src/tests/ssh-tools-guard.test.ts` | 33/33 passed, 0 failed, 250ms | ✓ PASS |
| `tsc --noEmit` clean | `npx tsc --noEmit` | exit 0, no output | ✓ PASS |
| `redactSecrets` not called in executor | `grep -n "redactSecrets" backend/src/ssh/executor.ts` | empty | ✓ PASS |
| `REDACTION_CAP_BYTES` used for cap (not literal 16384) | `grep "REDACTION_CAP_BYTES" backend/src/ssh/executor.ts` | 3 hits: import + 2 uses in subarray | ✓ PASS |
| `readyTimeout: 10_000` present in client | `grep "readyTimeout" backend/src/ssh/client.ts` | line 29: `readyTimeout: 10_000` | ✓ PASS |
| No ssh2 import in mock | `grep "import.*ssh2" backend/src/ssh/mock.ts` | empty | ✓ PASS |
| A1 guard: `executeApprovedCommand` not wrapped in `tool()` | grep on ai/tools/ | empty | ✓ PASS |
| No TBD/FIXME/XXX debt markers in phase files | grep across all ssh/ and ai/tools/ssh-tools.ts | empty | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` files declared or found for this phase. Step 7c: SKIPPED.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| DIAG-06 | 04-01, 04-02, 04-03, 04-04, 04-05 | Generalising loop solves all 5 practice VMs cleanly, reboot-persistent, with zero safety flags | DEFERRED to Phase 5 | Phase 4 delivers the SSH execution layer (executor, mock, preflight, tools wiring) needed for the loop. The loop itself — orchestrator driving agents through diagnose→fix→validate — requires Phase 5. REQUIREMENTS.md traceability table marks DIAG-06 as Phase 4 Complete, but the requirement's full observable behavior (5 VMs, persistence check) cannot be confirmed until Phase 5 closes the agent loop. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `backend/src/ai/tools/ssh-tools.ts` | 5–6 | `executeReal` and `runPreflightReal` imported but never referenced directly — `createRealSshExecutor()` delegates to them internally | ℹ️ Info | No functional impact. `noUnusedLocals` is disabled in tsconfig (intentional skeleton setting). Dead imports; consider removing to reduce cognitive load. |
| `backend/src/ssh/executor.ts` | 155 | `runPreflight` in `createSshExecutor()` factory hard-codes `'default'` as the runId: `(target) => runPreflight('default', target)` | ⚠️ Warning | The `SshExecutor` interface exposes `runPreflight(target)` with no runId, so the factory must bridge the gap. Using `'default'` means only one preflight result is ever cached when the orchestrator calls `runPreflight` via the interface. Phase 5 should call `executor.runPreflight(runId, target)` directly (bypassing the interface) to get proper per-run caching, or the interface should be updated. |

### Human Verification Required

#### 1. Real SSH execution against a live VM

**Test:** With a valid `.pem` key in `keys/` and a target VM configured in `.env` (`SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY_PATH`), start the backend and call `executeApprovedCommand` with command `uname -a` against the real target.
**Expected:** Result has `exitCode: 0`, `stdout` containing the kernel string (e.g. `Linux vm-01 5.15.0...`), `durationMs > 0`, `timedOut: false`. The connection closes cleanly after the command completes.
**Why human:** No live SSH credentials or target VM are present in this environment. The code path through `createSshClient` → `ssh2 Client.connect` → `conn.exec` → `bash -lc` is fully implemented and correct, but socket-level connectivity requires an actual VM. The mock tests verify every behavioral contract; this item confirms the real ssh2 wire-up works end-to-end.

---

### Gaps Summary

No blocking gaps. All verifiable success criteria are confirmed in code and tests. SC1 (real VM) is routed to human verification — the implementation is correct and complete, but live connectivity cannot be tested without real credentials. SC4 has a minor wiring note (hard-coded `'default'` runId in the interface adapter) flagged as a warning for Phase 5 to consider.

---

_Verified: 2026-06-06T23:06:30Z_
_Verifier: Claude (gsd-verifier)_
