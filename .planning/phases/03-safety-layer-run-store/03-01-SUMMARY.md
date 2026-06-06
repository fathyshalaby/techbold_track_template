---
phase: 03-safety-layer-run-store
plan: "01"
subsystem: safety
tags: [safety, blocklist, classifier, tdd, policy]
dependency_graph:
  requires: []
  provides:
    - validateCommandAgainstPolicy
    - classifyCommand
    - BLOCKLIST
    - PolicyResult
    - BlocklistRule
  affects:
    - backend/src/safety/command-policy.ts
    - backend/src/safety/classifier.ts
tech_stack:
  added: []
  patterns:
    - TDD RED/GREEN/REFACTOR cycle
    - Pure function safety gate (stateless, no side effects)
    - Segment-split chained-command handling
    - Normalization-before-matching (whitespace collapse, quote strip, unresolvable-variable sentinel)
key_files:
  created:
    - backend/src/tests/safety-policy.test.ts
  modified:
    - backend/src/safety/command-policy.ts
    - backend/src/safety/classifier.ts
decisions:
  - "Classifier does not call validateCommandAgainstPolicy to avoid circular import; command-policy imports classifyCommand and calls it as step 5 after the blocklist pass"
  - "Unresolvable ${VAR} and complex $() wrappers prepend __UNRESOLVABLE__ sentinel and are blocked conservatively (matches SAFETY_POLICY.md §3 guidance)"
  - "Chained commands split on unescaped ;, &&, || before blocklist matching — each segment tested independently, no regex start-anchors"
  - "Refactor pass confirmed no code changes needed: all obfuscation and chaining edge cases already covered"
metrics:
  duration_seconds: 180
  completed_date: "2026-06-06T18:48:30Z"
  tasks_completed: 3
  files_created: 1
  files_modified: 2
requirements_satisfied:
  - SAFE-01
  - SAFE-02
  - SAFE-05
---

# Phase 03 Plan 01: Safety Core (Blocklist + Classifier) Summary

Deterministic safety gate implemented via TDD: `validateCommandAgainstPolicy` (blocklist + normalization + chained-segment splitting) and `classifyCommand` (risk-level assignment) — the two functions every command passes through at proposal and approval time.

## What Was Built

**`backend/src/safety/command-policy.ts`**
- `BLOCKLIST`: 14 named rule categories covering rm-rf-system-paths, disk-wipe, shutdown-reboot, fork-bomb, broad-chmod-chown, disable-security, secret-exposure, hide-tracks, exfiltration, db-destruction, mass-kill, and more. Each rule carries `ruleName` (appears in audit records) and `reason`.
- `normalizeCommand`: collapses whitespace, strips wrapping quotes from tokens, resolves `$(echo literal)` wrappers, returns `__UNRESOLVABLE__` prefix for `${VAR}` / complex subshells.
- `splitSegments`: splits on unescaped `;`, `&&`, `||` so each chain segment is checked independently.
- `validateCommandAgainstPolicy`: normalizes → checks for unresolvable sentinel → splits → tests each segment against every rule → if no match, delegates to `classifyCommand` and returns `{ allowed: true, riskLevel }`.

**`backend/src/safety/classifier.ts`**
- `classifyCommand`: deterministic risk assignment. Precedence: SAFE_READ_ONLY allowlist (systemctl status, journalctl, df, ss, ps, uname, etc.) → LOW_RISK_CHANGE (targeted restart/chown/chmod/mkdir) → MEDIUM_RISK_CHANGE for everything else (including unrecognized commands — never silently SAFE_READ_ONLY per SAFE-02).

**`backend/src/tests/safety-policy.test.ts`**
- 48 tests covering: 30 blocklist patterns, 3 chained-command cases, 3 obfuscation cases, 3 targeted safe variants (not blocked), 6 SAFE_READ_ONLY allowlist checks, 1 unknown-command fallthrough, 1 SAFE-05 recheck.

## TDD Gate Compliance

- RED gate: `test(03-01): add failing tests for blocklist policy and classifier` — all 48 tests failed (stubs exported nothing).
- GREEN gate: `feat(03-01): implement blocklist policy and risk classifier` — all 48 tests pass.
- REFACTOR gate: `refactor(03-01): harden normalization for obfuscation edge cases` — no code changes required; trace-through of all 6 obfuscation/chaining edge cases confirmed existing implementation already handles them. Zero regressions.

## Test Results

```
✓ src/tests/safety-policy.test.ts (48 tests)
Test Files  7 passed | 2 skipped (9)
Tests  156 passed (156)
```

## Commits

| Hash | Message |
|------|---------|
| 0a58836 | test(03-01): add failing tests for blocklist policy and classifier |
| 31b2edb | feat(03-01): implement blocklist policy and risk classifier |
| 31da22d | refactor(03-01): harden normalization for obfuscation edge cases |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript regex backreference in character class**
- **Found during:** Task 2 GREEN, TypeScript type-check pass
- **Issue:** `(?<!\S)(['"])([^\s\1]+)\1(?!\S)` used `\1` backreference inside a character class, which TypeScript's strict ES2022 regex mode rejects with TS1536.
- **Fix:** Replaced with two separate replacements — one for single-quoted tokens, one for double-quoted tokens. Semantically equivalent.
- **Files modified:** `backend/src/safety/command-policy.ts`
- **Commit:** 31b2edb (inline fix, no separate commit needed as it was caught before the GREEN commit)

## Known Stubs

None — all exported functions are fully implemented.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced. All surface is internal pure functions.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `backend/src/safety/command-policy.ts` | FOUND |
| `backend/src/safety/classifier.ts` | FOUND |
| `backend/src/tests/safety-policy.test.ts` | FOUND |
| `.planning/phases/03-safety-layer-run-store/03-01-SUMMARY.md` | FOUND |
| Commit 0a58836 (RED) | FOUND |
| Commit 31b2edb (GREEN) | FOUND |
| Commit 31da22d (REFACTOR) | FOUND |
