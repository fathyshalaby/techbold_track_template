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

---

## Cross-phase open items (carry forward)
- **AI SDK v4 vs v5/v6** — pin/reconcile before the Phase-5 agent loop.
- **`docker compose up` smoke on a real Docker host** — confirm the non-root image + graceful shutdown + (now) the live `createActivity` 422 shape. Mocks ≠ reality.
- **Confirm with mentors:** R0 (does grading run the HITL flow unattended? → tiered auto-approve) and passwordless `sudo` for `azureuser`.
- **Per-VM run lock / state-machine race coverage** — due when the run lifecycle lands (Phase 6).
- **Property-based fuzz tests for the safety blocklist** (`fast-check`) — secret-path×verb/flag permutations + whitespace/quote insertion always blocked. Highest-value test upgrade; do in a hardening pass if time allows before freeze.
- **Phase-6 integration test: gate re-runs on the edited command** — assert an approval-time edit is re-validated and a blocked edit cannot execute (the "re-check after human edit" invariant; no call site exists until the orchestrator lands).
- **Prefer bounded tail reads in agent prompt** (Phase 5) — `cat <huge log>` returns a truncated *head*; real errors are at the tail. Steer the model to `tail -n` / `journalctl -n`.
- **Steer agent to non-interactive/batch flags** (Phase 5) — no PTY, so the model must use `--no-pager` (systemctl/journalctl), `top -b -n1`, `ps` (not `top`), and always pass a file to `grep`/`cat` (stdin is now EOF'd, so a missing file fails fast rather than hanging — but a batch flag is still cleaner output).
- ~~**Per-command timeout for follow/stream commands**~~ ✅ **resolved in Phase 4** (`1d811fd`) — the 30 s channel-kill timeout makes `tail -f`/`journalctl -f`/`ping` time out cleanly instead of hanging the run.
- **Redaction-at-sink integration test** (Phase 5/6) — the SSH executor returns RAW output by design; assert the orchestrator runs `redactSecrets()` before audit/SSE/UI/model (no call site exists until the orchestrator lands).
- **Document safe disk-full-via-logs playbook** for demo/operators — `logrotate -f` / `gzip` / `mv`, never `truncate`/`rm` on `/var/log` (hard-fail).

---

*Last updated: Phase 4 (ops-audit pass — stdin-hang fix; SSH suite 45, full suite 357 pass). Append a new section per phase as it is audited.*
