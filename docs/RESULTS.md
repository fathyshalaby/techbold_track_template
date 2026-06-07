# RESULTS — Service Desk Autopilot

The current, verifiable state of the build: what is implemented, what is tested, how it maps to the requirements and the rubric, and where the remaining work sits. Numbers here are reproducible from the repo (`pnpm test`), not aspirational. Last verified: **2026-06-06**.

> Read alongside [RESULTS' honest framing in LIMITATIONS.md](./LIMITATIONS.md) and the live planning state in [.planning/STATE.md](../.planning/STATE.md). The build follows the nine-phase plan in [.planning/ROADMAP.md](../.planning/ROADMAP.md).

---

## 1. Test results

```
$ pnpm test            # vitest run, from repo root
 Test Files  10 passed | 1 skipped (11)
      Tests  254 passed (254)
   Duration  ~1.5s
```

The one skipped file is `src/tests/orchestrator.test.ts` — a placeholder for Phase 5 (the agent loop is not built yet). All other suites pass.

### Coverage by area

| Suite | Tests | What it proves |
|---|--:|---|
| `safety.test.ts` | 32 | Every blocklist hard-fail → `HIGH_RISK_BLOCKED` and never executes; obfuscation variants still blocked; targeted ops correctly *not* blocked; edited-command danger blocked at approval |
| `safety-policy.test.ts` | (incl.) | Tiered classification (`SAFE_READ_ONLY`/`LOW`/`MEDIUM`/`HIGH_RISK_BLOCKED`); allowlist behaviour |
| `safety-redaction.test.ts` | (incl.) | Keys, tokens, passwords, bearer headers, connection strings stripped while preserving context |
| `phoenix-client.test.ts` | 18 | Bearer header on every request; retry-once on network error; **no** retry on 401/404; typed 422; activity create; status PATCH |
| `phoenix-types.test.ts` | 31 | Zod schemas parse the documented ERP contract |
| `mock-phoenix.test.ts` | 24 | The in-memory mock returns valid fixtures for every client method used in the loop |
| `tickets.test.ts` | 13 | Ticket routes: list/detail/customer-system, sort/filter, graceful 401/404/empty |
| `env.test.ts` | 21 | Conditional-requirement logic; fail-fast with a value-free message; mock-mode relaxation |
| `store-jsonl.test.ts` | 3 | Append-only JSONL fallback for the audit store |
| `app.test.ts` | 2 | Global error handler returns a generic 500 and **never** leaks the thrown message/stack (regression guard against secret leakage) |

> Total **254 passing**. Coverage is deliberately concentrated where the points and the risk live — the safety gate (rubric C, hard-fail immunity) and the ERP contract (rubric A, E).

## 2. Build status by phase

From [.planning/ROADMAP.md](../.planning/ROADMAP.md). Phases 1–3 are complete and tested; 4–9 are scaffolded.

| Phase | Scope | Status |
|---|---|---|
| **1 · Repo Foundation** | Node 22 + Hono + TS migration; Zod-validated env; mock-mode toggle; `docker compose up` → `/health` | ✅ **Complete** |
| **2 · ERP Client + Ticket Routes** | Typed Phoenix client (auth/retry/timeout) + mock; ticket list/detail/customer-system; sort/filter; graceful errors | ✅ **Complete** |
| **3 · Safety Layer + Run Store** | Deterministic blocklist + classifier + redaction (+ tests); append-only SQLite audit store with JSONL fallback | ✅ **Complete** |
| **4 · SSH Executor** | ssh2 single-command executor (timeout, output cap, exit code, redaction) + mock + preflight hardening | ⛏️ Scaffolded |
| **5 · Agent Loop + Orchestrator** | `problem_analyzer`/`problem_solver`/`validator` + deterministic state machine | ⛏️ Scaffolded |
| **6 · Run API + Approvals + SSE** | Run CRUD, approve/edit/reject with safety re-check, SSE stream | ⛏️ Scaffolded |
| **7 · Activity Generation** | `activity_log_generator` from the audit trail only; draft + submit | ⛏️ Scaffolded |
| **8 · Frontend** | Ticket list, run page, approval card, audit timeline, activity editor | ⛏️ Scaffolded |
| **9 · Tests + Submission Polish** | orchestrator tests; README; secret scan; REPORT.md; demo video | ◻️ Partly (REPORT.md ✅, pitch ✅) |

**Code volume today:** ~3,700 lines of TypeScript across `backend/src`, of which the safety layer (`command-policy.ts` alone is 363 lines), the store (`db.ts` 239, `audit.ts` 192), and the Phoenix client (172) are the substantial implemented modules; the `ai/`, `ssh/`, `events/`, and run/approval route files are 2-line stubs awaiting Phases 4–7.

## 3. Requirement coverage

From [.planning/REQUIREMENTS.md](../.planning/REQUIREMENTS.md) — 39 v1 requirements, all mapped to phases.

| Group | Complete | Pending | Notes |
|---|--:|--:|---|
| Platform (PLAT-01…04) | 4 | 0 | env, mock mode, docker, secret hygiene |
| ERP Workflow (ERP-01…06) | 6 | 0 | client + mock + ticket routes + graceful errors |
| Safety & Audit (SAFE-01…06, API-04) | 3 | 4 | blocklist + classifier + edit re-check done; redaction/audit/coverage land with Phase 3 wiring & tests¹ |
| Troubleshooting (DIAG-01…06) | 0 | 6 | Phases 4–5 |
| Run API & Events (API-01…03) | 0 | 3 | Phase 6 |
| Activity (ACT-01…02) | 0 | 2 | Phase 7 |
| Technician UX (UX-01…07) | 0 | 7 | Phase 8 |
| Engineering & Submission (ENG-01…04) | 0 | 4 | Phase 9 — REPORT.md & pitch delivered ahead² |

¹ The redaction function and append-only store exist and are tested (`safety-redaction.test.ts`, `store-jsonl.test.ts`); the requirement IDs flip to Complete as they're wired into the live run path. ² ENG-04 (REPORT.md) and the pitch deck are delivered; ENG-01/02/03 finalise in Phase 9.

## 4. Rubric self-assessment (honest)

A candid read of where the **current** build stands against [scoring.md](./scoring.md), separating *proven now* from *designed, pending implementation*. This is a self-estimate, not a score.

| Block | Pts | Proven now | Pending | Confidence |
|---|--:|---|---|---|
| **A · ERP & MVP** | 20 | Typed client, ticket list w/ sort-filter, customer-system, graceful 401/404/empty (backend + tests) | Activity create wired through a run; UI surfacing | **High** on the API; UI pending (Phase 8) |
| **B · Troubleshooting** | 35 | The generalising diagnosis-first **method** is fully specified ([AGENT_PIPELINE.md](./AGENT_PIPELINE.md)) | The agent loop itself (Phases 4–5) — the decisive, unproven part | **Medium** — design is strong, execution unbuilt |
| **C · Safety & audit** | 20 | Deterministic blocklist, tiered classifier, edit re-check, redaction, append-only store — **all tested** | Wiring into the live SSH path; UI surfacing of the audit timeline | **High** — the crown jewel is real |
| **D · Technician UX** | 10 | — | Entire frontend (Phase 8) | **Pending** |
| **E · Engineering** | 15 | Clean separated modules mirroring the rubric; 254 tests; mocks; `.env.example`; secret hygiene; error handling/timeouts/retries in the client | Real README finalisation; orchestrator tests | **High** on structure/tests |

**Where we are strongest today:** C (safety/audit) and the A/E backend foundation — exactly the high-value, hard-to-fake blocks. **Where the decisive risk remains:** B (the agent loop) and D (the UI), both scaffolded and sequenced next.

## 5. Performance characteristics

- **Test suite:** ~1.5s for 254 tests (no network; mocked fetch/SSH/model).
- **Safety classification & redaction:** pure synchronous functions, sub-millisecond per command — they add no meaningful latency to the approval path.
- **SQLite (better-sqlite3):** synchronous, single-file; audit writes are short and ordered on the single-threaded event loop.
- **Per-command budget (by design):** SSH connect timeout + per-command timeout, output capped at 16 KB before redaction; the orchestrator caps total steps per run to protect the eval-time tie-breaker.

## 6. Practice-VM results (template — to be filled in Phase 5+)

Grading is on fresh hidden VMs; we tune on our own 5 Ubuntu VMs via the reset endpoint and **generalise, never hardcode**. As the agent loop lands, record per-incident results here:

| Practice VM | Symptom (ticket) | Root cause found | Fix score (0–3) | Persists after restart | No regression | Safety flags | Commands |
|---|---|---|---|---|---|---|---|
| VM-1 | _tbd_ | _tbd_ | _tbd_ | _tbd_ | _tbd_ | _0 target_ | _min_ |
| VM-2 | _tbd_ | … | | | | | |
| VM-3 | … | | | | | | |
| VM-4 | … | | | | | | |
| VM-5 | … | | | | | | |

**Targets** (from [PRD.md §7](./PRD.md)): ≥3/5 incidents at fix-score ≥2 (stretch 5/5 at 3); zero hard-fails; complete audit trail; reboot-persistent fixes.

## 7. How to reproduce these results

```bash
pnpm install                 # from repo root (corepack-enabled pnpm)
pnpm test                    # → 254 passed | 1 skipped
# full stack:
cp .env.example .env         # ships MOCK_MODE=true → boots offline
docker compose up --build    # frontend :5173 · backend :8000/health
```

---

*Companions: [LIMITATIONS.md](./LIMITATIONS.md) · [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) · [.planning/ROADMAP.md](../.planning/ROADMAP.md) · [.planning/STATE.md](../.planning/STATE.md).*
