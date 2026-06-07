---
status: all_fixed
phase: 03-safety-layer-run-store
source: 03-REVIEW.md
fix_scope: critical_warning
findings_in_scope: 14
fixed: 14
skipped: 0
iteration: 3
created: 2026-06-06
---

# Code Review Fix Report — Phase 03

All review findings across three review cycles were fixed and committed to the
phase branch. The first fixer agent crashed before committing (truncated return,
uncommitted edits left in an isolated worktree); the orchestrator salvaged the
complete edit set by committing it inside the worktree branch (`b524434`) and
fast-forward-merging it back. Two subsequent confirmation re-reviews caught
regressions the fixes themselves introduced — each was fixed in turn, and a
regression test was added for the JSONL fallback path that had no coverage.

## Findings Fixed

| ID | Category | Fix |
|----|----------|-----|
| CR-01 | Blocklist bypass — long-form rm flags | Added `--recursive`/`--force` (both orders) and `--recursive`-alone rules for system/data paths in `command-policy.ts` |
| CR-02 | Blocklist bypass — netcat exfiltration | Block all `nc`/`netcat`/`ncat` usage (not just `-e`); split command segments on single `\|` so `cat /etc/passwd \| nc …` is caught |
| CR-03 | Privilege escalation | New `privilege-escalation` rule: `sudo su`/`sudo bash`/`sudo -i`/`sudo -s`, `su -` |
| CR-04 | Reverse shell | New `reverse-shell` rule: `/dev/tcp/`, `bash … >& /dev/…`, inline-interpreter one-liners (`python -c`, `perl -e`, `ruby -e`) |
| CR-05 | Secret exposure gaps | Block `cat /proc/self/environ`, `~/.env`, `/etc/environment`, `/etc/passwd`, and bare `printenv`/`env` |
| CR-06 | Setuid/setgid bit | New `setuid-setgid` rule: `chmod +s` and numeric setuid/setgid modes (2xxx/4xxx/6xxx/7xxx) |
| CR-07 | Redaction leaks | Added colon (`key: value`) and lowercase env-var formats, custom secret-bearing HTTP headers (`X-*-Token:`), and `access_/refresh_/id_` token JSON variants in `redaction.ts` |
| CR-08 | Truncated PEM not redacted | `private-key-block` pattern now matches `BEGIN … (END or end-of-string)` so a key truncated at the 16 KB cap is still redacted |
| CR-09 | Audit mutability | SQLite `BEFORE UPDATE`/`BEFORE DELETE` triggers on `audit_events` (RAISE ABORT) + JSONL adapter guard rejecting `UPDATE`/`DELETE audit_events` — append-only now enforced, not convention |

## Regression Introduced and Fixed

Adding single-pipe (`|`) splitting for CR-02 broke the `curl … | sh` / `wget … | sh`
exfiltration rules, because each side of the pipe was then validated in isolation and
the pipe-to-shell pattern never saw the whole string (4 failing tests).

Fix (`2659cb6`): `validateCommandAgainstPolicy` now checks the blocklist against the
**full normalized command** first (catches pipe-to-shell), then against each split
segment (catches chained dangerous commands like `echo hi; rm -rf /etc`). Both
detection needs are satisfied without conflict.

## Second Review Cycle — New Blockers from the Fixes

The confirmation re-review found two new blockers introduced by the CR-01..CR-09 fixes:

| ID | Category | Fix |
|----|----------|-----|
| CR-02b | Audit payload unredacted | `appendAuditEvent` wrote `JSON.stringify(payload)` straight to `audit_events.payload_json`. Now redacts via `redactSecrets` before write (`3636f74`) — closes the rubric-C hard-fail risk of secrets in the audit log. |
| CR-01b | JSONL UPDATE wrong id binding | `extractWhere` returned `params[0]` but UPDATEs put the WHERE id last. Fixed to `params[params.length - 1]` (`3636f74`). |

Two safety warnings also closed (`b5604c5`): `su - root` / `su root` now blocked
(rule was anchored to `su -$`), and lowercase shell variables (`$dir`, `$cmd`) now
trip the `__UNRESOLVABLE__` conservative-block gate (pattern was `$[A-Z_]` only).

## Third Review Cycle — Incomplete COALESCE Fix

The CR-01b id-binding fix was correct, but the JSONL SET-clause parser still split
on every comma — and `updateApprovalStatus` uses `COALESCE(?, col)` expressions whose
internal commas produced 11 fragments for 6 placeholders, misaligning every param.
Approval decisions silently vanished in the JSONL fallback path (which had zero test
coverage).

Fix (`d692988`): the SET parser now matches each `col = <expr-with-one-?>` assignment
directly via regex, handling both plain `?` and `COALESCE(?, col)` forms (null param →
keep existing value, matching SQL semantics). Added `store-jsonl.test.ts` with 3
regression tests exercising the COALESCE UPDATE path, the audit append-only guard, and
INSERT/GET round-trips.

A final Info item was also closed (`970f700`): the `json-token-field` redaction pattern
now matches any JSON key containing a secret-indicator word (`phoenix_token`, `auth_token`,
`ssh_key`), not just an exact key set.

## Verification

- `tsc --noEmit`: clean
- Full suite: 253 passed, 1 skipped (Phase 5 orchestrator stub), 0 failed
- §9 consolidated safety gate (`safety.test.ts`) green, including all new blocklist categories
- New `store-jsonl.test.ts` covers the previously-untested JSONL fallback UPDATE path
