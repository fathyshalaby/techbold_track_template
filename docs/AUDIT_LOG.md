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

## Cross-phase open items (carry forward)
- **AI SDK v4 vs v5/v6** — pin/reconcile before the Phase-5 agent loop.
- **`docker compose up` smoke on a real Docker host** — confirm the non-root image + graceful shutdown + (now) the live `createActivity` 422 shape. Mocks ≠ reality.
- **Confirm with mentors:** R0 (does grading run the HITL flow unattended? → tiered auto-approve) and passwordless `sudo` for `azureuser`.
- **Per-VM run lock / state-machine race coverage** — due when the run lifecycle lands (Phase 6).

---

*Last updated: Phase 2. Append a new section per phase as it is audited.*
