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

---

## Cross-phase open items (carry forward)
- **AI SDK v4 vs v5/v6** — pin/reconcile before the Phase-5 agent loop.
- **`docker compose up` smoke on a real Docker host** — confirm the non-root image + graceful shutdown + (now) the live `createActivity` 422 shape. Mocks ≠ reality.
- **Confirm with mentors:** R0 (does grading run the HITL flow unattended? → tiered auto-approve) and passwordless `sudo` for `azureuser`.
- **Per-VM run lock / state-machine race coverage** — due when the run lifecycle lands (Phase 6).
- **Property-based fuzz tests for the safety blocklist** (`fast-check`) — secret-path×verb/flag permutations + whitespace/quote insertion always blocked. Highest-value test upgrade; do in a hardening pass if time allows before freeze.
- **Phase-6 integration test: gate re-runs on the edited command** — assert an approval-time edit is re-validated and a blocked edit cannot execute (the "re-check after human edit" invariant; no call site exists until the orchestrator lands).

---

*Last updated: Phase 3 (deep-audit pass). Append a new section per phase as it is audited.*
