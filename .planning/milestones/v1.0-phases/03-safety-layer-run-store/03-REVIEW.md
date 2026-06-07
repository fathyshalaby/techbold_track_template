---
phase: 03-safety-layer-run-store
reviewed: 2026-06-06T14:30:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - backend/src/safety/command-policy.ts
  - backend/src/safety/classifier.ts
  - backend/src/safety/redaction.ts
  - backend/src/store/schema.ts
  - backend/src/store/db.ts
  - backend/src/store/runs.ts
  - backend/src/store/audit.ts
findings:
  critical: 1
  warning: 0
  info: 2
  total: 3
status: issues_found
---

# Phase 03: Code Review Report (Confirmation Re-Review)

**Reviewed:** 2026-06-06T14:30:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Confirmation re-review targeting the 4 claimed fixes from the prior cycle. Two of the four are
genuinely closed. Two are not — one in the same file that was already flagged (JSONL UPDATE), and
one is a newly-introduced regression in that same fix.

Prior cycle WR-01 (lowercase vars) and WR-02 (`su - root`) are both confirmed closed with no
false-positive regressions. Prior cycle CR-02 (audit payload unredacted) is confirmed closed.
Prior cycle CR-01 (JSONL UPDATE wrong id) was **not fixed** — the fix was applied to the wrong
function, and the correct UPDATE path in `run()` now has a new COALESCE-split regression that
makes approval updates worse than before.

---

## Critical Issues

### CR-01: JSONL UPDATE fix introduced a COALESCE-split regression — approval updates silently corrupt data

**File:** `backend/src/store/db.ts:153–163`
**Issue:** The claimed fix for "id is the last param" was correctly applied inside `run()` at
line 149 (`params[params.length - 1]`). However, the SET-clause parser on line 153 still splits
on every comma:

```typescript
const setParts = setMatch[1].split(',').map((p) => p.trim());
```

`updateApprovalStatus` (the only UPDATE that uses `COALESCE`) has a SET clause of the form:

```
status = ?, edited_command = COALESCE(?, edited_command), final_command = COALESCE(?, final_command), ...
```

Splitting on commas yields 11 parts, not 6. The column-extraction regex `^(\w+)\s*=` only matches
parts that start with a word character, so the `COALESCE(..., col)` tail-fragments (`edited_command)`,
`final_command)`, etc.) produce no column match but still consume a param slot via `setParams[i]`.
The net effect:

| Part | Column matched | Param consumed |
|------|---------------|----------------|
| `status = ?` | `status` ← `params[0]` | correct |
| `edited_command = COALESCE(?` | `edited_command` ← `params[1]` | correct |
| `edited_command)` | none | `params[2]` consumed, value lost |
| `final_command = COALESCE(?` | `final_command` ← `params[3]` | wrong — gets `params[1]` value |
| ... | | |

In practice, for every `updateApprovalStatus` call the JSONL adapter will:
- Set `edited_command` = null (correct only by accident when null is passed)
- Set `final_command` = null (should be the approved/edited command)
- Leave `decided_at` = undefined (undefined stored as null — approval timestamp lost)
- Leave `executed_at` = undefined

A technician approving a command will have that approval silently discarded in the JSONL path.
The run cannot advance past the first approval gate.

The simple UPDATEs in `runs.ts` (`updateRunPhase`, `updateRunStatus`, `markRunCompleted`,
`markRunFailed`, `markRunAborted`) all use plain `col = ?` SET clauses with no COALESCE, so the
id-last fix works correctly for those. The regression is isolated to `updateApprovalStatus`.

**Fix:** Replace the comma-split SET parser with one that counts `?` placeholders rather than
comma-delimited parts, or rewrite `updateApprovalStatus` to avoid COALESCE in the SQL and instead
pass the existing value explicitly from the caller:

```typescript
// Option A: count ? placeholders to pair params correctly
const setParts = setMatch[1].split(',').map((p) => p.trim());
let paramIdx = 0;
const updated = { ...rows[idx] };
for (const part of setParts) {
  const colMatch2 = part.match(/^(\w+)\s*=/i);
  const placeholders = (part.match(/\?/g) ?? []).length;
  if (colMatch2 && placeholders > 0) {
    updated[colMatch2[1]] = setParams[paramIdx] ?? null;
  }
  paramIdx += placeholders;
}
rows[idx] = updated;
```

