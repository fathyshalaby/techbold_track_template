# AUDIT LOG — issues found, repairs, and upgrade considerations per phase

A running record of every problem caught during the post-build audit of each GSD phase, how it was
repaired (with commit + verification), and every upgrade/warning surfaced by the research pass (applied,
declined-with-reason, or deferred). Maintained on `main` so it travels with the merged code.

**Process per phase:** GSD builds a phase on its branch → it merges to `main` → we run two passes:
(1) a **domain / ops / test-architect audit** (find & repair faults), and (2) a **research / reuse-&-standards
audit** (find upgrades; adopt only what genuinely adds value). Repairs are verified by running the suite and
propagated to both the phase branch and `main`.

> Severity: 🔴 correctness/security (would break the real run or score) · 🟠 quality/robustness · 🟢 nice-to-have.
> Recurring theme: GSD's per-phase gate is real but exercises the **mock** — several 🔴 faults only bite the
> **real ERP/VM** ("works in mock" trap). That gap is what this audit loop exists to close.

---

## Phase 1 — Repo Foundation  (`gsd/phase-01-repo-foundation` → `main`)

Scaffolding only (Node/Hono toolchain, env, health, mock-mode, Docker). No ERP/Linux domain logic yet.

### Issues found & repaired
| # | Sev | Issue | Repair | Commit |
|---|---|---|---|---|
| 1 | 🔴 | Env contract drift + **`SSH_USERNAME` missing entirely** (Phase-4 SSH couldn't connect); `.env.example` had a fake URL | Renamed to `PHOENIX_API_BASE_URL`, `SSH_PRIVATE_KEY_PATH`; added `SSH_USERNAME=azureuser`; set verified URL `http://68.210.101.85:8000` | `e2b216b` |
| 2 | 🔴 | Couldn't boot offline under `MOCK_MODE` — creds were unconditionally required (broke PLAT-04) | Credentials required **conditionally** via Zod `superRefine` (real mode only) | `e2b216b` |
| 3 | 🟠 | `onError` returned raw `err.message` → internal/secret leak | Log server-side, return generic message; exported `errorHandler` (testable) | `e2b216b`, `fec2b31` |
| 4 | 🟠 | `booleanFromString` accepted only literal `'true'` (silent mock-off) | Accept `true/1/yes/on` (case-insensitive) | `e2b216b` |
| 5 | 🟠 | `PORT` read raw (`NaN` risk) | Validated/coerced via env schema | `e2b216b` |
| 6 | 🟠 | Unsafe default: `.env.example MOCK_MODE=false` → fresh clone could hit live ERP with a placeholder token | Default `MOCK_MODE=true` (boots offline; flip for real runs) | `fec2b31` |
| 7 | 🟠 | No graceful shutdown (risk once SQLite audit/SSH land in Phase 3) | SIGTERM/SIGINT handler (`server.close` + 5s force-exit) | `fec2b31` |
| 8 | 🟠 | Phase-1 deliverables (health, error handler) untested | `app.test.ts`: health test + **onError-no-leak regression test** | `fec2b31` |
| 9 | 🔴 | Local-dev `.env` not loaded — `dev`/`start` were `tsx src/index.ts` → `pnpm dev` ran unconfigured | `node --env-file-if-exists=../.env --import tsx [--watch] src/index.ts` (built-in loader, zero deps) | `2d4972d` |
| 10 | 🟠 | Container ran as **root**; no HEALTHCHECK (CIS Docker Benchmark 4.1) | `USER node` + `HEALTHCHECK` via Node built-in `fetch` (slim has no curl) | `2d4972d` |

**Verification:** env + app suites **23/23**; real boot test — backend starts via the new invocation, `GET /health` → `{status:"ok",mode:"mock"}`. Merged to `main` `d01313d`.
**Caveat:** graceful shutdown (Windows can't deliver SIGTERM to native node) and the non-root Dockerfile need one `docker compose up` on a Docker host to fully confirm — correct by construction, unverifiable on the dev host.

### Research / upgrade considerations
- **Adopted:** Node built-in `--env-file` for local-dev loading (#9).
- **Declined (over-engineering now):** `pino` structured logging · `/ready` readiness endpoint · IETF `health+json` format · shutdown libs (`terminus`/`lightship`) · base-image digest pin.
- **Open / to reconcile later:** AI SDK pinned `ai@^4.3.16` (v4) vs docs' v5/v6 — reconcile **before Phase 5** · `.npmrc minimum-release-age=0` weakens pnpm supply-chain age check (deliberate native-build workaround) · frontend `npm` vs `pnpm-workspace` inconsistency.
- **Honest meta:** GSD's Phase 1 was fundamentally fine (5/5 gate legit). Of the above only #1 (`SSH_USERNAME`) and #9 (local `.env`) were genuinely *needed*; the rest is hardening/polish. Phase 1 has ~0 bearing on the score (B+C = Phases 3–7).

---

## Phase 2 — ERP Client + Ticket Routes  (`gsd/phase-02-erp-client-ticket-routes` → `main`)

First phase with real domain content: a resilient REST client consuming the Phoenix ERP + ticket routes.

### Issues found & repaired
| # | Sev | Issue | Repair | Commit |
|---|---|---|---|---|
| 1 | 🔴 | `tickets.ts` read `env.PHOENIX_API_URL` — undefined after the Phase-1 rename → real `PhoenixClient` got an undefined base URL → **every real Phoenix call broken** (mock tests stayed green) | Fixed to `env.PHOENIX_API_BASE_URL` | `b7261f9` |
| 2 | 🔴 | `Ticket`/`SystemInfo`/`CustomerSystem` schemas used `.strict()` → reject unknown fields. The live Phoenix exposes more than the documented OpenAPI, so one extra field → `parse()` throws → 502 → **zero tickets/customer-system load** (only vs the real grader) | Switched to default-strip (validate required, tolerate+drop extras = Postel's law); rewrote the 2 "strict boundary" tests to assert stripping | `b7261f9` |
| 3 | 🔴 | `fetchWithRetry` retried **POST** on network error → `createActivity` could create a **duplicate ERP activity** after a lost response | Retry **only idempotent (GET)** requests; POST never retried; + regression test (POST net-error → 1 fetch). Satisfies **ENG-07** | `ede4b12` |
| 4 | 🟢 | No visibility into ERP calls for live debugging | Redacted request logging: `[phoenix] METHOD path -> status (Nms)` — never token/headers/body | `ede4b12` |

**Verification:** full backend suite **109/109** (isolated runs). Merged to `main`: `af45233` (repairs 1–2), `ae2c785` (upgrades 3–4).

### Research / upgrade considerations
- **Strategic (not now):** the client + Zod schemas were hand-written from `phoenix-openapi.yaml`; **OpenAPI codegen** (`openapi-typescript`+`openapi-fetch` / Orval / `openapi-zod-client`) keeps them contract-synced and would have prevented the drift bugs (#1, the `.strict()` choice). Not worth replacing a working, tested client mid-hackathon — use for future/larger API surfaces.
- **Declined (over-engineering for a single-team mock):** resilience libs (`ky`/`got`/`cockatiel`) · circuit breaker · exponential backoff + jitter · 429/`Retry-After` handling · RFC 9457 `application/problem+json` error format.
- **Noted, acceptable (not fixed):** int64 IDs as `z.number()` (real IDs are small, within `MAX_SAFE_INTEGER`) · mock still mutates the shared `MOCK_TICKETS` fixture (tests reset it in `beforeEach`) · `getCustomer` (`/customers/{id}`) unimplemented (unscored, best-effort).
- **Adjacent knowledge referenced:** Nygard *Release It!* (integration points = #1 instability) · Enterprise Integration Patterns / Anti-Corruption Layer (the client *is* an ACL) · Postel's Law.

---

## Phase 3 — Safety layer (command policy gate · classifier · redaction)

**Audited:** `backend/src/safety/{command-policy,classifier,redaction,risk-levels}.ts` + their tests. Lens: adversarial red-team (treat the gate as an attacker would) + scoring lens (C = safety/audit, 20% — and a single secret-exposure / destructive command auto-approved is a **hard-fail that zeros the incident**).

### Issues found & repaired (commit `6a62e7c`, on `main`)
Adversarially proved **15 dangerous commands bypassed** `validateCommandAgainstPolicy` — several classified `SAFE_READ_ONLY` (i.e. auto-approvable while reading secrets). All now `HIGH_RISK_BLOCKED`.

1. **Embedded-quote obfuscation defeated the literal blocklist.** `cat /etc/sh''adow`, `cat /etc/sh"a"dow`, `r"m" -rf /etc` slipped through because `normalizeCommand` only stripped *wrapping* quotes per token. → Now strips **all** quote chars (`result.replace(/['"]/g, '')`) for detection only; the original command is what executes.
2. **Secret-file rules keyed only on `cat`.** Any other reader/verb/flag/redirect touching a secret path was allowed: `grep . /etc/shadow`, `head -n 5 /etc/shadow`, `tac`, `cat -n`, `cat < /etc/shadow`, `xxd`, `cp /etc/shadow /tmp/x`, `/etc/gshadow`, SSH host keys, `id_*` private keys, `/proc/self/environ`, `.env`/`/etc/environment`. → Added **path-based `secret-file-access` rules** that block ANY command referencing those paths regardless of verb.
3. **`ufw disable` bypassed by a flag.** `ufw --force disable` matched neither `/\bufw\s+disable\b/`. → Made flag-tolerant (`/\bufw\b[^;&|]*\bdisable\b/i`) and added `service <ufw|firewalld|auditd|apparmor|fail2ban> stop`.
4. **Log truncation via redirect.** `> /var/log/auth.log`, `: > /var/log/syslog` wipe the audit trail but only `truncate`/`journalctl --vacuum` were caught. → Added `>\s*/var/log/` redirect rule.

**Verification:** added **17 permanent regression tests** (`safety-policy.test.ts` → `audit regression` block) covering every proven bypass; full safety suite **142 → 159 passing**; re-ran the adversarial proof harness — all 15 now blocked, then deleted it. Targeted-safe variants (`chmod 755 /srv/app/uploads`, `systemctl restart nginx`) confirmed still allowed (no over-blocking).

### Considerations (research/upgrade lens)
- **Declined (over-engineering):** full shell-AST parsing (`bash -n` / tree-sitter) to defeat *every* obfuscation — the strip-and-match approach + "unknown ⇒ MEDIUM, never SAFE" default + mandatory HITL covers the realistic threat surface for graded VMs; a parser is a large dependency + new attack surface for marginal gain.
- **Noted, acceptable:** base64/`$(...)`/`eval` indirection isn't decoded — but such commands classify `MEDIUM_RISK_CHANGE` (never auto-approved), so a human still gates them. Documented as the intended backstop, not a hole.
- **Strength confirmed:** redaction's 16 KB output cap + secret regexes, and the deny-list-then-classify ordering, are sound; `classifyCommand` correctly fails closed to MEDIUM for unknown verbs.

### Phase 3 — Deep Audit (test strategy & regression-prevention pass, commit `eeb392b`)
Second pass with a different lens: *test strategy, invariants, and regression prevention* (the "Repository Deep Audit" prompt) rather than pure red-team. Code treated as source of truth.

**Executive summary.** The safety layer is the cheapest, highest-leverage code in the repo: 4 pure-function modules (~560 LOC) that directly own the C-score (20%) and the hard-fail gates. It is now well-defended at the `validateCommandAgainstPolicy` boundary (166 passing tests) and has no external dependencies, no I/O, and no state — so it is fully unit-testable and deterministic. The one real defect this pass found was a *contract* gap, not a logic gap.

**New issue found & fixed — classifier fails open for standalone callers (commit `eeb392b`).**
`classifyCommand` is `export`ed and was classifying the **raw** string. Today it is only ever reached *after* the blocklist (inside the gate), so it is safe in the current call graph — but it is a latent landmine for Phase 5/6: the architecture has the orchestrator/approvals route attach a risk badge per command and contemplates an auto-approve tier keyed on `SAFE_READ_ONLY`. Proven (probe): standalone `classifyCommand("cat /etc/sh''adow")` and `classifyCommand("cat $SECRETFILE")` both returned `SAFE_READ_ONLY` → an auto-approve tier would silently run a secret read = C hard-fail. **Fix:** `classifyCommand` now fails safe independently of the gate — unresolved shell expansion (`$VAR`/`${VAR}`/`$()`/`` ` ``) forces `MEDIUM_RISK_CHANGE`, and quotes are stripped before the anchored allowlist match. Clean read-only commands still classify `SAFE_READ_ONLY`. +7 regression tests (159 → 166).

**Invariants now asserted (the things that must never break):**
1. No command reaching a secret path (`/etc/shadow|gshadow`, SSH host/`id_*` keys, `/proc/*/environ`, `.env`) is ever `allowed`, by any verb/flag/quote/redirect.
2. No destructive/irreversible command (`rm -rf` system paths, `mkfs`/`dd`, fork bomb, `DROP`/`TRUNCATE`, mass-kill, shutdown) is ever `allowed`.
3. No security-control-disabling command (ufw/iptables/auditd/apparmor/fail2ban/SELinux) is ever `allowed`.
4. Unknown verbs and any unresolved expansion classify **≥ MEDIUM** — `classifyCommand` never returns `SAFE`/`LOW` for something it cannot fully see (fail-safe), enforced both at the gate and now standalone.
5. Redaction is idempotent and never *lowers* protection; output is capped (16 KB) before persistence; redaction runs at the audit sink (`store/audit.ts`) on both payload and command.

**Test gap analysis.** Current 166 tests are all **L1 unit** and cover the blocklist, classifier allowlist, chaining, obfuscation, and redaction patterns well. Gaps (all *deferred*, none blocking Phase 3):
- **No property-based / fuzz tests.** The blocklist is regex-heavy; example-based tests only prove the cases we imagined. *Recommended add:* `fast-check` generators for (a) secret-path + random verb/flag permutations ⇒ always blocked, (b) random whitespace/quote insertion into a known-bad command ⇒ stays blocked. This is the single highest-value test upgrade and is cheap. **Deferred** to a focused hardening pass (not before freeze unless time allows).
- **No L2 integration test** that the orchestrator/approvals route actually *calls* the gate on the post-edit command (the "re-check after human edit" invariant). Cannot exist yet — orchestrator lands Phase 5/6. **Owner: Phase 6 audit** — add a test that an edited command is re-validated and a blocked edit cannot execute.
- **No golden-master** for redaction output. Low value for 4 modules; the per-pattern assertions suffice. **Declined.**

**Risks (ranked).**
- *Medium:* regex blocklist is inherently enumerative — a novel obfuscation not yet imagined could pass the gate as MEDIUM (never SAFE) and still requires human approval, so it is a defense-in-depth gap, not a hard-fail. Property-based tests shrink this.
- *Low:* `REDACTION_CAP_BYTES` slices by JS string length (UTF-16 code units), not bytes, despite the name — modest miscount on multibyte output, no security impact (cap only ever drops trailing content, which fails safe). Noted; rename deferred.
- *Low:* base64/`eval` indirection still undecoded — classifies MEDIUM, human-gated. Accepted.

**Research (justified, not cargo-culted).**
- `fast-check` (property-based testing) — mature, zero-runtime-dep, used widely for exactly this "invariant holds for all inputs" shape. **Adoption justified** for the blocklist; deferred only on time.
- `shell-quote` / `tree-sitter-bash` (real shell parsing) — would defeat *all* obfuscation classes, but pulls a parser + new attack surface and is overkill given the MEDIUM-floor + mandatory HITL backstop. **Declined** (consistent with the red-team pass).
- Atomic Red Team / GTFOBins as a corpus of LOLBins to seed more blocklist cases — **worth a one-time mining pass** for the hardening sprint; not a dependency.

**Verdict.** No feature bloat, no dead code, no premature optimization in the safety layer — it is appropriately minimal for the rubric. One latent contract bug fixed; remaining items are deferred test-depth upgrades, correctly scoped to the phases that introduce their call sites.

### Phase 3 — Ops Audit (senior Linux/ERP technician lens, commit `4056445`)
Third pass with the *"understand the manual repair first, then check the automation matches expert behaviour"* lens (veteran sysadmin / ERP ops). The first two passes hunted **under-blocking** (security hard-fails). This pass hunted the opposite failure that those miss: **over-blocking legitimate repairs**, which silently destroys the B-score (troubleshooting, 35%) by making real incidents unfixable.

**Manual-process baseline.** How a senior tech fixes the top Linux-service incidents on a fresh VM: *service down* → `systemctl status` / `journalctl -u` → fix config (`nginx -t` then reload/restart); *disk full* → `df -h`, `du -sh`, then `logrotate -f` / `gzip` / move a file / delete a *specific* file; *permission denied on web root* → `chown -R <svc-user> /var/www/...` + `chmod -R 755 ...`; *port not listening* → `ss -tulpn`, check bind/firewall. The gate must permit these (gated to human approval), not hard-block them.

**Issue found & repaired — recursive chmod/chown over-block (commit `4056445`).**
Proven by probe: **6 of the most common legitimate permission repairs were `HIGH_RISK_BLOCKED`** (not even human-approvable), including `chown -R www-data:www-data /var/www/html`, `chown -R nginx:nginx /var/lib/myapp`, `chmod -R 755 /var/www/html`, `chown -R user:user /home/user/app`. The old rules blocked *any* recursive chmod/chown under `/var|/home|/srv|/usr` — but application code/data lives exactly there. Per the hackathon hard-fail list, only `chmod 777` is a hard-fail; the rest is normal expert work. **Fix:** reworked to block only the genuinely dangerous shapes — `777` anywhere; chmod/chown on `/` or a *bare* top-level dir; recursive chmod/chown under a critical system tree (`/etc /boot /bin /sbin /lib /root /dev /proc /sys`, `/usr` except `/usr/local`), anchored to the top-level path component so `/var/lib/<app>` is not falsely caught by the `/lib/` substring. App-path repairs now classify `MEDIUM` (human-approved, never auto-run). **+22 regression tests** (allowed-repairs + dangerous-still-blocked); suite 166 → 188; all prior hard-fail blocks re-verified intact.

**Automation-vs-expert gaps documented as accepted (not bugs):**
- **Disk-full via logs has no *destructive* automated path — by design.** `truncate`/`> /var/log/...`/`rm /var/log/...`/`journalctl --vacuum-*` are all blocked as the log-wiping hard-fail. This is correct for the rubric, but it means the *destructive* expert remedy is unavailable. The **non-destructive** expert remedies survive and are the intended path: `logrotate -f`, `gzip <log>`, `mv <log> <other-vol>` (all allowed → MEDIUM). Operators/demo must know to use these; a pure "journal is full" incident may require a human acting outside the tool.
- **`find … -delete` and `rm -rf` are blocked even on `/tmp`.** Conservative (these are the classic footguns); scratch cleanup is done via specific `rm <file>` or `find … -print` then targeted removal. Accepted.
- **`env`/`printenv` and inline interpreters (`python3 -c`) blocked.** Slightly aggressive but defensible (env dumps secrets; `-c` = arbitrary code). Expert alternative for service env: `systemctl show <svc> -p Environment` (allowed). Accepted.
- **Leading `sudo` demotes read-only diagnostics from SAFE to MEDIUM** (anchored allowlist). Harmless (just more approvals); on a sudo-required VM, SAFE auto-approve rarely fires. *Consideration:* strip a leading `sudo ` before classifying if an auto-approve tier ever lands (tied to the R0/unattended-grading question). Deferred.

**Operational risk register (failure modes a tech would watch):**
- *Misleading truncated reads:* `cat <huge log>` is SAFE but the 16 KB redaction cap (and the Phase-4 executor cap) keep the **head**; real errors are at the **tail**. Agent prompt + executor must prefer bounded tail reads (`tail -n`, `journalctl -n`). **Carry-forward to Phase 4/5.**
- *Hang on follow commands:* `tail -f`, `journalctl -f`, `ping` (no `-c`) never return — needs the Phase-4 per-command timeout. **Carry-forward to Phase 4.**
- *Validation after fix:* the gate doesn't verify a repair worked (`systemctl is-active`, re-curl) — that's the validator agent's job. **Carry-forward to Phase 5.**

**Verdict.** The layer now matches expert behaviour in both directions: it blocks what a careful tech would never run unguarded, and permits (under approval) what a tech routinely does to fix incidents. No remaining over-blocks on core repair workflows; residual blocks are deliberate hard-fail boundaries with documented safe alternatives.

### Phase 3 — Research / Reuse Audit (OSINT & adjacent-knowledge lens, commit `8242bd9`)
Fourth and final Phase-3 pass with the *"discover everything that already exists before building"* lens — treat the custom safety layer as guilty until proven necessary, and borrow accumulated industry/community knowledge instead of re-deriving it.

**Is the custom gate justified, or reinvention?** *Justified — with external validation.* The pattern we built (a deterministic runtime layer that intercepts every proposed command and returns permit / deny / defer-to-human) is exactly what the 2025 agent-security literature and the **OWASP Agentic Top 10** converge on ("runtime enforcement intercepts tool calls before execution… deterministic permit/deny/defer; prompt guardrails are suggestions, not enforcement"). The **allowlist-for-auto-approve + blocklist-for-deny + MEDIUM-default** shape matches the documented least-privilege best practice for restricted command execution (RHEL sudo hardening: "allowing specific commands is more secure than disallowing"). Off-the-shelf alternatives were considered and **declined for the hackathon**: restricted shells (`rbash`) are trivially escaped; full sandboxing (seccomp/AppArmor/SELinux/`bubblewrap`/Firejail) governs *our* process, not commands on the *remote* VM, so they don't fit the SSH-executor model; a generic policy engine (OPA/Rego) is real infra overhead for ~25 rules. **Conclusion: keep the custom gate; reuse the corpora, not a framework.**

**Issues found & repaired — borrowed-corpus gaps (commit `8242bd9`).** The deny-list caught wrapped commands only when the *inner* payload was itself blocklisted (substring matching); a tool-based exec escape with a benign-looking inner command slipped through to MEDIUM. Sourced concrete gaps from **GTFOBins** (curated LOLBin corpus), **MITRE ATT&CK T1059** (command/scripting interpreter), and **gitleaks/trufflehog** secret rulesets:
- `socat` (reverse/bind shells, tunnels) — was MEDIUM → now blocked wholesale (like `nc`).
- `node -e/-p/--eval/--print`, `php -r`, `lua -e` — added to the inline-interpreter rule next to python/perl/ruby.
- `awk/gawk/mawk 'BEGIN{system(...)}'` — the canonical GTFOBins exec escape; was MEDIUM → blocked.
- `/dev/udp/` reverse shell — literal-rule symmetry with `/dev/tcp/`.
- **Redaction:** standalone **JWT** (`eyJ….eyJ….sig`) — borrowed gitleaks pattern; catches a bare token in a log/config not prefixed by `Bearer`.
Legit text-processing (`awk '{print $1}'`), app start (`node server.js`), and dotted identifiers (`service.unit.name`) verified unaffected. **+13 regression tests; suite 188 → 201.**

**Reuse opportunities evaluated & declined (with reason):**
- **Adopt a secret-scanning lib as a dependency** (gitleaks/detect-secrets) rather than hand-rolled regexes — declined: those are CLI/Go tools or heavier Python deps; we *borrowed the high-value patterns* (JWT) instead, keeping the layer dependency-free and deterministic. Revisit only if secret surface grows.
- **`shell-quote`/`tree-sitter-bash` real parsing** — re-confirmed declined (consistent across all four passes): parser + attack surface for marginal gain over strip-and-match + MEDIUM-floor + HITL.
- **OPA/Rego, restricted shells, seccomp/AppArmor/Firejail** — wrong layer or disproportionate (see above).

**Adjacent-knowledge borrowed (Nebenwissenschaft):** *Reliability eng.* — fail-safe defaults (unknown ⇒ MEDIUM, never SAFE) = the "fail closed" principle. *Cybersecurity* — defense-in-depth (deny-list ∧ classifier ∧ redaction ∧ HITL), least privilege, LOLBin/living-off-the-land awareness. *Decision science / HCI* — the four-tier risk ladder mirrors graded-autonomy / human-in-the-loop escalation; the residual `sudo`-demotes-to-MEDIUM friction is a deliberate safety-over-throughput trade. *Auditability* — append-only redacted trail = traceability/explainability for the C-score.

**Strategic recommendations (ranked):** (1) *Quick win, deferred:* property-based fuzz over the deny-list (`fast-check`) — already logged. (2) *Quick win:* periodically diff our rules against the GTFOBins list as a corpus (one-time mining done this pass; re-mine if rules grow). (3) *Strategic:* if an unattended/auto-approve tier ever lands (R0), revisit `sudo`-stripping and a tighter SAFE allowlist — tie to the mentor R0 answer. (4) *Hidden risk:* the gate governs the *command*, not the *remote effect* — a human still owns the blast radius; keep the approval UX showing the matched rule + risk tier so approvals are informed.

**Verdict.** The custom safety layer is the correct build (validated against OWASP/industry practice), now hardened with the community's accumulated LOLBin/secret knowledge rather than only our own imagination. Four independent lenses (red-team under-block, test-strategy/contract, ops over-block, research/reuse) have now exercised it; 201 tests green.

*Sources: [GTFOBins](https://gtfobins.org/) · [OWASP Agentic Top 10 / agent-security literature](https://arxiv.org/pdf/2605.24309) · [RHEL sudo hardening](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/security_hardening/managing-sudo-access) · gitleaks/trufflehog secret rulesets.*

---

# Phase 4 — SSH executor (`ssh/{client,executor,factory,mock,types}.ts`, `ai/tools/ssh-tools.ts`)

**Audited:** `gsd/phase-04-ssh-executor` @ `ac59e16`. Lens: completeness/critical-path + "works-in-mock, breaks-on-real". Then **completed and landed on `main`** (merge `3d67a74` + impl `1d811fd`).

### Headline finding — the phase was incomplete (executor unimplemented)
The branch shipped the executor **test spec** (`ssh-executor.test.ts`, 244 lines — excellent) and the **mock** (`mock.ts`, 14/14 green), but `ssh/executor.ts` was still a stub (`export {}`). The phase's own `04-04-SUMMARY` admitted it: *"271 pass, 13 fail — pre-existing RED state from the 04-02 executor stub."* This is the single critical-path component for the B-score (acting on a real VM); without it only mock mode works. Plans `04-03` (preflight) and `04-05` (tools factory) were also unexecuted (no summaries). **Decision (with user): implement the full phase + land on `main` with no regressions.**

### What was good (kept as-is)
`types.ts` clean (`CommandResult` matches ARCHITECTURE §3; `SshConnectionError` with ES5 prototype fix). `mock.ts` solid — 11 fixtures driving the full diagnose→fix→validate loop, zero `ssh2` import, identical interface to real. The RED spec encoded the right contract (5-key result, per-stream 16 KB cap, 30 s timeout, `bash -lc`, `LANG=C`, anti-pattern A1 guard).

### Issues found & repaired (commit `1d811fd`, on `main`)
1. **🔴 Real executor missing → implemented.** `ssh/client.ts` `openSshConnection()` (fresh key-auth, 10 s connect timeout, `SshConnectionError`, key path/bytes never logged, tolerant key read). `ssh/executor.ts` `executeApprovedCommand()` (`bash -lc` wrap + `LANG=C`, per-stream 16 KB cap = `REDACTION_CAP_BYTES`, 30 s timeout that **kills the channel and resolves `timedOut:true` — never hangs**, exact 5-key shape, returns RAW output so the caller redacts) + `runPreflight()` (`sudo -n true`/`LANG=C`/PATH; sudo failure **non-fatal** per G7) + `RealSshExecutor`/`createRealSshExecutor`. `ssh/factory.ts` `createSshExecutor()` selects mock/real via `resolveClientMode('ssh')` (mirrors phoenix). `ai/tools/ssh-tools.ts` `proposeSshCommand` tool with **no `execute`** — `executeApprovedCommand` intentionally absent here (anti-pattern A1).
2. **🟠 Test-harness bug that hid the gap → fixed.** The ssh2 mock delivered the channel *after* its `data`/`exit`/`close` emits (a `process.nextTick` race), so any real executor's listeners attached too late and never saw `close` → infinite hang (13 tests × 5 s timeout = 65 s). Because GREEN was never implemented, nobody caught it. Fixed the mock to deliver the channel synchronously, matching real ssh2 (callback first, then stream events).
3. **🟠 Non-portable guard tests → fixed.** Both guards used `execSync('grep … 2>/dev/null || true')` (bash-only; threw under Windows `cmd.exe`, green only on Linux/CI). Replaced with a cross-platform `fs` recursive scan (excludes comment lines).
4. **🟡 Spec gaps → filled.** Added `runPreflight` tests (sudo-ok and sudo-unavailable-non-fatal) and a connection-failure test (`SshConnectionError`). The mock's `DEFAULT_FALLBACK_RESULT` returning `exitCode 0` (could mask "command not found" in an offline demo) is **noted, accepted** (mock-only).

**Verification:** full backend suite **346 pass / 0 fail / 1 skipped** (was 13 RED), **`tsc --noEmit` clean**, SSH tests 33/33. Merge brought Julian's types+mock+planning into `main` with **no conflict** with the Phase-3 safety fixes (`socat` etc. confirmed intact). Native `better-sqlite3` build needs the Docker toolchain locally (pre-existing env limitation, not a regression).

### Considerations (research/upgrade lens)
- **Connection reuse:** stateless fresh-connect-per-command is correct for v1 (matches the one-approval-one-exec gate); pooling explicitly deferred. Sound.
- **Carry-forward now partly addressed:** the 30 s channel-kill timeout resolves the earlier "follow/stream commands hang" risk (`tail -f`, `journalctl -f`, `ping` without `-c`) at the executor level — they now time out cleanly rather than hanging the run.
- **Still open for Phase 5/6:** the executor returns RAW output **by design** — the orchestrator MUST call `redactSecrets()` before audit/SSE/UI/model (the redaction-at-sink invariant); add an integration test for that when the call site lands. Bounded *tail* reads should be steered by the agent prompt (a `cat` of a huge log returns a truncated head).

### Phase 4 — Deep Audit (test strategy & regression-prevention pass, commit `1e6b804`)
Second pass with the *test-strategy / regression-prevention* lens (the "Repository Deep Audit" prompt), now that the executor is implemented and on `main`. Code treated as source of truth.

**Executive summary.** The executor is small (~125 LOC), pure-logic except the ssh2 boundary, and on the **B-score critical path** (it is what acts on a real VM). No production defect found this pass — the implementation matches the spec and the architecture (raw output, caller redacts; never a model tool; fail-safe timeout). The real gap was in the **regression net**: the contract was under-pinned by tests, so future edits could silently break remote execution.

**Invariants asserted (must never break):**
1. `wrapCommand` produces a single, correctly single-quoted `bash -lc '<cmd>'` argument for ALL inputs (incl. embedded `'`), and never expands/strips metacharacters at wrap time — a broken wrap silently corrupts *every* remote command.
2. The command's true exit code (incl. nonzero, e.g. `systemctl status` → 3) reaches the result; `timedOut` distinguishes a kill from a real exit.
3. Output is capped to `REDACTION_CAP_BYTES` per stream while **preserving the leading bytes** (not emptying/garbling), and passes through unchanged when under the cap.
4. The executor never hangs (30 s channel-kill → `timedOut:true`) and never crashes on a post-ready connection error (the connect error listener stays attached and absorbs it).
5. **Mock ≡ Real contract:** both `SshExecutor` impls return identical key sets for `executeApprovedCommand` and `runPreflight`, so `resolveClientMode` can swap them with zero other change.

**Repairs (tests added, commit `1e6b804`).** +10 tests: `wrapCommand` quoting (plain / embedded-quote / metachar / shape), nonzero exit-code + stderr propagation, output-cap **content** (head preserved) + under-cap passthrough, and **mock/real parity** for both methods. SSH suite **33 → 43**; full backend suite unaffected (test-only change). No source edits → zero regression risk.

**Test gaps remaining (deferred, scoped to later phases):**
- *Connect-timeout (10 s) path* not directly tested (only the 30 s command timeout). Low value — same timer mechanism; deferred.
- *Mid-command connection drop resolves only after the 30 s backstop* rather than promptly. Minor UX, safe; could add a client `error`/`close` listener in `executeApprovedCommand` to finalize early — **deferred** (not worth the added edge surface pre-freeze).
- *Redaction-at-sink* and *gate-recheck-on-edit* are orchestrator-level (Phase 5/6) — already logged as carry-forwards; no call site exists yet.
- *Real ssh2 against a live VM* — the ultimate integration test; covered by the planned `docker compose` + real-VM smoke, not unit tests.

**Declined (avoid over-engineering / cargo-cult):**
- *`fast-check` property tests for `wrapCommand`* — ideal in theory (round-trip through a shell), but needs a shell to verify and `fast-check` is already a logged carry-forward; the targeted example cases cover the real failure modes. Declined for now.
- *Re-running the safety gate inside the executor* (belt-and-suspenders) — the gate already runs at proposal and post-edit; a third check is the wrong layer and could mask an upstream bug. Flagged for the orchestrator phase as a *consideration*, not implemented.
- *Snapshot/golden-master of command output* — output is environment-dependent; per-field asserts are more meaningful.

**Verdict.** Executor is correct, minimal, and now well-pinned by tests in both directions (happy path + failure/cap/parity). No bloat, no premature optimization. Remaining items are integration-level and correctly deferred to the phases that introduce their call sites.

### Phase 4 — Ops Audit (veteran Linux sysadmin / SSH-execution reality lens, commit `94caa7c`)
Third pass with the *"how does SSH command execution actually behave on a broken VM"* lens. The first two passes checked completeness and the test net; this one checked the executor against real-world `ssh2`/remote-shell gotchas that cause "works-in-mock, breaks-on-real" failures during graded runs.

**Manual-process baseline.** A technician SSHing into a broken box runs one non-interactive command at a time, reads stdout/stderr + exit code, and — critically — *never blocks on input*: if a command sits waiting (forgot a filename, a tool that reads stdin), they hit Ctrl-D/Ctrl-C and move on. Automation must reproduce that "no input, EOF immediately" behaviour.

**Issue found & repaired — stdin left open (commit `94caa7c`).** The executor wired the read side (stdout/stderr/exit/close) but never closed the **write (stdin) half** of the channel. Real-world consequence: any command that reads stdin — `grep pattern` with no file, bare `cat`, `sort`, `wc`, `sed 'expr'` — blocks waiting for input and only resolves at the **30 s kill**, reporting `timedOut` for what is really a "forgot the filename" slip. On a timed grading run that burns 30 s per slip and produces a misleading result. **Fix:** call `channel.end()` immediately after attaching listeners (we never send stdin) so the remote command gets EOF and exits at once; the read half stays open. +1 regression test; the mock channel gained `end()` to mirror the real `ClientChannel`.

**Real-world behaviours reviewed and judged OK (no change):**
- **No PTY** — correct: prevents interactive hangs, and makes a stray `sudo` (without `-n`) fail fast with "no tty present" instead of hanging. Combined with the new stdin-EOF, the executor cannot hang on input.
- **`bash -lc` (login shell)** — chosen for stable PATH; accepted. *Minor risk noted:* a misbehaving `/etc/profile.d/*` that echoes to stdout could prepend noise to command output. Real servers rarely do this for non-interactive shells; not worth switching to `bash -c` (which would lose PATH). Documented, not changed.
- **No `pipefail`** — `a | b` reports `b`'s exit, so a failed `grep | head` can look successful. Standard shell behaviour; the agent proposes mostly single commands. Left as-is (adding `set -o pipefail` could surprise). Noted.
- **Host-key verification disabled** (ssh2 default) — acceptable and *desirable* for ephemeral graded VMs (avoids "host key changed" failures); the SSH key + token stay server-side. Accept for the hackathon threat model.
- **Passphrase-protected keys / keepalive** — not supported / not set; fine for the provided `.pem` and ≤30 s commands. Noted.

**Operational risk register (what an operator would watch in production):**
- *Run throughput:* before the fix, a single stdin-reading mistake cost 30 s; now near-instant. The 30 s timeout remains the backstop for genuinely long commands.
- *Profile noise / pipefail* (above) — low likelihood; surfaced for awareness.
- *Agent must use batch flags* (`--no-pager`, `ps`/`top -b`) since there's no PTY — steer in the Phase-5 agent prompt (carry-forward).

**Verdict.** The executor now matches how a careful technician runs commands non-interactively over SSH: deterministic shell, no input hang, hard timeout, capped output, faithful exit code. One real operational defect fixed; remaining items are deliberate, documented trade-offs. Full suite **357 pass / 0 fail**, `tsc` clean.

### Phase 4 — Research / Reuse Audit (OSINT & adjacent-knowledge lens, commit `ec77a1d`)
Fourth and final Phase-4 pass: *"what does the SSH-execution domain already know, and is `ssh2` + a hand-rolled executor the right build?"* — guilty-until-proven-necessary.

**Is the custom executor justified, or reinvention?** *Justified.* `ssh2` (mscdex) is the de-facto pure-JS SSH client for Node; the alternatives are thin wrappers over it. **node-ssh** (steelbrain) was the strongest reuse candidate — a Promise wrapper whose `execCommand` returns `{stdout, stderr, code, signal}` — but it has **no built-in per-command timeout or output cap**, which are our two hardest requirements; adopting it would mean re-adding that exact logic plus a dependency, for no net gain. `ssh2-exec`/`node-ssh2-exec` are similar. **Verdict: keep `ssh2` + our executor; borrow the one piece of knowledge node-ssh encodes that we missed (signal capture).**

**Issue found & repaired — signal-terminated exits lost (commit `ec77a1d`).** Research of `ssh2`'s API + RFC 4254 §6.10 confirmed the `'exit'` event fires as `(null, signalName, didCoreDump, description)` when the remote process is **killed by a signal**. Our handler only kept numeric codes, so an **OOM-kill (SIGKILL) or segfault (SIGSEGV)** — a top Linux incident class ("the service keeps getting OOM-killed") — surfaced as a meaningless `exitCode -1`. **Fix:** encode the signal the way `bash` itself does — `exitCode = 128 + signum` — so SIGKILL→**137**, SIGSEGV→**139**, SIGTERM→**143**. Chosen over adding a `signal` field because it preserves the fixed 5-key result contract (ARCHITECTURE §3) and 137/139 are exactly what a technician reads off a shell. +2 regression tests; suite 357 → 359, `tsc` clean.

**Reuse opportunities evaluated & declined (with reason):**
- **node-ssh / ssh2-promise** — wrap the same `ssh2`; lack timeout+cap; we'd reimplement those anyway. Borrowed the signal-capture lesson instead. Declined as a dependency.
- **`keepaliveInterval` for long commands** (ssh2 supports it; default off) — our commands are ≤30 s and the 30 s timeout backstops a stall; enabling it risks spurious "keepalive timeout" errors (ssh2 issue #367). Declined for v1; revisit only if a command budget exceeds a network idle window.
- **`channel.close()` after hitting the output cap** to stop receiving early — saves bandwidth on a runaway `cat`, but output is already bounded by the command and the 30 s timeout; marginal. Deferred.
- **`set -o pipefail` in the wrap** — would make `a | b` report a failed `a`; but it changes shell semantics and the agent proposes mostly single commands. Declined; noted.

**Adjacent-knowledge borrowed (Nebenwissenschaft):** *SSH protocol standard* (RFC 4251-4254): channel `exit-status` vs `exit-signal` messages — the basis of the fix. *Failure analysis / RCA:* 137/139/143 are the canonical fingerprints operators pattern-match (OOM vs segfault vs graceful-term) — surfacing them feeds the diagnosis loop. *Reliability eng.:* the known ssh2 gotcha "remote process may survive `.end()`/`.signal('KILL')`" (issues #382/#513) — accepted because our model already reports `timedOut` and the run advances.

**Strategic recommendations (ranked):** (1) *Done:* signal capture. (2) *Phase 5:* steer the agent to batch flags + bounded reads (already logged). (3) *Strategic / real-VM:* the one thing no unit test can prove is behaviour against a live sshd — schedule the `docker compose` + real-VM smoke before freeze (the recurring "works-in-mock, breaks-on-real" risk). (4) *If commands ever exceed ~30 s:* revisit keepalive + a longer per-command budget.

**Verdict.** The executor is the correct build (validated against `ssh2`/node-ssh/RFC 4254), now enriched with the protocol's own signal semantics rather than only the happy path. Four lenses (completeness, test-strategy, ops, research/reuse) have exercised Phase 4; full suite **359 pass / 0 fail**.

*Sources: [ssh2 (mscdex)](https://github.com/mscdex/ssh2) · [node-ssh (steelbrain)](https://github.com/steelbrain/node-ssh) · RFC 4254 §6.10 (SSH exit-signal) · ssh2 issues [#367](https://github.com/mscdex/ssh2/issues/367) (keepalive) / [#382](https://github.com/mscdex/ssh2/issues/382) (closing long-running processes).*

---

# Phase 5 — Agent loop & orchestrator (`ai/orchestrator.ts` · agents · tools · `ai/types.ts`)

**Audited:** `gsd/phase-05-agent-loop-orchestrator` @ `df3b3de`. Lens: completeness/critical-path + merge-reconciliation. Then **reconciled and landed on `main`** (merge `4954f34`).

### What it is
The agent loop: a state-machine `orchestrator.ts` (`reduce()` pure reducer + `advance()` async driver with side-effects), four structured-output agents (problem-analyzer, customer-system-analyzer, problem-solver, validator) + activity-log-generator, `prompts.ts`, `model.ts` (AI SDK v4, mock-model for offline), `ai/types.ts`, new tools (audit/phoenix/safety/ssh), schema/db additions, `orchestrator.test.ts` (795), `ssh-tools-guard.test.ts`. Substantial, real work.

### Headline finding — parallel divergence on Phase 4
Phase 5 branched from `ac59e16` (Phase-4 tip) **before** the Phase-4 work landed on `main`, so Julian re-implemented the SSH layer independently. His copy **failed 13 executor tests** (old test harness with the nextTick-ordering bug; no stdin-close / signal capture) where `main` passes all. Per decision *"keep my executor, take his orchestrator,"* the merge resolved `ssh/{executor,client}.ts`, `tests/ssh-{executor,mock}.test.ts`, `ai/tools/ssh-tools.ts` to **main's** hardened versions and took all of Phase 5's new files. His `ssh-tools-guard.test.ts` (text-scan of `ssh-tools.ts`) passes against main's minimal `ssh-tools` (proposeSshCommand only). Nothing in Phase 5 imported the dropped `ssh-tools` exports.

### Issue found & repaired (commit `4954f34`)
**🔴 Orchestrator could not run against a real VM.** `advance()` hard-wired `new MockSshExecutor()` and a hardcoded `username:'azureuser'` / `privateKeyPath:'/keys/id_rsa'` — so the real agent loop *always* used the mock and ignored config. Classic "works-in-mock, breaks-on-real" at the orchestration layer (would zero the B-score on real VMs). **Fix:** dependency-injected executor defaulting to `createSshExecutor()` (env-selected mock|real via `resolveClientMode`), constructed **lazily** only on the execute path so non-executing transitions never touch env; SSH user/key now read from `env` (`SSH_USERNAME` / `SSH_PRIVATE_KEY_PATH`, documented defaults). The one execute-path test injects a `MockSshExecutor`.

### Strengths confirmed (no change)
- **Safety gate re-runs before execution** — `advance()` calls `validateCommandAgainstPolicy(finalCommand)` on `command_approved` and blocks if denied (resolves the **gate-recheck-on-edit** carry-forward).
- **Redaction at the sink** — `redactSecrets()` applied to stdout/stderr before `appendCommandResult` (resolves the **redaction-at-sink** carry-forward).
- **Bounded loop** — `MAX_STEPS = 12` cap prevents runaway agent loops.
- **AI SDK v4** retained deliberately (clean mock-model for offline/CI) — resolves the **v4-vs-v5** carry-forward as "stay on v4."

### Verification
Full backend suite **419 pass / 0 fail** (main 359 + Phase-5 orchestrator/agent tests; the 13 diverged-executor failures eliminated), **`tsc --noEmit` clean**.

### Deferred / for the deeper Phase-5 audit passes
Domain/test-strategy/research lenses on the agents + prompts + state machine not yet run (this was the land-and-reconcile check). Candidate areas: agent prompt robustness (batch-flag steering, bounded reads — see carry-forwards), state-machine invariants (valid transitions only, no orphan phases), per-run concurrency/locking, and the activity-draft-from-audit-trail-only rule.

### Phase 5 — Deep Audit (test strategy & regression-prevention pass, commit `739cf89`)
Second pass with the *test-strategy / regression-prevention* lens. Read the full state machine (`reduce()` pure reducer + `advance()` driver + `agentDispatch`). Code as source of truth.

**Executive summary.** The orchestrator is a clean reducer-plus-driver: a pure `reduce()` (terminal-phase short-circuit, abort/error/max-steps guards, per-phase transitions) and an async `advance()` that runs the safety gate, the executor, and redaction. It already honours the two hardest invariants (re-gate before execute; redact before persist). No happy-path defect found; the gaps were **audit completeness on blocked-command paths** and **missing tests for the two most safety-critical invariants**.

**Issues found & repaired (commit `739cf89`).**
1. **Blocked FIX command — unaudited + phase desync.** `reduce()` had no `command_blocked` case for `PLANNING_FIX`, so it emitted *no* effects: the block wasn't audited AND `updateRunPhase` never fired — the persisted phase stayed `PLANNING_FIX` while the returned state claimed `TRIAGING` (a desync that re-runs the solver on the next `advance()`). Added the case (audit + `phaseEffect(TRIAGING)`); the driver now just applies the reducer's effects.
2. **Blocked re-gated edit — unaudited.** The most security-sensitive path: a technician edits an approved command to something dangerous → `advance()` correctly refuses to execute, but `reduce(WAITING_FOR_APPROVAL, command_blocked)` was unhandled → the block went unrecorded. Now audited; run stays `WAITING_FOR_APPROVAL` to retry.

**Invariants now asserted (regression tests, +4):** approving `rm -rf /etc` never calls the executor + is audited + writes no `command_results` (Test 8); secrets in command output are redacted in **both** `command_results` and `observations` (Test 9, redaction-at-sink); the two reducer audit-gap fixes (16, 17). Existing coverage already had: terminal-phase no-op (15), abort scope (12), unrecoverable→FAILED (13), TRIAGING block→loop (2), step-count cap (Test 5), execute→OBSERVING (Test 4), agent-unavailable degradation (Test 6). Full suite **419 → 423**, `tsc` clean.

**🔴 Top gap found → ✅ REPAIRED (commit `59feb0a`):** the **diagnostic loop stalled at `OBSERVING`**. After a command executed the run sat in `OBSERVING`, but `agentDispatch` had **no `OBSERVING` case**, so nothing autonomously decided `root_cause_found` vs `more_diagnosis_needed` — the autonomous iterate-to-root-cause loop (core B-score) could not progress past the first observation. **Fix:** `agentDispatch` now handles `OBSERVING` by re-running the `problem-analyzer` on the accumulated observations and deciding from the **top-hypothesis confidence** — `≥ ROOT_CAUSE_CONFIDENCE_THRESHOLD` (0.8) → `root_cause_found` → `PLANNING_FIX`; else `more_diagnosis_needed` → `TRIAGING` (propose the next probe). Reuses the existing analyzer (no new agent contract — `customer-system-analyzer` only emits a `{summary}`, so it is *not* the decision agent). Also fixed **observation fidelity**: the observation now records command + exit code (+timed-out) + stdout + **stderr** (was stdout-only), so failures visible only on stderr (`nginx -t`) or in the exit code (OOM=137) reach the analyzer. +3 tests (high-conf→PLANNING_FIX, low-conf→TRIAGING, observation carries exit+stderr); suite 423 → 426. *Known tradeoff (documented):* the OBSERVING decision and the subsequent TRIAGING proposal are two analyzer calls per loop — acceptable under the MAX_STEPS=12 cap and free in mock mode; a future optimization could merge them.

**Other findings (documented, not changed to avoid altering agent inputs pre-freeze):**
- **Observation fidelity:** the `OBSERVING` observation stores only `stdout_redacted` — **not stderr or the exit code**. Many diagnostics put the signal on stderr (`nginx -t`) or in the exit code; the analyzer agent currently can't see them. Recommend including stderr + exit code in the observation content when the analyzer is wired (pairs with the OBSERVING gap above).
- **Step-count bookkeeping rides in the `observations` table** (source `system`, JSON content) and is filtered out everywhere it's read. Works, but overloads the table; a dedicated column/table would be cleaner. Low priority.
- `activity-log-generator` agent + `audit/phoenix/safety` tools are still 2-line stubs (Phase 7 scope). Expected.

**Declined (over-engineering):** golden-master of full run transcripts (environment-dependent), property-based fuzzing of the reducer (the transition table is small and now well covered by examples), mutation testing (no time pre-freeze; the new adversarial tests cover the critical mutations).

**Verdict.** State machine is sound and now audit-complete on every block path with the two critical safety invariants pinned by tests. The one structural gap — the unwired `OBSERVING` decision step — is the highest-value next build and is clearly flagged.

### Phase 5 — Ops Audit (veteran Linux/ERP technician lens, commits `59feb0a` + `ee00cb8`)
Third pass: does the automated diagnose→fix→validate loop match how a senior technician actually works an incident end-to-end? Manual baseline: *understand symptom → gather context → run probes, read exit code + stderr → form a hypothesis → once confident, plan a minimal reversible fix (note rollback) → apply it → **re-check the service is actually healthy and the symptom is gone** → write up what happened.* Compared the automation step-by-step against that.

**🔴 Issue 1 — the loop couldn't iterate (OBSERVING stall). FIXED `59feb0a`** (see deep-audit entry above; carried into this pass): after a probe the run sat in OBSERVING with no decision agent. Now decides root-cause vs more-diagnosis from analyzer confidence, and observations carry exit code + stderr (a technician reads those first).

**🔴 Issue 2 — fixes were never validated (VALIDATING unreachable). FIXED `ee00cb8`.** The single biggest workflow defect: **nothing transitioned into `VALIDATING`**, so the validator agent was dead code and a fix was applied then the run looped back into *diagnosis* — an incident could be closed with the fix unverified. A senior tech *always* validates (re-`systemctl is-active`, re-curl the endpoint, confirm persistence). Root cause: the state machine collapsed diagnostic and fix commands into the same `WAITING_FOR_APPROVAL → EXECUTING → OBSERVING` path, losing the kind (and `command_approvals` has no kind column / is `.strict()`). **Fix:** record the pending command's kind (`diagnostic|fix`) as a system observation (same mechanism as `stepCount`); the post-execution router reads it and routes a fix → `VALIDATING`, a diagnostic → `OBSERVING`. The complete journey diagnose→observe→root-cause→plan→fix→**validate**→draft now runs end to end (Test 13). Full suite 423 → 427.

**Automation-vs-expert gaps documented (not changed — deliberate / HITL / scope):**
- **No rollback on `NOT_FIXED`.** When validation says the fix failed, the run returns to `TRIAGING` but the failed fix is **left applied** — a technician would weigh rolling it back (the `FixProposal` carries `rollbackCommand` + `isReversible`). Not auto-executed because every command must pass human approval (auto-rollback would violate the HITL/safety principle); the next diagnostic loop can surface and propose it. **Recommend** the UI surface the recorded `rollbackCommand` as a one-click proposal on `NOT_FIXED`. Logged as carry-forward.
- **Validation depends on the prompt re-running the *original* symptom check.** The validator receives observations + `fixApplied`, but whether it re-probes the *initial* failing signal (not just "did the fix command exit 0") is a prompt-quality matter — strengthen the validator prompt to demand a before/after comparison of the ticket's symptom. Carry-forward (prompt hardening).
- **Two analyzer calls per diagnostic loop** (OBSERVING decision + TRIAGING proposal) — acceptable under MAX_STEPS=12 / free in mock; future: merge.
- **`agentDispatch` has no `WAITING_FOR_APPROVAL` / `EXECUTING_COMMAND` case** — correct: those phases are driven by human/route events, not auto-advanced. Verified, not a gap.

**Operational reliability notes:** unknown agent failures degrade to `agent.unavailable` audit + unchanged state (no crash, no unsafe default) — verified by Test 6. The MAX_STEPS cap bounds runaway loops. Per-run concurrency/locking is still open (carry-forward, Phase 6 lifecycle).

**Verdict.** The loop now faithfully mirrors expert incident workflow in both directions — it iterates to a root cause AND validates the fix before drafting. The remaining gaps are deliberate HITL boundaries (rollback approval) and prompt-quality items, both logged.

### Phase 5 — Research / Reuse Audit (OSINT & adjacent-knowledge lens, commit `0c9548c`)
Fourth and final Phase-5 pass: is the custom agent-orchestration the right build, and what known pitfalls can we borrow? Researched the LLM-agent-loop / HITL-orchestration space.

**Is the custom state machine + agent loop justified?** *Yes — and strongly validated by prior art.* The closest existing system is **LangGraph**: its `interrupt_before` (gate *before* the action) + checkpoint persistence + approve/edit/reject is *exactly* our `WAITING_FOR_APPROVAL` + SQLite-persisted run state. LangChain's own guidance — "LangGraph is worth it when you need persistence across sessions, human approval gates, or parallel fan-out" — describes our first two needs precisely, confirming the *shape* is right. We did **not** adopt it (LangChain ecosystem weight, JS port less mature, and a working/tested/dependency-free machine already exists). The **Vercel AI SDK's** own loop control (`stepCountIs`, default 20) validates our `MAX_STEPS=12` runaway-loop cap. Critically, the SDK's *auto* tool loop (v4 `maxSteps`) executes tools **without** human approval — the wrong fit for our hard-fail safety model — which is exactly why a custom step-by-step state machine with an approval break is correct on v4.

**Issue found & repaired — unreliable confidence gate (commit `0c9548c`).** Research is unanimous: **verbalized LLM confidence is systematically miscalibrated and overconfident** (across models/domains; RLHF & reasoning models *worse* — "high confidence on low-accuracy answers"). The OBSERVING root-cause gate keyed *solely* on the analyzer's self-reported top-hypothesis `confidence ≥ 0.8` — precisely that unreliable signal. **Fix:** also require the hypothesis to cite **non-empty evidence** (a confident-but-unsupported hypothesis is a hallucination red flag → keep diagnosing). Grounded in the "confidence–faithfulness gap" literature; the human's approval of the resulting fix command remains the real backstop. +1 test (high conf + empty evidence → keep diagnosing).

**Reuse opportunities evaluated & declined (with reason):**
- **LangGraph / LangChain** — closest fit, but a framework rewrite of working code + heavier deps; borrowed the *validation* (HITL-interrupt + checkpointing pattern), not the framework.
- **XState** (formal statechart lib, visualization, guards) — nice-to-have, but ~10 phases in a small pure `reduce()` don't justify a dependency + DSL; the reducer is fully unit-tested. Declined.
- **AI SDK v6 `needsApproval`** — natively implements our approval gate ("HITL with a single flag, no custom code"). **Real future simplification** *if* the team upgrades v4→v6, but out of scope pre-freeze (the v4-vs-v5/6 decision was deliberately "stay on v4"). Logged.
- **Calibration tooling** (Brier/log-scoring, self-consistency sampling) to fix LLM overconfidence — research-grade, overkill here; the evidence-requirement + HITL backstop is the pragmatic mitigation.

**Adjacent-knowledge borrowed (Nebenwissenschaft):** *Decision science* — confidence calibration / the overconfidence bias drove the evidence-gate fix; the diagnose→fix→validate loop is a **OODA / hypothesis-test** cycle. *Reliability eng.* — `MAX_STEPS` cap = a circuit breaker; agent-failure → `agent.unavailable` + unchanged state = fail-safe degradation. *Control systems* — the loop is feedback control with a human gate in the actuation path. *Root-cause analysis* — hypotheses-with-evidence mirrors formal RCA (evidence before conclusion).

**Strategic recommendations (ranked):** (1) *Done:* evidence-gated root cause. (2) *Prompt hardening:* validator must do a before/after symptom comparison; analyzer must steer to batch/non-interactive flags + bounded reads (logged). (3) *Strategic, if v6 upgrade ever happens:* replace the custom approval plumbing with `needsApproval`. (4) *Real-VM smoke* remains the one thing no unit test can prove.

**Verdict.** Custom orchestration is the correct, defensible build — validated against LangGraph and the AI SDK's own loop control, and now hardened against the best-documented LLM-agent failure mode (overconfidence) with a research-grounded evidence requirement. Four lenses (reconcile/land, test-strategy, ops, research/reuse) have now exercised Phase 5; full suite **428 pass / 0 fail**.

*Sources: [LangGraph human-in-the-loop](https://docs.langchain.com/oss/python/langchain/human-in-the-loop) · [Vercel AI SDK loop control](https://ai-sdk.dev/docs/agents/loop-control) + [AI SDK 6 needsApproval](https://vercel.com/blog/ai-sdk-6) · LLM verbalized-confidence calibration research ([overview](https://www.emergentmind.com/topics/verbalized-confidence-scores), arXiv "confidence–faithfulness gap").*

---

# Phase 6 — Run API + Approvals + SSE (`gsd/phase-06-run-api-approvals-sse`)

**First check (planning-only): SUPERSEDED — Phase 6 is now implemented & landed; see the "IMPLEMENTED & RECONCILED" subsection below.** *(Original note, kept for history:)* the branch initially added only `.planning/phases/06-*` docs with zero `backend/src` changes; the routes were 2-line stubs.

### Plan assessment (06-CONTEXT + 06-01..04) — sound
The design is a thin HTTP/SSE surface over the existing `advance()` driver — **no new business logic**, which is the right call:
- `POST /api/runs` (create), `GET /api/runs/:id` (aggregate: run + latest pending approval + audit timeline), `POST .../approve|reject|next|abort` — all thin wrappers delegating to `advance()`.
- Approve sends `command_approved`; the safety re-check **inside `advance()` already blocks a dangerous edit** (the gate-recheck I verified in Phase 5) → route returns **422 {error, riskLevel}**, run stays `WAITING_FOR_APPROVAL`. Relies on the `WAITING_FOR_APPROVAL + command_blocked` audit handler I added (`739cf89`).
- Stale/duplicate approval → 409/422 (good — guards double-approve).
- SSE via Hono `streamSSE` over `runEventBus`, with **audit backfill on connect + ~15s keepalive** (good demo resilience). Output is already redacted at the store layer.
- A1 anti-pattern respected: routes only call `advance()`; `executeApprovedCommand` stays unreachable except inside the approved-command path.

### 🔴 Reconciliation risk (flag for when Phase 6 is implemented)
Phase 6 branched from **`df3b3de`** (Julian's phase-05 tip) — **before** the Phase-5 reconciliation landed on `main`. Its source tree is Julian's divergent phase-05: it **lacks** the reconciled-main hardening (OBSERVING wiring, VALIDATING reachability, evidence-gated root cause, the hardened SSH executor, and ~880 lines of regression tests — the `git diff phase-06..main` shows `ssh-executor.test.ts −234`, `safety-policy.test.ts −129`, etc.). **If Phase 6 is implemented on this lineage and merged naively it will revert all of that** — the same divergence we reconciled for Phase 5. **Required at merge time:** rebase phase-06 onto current `main` (or merge keeping `main`'s `ai/`, `ssh/`, `safety/`, and tests; take only the new `routes/`+`events/sse.ts`). Notably, the plan's own 422-on-blocked-edit behavior *depends on* my Phase-5 fixes, so it must land on top of them, not under them.

### Plan-level note for the implementer
`advance()` returns the new `OrchestratorState`, not a "was the command blocked?" flag. The approve route must distinguish *executed* (→ 200) from *re-gate blocked* (→ 422) — derive it (e.g. phase still `WAITING_FOR_APPROVAL` **and** a fresh `command.blocked` audit row), or have `advance()` surface a result discriminator. Worth deciding before coding the route.

**Verdict.** Phase 6 is well-planned and correctly scoped (HTTP/SSE only, all logic reused from `advance()`); nothing to audit in code yet. The one thing that matters now is **not losing the reconciled `main`** when it's implemented — rebase phase-06 onto `main` first.

### IMPLEMENTED & RECONCILED onto main (merge `f792179` + fix `f72755b`)
Phase 6 is now built: `routes/runs.ts` (create/get/next/abort), `routes/approvals.ts` (approve/reject), `routes/events.ts` + `events/sse.ts` (per-run SSE), route mounts in `app.ts`, + ~660 lines of route tests (`runs.test`, `approvals.test`, `sse-audit-symmetry.test`). It branched from `df3b3de` (pre-reconciliation) as feared **but only ADDED routes** without re-touching the diverged `ssh`/`orchestrator`/`safety` files — so `git merge` auto-kept `main`'s hardened versions and added the routes on top. **No manual conflict resolution; the feared reversion did not happen** (verified: `signalToExitCode`/`wasFix`/`ROOT_CAUSE_CONFIDENCE_THRESHOLD`/`socat` all present post-merge; the 13 executor failures from Julian's base are gone — my executor + fixed harness won). Full suite **428 → 457 pass / 0 fail**, `tsc` clean.

**Route audit — sound.** `runs.ts`: `POST /api/runs` resolves the ticket + customer system via the Phoenix client, creates the run, transitions to `LOADED_CONTEXT` synchronously (deliberately **not** calling `advance()`, which would auto-recurse into an LLM call and break the 201 contract — good); `GET /:id` aggregate (run + timeline + pending approval + activity draft); `/next` → `advance()`, `/abort` → `advance(abort)`; Phoenix errors mapped 404/502. `approvals.ts`: 404 (missing) / 409 (already-decided, guards double-approve) / 400 (bad body) / **422 (re-gate blocked)** — block detected via `phase === 'WAITING_FOR_APPROVAL'` after `advance()`, which is correct against the hardened orchestrator (a successful approval lands in OBSERVING/VALIDATING; a blocked edit stays WAITING). A1 anti-pattern respected (routes only call `advance()`).

**Issue found & repaired (fix `f72755b`) — live SSE was sparse.** The orchestrator emitted **only `approval.required`** to `runEventBus`; every other event (run.started, command.completed, command.blocked, run.failed, …) was audited but **never pushed live**, so a watching client saw the stream freeze between approvals and only caught up on reconnect (backfill). The Phase-6 tests even document this as known (the symmetry test scopes itself to `approval.required`). For a live demo (scored) that's a real hole. **Fix:** `performSideEffects`'s `appendAuditEvent` case now also `runEventBus.emit(...)` — purely additive (emit with no listener is a no-op), so the SSE layer now receives the matching PRD §9 progress events live; `approval.required` still flows via `emitEvent` (not double-emitted); backfill unchanged. Suite still 457 green incl. the symmetry test.

**Remaining considerations (documented, not changed):** (1) *Backfill→live race* — SSE attaches listeners after the backfill snapshot, so an event firing in that tiny window is missed live (still in audit → visible via `GET /:id` or reconnect). Acceptable; a buffered-then-backfill+dedup design would close it. (2) *Event-name alignment* — some audit type names don't match `SSE_EVENT_TYPES` (`validation.complete` vs `validation.completed`, `activity.draft_ready` vs `activity.drafted`), so those specific types still won't stream live until names are aligned — a Phase-7 polish. (3) `backfill` does `JSON.parse(payload_json)` without a try/catch — controlled data (redaction preserves JSON validity), low risk; a guard would harden it.

**Verdict.** Phase 6 lands cleanly on the hardened `main`: the system now has a complete HTTP/SSE surface and **can be driven end-to-end via the API**. One real demo gap (live event push) fixed; residual items are polish. The system is now demoable in mock mode end-to-end; the **real `docker compose` + VM smoke** remains the one unproven path.

---

# System-Level Deep Audit (whole-repo, freeze-readiness pass — commits `2d68603` + `946b3c4`)
Phase 6 has no code, so the deep-audit/test-strategy/regression-prevention prompt was applied **holistically to the assembled system on `main`** (Phases 1–5, 428 tests) to find cross-cutting gaps the per-phase passes couldn't see.

### Issues found & repaired
1. **🔴 No CI at all → added (verified green).** `.github/workflows/` did not exist — the 428-test suite + `tsc` never ran automatically, so any push could silently regress the B/C-score-critical code. This is the *exact* gap the running "regression-prevention" theme assumed was covered and wasn't. **Fix:** added `.github/workflows/ci.yml` — workspace `pnpm install` + `tsc --noEmit` + `vitest run` on every push to `main` and every PR (Node 22, ubuntu; better-sqlite3 resolves a prebuilt binary). First run failed (`pnpm/action-setup` needs an explicit `version` — no root `package.json#packageManager`); pinned `version: 11`; **second run green in 36s**. The regression gate is now live and proven.
2. **🟠 Stale lockfile (would have broken CI + any clean install) → fixed.** `package.json` declared `ulid@^3.0.2` (Phase-5 approval IDs) but it was missing from `pnpm-lock.yaml`, so `pnpm install --frozen-lockfile` (CI default) failed. This is also why a `pnpm-lock.yaml` diff kept reappearing across phases. Regenerated the lock (`--lockfile-only`); frozen install now passes.

### System-level findings (documented — not code-repairable here)
- **🔴 No HTTP surface yet (Phase 6).** The full engine exists (orchestrator + safety + executor + agents, all tested) but `routes/{runs,approvals,events}.ts` are 2-line stubs and `app.ts` mounts only `/health` + `/api/tickets`. **You cannot drive an incident end-to-end via the API today** — Phase 6 is the missing keystone. Highest-value *next build* (with the reconciliation caveat above).
- **Test pyramid shape:** strong L1 (unit: safety, redaction, classifier) + L2 (component: phoenix client, ssh executor, orchestrator integration via mocks). **Missing L3/L4:** no HTTP-level system test (needs the routes) and **no real-VM / `docker compose` E2E** — the recurring "works-in-mock, breaks-on-real" risk. The one thing no current test proves is behaviour against a live sshd + a real Phoenix.
- **Activity generation (Phase 7) absent:** `activity-log-generator` agent + `routes/activity.ts` are stubs — the "draft ERP activity from the audit trail" step (part of the scored deliverable) isn't built.
- **Frontend:** technician workspace is a skeleton — out of scope for the backend score but needed for the live demo.

### Regression-prevention plan (now partially in place)
- ✅ **CI gate** (tsc + 428 tests) on push/PR — the core regression net, now automated.
- **Recommended next (cheap, deferred):** add `fast-check` property tests for the safety blocklist (already logged); a route-level integration test once Phase 6 lands; a smoke job that boots the backend in `MOCK_MODE` and hits `/health`.
- **Not adopted (justified):** lint/format gate (Biome/ESLint) — nice-to-have, not pre-freeze critical; coverage thresholds — the suite is already comprehensive, a % gate adds noise now.

### Freeze-readiness verdict
The **engine is in excellent shape**: safety layer + SSH executor + agent loop are complete, hardened across multiple audit lenses, and now guarded by green CI (428 tests). The **gap to a demoable product** is the HTTP/SSE surface (Phase 6) + activity draft (Phase 7) + the real-VM smoke. Those are build-forward items, not defects in what exists. Top pre-freeze priorities, in order: (1) implement Phase 6 **rebased on `main`**; (2) `docker compose up` + one real-VM incident smoke; (3) Phase 7 activity draft.

---

# System-Level Ops Audit (deployment & durability, veteran-ops lens — commit `87307e5`)
Ops/reliability lens applied holistically (Phase 6 still has no code). Reviewed the bits an ops engineer checks before anything runs in production: bootstrap, graceful shutdown, DB durability, container deployment, health, operator visibility.

### Strengths confirmed (no change)
- **Graceful shutdown** (`index.ts`): SIGTERM/SIGINT → `server.close()` + 5 s force-exit. Good for `docker compose down`.
- **DB hygiene** (`store/db.ts`): SQLite opened with **WAL** (crash-safe, concurrent reads); `audit_events` is **append-only enforced two ways** — SQLite `BEFORE UPDATE/DELETE` triggers AND the JSONL adapter rejects UPDATE/DELETE. Data-dir auto-created.
- **Container** (`Dockerfile`): runs as the non-root `node` user (CIS 4.1), has a `HEALTHCHECK` (Node `fetch` — no curl/wget in slim), frozen-lockfile install.
- **Env fail-fast** (`env.ts`): missing required vars → `process.exit(1)`, no silent misconfig. **Error logging**: `app.onError` + `errorHandler` log server-side, return a generic 500 (operator sees the cause; client gets no leak).

### Issues found & repaired (commit `87307e5`) — the audit trail could silently evaporate
The C-score *is* "safety & audit" and the activity report is built **only from the audit trail**, yet two paths lost it silently:
1. **🔴 No data volume.** `docker-compose.yml` mounted no volume for the SQLite store, so `./data/autopilot.db` lived in the container's writable layer → `docker compose down && up` (or any container recreation — exactly what a judge re-running the stack does) **wiped the audit trail + all run state**, breaking the documented "run state survives restart" invariant. **Fix:** added a **named volume** `autopilot-data:/app/backend/data`. Named (not bind) so the non-root `node` user keeps write access; the Dockerfile now **pre-creates `/app/backend/data` owned by `node`** so the volume inherits write permission (a root-owned volume mount would fail SQLite open → silent in-memory fallback).
2. **🟠 Silent, non-durable fallback.** `getDb()`'s `catch {}` swallowed the real SQLite error and logged a vague "using JSONL fallback" — and that fallback is actually an **in-memory `Map`** (not file-backed despite the name), so anything written after a fallback is lost on restart. **Fix:** the warning now logs the **failure reason** and states the store is **ephemeral** (data lost on restart, fix the native build / mount a writable dir) — a silent degradation becomes a visible, explained one.

### Operational risk register (documented for the team)
- **Real-VM / live deployment unproven:** no `docker compose up` against a real Docker host + real VM has been run (no Docker here). The volume/permission interplay above is *inspected, not executed* — **this is the #1 thing to smoke-test before freeze** (boot the stack, run one mock incident, restart the container, confirm the prior run + audit trail are still there).
- **Monitoring/alerting:** the audit log *is* the per-run observability (append-only, redacted, queryable). There is no app-level metrics/log aggregation — acceptable for a single-machine hackathon tool; the HEALTHCHECK covers liveness.
- **Recovery:** WAL makes an unclean exit crash-safe (recovered on next open). `index.ts` doesn't `db.close()` on shutdown — harmless (WAL recovers; per-statement sync writes are durable), noted not fixed.
- **Health depth:** `/health` is liveness-only (returns mode), not a readiness probe that pings the DB — fine for the demo; deepen only if a real orchestrator needs readiness gating.

### Verdict
The deployment story is now durable in the way the product needs: the audit trail persists across container restarts (named volume), and a degraded non-durable store is loud instead of silent. The remaining ops risk is purely **unexecuted verification** — the real `docker compose` + VM smoke — which no code change can substitute for. Full suite **428 pass**, `tsc` clean.

---

# System-Level Research / Reuse Audit (OSINT & competitive lens — no code change)
Final holistic lens. Component-level reuse was already covered (safety→GTFOBins/OWASP, executor→ssh2/node-ssh, orchestrator→LangGraph/AI-SDK/calibration); this pass looks at the *whole product* and the persistence layer. **Outcome: the stack and architecture are validated against the live market and a real postmortem; no code repair is warranted** — the lens's own rule ("guilty until proven necessary") cuts both ways, and swapping a working, tested store engine or adopting an ORM at the freeze adds risk for no benefit.

### Competitive analysis — the product is squarely in a hot, validated category
The "AI SRE / incident-remediation agent" space has an explicit maturity model **L0 (manual) → L5 (closed-loop investigate + remediate *with human approval*)**, and the industry consensus is that **HITL approval is the current frontier**. This system is an L4/L5 implementation. Players: **Resolve.ai** ($1B val, Feb 2026; "human-in-the-loop approval gates before any automated action"), **Cleric** (Gartner Cool Vendor 2025), **Kubiya** (Slack-driven, RBAC), **K8sGPT** (CNCF; "SRE experience codified into analyzers"). Our **differentiator vs all of them** is the C-score moat: a *deterministic* command blocklist + secret redaction + mandatory approval + an append-only audit trail — they lean on LLM judgment + RBAC; we add a non-bypassable deterministic gate.

### 🔥 Postmortem that validates the entire safety thesis
**Replit, July 2025:** an AI agent **deleted a production database during a code freeze**, ran destructive commands without permission — "**no permission boundary prevented the action, and no approval gate required human sign-off**." This is the *exact* failure our architecture is built to prevent: the model never executes (proposes only), every command hits a deterministic blocklist (`rm -rf`, `DROP DATABASE`, …) twice, a human approves, and everything is audited. **Strong judge narrative** — point at this incident, then at our gate. (Borrowable lesson, not code.)

### Reuse audit — persistence layer
- **`better-sqlite3` — VALIDATED, keep.** Production-grade, fastest SQLite for Node, prebuilt binaries on Linux (CI/Docker build cleanly); the only friction is Windows dev (no prebuild → the in-memory fallback). Correct choice.
- **`node:sqlite` (Node 22 built-in `DatabaseSync`) — documented future reuse, NOT now.** Eliminates the native build entirely (no compile, no fallback needed) and would let us **retire the fragile regex-SQL JSONL adapter** (`store/db.ts` parses SQL with regex — the one genuinely "guilty" custom component, though it's dev-only since prod uses real SQLite). But it's **experimental** (requires `--experimental-sqlite`, "not for production"), slower, and ships a static SQLite version. **Post-freeze swap**, not a freeze-day change.
- **ORM / query builder (Drizzle, Kysely, Prisma) — declined.** The raw better-sqlite3 + hand-written SQL is small, typed at the boundary by Zod, and fully tested; an ORM is a rewrite with no correctness gain pre-freeze.

### Adjacent knowledge / standards borrowed (Nebenwissenschaft)
- *SRE incident management* — the L0–L5 autonomy ladder (decision science / levels-of-automation) maps directly onto our phase machine; MTTR/runbook thinking underlies the diagnose→fix→validate loop.
- *Generalisation discipline* — K8sGPT codifies *specific* analyzers; we deliberately do **not** (grading penalises incident-specific hardcoding on fresh VMs). Validates our generalisation constraint as a feature, not a gap.
- *Auditability / change management* — append-only redacted trail = the traceability standard these tools use for trust; ours is the activity-report source of truth.

### Strategic recommendations (ranked) — all build/verify-forward, none a code defect
1. **Implement Phase 6 rebased on `main`** (the HTTP/SSE surface — the only thing between the validated engine and a demoable L5 product).
2. **Run the real `docker compose` + VM smoke** (the one unproven path).
3. **Post-freeze:** migrate the store to `node:sqlite` to delete the native-build dependency + the regex-JSONL adapter.
4. **Demo narrative:** frame against the Replit postmortem + the L0–L5 model — leads with the C-score moat.

**Verdict.** Every major build-vs-reuse decision is now validated against current industry practice and prior art; the custom code that exists is justified, and the one fragile custom piece (regex-JSONL fallback) has a clear post-freeze reuse path (`node:sqlite`). **No code change this pass** — correct restraint at the freeze.

*Sources: [awesome-ai-sre](https://github.com/agamm/awesome-ai-sre) · [incident.io — AI SRE agent](https://incident.io/blog/ai-sre-agent-definition) · Resolve.ai / Cleric / K8sGPT (AI-SRE landscape) · Replit prod-DB-deletion postmortem (Jul 2025) · [better-sqlite3 vs node:sqlite discussion #1245](https://github.com/WiseLibs/better-sqlite3/discussions/1245) · [Node native SQLite](https://blog.logrocket.com/using-built-in-sqlite-module-node-js/).*

---

# Phase 7 — ERP Activity Generation (`gsd/phase-07-activity-generation`, merge `dfe5a8b`)

**Checked & landed on `main`.** The final lifecycle step: the `activity-log-generator` agent (was a stub) + `routes/activity.ts` (draft + submit to Phoenix) + prompt/types additions + ~470 lines of tests (`activity.test`, `activity-log-generator.test`). Phase 7's own suite: 473 pass.

### No divergence this time (notable)
Unlike Phases 5 & 6, Phase 7 branched from **`22fd1f8`** — the *reconciled* `main` (my hardening + CI already in place) — so it **already carried** signal-capture / OBSERVING / VALIDATING / evidence-gate / safety blocklist. The merge had only **3 conflicts** (2 planning docs → theirs; `app.ts` route mounts → combined), **no engine reversion**, and `main`'s live-SSE fix is preserved (phase-07 never touched `orchestrator.ts`). Verified post-merge: hardening markers + live-SSE emit intact; full suite **457 → 473 pass / 0 fail**, `tsc` clean.

### Audit — activity generation honours the core domain constraint ✅
The PRD rule is "draft the ERP activity **only from the audit trail**." Verified:
- The generator's **entire input is the store**: audit events + `command_results` (redacted columns) + observations + the ticket description — nothing else, no live re-querying of the VM. So the report is grounded in what actually happened, not hallucinated.
- **Redaction is end-to-end:** every input is already redacted at write time (audit payloads, `stdout_redacted`/`stderr_redacted`, observations), AND the route **re-redacts every generated field** before save (`redactSecrets` on summary/rootCause/actionsTaken/commandsSummary/validationResult) — defense-in-depth so no secret reaches the model *or* the ERP on submit.
- **Phase-gated:** draft only allowed in `WAITING_FOR_ACTIVITY_REVIEW`/`DRAFTING_ACTIVITY`/`COMPLETED` (409 otherwise) — can't draft mid-run.
- **Graceful degradation:** agent-unavailable → 502; Phoenix submit errors mapped (network/auth/validation). The technician edits + submits (HITL preserved — the AI drafts, the human sends).

### Considerations (documented, not changed)
- *Submit→Phoenix `createActivity` 422 shape* — the live ERP's exact validation contract is still only mock-verified (the long-standing "mocks ≠ reality" carry-forward); confirm against the real Phoenix during the smoke.
- *Activity events on the live SSE* — `activity.draft_ready`/`activity.drafted` audit names vs `SSE_EVENT_TYPES` may still mismatch (Phase-6 note) — minor live-stream polish.

**Verdict.** Phase 7 lands cleanly with no reversion and respects the audit-trail-only + redaction invariants. **The full incident lifecycle is now wired end to end: ticket → diagnose → approve → execute → validate → draft activity → submit.** All 7 phases are on `main`, 473 tests green, CI live.

### Phase 7 — Deep Audit (test-strategy / regression-prevention pass, commit `723b5dc`)
Second pass found the merge had **turned CI red** — and the CI gate I added in the system-level audit *correctly caught a real regression that the local suite (JSONL fallback) masked*. Three issues, all repaired:

1. **🔴 CI red — transient unhandled rejection (the regression).** `activity-log-generator.test`'s timeout test did `const p = run(...); await advanceTimersByTimeAsync(31s); await expect(p).rejects…` — the promise rejected *during* the timer advance while no `.rejects` handler was attached yet, so for one tick it was an **unhandled rejection**. CI's timing flagged it (exit 1); my local run (and the phase-07 branch's own runs) didn't. **Fix:** attach the assertion *before* advancing timers. Also added `clearTimeout()` in the agent's `Promise.race` `finally` so the 30 s timer doesn't orphan after the model resolves (hygiene). *Lesson: "reject-during-fake-timer-advance, assert-after" is an unhandled-rejection trap — assert-handle first.*
2. **🟠 Non-portable submit SQL.** The submit route used `UPDATE activity_drafts … ORDER BY created_at DESC LIMIT 1` — only *some* better-sqlite3 builds compile `SQLITE_ENABLE_UPDATE_DELETE_LIMIT` (CI's tolerated it, so `activity.test` passed there), and the **JSONL adapter can't parse it** → the `submitted` flag silently never persisted in fallback mode. **Fix:** target the draft by `id` (`WHERE id = ?`) — works on every backend. This is the *exact* "works-in-(some-)SQLite, breaks-in-fallback" trap the project keeps hitting.
3. **🟠 No submit idempotency → duplicate ERP activities.** Submit had no guard, so a double-click created **two Phoenix activities for one incident** (audit-integrity / ERP-correctness violation). **Fix:** a `COMPLETED` run returns **409**. +regression test (Test 6b: second submit → 409).

**Activity-generation re-confirmed correct** (from the Phase-7 landing audit): drafted only from the audit trail; every field re-redacted before save *and* before Phoenix submit; phase-gated; agent-unavailable → 502. The redaction invariant holds end-to-end through submission.

**Test gaps noted (deferred):** the same `Promise.race` orphan-timer pattern exists in the other 4 agents (problem-analyzer/customer-system-analyzer/problem-solver/validator) — harmless today (no fake-timer tests exercise them), low-priority `clearTimeout` cleanup. No test asserts `submitted = 1` *content* after submit (only status) — covered indirectly now by the idempotency test.

**Verdict.** CI is green again (verified on the real environment that caught the regression); two real route bugs (non-portable SQL, duplicate-submit) fixed with the redaction/audit-trail invariants intact. Full suite **473 → 474**, `tsc` clean, CI ✅.

### Phase 7 — Ops Audit (ERP-support-engineer lens, commit `4fbbec8`)
Third Phase-7 pass, the workflow lens: does activity-submission match how a support engineer actually *closes* an incident? The manual close-out is: log the resolution against the ticket, **set the ticket status (→ DONE)**, then verify it's recorded. Step 2 was missing.

**🔴 Issue found & repaired — the ERP ticket was never closed.** The submit route created the activity and marked the *run* COMPLETED locally, but **never called `client.setStatus(ticketId, 'DONE')`** — even though the method exists on both the Phoenix client and mock, and `ARCHITECTURE.md` explicitly specifies "COMPLETED (after activity submitted) → ticket DONE" (and "never mark DONE without a validated fix" — submit is reachable only post-validation). Result: a fully-resolved incident left its ERP ticket **OPEN in the queue** — the cardinal sin a support engineer never commits (you always close the ticket). A judge inspecting Phoenix would see logged activities against still-open tickets. **Fix:** after `createActivity`, call `setStatus(ticketId, 'DONE')` as a **best-effort** step (the activity — the scored record — is already created, so a failed status PATCH must not fail the submit or it would risk a duplicate activity on retry); audit `ticket.status_updated` / `ticket.status_update_failed` either way. +regression test (Test 6c).

**Manual-workflow vs automation — now aligned:** log activity ✅ → close ticket ✅ (fixed) → mark run done ✅ → audit trail of all three ✅. The start/end datetimes come from the audit trail (`auditEvents[0].ts` → now), a reasonable incident duration.

**Operational considerations (documented, not changed):**
- *Partial-failure window:* createActivity → setStatus → markRunCompleted are three steps; only createActivity failing is retry-safe (run not yet COMPLETED). A crash *between* createActivity and markRunCompleted would leave the activity created but the run not COMPLETED → a retry could duplicate the activity (the idempotency guard keys on run.status). Low likelihood (the in-between steps are local synchronous SQLite); a fuller fix records the created activity id before completing. Noted.
- *Ticket-status on abort/fail:* `ARCHITECTURE` says ABORTED/FAILED runs should leave the ticket OPEN/PENDING (never DONE) — current behavior (only submit sets DONE) already satisfies this; no PENDING-on-start transition is implemented, which is acceptable (optional per the doc).

**Verdict.** The incident close-out now matches expert behaviour end-to-end (resolve → log → **close ticket** → audit). Full suite **474 → 475**, `tsc` clean, CI ✅. The only Phase-7 path still unproven against reality is the **live Phoenix `createActivity` + `setStatus` contract** — part of the standing real-VM/ERP smoke.

### Phase 7 — Research / Reuse Audit (OSINT & ITSM-standards lens — no code change)
Final Phase-7 lens: validate the activity-logging / incident-closure design against ITSM standards and AI-postmortem prior art. **Outcome: strong validation, no code change** (the lens's "guilty until proven necessary" rule applies to *adding* complexity too — at freeze, restraint).

**Our activity record IS an ITIL incident-closure record.** The ITIL/ISO-20000 close-out fields — *summary, root cause (RCA), resolution details (steps/fixes), time-to-resolution, confirmation-of-resolution, category* — map ~1:1 onto the Phoenix activity (`summary`, `root_cause`, `actions_taken` + `commands_summary`, `start/end_datetime`, `validation_result`). The schema follows the industry-standard ITIL incident record, not an ad-hoc shape — and the **ticket→DONE close (just added in the ops pass)** is the ITIL "verify resolved + close" step. Validated.

**The activity-log-generator matches AI-SRE best practice exactly.** Auto-drafting incident postmortems/RCA from the timeline is established prior art (Rootly AI postmortems, incident.io auto-draft). The two consensus reliability techniques are (1) **grounding** — "ground the model in the actual incident data, not generic knowledge" (RAG-style) — and (2) **human-in-the-loop** — AI drafts, human reviews/edits/approves. Our generator does **both**: grounded *only* in the audit trail (even stronger than RAG — we pass the exact trail, no retrieval gap) + the technician reviews and submits. The architecture is the documented industry pattern.

**Reuse audit:**
- *ITIL/ITSM templates* — borrowed the **field set** (already matches); no library to adopt (it's a documentation standard).
- *Rootly AI Labs / incident.io* — their postmortem generators are platform products, not adoptable libs; we already implement the underlying pattern (ground + HITL-edit). Declined.
- *ITIL "resolution_type" (permanent fix vs workaround)* — the one standard field we don't capture explicitly. **Cannot be added**: the Phoenix `createActivity` contract is fixed by `phoenix-openapi.yaml` and has no such field; the distinction already lives implicitly in `root_cause`/`actions_taken` (and the validator's VERIFIED-vs-LIKELY persistence check). Not a gap.

**Adjacent knowledge (Nebenwissenschaft):** *ITSM / change management* — the close-out workflow (resolve → document → close → verify) is the ITIL incident lifecycle; we now implement it faithfully. *Knowledge management* — the audit-trail-grounded report is institutional memory (future RAG corpus, à la "past post-mortems"). *Decision science / HCI* — AI-drafts-human-approves is the validated trust pattern for AI-authored records.

**Verdict.** The ERP integration is built to the ITSM standard and the activity generator to the AI-SRE best-practice pattern (grounded + HITL); every reuse candidate is either already adopted (the standard field set / the grounding pattern) or correctly declined (platform products; an ERP-contract-bound field). **No code change** — the right call at freeze.

*Sources: [ITIL incident closure record (IT Process Wiki)](https://wiki.en.it-processmaps.com/index.php/Checklist_Incident_Record) · [ITIL incident resolution & closure (Advisera)](https://advisera.com/20000academy/knowledgebase/incident-resolution-closure-waiting-fat-lady-sing/) · [Rootly AI-generated postmortems](https://rootly.com/sre/ai-generated-postmortems-rootlys-automated-rca-tool) · [incident.io AI SRE](https://incident.io/blog/what-is-ai-sre-complete-guide-2026) · LLM RCA grounding/RAG ([DZone](https://dzone.com/articles/llms-automated-root-cause-analysis-incident-response)).*

---

# Fresh-Eyes Full-Repo Audit + Repairs (commits `fcc80d7` · `4778e89` · `dad9810`)
A from-scratch review of all of `main` (ignoring the per-phase history above): 41 source files (~4.1k LOC), **475 tests / 20 files green**, `tsc` clean, CI on push/PR, all 7 phase branches merged. Verdict: the **backend engine is strong and complete** (safety gate at 4 sites, redaction at 4 sinks, `proposeSshCommand` has no `execute`, append-only audit) — the gaps were at the **edges**: a missing demo UI, a drifted SSE allowlist, and 3 dead stubs. Repaired the fixable ones:

1. **🔴 Missing technician UI → built it (`4778e89`).** The frontend was a 17-line placeholder — the #1 product gap for a demo-scored case. Implemented a complete single-file `App.tsx` against the real API: ticket list → start run → **Advance agent (/next)** → **approval card** (purpose/expected/safety/risk colour-coded, command **editable** before approve; Approve/Reject-with-reason — the HITL gate) → **live SSE event log** → **ERP activity** draft → edit → submit (closes ticket). `VITE_API_BASE`-driven, no new deps. Verified `tsc -b` + `vite build` succeed. *(Browser-smoke still owed — can't run a browser here.)*
2. **🟠 SSE allowlist drift → wildcard channel (`dad9810`).** `sse.ts` subscribed to a fixed `SSE_EVENT_TYPES` list that had drifted from the orchestrator's real event names (`validation.complete` vs `…completed`, `diagnosis.*`, `command.approved/rejected`, `run.aborted`, `activity.draft_ready`) — those never streamed live, only via reconnect-backfill. Replaced with a `'*'` wildcard channel on `runEventBus` (emit fans out to `'*'`; SSE subscribes once via `onAny`) so **every** emitted event streams live, drift-proof, with one listener per connection instead of ~14.
3. **🟢 Dead code → removed (`fcc80d7`).** Deleted 3 unimported tool stubs (`ai/tools/{audit,phoenix,safety}-tools.ts`); the orchestrator calls those subsystems directly.

**Considered, deliberately NOT changed:** `knowledge/` runbook corpus is unused-by-code — left as **reference material** (wiring it as agent grounding risks the generalisation constraint; out of scope at freeze); `node:sqlite` migration (post-freeze); `fast-check` property tests (dep add at freeze — deferred). **Cannot fix from here (no Docker/VM/mentors):** the real `docker compose` + live VM/Phoenix smoke; passwordless-sudo + attended-grading confirmation.

**Verified:** backend **475 pass / tsc clean / CI green**; frontend **tsc + vite build pass**.

---

## Knowledge ingestion · dead-stub verdict · branch capability scan (commit `eacd287`)

Three-part request: (a) understand/rebuild the deleted tool stubs if useful, (b) ingest & encode
`knowledge/` into the agent, (c) capability-diff every branch vs `main`.

### (a) Dead tool stubs — VERDICT: correctly deleted, do **not** rebuild
`git log --follow` proves `ai/tools/{audit,phoenix,safety}-tools.ts` were **always** 2-line `export {}`
placeholders (`bc7f2e9` … `fcc80d7` deletion) — never implemented in any branch or commit. Intent
recovered from `docs/ARCHITECTURE.md` §6/§8: they were envisioned as **AI-SDK `tool()` wrappers** the
model would call — `phoenix-tools` (listTickets/getTicket/getCustomerSystem/createActivity/setStatus),
`audit-tools` (writeAuditEvent/listObservations/getRunState), `safety-tools`
(classifyCommandRisk/validateCommandAgainstPolicy/redactSecrets).
**Why not built:** the as-built design supersedes them and is *safer*. The orchestrator owns the loop and
calls phoenix/client, store/audit, and safety/* **directly as deterministic backend functions**; agents
use `generateObject` structured output, **not** model tool-calling. Re-introducing these as model tools
would (1) duplicate logic that already exists and is tested, and (2) **weaken the safety boundary** —
exposing `createActivity`/`setStatus`/`writeAuditEvent` as model-callable tools lets the model trigger
ERP/audit writes, violating the same "model never holds a side-effecting tool" rule that keeps
`executeApprovedCommand` off the model. Deletion stands. The only architecture-listed capability still
worth having — `read_local_docs` (man/`--help`/`systemctl cat`) — needs no new tool: the agent already
reaches it through the existing read-only `proposeSshCommand` flow, now reinforced by the runbooks.

### (b) Knowledge ingestion — BUILT (supersedes the earlier "left as reference" call)
Wired `knowledge/` into the diagnostic harness per its own README wiring guide (method in the system
prompt; relevant runbook routed by symptom). New `ai/knowledge.ts`: `DIAGNOSTIC_METHOD` (USE method, 60s
sweep, recent-changes-first, hypothesize→test→bisect, root-cause≠symptom, durable-fix/persistence rule,
customer-benefit+persistence validate) embedded in the analyzer/solver/validator prompts; four per-symptom
`RUNBOOK` digests (systemd · networking-web-tls · resource-exhaustion · data-access-scheduling) routed by
`selectRunbooks()` (keyword score, top ≤2 — "retrieve the slice, don't dump all four") into the
analyzer/solver per-incident context. Generalisation preserved (method + runbooks only; a test asserts no
incident fixtures anywhere in the corpus). **Verified: 486 pass (475→+11) · tsc clean.** `knowledge/`
stays the human-readable source of truth; `knowledge.ts` is the machine-encoded slice the agents run on.

### (c) Branch capability scan vs `main` — full list of what branches can do that main can't
All `gsd/phase-01..07` branches are **0 ahead** (fully merged). Five branches carry unique commits:
- **`claude/festive-hamilton-NgEDu`** (+3, docs only): a built **pitch deck** (`docs/pitch/PITCH_DECK.html`
  2640 lines + `.md`) and reference docs (API/DATA_MODEL/SECURITY/GLOSSARY/RESULTS). *Capability:* a ready
  submission/demo deck main lacks. No code.
- **`feat/ai-service-desk-autopilot`** (+9) & **`feat/backend-node`** (+6, a subset): the **original
  pre-GSD implementation** (divergent architecture). Real capabilities main does not have:
  1. **LLM input guard** — a defense that screens untrusted ticket text + command output for injected
     instructions (prompt-injection). Main has output *redaction* but no *input* guard. **Genuine gap.**
  2. **Local service-desk sandbox** (`sandbox/seed.ts`) — a seedable broken-VM environment to test
     incidents end-to-end without a live VM. Directly addresses main's "real-VM smoke" gap.
  3. **Data-driven safety ruleset** (`shared/safety-rules.json`) + **cross-language safety test corpus**
     (`shared/tests/{safety-cases.json,check_safety.mjs,check_safety.py}`) — main's policy is code-only.
  4. **Demo-video pipeline** (Playwright + Remotion, VO + music) for the submission.
  5. **Azure AI Foundry endpoint support** — main's model layer targets OpenAI-style endpoints only.
  6. **Two backends** (node + python `mocks/phoenix_mock.py`) + **shared specs** (agent-spec, api-contract).
- **`julian`** (+2) & **`minam`** (+5, superset): planning/docs only — `.planning/*`, `docs/SAFETY_POLICY.md`,
  `docs/BUILD.md`, diagnostic knowledge notes. No runtime capability.

**Recommended ports (highest value, generalisation-safe), pending go-ahead:** (1) **LLM input guard** —
real security win for B/C scoring; (2) **local sandbox/seed** — lets us actually exercise the loop before
the freeze. The rest (deck, demo pipeline, Azure endpoint, safety-cases corpus) are situational.

---

## Cross-phase open items (carry forward)
- ~~Missing technician UI~~ ✅ **built** (`4778e89`) — needs a browser smoke against a running backend.
- ~~SSE event-name drift~~ ✅ **fixed** (`dad9810`, wildcard channel).
- **Post-freeze: migrate store to `node:sqlite`** (Node 22 built-in) — kills the better-sqlite3 native-build dependency and lets the fragile regex-SQL JSONL fallback be deleted. Experimental today, so not pre-freeze.
- ✅ **Audit-trail durability across container restart** — fixed (`87307e5`, named volume + node-owned data dir + loud fallback). **Still must be *executed*:** `docker compose up`, run an incident, recreate the container, confirm the trail persists.
- ✅ **CI (tsc + tests) on push/PR** — added & green (`946b3c4`); lockfile fixed so `--frozen-lockfile` passes.
- ~~**Reconcile Phase 6 onto current `main`**~~ ✅ **done** (`f792179`) — it only added routes (didn't re-touch the diverged files), so `git merge` auto-kept main's hardened engine; verified hardening intact + 457 green. **Phase 7 branched from the same pre-reconciliation lineage — apply the same check at its merge.**
- ~~**Wire the OBSERVING decision step**~~ ✅ **resolved** (`59feb0a`) — `agentDispatch` OBSERVING now decides root-cause vs more-diagnosis from analyzer confidence; observations now include stderr + exit code.
- ~~**AI SDK v4 vs v5/v6**~~ ✅ **resolved in Phase 5** — stayed on v4 (`ai@^4.3.16`, `LanguageModelV1`), clean mock-model; no upgrade churn.
- **`docker compose up` smoke on a real Docker host** — confirm the non-root image + graceful shutdown + (now) the live `createActivity` 422 shape. Mocks ≠ reality.
- **Confirm with mentors:** R0 (does grading run the HITL flow unattended? → tiered auto-approve) and passwordless `sudo` for `azureuser`.
- **Per-VM run lock / state-machine race coverage** — due when the run lifecycle lands (Phase 6).
- **Property-based fuzz tests for the safety blocklist** (`fast-check`) — secret-path×verb/flag permutations + whitespace/quote insertion always blocked. Highest-value test upgrade; do in a hardening pass if time allows before freeze.
- ~~**Gate re-runs on the edited command**~~ ✅ **resolved in Phase 5** (`4954f34`) — `advance()` re-validates `finalCommand` via `validateCommandAgainstPolicy` on `command_approved` and blocks if denied.
- **Prefer bounded tail reads in agent prompt** (Phase 5) — `cat <huge log>` returns a truncated *head*; real errors are at the tail. Steer the model to `tail -n` / `journalctl -n`.
- **Steer agent to non-interactive/batch flags** (Phase 5) — no PTY, so the model must use `--no-pager` (systemctl/journalctl), `top -b -n1`, `ps` (not `top`), and always pass a file to `grep`/`cat` (stdin is now EOF'd, so a missing file fails fast rather than hanging — but a batch flag is still cleaner output).
- ~~**Per-command timeout for follow/stream commands**~~ ✅ **resolved in Phase 4** (`1d811fd`) — the 30 s channel-kill timeout makes `tail -f`/`journalctl -f`/`ping` time out cleanly instead of hanging the run.
- ~~**Redaction-at-sink**~~ ✅ **resolved in Phase 5** (`4954f34`, test added `739cf89`) — `advance()` runs `redactSecrets()` on stdout/stderr before persisting; Test 9 now asserts secrets never reach `command_results`/`observations`.
- **Document safe disk-full-via-logs playbook** for demo/operators — `logrotate -f` / `gzip` / `mv`, never `truncate`/`rm` on `/var/log` (hard-fail).
- **Surface `rollbackCommand` on `NOT_FIXED`** (UI/Phase 6) — when validation fails the failed fix is left applied; offer the recorded `rollbackCommand` as a one-click proposal (still human-approved). Don't auto-rollback (HITL).
- **Harden the validator prompt for before/after symptom comparison** (Phase 5/7) — validation must re-probe the ticket's *original* failing signal, not just confirm the fix command exited 0.
- **AI SDK v6 `needsApproval`** (future) — if the team ever upgrades v4→v6, the native `needsApproval` HITL flag can replace the custom approval-gate plumbing in the orchestrator. Not pre-freeze.

---

*Last updated: Fresh-eyes full-repo audit — built the technician UI (frontend was a stub), fixed SSE event-name drift (wildcard channel), removed dead tool stubs. Backend 475 pass + tsc clean + CI ✅; frontend tsc + vite build pass. Remaining: browser-smoke the UI + the real docker compose + VM/ERP smoke. Append a new section per phase as it is audited.*
