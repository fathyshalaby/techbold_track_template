---
status: all_fixed
phase: 03-safety-layer-run-store
source: 03-REVIEW.md
fix_scope: critical_warning
findings_in_scope: 9
fixed: 9
skipped: 0
iteration: 1
created: 2026-06-06
---

# Code Review Fix Report — Phase 03

All 9 review blockers were fixed and merged into the phase branch. The fixer
agent crashed before committing (truncated return, uncommitted edits left in an
isolated worktree); the orchestrator salvaged the complete edit set by committing
it inside the worktree branch (`b524434`) and fast-forward-merging it back, then
fixed one regression the merged change introduced.

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

## Verification

- `tsc --noEmit`: clean
- Full suite: 250 passed, 1 skipped (Phase 5 orchestrator stub), 0 failed
- §9 consolidated safety gate (`safety.test.ts`) green, including all new blocklist categories