Option B (simpler, avoids the SQL parsing problem entirely): change `updateApprovalStatus` to use
plain `col = ?` assignments and read-then-write in the caller for the COALESCE semantics.

---

## Info

### IN-01: Redaction misses JSON keys with compound names containing a secret word

**File:** `backend/src/safety/redaction.ts:64`
**Issue:** The `json-token-field` pattern matches an exact set of key names:
`token`, `access_token`, `refresh_token`, `id_token`, `secret`, `password`, `passwd`,
`api_key`, `authorization`, `credential`. Keys like `"phoenix_token"`, `"auth_token"`,
`"api_token"`, `"ssh_key"`, or `"bearer_token"` do not match — the prefix before the word
is not in scope. The `token-field` pattern (`/(token\s*[=:]\s*)\S+/gi`) would catch
`token: value` text but not `"phoenix_token":"value"` because the surrounding double-quotes
and colon are part of the match shape and the key boundary differs.

Confirmed by direct test: `{"phoenix_token":"ph_tok_abcdef123456"}` passes all redaction
patterns unchanged.

This is not a blocker today because Phoenix token is injected server-side via `env.ts` and
should not appear in agent payloads. But if the orchestrator ever logs the Phoenix response
body (which may echo auth context on error), the value would survive redaction.

**Fix:** Broaden the `json-token-field` alternation to use a suffix-match approach:

```typescript
{
  name: 'json-token-field',
  pattern: /("[^"]*(?:token|secret|password|passwd|api[_-]?key|authorization|credential)[^"]*"\s*:\s*)"[^"]*"/gi,
  replacement: '$1"«redacted»"',
},
```

---

### IN-02: `classifier.ts` SAFE_READ_ONLY `cat` pattern does not exclude `/proc/self/environ` or `/etc/passwd`

**File:** `backend/src/safety/classifier.ts:27`
**Issue:** The `cat` allowlist pattern excludes `/etc/shadow`, `/.ssh/`, and `.env` but not
`/proc/self/environ`, `/etc/environment`, or `/etc/passwd`. The policy blocklist in
`command-policy.ts` catches all of these before the classifier is ever reached (blocklist runs
first in `validateCommandAgainstPolicy`), so there is no security impact in the current call
order. However if that order is ever reversed, `cat /etc/passwd` returns `SAFE_READ_ONLY` and
`allowed: true`.

**Fix:** Add the missing negative lookaheads for defence-in-depth:

```typescript
/^cat\s+(?!.*\/etc\/shadow)(?!.*\/.ssh\/)(?!.*\.env)(?!.*\/proc\/self\/environ)(?!.*\/etc\/environment)(?!.*\/etc\/passwd)\S+$/,
```

---

## Confirmed Closed (for the record)

- **Prior CR-02** (audit payload unredacted): Closed. `audit.ts:26` now calls
  `redactSecrets(JSON.stringify(payload))` before the INSERT. Redaction patterns verified against
  bearer tokens, private key blocks, `password=`, `token=`, and JSON-encoded variants — all
  correctly redacted.

- **Prior WR-01** (lowercase shell vars bypass `__UNRESOLVABLE__`): Closed. `command-policy.ts:321`
  now uses `[A-Za-z_][A-Za-z0-9_]*`, catching `$dir`, `$path`, `$cmd`. No false positives found
  on legitimate diagnostic commands (`systemctl status nginx`, `journalctl -u nginx`, `cat /var/log/syslog`,
  `ps aux`, `df -h`, `ls -la /etc/nginx`).

- **Prior WR-02** (`su - root` not blocked): Closed. The new pattern
  `/\bsu\b(\s+-)?(\s+(root|-l|--login))*\s*$/` blocks `su - root`, `su root`, `su -l root`,
  `su --login root`, `su -`, and bare `su`. No false positives on commands containing the letters
  "su" as a substring (`grep sudo`, `systemctl status`, `ls /usr/share`, `getfacl /var/www`).

---

_Reviewed: 2026-06-06T14:30:00Z_
_Reviewer: Kiro (gsd-code-reviewer)_
_Depth: standard_
