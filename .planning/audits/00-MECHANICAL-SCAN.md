# v1.1 Skeleton Rescue Mechanical Scan

**Generated:** 2026-06-07T02:46:00Z
**Scope:** report-only mechanical scan for v1.1 skeleton rescue
**Production changes:** none

## Empty Tracked Files

None found.

## TODO, FIXME, HACK, XXX

.planning/codebase/CONCERNS.md:8:- Issue: `backend/app/main.py` is a FastAPI skeleton with a single `/health` route and a TODO comment. The architecture decision (documented in `docs/ARCHITECTURE.md` §1) explicitly rejects FastAPI in favor of Node 22 + Hono + TypeScript. The entire backend — Phoenix client, SSH executor, safety layer, orchestrator, store, SSE events — is unwritten.
.planning/codebase/CONVENTIONS.md:126:- Leave `# TODO` in commits — implement or file an issue
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:133:No TBD, FIXME, or XXX markers found in any Phase 2 file. No placeholder returns. No empty handlers. No hardcoded empty arrays or objects in rendering paths. No stubs.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:123:No TBD/FIXME/XXX/TODO markers found in the Phase 3 implementation files (command-policy.ts, classifier.ts, redaction.ts, schema.ts, db.ts, runs.ts, audit.ts, safety*.test.ts, store-jsonl.test.ts).
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:86:| No TBD/FIXME/XXX debt markers in phase files | grep across all ssh/ and ai/tools/ssh-tools.ts | empty | ✓ PASS |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:117:No TBD, FIXME, or XXX markers found in any phase-5-modified files.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:136:No TBD, FIXME, or XXX markers in any Phase 6 files. No placeholder return values or empty handlers. The comment at `runs.ts:67` (`// Split on ':' in advance() at orchestrator.ts:576 — no protocol prefix`) is a legitimate constraint note explaining a non-obvious coupling, not a debt marker.
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:102:No `TBD`, `FIXME`, or `XXX` markers found in phase-modified files.
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:122:**Debt marker gate:** No TBD, FIXME, or XXX markers found in any file modified by this phase.
CLAUDE.md:153:- Leave `# TODO` in commits — implement or file an issue

## Placeholders And Stub Markers

.env.example:18:# with no real creds and never accidentally hits the live ERP with a placeholder
.planning/codebase/CONCERNS.md:13:**Frontend is a placeholder only:**
.planning/codebase/STRUCTURE.md:113:- Contains: Tool input schemas, execute stubs or proposal-recording logic
.planning/milestones/v1.0-MILESTONE-AUDIT.md:73:- Secret scan found no private-key, token-prefix, or bearer-token matches in source; `.env.example` contains placeholders only.
.planning/milestones/v1.0-REQUIREMENTS.md:25:- [x] **PLAT-03**: `.env.example` present with placeholders only; `.env` and `keys/` git-ignored; no secrets committed — *C/E*
.planning/milestones/v1.0-ROADMAP.md:37:  5. `.env` and `keys/` are git-ignored; `.env.example` contains only placeholders and is committed
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:72:    - "All backend/src/ subdirectories from ARCHITECTURE.md §2 exist with stub entry files"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:73:    - ".env and keys/ remain git-ignored; .env.example is committed with placeholders only"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:89:      provides: "stub placeholder — full impl in Plan 02"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:92:      provides: "stub placeholder — full impl in Plan 03"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:95:      provides: "stub placeholder — full impl in Plan 03"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:98:      provides: "stub placeholder — full impl in Plan 03"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:101:      provides: "RiskLevel enum stub"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:116:Create the full backend/src/ directory tree from ARCHITECTURE.md §2 with stub entry files for
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:118:with placeholder keys, and delete the Python artifacts. This plan produces the structural skeleton
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:124:Output: pnpm workspace, rewritten Dockerfile, full backend/src/ tree (stubs), .env.example updated,
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:181:    Rewrite .env.example to include ALL placeholder keys this project needs, with no real values.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:193:    Every value is a placeholder string — no real credentials. Per PLAT-03 and TASKS P0-2.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:203:    .env.example has all 10 keys as placeholders, no real values.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:278:  <name>Task 3a: Scaffold backend/src/ routes, phoenix, ssh, store, events, safety stubs and test stubs</name>
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:281:    use these to write the one-line module-purpose comment on each stub).
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:318:    Create backend/src/ entry-point stubs and all non-AI subsystem stubs. Files that will be
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:319:    fully implemented in later plans get a typed stub export so TypeScript resolves them now.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:321:    Entry-point stubs (Plans 02/03 replace these):
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:323:      // stub — implemented in Plan 02
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:325:      // stub — implemented in Plan 03
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:328:      // stub — implemented in Plan 03
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:332:      // stub — implemented in Plan 03
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:334:    Route stubs (tickets, runs, approvals, activity, events): one-line comment naming the module
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:339:    Phoenix stubs (client, mock, types): same pattern.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:343:    SSH stubs (client, executor, mock, types): same pattern.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:347:    Safety stubs:
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:359:    Store stubs (db, schema, runs, audit): comment + "export {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:360:    Events stubs (run-event-bus, sse): comment + "export {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:362:    Test stubs (backend/src/tests/*.test.ts): one-line stubs with a comment identifying
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:365:      describe.skip('placeholder', () => {});
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:371:    Do NOT implement any business logic. Stubs only.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:379:    All routes/, phoenix/, ssh/, safety/, store/, events/ subdirectories exist with stub files.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:381:    All three test stubs are Vitest-discoverable (describe.skip).
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:382:    Entry-point stubs (env.ts, app.ts, index.ts, routes/health.ts) exist with typed exports.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:388:  <name>Task 3b: Scaffold backend/src/ai/ subtree stubs (agents, tools, orchestrator, model, prompts)</name>
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:392:    activity-log-generator). §3 (agent and orchestrator responsibilities — use for stub comments).
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:411:    Create all ai/ subtree stubs. Every file gets a one-line comment naming the module and
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:418:    Agents (all stubs, implemented in Phase 5+):
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:430:    Tools (all stubs — NOTE: executeApprovedCommand is NEVER registered as a model tool per
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:441:    Do NOT implement any logic. Stubs only. The anti-pattern note in ssh-tools.ts is intentional —
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:452:    ssh-tools.ts stub contains the executeApprovedCommand anti-pattern guardrail comment.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:471:| T-01-01 | Information Disclosure | .env.example | mitigate | Contains only placeholder strings; enforced by reviewer on every commit. No real values. |
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:485:5. Confirm .env.example has no real credentials: `grep -v "^#" .env.example | grep -v "^$" | grep -v "your-" | grep -v "false" | grep -v "openai" | grep -v "gpt"` — output should be empty or only placeholder-safe values
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:496:- All 38+ backend/src/ files from ARCHITECTURE.md §2 exist (stubs are fine for non-Plan-02/03 files)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:500:- .env.example has all 10 required env keys as placeholders; no real secrets
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:516:- NEW FILE: backend/src/env.ts — stub (Plan 02 replaces with Zod parser)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:517:- NEW FILE: backend/src/app.ts — stub Hono app export
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:518:- NEW FILE: backend/src/index.ts — stub serve() bootstrap
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:519:- NEW FILE: backend/src/routes/health.ts — stub GET /health
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:520:- NEW FILE: backend/src/routes/tickets.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:521:- NEW FILE: backend/src/routes/runs.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:522:- NEW FILE: backend/src/routes/approvals.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:523:- NEW FILE: backend/src/routes/activity.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:524:- NEW FILE: backend/src/routes/events.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:525:- NEW FILE: backend/src/phoenix/client.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:526:- NEW FILE: backend/src/phoenix/mock.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:527:- NEW FILE: backend/src/phoenix/types.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:528:- NEW FILE: backend/src/ssh/client.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:529:- NEW FILE: backend/src/ssh/executor.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:530:- NEW FILE: backend/src/ssh/mock.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:531:- NEW FILE: backend/src/ssh/types.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:532:- NEW FILE: backend/src/ai/model.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:533:- NEW FILE: backend/src/ai/prompts.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:534:- NEW FILE: backend/src/ai/orchestrator.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:535:- NEW FILE: backend/src/ai/agents/problem-analyzer.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:536:- NEW FILE: backend/src/ai/agents/customer-system-analyzer.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:537:- NEW FILE: backend/src/ai/agents/problem-solver.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:538:- NEW FILE: backend/src/ai/agents/validator.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:539:- NEW FILE: backend/src/ai/agents/activity-log-generator.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:540:- NEW FILE: backend/src/ai/tools/phoenix-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:541:- NEW FILE: backend/src/ai/tools/ssh-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:542:- NEW FILE: backend/src/ai/tools/audit-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:543:- NEW FILE: backend/src/ai/tools/safety-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:544:- NEW FILE: backend/src/safety/command-policy.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:545:- NEW FILE: backend/src/safety/classifier.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:546:- NEW FILE: backend/src/safety/redaction.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:548:- NEW FILE: backend/src/store/db.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:549:- NEW FILE: backend/src/store/schema.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:550:- NEW FILE: backend/src/store/runs.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:551:- NEW FILE: backend/src/store/audit.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:552:- NEW FILE: backend/src/events/run-event-bus.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:553:- NEW FILE: backend/src/events/sse.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:554:- NEW FILE: backend/src/tests/safety.test.ts — discoverable stub (describe.skip)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:555:- NEW FILE: backend/src/tests/phoenix-client.test.ts — discoverable stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:556:- NEW FILE: backend/src/tests/orchestrator.test.ts — discoverable stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:10:    - backend/src/ full directory tree stubs
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:25:    - Stub-first scaffold (export {} + comment per module)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:76:    - .env.example (added 10 placeholder keys)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:86:  - "RiskLevel enum implemented for real in Plan 01 — all other stubs are export {} placeholders"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:87:  - "ssh-tools.ts stub carries an explicit anti-pattern comment: executeApprovedCommand must never be a model tool"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:97:# Phase 01 Plan 01: Node Scaffold and Stub Tree Summary
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:99:Replaced the dead Python/FastAPI skeleton with the locked Node 22 + Hono + TypeScript scaffold. pnpm workspace established at repo root; backend Dockerfile rewritten to node:22-slim with corepack + pnpm; full backend/src/ directory tree (41 TypeScript files) created as typed stubs per ARCHITECTURE.md §2.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:109:- All 41 backend/src/ TypeScript stubs: routes, phoenix, ssh, safety, store, events, ai (agents + tools), plus 3 Vitest test stubs
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:110:- backend/src/safety/risk-levels.ts: real RiskLevel enum (SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED) — only non-stub file in this plan
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:111:- .env.example updated with all 10 required placeholder keys; no real credentials
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:131:## Known Stubs
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:133:All backend/src/ files except risk-levels.ts are intentional stubs (`export {}` with a phase comment). These are tracked per-plan:
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:135:| File | Stub type | Resolved in |
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:146:- .env.example contains only placeholder strings
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:156:- 7cb0d5a: chore(01-01): scaffold backend/src/ routes, phoenix, ssh, store, events, safety stubs
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:157:- bc7f2e9: chore(01-01): scaffold backend/src/ai/ subtree stubs (agents, tools, orchestrator)
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:168:Run after RED phase (tests written, env.ts still a stub):
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:44:- `backend/src/env.ts` — full implementation replacing the `export {}` stub:
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:66:| RED phase: 19/20 tests fail against stub | PASS |
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:90:## Known Stubs
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:166:    set them to placeholder strings in the shell for the test run, or confirm .env.example values
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:237:5. .env and keys/ are git-ignored; .env.example committed with placeholders only
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:240:   Command: git -C /Users/julianschmidt/Documents/GitHub/techbold_track_template grep -v '^#' .env.example | grep -v '^$' | grep -v '=your_' | grep -v '=$' | grep -v '=placeholder' | grep -v '=changeme'
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:245:   Expected: env.test.ts all pass; stub describe.skip files report 0 failures
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:253:- .env.example committed, contains only placeholder values, no real secrets
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:256:- pnpm test green (env.test.ts passes; stub tests skipped, not failed)
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:38:  - "Verification run used stub env vars (MOCK_MODE=true, placeholder strings) via docker run --env — avoids committing a .env file and confirms PLAT-04 mode toggle works"
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:66:| `GET /health` with stub env (MOCK_MODE=true) | PASS — `{"status":"ok","mode":"mock"}` |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:96:## Known Stubs
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:98:None — all three files are fully implemented. No Phase 2+ route stubs exist in app.ts.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:9:Migrate the backend from the dead Python/FastAPI skeleton to the locked Node 22 + Hono + TypeScript stack, establish Zod-validated fail-fast env config, and stand up the mock-mode seam that every later phase plugs into. This phase ships infrastructure only — no Phoenix, SSH, or agent features. It delivers: `docker compose up` serving `GET /health`, a fail-fast env parser, the per-service mock toggle pattern, a pnpm workspace, and committed `.env.example` with placeholders.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:20:- **D-02:** Phase 1 builds the **seam + health stub only** — not full mock clients (no real services exist yet). Concretely: a client-resolution pattern (`registerClient`/`resolveClient` or equivalent `selectX()` resolver) that honors the per-service flags, plus `GET /health → { status: 'ok', mode: 'mock' | 'real' }` proving the toggle is wired. Later phases register their real+mock implementations into this seam.
.planning/milestones/v1.0-phases/01-repo-foundation/01-DISCUSSION-LOG.md:30:| Seam + health stub | Phase 1 builds only the client-resolution seam + a `/health` that reports mode; later phases plug real+mock impls in | ✓ |
.planning/milestones/v1.0-phases/01-repo-foundation/01-DISCUSSION-LOG.md:33:**User's choice:** Seam + health stub (Recommended)
.planning/milestones/v1.0-phases/01-repo-foundation/01-DISCUSSION-LOG.md:64:- Exact Zod env schema shape and which keys are required vs optional (bounded by `.env.example` placeholders + ARCHITECTURE.md §10 config rules).
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:22:| 5 | `.env`/`keys/` git-ignored; `.env.example` placeholders committed | `git check-ignore` confirms both ignored; `.env.example` tracked; no `.env`/`*.pem`/`*.key` tracked | ✓ |
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:28:- **PLAT-03** (`.env.example` placeholders; secrets git-ignored) — 01-01 ✓
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:33:D-01 per-service mock flags + master override · D-02 seam + health stub only · D-03 pnpm workspace, npm lockfile deleted · D-04 tsx-direct `node:22-slim` Dockerfile.
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:42:- Test stubs for `safety`/`phoenix-client`/`orchestrator` are empty (0 tests) by design — filled in Phases 2/3/5.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:77:    - backend/src/phoenix/types.ts — current stub (export {})
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:103:    Replace the stub in backend/src/phoenix/types.ts.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:109:    GREEN: Replace types.ts stub with full schema definitions. All schemas use z.object(). Use
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:87:    - backend/src/phoenix/client.ts — current stub
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:88:    - backend/src/tests/phoenix-client.test.ts — current stub (describe.skip)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:123:    - listTickets happy: vi.stubGlobal('fetch', ...) returns 200 with [{id:1,...}]; expect result[0].id === 1
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:137:    cases above using vi.stubGlobal('fetch', vi.fn()) for fetch mocking. Import PhoenixClient and
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:139:    (import resolves to empty stub).
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:141:    GREEN: Replace backend/src/phoenix/client.ts stub with full implementation.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:171:    No fetch call in any test goes to the network (all stubbed).
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:32:    - "Mock has 3-5 generic placeholder tickets spanning OPEN/PENDING/DONE and varied priority"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:99:    - backend/src/phoenix/mock.ts — current stub
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:135:    Replace the stub in backend/src/phoenix/mock.ts with full implementation per the behavior
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:167:    - backend/src/routes/tickets.ts — current stub
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:217:    Replace backend/src/routes/tickets.ts stub with full Hono router per the behavior block.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:91:102/102 tests passing (`npm test`). Zero TypeScript errors (`tsc --noEmit`). No tests skipped beyond pre-existing safety/orchestrator stubs.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:107:## Known Stubs
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:30:- Fixtures are generic placeholders — no real symptom strings, hostnames, or per-incident data. Generalisation rule forbids hardcoding.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:46:- Stub files already exist and must be filled: `phoenix/client.ts`, `phoenix/mock.ts`, `phoenix/types.ts`, `routes/tickets.ts`.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:93:| Full test suite passes | `npm test` in `backend/` | 105 passed, 2 skipped (safety/orchestrator stubs — pre-existing, not Phase 2) | PASS |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:133:No TBD, FIXME, or XXX markers found in any Phase 2 file. No placeholder returns. No empty handlers. No hardcoded empty arrays or objects in rendering paths. No stubs.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:173:    Create `backend/src/tests/safety-policy.test.ts`. Use a top-level `describe('safety — policy and classifier', ...)` block. Import `validateCommandAgainstPolicy` from `../safety/command-policy.js` and `classifyCommand` from `../safety/classifier.js` using ESM `.js` import suffixes (established pattern from Phase 2). Import `RiskLevel` from `../safety/risk-levels.js`. All tests in this task fail because the implementations are stubs that export nothing. Commit with message: `test(03-01): add failing tests for blocklist policy and classifier`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:180:  <done>Test file imports from the two stub modules and all new tests fail (RED state). No compile errors — only runtime/assertion failures.</done>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:67:- RED gate: `test(03-01): add failing tests for blocklist policy and classifier` — all 48 tests failed (stubs exported nothing).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:98:## Known Stubs
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:76:    - backend/src/safety/redaction.ts (empty stub to implement against)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:141:    Create `backend/src/tests/safety-redaction.test.ts` with the `describe('safety — redaction')` block described above. Use the ESM `.js` import suffix. All tests fail because the stub exports nothing. Commit: `test(03-02): add failing tests for secret redaction`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:86:## Known Stubs
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:73:## Known Stubs
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:100:    - backend/src/tests/safety.test.ts (current stub state — replace describe.skip with live test blocks)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:202:    At this point (Wave 2, after 03-01 through 03-03 complete), the implementations exist. The RED state here means this consolidated file starts as the stub (`describe.skip`) — write the full test body now and confirm the suite runs (not skipped). It should be GREEN immediately if 03-01/02 implemented correctly, but treat any failures as the RED state to fix before the GREEN commit. Commit: `test(03-04): add §9 consolidated safety test suite`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:34:`backend/src/tests/safety.test.ts` replaced the `describe.skip` stub with 65 live test cases across 7 nested describes matching the §9 categories:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:80:## Known Stubs
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:47:- Tests live in `backend/src/tests/`; `safety.test.ts` and `orchestrator.test.ts` exist as empty stubs to fill.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:65:internal commas produced 11 fragments for 6 placeholders, misaligning every param.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:82:- Full suite: 253 passed, 1 skipped (Phase 5 orchestrator stub), 0 failed
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:88:**Fix:** Replace the comma-split SET parser with one that counts `?` placeholders rather than
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:93:// Option A: count ? placeholders to pair params correctly
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:99:  const placeholders = (part.match(/\?/g) ?? []).length;
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:100:  if (colMatch2 && placeholders > 0) {
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:103:  paramIdx += placeholders;
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:10:    evidence: "Phase 6 success criteria #2: 'Approve (with optional edit) → safety re-check → execute → observation recorded; reject-with-reason → agent proposes alternative'. The approvals.ts route is a deliberate stub (export {}) in Phase 3; the HTTP-level 422 + audit write at the route layer is Phase 6 work. The underlying pure-function re-check (validateCommandAgainstPolicy, SAFE-05) is fully implemented and tested in Phase 3."
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:34:| 2 | An edited command is re-validated at approval time; a dangerous edit is blocked with 422 + `BLOCKED` audit entry | ⬇ DEFERRED | The pure-function re-check (validateCommandAgainstPolicy, SAFE-05) is implemented and tested. The HTTP-level 422 + audit write requires approvals.ts route — which is a deliberate stub (`export {}`) wired in Phase 6. See deferred section. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:47:| 1 | Edited command blocked with 422 + BLOCKED audit entry (HTTP route layer) | Phase 6 | Phase 6 SC-2: "Approve (with optional edit) → safety re-check → execute → observation recorded" — the approvals.ts route is a deliberate empty stub in Phase 3 |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:93:| All 253 tests pass | `npm test` (backend/) | 253 passed, 0 failed, 1 skipped (orchestrator stub) | ✓ PASS |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:112:| SAFE-05 | 03-01, 03-04 | Edited commands re-validated at approval time; dangerous edit blocked | ✓ SATISFIED | validateCommandAgainstPolicy is a pure stateless function — calling it on the edited command is structurally identical to proposal-time check; SAFE-05 test in safety.test.ts passes. HTTP 422 response is Phase 6 work (approvals.ts stub). |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:120:| `backend/src/routes/approvals.ts` | 1-2 | `export {}` stub | ℹ Info | Deliberate — Phase 6 will implement. Not a Phase 3 deliverable. |
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:43:Output: `backend/src/ssh/types.ts` with five exports: `CommandResult`, `PreflightResult`, `SshConnectionError`, `SshTarget`, `SshExecutor` interface. Replaces the empty stub.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:66:    - backend/src/ssh/types.ts (current stub — empty export {})
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:85:    Write backend/src/ssh/types.ts replacing the empty stub.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:41:`backend/src/ssh/types.ts` replaced the empty `export {}` stub with five named exports:
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:33:Purpose: RED phase. Tests define the exact behavioral contracts that executor.ts (04-03) must satisfy. Running the suite against the empty stub must fail. After 04-03 ships, the suite turns GREEN without modification.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:56:    All tests import from ../ssh/executor.js. The executor stub is empty (export {}) so every
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:95:    empty stub), commit: test(04-02): add failing executor behavioral tests
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:108:    - backend/src/ssh/executor.ts (current stub — must still be empty export {} when tests are written)
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:171:    - Suite FAILS (RED) when run against the empty executor.ts stub — at least one test fails with "is not a function" or import error
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:178:  <done>ssh-executor.test.ts exists with all 5 test groups, runs RED against the empty stub, and is committed.</done>
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:188:| test → executor.ts | Tests import from executor.ts; if the import succeeds unexpectedly (stub has partial impl), some tests may pass prematurely — RED verification must show at least one group failing |
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:201:- vitest run ssh-executor.test.ts exits non-zero (RED — executor stub is empty)
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:34:`backend/src/tests/ssh-executor.test.ts` — 14 `it()` blocks across 5 describe groups. The suite runs RED (13 fail + 1 passes) against the empty `executor.ts` stub. Plan 04-03 will make it GREEN by implementing the real executor.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:71:## Known Stubs
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:54:- `tsc --noEmit` scoped to mock.ts: no errors (pre-existing executor stub error in 04-02 is out of scope)
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:56:- Full suite: 271 pass, 13 fail (all failures are pre-existing RED state from 04-02 executor stub — no regressions)
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:72:None — fixture data is fully synthetic (no real credentials, IPs are fictional). Anti-pattern A1 guard (T-04M-A1) confirmed passing: `ai/tools/ssh-tools.ts` is an empty stub with no import of `executeApprovedCommand`.
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:74:## Known Stubs
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:75:    - backend/src/ai/tools/ssh-tools.ts (stub — replace entirely)
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:95:    Replace the export {} stub with the full module. Import tool and z from 'ai' and 'zod'.
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:105:- **Issue:** `ssh-executor.test.ts` and `ssh-mock.test.ts` A1 guards grepped for any reference to executor symbols in `ai/tools/` — this was correct when `ssh-tools.ts` was a stub but fails now that it legitimately imports `executeApprovedCommand` and `createMockSshExecutor` to build the factory
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:50:- Existing stub files at `backend/src/ssh/{client,executor,mock,types}.ts` are empty `export {}` placeholders to be filled.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:109:    stub) — add a describe block 'RunPhase enum migration' with the behavior cases above using
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:85:## Known Stubs
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:73:    - backend/src/ai/model.ts — current stub (export {})
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:78:    Replace the stub in backend/src/ai/model.ts.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:115:    - backend/src/ai/prompts.ts — current stub (export {})
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:130:    Replace the stub in backend/src/ai/prompts.ts.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:92:## Known Stubs
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:136:## Known Stubs
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:155:      Mock problem-analyzer to throw new Error('LLM timeout').
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:50:`backend/src/events/run-event-bus.ts` — implemented from stub:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:115:**1. [Rule 2 - Missing] run-event-bus.ts was a stub `export {}`**
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:51:| `backend/src/ai/model.ts` | getModel() factory — real openai or mock LanguageModelV1 | VERIFIED | Fully implemented, not a stub; both paths present |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:58:| `backend/src/events/run-event-bus.ts` | RunEventBus class with emit()/subscribe(), runEventBus singleton | VERIFIED | Implemented from stub during Plan 05; imported and used in advance() performSideEffects |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:114:| `orchestrator.ts` | 383–396 | Dummy DiagnosticProposal with empty strings passed to reduce() for max-steps trigger | Info | Not a stub — the reducer short-circuits to WAITING_FOR_ACTIVITY_REVIEW before acting on the proposal fields. The empty values never reach a createPendingApproval or SSH call. Intentional design; no impact. |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:124:  - Query pending approval: getDb().get('SELECT * FROM command_approvals WHERE run_id = ? AND status = ?', [runId, 'PENDING']) — parse with CommandApprovalSchema or return null
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:169:- RED: runs.test.ts has ≥8 contract tests and they fail against the stub runs.ts (export {})
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:25:    - vi.clearAllMocks() in afterEach to preserve vi.mock() factory stubs across tests
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:62:**1. [Rule 1 - Bug] vi.restoreAllMocks() broke vi.mock() factory stubs across tests**
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:100:  1. RED: Write tests in backend/src/tests/approvals.test.ts. Use same vi.mock('../env.js') pattern. Use makeJsonlAdapter() + setDb() for each test. Use vi.spyOn on orchestrator module's advance export (same pattern as orchestrator.test.ts). Tests should fail against the stub approvals.ts (export {}).
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:173:- RED: approvals.test.ts has ≥9 contract tests and they fail against stub approvals.ts
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:83:  Replace the stub in backend/src/events/sse.ts with a createSseStream export.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:129:  Replace the stub in backend/src/routes/events.ts with a proper Hono router.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:60:- `events/sse.ts` is a stub for the `streamSSE` wiring helper; `routes/events.ts` is the route stub.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:136:No TBD, FIXME, or XXX markers in any Phase 6 files. No placeholder return values or empty handlers. The comment at `runs.ts:67` (`// Split on ':' in advance() at orchestrator.ts:576 — no protocol prefix`) is a legitimate constraint note explaining a non-obvious coupling, not a debt marker.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:88:  - backend/src/ai/agents/activity-log-generator.ts — current stub (2-line export {})
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:105:  - Mock `'../env.js'` the same way approvals.test.ts does (resolveClientMode → 'mock', getEnv returns stub values)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:110:  Then stub `backend/src/ai/agents/activity-log-generator.ts` just enough for the import to resolve without error (export the type `ActivityLogGeneratorInput`, export a placeholder `runActivityLogGenerator` that immediately throws `new Error('not implemented')`, export `MOCK_ACTIVITY_DRAFT` as an empty object `{}` cast to the right type). This makes tests RED.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:130:  <done>Test file exists, imports resolve, all tests fail with "not implemented" or schema mismatch — RED confirmed</done>
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:156:  Replace the stub in `backend/src/ai/agents/activity-log-generator.ts` with the full implementation mirroring validator.ts exactly:
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:68:## Known Stubs
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:70:None — all exports are fully implemented. `MOCK_ACTIVITY_DRAFT` is an intentional constant (not a stub) used for offline/mock-mode operation, consistent with `MOCK_VALIDATION_RESULT_LIKELY` in `validator.ts`.
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:112:  - `vi.mock('../env.js', ...)` with resolveClientMode → 'mock', getEnv returns stub object
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:114:  - Import `app` from `'../app.js'` — routes must be mounted in app.ts (plan 07-03), but for tests use vi.spyOn on the activityRouter's imported modules so the stub route stub resolves
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:115:  - Actually: import `activityRouter` directly and test it via `new Hono().route('/api/runs', activityRouter)` as a standalone app in tests — this avoids needing app.ts mounted (same isolation used in approvals tests via `app` which already mounts everything; since app.ts is mounted in plan 07-03, use `app` from app.js but stub the activityRouter import — OR test activityRouter directly). Use the `app` import approach: since 07-03 mounts activityRouter into app.ts, tests that use `app.request(...)` will work after 07-03. For 07-02 tests, construct a local Hono instance: `const testApp = new Hono(); testApp.route('/api/runs', activityRouter)` — this makes 07-02 tests independent of 07-03 mount order
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:121:  Then replace `backend/src/routes/activity.ts` stub with a minimal export that makes imports resolve but all routes return 501:
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:123:  - Export `SubmitBodySchema = z.object({})` placeholder
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:124:  - Add two stub routes (`post('/:runId/activity/draft', ...)` and `post('/:runId/activity/submit', ...)`) that return `c.json({ error: 'not implemented' }, 501)`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:132:  <done>Test file exists with 11 tests, all failing — RED confirmed. activityRouter stub exports resolve without TypeScript errors.</done>
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:153:  Replace the stub implementation in `backend/src/routes/activity.ts` with the full router. Key identifiers and contracts:
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:80:None — plan executed exactly as written. Test file already existed as untracked from the WIP scaffold commit (`0035a41`) with all 11 tests fully written; stub in `activity.ts` already returned 501. RED gate confirmed by running vitest (11/11 failing), then GREEN implemented.
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:94:## Known Stubs
.planning/milestones/v1.0-phases/07-activity-generation/07-03-SUMMARY.md:46:## Known Stubs
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:101:  should mount on the same prefix (`activity.ts` currently a stub).
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:107:- `routes/activity.ts` (stub) → implement `activityRouter`, mount in `app.ts`
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:109:- `ai/agents/activity-log-generator.ts` (stub) → implement `runActivityLogGenerator`.
.planning/milestones/v1.0-phases/07-activity-generation/07-UAT.md:15:  outcomes from the audit trail — not placeholder text, not invented facts.
.planning/milestones/v1.0-phases/07-activity-generation/07-UAT.md:21:expected: Start the backend with the real LLM path, POST to `/api/runs/:id/activity/draft` on a run with real (or seeded) audit events and command results. All 5 fields reference actual audit data — no fabrications, no placeholders.
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:10:    expected: "All 5 fields contain non-empty text grounded in the actual audit data — no invented facts, no placeholder text"
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:109:**Expected:** All 5 fields contain non-empty text that references actual commands and outcomes from the audit trail — not placeholder text, not invented facts
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:198:    Assert every mapping listed in the behavior block. Run RED first (empty stubs
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:87:## Known Stubs
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:59:## Known Stubs
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:58:Output: App.tsx shell + TicketListView component. Stubs for RunView and
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:59:ActivityView are imported but render a placeholder so the app compiles; those
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:79:  <name>Task 1: App.tsx view-state shell with stub sub-views</name>
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:94:    Create stub files so App.tsx compiles. These prop interfaces are the exact
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:168:    RunView.tsx stub exists with props { runId, ticketTitle, customerSystem, onActivityReady }.
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:169:    ActivityView.tsx stub exists with props { runId, activityDraft, onBack } (onBack, not onDone).
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:262:- ActivityView stub uses onBack prop (not onDone)
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:266:- frontend/src/App.tsx is the view-state shell (no longer the skeleton placeholder)
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:268:- frontend/src/components/RunView.tsx stub has props { runId, ticketTitle, customerSystem, onActivityReady }
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:269:- frontend/src/components/ActivityView.tsx stub has props { runId, activityDraft, onBack }
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:286:| RunView (stub) | frontend/src/components/RunView.tsx | component stub |
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:287:| ActivityView (stub) | frontend/src/components/ActivityView.tsx | component stub |
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:8:  provides: [App-shell, TicketListView, RunView-stub, ActivityView-stub]
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:38:**Task 1 — App.tsx view-state shell + stubs (b39b5cb)**
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:47:- `RunView.tsx` stub: props `{ runId, ticketTitle, customerSystem, onActivityReady }` — exact contract for plan 08-04
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:48:- `ActivityView.tsx` stub: props `{ runId, activityDraft, onBack }` — `onBack` not `onDone`; exact contract for plan 08-05
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:78:## Known Stubs
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:80:| File | Stub | Reason |
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:82:| `frontend/src/components/RunView.tsx` | Renders placeholder div | Full implementation in plan 08-04 |
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:83:| `frontend/src/components/ActivityView.tsx` | Renders placeholder div | Full implementation in plan 08-05 |
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:85:These stubs do not block the plan's goal — the ticket list and view-state shell are fully functional. RunView and ActivityView are replaced in subsequent plans with the contracts defined here.
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:59:Replace the RunView stub with the full run page: a live SSE-driven timeline,
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:148:        - Textarea (class "reject-reason-textarea") bound to rejectReason; placeholder "Reason (required)"
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:198:    - frontend/src/components/RunView.tsx — current stub to replace; props interface must match exactly: { runId, ticketTitle, customerSystem, onActivityReady }
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:224:    Props interface must match the stub defined in plan 08-03 exactly:
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:315:    Prop interface matches the stub from plan 08-03 exactly (includes customerSystem: CustomerSystem | null).
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:365:- frontend/src/components/RunView.tsx replaces the stub with full run page including customer system header
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:379:| RunView | frontend/src/components/RunView.tsx | component (replaces stub) |
.planning/milestones/v1.0-phases/08-frontend/08-04-SUMMARY.md:38:**RunView** (`frontend/src/components/RunView.tsx`): Replaces the stub. Hooks: `useRunEvents(runId)` for the event stream, `useRun(runId)` for `pendingApproval` and `phase` (these never come from the SSE hook). `useEffect` on `events.length` calls `refresh()` when a key event type arrives. Timeline auto-scrolls via a sentinel ref. `ApprovalCard` rendered in `.approval-slot` when `pendingApproval` is non-null; `onDecided` wired to `refresh()`. Abort button always visible; Advance button hidden on terminal phases and `WAITING_FOR_ACTIVITY_REVIEW`; Review Activity Report button shown only in `WAITING_FOR_ACTIVITY_REVIEW`. Customer system header shows ip/port/username/os with "–" fallback when null.
.planning/milestones/v1.0-phases/08-frontend/08-04-SUMMARY.md:61:## Known Stubs
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:34:Replace the ActivityView stub with the full activity editor: five editable
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:40:Output: ActivityView.tsx as a standalone component replacing the stub; minor
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:65:    - frontend/src/components/ActivityView.tsx — current stub; props interface must stay identical
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:82:    Props interface stays identical to the stub (runId, activityDraft, onBack) — DO NOT change it.
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:142:    Prop interface matches the stub defined in plan 08-03 exactly.
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:182:- frontend/src/components/ActivityView.tsx replaces stub with full five-field editor
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:195:| ActivityView | frontend/src/components/ActivityView.tsx | component (replaces stub) |
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:30:Five-field activity editor replacing the stub; technician reviews AI-drafted report, edits freely, and submits overrides to Phoenix via POST /api/runs/:id/activity/submit.
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:34:`ActivityView` replaces the placeholder stub with a fully functional form:
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:53:- Props interface (`runId`, `activityDraft`, `onBack`) unchanged from stub
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:64:## Known Stubs
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:124:**Stub gate:** No placeholder/coming-soon text found in any delivered component. The two `return null` hits in RunView.tsx are in `payloadCommand` and `payloadSummary` helper functions (sentinel returns on type mismatch), not stub implementations.
.planning/milestones/v1.0-phases/09-tests-submission-polish/09-03-PLAN.md:10:- Review matches for real secrets versus placeholders/test fixtures.
.planning/milestones/v1.0-phases/09-tests-submission-polish/09-03-SUMMARY.md:6:- Matches were placeholders, planning examples, documentation examples, or redaction test fixtures.
.planning/milestones/v1.0-phases/09-tests-submission-polish/09-CONTEXT.md:31:- Treat `.env.example` placeholders and test redaction fixtures as non-secret false positives when reviewing results.
backend/src/ai/model.ts:18:    throw new Error('Mock model does not support streaming');
backend/src/ai/orchestrator.ts:673:  if (!run) throw new Error(`Run not found: ${runId}`);
backend/src/env.ts:51:    throw new Error(`Missing or invalid required env var: ${key}`);
backend/src/routes/approvals.ts:21:  if (!row) return undefined;
backend/src/routes/runs.ts:33:  if (!pending) return null;
backend/src/store/audit.ts:190:  if (!row) return undefined;
backend/src/store/db.ts:117:    if (!m) return undefined;
backend/src/store/db.ts:120:    return undefined;
backend/src/store/db.ts:129:        throw new Error('audit_events is append-only');
backend/src/store/db.ts:133:      if (!table) throw new Error(`JSONL adapter: cannot parse table from SQL: ${sql}`);
backend/src/store/db.ts:139:        if (!colMatch) throw new Error(`JSONL adapter: cannot parse columns from SQL: ${sql}`);
backend/src/store/db.ts:176:      if (!tableMatch) return undefined;
backend/src/store/db.ts:188:      return undefined;
backend/src/store/runs.ts:18:  if (!row) return undefined;
backend/src/tests/activity-log-generator.test.ts:47:      throw new Error('mock model does not support streaming');
backend/src/tests/activity-log-generator.test.ts:60:      throw new Error('model unavailable');
backend/src/tests/activity-log-generator.test.ts:63:      throw new Error('mock model does not support streaming');
backend/src/tests/activity-log-generator.test.ts:85:      throw new Error('mock model does not support streaming');
backend/src/tests/activity-log-generator.test.ts:161:        throw new Error('mock model does not support streaming');
backend/src/tests/app.test.ts:27:      throw new Error(SENTINEL);
backend/src/tests/orchestrator.test.ts:306:        throw new Error('model unavailable');
backend/src/tests/orchestrator.test.ts:309:        throw new Error('mock model does not support streaming');
backend/src/tests/orchestrator.test.ts:331:        throw new Error('model unavailable');
backend/src/tests/orchestrator.test.ts:334:        throw new Error('mock model does not support streaming');
backend/src/tests/orchestrator.test.ts:555:        throw new Error('mock model does not support streaming');
backend/src/tests/orchestrator.test.ts:583:        throw new Error('mock model does not support streaming');
backend/src/tests/phoenix-client.test.ts:64:    vi.unstubAllGlobals();
backend/src/tests/phoenix-client.test.ts:69:      vi.stubGlobal('fetch', makeFetch(200, [mockTicket]));
backend/src/tests/phoenix-client.test.ts:76:      vi.stubGlobal('fetch', makeFetch(200, []));
backend/src/tests/phoenix-client.test.ts:82:      vi.stubGlobal('fetch', makeFetch(401, { detail: 'Unauthorized' }));
backend/src/tests/phoenix-client.test.ts:88:      vi.stubGlobal('fetch', fetchMock);
backend/src/tests/phoenix-client.test.ts:98:      vi.stubGlobal('fetch', makeFetch(200, mockTicket));
backend/src/tests/phoenix-client.test.ts:105:      vi.stubGlobal('fetch', makeFetch(404, { detail: 'Not found' }));
backend/src/tests/phoenix-client.test.ts:117:      vi.stubGlobal('fetch', makeFetch(200, mockCustomerSystem));
backend/src/tests/phoenix-client.test.ts:126:      vi.stubGlobal('fetch', makeFetch(200, mockEmployee));
backend/src/tests/phoenix-client.test.ts:135:      vi.stubGlobal('fetch', makeFetch(201, mockActivity));
backend/src/tests/phoenix-client.test.ts:146:      vi.stubGlobal('fetch', makeFetch(422, { detail: [{ loc: ['body'], msg: 'field required', type: 'missing' }] }));
backend/src/tests/phoenix-client.test.ts:156:      vi.stubGlobal('fetch', makeFetch(200, updated));
backend/src/tests/phoenix-client.test.ts:165:      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
backend/src/tests/phoenix-client.test.ts:180:      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failure')));
backend/src/tests/phoenix-client.test.ts:186:      vi.stubGlobal('fetch', fetchMock);
backend/src/tests/phoenix-client.test.ts:193:      vi.stubGlobal('fetch', fetchMock);
backend/src/tests/phoenix-client.test.ts:200:      vi.stubGlobal('fetch', fetchMock);
backend/src/tests/phoenix-client.test.ts:215:      vi.stubGlobal('fetch', fetchMock);
docs/AUDIT_LOG.md:30:| 6 | 🟠 | Unsafe default: `.env.example MOCK_MODE=false` → fresh clone could hit live ERP with a placeholder token | Default `MOCK_MODE=true` (boots offline; flip for real runs) | `fec2b31` |
docs/AUDIT_LOG.md:174:The branch shipped the executor **test spec** (`ssh-executor.test.ts`, 244 lines — excellent) and the **mock** (`mock.ts`, 14/14 green), but `ssh/executor.ts` was still a stub (`export {}`). The phase's own `04-04-SUMMARY` admitted it: *"271 pass, 13 fail — pre-existing RED state from the 04-02 executor stub."* This is the single critical-path component for the B-score (acting on a real VM); without it only mock mode works. Plans `04-03` (preflight) and `04-05` (tools factory) were also unexecuted (no summaries). **Decision (with user): implement the full phase + land on `main` with no regressions.**
docs/AUDIT_LOG.md:214:- *Re-running the safety gate inside the executor* (belt-and-suspenders) — the gate already runs at proposal and post-edit; a third check is the wrong layer and could mask an upstream bug. Flagged for the orchestrator phase as a *consideration*, not implemented.
docs/AUDIT_LOG.md:304:- `activity-log-generator` agent + `audit/phoenix/safety` tools are still 2-line stubs (Phase 7 scope). Expected.
docs/AUDIT_LOG.md:352:**First check (planning-only): SUPERSEDED — Phase 6 is now implemented & landed; see the "IMPLEMENTED & RECONCILED" subsection below.** *(Original note, kept for history:)* the branch initially added only `.planning/phases/06-*` docs with zero `backend/src` changes; the routes were 2-line stubs.
docs/AUDIT_LOG.md:391:- **🔴 No HTTP surface yet (Phase 6).** The full engine exists (orchestrator + safety + executor + agents, all tested) but `routes/{runs,approvals,events}.ts` are 2-line stubs and `app.ts` mounts only `/health` + `/api/tickets`. **You cannot drive an incident end-to-end via the API today** — Phase 6 is the missing keystone. Highest-value *next build* (with the reconciliation caveat above).
docs/AUDIT_LOG.md:393:- **Activity generation (Phase 7) absent:** `activity-log-generator` agent + `routes/activity.ts` are stubs — the "draft ERP activity from the audit trail" step (part of the scored deliverable) isn't built.
docs/AUDIT_LOG.md:464:**Checked & landed on `main`.** The final lifecycle step: the `activity-log-generator` agent (was a stub) + `routes/activity.ts` (draft + submit to Phoenix) + prompt/types additions + ~470 lines of tests (`activity.test`, `activity-log-generator.test`). Phase 7's own suite: 473 pass.
docs/IMPLEMENTATION_PROCEDURE.md:46:Add the new keys to `.env.example` (placeholders only — no secrets). `env.ts` parses these through
docs/IMPLEMENTATION_PROCEDURE.md:366:  no VM, no LLM cost if you also stub the model. Use for unit tests, offline dev, and the live
docs/IMPLEMENTATION_PROCEDURE.md:410:| LLM rate-limit / outage | Stub model returns a canned `DiagnosticProposal`; manual command entry still works (human-in-the-loop is the point). |
docs/TASKS.md:23:  Zod-validated env; add LLM/SSH/Phoenix/MOCK_MODE keys to `.env.example` (placeholders only).
frontend/src/api.ts:28:    throw new Error(message);
frontend/src/components/ApprovalCard.tsx:136:            placeholder="Reason (required)"
frontend/src/components/RunView.tsx:32:  return null;
frontend/src/components/RunView.tsx:40:  return null;
knowledge/runbooks/networking-web-tls.md:33:**Root causes:** `/etc/resolv.conf` is a stale regular file (or wrong symlink target) instead of `-> ../run/systemd/resolve/stub-resolv.conf`; dead nameservers; `systemd-resolved` not running (stub `127.0.0.53` doesn't answer); wrong/empty upstream in `/etc/systemd/resolved.conf` or no per-link DNS; DNSSEC validation failing (SERVFAIL); poisoned cache.
knowledge/runbooks/networking-web-tls.md:34:**Durable fix:** restore symlink `sudo ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf` + `sudo systemctl enable --now systemd-resolved`. Set upstream durably via netplan (`/etc/netplan/*.yaml` → `nameservers:` → `netplan apply`) or `/etc/systemd/resolved.conf` (`DNS=1.1.1.1 8.8.8.8` → restart resolved). If DNSSEC is the culprit and zone is genuinely broken: `DNSSEC=allow-downgrade`. Flush: `sudo resolvectl flush-caches`. Anti-pattern: hand-editing `/etc/resolv.conf` — regenerated and lost on a resolved-managed host.
knowledge/runbooks/networking-web-tls.md:35:**Validate:** `readlink -f /etc/resolv.conf` → stub; `resolvectl status | grep 'DNS Servers'`; `getent hosts example.com`; `dig example.com +short` (no SERVFAIL); restart resolved and re-check.

## TypeScript And Lint Suppressions

backend/src/store/db.ts:219:    // eslint-disable-next-line @typescript-eslint/no-var-requires
backend/src/tests/orchestrator.test.ts:626:  // eslint-disable-next-line @typescript-eslint/no-explicit-any
backend/src/tests/orchestrator.test.ts:628:  // eslint-disable-next-line @typescript-eslint/no-explicit-any
backend/src/tests/orchestrator.test.ts:630:  // eslint-disable-next-line @typescript-eslint/no-explicit-any
backend/src/tests/sse-audit-symmetry.test.ts:27:  // eslint-disable-next-line @typescript-eslint/no-explicit-any
backend/src/tests/ssh-executor.test.ts:61:  // eslint-disable-next-line @typescript-eslint/no-require-imports
backend/src/tests/ssh-executor.test.ts:86:  // eslint-disable-next-line @typescript-eslint/no-require-imports
frontend/src/hooks/useTickets.ts:47:    // eslint-disable-next-line react-hooks/exhaustive-deps

## Console Logs And Debuggers

.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:197:      cd /Users/julianschmidt/Documents/GitHub/techbold_track_template && cat pnpm-workspace.yaml | grep -c "backend" && cat pnpm-workspace.yaml | grep -c "frontend" && node -e "const p=JSON.parse(require('fs').readFileSync('backend/package.json','utf8')); console.log(p.name, p.type, Object.keys(p.dependencies).join(','))"
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:182:  cd /Users/julianschmidt/Documents/GitHub/techbold_track_template/backend && PHOENIX_API_URL=x PHOENIX_API_TOKEN=x OPENAI_API_KEY=x pnpm tsx -e "import { resolveClientMode } from './src/env.ts'; console.log(resolveClientMode('phoenix'))"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:158:    <automated>cd /Users/julianschmidt/Documents/GitHub/techbold_track_template/backend && node -e "import('./src/store/schema.js').then(m => { console.log(Object.keys(m).join(', ')); }).catch(e => console.error(e.message))"</automated>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:201:    <automated>cd /Users/julianschmidt/Documents/GitHub/techbold_track_template/backend && node -e "import('./src/store/db.js').then(m => { const db = m.getDb(); console.log('mode:', db.mode); db.run('INSERT INTO runs VALUES (?,?,?,?,?,?,?,?,?)', ['run_test','1','host:22','CREATED','CREATED',new Date().toISOString(),new Date().toISOString(),null,null]); const row = db.get('SELECT * FROM runs WHERE id = ?', ['run_test']); console.log('got row:', !!row); }).catch(e => console.error('FAIL', e.message))"</automated>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:271:  console.log('run id prefix:', run.id.startsWith('run_'));
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:280:  console.log('audit event written:', events.length === 1 && events[0].type === 'run.started');
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:281:  console.log('secret redacted in audit:', !persisted.includes('supersecret-token') && persisted.includes('redacted'));
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:285:  console.log('phase updated:', updated?.current_phase === 'TRIAGING');
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:150:**Test:** Connect an EventSource as above. Inspect `runEventBus` listener counts (add a temporary `console.log(runEventBus.listenerCount(runId, 'approval.required'))` or check via Node `--inspect`). Close the tab or call `es.close()`.
backend/src/index.ts:11:console.log(`Backend listening on :${PORT}`);
backend/src/index.ts:19:    console.log(`Received ${signal}, shutting down...`);
backend/src/phoenix/client.ts:148:    console.log(`[phoenix] ${method} ${path} -> ${response.status} (${Date.now() - startedAt}ms)`);
docs/IMPLEMENTATION_PROCEDURE.md:173:console.log(`backend on :${env.PORT} (mock=${env.MOCK_MODE})`);

## Em Dash Characters

.github/workflows/ci.yml:5:# orchestrator, phoenix client) is the contract that must never silently break —
.github/workflows/ci.yml:22:    name: backend — typecheck + tests
.gitignore:1:# Secrets & keys — NEVER commit these
.planning/RETROSPECTIVE.md:3:## Milestone: v1.0 — milestone
.planning/ROADMAP.md:5:- [x] **v1.0 milestone** — Service Desk Autopilot hackathon submission slice (shipped 2026-06-07)
.planning/ROADMAP.md:10:<summary>v1.0 milestone — 9 phases, 35 plans</summary>
.planning/STATE.md:7:last_activity: 2026-06-07 — Milestone v1.0 completed and archived
.planning/STATE.md:22:**Core value:** Win B+C (55 pts) — solve hidden Linux-service incidents on fresh VMs, safely and auditably
.planning/STATE.md:28:Plan: —
.planning/STATE.md:30:Last activity: 2026-06-07 — Milestone v1.0 completed and archived
.planning/STATE.md:37:- Average duration: —
.planning/STATE.md:62:- Init: Node 22 + Hono replaces FastAPI skeleton — architecture doc mandates TS/Hono
.planning/STATE.md:64:- Init: Mock mode is first-class — demo must survive flaky Wi-Fi and VM reboots
.planning/STATE.md:67:- [Phase 05]: Agents accept optional model param for test injection — getModel() used as default, enabling scripted mock responses in tests without env setup — Degradation and mock-output tests require injecting a LanguageModelV1 directly; optional param keeps production callers unchanged
.planning/STATE.md:68:- [Phase 05]: AgentUnavailableError exported from problem-analyzer.ts as the shared error class — avoids a separate shared file for a single error type — All four agents share the same error class; co-locating with problem-analyzer keeps the surface small and tests can import it alongside runProblemAnalyzer
.planning/STATE.md:69:- [Phase 05-05]: setDb/resetDb exported from store/db.ts for test isolation — module-level singleton pattern requires explicit injection for JSONL adapter in integration tests; no architectural change to production path
.planning/STATE.md:70:- [Phase 05-05]: emitEvent side effect also writes to audit log — event bus fans out to SSE, but audit log is the queryable source of truth; tests verify approval.required via getAuditEvents rather than the bus
.planning/STATE.md:71:- [Phase 05-05]: vi.spyOn used for integration test mocking rather than vi.mock — vi.mock is file-scoped and hoisted, breaking pre-existing agent tests that inject real model instances; spyOn is describe-scoped and restoreable
.planning/STATE.md:72:- [Phase 06-01]: POST /api/runs uses updateRunPhase directly (not advance()) to transition CREATED→LOADED_CONTEXT — advance() auto-recurses through LOADED_CONTEXT→TRIAGING→LLM, violating the PRD §9 201-response contract
.planning/STATE.md:73:- [Phase 06-01]: vi.clearAllMocks() used in afterEach instead of vi.restoreAllMocks() — restoreAllMocks resets vi.fn() instances created inside vi.mock() back to originals, breaking mocks for subsequent tests in the same file
.planning/STATE.md:74:- [Phase ?]: approvalsRouter mounts at /api/runs prefix alongside runsRouter — Hono matches specific paths first so no collisions
.planning/STATE.md:75:- [Phase ?]: Blocked-command 422 detection uses state.phase === WAITING_FOR_APPROVAL after advance() — no extra audit query; reduce() leaves phase unchanged on command_blocked
.planning/STATE.md:76:- [Phase 08]: ApprovalCard uses three-mode internal state (default/edit/reject); 422 detection via err.message includes 'blocked'|'safety' pattern — Keeps approval flow self-contained; backend sends human-readable 422 body so client-side re-mapping is minimal
.planning/STATE.md:77:- [Phase 08]: RunView derives pendingApproval and phase from useRun().run, not from useRunEvents; refresh() called after approve/reject and on key SSE event types — SSE events are stream-only; run state (phase, pendingApproval) must be authoritative from the server REST response
.planning/STATE.md:78:- [Phase 09]: Root `pnpm test` added as the canonical submission check — runs backend then frontend Vitest suites from the repository root
.planning/STATE.md:79:- [Phase 09]: README and REPORT now describe the implemented Node/Hono/React system, not the starter skeleton — real-mode VM results are explicitly left as manual credential-bound validation
.planning/STATE.md:90:- SSH `.pem` key not yet placed in `keys/` — hard blocker for real VM work (Phase 4+)
.planning/STATE.md:91:- Passwordless sudo for `azureuser` unconfirmed — preflight `sudo -n true` in Phase 4
.planning/STATE.md:112:Stopped at: 06-01 complete — run lifecycle routes (POST /, GET /:runId, POST /:runId/next, POST /:runId/abort)
.planning/codebase/ARCHITECTURE.md:12:│   Technician workspace — ticket list, run page, SSE stream   │
.planning/codebase/ARCHITECTURE.md:95:- The state machine owns truth; the AI only proposes — it never executes
.planning/codebase/ARCHITECTURE.md:98:- All agent output is structured (`generateObject` / `Output.object`) — never free-form when the backend must act on it
.planning/codebase/ARCHITECTURE.md:118:- Purpose: LLM roles that propose commands, interpret output, draft prose — structured output only
.planning/codebase/ARCHITECTURE.md:154:### Primary Request Path — Advance Run (`/next`)
.planning/codebase/ARCHITECTURE.md:181:2. `ai/agents/activity-log-generator.ts` reads only `store/audit.ts` observations + command results — never raw secrets
.planning/codebase/ARCHITECTURE.md:195:- Purpose: Structured output from `problem-analyzer` agent — ranked hypotheses + one command
.planning/codebase/ARCHITECTURE.md:202:- Pattern: Stateful record — transitions PENDING → APPROVED/REJECTED/EXECUTED/BLOCKED
.planning/codebase/ARCHITECTURE.md:207:- Pattern: Enum — `SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED`; determined deterministically, LLM may only raise (never lower) the level
.planning/codebase/ARCHITECTURE.md:210:- Purpose: Append-only record of every significant action — the source of truth for activities
.planning/codebase/ARCHITECTURE.md:243:- **Threading:** Single-threaded Node.js event loop. `better-sqlite3` is synchronous — keep DB calls short. SSH and Phoenix calls are async/await.
.planning/codebase/ARCHITECTURE.md:247:- **CORS:** Open (`*`) for local dev — appropriate for a single-machine tool with no cookies.
.planning/codebase/ARCHITECTURE.md:262:**Do this instead:** Always call `redactSecrets(stdout)` and `redactSecrets(stderr)` immediately after the SSH result is received, before any write or response — as shown in the approval flow in `backend/src/routes/approvals.ts`.
.planning/codebase/ARCHITECTURE.md:268:**Do this instead:** Keep all diagnostic logic in `ai/agents/problem-analyzer.ts` prompts — generalise from ticket symptom + observations only.
.planning/codebase/ARCHITECTURE.md:275:- `env.ts` throws on startup if required vars are missing — no silent misconfiguration
.planning/codebase/ARCHITECTURE.md:278:- AI calls wrapped with timeout + single retry; model failure degrades to "agent unavailable, propose manually" — never to an unsafe default
.planning/codebase/ARCHITECTURE.md:283:**Logging:** Structured audit events via `store/audit.ts` — these are the official record. Console logging for dev/debug only.
.planning/codebase/ARCHITECTURE.md:284:**Validation:** Zod schemas at every boundary — env vars (`env.ts`), request bodies (Hono `@hono/zod-validator`), AI agent outputs (`generateObject`), Phoenix response types (`phoenix/types.ts`).
.planning/codebase/ARCHITECTURE.md:286:**Safety gate:** Always two passes — once at proposal (orchestrator), once after any human edit (approvals route). Deterministic policy runs first; LLM classifier can only raise risk level, never lower it.
.planning/codebase/CONCERNS.md:8:- Issue: `backend/app/main.py` is a FastAPI skeleton with a single `/health` route and a TODO comment. The architecture decision (documented in `docs/ARCHITECTURE.md` §1) explicitly rejects FastAPI in favor of Node 22 + Hono + TypeScript. The entire backend — Phoenix client, SSH executor, safety layer, orchestrator, store, SSE events — is unwritten.
.planning/codebase/CONCERNS.md:11:- Fix approach: Execute `docs/TASKS.md` P0-1 — replace Python backend with Node 22 + Hono; keep Docker layout and `./keys` mount.
.planning/codebase/CONCERNS.md:22:- Impact: Low — these packages are harmless until removed, but `package.json` for the backend does not exist.
.planning/codebase/CONCERNS.md:41:No runtime bugs are detectable yet — the application is pre-implementation. The only executable code is the FastAPI health endpoint.
.planning/codebase/CONCERNS.md:53:**SSH private key path is mount-only — no validation exists yet:**
.planning/codebase/CONCERNS.md:60:- Risk: The `.env` file exists (confirmed by `docker-compose.yml` referencing it as `required: false`) but could not be read due to permissions. Its contents are unknown — if it contains real credentials it must not be committed.
.planning/codebase/CONCERNS.md:68:- Current mitigation: None — backend is not yet implemented.
.planning/codebase/CONCERNS.md:75:**SQLite with `better-sqlite3` is synchronous — blocks the Node event loop:**
.planning/codebase/CONCERNS.md:79:- Improvement path: For a 24-hour hackathon with low concurrency this is acceptable. If writes become slow, batch audit events or switch to the JSONL fallback (`docs/PRD.md` §10). Do not switch to an async SQLite driver mid-build — it's a context switch cost not worth it under time pressure.
.planning/codebase/CONCERNS.md:103:**Activity draft must not invent facts — no guardrail exists yet:**
.planning/codebase/CONCERNS.md:107:- Test coverage: Not specified in the current test plan — consider adding a fixture-based test in `orchestrator.test.ts`.
.planning/codebase/CONCERNS.md:116:- Scaling path: Not applicable given explicit non-goals (`docs/PRD.md` §11 — no queues, no background workers, no k8s).
.planning/codebase/CONCERNS.md:129:- Impact: Low — both work, but `npm install` and `pnpm install` produce different lockfiles and `node_modules` layouts.
.planning/codebase/CONCERNS.md:159:- Risk: A gap here is a hard-fail — blocked commands that execute or secrets that appear in logs zero the incident score.
.planning/codebase/CONVENTIONS.md:12:- React components: PascalCase, `.tsx` extension — `App.tsx`
.planning/codebase/CONVENTIONS.md:13:- Entry points: lowercase — `main.tsx`, `main.py`
.planning/codebase/CONVENTIONS.md:14:- CSS: lowercase, matches component or scope — `index.css`
.planning/codebase/CONVENTIONS.md:15:- Config files: lowercase with dots — `vite.config.ts`, `tsconfig.json`
.planning/codebase/CONVENTIONS.md:16:- Python modules: lowercase with underscores — `__init__.py`, `main.py`
.planning/codebase/CONVENTIONS.md:19:- Components: PascalCase default exports — `export default function App()`
.planning/codebase/CONVENTIONS.md:20:- Route handlers (FastAPI): snake_case — `def health()`
.planning/codebase/CONVENTIONS.md:32:- No Prettier config present — no enforced formatter in place
.planning/codebase/CONVENTIONS.md:37:- No ruff or black config present — no enforced formatter in place
.planning/codebase/CONVENTIONS.md:48:1. External libraries — `import React from "react"`
.planning/codebase/CONVENTIONS.md:49:2. Internal modules — `import App from "./App"`
.planning/codebase/CONVENTIONS.md:50:3. CSS/assets — `import "./index.css"`
.planning/codebase/CONVENTIONS.md:54:2. Third-party packages — `from fastapi import FastAPI`
.planning/codebase/CONVENTIONS.md:57:- None configured — imports use relative paths (`./App`)
.planning/codebase/CONVENTIONS.md:64:- Inline styles used in skeleton (`style={{ ... }}`) — teams should move to CSS classes
.planning/codebase/CONVENTIONS.md:81:- Return plain dicts for JSON responses — no explicit `JSONResponse` wrapping for simple cases
.planning/codebase/CONVENTIONS.md:111:- `pydantic-settings` is in `requirements.txt` — use `BaseSettings` for config, not `os.getenv` directly
.planning/codebase/CONVENTIONS.md:115:- ERP token and SSH keys must stay on the backend — never passed to the browser
.planning/codebase/CONVENTIONS.md:116:- CORS is open (`allow_origins=["*"]`) for local dev only — restrict in production
.planning/codebase/CONVENTIONS.md:123:- The skeleton uses comments to guide implementers — remove scaffolding comments as code is written
.planning/codebase/CONVENTIONS.md:126:- Leave `# TODO` in commits — implement or file an issue
.planning/codebase/CONVENTIONS.md:133:- Minimal global reset only — `box-sizing: border-box`, bare `body` styles
.planning/codebase/INTEGRATIONS.md:8:- Phoenix ERP Mock — source of truth for tickets, customers, and activity logging
.planning/codebase/INTEGRATIONS.md:12:  - SDK/Client: `httpx` (not yet installed — listed as suggested dep in `backend/requirements.txt`)
.planning/codebase/INTEGRATIONS.md:13:  - Auth: `Authorization: Bearer <PHOENIX_API_TOKEN>` — static team token
.planning/codebase/INTEGRATIONS.md:16:- Azure OpenAI — intended for AI-assisted troubleshooting
.planning/codebase/INTEGRATIONS.md:17:  - SDK/Client: `openai` (not yet installed — listed as suggested dep in `backend/requirements.txt`)
.planning/codebase/INTEGRATIONS.md:18:  - Auth: env var (name not confirmed — `.env.example` unreadable)
.planning/codebase/INTEGRATIONS.md:23:- None detected — no ORM, no DB client, no migration tooling present
.planning/codebase/INTEGRATIONS.md:26:- Local filesystem only — SSH private keys stored in `./keys/` (mounted read-only into backend at `/keys` via `docker-compose.yml`)
.planning/codebase/INTEGRATIONS.md:35:- Token kept on the backend only — `backend/app/main.py` comments explicitly state the ERP token must never reach the browser
.planning/codebase/INTEGRATIONS.md:39:- SSH client: `paramiko` (not yet installed — listed as suggested dep in `backend/requirements.txt`)
.planning/codebase/INTEGRATIONS.md:43:- None implemented — CORS is fully open (`allow_origins=["*"]`) for local dev (`backend/app/main.py`)
.planning/codebase/INTEGRATIONS.md:56:- Docker Compose — `docker-compose.yml` at repo root
.planning/codebase/INTEGRATIONS.md:65:- `PHOENIX_API_TOKEN` — bearer token for Phoenix ERP API
.planning/codebase/INTEGRATIONS.md:66:- `VITE_API_BASE` — frontend base URL for backend calls (set to `http://localhost:8000` in `docker-compose.yml`)
.planning/codebase/INTEGRATIONS.md:67:- Azure OpenAI credentials (specific var names not confirmed — `.env.example` unreadable)
.planning/codebase/STACK.md:18:- Python 3.11 (slim Docker image — `backend/Dockerfile`)
.planning/codebase/STACK.md:21:- Node 20 (slim Docker image — `frontend/Dockerfile`)
.planning/codebase/STACK.md:24:- Backend: pip (via `backend/requirements.txt`) — no lockfile
.planning/codebase/STACK.md:25:- Frontend: npm — lockfile present (`frontend/package-lock.json`)
.planning/codebase/STACK.md:30:- FastAPI 0.115.6 — HTTP API server (`backend/app/main.py`)
.planning/codebase/STACK.md:31:- Uvicorn 0.34.0 (standard extras) — ASGI server, run command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
.planning/codebase/STACK.md:32:- Pydantic-settings 2.7.1 — environment/config management
.planning/codebase/STACK.md:35:- React 18.3.1 — UI framework (`frontend/src/App.tsx`, `frontend/src/main.tsx`)
.planning/codebase/STACK.md:36:- Vite 5.4.11 — dev server and build tool (`frontend/vite.config.ts`)
.planning/codebase/STACK.md:39:- `@vitejs/plugin-react` 4.3.4 — Vite plugin for React/JSX transform
.planning/codebase/STACK.md:40:- TypeScript compiler (`tsc`) — type-check step before production build
.planning/codebase/STACK.md:45:- `fastapi==0.115.6` — entire HTTP layer
.planning/codebase/STACK.md:46:- `uvicorn[standard]==0.34.0` — production-ready ASGI server with websocket/http2 extras
.planning/codebase/STACK.md:47:- `pydantic-settings==2.7.1` — typed settings from env vars
.planning/codebase/STACK.md:50:- `httpx` — calling the Phoenix ERP REST API
.planning/codebase/STACK.md:51:- `paramiko` — SSH to customer VMs
.planning/codebase/STACK.md:52:- `openai` — Azure OpenAI integration
.planning/codebase/STACK.md:55:- `react@^18.3.1` + `react-dom@^18.3.1` — core UI
.planning/codebase/STACK.md:61:- `.env.example` present at repo root — copy to `.env` for local dev
.planning/codebase/STACK.md:66:- `frontend/tsconfig.json` — TypeScript config (target ES2020, strict mode, bundler module resolution)
.planning/codebase/STACK.md:67:- `frontend/vite.config.ts` — Vite config (React plugin, host `0.0.0.0`, port 5173)
.planning/codebase/STRUCTURE.md:14:│   │   └── main.py           # FastAPI skeleton — replaced by Node/Hono implementation
.planning/codebase/STRUCTURE.md:15:│   └── src/                  # Target layout (not yet created — see below)
.planning/codebase/STRUCTURE.md:102:- Purpose: Hono route handlers — one file per resource group
.planning/codebase/STRUCTURE.md:124:- Key files: `audit.ts` (append-only — never delete), `schema.ts` (canonical data shapes)
.planning/codebase/STRUCTURE.md:143:- Purpose: Authoritative design documents — read before implementing any module
.planning/codebase/STRUCTURE.md:147:- Purpose: SSH private key storage — git-ignored, mounted read-only into backend container at `/keys`
.planning/codebase/STRUCTURE.md:154:- `backend/src/index.ts`: Node server bootstrap — `serve(app)` on port from env
.planning/codebase/STRUCTURE.md:156:- `docker-compose.yml`: Compose entry — starts both services with env and keys mount
.planning/codebase/STRUCTURE.md:159:- `backend/src/env.ts`: Single source of truth for all env vars — Zod-parsed, fails fast
.planning/codebase/STRUCTURE.md:165:- `backend/src/ai/orchestrator.ts`: State machine — the central coordinator
.planning/codebase/STRUCTURE.md:166:- `backend/src/safety/command-policy.ts`: Safety gate — deterministic allow/block
.planning/codebase/STRUCTURE.md:167:- `backend/src/safety/redaction.ts`: Secret redaction — must run before any write
.planning/codebase/STRUCTURE.md:168:- `backend/src/store/audit.ts`: Append-only audit log — source of truth for activities
.planning/codebase/STRUCTURE.md:169:- `backend/src/phoenix/client.ts`: ERP integration — the three scored endpoints
.planning/codebase/STRUCTURE.md:177:- `docs/phoenix-openapi.yaml`: Phoenix ERP OpenAPI spec — derive all `phoenix/types.ts` Zod schemas from this
.planning/codebase/STRUCTURE.md:178:- `docs/scoring.md`: Rubric — consult when prioritising what to build
.planning/codebase/STRUCTURE.md:210:- Constraint: if the tool involves SSH execution, it must only record a proposal — never call `ssh/executor.ts` directly
.planning/codebase/STRUCTURE.md:224:- Component: `frontend/src/` — flat for now; introduce subdirectories (`components/`, `pages/`) when count exceeds ~5 files
.planning/codebase/STRUCTURE.md:232:- Backend: no `utils/` directory yet — keep helpers co-located with their domain module
.planning/codebase/STRUCTURE.md:238:- Purpose: SSH private key file(s) — e.g. `keys/id_rsa` or `keys/<vm>.pem`
.planning/codebase/STRUCTURE.md:239:- Generated: No — placed manually before running
.planning/codebase/STRUCTURE.md:240:- Committed: No — covered by `.gitignore`
.planning/codebase/STRUCTURE.md:245:- Generated: Yes — by `/gsd-map-codebase`
.planning/codebase/STRUCTURE.md:249:- Purpose: Authoritative design and planning documents — not generated, hand-written
.planning/codebase/STRUCTURE.md:250:- Committed: Yes — judges read the repo
.planning/codebase/TESTING.md:7:No test framework is configured in this project. Neither the frontend nor the backend has a test runner, test config, or test files. This is a skeleton template — testing infrastructure must be added before writing tests.
.planning/codebase/TESTING.md:64:**Frontend — co-located with source:**
.planning/codebase/TESTING.md:76:**Backend — separate `tests/` directory:**
.planning/codebase/TESTING.md:163:**Backend — `tests/conftest.py`:**
.planning/codebase/TESTING.md:178:**Frontend — inline factories for now; extract to `src/test/factories.ts` when repeated:**
.planning/codebase/TESTING.md:213:- Backend routes that call external services — mock the HTTP client (`httpx`), test the full route handler
.planning/codebase/TESTING.md:218:- If added: use Playwright via `bash playwright` — do not load Playwright MCP
.planning/milestones/v1.0-REQUIREMENTS.md:13:**Core Value:** Win the scoring rubric — B (troubleshooting, 35) + C (safety & audit, 20) are 55% of the score. Solve hidden Linux-service incidents on fresh VMs, safely and auditably.
.planning/milestones/v1.0-REQUIREMENTS.md:23:- [x] **PLAT-01**: Backend migrated to Node 22 + Hono + TypeScript; `docker compose up` serves `GET /health → {status:"ok"}` and the frontend still loads at :5173 — *E*
.planning/milestones/v1.0-REQUIREMENTS.md:24:- [x] **PLAT-02**: Zod-validated env config fails fast with a readable message on a missing required var — *E*
.planning/milestones/v1.0-REQUIREMENTS.md:25:- [x] **PLAT-03**: `.env.example` present with placeholders only; `.env` and `keys/` git-ignored; no secrets committed — *C/E*
.planning/milestones/v1.0-REQUIREMENTS.md:26:- [x] **PLAT-04**: Mock mode (`MOCK_MODE`) drives the full loop offline for Phoenix, SSH, and LLM — *E*
.planning/milestones/v1.0-REQUIREMENTS.md:30:- [x] **ERP-01**: Typed Phoenix client lists assigned tickets via the ERP API (auth, 8s timeout, 1 retry on 5xx) — *A*
.planning/milestones/v1.0-REQUIREMENTS.md:31:- [x] **ERP-02**: Ticket list shows title, customer, priority, and status — *A*
.planning/milestones/v1.0-REQUIREMENTS.md:32:- [x] **ERP-03**: Ticket list supports sort/filter by at least status, priority, or date — *A*
.planning/milestones/v1.0-REQUIREMENTS.md:33:- [x] **ERP-04**: Customer-system (SSH target) information loads for a ticket — *A*
.planning/milestones/v1.0-REQUIREMENTS.md:34:- [x] **ERP-05**: Auth (401), 404, and empty states degrade gracefully without breaking the workflow — *A*
.planning/milestones/v1.0-REQUIREMENTS.md:35:- [x] **ERP-06**: In-memory Phoenix mock returns fixtures for every client method used in the loop — *E*
.planning/milestones/v1.0-REQUIREMENTS.md:39:- [x] **SAFE-01**: Deterministic blocklist classifies every dangerous command as `HIGH_RISK_BLOCKED` before execution, including obfuscation variants (extra spaces, quotes, `$()`/backtick wrappers) — *C*
.planning/milestones/v1.0-REQUIREMENTS.md:40:- [x] **SAFE-02**: Risk classifier assigns a risk level to every command; the LLM may only raise a level, never lower it — *C*
.planning/milestones/v1.0-REQUIREMENTS.md:41:- [ ] **SAFE-03**: Secret redaction strips secrets from every string before it reaches the audit log, UI, or model — *C*
.planning/milestones/v1.0-REQUIREMENTS.md:42:- [ ] **SAFE-04**: Append-only audit log records every proposed/approved/rejected/executed command and key action; no delete path — *C*
.planning/milestones/v1.0-REQUIREMENTS.md:43:- [x] **SAFE-05**: Edited commands are re-validated at approval time; a dangerous edit is blocked (422 + audit BLOCKED) — *C*
.planning/milestones/v1.0-REQUIREMENTS.md:44:- [ ] **SAFE-06**: Safety layer is covered by tests — every blocklist pattern, obfuscation variant, edited-command recheck, and redaction — *C/E*
.planning/milestones/v1.0-REQUIREMENTS.md:48:- [x] **DIAG-01**: `problem_analyzer` agent returns ranked root-cause hypotheses with evidence, then one read-only diagnostic command (purpose + expected signal + risk) — *B/D*
.planning/milestones/v1.0-REQUIREMENTS.md:49:- [x] **DIAG-02**: Agent prompts are scoped to local Linux services only and generalise — no branches keyed to ticket IDs, hostnames, or symptom strings — *B*
.planning/milestones/v1.0-REQUIREMENTS.md:50:- [ ] **DIAG-03**: Deterministic orchestrator drives run phases (TRIAGING → WAITING_FOR_APPROVAL → EXECUTING → OBSERVING → … → DRAFTING_ACTIVITY) with a max-steps cap; block → ask alternative — *B/C*
.planning/milestones/v1.0-REQUIREMENTS.md:51:- [x] **DIAG-04**: `problem_solver` agent proposes a minimal, reversible fix with a captured rollback — *B*
.planning/milestones/v1.0-REQUIREMENTS.md:52:- [x] **DIAG-05**: `validator` agent proves the customer benefit is restored (never `is-active`) and checks persistence after reboot/restart; single success → `LIKELY_FIXED`, repeated → `VERIFIED_FIXED` — *B*
.planning/milestones/v1.0-REQUIREMENTS.md:53:- [x] **DIAG-06**: Generalising loop solves all 5 practice VMs cleanly, reboot-persistent, with zero safety flags, via prompts/safety/validation (no per-incident hacks) — *B*
.planning/milestones/v1.0-REQUIREMENTS.md:57:- [ ] **API-01**: Run routes work per PRD §9: `POST /api/runs`, `GET /api/runs/:id`, `POST /api/runs/:id/next`, `POST /api/runs/:id/abort` — *B/D*
.planning/milestones/v1.0-REQUIREMENTS.md:58:- [x] **API-02**: Approval routes approve (optionally edited) → safety re-check → execute, and reject-with-reason → agent proposes an alternative — *C*
.planning/milestones/v1.0-REQUIREMENTS.md:59:- [ ] **API-03**: SSE stream emits run events live (`run.started`, `approval.required`, `command.completed`, etc.); every meaningful side-effect emits and audits the same event — *D*
.planning/milestones/v1.0-REQUIREMENTS.md:60:- [ ] **API-04**: Run store persists runs, approvals, results, observations, and activity drafts (SQLite, JSONL fallback) — *C/E*
.planning/milestones/v1.0-REQUIREMENTS.md:64:- [ ] **ACT-01**: `activity_log_generator` produces all 5 graded fields (`summary`, `root_cause`, `actions_taken`, `commands_summary`, `validation_result`) from the audit trail only — no invented facts, no secrets — *A/B*
.planning/milestones/v1.0-REQUIREMENTS.md:65:- [ ] **ACT-02**: `POST /api/runs/:id/activity/draft` and `/activity/submit` create a Phoenix activity via `createActivity` — *A/B*
.planning/milestones/v1.0-REQUIREMENTS.md:69:- [ ] **UX-01**: Ticket overview (list) is easy to understand and drives navigation — *D*
.planning/milestones/v1.0-REQUIREMENTS.md:70:- [x] **UX-02**: Ticket detail view shows the customer system information — *D*
.planning/milestones/v1.0-REQUIREMENTS.md:71:- [x] **UX-03**: Run page shows visible agent progress via a live SSE timeline — *D*
.planning/milestones/v1.0-REQUIREMENTS.md:72:- [x] **UX-04**: Approval card shows command, purpose, expected signal, risk level, and safety notes with approve / edit-then-approve / reject-with-reason — *C/D*
.planning/milestones/v1.0-REQUIREMENTS.md:73:- [x] **UX-05**: Audit timeline shows followable logs and actions — *C/D*
.planning/milestones/v1.0-REQUIREMENTS.md:74:- [ ] **UX-06**: Activity editor lets the technician edit and submit the generated draft — *A/D*
.planning/milestones/v1.0-REQUIREMENTS.md:75:- [x] **UX-07**: Retry and abort controls are available in the UI — *D*
.planning/milestones/v1.0-REQUIREMENTS.md:79:- [ ] **ENG-01**: Real README covers setup, run, environment, architecture, assumptions, and troubleshooting; a fresh clone runs via `docker compose up` following only the README — *E*
.planning/milestones/v1.0-REQUIREMENTS.md:80:- [ ] **ENG-02**: Tests for phoenix-client and orchestrator (mocked fetch + mocked SSH/model; happy path + reject path); `pnpm test` green — *E*
.planning/milestones/v1.0-REQUIREMENTS.md:81:- [ ] **ENG-03**: MIT LICENSE present; repo public in the START Hack Vienna '26 org; secret scan clean before freeze — *C/E*
.planning/milestones/v1.0-REQUIREMENTS.md:82:- [ ] **ENG-04**: `REPORT.md` covers approach, agent design, safety model, and results on the 5 practice VMs — *Submission*
.planning/milestones/v1.0-REQUIREMENTS.md:86:Deferred — build only if P0 is green (PRD §6.2, TASKS P1/P2). Tracked, not in the current roadmap critical path.
.planning/milestones/v1.0-REQUIREMENTS.md:90:- **HCR-01**: Human-driven command path — technician runs their own command through the same safety + audit path (`POST /runs/:id/manual-command`)
.planning/milestones/v1.0-REQUIREMENTS.md:91:- **HCR-02**: One-click verified Undo — revert last change via rollback, re-test no-regression
.planning/milestones/v1.0-REQUIREMENTS.md:92:- **HCR-03**: Plan-approval for read-only batches — approve a read-only plan at once; every mutation still individually gated
.planning/milestones/v1.0-REQUIREMENTS.md:95:- **HCR-06**: Policy auto-approve mode — auto-confirm `SAFE_READ_ONLY`, hard-block DENY (confirm grading flow with mentors)
.planning/milestones/v1.0-REQUIREMENTS.md:100:- **BOOST-02**: Redaction preview in UI — show output was redacted before display
.planning/milestones/v1.0-REQUIREMENTS.md:101:- **BOOST-03**: Optional LLM safety second-opinion — can only raise concern, never override a deterministic block
.planning/milestones/v1.0-REQUIREMENTS.md:103:- **BOOST-05**: Blast-radius on approval card — dependents + active connections before a restart/stop
.planning/milestones/v1.0-REQUIREMENTS.md:112:| Fully autonomous remediation | Against the rules — a human confirms every action |
.planning/milestones/v1.0-REQUIREMENTS.md:167:- v1 requirements: 39 total (REQUIREMENTS.md header said 36 — that count was stale; actual count is 39 after PLAT/ERP/SAFE/DIAG/API/ACT/UX/ENG IDs enumerated)
.planning/milestones/v1.0-ROADMAP.md:36:  4. `MOCK_MODE=true` drives the full loop offline — no real Phoenix, SSH, or LLM calls needed
.planning/milestones/v1.0-ROADMAP.md:58:- [x] 02-01-PLAN.md — Phoenix Zod type schemas (TDD: schema parsing contracts)
.planning/milestones/v1.0-ROADMAP.md:62:- [x] 02-02-PLAN.md — Phoenix HTTP client with auth/retry/timeout + rubric-E tests (TDD)
.planning/milestones/v1.0-ROADMAP.md:66:- [x] 02-03-PLAN.md — In-memory mock + ticket route wiring
.planning/milestones/v1.0-ROADMAP.md:77:  1. `safety.test.ts` is green — every blocklist pattern (including obfuscation variants) returns `HIGH_RISK_BLOCKED`
.planning/milestones/v1.0-ROADMAP.md:85:**Wave 1** *(independent — run in parallel)*
.planning/milestones/v1.0-ROADMAP.md:87:- [x] 03-01-PLAN.md — Blocklist + classifier TDD (command-policy.ts, classifier.ts)
.planning/milestones/v1.0-ROADMAP.md:88:- [x] 03-02-PLAN.md — Redaction TDD (redaction.ts)
.planning/milestones/v1.0-ROADMAP.md:89:- [x] 03-03-PLAN.md — Run store (schema.ts, db.ts, runs.ts, audit.ts)
.planning/milestones/v1.0-ROADMAP.md:93:- [x] 03-04-PLAN.md — Safety §9 consolidated test gate (safety.test.ts)
.planning/milestones/v1.0-ROADMAP.md:111:- [x] 04-01-PLAN.md — SSH layer type contracts (types.ts)
.planning/milestones/v1.0-ROADMAP.md:113:**Wave 2** *(blocked on Wave 1 completion — 04-02 and 04-04 run in parallel)*
.planning/milestones/v1.0-ROADMAP.md:115:- [x] 04-02-PLAN.md — Executor logic TDD: result shape, output cap, timeout, bash-lc wrap, A1 guard (test file only)
.planning/milestones/v1.0-ROADMAP.md:116:- [x] 04-04-PLAN.md — Mock SSH TDD + mock.ts: fixture map, fallback, preflight, SshExecutor conformance
.planning/milestones/v1.0-ROADMAP.md:120:- [x] 04-03-PLAN.md — Real ssh2 client + executor implementation (client.ts + executor.ts)
.planning/milestones/v1.0-ROADMAP.md:124:- [x] 04-05-PLAN.md — ssh-tools.ts proposeSshCommand + createSshExecutor factory wiring
.planning/milestones/v1.0-ROADMAP.md:128:**Goal**: The AI can diagnose a Linux service incident end-to-end — from ranked hypotheses through a fix proposal to a validated, persistence-checked resolution — under deterministic orchestrator control
.planning/milestones/v1.0-ROADMAP.md:143:- [x] 05-01-PLAN.md — RunPhase enum migration + agent Zod schemas (DiagnosticProposal, FixProposal, ValidationResult)
.planning/milestones/v1.0-ROADMAP.md:147:- [x] 05-02-PLAN.md — model.ts provider + prompts.ts system prompts for all four agent roles
.planning/milestones/v1.0-ROADMAP.md:149:**Wave 3** *(blocked on Wave 2 completion — 05-03 and 05-04 run in parallel)*
.planning/milestones/v1.0-ROADMAP.md:151:- [x] 05-03-PLAN.md — Agent implementations TDD (problem-analyzer, customer-system-analyzer, problem-solver, validator)
.planning/milestones/v1.0-ROADMAP.md:152:- [x] 05-04-PLAN.md — Orchestrator reducer TDD (pure state, event → nextState, sideEffects reducer + max-steps cap)
.planning/milestones/v1.0-ROADMAP.md:156:- [x] 05-05-PLAN.md — Orchestrator async driver + full in-process integration test
.planning/milestones/v1.0-ROADMAP.md:172:**Wave 1** *(independent — run in parallel)*
.planning/milestones/v1.0-ROADMAP.md:174:- [x] 06-01-PLAN.md — Run routes TDD (POST /api/runs, GET /api/runs/:id, /next, /abort)
.planning/milestones/v1.0-ROADMAP.md:175:- [x] 06-02-PLAN.md — Approval routes TDD (approve with safety re-check, reject with reason)
.planning/milestones/v1.0-ROADMAP.md:176:- [x] 06-03-PLAN.md — SSE events route (streamSSE, backfill, keepalive, bus cleanup)
.planning/milestones/v1.0-ROADMAP.md:180:- [x] 06-04-PLAN.md — Mount runs + approvals + events routers in app.ts
.planning/milestones/v1.0-ROADMAP.md:189:  1. `POST /api/runs/:id/activity/draft` returns all 5 graded fields (`summary`, `root_cause`, `actions_taken`, `commands_summary`, `validation_result`) populated from the audit trail — no invented facts, no secrets
.planning/milestones/v1.0-ROADMAP.md:196:- [x] 07-01-PLAN.md — Activity log generator agent TDD (ActivityDraftFieldsSchema, runActivityLogGenerator, MOCK_ACTIVITY_DRAFT)
.planning/milestones/v1.0-ROADMAP.md:200:- [x] 07-02-PLAN.md — Activity routes TDD (POST /activity/draft, POST /activity/submit)
.planning/milestones/v1.0-ROADMAP.md:204:- [x] 07-03-PLAN.md — Mount activityRouter in app.ts
.planning/milestones/v1.0-ROADMAP.md:208:**Goal**: A technician can drive a complete run in the browser — from ticket list through approval decisions to editing and submitting the activity report
.planning/milestones/v1.0-ROADMAP.md:225:- [x] 08-01-PLAN.md — Shared types, API fetch wrappers, pure mappers (TDD)
.planning/milestones/v1.0-ROADMAP.md:229:- [x] 08-02-PLAN.md — Custom hooks (useTickets, useRunEvents)
.planning/milestones/v1.0-ROADMAP.md:233:- [x] 08-03-PLAN.md — App shell + TicketListView
.planning/milestones/v1.0-ROADMAP.md:237:- [x] 08-04-PLAN.md — RunView + ApprovalCard + abort/advance controls
.planning/milestones/v1.0-ROADMAP.md:241:- [x] 08-05-PLAN.md — ActivityView + CSS finalization
.planning/milestones/v1.0-ROADMAP.md:247:**Goal**: The repo passes all grading checks — tests green, README complete, secrets clean, REPORT.md written, demo video recorded, and the submission form filed before the freeze
.planning/milestones/v1.0-ROADMAP.md:252:  1. `pnpm test` is green — phoenix-client and orchestrator tests cover happy path + reject path with mocked fetch, SSH, and model
.planning/milestones/v1.0-ROADMAP.md:262:- [x] 09-01-PLAN.md — Root test command and clean automated checks
.planning/milestones/v1.0-ROADMAP.md:266:- [x] 09-02-PLAN.md — Submission README and report
.planning/milestones/v1.0-ROADMAP.md:270:- [x] 09-03-PLAN.md — Secret scan and phase closure
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:89:      provides: "stub placeholder — full impl in Plan 02"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:92:      provides: "stub placeholder — full impl in Plan 03"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:95:      provides: "stub placeholder — full impl in Plan 03"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:98:      provides: "stub placeholder — full impl in Plan 03"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:119:all later plans build into — no real logic yet, just the wiring harness.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:152:    .env.example (current contents — add new keys without removing existing ones).
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:170:      @hono/zod-validator, zod, tsx, better-sqlite3, ssh2, ai (Vercel AI SDK v5 — package
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:173:    Do NOT include a lockfile — pnpm will generate pnpm-lock.yaml at the root.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:193:    Every value is a placeholder string — no real credentials. Per PLAT-03 and TASKS P0-2.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:210:    backend/Dockerfile (current python:3.11-slim content — will be fully replaced).
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:211:    docker-compose.yml (current build stanza — must be updated to context: . so the full
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:239:    from the repo root — a ./backend context cannot reach them. Preserve all other docker-compose.yml
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:280:    docs/ARCHITECTURE.md §2 (exact folder structure) and §3 (component responsibilities —
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:323:      // stub — implemented in Plan 02
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:325:      // stub — implemented in Plan 03
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:328:      // stub — implemented in Plan 03
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:332:      // stub — implemented in Plan 03
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:336:      // Ticket proxy routes — implemented in Phase 2
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:340:      // Phoenix ERP client — implemented in Phase 2
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:344:      // SSH executor — implemented in Phase 4
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:348:    - backend/src/safety/command-policy.ts: "// Command blocklist policy — implemented in Phase 3\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:349:    - backend/src/safety/classifier.ts: "// Risk classifier — implemented in Phase 3\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:350:    - backend/src/safety/redaction.ts: "// Secret redaction — implemented in Phase 3\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:351:    - backend/src/safety/risk-levels.ts: REAL implementation — export enum RiskLevel {
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:357:      This is a real type used by Phase 3 — define it now so the folder seam is useful.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:367:    Update .gitignore if it does not already exclude backend/dist/ — add it alongside
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:370:    Do NOT create any ai/ subtree files in this task — those are Task 3b.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:392:    activity-log-generator). §3 (agent and orchestrator responsibilities — use for stub comments).
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:414:    - backend/src/ai/model.ts: "// AI model selector — implemented in Phase 2\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:415:    - backend/src/ai/prompts.ts: "// Agent prompt templates — implemented in Phase 2\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:416:    - backend/src/ai/orchestrator.ts: "// Run state machine orchestrator — implemented in Phase 5\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:420:      "// Problem analyzer agent — proposes one diagnostic command + ranked hypotheses\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:422:      "// Customer system analyzer agent — profiles the target VM\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:424:      "// Problem solver agent — proposes minimal reversible fix\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:426:      "// Validator agent — confirms fix succeeded\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:428:      "// Activity log generator agent — drafts ERP report from audit trail\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:430:    Tools (all stubs — NOTE: executeApprovedCommand is NEVER registered as a model tool per
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:433:      "// Phoenix read tools for model context — implemented in Phase 2\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:435:      "// SSH tools — proposeSshCommand only; execution is backend-only (never a model tool)\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:437:      "// Audit read tools for model context — implemented in Phase 5\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:439:      "// Safety classification tools — implemented in Phase 3\nexport {}"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:441:    Do NOT implement any logic. Stubs only. The anti-pattern note in ssh-tools.ts is intentional —
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:473:| T-01-03 | Tampering | frontend/package-lock.json deletion | accept | Lockfile is replaced by pnpm-lock.yaml at root — same reproducibility guarantee, different manager. No security regression. |
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:475:| T-01-SC | Tampering | npm/pip package installs | mitigate | No new package installs in this plan — only package.json authored by this plan. pnpm install runs in Plan 03 verification. Packages are well-known (hono, zod, tsx, vitest, ai, ssh2, better-sqlite3). |
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:485:5. Confirm .env.example has no real credentials: `grep -v "^#" .env.example | grep -v "^$" | grep -v "your-" | grep -v "false" | grep -v "openai" | grep -v "gpt"` — output should be empty or only placeholder-safe values
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:510:- NEW FILE: pnpm-workspace.yaml — workspace root
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:511:- NEW FILE: backend/package.json — Node package (hono, zod, tsx, vitest, ai, ssh2, better-sqlite3)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:512:- NEW FILE: backend/tsconfig.json — NodeNext, strict, ES2022
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:513:- NEW FILE: backend/Dockerfile — node:22-slim + corepack + pnpm tsx runner
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:515:- MODIFIED: docker-compose.yml — backend build context changed to repo root
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:516:- NEW FILE: backend/src/env.ts — stub (Plan 02 replaces with Zod parser)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:517:- NEW FILE: backend/src/app.ts — stub Hono app export
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:518:- NEW FILE: backend/src/index.ts — stub serve() bootstrap
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:519:- NEW FILE: backend/src/routes/health.ts — stub GET /health
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:520:- NEW FILE: backend/src/routes/tickets.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:521:- NEW FILE: backend/src/routes/runs.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:522:- NEW FILE: backend/src/routes/approvals.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:523:- NEW FILE: backend/src/routes/activity.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:524:- NEW FILE: backend/src/routes/events.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:525:- NEW FILE: backend/src/phoenix/client.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:526:- NEW FILE: backend/src/phoenix/mock.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:527:- NEW FILE: backend/src/phoenix/types.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:528:- NEW FILE: backend/src/ssh/client.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:529:- NEW FILE: backend/src/ssh/executor.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:530:- NEW FILE: backend/src/ssh/mock.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:531:- NEW FILE: backend/src/ssh/types.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:532:- NEW FILE: backend/src/ai/model.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:533:- NEW FILE: backend/src/ai/prompts.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:534:- NEW FILE: backend/src/ai/orchestrator.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:535:- NEW FILE: backend/src/ai/agents/problem-analyzer.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:536:- NEW FILE: backend/src/ai/agents/customer-system-analyzer.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:537:- NEW FILE: backend/src/ai/agents/problem-solver.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:538:- NEW FILE: backend/src/ai/agents/validator.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:539:- NEW FILE: backend/src/ai/agents/activity-log-generator.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:540:- NEW FILE: backend/src/ai/tools/phoenix-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:541:- NEW FILE: backend/src/ai/tools/ssh-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:542:- NEW FILE: backend/src/ai/tools/audit-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:543:- NEW FILE: backend/src/ai/tools/safety-tools.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:544:- NEW FILE: backend/src/safety/command-policy.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:545:- NEW FILE: backend/src/safety/classifier.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:546:- NEW FILE: backend/src/safety/redaction.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:547:- NEW FILE: backend/src/safety/risk-levels.ts — REAL: exports RiskLevel enum (SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:548:- NEW FILE: backend/src/store/db.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:549:- NEW FILE: backend/src/store/schema.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:550:- NEW FILE: backend/src/store/runs.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:551:- NEW FILE: backend/src/store/audit.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:552:- NEW FILE: backend/src/events/run-event-bus.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:553:- NEW FILE: backend/src/events/sse.ts — stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:554:- NEW FILE: backend/src/tests/safety.test.ts — discoverable stub (describe.skip)
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:555:- NEW FILE: backend/src/tests/phoenix-client.test.ts — discoverable stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:556:- NEW FILE: backend/src/tests/orchestrator.test.ts — discoverable stub
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:557:- MODIFIED: .env.example — adds MOCK_MODE, MOCK_PHOENIX, MOCK_SSH, MOCK_LLM, PHOENIX_API_URL, PHOENIX_API_TOKEN, LLM_PROVIDER, LLM_MODEL, OPENAI_API_KEY, SSH_KEY_PATH
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-PLAN.md:558:- MODIFIED: .gitignore — adds backend/dist/ if not present
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:84:  - "Node 22 + pnpm replaces Python/FastAPI per ARCHITECTURE.md §1 — one language across backend, agent, and frontend"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:86:  - "RiskLevel enum implemented for real in Plan 01 — all other stubs are export {} placeholders"
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:110:- backend/src/safety/risk-levels.ts: real RiskLevel enum (SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED) — only non-stub file in this plan
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:129:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/01-repo-foundation/01-01-SUMMARY.md:145:No new network endpoints, auth paths, or schema changes introduced. Only file/package structure — no executable logic committed. Threat mitigations T-01-01 through T-01-04 confirmed:
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:54:These functions have fully defined I/O — ideal TDD candidates. The health route (Plan 03) reads
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:81:    - Required string: PHOENIX_API_URL — missing → process.exit(1) with message:
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:83:    - Required string: PHOENIX_API_TOKEN — missing → exit with named var in message
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:84:    - Required string: OPENAI_API_KEY — missing → exit with named var in message
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:124:    The test file must be created and run (RED — all fail) before env.ts is implemented.
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:130:    directly with a fabricated env object — they never hit the module-level side effect.
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:138:    reads from the module-level env. Tests must be able to control env values — use dependency
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:161:| T-02-01 | Information Disclosure | env.ts error messages | mitigate | Error messages must name the missing variable key only — never print the value of any env var in error output. Enforced by test: assert error message contains key name, does not contain token value. |
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:164:| T-02-SC | Tampering | npm/pip/cargo installs | accept | No new installs in this plan — all deps defined in Plan 01's package.json. Vitest and Zod are already declared. |
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:203:  - Exported const: env — module-level parsed config (fails fast on startup if required vars missing)
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-PLAN.md:207:- NEW FILE: backend/src/tests/env.test.ts — full Vitest suite (14+ cases)
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:10:    - backend/src/env.ts — Zod-validated env parser, resolveClientMode, isMockMode, EnvConfig type
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:11:    - backend/src/tests/env.test.ts — 20-case Vitest suite
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:26:  - "parseEnv throws Error (not process.exit) — loadEnv() private wrapper does the exit so tests reach validation logic directly"
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:28:  - "isMockMode returns true when MOCK_MODE OR any per-service flag is true — health route shows 'mock' whenever any service is mocked"
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:29:  - "EnvSchema defined at module level, exported as EnvConfig type — downstream modules can import the type without re-parsing"
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:44:- `backend/src/env.ts` — full implementation replacing the `export {}` stub:
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:47:  - `parseEnv(raw)` — pure function, throws `Error` with message `"Missing required env var: <KEY>"` on validation failure; never prints secret values (T-02-01)
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:48:  - `loadEnv()` — private module-level wrapper that calls `parseEnv(process.env)` and exits on error
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:49:  - `env` — exported const, the parsed config object callers use directly
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:50:  - `resolveClientMode(service, config?)` — implements D-01 flag precedence: MOCK_MODE=true forces all services to mock; when false, per-service flag decides independently
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:51:  - `isMockMode(config?)` — returns true when MOCK_MODE=true OR any per-service mock flag is true
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:52:- `backend/src/tests/env.test.ts` — 20 Vitest cases covering:
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:75:- RED commit: `48ca736` — `test(01-02): add failing env parser + mock-flag resolver tests`
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:76:- GREEN commit: `6adcde8` — `feat(01-02): implement Zod env parser and mock-flag resolver`
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:77:- REFACTOR: no changes needed — skipped (no commit)
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:86:- **Fix:** Changed `parseEnv()` to throw `new Error("Missing required env var: KEY")`. Extracted a private `loadEnv()` wrapper at module level that catches and calls `process.exit(1)` — matching the plan's implementation guidance exactly.
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:92:None — env.ts is fully implemented. All exports (`env`, `parseEnv`, `resolveClientMode`, `isMockMode`, `EnvConfig`) are real and tested.
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:100:| T-02-01: Error messages must not leak secret values | MITIGATED — tested in case "does not include secret values in error messages" |
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:101:| T-02-02: Tests must not mutate process.env | MITIGATED — all tests pass fabricated env objects to parseEnv() directly |
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:102:| T-02-03: Fail-fast exit on missing var | ACCEPTED — loadEnv() calls process.exit(1), parseEnv() throws for testability |
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:107:- backend/src/env.ts — FOUND
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:108:- backend/src/tests/env.test.ts — FOUND
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:111:- 48ca736 (test RED) — FOUND
.planning/milestones/v1.0-phases/01-repo-foundation/01-02-SUMMARY.md:112:- 6adcde8 (feat GREEN) — FOUND
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:32:      provides: "Node server bootstrap — serve(app) on port 8000"
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:58:- backend/src/app.ts: creates the Hono app, sets CORS (open, allow all origins — intentional for
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:67:Output: backend/src/app.ts, backend/src/index.ts, backend/src/routes/health.ts — all wired and verified.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:104:    - Mount CORS middleware: app.use('*', cors()) — open for all origins, intentional for this
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:110:    Do NOT register routes for tickets, runs, approvals, activity, or events — those are Phase 2+.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:115:    in Plan 01's package.json must be used — do not add or change dependencies here.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:149:    The env module already runs its fail-fast parse on import — no explicit startup check needed here.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:152:    1. docker compose build (from repo root) — must exit 0
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:154:    3. curl -s http://localhost:8000/health — must return {"status":"ok","mode":"real"}
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:155:    4. curl -s http://localhost:5173 — must return HTML (frontend up)
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:160:            pnpm tsx src/index.ts in backend/ — server starts, GET /health returns mode:'mock'
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:161:    - Run: PHOENIX_API_URL="" pnpm tsx src/index.ts in backend/ — must exit non-zero with a
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:168:    only if all required vars have defaults or are optional — check env.ts schema and adjust if
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:210:| T-03-01 | Information Disclosure | Dockerfile COPY context | mitigate | .dockerignore (created in Plan 01) excludes .env, keys/, node_modules/. Verify with docker build --no-cache and inspect image layers — no secret files present. |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:212:| T-03-03 | Spoofing | CORS open (*) | accept | Single-machine local tool, no auth cookies, no sensitive same-origin resources. Documented per ARCHITECTURE.md §10. Not a finding — a conscious decision. |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-PLAN.md:218:Phase 1 end-to-end checklist — all five success criteria from ROADMAP.md §Phase 1:
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:11:    - backend/src/app.ts — Hono app with CORS and /health mounted
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:12:    - backend/src/routes/health.ts — GET /health → {status, mode}
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:13:    - backend/src/index.ts — Node server bootstrap (serve + fail-fast env)
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:22:    - isMockMode() called at request time (not at import) — correct for env injection in tests
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:34:  - "getEnv() called at top of index.ts (not inside app.ts) — keeps app.ts importable in tests without a populated env"
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:36:  - "pnpm-workspace.yaml allowBuilds added for better-sqlite3, ssh2, cpu-features, esbuild — required for native build during docker image construction"
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:37:  - ".npmrc minimum-release-age=0 and --config.minimum-release-age=0 on pnpm install in Dockerfile — prevents pnpm security policy blocking recently-published packages in CI/Docker"
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:38:  - "Verification run used stub env vars (MOCK_MODE=true, placeholder strings) via docker run --env — avoids committing a .env file and confirms PLAT-04 mode toggle works"
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:53:- `backend/src/routes/health.ts` — `healthRouter` (Hono sub-router), GET `/` handler calls `isMockMode()` and returns `{ status: 'ok', mode: 'mock' | 'real' }`.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:54:- `backend/src/app.ts` — `app` (Hono instance), `cors()` middleware (open, intentional per ARCHITECTURE.md §10), `/health` route mounted, `app.onError` returns `{ error: message }` with 500.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:55:- `backend/src/index.ts` — calls `getEnv()` at startup for fail-fast validation, then `serve({ fetch: app.fetch, port })` on `PORT ?? 8000`, logs `Backend listening on :PORT`.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:56:- `backend/Dockerfile` — added `COPY pnpm-lock.yaml` and `COPY .npmrc`, changed `WORKDIR` to `/app/backend` before `CMD`, simplified CMD to `["pnpm","tsx","src/index.ts"]`.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:57:- `pnpm-workspace.yaml` — added `minimumReleaseAge: 0` and `allowBuilds` for native modules (`better-sqlite3`, `ssh2`, `cpu-features`, `esbuild`).
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:58:- `.npmrc` — `minimum-release-age=0` to allow recently-published packages.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:64:| `pnpm tsc --noEmit` (all backend/src/) | PASS — 0 errors |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:65:| `docker build --target backend` | PASS — image built cleanly |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:66:| `GET /health` with stub env (MOCK_MODE=true) | PASS — `{"status":"ok","mode":"mock"}` |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:67:| `GET /health` with MOCK_MODE unset | PASS — `{"status":"ok","mode":"real"}` |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:68:| Fail-fast on missing PHOENIX_API_URL | PASS — exits with "Missing required env var: PHOENIX_API_URL" |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:69:| No .env file committed | PASS — confirmed git-ignored |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:70:| No secrets in docker image layers | PASS — .dockerignore excludes .env and keys/ |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:72:Note: full `docker compose up` (both services) was not run — the frontend Dockerfile has a stale BuildKit cache conflict on `/app/node_modules/@types/react` that blocks the frontend build. Backend was verified standalone via `docker build` + `docker run`. Frontend build is a pre-existing issue outside this plan's scope; deferred to the next phase that touches the frontend.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:93:- **Fix:** Deferred — this is a pre-existing skeleton issue unrelated to Plan 03's scope (backend /health). Backend verified independently. Full compose verification deferred to next frontend-touching plan.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:94:- **Risk:** Low — backend is the primary grading surface for Phase 1.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:98:None — all three files are fully implemented. No Phase 2+ route stubs exist in app.ts.
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:104:| T-03-01: .env / keys/ not copied into image | MITIGATED — .dockerignore confirmed; verified no .env staged |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:105:| T-03-02: onError leaks stack trace | MITIGATED — returns `err.message` only, not `err.stack` |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:106:| T-03-03: CORS open (*) | ACCEPTED — single-machine local tool, documented per ARCHITECTURE.md §10 |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:107:| T-03-04: /health DoS via isMockMode | ACCEPTED — pure synchronous env read, no I/O, no user input |
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:112:- `backend/src/app.ts` — FOUND
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:113:- `backend/src/routes/health.ts` — FOUND
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:114:- `backend/src/index.ts` — FOUND (modified)
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:117:- `5d30e70` — `feat(01-03): implement Hono app with CORS, health route wired to isMockMode`
.planning/milestones/v1.0-phases/01-repo-foundation/01-03-SUMMARY.md:118:- `3c193b7` — `chore(01-03): allow native builds and fix Dockerfile CMD`
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:9:Migrate the backend from the dead Python/FastAPI skeleton to the locked Node 22 + Hono + TypeScript stack, establish Zod-validated fail-fast env config, and stand up the mock-mode seam that every later phase plugs into. This phase ships infrastructure only — no Phoenix, SSH, or agent features. It delivers: `docker compose up` serving `GET /health`, a fail-fast env parser, the per-service mock toggle pattern, a pnpm workspace, and committed `.env.example` with placeholders.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:19:- **D-01:** Mock toggle is **per-service flags with a master override**. `MOCK_MODE=true` forces all services to mock; per-service flags (`MOCK_PHOENIX`, `MOCK_SSH`, `MOCK_LLM`) override individually when the master is off. This lets later phases (Phoenix=2, SSH=4, LLM=5) go real one at a time while the rest stay mocked — critical for demo resilience on flaky Wi-Fi.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:20:- **D-02:** Phase 1 builds the **seam + health stub only** — not full mock clients (no real services exist yet). Concretely: a client-resolution pattern (`registerClient`/`resolveClient` or equivalent `selectX()` resolver) that honors the per-service flags, plus `GET /health → { status: 'ok', mode: 'mock' | 'real' }` proving the toggle is wired. Later phases register their real+mock implementations into this seam.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:23:- **D-03:** **pnpm workspace at repo root.** `pnpm-workspace.yaml` lists `backend` and `frontend` as packages; `pnpm install` / `pnpm test` run from root. Resolves the lockfile conflict by **deleting `frontend/package-lock.json`** (npm) in favor of pnpm — pnpm is locked by ARCHITECTURE.md §1.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:27:- Exact filenames and internal API of the client-resolution seam (`registerClient`/`resolveClient` vs a typed `resolveClient('phoenix')` factory) — planner/executor choose, as long as it honors D-01's flag precedence.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:40:- `docs/ARCHITECTURE.md` §1 — locked stack decision (Node 22 + pnpm + tsx, Hono, Zod, SSE, SQLite). Non-negotiable.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:41:- `docs/ARCHITECTURE.md` §2 — exact `backend/src/` folder structure to scaffold (routes/, phoenix/, ssh/, ai/, safety/, store/, events/, tests/).
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:42:- `docs/ARCHITECTURE.md` §10 — config rules: `env.ts` parses `process.env` through Zod, fails fast with a readable message; secrets only from env; SSH key read from `/keys` mount, never inlined or logged. CORS open (`*`) for local dev.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:43:- `docs/TASKS.md` P0-1, P0-2 — acceptance criteria for repo migration and env config.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:46:- `docs/PRD.md` — product scope, API contract, scoring; the authority on what ships.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:47:- `.planning/REQUIREMENTS.md` — PLAT-01..04 acceptance wording (rubric E mapping).
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:50:- `docs/SAFETY_POLICY.md` — informs nothing built in Phase 1, but the safety/ folder is scaffolded here.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:51:- `docs/phoenix-openapi.yaml` — Phoenix types land in Phase 2; the phoenix/ folder seam is created here.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:59:- `docker-compose.yml` — keep the two-service layout (backend:8000, frontend:5173), `./keys:/keys:ro` mount, `host.docker.internal` extra_host, and `env_file required:false` so the stack starts without `.env`. Only the backend build target changes.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:60:- `frontend/` — React 18 + Vite 5 app is the surviving stack; keep it. Its `package.json` scripts (`dev`/`build`/`preview` on host 0.0.0.0 port 5173) stay. Only the lockfile changes (npm → pnpm).
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:61:- `.gitignore` — already ignores `.env`, `keys/*` (except `.gitkeep`), `*.pem`, `*.key`, `node_modules/`, `frontend/dist/`, `*.tsbuildinfo`. Node section present. No change likely needed.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:62:- `keys/.gitkeep` — keeps the git-ignored keys mount directory tracked.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:66:- Codebase maps (`.planning/codebase/STACK.md` etc.) still describe the Python skeleton — they are stale post-migration and should be regenerated after this phase, not trusted during it.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:70:- `env.ts` is imported by nearly everything downstream — its Zod schema is the single source of config truth.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:73:- `backend/app/` (FastAPI `main.py`, `__init__.py`), `backend/requirements.txt`, `backend/Dockerfile` (python:3.11-slim) — all superseded by the Node stack.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:74:- `frontend/package-lock.json` — deleted in favor of pnpm workspace (D-03).
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:81:- Health endpoint should report mode: `GET /health → { status: 'ok', mode: 'mock' | 'real' }` — makes the mock toggle visible and demoable from turn one (D-02).
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:90:- Real Phoenix/SSH/LLM mock client implementations — built in their own phases (2/4/5); Phase 1 only builds the seam they plug into.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:91:- Regenerating the stale `.planning/codebase/*.md` maps to reflect the Node stack — a docs/housekeeping task, not Phase 1 scope.
.planning/milestones/v1.0-phases/01-repo-foundation/01-CONTEXT.md:92:- Drizzle ORM over raw better-sqlite3 — TASKS P2-6, only if raw SQLite becomes painful.
.planning/milestones/v1.0-phases/01-repo-foundation/01-DISCUSSION-LOG.md:4:> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.
.planning/milestones/v1.0-phases/01-repo-foundation/01-DISCUSSION-LOG.md:47:**Notes:** Resolves the lockfile conflict — frontend currently ships `package-lock.json` (npm) but docs lock pnpm. Delete `frontend/package-lock.json`; adopt a root pnpm workspace covering both packages. One install, one test entry point.
.planning/milestones/v1.0-phases/01-repo-foundation/01-DISCUSSION-LOG.md:55:| tsx direct, no build | `node:22-slim`, `corepack enable`, `pnpm install`, `CMD pnpm tsx src/index.ts` — zero build step | ✓ |
.planning/milestones/v1.0-phases/01-repo-foundation/01-DISCUSSION-LOG.md:70:- None — discussion stayed within Phase 1 scope (repo foundation, env, mock seam).
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:5:method: inline (orchestrator — time-boxed hackathon)
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:10:# Phase 1: Repo Foundation — Verification
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:12:**Result:** PASSED — all 5 success criteria met, all 4 requirements covered.
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:26:- **PLAT-01** (Node 22 + Hono + TS; health) — 01-01 scaffold + 01-03 wiring ✓
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:27:- **PLAT-02** (Zod env fail-fast) — 01-02 ✓
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:28:- **PLAT-03** (`.env.example` placeholders; secrets git-ignored) — 01-01 ✓
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:29:- **PLAT-04** (mock mode drives loop offline) — 01-02 resolver + 01-03 health ✓
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:41:- Frontend Dockerfile has a stale BuildKit layer-cache conflict (`COPY .` over a dir that held `node_modules/@types/react`). Backend health verified via `--build backend`. Needs a `docker buildx prune` or frontend cache-bust — pre-existing, out of Phase 1 scope.
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:42:- Test stubs for `safety`/`phoenix-client`/`orchestrator` are empty (0 tests) by design — filled in Phases 2/3/5.
.planning/milestones/v1.0-phases/01-repo-foundation/01-VERIFICATION.md:46:Verification performed inline by the orchestrator rather than via the `gsd-verifier` subagent — deliberate time-box decision under the 10h hackathon freeze. Every criterion was checked against the actual codebase (grep/git/test run), not assumed.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:53:Purpose: Establish contracts before implementing the client — executor sees exact shapes needed.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:77:    - backend/src/phoenix/types.ts — current stub (export {})
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:78:    - docs/phoenix-openapi.yaml — locked schema source; read every schema under components/schemas
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:79:    - backend/src/env.ts — ESM import style with .js suffix; no import-time side effects pattern
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:86:    - CustomerSystemSchema: ticket_id:z.number(), customer_id:z.number(), system:SystemInfoSchema — all required
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:87:    - EmployeeSchema: id, firstname, lastname, username, teamname — all required z.number()/z.string()
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:88:    - CustomerSchema: id, company_name, firstname, lastname, system:SystemInfoSchema — all required
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:96:    - Test: TicketSchema.safeParse({id:1,title:'t',description:'d',priority:'high',status:'OPEN',customer_id:1}) — missing customer_name — .success === false
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:107:    behavior cases above. Import schemas from '../phoenix/types.js'. Run `cd /Users/julianschmidt/Documents/GitHub/techbold_track_template/backend && npm test -- --reporter=verbose 2>&1 | tail -30` — confirm tests fail (import resolves to empty export {}).
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:112:    types with `export type Name = z.infer<typeof NameSchema>`. No import-time side effects — only
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:113:    imports from 'zod'. ESM: file has no default export; named exports only. Run tests — confirm green.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:116:    No runtime behaviour change. Re-run tests — still green.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:118:    Do NOT add schemas beyond what docs/phoenix-openapi.yaml defines. Do NOT use z.bigint() —
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-PLAN.md:145:| T-02-01 | Tampering | phoenix/types.ts schema parsing | mitigate | Use z.parse() (throws on invalid) not z.cast(); reject unknown fields with .strict() on schemas used as security boundaries — Ticket and CustomerSystem |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-SUMMARY.md:27:    - Named ESM exports only — no default export
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-SUMMARY.md:34:  - "Applied .strict() to TicketSchema and CustomerSystemSchema per threat model T-02-01 — unknown fields at the Phoenix API boundary are rejected rather than silently passed through"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-SUMMARY.md:66:- **Found during:** REFACTOR step — threat model T-02-01 explicitly mandates `.strict()` on Ticket and CustomerSystem as security boundaries
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-SUMMARY.md:73:- RED commit: d3d4cd1 — `test(02-01): add failing tests for Phoenix Zod schemas` (28 failures confirmed)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-SUMMARY.md:74:- GREEN+REFACTOR commit: ea1ceca — `feat(02-01): implement Phoenix Zod schemas for all OpenAPI entities` (50/50 passing)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-01-SUMMARY.md:78:No new network endpoints, auth paths, or file access patterns introduced. This plan is pure type definitions — no runtime surface added.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:48:      via: "getEnv() for PHOENIX_API_URL and PHOENIX_API_TOKEN — lazy, no import-time side effects"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:57:Purpose: The client is the single choke-point between the backend and the Phoenix ERP — correct
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:87:    - backend/src/phoenix/client.ts — current stub
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:88:    - backend/src/tests/phoenix-client.test.ts — current stub (describe.skip)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:89:    - backend/src/phoenix/types.ts — all schemas produced by Plan 01 (needed for imports)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:90:    - docs/phoenix-openapi.yaml — exact paths, HTTP methods, and response schemas
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:91:    - backend/src/env.ts — resolveClientMode, getEnv, lazy access pattern
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:92:    - backend/src/routes/health.ts — ESM .js suffix import pattern to mirror
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:93:    - .planning/phases/02-erp-client-ticket-routes/02-01-SUMMARY.md — confirm type exports available
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:98:    constructor — caller passes values so the class is testable without env.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:118:    Error classes: PhoenixAuthError, PhoenixNotFoundError, PhoenixValidationError, PhoenixNetworkError — all extend Error with name set to class name.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:122:    Test behaviors (for phoenix-client.test.ts — unskip the describe.skip):
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:136:    RED: Expand backend/src/tests/phoenix-client.test.ts — remove describe.skip, add all test
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:138:    error classes from '../phoenix/client.js'. Run `cd /Users/julianschmidt/Documents/GitHub/techbold_track_template/backend && npm test -- --reporter=verbose 2>&1 | tail -40` — tests must fail
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:144:    `request<T>` method accepts Zod schema for response parsing — do NOT cast response with `as T`,
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:147:    a loop that runs at most twice — use a for loop with max=2, break on success, rethrow wrapped as
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:150:    listTickets builds query string from the optional query object — omit undefined keys. Uses
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:154:    ESM: all internal imports use .js suffix. No top-level getEnv() call — class is constructed
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:158:    Run tests — all green. Then run `cd /Users/julianschmidt/Documents/GitHub/techbold_track_template/backend && npx tsc --noEmit 2>&1 | head -20` — zero errors.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:169:    phoenix-client.test.ts is fully unskipped and green — all happy-path and error-path cases pass.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:190:| T-02-03 | Information Disclosure | PhoenixClient — PHOENIX_API_TOKEN | mitigate | Token only in Authorization header; never logged, never in error messages, never returned to caller; client constructed with explicit values not raw env strings exposed to caller |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:191:| T-02-04 | Tampering | PhoenixClient — response parsing | mitigate | All responses parsed through Zod schema; .parse() throws on mismatch — never use `as T` cast |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:192:| T-02-05 | Elevation of Privilege | ticketId path parameter | mitigate | Validate ticketId is integer > 0 before URL construction; throw TypeError if not — prevents path traversal (e.g. ticketId='../me') |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-PLAN.md:194:| T-02-07 | Spoofing | Retry on 4xx | mitigate | Retry only on 5xx/network; 401/404/422 never retried — prevents hammering auth endpoint |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:29:    - Zod schema.parse() on every 2xx response — no `as T` cast
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:38:  - "Constructor takes explicit baseUrl+token — no getEnv() in constructor, keeps class testable without env"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:39:  - "fetchWithRetry extracted as private method — request method stays under 30 lines"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:40:  - "4xx errors (401, 404, 422) never retried — prevents hammering auth endpoint (T-02-07)"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:41:  - "ticketId validated as integer > 0 before URL construction — prevents path traversal (T-02-05)"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:61:- Private `fetchWithRetry(url, options)` — AbortController per attempt (8s), retries once after 200ms on 5xx or thrown network errors, never on 4xx
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:62:- Private `request<T>(schema, method, path, body?, query?)` — builds URL with optional query params, sets auth header, delegates to fetchWithRetry, parses 2xx with `schema.parse()`, maps error status codes to typed error classes
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:64:- No `getEnv()` call in constructor — caller passes baseUrl and token explicitly
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:66:`backend/src/tests/phoenix-client.test.ts` — 17 test cases covering:
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:82:None — plan executed exactly as written. The REFACTOR step (extracting `fetchWithRetry`) was applied inline during GREEN since the structure was clear from the plan description.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:86:- RED commit: 0b436ee — `test(02-02): add failing tests for PhoenixClient` (17 failures confirmed)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:87:- GREEN commit: 85b2d8b — `feat(02-02): implement PhoenixClient with auth, timeout, retry, and error mapping` (67/67 passing)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-02-SUMMARY.md:99:- T-02-04: All responses parsed via `schema.parse()` — no `as T` casts
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:67:Purpose: Completes the vertical slice — after this plan a frontend (or curl) can hit
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:99:    - backend/src/phoenix/mock.ts — current stub
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:100:    - backend/src/phoenix/types.ts — all Zod schemas + TS types (Ticket, CustomerSystem, Employee, Activity, TicketStatus, ActivityCreate)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:101:    - backend/src/phoenix/client.ts — PhoenixClient method signatures to mirror exactly
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:102:    - docs/phoenix-openapi.yaml — required fields per schema
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:103:    - .planning/phases/02-erp-client-ticket-routes/02-02-SUMMARY.md — confirm client interface
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:112:    Titles/descriptions: generic service-desk language — "Service unavailable", "Login fails",
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:126:    - createActivity(body): returns a mock Activity — copy the input fields, add id:1, team_id:1, team_name:'Support', employee_id:1, description: body.description ?? ''
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:139:    methods reference the constants — listTickets returns a shallow copy (spread) to avoid mutating
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:143:    All methods return Promises wrapping synchronous logic — `return Promise.resolve(result)`.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:167:    - backend/src/routes/tickets.ts — current stub
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:168:    - backend/src/app.ts — current app; note existing health route mount pattern
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:169:    - backend/src/routes/health.ts — route pattern: new Hono(), router.get(), c.json(), .js suffix imports
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:170:    - backend/src/env.ts — resolveClientMode signature and EnvConfig type
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:171:    - backend/src/phoenix/types.ts — TicketListQuerySchema (or derive it here if not in types.ts)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:172:    - backend/src/phoenix/client.ts — PhoenixAuthError, PhoenixNotFoundError, PhoenixValidationError, PhoenixNetworkError
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:173:    - backend/src/phoenix/mock.ts — MockPhoenixClient
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:220:    @hono/zod-validator middleware — keeps the handler readable without ceremony. Parse status/priority/sort
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:221:    with z.optional() on the query object; on parse failure, proceed with undefined values (lenient —
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:224:    Update backend/src/app.ts — add the import and app.route line.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:230:    Then smoke-test the mock path (requires running server — skip if no server is running; rely on
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:232:    `curl -s http://localhost:8000/api/tickets 2>/dev/null | head -c 200 || echo "server not running (ok — verified via tests)"`
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-PLAN.md:261:| T-02-08 | Information Disclosure | GET /api/tickets — error responses | mitigate | Error JSON returns only a generic message string; PhoenixAuthError detail and token value are never included in response body |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:33:    - MockPhoenixClient mirrors PhoenixClient method signatures exactly — drop-in swap via resolveClientMode
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:34:    - Route handlers construct client lazily inside handler (not at module level) — keeps module importable in tests without populated env
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:37:    - PRIORITY_ORDER map for deterministic sort — avoids locale-dependent string comparison
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:47:  - "MockPhoenixClient exported as default class with named MOCK_TICKETS and MOCK_CUSTOMER_SYSTEMS — matches plan artifact spec and allows spyOn in tests"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:49:  - "PhoenixNotFoundError on list route returns 200 [] rather than 404 — an empty list is a valid response for a filtered query"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:50:  - "resolveClientMode('phoenix') checked lazily inside each handler — consistent with env.ts lazy-load pattern; client never constructed at import time"
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:60:In-memory MockPhoenixClient with generic fixture data, three Hono ticket routes with full error mapping, and app.ts mount — completing the mock vertical slice for GET /api/tickets.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:73:- `setStatus`: mutates ticket in-place (state resets on server restart — intentional for demo), throws `PhoenixNotFoundError` if unknown.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:75:`MOCK_TICKETS`: 4 generic tickets — ids 1–4, 2× OPEN / 1× PENDING / 1× DONE, priorities high/high/medium/low. No hostnames, no real IPs in ticket content.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:83:- `GET /` — parses `status`/`priority`/`sort` query params via manual Zod; invalid sort defaults rather than 400 (lenient per plan). Error mapping: `PhoenixAuthError`→502, `PhoenixNetworkError`→502, `PhoenixNotFoundError`→200 `[]`.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:84:- `GET /:id` — `parseInt` + NaN guard → 400; `PhoenixNotFoundError`→404; auth/network→502.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:85:- `GET /:id/customer-system` — same id parsing; `PhoenixNotFoundError`→404 "customer system not found".
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:93:- `src/tests/mock-phoenix.test.ts` — 24 cases: MOCK_TICKETS shape, MOCK_CUSTOMER_SYSTEMS shape, all six MockPhoenixClient methods including filter/sort, shallow-copy invariant, in-place mutation via `setStatus`.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:94:- `src/tests/tickets.test.ts` — 11 cases: list with/without filter and sort, single ticket happy path, 404, 400 on non-integer id, customer-system happy path + 404 + 400, PhoenixAuthError→502 mapping.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:98:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:102:- Task 1 RED commit: 3dce47f — `test(02-03): add failing tests for MockPhoenixClient` (24 failures confirmed)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:103:- Task 1 GREEN commit: bae4235 — `feat(02-03): implement MockPhoenixClient with generic fixture data` (91/91 passing)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:104:- Task 2 RED commit: ee1e930 — `test(02-03): add failing tests for ticket routes` (10 failures confirmed)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:105:- Task 2 GREEN commit: f799bb5 — `feat(02-03): implement ticket routes and mount at /api/tickets` (102/102 passing)
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-03-SUMMARY.md:117:| New inbound surface | backend/src/routes/tickets.ts | Three GET routes exposed — covered by plan threat model T-02-08 through T-02-12 |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:18:- Return the Phoenix `Ticket[]` shape as-is (typed and Zod-validated) — no envelope wrapper. Mirrors the OpenAPI contract 1:1.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:19:- Build the full typed Phoenix client surface now: `listTickets`, `getTicket`, `getCustomerSystem`, `getMe`, `createActivity`, `setStatus` — so later phases (5/7) reuse it without additions. Only the three routes above are wired in Phase 2.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:30:- Fixtures are generic placeholders — no real symptom strings, hostnames, or per-incident data. Generalisation rule forbids hardcoding.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:43:- `backend/src/env.ts` — `resolveClientMode('phoenix')` and `isMockMode()` already decide mock vs real; reuse directly.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:44:- `backend/src/app.ts` — Hono app with open CORS and `app.onError` JSON handler; mount the tickets router here.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:45:- `backend/src/routes/health.ts` — established route pattern (`new Hono()`, `c.json(...)`, `.js` import suffix).
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:50:- Lazy env access (`getEnv()`), no import-time side effects — keep the client importable in tests without full env.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-CONTEXT.md:71:- `GET /api/me` route and `setStatus`/`createActivity` route wiring — client methods built now, routes deferred to Phases 6/7 where they are used.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW-FIX.md:23:### CR-01 — PhoenixValidationErrorSchema.loc rejects integer indices
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW-FIX.md:29:### CR-02 — PhoenixValidationError uncaught in ticket routes
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW-FIX.md:34:### WR-01 — setStatus mutated shared MOCK_TICKETS fixture
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW-FIX.md:38:### WR-02 — invalid query params silently returned all tickets
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW-FIX.md:42:### WR-03 — mock sort=date sorted by id
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW-FIX.md:47:### WR-04 — SystemInfoSchema not .strict()
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW-FIX.md:51:### WR-05 — app.onError leaked err.message
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:33:Reviewed the Phoenix ERP client, mock, type schemas, ticket routes, and their test suites. The overall structure is sound — error class hierarchy, retry logic, and Zod boundary validation are correctly implemented. Three issues require fixes before this code can be trusted in production or with a real Phoenix instance: the `loc` field type in `PhoenixValidationErrorSchema` will throw at parse time on any FastAPI list-field validation error; `PhoenixValidationError` bubbles to a 500 in the ticket routes because catch blocks don't handle it; and `setStatus` on the mock permanently mutates the shared fixture array, which contaminates test isolation across files.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:39:### CR-01: `PhoenixValidationErrorSchema.loc` typed as `z.array(z.string())` — integer indices cause runtime parse failure
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:43:**Issue:** FastAPI includes the integer array index in `loc` when validation fails on a list element — e.g. `["body", 0, "field_name"]`. The schema types `loc` as `z.array(z.string())`, so any 422 response for a list field fails Zod parsing inside `request()`, throwing a `PhoenixValidationError` with a misleading "Response shape mismatch" message instead of the correct "Phoenix returned 422" mapping. The 422 switch case in `client.ts` line 157 is therefore unreachable for the most common FastAPI validation errors.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:64:### CR-02: `PhoenixValidationError` not caught in ticket route handlers — schema mismatch returns 500 with Zod error detail
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:68:**Issue:** The `request()` method in `client.ts` throws `PhoenixValidationError` in two cases: a 422 response from Phoenix (line 157) and a Zod parse failure on an otherwise-OK response (line 146). Neither the `GET /` list handler nor the `GET /:id` or `GET /:id/customer-system` handlers catch `PhoenixValidationError`. It propagates to `app.onError`, which returns `{ error: err.message }` with status 500. The `err.message` for a parse failure contains the full Zod error string including field paths and received values — this leaks schema internals to the client. For a 422, the correct mapping per the architecture is a 502 (upstream rejected the request).
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:91:**Issue:** `ticket.status = status` modifies the object reference inside the module-level `MOCK_TICKETS` array. `listTickets` uses `[...MOCK_TICKETS]` (shallow array copy), so the mutated ticket objects are shared across all consumers. Any test in any file that calls `setStatus` without cleanup leaves the fixture in a modified state for subsequent tests in the same Vitest worker. `tickets.test.ts` works around this with a manual `beforeEach` reset (lines 26-33) keyed to hardcoded `{ 1: 'OPEN', 2: 'OPEN', 3: 'PENDING', 4: 'DONE' }` — which will silently break if fixture data changes.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:104:Note: `mock-phoenix.test.ts` line 177 explicitly asserts the in-place mutation (`expect(MOCK_TICKETS.find(...).status).toBe('DONE')`). That assertion tests an implementation detail that becomes incorrect after this fix — update it to assert only the returned value.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:108:### WR-02: `ListQuerySchema` parse failure silently falls back to no-filter — invalid query params return wrong data with 200
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:131:**Issue:** The real `PhoenixClient.listTickets` passes `sort=date` directly to Phoenix as a query parameter, which presumably sorts by ticket creation date. The mock implements `sort=date` as `result.sort((a, b) => a.id - b.id)`. This only produces correct results because the fixture IDs are insertion-ordered. If fixtures are ever reordered or IDs become non-sequential, mock sort-by-date diverges from real API behavior. All `created_at` values are present in the fixtures — use them.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:146:### WR-04: `SystemInfoSchema` is not `.strict()` — breaks the trust boundary stated in T-02-01
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:167:### WR-05: `app.onError` returns `err.message` verbatim — leaks internal details on unhandled errors
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-REVIEW.md:199:**Issue:** Both modules export a symbol named `PhoenixValidationError`. `types.ts` exports it as a TypeScript type (Zod inferred). `client.ts` exports it as a runtime class. Any file that imports from both will need aliasing. Currently `routes/tickets.ts` only imports from `client.ts`, so no collision at runtime — but this is a maintenance trap. Rename the Zod-inferred type to avoid future confusion:
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:14:**Re-verification:** No — initial verification
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:26:| 1 | TicketStatusSchema parses OPEN, PENDING, DONE and rejects unknown strings | VERIFIED | `types.ts:5` — `z.enum(['OPEN','PENDING','DONE'])`. 31 tests in `phoenix-types.test.ts` pass including parse/reject cases. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:27:| 2 | TicketSchema validates all required fields and accepts optional sla_due_at/created_at as null | VERIFIED | `types.ts:17-28` — all required fields present; `sla_due_at: z.string().nullable().optional()`, `created_at: z.string().nullable().optional()`. Tests confirm. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:28:| 3 | CustomerSystemSchema validates ticket_id, customer_id, and nested SystemInfo | VERIFIED | `types.ts:31-35` — `ticket_id: z.number(), customer_id: z.number(), system: SystemInfoSchema`. `.strict()` applied. Tests confirm. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:29:| 4 | ActivityCreateSchema validates required fields and accepts optional documentation fields | VERIFIED | `types.ts:55-65` — `ticket_id`, `start_datetime`, `end_datetime` required; six optional string fields. Tests confirm. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:30:| 5 | All six schemas are exported and produce inferred TypeScript types | VERIFIED | `types.ts:102-111` — all ten `export type` declarations present. `tsc --noEmit` clean. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:31:| 6 | PhoenixClient.listTickets() calls GET /api/v1/me/tickets with Bearer auth and returns Ticket[] | VERIFIED | `client.ts:49-59` — builds params, calls `request(z.array(TicketSchema), 'GET', '/api/v1/me/tickets', ...)`. Auth header set at `client.ts:130-133`. 17 tests pass. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:32:| 7 | PhoenixClient.getTicket(id) calls GET /api/v1/tickets/{id} and returns a single Ticket | VERIFIED | `client.ts:61-64` — validates id then calls correct path with TicketSchema. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:33:| 8 | PhoenixClient.getCustomerSystem(id) calls GET /api/v1/tickets/{id}/customer-system and returns CustomerSystem | VERIFIED | `client.ts:66-69` — CustomerSystemSchema used. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:34:| 9 | PhoenixClient.getMe() calls GET /api/v1/me and returns Employee | VERIFIED | `client.ts:71-73` — EmployeeSchema. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:35:| 10 | PhoenixClient.createActivity(body) calls POST /api/v1/activities/create and returns Activity | VERIFIED | `client.ts:75-77` — POST with body, ActivitySchema. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:36:| 11 | PhoenixClient.setStatus(id, status) calls PATCH /api/v1/tickets/{id}/status and returns Ticket | VERIFIED | `client.ts:79-82` — PATCH with `{status}` body, TicketSchema. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:37:| 12 | 401→PhoenixAuthError; 404→PhoenixNotFoundError; 422→PhoenixValidationError | VERIFIED | `client.ts:152-158` — switch on status code. Tests cover all three paths. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:38:| 13 | 5xx/network error retried exactly once with 200ms backoff; second failure throws PhoenixNetworkError; 4xx never retried | VERIFIED | `client.ts:91-113` — `for (attempt < 2)` loop; 5xx at attempt 0 continues; catch at attempt 0 continues; 4xx hits switch in `request()` before retry logic. Tests: retry-succeeds, retry-fails, no-retry-on-401. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:39:| 14 | All requests use an 8s AbortController timeout | VERIFIED | `client.ts:92-93` — `new AbortController()` with `setTimeout(() => controller.abort(), 8000)` per attempt. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:40:| 15 | GET /api/tickets returns 200 with Ticket[] and supports status/sort filtering in mock mode; GET /api/tickets/:id and GET /api/tickets/:id/customer-system return correct data or typed errors | VERIFIED | `tickets.ts:24-101` — three routes wired. `app.ts:12` — `app.route('/api/tickets', ticketsRouter)`. 13 tests in `tickets.test.ts` pass covering list, filter, single, 404, 400, customer-system, 502 mapping. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:41:| 16 | Mock covers all six client methods with generic fixture data spanning OPEN/PENDING/DONE | VERIFIED | `mock.ts:56-131` — all six methods implemented. `MOCK_TICKETS` has 4 entries: 2×OPEN, 1×PENDING, 1×DONE. All private-range IPs (10.0.0.1–4). 24 tests in `mock-phoenix.test.ts` pass. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:54:| `backend/src/tests/phoenix-client.test.ts` | Rubric-E named test file — mocked fetch, all client methods + error paths | VERIFIED | 17 tests, `describe.skip` count: 0 |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:68:| `tickets.ts` | `client.ts` OR `mock.ts` | `resolveClientMode('phoenix')` gate | WIRED | `tickets.ts:16-22` — `getClient()` function checks `resolveClientMode`; returns MockPhoenixClient or PhoenixClient accordingly |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:69:| `tickets.ts` | `types.ts` | `TicketStatusSchema` import for query validation | WIRED | `tickets.ts:6` — `import { TicketStatusSchema } from '../phoenix/types.js'`; used in `ListQuerySchema` at line 11 |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:70:| `app.ts` | `tickets.ts` | `app.route('/api/tickets', ticketsRouter)` | WIRED | `app.ts:4,12` — import and mount confirmed |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:71:| `tickets.ts` | `env.ts` | `getEnv()` lazy inside handler, not at module level | WIRED | `tickets.ts:3,20-21` — `getEnv()` called inside `getClient()`, not at module top level |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:77:Routes serve mock data only in this phase (live Phoenix wiring is the correct design — `PhoenixClient` calls out to a real ERP). The mock path is the primary exercised path.
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:81:| `tickets.ts` GET / | `tickets` | `getClient().listTickets(query)` → `MockPhoenixClient.listTickets()` → `[...MOCK_TICKETS]` | Yes — filtered/sorted spread of module-level constant | FLOWING |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:82:| `tickets.ts` GET /:id | `ticket` | `getClient().getTicket(id)` → `MOCK_TICKETS.find(...)` | Yes — finds by id, throws PhoenixNotFoundError if missing | FLOWING |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:83:| `tickets.ts` GET /:id/customer-system | `customerSystem` | `getClient().getCustomerSystem(id)` → `MOCK_CUSTOMER_SYSTEMS[ticketId]` | Yes — keyed lookup, throws PhoenixNotFoundError if missing | FLOWING |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:93:| Full test suite passes | `npm test` in `backend/` | 105 passed, 2 skipped (safety/orchestrator stubs — pre-existing, not Phase 2) | PASS |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:113:| ERP-01 | Plans 01, 02 | Typed Phoenix client lists assigned tickets (auth, 8s timeout, 1 retry on 5xx) | SATISFIED | `client.ts` — PhoenixClient with AbortController 8s, fetchWithRetry loop, Bearer auth. 17 tests green. |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:130:| `client.ts` | 97 | `// 5xx — retry once` | Info | Legitimate why-comment explaining non-obvious loop control — not a debt marker |
.planning/milestones/v1.0-phases/02-erp-client-ticket-routes/02-VERIFICATION.md:131:| `client.ts` | 112 | `// Reached only when second attempt returned a 5xx response` | Info | Legitimate why-comment on unreachable-looking code path — not a debt marker |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:31:      provides: "validateCommandAgainstPolicy — the single gate used at proposal and approval"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:38:      provides: "classifyCommand — deterministic risk level assignment"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:60:classifier (`classifier.ts`). These are the two functions every command passes through — at
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:91:  <name>Task 1: RED — write failing tests for blocklist + classifier</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:95:    - backend/src/safety/risk-levels.ts (RiskLevel enum — the four values)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:96:    - docs/SAFETY_POLICY.md §3 (blocklist patterns — exhaustive list)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:97:    - docs/SAFETY_POLICY.md §4 (allowlist — SAFE_READ_ONLY examples)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:99:    - docs/SAFETY_POLICY.md §9 (test checklist — the exact cases required)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:103:    Create `backend/src/tests/safety-policy.test.ts` (new file — not the consolidated safety.test.ts, which is 03-04's responsibility). This file owns policy and classifier RED tests only; redaction RED tests live in `safety-redaction.test.ts` (03-02).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:105:    Blocklist tests — each must assert `allowed === false` AND `riskLevel === RiskLevel.HIGH_RISK_BLOCKED` AND `matchedRule` is a non-empty string:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:138:    Chained command tests — the chosen approach for chained commands is: split the normalized
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:147:    Obfuscation tests — must still block:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:152:    Targeted variant tests — must NOT be blocked (classify to LOW or MEDIUM, not HIGH):
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:157:    Classifier allowlist tests — must return SAFE_READ_ONLY:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:173:    Create `backend/src/tests/safety-policy.test.ts`. Use a top-level `describe('safety — policy and classifier', ...)` block. Import `validateCommandAgainstPolicy` from `../safety/command-policy.js` and `classifyCommand` from `../safety/classifier.js` using ESM `.js` import suffixes (established pattern from Phase 2). Import `RiskLevel` from `../safety/risk-levels.js`. All tests in this task fail because the implementations are stubs that export nothing. Commit with message: `test(03-01): add failing tests for blocklist policy and classifier`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:180:  <done>Test file imports from the two stub modules and all new tests fail (RED state). No compile errors — only runtime/assertion failures.</done>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:184:  <name>Task 2: GREEN — implement command-policy.ts and classifier.ts</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:188:    - docs/SAFETY_POLICY.md §3 (full blocklist — every bullet is a regex rule category)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:191:    - docs/SAFETY_POLICY.md §8 (enforcement points — validateCommandAgainstPolicy is called at both proposal and approval)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:192:    - backend/src/safety/risk-levels.ts (RiskLevel enum — import, do not redefine)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:204:    Export `BLOCKLIST` as a readonly array of `BlocklistRule`. Represent every §3 bullet as one or more labeled rules. Rule categories and their `ruleName` strings (use these exact names — they appear in audit records):
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:205:    - `rm-rf-system-paths` — rm -rf on /, /*, ~, and system directories (/etc, /var, /home, /srv, /usr, /boot, /var/lib/*)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:206:    - `recursive-find-delete` — find … -delete over system paths
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:207:    - `disk-wipe` — mkfs.*, mke2fs, dd if=…of=/dev/*, wipefs, shred on devices
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:208:    - `block-device-write` — direct writes to /dev/sd* or /dev/hd*
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:209:    - `shutdown-reboot` — shutdown, reboot, halt, poweroff, init 0, init 6
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:210:    - `fork-bomb` — :(){ :|:& };: and variants
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:211:    - `broad-chmod-chown` — chmod -R 777 / chmod 777 -R on system trees; chown -R on /
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:212:    - `disable-security` — ufw disable, iptables -F, systemctl stop/disable/mask firewalld/ufw/auditd, setenforce 0
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:213:    - `secret-exposure` — cat /etc/shadow, cat ~/.ssh/id_*, .env dumps, printenv piped externally
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:214:    - `hide-tracks` — history -c, rm/truncate of /var/log/*, journalctl --vacuum, echo > ~/.bash_history
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:215:    - `exfiltration` — curl … | sh, wget … | sh, curl/wget POSTing to external, nc/netcat reverse shells
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:216:    - `db-destruction` — DROP DATABASE, DROP TABLE, TRUNCATE (SQL keyword — matches `TRUNCATE TABLE` and bare `TRUNCATE`), dropdb, rm of /var/lib/postgresql or /var/lib/mysql, re-initdb
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:217:    - `run-as-root` — sudo su root, exec as root to bypass permissions
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:218:    - `mass-kill` — kill -9 -1, pkill of system services, kill PID 1
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:224:    4. Attempt to resolve simple `$(echo foo)`-style wrappers where the inner string is a plain literal — replace with the literal. If the `$()` or backtick content is non-trivial (contains spaces, pipes, variables), mark the command as unresolvable.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:225:    5. If unresolvable, return a sentinel that will match the `fork-bomb` or a catch-all BLOCK rule — simplest approach: if the normalized form still contains `$(` or a backtick with non-trivial content, block it by prepending `__UNRESOLVABLE__ ` (the caller checks for this prefix and returns HIGH_RISK_BLOCKED with rule name `unresolvable-wrapper`).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:227:    Chained command handling: after normalization, split the command string on unescaped `;`, `&&`, and `||` separators to obtain individual segments. Trim each segment. Run the blocklist regexes against each segment independently (no start-anchors on the regexes — they must match anywhere in the segment string). If any segment matches a blocklist rule, return HIGH_RISK_BLOCKED with that rule. This means `echo hi; rm -rf /etc` is caught at the `rm -rf /etc` segment. No regex should use a `^` start-anchor that would prevent matching mid-string in a segment.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:231:    2. Check for `__UNRESOLVABLE__` prefix → return `{ allowed: false, riskLevel: HIGH_RISK_BLOCKED, matchedRule: 'unresolvable-wrapper', reason: 'Command contains unresolvable subshell or backtick — blocked conservatively' }`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:239:    1. If `validateCommandAgainstPolicy` would block it (i.e., the blocklist matches) → return `HIGH_RISK_BLOCKED`. To avoid circular import, the classifier calls its own internal blocklist check (re-use the normalize + BLOCKLIST array imported from command-policy). Alternatively, structure it so classifier imports BLOCKLIST from command-policy but command-policy calls classifyCommand — this creates a cycle. Preferred structure: classifier does NOT call validateCommandAgainstPolicy; instead command-policy imports classifyCommand and calls it as step 5 after the blocklist pass. The classifier itself only handles levels SAFE_READ_ONLY / LOW_RISK_CHANGE / MEDIUM_RISK_CHANGE.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:240:    2. Allowlist patterns (SAFE_READ_ONLY — must match tightly to a specific-target, bounded, read-only shape):
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:271:  <name>Task 3: REFACTOR — harden edge cases and verify obfuscation coverage</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:275:    - backend/src/tests/safety-policy.test.ts (the passing tests — do not break them)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:280:    Review the normalized + matched results for the obfuscation test cases from Task 1 (`rm  -rf  /etc` with extra spaces, `'rm' -rf /etc` with quotes, `chmod -R 777 ${HOME}` with unresolvable var, and the chained cases `echo hi; rm -rf /etc`, `systemctl status nginx && rm -rf /`). Confirm each still matches its rule after normalization and segment splitting. If any edge case passes through, tighten the relevant regex. No new behaviour — only make the existing tests more robustly pass. Commit: `refactor(03-01): harden normalization for obfuscation edge cases`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:306:| T-03-02 | Elevation of Privilege | classifyCommand fallthrough | mitigate | Unknown commands default to MEDIUM_RISK_CHANGE — never fall through to SAFE_READ_ONLY silently; tested with `someobscurecommand` case |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:307:| T-03-03 | Tampering | edited-command recheck bypass | mitigate | validateCommandAgainstPolicy is stateless pure function; calling it a second time on the edited string is identical to the first call — no bypass path; SAFE-05 tested directly |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:309:| T-03-05 | Tampering | chained command bypass via ; && \|\| | mitigate | Normalized string split on unescaped shell separators; each segment validated independently — `echo hi; rm -rf /etc` caught at second segment |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:330:- `echo hi; rm -rf /etc` is blocked — chained-command segment splitting catches the dangerous segment
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-PLAN.md:334:- The same function called at proposal time and approval time (SAFE-05 recheck) — no special case needed because the function is pure and stateless
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:33:  - "Chained commands split on unescaped ;, &&, || before blocklist matching — each segment tested independently, no regex start-anchors"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:49:Deterministic safety gate implemented via TDD: `validateCommandAgainstPolicy` (blocklist + normalization + chained-segment splitting) and `classifyCommand` (risk-level assignment) — the two functions every command passes through at proposal and approval time.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:60:- `classifyCommand`: deterministic risk assignment. Precedence: SAFE_READ_ONLY allowlist (systemctl status, journalctl, df, ss, ps, uname, etc.) → LOW_RISK_CHANGE (targeted restart/chown/chmod/mkdir) → MEDIUM_RISK_CHANGE for everything else (including unrecognized commands — never silently SAFE_READ_ONLY per SAFE-02).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:67:- RED gate: `test(03-01): add failing tests for blocklist policy and classifier` — all 48 tests failed (stubs exported nothing).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:68:- GREEN gate: `feat(03-01): implement blocklist policy and risk classifier` — all 48 tests pass.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:69:- REFACTOR gate: `refactor(03-01): harden normalization for obfuscation edge cases` — no code changes required; trace-through of all 6 obfuscation/chaining edge cases confirmed existing implementation already handles them. Zero regressions.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:94:- **Fix:** Replaced with two separate replacements — one for single-quoted tokens, one for double-quoted tokens. Semantically equivalent.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:100:None — all exported functions are fully implemented.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-01-SUMMARY.md:104:None — no new network endpoints, auth paths, or schema changes introduced. All surface is internal pure functions.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:24:    - "redactSecrets is a pure function — same input always produces same output, no side effects"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:28:      provides: "redactSecrets — pure function applied at every trust boundary"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:43:Implement `redaction.ts` — the pure function that strips secrets from every string before it
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:70:  <name>Task 1: RED — write failing redaction tests</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:74:    - docs/SAFETY_POLICY.md §6 (redaction — exact pattern list and replacement format)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:75:    - docs/SAFETY_POLICY.md §9 (test checklist — redaction bullet)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:80:    Create `backend/src/tests/safety-redaction.test.ts` (new file — separate from the policy tests in `safety-policy.test.ts` and from the consolidated `safety.test.ts` owned by 03-04). Use a top-level `describe('safety — redaction', ...)` block. Import `redactSecrets` and `REDACTION_CAP_BYTES` from `../safety/redaction.js`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:82:    Private key tests — multi-line blocks must be caught (the `private-key-block` pattern uses `[\s\S]` or the `s` flag so it matches across newlines):
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:141:    Create `backend/src/tests/safety-redaction.test.ts` with the `describe('safety — redaction')` block described above. Use the ESM `.js` import suffix. All tests fail because the stub exports nothing. Commit: `test(03-02): add failing tests for secret redaction`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:152:  <name>Task 2: GREEN — implement redaction.ts</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:156:    - docs/SAFETY_POLICY.md §6 (authoritative pattern list — implement every bullet)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:158:    - backend/src/safety/risk-levels.ts (import style reference — ESM .js suffix, no top-level side effects)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:167:    - `private-key-block` — matches `-----BEGIN ... PRIVATE KEY-----` … `-----END ... PRIVATE KEY-----` across newlines. The regex MUST use `[\s\S]*?` (not `.*?`) so it matches multi-line key material. Correct form: `/-----BEGIN[\s\S]*?PRIVATE KEY-----[\s\S]*?-----END[^-]*PRIVATE KEY-----/g`. Do NOT use `.*?` with just the `g` flag — that will fail on blocks with embedded newlines. Replacement: `«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:168:    - `password-field` — matches `password\s*=\s*\S+` and `passwd\s*=\s*\S+`, case-insensitive, `g` flag. Replacement: preserve key name + `=«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:169:    - `token-field` — matches `token\s*=\s*\S+`, case-insensitive, `g` flag. Replacement: preserve key + `=«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:170:    - `secret-field` — matches `secret\s*=\s*\S+`, case-insensitive, `g` flag. Replacement: preserve key + `=«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:171:    - `api-key-field` — matches `api[_-]?key\s*=\s*\S+`, case-insensitive, `g` flag. Replacement: preserve key + `=«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:172:    - `authorization-header` — matches `Authorization\s*:\s*.+` (to end of line), case-insensitive, `g` flag. Replacement: preserve `Authorization: ` prefix + `«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:173:    - `bearer-token` — matches `Bearer\s+[A-Za-z0-9\-_.~+/]+=*`, case-insensitive, `g` flag. Replacement: `Bearer «redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:174:    - `db-connection-string` — matches `(postgres(?:ql)?|mysql|mongodb|redis):\/\/[^@\s]+@[^\s]+`, `g` flag. Replacement: preserve scheme + `://«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:175:    - `aws-access-key` — matches `AKIA[A-Z0-9]{16}`, `g` flag. Replacement: `«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:176:    - `env-secret-var` — matches `\b(?:[A-Z_]*(?:SECRET|TOKEN|KEY|PASS|PASSWORD|CREDENTIAL)[A-Z_0-9]*)\s*=\s*\S+`, `g` flag. Replacement: preserve key name + `=«redacted»`. Apply this pattern AFTER the more specific ones to avoid double-redacting.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:177:    - `azure-sas-fragment` — matches `sig=[A-Za-z0-9%+/=]{20,}`, `g` flag. Replacement: `sig=«redacted»`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:181:    2. Apply each pattern in `REDACTION_PATTERNS` in order using `String.prototype.replace`. The `private-key-block` pattern uses `[\s\S]*?` as described above — no separate `s` flag needed since `[\s\S]` already matches newlines. All other patterns use the `g` flag.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:197:  <name>Task 3: REFACTOR — verify context preservation and pattern ordering</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:201:    - backend/src/tests/safety-redaction.test.ts (context-preservation tests — key names must survive redaction)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:202:    - docs/SAFETY_POLICY.md §6 (replacement format: "token=«redacted»" — key preserved)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:206:    Check the context-preservation tests: `"token=abc123"` must become `"token=«redacted»"` (not `"«redacted»"`). If any replacement pattern is discarding the key name, fix the capture group in the regex so the replacement reuses group 1 (the key) and replaces only the value. Also verify the `env-secret-var` pattern does not double-redact strings that were already handled by `token-field` or `password-field` (if both fire, the result should still be readable, not `"token=«redacted»«redacted»"`). Adjust pattern ordering or add a negative lookahead if needed. No new tests added — this is clean-up only. Commit: `refactor(03-02): fix context preservation in redaction replacements`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:231:| T-03-05 | Information Disclosure | redactSecrets miss | mitigate | Full §6 pattern set implemented and tested; regression here is a potential hard-fail — dedicated test describe block covers every pattern category |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:232:| T-03-06 | Information Disclosure | 16 KB cap ordering | mitigate | Cap applied BEFORE pattern matching — a secret near byte 16385 in a large output is dropped with the tail, not leaked after cap |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:233:| T-03-07 | Information Disclosure | double-redaction artefact | accept | Double redaction produces `«redacted»«redacted»` — verbose but not a secret leak; mitigated further by refactor task |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-PLAN.md:235:| T-03-09 | Information Disclosure | multi-line private key not redacted | mitigate | private-key-block pattern uses [\s\S]*? — dotall-equivalent — so multi-line PEM blocks are caught; tested explicitly with a multi-line key fixture |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:22:  - "REFACTOR task had no changes — context preservation and pattern ordering were correct after GREEN"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:32:**One-liner:** Pure `redactSecrets` function covering all SAFETY_POLICY §6 patterns — PEM private keys, credential fields, auth headers, DB connection strings, AWS/Azure keys — with 16 KB cap, key-name preservation (`token=«redacted»`), and dotall-safe multi-line PEM matching.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:38:- `REDACTION_CAP_BYTES = 16384` — the input cap constant
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:39:- `RedactionPattern` type — `{ name, pattern, replacement }`
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:40:- `redactSecrets(text: string): string` — pure function, no side effects, no I/O
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:43:1. `private-key-block` — `[\s\S]*?` dotall-safe multi-line PEM match
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:44:2. `authorization-header` — case-insensitive, preserves header name
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:45:3. `bearer-token` — standalone `Bearer <token>` form
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:46:4. `db-connection-string` — postgres/postgresql/mysql/mongodb/redis with credentials
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:47:5. `aws-access-key` — `AKIA[A-Z0-9]{16}`
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:48:6. `azure-sas-fragment` — `sig=<long-value>`
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:49:7. `password-field` — `passw(?:or)?d=` (matches both `passwd` and `password`, case-insensitive)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:50:8. `token-field` — `token=` case-insensitive
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:51:9. `secret-field` — `secret=` case-insensitive
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:52:10. `api-key-field` — `api[_-]?key=` case-insensitive
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:53:11. `env-secret-var` — uppercase env var names containing SECRET/TOKEN/KEY/PASS/PASSWORD/CREDENTIAL, with negative lookahead to prevent double-redaction
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:59:- RED commit: `a5a90e4` — `test(03-02): add failing tests for secret redaction` (29 failing)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:60:- GREEN commit: `4fedd05` — `feat(03-02): implement secret redaction pure function` (29 passing)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:61:- REFACTOR: no changes required — patterns were correct after GREEN
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:68:- **Found during:** Task 2 GREEN — `password=hunter2` test still failed after initial implementation
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:84:No new network endpoints, auth paths, file access patterns, or schema changes introduced. `redactSecrets` is a pure function with no I/O — no new trust boundaries opened.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:88:None. `redactSecrets` is fully implemented and wired to no callers yet — callers arrive in later phases (orchestrator Phase 5, SSH executor Phase 4, approvals route Phase 6). The function is ready at the trust boundary.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:92:- [x] `backend/src/safety/redaction.ts` — exists
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:93:- [x] `backend/src/tests/safety-redaction.test.ts` — exists
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:94:- [x] Commit `a5a90e4` — RED test commit present
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:95:- [x] Commit `4fedd05` — GREEN implementation commit present
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-02-SUMMARY.md:98:- [x] TypeScript clean (`npx tsc --noEmit` — no errors)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:21:    - "audit_events has no delete or update method — append-only enforced structurally"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:46:      provides: "Database initialisation — SQLite or JSONL, exposes getDb()"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:88:Implement the durable run store — the append-only audit log + run lifecycle CRUD that every later
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:90:reads for rubric B. No HTTP routes, no agent calls — pure data layer.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:123:    - backend/package.json (confirm better-sqlite3 + @types/better-sqlite3 already present; ulid is missing; also confirms npm is the active package manager — package-lock.json is present, so npm install is correct for this project; the CLAUDE.md Bun default does not apply here)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:124:    - docs/ARCHITECTURE.md §6 (the exact 6-table DDL — column names, types, nullability, comments)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:126:    - backend/src/safety/risk-levels.ts (RiskLevel enum values — command_approvals.risk_level must accept these strings)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:134:    RunSchema fields: `id` (string — `run_<ulid>`), `ticket_id` (number), `customer_system_id` (string), `status` (string), `current_phase` (string), `started_at` (string), `updated_at` (string), `completed_at` (string nullable), `error_message` (string nullable). Export `Run = z.infer<typeof RunSchema>`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:136:    AuditEventSchema fields: `id` (string — `ev_<ulid>`), `run_id` (string), `type` (string — equals SSE event type), `actor` (z.enum(['system','technician','agent','phoenix','ssh'])), `ts` (string ISO-8601), `payload_json` (string — already redacted). Export `AuditEvent`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:138:    CommandApprovalSchema fields: `id` (string — `appr_<ulid>`), `run_id` (string), `proposed_command` (string), `edited_command` (string nullable), `final_command` (string nullable), `purpose` (string), `expected_signal` (string), `risk_level` (z.nativeEnum(RiskLevel) — import from `../safety/risk-levels.js`), `safety_notes` (string), `status` (z.enum(['PENDING','APPROVED','REJECTED','EXECUTED','BLOCKED'])), `technician_reason` (string nullable), `created_at` (string), `decided_at` (string nullable), `executed_at` (string nullable). Export `CommandApproval`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:140:    CommandResultSchema fields: `id` (string — `res_<ulid>`), `run_id` (string), `approval_id` (string), `command` (string), `exit_code` (number), `stdout_redacted` (string), `stderr_redacted` (string), `duration_ms` (number), `timed_out` (z.number().int() — 0/1 SQLite boolean), `created_at` (string). Export `CommandResult`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:142:    ObservationSchema fields: `id` (string — `obs_<ulid>`), `run_id` (string), `source` (z.enum(['ssh','phoenix','agent','technician'])), `content` (string — redacted), `created_at` (string). Export `Observation`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:144:    ActivityDraftSchema fields: `id` (string — `act_<ulid>`), `run_id` (string), `summary` (string), `root_cause` (string), `actions_taken` (string), `commands_summary` (string), `validation_result` (string), `submitted` (z.number().int() — 0/1), `created_at` (string), `submitted_at` (string nullable). Export `ActivityDraft`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:167:  <name>Task 2: Implement db.ts — SQLite + JSONL fallback init</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:171:    - docs/ARCHITECTURE.md §6 (all 6 CREATE TABLE DDL shapes — column names + types must match schema.ts)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:173:    - backend/src/env.ts (lazy getEnv() pattern — do NOT call getEnv() at module load; accept an optional dbPath param or read it lazily)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:174:    - backend/src/store/schema.ts (just written — import types to keep DDL column names in sync)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:181:    - `run(sql: string, params?: unknown[]): void` — for INSERT/UPDATE
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:182:    - `get<T>(sql: string, params?: unknown[]): T | undefined` — for single-row SELECT
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:183:    - `all<T>(sql: string, params?: unknown[]): T[]` — for multi-row SELECT
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:187:    1. On first call, attempt `await import('better-sqlite3')` (dynamic import so the module loads even when native bindings are absent at the module-load phase — detect failure in the catch, not at top-level).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:189:    3. On failure (native binding load error): activate JSONL fallback. Log `[store] SQLite unavailable — using JSONL fallback` once via `console.warn`. JSONL adapter:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:194:       - `mode: 'jsonl'` — the name is "JSONL" per the architecture doc (in a real impl the fallback would write `.jsonl` files; for the hackathon the in-memory map is sufficient and the name is preserved for compatibility).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:214:    - backend/src/store/db.ts (just implemented — getDb() signature and DbAdapter interface)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:218:    - backend/src/safety/risk-levels.ts (RiskLevel enum — CommandApproval.risk_level type)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:223:    Import `ulid` from `'ulid'` (no `.js` suffix — it is an npm package, not a local file). Import `getDb` from `'../store/db.js'`. Import types from `'../store/schema.js'`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:225:    runs.ts — export these functions (all synchronous, using `getDb()`):
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:227:    `createRun(ticketId: number, customerSystemId: string): Run` — generates `run_${ulid()}` as id, inserts into `runs` with `status: 'CREATED'`, `current_phase: 'CREATED'`, `started_at` and `updated_at` as `new Date().toISOString()`. Returns the created Run row.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:229:    `getRunById(id: string): Run | undefined` — SELECT by id, parse through RunSchema.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:231:    `updateRunPhase(id: string, phase: string): void` — UPDATE `current_phase` and `updated_at`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:233:    `updateRunStatus(id: string, status: string): void` — UPDATE `status` and `updated_at`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:235:    `markRunCompleted(id: string): void` — UPDATE `status = 'COMPLETED'`, `current_phase = 'COMPLETED'`, `completed_at = now`, `updated_at = now`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:237:    `markRunFailed(id: string, errorMessage: string): void` — UPDATE `status = 'FAILED'`, `error_message`, `updated_at = now`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:239:    `markRunAborted(id: string): void` — UPDATE `status = 'ABORTED'`, `updated_at = now`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:241:    audit.ts — export these functions:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:243:    `appendAuditEvent(runId: string, type: string, actor: AuditEvent['actor'], payload: unknown): AuditEvent` — generates `ev_${ulid()}`, stringifies payload via `JSON.stringify(payload)` (caller is responsible for passing already-redacted payload), inserts into `audit_events`. Returns the new row. This is the ONLY write path for audit_events — no update, no delete method exported.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:245:    `getAuditEvents(runId: string): AuditEvent[]` — SELECT all events for a run ordered by `ts ASC`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:247:    `createPendingApproval(runId: string, proposal: { proposedCommand: string; purpose: string; expectedSignal: string; riskLevel: string; safetyNotes: string }): CommandApproval` — generates `appr_${ulid()}`, inserts with `status = 'PENDING'`, `created_at = now`. Returns the row.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:249:    `updateApprovalStatus(id: string, update: { status: string; editedCommand?: string; finalCommand?: string; technicianReason?: string; decidedAt?: string; executedAt?: string }): void` — UPDATE the approval row. Used at approve/reject/execute/block transitions.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:251:    `appendCommandResult(runId: string, approvalId: string, result: { command: string; exitCode: number; stdoutRedacted: string; stderrRedacted: string; durationMs: number; timedOut: boolean }): CommandResult` — INSERT into `command_results` with id `res_${ulid()}`, `timed_out` stored as 0/1 integer.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:253:    `appendObservation(runId: string, source: Observation['source'], content: string): Observation` — INSERT into `observations` with id `obs_${ulid()}`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:255:    `saveActivityDraft(runId: string, fields: { summary: string; rootCause: string; actionsTaken: string; commandsSummary: string; validationResult: string }): ActivityDraft` — INSERT into `activity_drafts` with id `act_${ulid()}`, `submitted = 0`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:257:    `getActivityDraft(runId: string): ActivityDraft | undefined` — SELECT the most recent draft for a run.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:259:    Important: `appendAuditEvent` must NOT be called by `createRun` directly — the caller (Phase 5 orchestrator) is responsible for writing audit events after receiving the created run. In this phase, test the pairing manually in the verify step below: `createRun` + immediate `appendAuditEvent(..., 'run.started', 'system', {})` represents the required run.started event; no automatic coupling in the store itself (keeps the store layer simple and the orchestrator in control of event semantics).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:261:    Redact-before-audit contract: `appendAuditEvent` does not call `redactSecrets` internally — it trusts that the caller has already redacted the payload. To verify this contract is respected at the integration layer, the verify step below calls `redactSecrets` on a payload containing a secret, then passes the result to `appendAuditEvent`, and asserts the persisted `payload_json` contains `«redacted»` and not the raw secret.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:302:| store → SQLite file | DB file on disk; no auth — single-machine local tool, acceptable per ARCHITECTURE §10 |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:308:| T-03-09 | Tampering | audit_events delete path | mitigate | No delete/update method exported from audit.ts — enforced structurally by API absence, not a soft-delete column or convention |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-PLAN.md:323:All existing tests still pass (store code has no test file yet — covered in 03-04 integration with safety.test.ts).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:23:  - "JSONL fallback uses in-memory Map — sufficient for hackathon; mode field preserved for compatibility"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:24:  - "appendAuditEvent trusts caller to pre-redact payload — no internal redact call keeps store layer simple"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:25:  - "getDb() lazy singleton with dynamic import of better-sqlite3 — avoids top-level native-binding failure"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:26:  - "JSON-format redaction patterns added to redaction.ts — token=value patterns missed JSON key:value format"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:37:**One-liner:** SQLite-backed run store with append-only audit log, ULID-prefixed IDs across 6 tables, and JSONL in-memory fallback — the durable foundation the orchestrator and judges inspect directly.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:43:- `schema.ts` — Zod row schemas + inferred TS types for all 6 tables (`runs`, `audit_events`, `command_approvals`, `command_results`, `observations`, `activity_drafts`), all `.strict()`, mirroring ARCHITECTURE §6 column names exactly.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:44:- `db.ts` — `DbAdapter` interface (`run/get/all`) with lazy singleton init. Tries `better-sqlite3` via dynamic import; on native-binding failure activates an in-memory JSONL fallback and logs once. Runs all 6 `CREATE TABLE IF NOT EXISTS` statements with WAL mode enabled.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:45:- `runs.ts` — Run lifecycle CRUD: `createRun`, `getRunById`, `updateRunPhase`, `updateRunStatus`, `markRunCompleted`, `markRunFailed`, `markRunAborted`. All synchronous via `getDb()`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:46:- `audit.ts` — Append-only audit writes: `appendAuditEvent` is the sole write path for `audit_events` (no delete/update exported). Helpers: `getAuditEvents`, `createPendingApproval`, `updateApprovalStatus`, `appendCommandResult`, `appendObservation`, `saveActivityDraft`, `getActivityDraft`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:54:- TypeScript: `npx tsc --noEmit` — clean
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:62:- **Found during:** Task 3 verification — `secret redacted in audit: false`
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:63:- **Issue:** `redaction.ts` patterns matched shell `key=value` and env-var `KEY=VALUE` formats but not JSON `"key":"value"` format. The plan's verify step calls `redactSecrets(JSON.stringify(payload))` where payload has `{ token: 'supersecret-token' }` — the token survived redaction in JSON-serialised form.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:71:No new network endpoints, auth paths, or schema changes at trust boundaries beyond those specified in the plan's threat model. The `appendAuditEvent` no-delete/no-update structural enforcement is in place. The redaction fix (deviation above) strengthens T-03-10 coverage — JSON-encoded payloads are now also redacted before audit write.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:75:None — all exported functions are fully implemented and verified.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:84:- FOUND commit: 00c6ce9 (task 1 — schema + ulid)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:85:- FOUND commit: c0cb1af (task 2 — db.ts)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-03-SUMMARY.md:86:- FOUND commit: d14c337 (task 3 — runs.ts + audit.ts + redaction fix)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:33:      provides: "Full §9 test checklist as Vitest test suite — consolidated gate that imports from command-policy, classifier, and redaction"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:58:03-02 owns `safety-redaction.test.ts` (redaction RED tests). This plan owns `safety.test.ts` —
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:65:incident — this suite catches it.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:89:  <name>Task 1: RED — write failing §9 consolidated test suite</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:93:    - docs/SAFETY_POLICY.md §3 (full blocklist — every category, including TRUNCATE under db-destruction)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:94:    - docs/SAFETY_POLICY.md §6 (redaction — exact pattern list and replacement format)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:95:    - docs/SAFETY_POLICY.md §9 (test checklist — the required categories)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:100:    - backend/src/tests/safety.test.ts (current stub state — replace describe.skip with live test blocks)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:106:    BLOCKLIST PATTERNS — validateCommandAgainstPolicy(cmd).allowed === false AND riskLevel === HIGH_RISK_BLOCKED:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:143:    OBFUSCATION VARIANTS — all return HIGH_RISK_BLOCKED:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:149:    - `echo hi; rm -rf /etc` (chained with `;` — dangerous segment in chain) → blocked
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:151:    TARGETED VARIANTS — allowed, NOT HIGH_RISK_BLOCKED:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:156:    EDITED-COMMAND RECHECK (SAFE-05) — dangerous edit is blocked:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:159:    (This proves the same stateless validate function is the recheck gate — no separate API needed)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:161:    REDACTION — redactSecrets(input) strips secrets, keeps key context:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:169:    - Multi-line PEM block `-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----` → entire block replaced with `«redacted»` (requires dotall / `[\s\S]` matching — this is a hard-fail risk if missed)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:173:    ALLOWLIST / SAFE_READ_ONLY — classifyCommand returns SAFE_READ_ONLY:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:182:    DEFAULT / UNKNOWN COMMANDS — classifyCommand returns MEDIUM_RISK_CHANGE (never SAFE_READ_ONLY):
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:189:    1. `describe('blocklist — HIGH_RISK_BLOCKED')` — one `it` per blocklist category (rm, disk-wipe, block-device-write, shutdown-reboot, fork-bomb, broad-chmod-chown, disable-security, secret-exposure, hide-tracks, exfiltration, db-destruction including TRUNCATE, mass-kill). Assert both `allowed === false` and `riskLevel === RiskLevel.HIGH_RISK_BLOCKED`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:190:    2. `describe('obfuscation variants')` — one `it` per variant type (extra-spaces, quoted-path, env-var-wrapper, backtick-wrapper, quoted-command-name, chained-semicolon).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:191:    3. `describe('targeted variants — not blocked')` — assert `allowed === true` and riskLevel is LOW or MEDIUM.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:192:    4. `describe('edited-command recheck — SAFE-05')` — assert the same `validateCommandAgainstPolicy` blocks the dangerous edit.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:193:    5. `describe('redaction')` — one `it` per pattern type including a dedicated multi-line private key `it`. Use `expect(result).toContain('«redacted»')` and `expect(result).not.toContain(secretValue)`. Separate `it` for the 16 KB cap.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:194:    6. `describe('allowlist — SAFE_READ_ONLY')` — iterate allowlist commands, assert `classifyCommand(cmd) === RiskLevel.SAFE_READ_ONLY`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:195:    7. `describe('unknown commands — default MEDIUM')` — assert `classifyCommand(unknownCmd) === RiskLevel.MEDIUM_RISK_CHANGE`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:202:    At this point (Wave 2, after 03-01 through 03-03 complete), the implementations exist. The RED state here means this consolidated file starts as the stub (`describe.skip`) — write the full test body now and confirm the suite runs (not skipped). It should be GREEN immediately if 03-01/02 implemented correctly, but treat any failures as the RED state to fix before the GREEN commit. Commit: `test(03-04): add §9 consolidated safety test suite`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:213:  <name>Task 2: GREEN — all §9 cases pass</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:217:    - backend/src/tests/safety.test.ts (the consolidated test file from Task 1 — the RED failures define what to fix)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:218:    - backend/src/tests/safety-policy.test.ts (per-module unit tests from 03-01 — must remain green)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:219:    - backend/src/tests/safety-redaction.test.ts (per-module unit tests from 03-02 — must remain green)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:221:    - docs/SAFETY_POLICY.md §6 (multi-line private key block — requires dotall matching)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:229:    If chained commands (`echo hi; rm -rf /etc`) pass through: ensure the normalization/matching strategy handles chains. Two valid approaches — implement whichever is not yet in place:
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:230:    (a) Split the normalized command on unescaped `;`, `&&`, and `||`, then validate each segment independently — if ANY segment matches a blocklist rule, the whole command is HIGH_RISK_BLOCKED with `matchedRule: '<rule>-in-chain'`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:232:    Approach (a) is preferred because it catches cases like `safe-cmd && dangerous-cmd` without requiring every regex to be anchor-free. State the chosen approach in a brief inline comment above the normalization logic (one of the rare comments that earn their place — it's a non-obvious implementation choice).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:234:    If the multi-line private key block test fails: confirm `redaction.ts` uses `[\s\S]*?` (or the `s` dotall flag) in the `private-key-block` pattern. The pattern must be `/-----BEGIN[\s\S]*?PRIVATE KEY-----[\s\S]*?-----END[^-]*PRIVATE KEY-----/g`. A single-line `.` will silently miss multi-line PEM blocks — this is a hard-fail risk on the secret scan.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:247:  <name>Task 3: REFACTOR — deduplicate, tighten descriptions, confirm count</name>
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:251:    - backend/src/tests/safety.test.ts (the passing suite — look for duplicates with safety-policy.test.ts and safety-redaction.test.ts)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:255:    Review safety.test.ts for any duplicate assertions that are already covered identically in safety-policy.test.ts or safety-redaction.test.ts. Remove exact duplicates from safety.test.ts if they add no additional integration value — keep at least one representative per §9 category to maintain the gate. The goal is that safety.test.ts reads as the §9 checklist overview, while the per-module files are the exhaustive unit coverage.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:281:| T-03-15 | Information Disclosure | real secrets in test fixtures | mitigate | Test fixtures use fake values (e.g. `token=abc123xyz`, `password=supersecret`) — no real credentials in test file |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:300:- `describe.skip` is replaced — no test is skipped
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-PLAN.md:306:- Edited-command recheck test passes (SAFE-05 — same validate function used for both proposal and approval)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:30:Populated `safety.test.ts` with the full §9 test checklist from SAFETY_POLICY.md — a consolidated gate that imports from all three public safety modules (command-policy, classifier, redaction) and exercises them together as rubric-C evidence.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:36:1. `blocklist — HIGH_RISK_BLOCKED` — every category: rm-rf-system-paths, disk-wipe, block-device-write, shutdown-reboot, fork-bomb, broad-chmod-chown, disable-security, secret-exposure, hide-tracks, exfiltration, db-destruction (including TRUNCATE TABLE), mass-kill
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:37:2. `obfuscation variants` — extra-spaces, quoted-path, env-var-wrapper, backtick-wrapper, quoted-command-name, chained-semicolon
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:38:3. `targeted variants — not blocked` — chown/chmod on specific paths, systemctl restart
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:39:4. `edited-command recheck — SAFE-05` — same `validateCommandAgainstPolicy` function blocks dangerous edit
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:40:5. `redaction` — password=, token=, secret=, api_key=, api-key=, Authorization: Bearer, postgres:// connection string, multi-line PEM block, 16 KB cap, harmless passthrough
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:41:6. `allowlist — SAFE_READ_ONLY` — 7 typical diagnosis commands
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:42:7. `unknown commands — default MEDIUM` — 2 unknown commands confirm MEDIUM_RISK_CHANGE
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:51:- **Fix:** Updated regex to `\bchown\s+-[a-zA-Z]*R[a-zA-Z]*\s+\S+\s+(\/|\/etc|\/var|\/home|\/srv|\/usr|\/boot)` — allows an owner argument before the path.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:57:- **Issue:** The test case was placed inside `db-destruction` describe block — wrong category.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:75:safety.test.ts: 65 tests — all pass
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:76:safety-policy.test.ts: 48 tests — all pass (no regression)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:77:safety-redaction.test.ts: 29 tests — all pass (no regression)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-04-SUMMARY.md:86:No new network endpoints, auth paths, file access patterns, or schema changes introduced. Test file only — no production surface added.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:9:This phase delivers the deterministic safety layer (`backend/src/safety/`) and the durable run store (`backend/src/store/`) — the two foundations that must exist before any SSH command can execute. The safety layer classifies every command (blocklist → risk level), redacts every string before it leaves the trust boundary, and re-validates edited commands at approval time. The run store persists runs, approvals, command results, observations, and activity drafts in an append-only audit log (SQLite with JSONL fallback). No SSH execution, no HTTP routes, no agents — those are later phases. This phase is the rubric-C (safety & audit, 20 pts) core: the guardrails and audit trail the judges inspect directly.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:11:Governed verbatim by `docs/SAFETY_POLICY.md` (rules, blocklist, risk levels, redaction, audit record) and `docs/ARCHITECTURE.md` §6 (data model) — both LOCKED source of truth.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:18:- Normalize before matching: collapse whitespace, strip obfuscation quotes, conservatively resolve `$()`/backtick wrappers — if a wrapper cannot be safely resolved, BLOCK it (SAFETY_POLICY §3).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:19:- Blocklist is an array of labeled regex patterns (pattern + rule name + reason) so the audit log records WHICH rule blocked a command — judges inspect this directly.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:27:- Redaction is a pure function invoked at every boundary — audit write, UI return, and model feed — a single chokepoint reused everywhere.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:31:- JSONL fallback activates when better-sqlite3 fails to load/init (e.g. native build failure) — detect at init, log the active mode once.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:32:- Append-only enforced by API absence: the store exposes no delete/update path for `audit_events` — enforced structurally, not by convention or soft-delete column.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:40:- `backend/src/safety/risk-levels.ts` — `RiskLevel` enum already defined (`SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED`). Build on it; do not redefine.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:41:- `backend/src/env.ts` — `getEnv()`, `resolveClientMode()`, `isMockMode()` established in Phase 1. Lazy env parse pattern (no top-level side effects) — reuse for any store config.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:50:- Safety layer is consumed by the orchestrator (Phase 5) and approvals route (Phase 6) — keep the public API small: `validateCommandAgainstPolicy(command)`, `classifyCommand(command)`, `redactSecrets(string)`.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:51:- Store is consumed by the orchestrator and route handlers — expose run lifecycle CRUD + append-only audit writes + typed row reads.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:66:- SSH execution enforcement (non-interactive, timeout, output cap) — Phase 4 (`ssh/executor.ts`).
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:67:- Approval route wiring (422 + BLOCKED audit on dangerous edit over HTTP) — Phase 6; this phase provides the deterministic re-validation function the route will call.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-CONTEXT.md:68:- LLM safety second-opinion (BOOST-03) — v2; the deterministic layer is the guarantee.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:13:# Code Review Fix Report — Phase 03
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:20:regressions the fixes themselves introduced — each was fixed in turn, and a
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:27:| CR-01 | Blocklist bypass — long-form rm flags | Added `--recursive`/`--force` (both orders) and `--recursive`-alone rules for system/data paths in `command-policy.ts` |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:28:| CR-02 | Blocklist bypass — netcat exfiltration | Block all `nc`/`netcat`/`ncat` usage (not just `-e`); split command segments on single `\|` so `cat /etc/passwd \| nc …` is caught |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:35:| CR-09 | Audit mutability | SQLite `BEFORE UPDATE`/`BEFORE DELETE` triggers on `audit_events` (RAISE ABORT) + JSONL adapter guard rejecting `UPDATE`/`DELETE audit_events` — append-only now enforced, not convention |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:48:## Second Review Cycle — New Blockers from the Fixes
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:54:| CR-02b | Audit payload unredacted | `appendAuditEvent` wrote `JSON.stringify(payload)` straight to `audit_events.payload_json`. Now redacts via `redactSecrets` before write (`3636f74`) — closes the rubric-C hard-fail risk of secrets in the audit log. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:61:## Third Review Cycle — Incomplete COALESCE Fix
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW-FIX.md:64:on every comma — and `updateApprovalStatus` uses `COALESCE(?, col)` expressions whose
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:32:genuinely closed. Two are not — one in the same file that was already flagged (JSONL UPDATE), and
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:37:Prior cycle CR-01 (JSONL UPDATE wrong id) was **not fixed** — the fix was applied to the wrong
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:45:### CR-01: JSONL UPDATE fix introduced a COALESCE-split regression — approval updates silently corrupt data
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:72:| `final_command = COALESCE(?` | `final_command` ← `params[3]` | wrong — gets `params[1]` value |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:78:- Leave `decided_at` = undefined (undefined stored as null — approval timestamp lost)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:121:`"api_token"`, `"ssh_key"`, or `"bearer_token"` do not match — the prefix before the word
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-REVIEW.md:167:  bearer tokens, private key blocks, `password=`, `token=`, and JSON-encoded variants — all
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-UAT.md:26:expected: When better-sqlite3 binaries are unavailable, `console.warn '[store] SQLite unavailable — using JSONL fallback'` appears and run/audit operations continue correctly end-to-end.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:16:    expected: "When better-sqlite3 binaries are unavailable, console.warn '[store] SQLite unavailable — using JSONL fallback' appears and run/audit operations continue correctly"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:17:    why_human: "The fallback path requires deliberately breaking native bindings to exercise — cannot trigger programmatically in the normal test run"
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:20:# Phase 3: Safety Layer + Run Store — Verification Report
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:25:**Re-verification:** No — initial verification
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:33:| 1 | `safety.test.ts` is green — every blocklist pattern (including obfuscation variants) returns `HIGH_RISK_BLOCKED` | ✓ VERIFIED | 65 tests in safety.test.ts all pass; 253 total suite green; covers rm-rf, disk-wipe, block-device-write, shutdown-reboot, fork-bomb, broad-chmod-chown, disable-security, secret-exposure, hide-tracks, exfiltration, db-destruction (TRUNCATE TABLE), mass-kill, all obfuscation variants |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:34:| 2 | An edited command is re-validated at approval time; a dangerous edit is blocked with 422 + `BLOCKED` audit entry | ⬇ DEFERRED | The pure-function re-check (validateCommandAgainstPolicy, SAFE-05) is implemented and tested. The HTTP-level 422 + audit write requires approvals.ts route — which is a deliberate stub (`export {}`) wired in Phase 6. See deferred section. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:39:**Score:** 4/5 truths verified (SC-2 deferred to Phase 6 — not a gap)
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:47:| 1 | Edited command blocked with 422 + BLOCKED audit entry (HTTP route layer) | Phase 6 | Phase 6 SC-2: "Approve (with optional edit) → safety re-check → execute → observation recorded" — the approvals.ts route is a deliberate empty stub in Phase 3 |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:56:| `backend/src/safety/redaction.ts` | redactSecrets, REDACTION_CAP_BYTES, RedactionPattern | ✓ VERIFIED | All 3 exports present. 12 named patterns. 16384 cap. Pure function — no side effects. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:59:| `backend/src/store/runs.ts` | 7 run lifecycle functions | ✓ VERIFIED | createRun, getRunById, updateRunPhase, updateRunStatus, markRunCompleted, markRunFailed, markRunAborted — all exported. ULID `run_` prefix. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:85:| `audit.ts → appendAuditEvent` | payloadJson | `redactSecrets(JSON.stringify(payload))` | Yes — caller-supplied payload, redacted before write | ✓ FLOWING |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:86:| `runs.ts → createRun` | Run row | `db.get('SELECT * FROM runs WHERE id = ?')` after INSERT | Yes — reads back from SQLite/JSONL | ✓ FLOWING |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:87:| `audit.ts → getAuditEvents` | AuditEvent[] | `db.all('SELECT * FROM audit_events WHERE run_id = ?')` | Yes — queries actual table | ✓ FLOWING |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:102:Step 7c: SKIPPED — no probe-*.sh files declared in PLAN frontmatter and no `scripts/*/tests/probe-*.sh` found.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:112:| SAFE-05 | 03-01, 03-04 | Edited commands re-validated at approval time; dangerous edit blocked | ✓ SATISFIED | validateCommandAgainstPolicy is a pure stateless function — calling it on the edited command is structurally identical to proposal-time check; SAFE-05 test in safety.test.ts passes. HTTP 422 response is Phase 6 work (approvals.ts stub). |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:113:| SAFE-06 | 03-04 | Safety layer covered by tests — every blocklist pattern, obfuscation, recheck, redaction | ✓ SATISFIED | Three test suites: safety-policy.test.ts (48), safety-redaction.test.ts (29), safety.test.ts (65) — all green. Covers all §9 categories. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:120:| `backend/src/routes/approvals.ts` | 1-2 | `export {}` stub | ℹ Info | Deliberate — Phase 6 will implement. Not a Phase 3 deliverable. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:121:| `backend/src/tests/orchestrator.test.ts` | — | 0 tests (skipped) | ℹ Info | Deliberate — Phase 5 will implement orchestrator. |
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:130:**Expected:** Terminal output shows `✓ src/tests/safety.test.ts (65 tests)` with nested describe blocks for blocklist, obfuscation variants, targeted variants, edited-command recheck, redaction, allowlist, and unknown commands — all green.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:136:**Expected:** Console shows `[store] SQLite unavailable — using JSONL fallback` once on startup; a full run cycle (createRun → appendAuditEvent → getAuditEvents) succeeds without error.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:137:**Why human:** Requires deliberately breaking native bindings — cannot be triggered in the standard test environment; store-jsonl.test.ts exercises the adapter in isolation but not the `getDb()` fallback path end-to-end.
.planning/milestones/v1.0-phases/03-safety-layer-run-store/03-VERIFICATION.md:141:No gaps. All five Phase 3 success criteria are either fully verified or explicitly deferred to Phase 6 (the approval route HTTP layer). The deferred item has clear ownership in Phase 6 SC-2 and does not block Phase 3 goal achievement — the underlying pure-function safety re-check (SAFE-05) is implemented and tested.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:66:    - backend/src/ssh/types.ts (current stub — empty export {})
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:69:    - backend/src/safety/redaction.ts (REDACTION_CAP_BYTES = 16384 — output cap constant lives here, not in types)
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:89:    SshTarget — host: string, port: number, username: string, privateKeyPath: string.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:91:    CommandResult — exitCode: number, stdout: string, stderr: string, durationMs: number, timedOut: boolean. These are the EXACT five fields from ARCHITECTURE.md §3 line 157. Do not add, rename, or omit any field.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:93:    PreflightResult — sudoAvailable: boolean, lang: string, path: string. The sudoAvailable flag implements Safety Policy G7: when false, the orchestrator surfaces "sudo unavailable" to the agent instead of failing the run.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:95:    SshConnectionError — class extending Error. Constructor takes message: string and optional cause: unknown. Sets this.name = 'SSHConnectionError'. This typed error is thrown by client.ts on connect/auth failure and caught by the orchestrator for clean run-error surfacing.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:97:    SshExecutor — interface with two methods:
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:103:    No Zod schemas in types.ts — these are TypeScript interfaces only. The boundary validation for SSH results lives in the store layer (Phase 6).
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:107:    2. CommandResult structural: assign a complete object literal to a CommandResult variable and assert each field type via typeof checks — this proves the interface compiles with the exact 5-field shape
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:134:| SshTarget.privateKeyPath → file system | The key path is a string in memory; it must never be logged or echoed — the executor (not types) is responsible for file I/O, but the interface carries the field |
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:140:| T-04-01 | Information Disclosure | SshTarget.privateKeyPath | mitigate | Type carries only the path string, never the key bytes. Executor reads key at connect time; key content never stored on the type instance. Logging of SshTarget objects is forbidden — enforced by redaction in callers. |
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-PLAN.md:142:| T-04-SC | Tampering | npm install (no new installs this plan) | accept | No package-manager installs in this plan — types.ts is pure TypeScript interfaces. |
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:25:  - No Zod schemas in types.ts — pure TypeScript interfaces; boundary validation deferred to store layer (Phase 6)
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:27:  - SshTarget carries only the key path string, never key bytes — enforced at interface level
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:37:TypeScript interface-first contracts for the entire SSH layer — `CommandResult`, `PreflightResult`, `SshConnectionError`, `SshTarget`, and `SshExecutor` — committed before any implementation code so plans 04-02 through 04-05 have an unambiguous shared contract.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:43:- `SshTarget` — connection parameters (host, port, username, privateKeyPath)
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:44:- `CommandResult` — exactly 5 fields matching ARCHITECTURE.md §3: exitCode, stdout, stderr, durationMs, timedOut
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:45:- `PreflightResult` — sudoAvailable (Safety Policy G7 hook), lang, path
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:46:- `SshConnectionError` — class extending Error; `this.name = 'SSHConnectionError'`; optional typed `cause`
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:47:- `SshExecutor` — interface with `executeApprovedCommand(approvalId, command, target)` and `runPreflight(target)`
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:55:| RED | 701f103 | test(04-01): add failing tests — `SshConnectionError is not a constructor` confirmed failure |
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:56:| GREEN | 7690e83 | feat(04-01): implement types — both tests pass, tsc clean |
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:57:| REFACTOR | — | Not needed; contracts are minimal |
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:61:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/04-ssh-executor/04-01-SUMMARY.md:65:No new network endpoints, auth paths, or file access patterns introduced. `SshTarget.privateKeyPath` is a string field on an interface — key bytes never touch this type. Consistent with T-04-01 disposition (mitigate: path only, never bytes).
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:17:    - "Result shape has exactly the 5 fields from ARCHITECTURE.md §3 — no extras"
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:35:Output: `backend/src/tests/ssh-executor.test.ts` — tests for timeout, output cap, result shape, and anti-pattern A1 grep guard. No production files are created or modified in this plan.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:59:    Test group 1 — result shape:
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:65:    Test group 2 — output cap:
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:71:    Test group 3 — timeout:
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:75:    Test group 4 — bash -lc wrapping:
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:80:    Test group 5 — anti-pattern A1 guard (static analysis, no mock needed):
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:89:    For timeout test: the mock channel never emits 'exit' or 'close' within the timeout window —
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:94:    Tests only — executor.ts is not touched. After RED is confirmed (tests fail against the
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:103:  <name>Task 1: Write RED executor tests — shape, cap, timeout, bash-lc wrap, A1 guard</name>
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:107:    - backend/src/ssh/types.ts (CommandResult, SshTarget, SshExecutor — read after 04-01 runs)
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:108:    - backend/src/ssh/executor.ts (current stub — must still be empty export {} when tests are written)
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:128:      delayMs?: number) — emits stdout data, stderr data, exit event (or no exit for timeout sim),
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:144:    - result.exitCode is null or -1 (document whichever the implementation chooses — the test
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:152:    Test group "anti-pattern A1 — executeApprovedCommand not a model tool":
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:157:    - This test does NOT require the ssh2 mock — it is a static grep on source files.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:171:    - Suite FAILS (RED) when run against the empty executor.ts stub — at least one test fails with "is not a function" or import error
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:188:| test → executor.ts | Tests import from executor.ts; if the import succeeds unexpectedly (stub has partial impl), some tests may pass prematurely — RED verification must show at least one group failing |
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:197:| T-04-SC | Tampering | npm/pip/cargo installs | accept | No installs — test file only, all deps already in package.json |
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-PLAN.md:201:- vitest run ssh-executor.test.ts exits non-zero (RED — executor stub is empty)
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:20:  - timedOut assertion does not pin exitCode value — lets 04-03 choose null or sentinel without test churn
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:30:One-liner: Failing vitest suite that defines the exact behavioral contracts for the SSH executor — timeout, output cap, result shape, bash-lc wrapping, and A1 anti-pattern guard.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:34:`backend/src/tests/ssh-executor.test.ts` — 14 `it()` blocks across 5 describe groups. The suite runs RED (13 fail + 1 passes) against the empty `executor.ts` stub. Plan 04-03 will make it GREEN by implementing the real executor.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:42:| A1 guard | 1 | grep non-comment lines in `ai/tools/` for `executeApprovedCommand` — asserts empty |
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:51:The one passing test is the A1 grep guard — no implementation needed, just static analysis.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:65:- **Found during:** Task 1 (first run — all 14 tests failed including the A1 guard)
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:73:None — this plan creates tests only. No production code was added or modified.
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:81:- `backend/src/tests/ssh-executor.test.ts` — FOUND
.planning/milestones/v1.0-phases/04-ssh-executor/04-02-SUMMARY.md:82:- commit `173758d` — FOUND
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:20:    - "Executor returns RAW output — caller (orchestrator) applies redactSecrets, not executor"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:25:      provides: "createSshClient(target) — returns a connected ssh2 Client or throws SSHConnectionError"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:44:      via: "import { REDACTION_CAP_BYTES } — cap only, NOT redactSecrets"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:79:  <name>Task 1: Implement client.ts — ssh2 connection factory with 10s connect timeout</name>
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:83:    - backend/src/ssh/types.ts (SshTarget, SSHConnectionError — must import these)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:84:    - backend/src/env.ts (SSH_PRIVATE_KEY_PATH, SSH_USERNAME — how env vars are accessed)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:100:    './types.js'. Do NOT import getEnv() — the caller passes SshTarget which contains host/port/
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:106:    readyTimeout: 10_000 }). The privateKey is readFileSync(keyPath) — read the raw bytes.
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:108:    SSHConnectionError whose message names the host and port only — never the key path value,
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:111:    readFileSync throws if keyPath does not exist — let it throw; the orchestrator will catch and
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:114:    No retry logic — a failed connection is audited and surfaced by the orchestrator.
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:115:    No keepalive — stateless: connect, exec, close.
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:139:  <name>Task 2: Implement executor.ts — executeApprovedCommand, runPreflight, output cap, timeout kill</name>
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:143:    - backend/src/ssh/client.ts (just implemented — import createSshClient from here)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:145:    - backend/src/safety/redaction.ts (import REDACTION_CAP_BYTES — the cap constant; do NOT import redactSecrets here)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:146:    - backend/src/tests/ssh-executor.test.ts (the RED tests that must turn GREEN — read every assertion)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:157:    - Executor returns RAW strings — no call to redactSecrets anywhere in this file
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:159:    - sudo -n true failure sets sudoAvailable: false (NON-FATAL — not an error throw)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:171:    2. Call createSshClient(target, getEnv().SSH_PRIVATE_KEY_PATH) — may throw SSHConnectionError.
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:197:    so pass the raw command string — the wrapper is applied inside executeApprovedCommand):
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:198:    1. 'sudo -n true' — sudoAvailable = (exitCode === 0). NON-FATAL if exitCode !== 0.
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:199:    2. 'echo $LANG' — verify LANG=C is in effect (stdout.trim() === 'C').
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:200:    3. 'echo $PATH' — capture PATH value (stdout.trim()).
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:214:    caller. Document this with a single comment: // Raw output — caller applies redactSecrets
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:247:| executor → env.ts | SSH_PRIVATE_KEY_PATH read via getEnv(); never logged; key bytes read with readFileSync and passed directly to ssh2 — not stored in any variable that reaches a log |
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:255:| T-04-INJ | Tampering | bash -lc command injection | accept | The command string arrives post-safety-gate (two-gate per SAFETY_POLICY §8); executor does not concatenate untrusted variables into the wrapper — the single template literal uses the already-gated command string only |
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:257:| T-04-HANG | Denial of Service | Interactive prompt hang (sudo password) | mitigate | sudo -n flag enforced; never passes without -n; preflight failure is non-fatal (records sudoAvailable: false) — never blocks waiting for a TTY |
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:259:| T-04-SC | Tampering | npm/pip/cargo installs | accept | No new packages — ssh2 and @types/ssh2 already in package.json |
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-PLAN.md:272:1. 04-02 test suite exits 0 — all behavioral contracts satisfied
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:16:  - createSshClient(target, keyPath) — ssh2 Client with 10s readyTimeout, throws SSHConnectionError on failure
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:17:  - executeApprovedCommand(approvalId, command, target) — single-command executor with 30s kill, output cap, raw output
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:18:  - runPreflight(runId, target) — sudo/LANG/PATH capability check cached per runId
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:19:  - createSshExecutor() — factory implementing SshExecutor interface
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:28:    - "target.privateKeyPath on SshTarget carries the key path — no env.ts call at execution layer"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:37:  - "Use target.privateKeyPath from SshTarget instead of getEnv().SSH_PRIVATE_KEY_PATH — keeps executor testable without env setup"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:39:  - "Guard channel.destroy() with typeof check — test mock channel is a plain EventEmitter with no destroy method"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:43:  - "Executor never calls redactSecrets — single comment documents the raw-output contract referencing ARCHITECTURE.md §3"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:44:  - "preflightCache is module-level Map keyed by runId — one preflight per run, not per command"
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:55:**ssh2-backed single-command executor with 30s timeout kill, 16 KB output cap, bash -lc/LANG=C wrapping, and per-run preflight cache — 14/14 tests GREEN**
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:74:1. **Task 1: Implement client.ts** — `949ff48` (feat)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:75:2. **Task 2: Implement executor.ts** — `bc98e38` (feat)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:79:- `backend/src/ssh/client.ts` — ssh2 connection factory; 10s readyTimeout; SSHConnectionError on failure
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:80:- `backend/src/ssh/executor.ts` — executeApprovedCommand, runPreflight, createSshExecutor; raw-output contract
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:84:- `target.privateKeyPath` is used instead of `getEnv().SSH_PRIVATE_KEY_PATH` — the `SshTarget` interface already carries the key path, keeping the executor independent of env validation and testable without `PHOENIX_API_BASE_URL`
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:86:- `channel.destroy()` guarded with `typeof ch.destroy === 'function'` — the test mock's channel is a plain EventEmitter without this method
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:94:- **Issue:** Plan action text said to call `getEnv().SSH_PRIVATE_KEY_PATH`, but `SshTarget` already carries `privateKeyPath` and `getEnv()` calls `process.exit(1)` when `PHOENIX_API_BASE_URL` is unset — breaking all 13 tests
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:102:- **Issue:** Test mock's `makeSshChannel` schedules channel events (data/exit/close) via `process.nextTick` at channel construction time, before the exec-callback nextTick. Events fired before any listener was registered — all result-shape tests timed out
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:103:- **Fix:** In `runCommand`, temporarily replace `process.nextTick` to capture the two nextTick calls made during `conn.exec()`. Restore original `process.nextTick` in `finally`, then flush the queue in reverse order — exec callback fires first (listeners attach), then channel events fire. Matches production behaviour where network latency guarantees data arrives after listeners are registered
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:115:The test mock in `ssh-executor.test.ts` has an inherent timing inversion: `makeSshChannel` schedules channel events via `process.nextTick` at construction time, before the exec-callback nextTick. In production ssh2, network I/O guarantees data arrives after listeners attach. The queue-reversal in `runCommand` is a test-compatibility shim — production code is unaffected because real ssh2 channels deliver data asynchronously well after the exec callback fires.
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:124:- `createSshExecutor()` factory implements the `SshExecutor` interface — orchestrator can instantiate it directly
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:126:- SSH `.pem` key still not placed in `keys/` — hard blocker for real VM work (pre-existing, not introduced here)
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:134:- `backend/src/ssh/client.ts` — FOUND
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:135:- `backend/src/ssh/executor.ts` — FOUND
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:136:- `.planning/phases/04-ssh-executor/04-03-SUMMARY.md` — FOUND
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:137:- Commit `949ff48` (client.ts) — FOUND
.planning/milestones/v1.0-phases/04-ssh-executor/04-03-SUMMARY.md:138:- Commit `bc98e38` (executor.ts) — FOUND
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:62:  <name>MockSshExecutor — scripted SSH responses for offline demo and CI</name>
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:67:    1. Fixture lookup — exact command match:
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:71:    2. Fixture lookup — systemctl status:
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:94:    8. Practice loop coverage — fix cycle:
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:98:    9. Practice loop coverage — validation:
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:114:    MOCK_SSH_FIXTURES: Record&lt;string, CommandResult&gt; — a plain object (not a Map) keyed by
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:169:    export function createMockSshExecutor(): SshExecutor — returns new MockSshExecutor().
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:172:    Comment at top of file: // Mock SSH executor — no ssh2 dependency. Used for offline demo and CI.
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:182:| mock → orchestrator | Identical SshExecutor interface — orchestrator cannot distinguish mock from real at the type level |
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:190:| T-04M-SC | Tampering | npm/pip/cargo installs | accept | No new packages — mock uses only TypeScript and types already in place |
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-PLAN.md:203:3. createMockSshExecutor() returns a valid SshExecutor — orchestrator can substitute it for the real executor without any other code change
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:19:  - "Adapted executeApprovedCommand and runPreflight signatures to match actual types.ts (3-param with approvalId; runPreflight takes target not runId) — plan described older interface variant"
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:21:  - "PreflightResult.lang set to 'C' (string) matching actual interface — plan described langIsC: boolean which does not exist in types.ts"
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:31:TDD implementation of `MockSshExecutor` — scripted SSH responses covering the full diagnose→fix→validate practice loop for offline demo and CI.
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:41:| RED — test(04-04) | 1156206 | PASS |
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:42:| GREEN — feat(04-04) | 4a494c1 | PASS |
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:48:| 1 — RED | Write 14 failing tests in ssh-mock.test.ts | 1156206 |
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:49:| 2 — GREEN | Implement backend/src/ssh/mock.ts | 4a494c1 |
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:55:- `grep "import.*ssh2" backend/src/ssh/mock.ts`: empty — zero ssh2 dependency
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:56:- Full suite: 271 pass, 13 fail (all failures are pre-existing RED state from 04-02 executor stub — no regressions)
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:60:### Interface Reconciliation (Rule 1 — correctness)
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:62:**Found during:** Task 1 (RED) — reading actual `types.ts`
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:72:None — fixture data is fully synthetic (no real credentials, IPs are fictional). Anti-pattern A1 guard (T-04M-A1) confirmed passing: `ai/tools/ssh-tools.ts` is an empty stub with no import of `executeApprovedCommand`.
.planning/milestones/v1.0-phases/04-ssh-executor/04-04-SUMMARY.md:76:None — all exports are fully implemented with realistic fixture values.
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:48:createSshExecutor once and calls executeApprovedCommand through it — it never knows whether
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:73:  <name>Task 1: Implement ssh-tools.ts — proposeSshCommand tool + executeApprovedCommand + createSshExecutor factory</name>
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:75:    - backend/src/ai/tools/ssh-tools.ts (stub — replace entirely)
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:84:      purpose, expectedSignal, riskNotes, isReadOnly fields) and NO execute property — calling it
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:86:    - executeApprovedCommand is exported as a plain async function (not a tool) — takes
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:91:      "Backend-only — NOT a model tool (ARCHITECTURE.md anti-pattern A1). Never pass to tool()."
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:106:    createSshExecutor(): SshExecutor — returns createMockSshExecutor() if
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:151:    The test description should read: "anti-pattern A1 — executeApprovedCommand is never
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:154:    Do NOT import from ssh-tools.ts at runtime in this test — source-level analysis only,
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:174:| AI agent → proposeSshCommand | Agent provides command string as untrusted structured input; tool has no execute — proposal is recorded, not run |
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:182:| T-04W-A1 | Elevation of Privilege | executeApprovedCommand registered as model tool | mitigate | Task 2 guard test asserts it; test is permanent CI gate — red on violation |
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-PLAN.md:199:3. createSshExecutor() selects mock vs real via resolveClientMode — no hardcoded mode
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:17:  - createSshExecutor() factory — selects mock/real via resolveClientMode('ssh')
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:26:    - "proposeSshCommand uses tool() with parameters (not execute) — AI SDK v4 pattern for proposal-only tools"
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:27:    - "createSshExecutor() factory switches on resolveClientMode — consistent with Phoenix/LLM client mode pattern"
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:39:  - "AI SDK v4 tool() uses `parameters` field, not `inputSchema` — corrected from plan wording"
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:41:  - "createSshExecutor in ssh-tools.ts builds a plain object adapter wrapping the real functions — avoids re-exporting executor.ts's createSshExecutor and shadowing it"
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:44:  - "Proposal tools: tool({ description, parameters }) with NO execute — human approval gates all execution"
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:67:- Implemented `backend/src/ai/tools/ssh-tools.ts` — 38-line module closing the Phase 4 wiring loop
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:87:- AI SDK v4 `tool()` uses `parameters` not `inputSchema` — the plan used v5 terminology; corrected at implementation time
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:88:- The real SSH adapter in `createSshExecutor()` is a plain object satisfying `SshExecutor` rather than re-using `executor.ts`'s own `createSshExecutor` — avoids name collision and keeps the factory logic explicit
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:89:- Pre-existing A1 guards in `ssh-executor.test.ts` and `ssh-mock.test.ts` asserted zero imports of executor symbols in `ai/tools/` — now that `ssh-tools.ts` legitimately imports them, those guards were over-broad. Narrowed to the correct invariant: `tool(` never wraps `executeApprovedCommand`
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:105:- **Issue:** `ssh-executor.test.ts` and `ssh-mock.test.ts` A1 guards grepped for any reference to executor symbols in `ai/tools/` — this was correct when `ssh-tools.ts` was a stub but fails now that it legitimately imports `executeApprovedCommand` and `createMockSshExecutor` to build the factory
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:106:- **Fix:** Narrowed both guards to the correct A1 invariant: regex `tool\s*\([^)]*executeApprovedCommand` must not match — imports are allowed, wrapping in `tool()` is not
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:114:**Impact on plan:** Both fixes were necessary for correctness — one an API version mismatch, one a test guard that had become stale. No scope creep.
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:117:- Relative import paths from `ai/tools/` required `../../ssh/` prefix (not `../ssh/`) — caught immediately by `tsc`
.planning/milestones/v1.0-phases/04-ssh-executor/04-05-SUMMARY.md:124:- Phase 5 (orchestrator) can import `createSshExecutor` from `ai/tools/ssh-tools.ts` and call `executeApprovedCommand` through it — it never needs to know whether it's talking to a real VM or the mock
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:9:The backend can execute a single approved command on a remote VM safely — fresh connection, non-interactive single exec, connect+command timeout, output cap, captured exit code and duration — and a scripted SSH mock drives the full agent loop offline without a real VM. A per-run preflight confirms `sudo -n true`, `LANG=C`, and PATH via `bash -lc` before any command runs.
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:18:- Fresh connect per command, close after execution — stateless, matches the one-approval-one-execution gate
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:19:- `conn.exec(cmd)` single non-interactive exec, no PTY — prevents interactive hangs
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:21:- One in-flight command per run (serial) — the orchestrator already gates sequencing
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:39:- `sudo -n` failure is NON-FATAL — record a capability flag and surface "sudo unavailable" so the agent can ask (Safety Policy G7), never hang on a password prompt
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:40:- Connect/auth failure throws a typed SSH connection error, audited, surfaced as a clean run error — never retried blindly
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:47:- `backend/src/safety/redaction.ts` — `redactSecrets()` and `REDACTION_CAP_BYTES` (16384). Caller applies redaction to executor output; the 16 KB constant doubles as the output cap.
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:48:- `backend/src/env.ts` — `resolveClientMode('ssh')` returns `'mock' | 'real'`; `SSH_PRIVATE_KEY_PATH` (default `/keys/your-key.pem`) and `SSH_USERNAME` (default `azureuser`) are already parsed and validated.
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:54:- Mock-vs-real selection via `resolveClientMode(service)` from `env.ts` — mocks mirror the real interface exactly (see `phoenix/mock.ts` precedent).
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:68:- Preflight must use `sudo -n` (non-interactive) and never hang on a password prompt — explicit Safety Policy requirement (G7, line 169–171).
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:75:- HCR-04 (SSH executor hardening + broader tool preflight beyond sudo/LANG/PATH) — v2, tracked in REQUIREMENTS.
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:76:- Connection pooling / persistent sessions — explicitly rejected for v1 in favor of stateless fresh-connect.
.planning/milestones/v1.0-phases/04-ssh-executor/04-CONTEXT.md:77:- Configurable mock preflight failure path — deferred; mock preflight always succeeds for v1.
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:15:    evidence: "Phase 5 goal: 'The AI can diagnose a Linux service incident end-to-end — from ranked hypotheses through a fix proposal to a validated, persistence-checked resolution — under deterministic orchestrator control'. DIAG-06 is a full-loop requirement; Phase 4 delivers the SSH execution substrate only."
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:23:**Re-verification:** No — initial verification
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:31:| SC1 | Real VM: `uname -a` executes and returns captured output, exit code, and duration | ? UNCERTAIN | Code path is correct; live VM not available in this environment — see Human Verification |
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:34:| SC4 | Preflight step confirms `sudo -n true`, `LANG=C`, and PATH via `bash -lc` before any command runs | ✓ VERIFIED | `executor.ts` lines 129–149: `runPreflight` runs three `executeApprovedCommand` calls (`sudo -n true`, `echo $LANG`, `echo $PATH`) serially, each wrapped via `bash -lc` by the executor. Cache keyed by `runId`. Mock preflight always returns `sudoAvailable: true, lang: 'C', path: non-empty`. One noted deviation: `createSshExecutor()` in `executor.ts` adapts `runPreflight(runId, target)` to the interface signature `runPreflight(target)` by hard-coding `'default'` as the runId — this caps the real-executor preflight cache to one entry system-wide when called via the `SshExecutor` interface. Not a blocker for SC4 as written; Phase 5 orchestrator callers can call `runPreflight(runId, target)` directly. |
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:51:| `backend/src/ssh/client.ts` | `createSshClient(target, keyPath)` — connects with 10s timeout, throws SshConnectionError on failure | ✓ VERIFIED | `readyTimeout: 10_000` confirmed (line 29). Throws `SshConnectionError` on `'error'` event (lines 14–22). Logs `host:port` only — no key bytes or credentials in logs. |
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:73:Not applicable — this phase produces execution infrastructure (executor, mock, type contracts), not components that render dynamic data. Behavioral checks cover the data-flow concern.
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:96:| DIAG-06 | 04-01, 04-02, 04-03, 04-04, 04-05 | Generalising loop solves all 5 practice VMs cleanly, reboot-persistent, with zero safety flags | DEFERRED to Phase 5 | Phase 4 delivers the SSH execution layer (executor, mock, preflight, tools wiring) needed for the loop. The loop itself — orchestrator driving agents through diagnose→fix→validate — requires Phase 5. REQUIREMENTS.md traceability table marks DIAG-06 as Phase 4 Complete, but the requirement's full observable behavior (5 VMs, persistence check) cannot be confirmed until Phase 5 closes the agent loop. |
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:102:| `backend/src/ai/tools/ssh-tools.ts` | 5–6 | `executeReal` and `runPreflightReal` imported but never referenced directly — `createRealSshExecutor()` delegates to them internally | ℹ️ Info | No functional impact. `noUnusedLocals` is disabled in tsconfig (intentional skeleton setting). Dead imports; consider removing to reduce cognitive load. |
.planning/milestones/v1.0-phases/04-ssh-executor/04-VERIFICATION.md:117:No blocking gaps. All verifiable success criteria are confirmed in code and tests. SC1 (real VM) is routed to human verification — the implementation is correct and complete, but live connectivity cannot be tested without real credentials. SC4 has a minor wiring note (hard-coded `'default'` runId in the interface adapter) flagged as a warning for Phase 5 to consider.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:24:    - "All exported TS types are inferred from Zod schemas — no manual interface duplication"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:78:    - backend/src/store/schema.ts — current RunPhase (7 stale values to replace)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:79:    - backend/src/store/runs.ts — createRun hardcodes 'CREATED' (stays valid); updateRunPhase takes string (stays valid)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:80:    - docs/ARCHITECTURE.md §4 — authoritative 14-value phase list
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:105:    still in the new enum. No other change needed in runs.ts — updateRunPhase already accepts
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:109:    stub) — add a describe block 'RunPhase enum migration' with the behavior cases above using
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:133:    - .planning/phases/05-agent-loop-orchestrator/05-CONTEXT.md §Agent Structured-Output Schemas (D-XX decisions — authoritative)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:141:    - hypotheses is z.array(...).min(1) — empty array throws
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:150:    - parse({ status:'VERIFIED_FIXED', benefitCheck:'...', persistenceCheck: null, evidence:[] }) throws ZodError (VERIFIED_FIXED requires non-null persistenceCheck — superRefine)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:187:    from '../types.js' — never re-declare it.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-PLAN.md:224:| T-05-02 | Information Disclosure | ValidationResult.benefitCheck | mitigate | benefitCheck/persistenceCheck content passes through redactSecrets before being written to observations or audit — enforced in orchestrator (Plan 05) |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:20:    - Zod schema-first — inferred TS types, never manual interface duplication
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:31:  - "All TS types inferred via z.infer<> — no manual interface duplication"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:41:RunPhase enum migrated to all 14 ARCHITECTURE §4 states, and three structured-output Zod schemas (DiagnosticProposal, FixProposal, ValidationResult) defined and unit-tested — locking the contracts every downstream agent and orchestrator reducer compiles against.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:53:### Task 1 — RunPhase Enum Migration
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:59:`RunStatus` is unchanged. `runs.ts` required no changes — `createRun` hardcodes `'CREATED'` (still valid) and `updateRunPhase` already accepts `string`.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:61:### Task 2 — Agent Structured-Output Zod Schemas
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:65:- **DiagnosticProposalSchema** — `hypotheses[].confidence` uses `z.number().min(0).max(1)`; `hypotheses` is `.min(1)`; plus `command`, `purpose`, `expectedSignal`, `riskNotes`, `isReadOnly`.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:66:- **FixProposalSchema** — `rootCause`, `command`, `rationale`, `rollbackCommand`, `isReversible`, `persistenceNote`.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:67:- **ValidationResultSchema** — status enum `VERIFIED_FIXED | LIKELY_FIXED | NOT_FIXED`; `persistenceCheck: z.string().nullable()`; `superRefine` enforces `VERIFIED_FIXED` requires non-null `persistenceCheck`.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:73:- Full suite: 308 tests across 15 files — all GREEN, zero regressions
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:77:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:91:- `backend/src/ai/types.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:92:- `backend/src/store/schema.ts` — FOUND (LOADED_CONTEXT + 13 other phases present)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:93:- `backend/src/tests/orchestrator.test.ts` — FOUND (21 tests)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-01-SUMMARY.md:94:- Commits: 0b0ec5d, 5ad2cd3, af2ff23 — all present in git log
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:18:    - "prompts.ts exports one system prompt string per agent role — problem_analyzer, customer_system_analyzer, problem_solver, validator"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:23:      provides: "getModel() factory — real openai or mock LanguageModelV1"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:47:Purpose: Agents import getModel() and their prompt constant — no provider config or prompt text
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:49:Output: model.ts and prompts.ts — both are pure wiring/config with no business logic to TDD.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:69:  <name>Task 1: Implement model.ts — real openai provider + deterministic mock</name>
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:72:    - backend/src/env.ts — getEnv() returns LLM_MODEL, OPENAI_API_KEY; resolveClientMode('llm') returns 'mock' | 'real'
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:73:    - backend/src/ai/model.ts — current stub (export {})
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:74:    - docs/ARCHITECTURE.md §1 — "Vercel AI SDK v5" reference (actual installed version is ai@4.3.x; use generateObject API accordingly)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:75:    - backend/package.json — confirms ai@^4.3.16 and @ai-sdk/openai installed
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:83:    getModel(): LanguageModelV1 — checks resolveClientMode('llm'):
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:88:      agent output — agents use their own scripted mock responses injected at the agent call
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:96:    Do NOT wrap in a singleton cache — callers construct per-call to allow test isolation.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:112:  <name>Task 2: Implement prompts.ts — four role system prompts, no hardcoded incident data</name>
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:115:    - backend/src/ai/prompts.ts — current stub (export {})
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:116:    - docs/ARCHITECTURE.md §9 — role-specific prompt sketches and shared safety rules
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:117:    - docs/SAFETY_POLICY.md §1 — non-negotiable rules to bake into every prompt
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:118:    - .planning/phases/05-agent-loop-orchestrator/05-CONTEXT.md §Specific Ideas — validation honesty (never is-active), persistence graded
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:121:    Generalization test (DIAG-02 / SC2) — added to orchestrator.test.ts:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:139:    PROBLEM_ANALYZER_SYSTEM_PROMPT — scope to local Linux services (systemd, ports, disk,
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:145:    CUSTOMER_SYSTEM_ANALYZER_SYSTEM_PROMPT — read-only probes to establish OS, running services,
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:148:    PROBLEM_SOLVER_SYSTEM_PROMPT — output FixProposal: address root cause not symptom, minimal
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:152:    VALIDATOR_SYSTEM_PROMPT — output ValidationResult. Proof MUST be a customer-benefit test
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:159:    as user-turn content by the agent caller — not baked into the system prompt.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-PLAN.md:190:| T-05-04 | Tampering | prompts.ts — prompt injection | mitigate | Runtime context (ticket, observations) injected as user-turn content by agent caller; system prompt is a static module constant and cannot be modified by command output |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:21:  - "MOCK_MODEL declared as module-level const (not per-call) — safe because it is stateless and has no per-call state to isolate"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:22:  - "prompts.ts exports plain string consts; no template functions — runtime context (ticket, observations) is injected as user-turn content by agent callers, never baked into system prompts"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:32:Wire the AI SDK provider behind a single `getModel()` factory switching between real `@ai-sdk/openai` and a deterministic mock, and define the four agent system prompt strings — enforced clean of incident-specific data by a TDD generalization gate.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:38:`getModel(): LanguageModelV1` — reads `resolveClientMode('llm')` from `env.ts`:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:51:| `PROBLEM_ANALYZER_SYSTEM_PROMPT` | Local Linux service diagnosis — ranked hypotheses + evidence, one read-only diagnostic command |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:75:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:80:- `a99d24c` feat(05-02): implement getModel() factory — real openai or deterministic mock
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:94:None — `model.ts` and `prompts.ts` are fully wired. The mock `doGenerate` returns `'{}'` which is intentionally minimal; agents inject their own scripted mock responses at the call site (Plan 03).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:99:- `backend/src/ai/model.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:100:- `backend/src/ai/prompts.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-02-SUMMARY.md:101:- `backend/src/tests/orchestrator.test.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:28:    - "All four agents use generateObject with their Zod schema — never free-form text generation"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:55:Implement the four structured-output agent functions — problem_analyzer, customer_system_analyzer,
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:56:problem_solver, validator — each returning a typed, Zod-validated result via AI SDK generateObject.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:60:degrades gracefully — never to an unsafe default.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:108:    ValidationResultSchema (imported from ai/types.ts — schema shape tests run in Plan 05-01):
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:132:    without a real API key. Run vitest — all agent tests must FAIL (agent files still export {}).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:139:    3. Input type (plain object — ticket description string + observations string array)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:142:       wraps in try/catch — any throw (including timeout after 30s AbortSignal) → throw
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:144:    6. No retry logic in agent files — the orchestrator decides retry policy (per CONTEXT)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:167:    ValidationResultSchema: import from '../types.js' — do NOT re-declare. The canonical
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:217:- cd backend && npx vitest run src/tests/orchestrator.test.ts — agent schema + degradation + mock-output describe blocks all GREEN
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:218:- npx tsc --noEmit — no errors in agent files
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:219:- grep -rn 'generateText\b' backend/src/ai/agents/ — returns empty (agents use generateObject only)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-PLAN.md:220:- grep -rn 'executeApprovedCommand' backend/src/ai/agents/ — returns empty (A1 guard: agents never import the executor)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:22:    - "generateObject + Zod schema — structured output, never free-form"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:25:    - "AgentUnavailableError catch-all — any model throw degrades gracefully"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:35:  - "Optional model parameter on each runner function (model?: LanguageModelV1) enables direct injection in tests without vi.mock — avoids module-mock complexity"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:36:  - "AgentUnavailableError declared in problem-analyzer.ts and re-exported from each agent — single source of truth, no shared errors module needed at this stage"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:37:  - "ValidationResultSchema imported from ai/types.ts in validator.ts — preserves superRefine VERIFIED_FIXED constraint; re-declaring would lose it"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:39:  - "30s timeout via Promise.race — no AbortSignal complexity needed; any rejection (timeout or model error) lands in the catch block → AgentUnavailableError"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:49:Four AI agent runner functions implemented with Zod-validated structured output via `generateObject` — problem_analyzer, customer_system_analyzer, problem_solver, validator — each degrading to `AgentUnavailableError` on any model failure.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:55:`runProblemAnalyzer(input, model?)` — calls `generateObject` with `DiagnosticProposalSchema` (imported from `ai/types.ts`), wraps in `Promise.race` with 30s timeout, catches any throw and re-throws as `AgentUnavailableError`.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:58:- `runProblemAnalyzer` — async runner
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:59:- `AgentUnavailableError` — error class (name: 'AgentUnavailableError')
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:60:- `MOCK_DIAGNOSTIC_PROPOSAL` — valid fixture for orchestrator integration tests
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:66:`runCustomerSystemAnalyzer(input, model?)` — calls `generateObject` with `CustomerSystemContextSchema` (declared here: `{ summary: z.string().min(1) }`), same timeout + degradation pattern.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:70:- `CustomerSystemContextSchema` — the only schema not in types.ts (scoped to this agent)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:76:`runProblemSolver(input, model?)` — calls `generateObject` with `FixProposalSchema` (from types.ts).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:85:`runValidator(input, model?)` — calls `generateObject` with `ValidationResultSchema` (imported from types.ts, preserving the `.superRefine()` VERIFIED_FIXED constraint).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:89:- `MOCK_VALIDATION_RESULT_LIKELY` — fixture with `status: 'LIKELY_FIXED'`
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:128:The plan's implementation spec shows `generateObject({ model: getModel(), ... })` as the call pattern but the degradation tests pass a custom `LanguageModelV1` as a second argument. To satisfy this without `vi.mock`, each runner accepts `model?: LanguageModelV1` and falls back to `getModel()` when omitted. This is a correctness requirement for the test suite — not an architectural addition.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:132:T-05-06 (mitigated): Observations injected as `JSON.stringify(...)` user-turn content; system prompts are static string constants from `prompts.ts` — no runtime content merges into the system prompt.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:138:None — all four agent functions are fully wired. The `MOCK_*` fixtures are intentional exports for use by the orchestrator integration test in Plan 05.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:143:- `backend/src/ai/agents/problem-analyzer.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:144:- `backend/src/ai/agents/customer-system-analyzer.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:145:- `backend/src/ai/agents/problem-solver.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:146:- `backend/src/ai/agents/validator.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-03-SUMMARY.md:147:- `backend/src/tests/orchestrator.test.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:18:    - "reduce(state, event) is a pure function — no async, no I/O, no imports of store or SSH"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:43:      via: "imports RunPhase enum values (TRIAGING, WAITING_FOR_APPROVAL, etc.) — no store I/O"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:50:Implement the pure orchestrator reducer — reduce(state, event) → {nextState, sideEffects} — that
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:149:    Run vitest — tests FAIL because orchestrator.ts exports {}.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:157:      phase: RunPhaseValue  (import from store/schema.ts — uses the new rich enum from Plan 01)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:164:    OrchestratorEvent — discriminated union keyed on 'type':
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:178:    SideEffect — discriminated union:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:201:    The reducer is pure — it only imports types and schema enum values.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:213:| event data → reducer | Events carry agent-proposed values (command strings, hypothesis text); reducer treats them as opaque data — no eval, no execution |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:226:- cd backend && npx vitest run src/tests/orchestrator.test.ts --reporter=verbose — describe 'reducer transitions' all 15 assertions GREEN
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:227:- grep -n 'import.*store/audit\|import.*store/runs\|import.*ssh/executor\|import.*run-event-bus' backend/src/ai/orchestrator.ts — empty (reducer is pure; no I/O imports)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-PLAN.md:228:- npx tsc --noEmit — no type errors
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:19:  - "reduce() imports only types and schema enum values — zero store/SSH/event-bus imports enforced by grep gate"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:21:  - "Terminal guard is the first check in reduce() — COMPLETED/FAILED/ABORTED return {nextState: state, sideEffects: []} unconditionally"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:38:- `reduce(state, event)` — pure function, no async, no imports from store/SSH/event-bus
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:39:- `OrchestratorState` — typed run snapshot (`runId`, `phase`, `status`, `stepCount`, `ticketId`, `customerSystemId`, `errorMessage?`)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:40:- `OrchestratorEvent` — discriminated union of 11 event types covering the full diagnostic loop
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:41:- `SideEffect` — discriminated union of 6 effect types; the async driver (Plan 05) executes these
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:42:- `ReducerResult` — `{nextState, sideEffects[]}`
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:43:- `MAX_STEPS = 12` — exported constant used by the cap guard
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:51:| RED (failing tests) | 8ca2dde | PASS — 15 failed, 35 passed |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:52:| GREEN (implementation) | 662973d | PASS — 50/50 passed |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:53:| REFACTOR | — | Not needed — code is readable as written |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:63:| OBSERVING | root_cause_found | PLANNING_FIX | — |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:64:| OBSERVING | more_diagnosis_needed | TRIAGING | — |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:66:| VALIDATING | validation_complete (VERIFIED/LIKELY_FIXED) | DRAFTING_ACTIVITY | — |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:67:| VALIDATING | validation_complete (NOT_FIXED) | TRIAGING | — |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:71:| COMPLETED/FAILED/ABORTED | any | (unchanged) | [] — terminal guard |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:83:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:95:- `backend/src/ai/orchestrator.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:96:- `backend/src/tests/orchestrator.test.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:97:- RED commit 8ca2dde — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-04-SUMMARY.md:98:- GREEN commit 662973d — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:25:    - "A blocked command triggers appendAuditEvent('command.blocked') and the driver loops back to TRIAGING to request an alternative — never reaching WAITING_FOR_APPROVAL"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:31:    - "Agent failure (mock throws) degrades to 'agent_unavailable' audit event; run stays in TRIAGING — never produces an unsafe default"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:59:Wire the async orchestrator driver — advance(runId, event?) — that performs side-effects from
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:99:    All tests in describe 'orchestrator driver — integration' block in orchestrator.test.ts.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:102:      - vi.mock('../ai/agents/problem-analyzer.js') — returns deterministic DiagnosticProposal
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:105:      - vi.mock('../ai/agents/problem-solver.js') — returns deterministic FixProposal keyed to
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:108:      - vi.mock('../ai/agents/validator.js') — returns ValidationResult with
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:110:      - Use makeJsonlAdapter() as the db — no SQLite needed
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:112:      - All SSH calls go through MockSshExecutor (from ssh/mock.ts) — no real SSH
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:114:    Test 1 — Happy path TRIAGING → WAITING_FOR_APPROVAL:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:122:    Test 2 — Blocked command loops back to TRIAGING:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:124:      (e.g. 'cat /etc/shadow' — matches secret-exposure blocklist rule).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:130:    Test 3 — Rejection returns to TRIAGING:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:136:    Test 4 — Approval triggers execution and OBSERVING:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:146:    Test 5 — Max-steps cap:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:148:      into the run's meta observation store — no need to call advance() 12 times.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:154:    Test 6 — Agent failure degrades gracefully:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:160:      Expect: advance() resolves (does not throw) — caller gets degraded state
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:162:    Test 7 — Generalisation: agent prompt contains no hardcoded strings (DIAG-02):
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:166:      (These are fixture values from mock SSH — agent prompts must be generic.)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:170:    RED phase: Add describe 'orchestrator driver — integration' block to orchestrator.test.ts.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:171:    Import advance, createInitialState from orchestrator.ts. Run vitest — FAIL because advance()
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:210:    - emitEvent: call runEventBus.emit(runId, eventType, payload) — import from events/run-event-bus.ts
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:218:    createInitialState(run: Run): OrchestratorState — exported helper for Phase 6 driver bootstrap.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:220:    setStepCountForTest(runId: string, count: number, db: DbAdapter): void — exported test-only
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:249:| T-05-15 | Tampering | Agent output containing prompt-injection in purpose/hypothesis fields | mitigate | Fields treated as opaque strings — stored verbatim in audit log, never eval'd or executed; only command field passes the deterministic safety gate |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:255:- cd backend && npx vitest run src/tests/orchestrator.test.ts --reporter=verbose — all 7 integration tests GREEN (alongside 15 reducer tests from Plan 04)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:256:- grep -rn 'status-api\|vm-01\|localhost:8080\|EADDRINUSE\|ticket_123' backend/src/ai/agents/ backend/src/ai/prompts.ts — zero matches (generalisation check DIAG-02)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:257:- grep -rn 'executeApprovedCommand' backend/src/ai/orchestrator.ts | grep -v 'command_approved' — zero matches (A1 guard: execution only on explicit approval event)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:258:- npx tsc --noEmit — no type errors
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-PLAN.md:259:- npx vitest run --reporter=verbose — full suite green (no regressions from Phase 3/4 tests)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:25:  - "advance() uses setDb(db) to inject the test adapter rather than threading db through every store call — keeps store function signatures unchanged while enabling full isolation"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:26:  - "emitEvent side effect also writes to audit log so approval.required is queryable alongside other events — the SSE bus and audit log are complementary"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:27:  - "vi.spyOn used instead of vi.mock for integration block — preserves original module exports (MOCK_DIAGNOSTIC_PROPOSAL, MOCK_VALIDATION_RESULT_LIKELY) needed by pre-existing agent tests"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:28:  - "executeApprovedCommand gated exclusively inside command_approved handler — A1 anti-pattern guard upheld"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:30:  - "DiagnosticProposal/FixProposal discriminated by 'hypotheses' in proposal check in performSideEffects — avoids a shared interface just for purpose/expectedSignal"
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:40:`advance(runId, event?, db?)` wiring every prior Phase 5 artifact — reducer, agents, safety layer, store, SSH mock, event bus — into one async loop, with 7 integration tests covering happy path, blocked command, rejection, approval+execution, max-steps cap, agent failure degradation, and generalisation check.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:46:- `advance(runId, incomingEvent?, db?)` — async driver; calls `reduce()`, performs side effects, dispatches to agents for auto-advance phases
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:47:- `createInitialState(run)` — exported helper for Phase 6 route bootstrap
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:48:- `setStepCountForTest(runId, count, db)` — test-only helper to inject stepCount without 12 advance() calls
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:50:`backend/src/events/run-event-bus.ts` — implemented from stub:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:55:- `setDb(db)` — overrides the module-level adapter (enables test injection)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:56:- `resetDb()` — clears adapter back to undefined
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:61:advance(runId) — no event:
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:84:| RED (failing tests) | e217012 | PASS — 10 failed, 47 passed |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:85:| GREEN (implementation) | 06a7508 | PASS — 57/57 passed, tsc clean |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:86:| REFACTOR | — | Not needed |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:123:- **Found during:** Task 1 — tests need per-test JSONL isolation
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:132:- **Fix:** Replaced `vi.mock` with `vi.spyOn` inside `beforeEach`/`afterEach` in the integration describe block — restores originals after each test
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:139:- **Fix:** Replaced spy assertion with checking the approval row's `proposed_command` field — equivalent verification that the policy was applied (approval only exists if policy passed)
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:161:- `backend/src/ai/orchestrator.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:162:- `backend/src/tests/orchestrator.test.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:163:- `backend/src/events/run-event-bus.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:164:- `backend/src/store/db.ts` — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:165:- RED commit e217012 — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-05-SUMMARY.md:166:- GREEN commit 06a7508 — FOUND
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:9:This phase delivers the AI troubleshooting engine: the deterministic orchestrator state machine plus the structured-output agents (`problem_analyzer`, `customer_system_analyzer`, `problem_solver`, `validator`) that let the system diagnose a Linux-service incident end-to-end — from ranked hypotheses, through a human-gated diagnostic loop, to a minimal reversible fix and a persistence-checked validation — all under deterministic orchestrator control where the AI only ever proposes.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:20:- Adopt ARCHITECTURE.md §4 rich phase names as the locked spec — migrate the existing simplified `RunPhase` enum in `store/schema.ts` (`ANALYSIS/DIAGNOSIS/FIX/VALIDATION/REPORT`) to the full set: `CREATED, LOADED_CONTEXT, TRIAGING, WAITING_FOR_APPROVAL, EXECUTING_COMMAND, OBSERVING, PLANNING_FIX, VALIDATING, DRAFTING_ACTIVITY, WAITING_FOR_ACTIVITY_REVIEW, SUBMITTING_ACTIVITY, COMPLETED, FAILED, ABORTED`. The ROADMAP goal and the §4 state diagram are authoritative.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:21:- Orchestrator is a pure function `(state, event) → {nextState, sideEffects}` plus a thin async driver that performs the effects — honors the ARCHITECTURE "pure function of (currentState, event)" mandate and keeps transitions unit-testable.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:26:- `DiagnosticProposal`: `{ hypotheses: {cause, evidence, confidence}[], command, purpose, expectedSignal, riskNotes, isReadOnly }` — per ARCHITECTURE §8 plus the ranked-hypotheses-with-evidence rule (SC1).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:27:- `FixProposal`: `{ rootCause, command, rationale, rollbackCommand, isReversible, persistenceNote }` — captures minimal + reversible + captured rollback + reboot-persistence (SC4).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:28:- `ValidationResult`: `{ status: VERIFIED_FIXED | LIKELY_FIXED | NOT_FIXED, benefitCheck, persistenceCheck, evidence }` — proves customer benefit (never `is-active`) and checks persistence; single success → `LIKELY_FIXED`, repeated → `VERIFIED_FIXED` (SC5).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:51:- `store/runs.ts` — `createRun`, `getRunById`, `updateRunPhase`, `updateRunStatus`, `markRunCompleted/Failed/Aborted` already exist; orchestrator drives these.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:52:- `store/schema.ts` — `RunSchema`, `CommandApprovalSchema`, `CommandResultSchema`, `ObservationSchema`, `ActivityDraftSchema` defined. `RunPhase` enum needs migration to the rich §4 set.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:53:- `safety/command-policy.ts` — `validateCommandAgainstPolicy` (deterministic gate) from Phase 3.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:54:- `safety/classifier.ts`, `safety/risk-levels.ts` — risk classification; LLM may only raise, never lower.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:55:- `safety/redaction.ts` — `redactSecrets`, `REDACTION_CAP_BYTES`; run before any string reaches observations/audit/model.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:56:- `ssh/mock.ts` — `MockSshExecutor` + 11-command `MOCK_SSH_FIXTURES` (Phase 4) drives the offline loop.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:57:- `ai/tools/ssh-tools.ts` — `proposeSshCommand` (no execute), `createSshExecutor` factory (Phase 4).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:58:- `store/audit.ts` — append-only audit writer (Phase 3); every transition/side-effect audits.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:59:- `env.ts` — `resolveClientMode('llm')`, `getEnv()`; LLM mock switch.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:62:- Structured output only when the backend must act (`generateObject` + Zod) — never free-form.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:76:- Validation honesty (PRD G2): proof is the customer-benefit test, never `systemctl is-active`; for intermittent symptoms, repeat the test over an interval — a single green → `LIKELY_FIXED`, not `VERIFIED_FIXED`.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:77:- Prefer reboot-persistent fixes (enable the unit, fix persistent config) — persistence is graded (rubric B).
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:83:- HTTP run/approval routes + SSE streaming — Phase 6.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:84:- `activity_log_generator` (5 ERP fields from audit trail) — Phase 7.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-CONTEXT.md:85:- Real-LLM response replay fixtures, per-agent model config, configurable max-steps via env — not needed for v1.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-UAT.md:40:  advance() has no auto-dispatch handler for OBSERVING — Phase 6 HTTP routes
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:10:    why_human: "No LLM API key available in this environment; the mock generateObject returns '{}' which is rejected by Zod schemas — the full multi-phase chain cannot be driven by the built-in mock model without scripted per-agent responses. Only the isolated unit tests (which inject scripted models) and the integration tests (which vi.spyOn the runner functions) are executable offline."
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:12:    expected: "After executing a diagnostic command, the problem_analyzer in OBSERVING either emits root_cause_found (→ PLANNING_FIX) or more_diagnosis_needed (→ TRIAGING). The orchestrator does not have an auto-advance handler for OBSERVING — Phase 6 routes are expected to deliver that event via POST /next with an explicit event payload."
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:13:    why_human: "OBSERVING has no agentDispatch branch in advance() — the phase waits for an external event. This is by design (Phase 6 wires the HTTP event delivery), but needs a human to confirm the Phase 5 → Phase 6 handoff contract is correctly understood and documented."
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:18:**Phase Goal:** The AI can diagnose a Linux service incident end-to-end — from ranked hypotheses through a fix proposal to a validated, persistence-checked resolution — under deterministic orchestrator control
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:21:**Re-verification:** No — initial verification
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:33:| 5 | All exported TS types are inferred from Zod schemas — no manual interface duplication | VERIFIED | `ai/types.ts` lines 46–48: all three types via `z.infer<>`; `orchestrator.ts` imports `type` from `types.js`, not re-declared |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:37:| 9 | reduce(state, event) is a pure function — no async, no I/O, no imports of store or SSH | VERIFIED | `orchestrator.ts` line 81: `reduce()` is synchronous; all I/O imports (store, event-bus, ssh) are only used by `advance()` and `agentDispatch()`; `reduce()` imports only types and schema values |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:39:| 11 | advance(runId) drives happy path CREATED→WAITING_FOR_APPROVAL and all 7 integration scenarios pass | VERIFIED | 7 integration tests in describe 'orchestrator driver — integration' all green; happy path, blocked command, rejection, approval+SSH execution, max-steps cap, agent failure degradation, generalisation check |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:51:| `backend/src/ai/model.ts` | getModel() factory — real openai or mock LanguageModelV1 | VERIFIED | Fully implemented, not a stub; both paths present |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:65:| `ai/types.ts` | `ai/agents/validator.ts` | ValidationResultSchema imported (preserving superRefine) | VERIFIED | `validator.ts` line 5: `import { ValidationResultSchema } from '../types.js'` — not re-declared |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:77:| `advance()` TRIAGING path | `proposal` (DiagnosticProposal) | `runProblemAnalyzer()` → generateObject → Zod parse | Yes — in real mode; mock model returns '{}' which Zod rejects (by design, tests inject scripted mocks via vi.spyOn) | FLOWING (mock-gated) |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:78:| `advance()` command_approved path | `cmdResult` | `MockSshExecutor.executeApprovedCommand()` | Yes — MockSshExecutor returns MOCK_SSH_FIXTURES keyed to command strings | FLOWING |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:79:| `advance()` observation write | `appendObservation(... redactSecrets(stdout))` | SSH result → redactSecrets → appendObservation | Yes — redacted stdout written to observations table | FLOWING |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:80:| `advance()` audit writes | audit_events rows | appendAuditEvent calls in performSideEffects | Yes — queryable in integration tests via getAuditEvents() | FLOWING |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:96:No probe scripts declared in plans or present under `scripts/*/tests/`. Step skipped — not applicable for this phase.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:103:| DIAG-02 | 05-02, 05-05 | Agent prompts generalise — no branches keyed to ticket IDs, hostnames, or symptom strings | SATISFIED | 7 generalization tests green; grep returns 0 matches for all forbidden strings in prompts.ts and agents/ |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:108:Note: REQUIREMENTS.md marks DIAG-03 as "Pending" in the traceability table. The table entry appears to be stale — the implementation and its test suite fully satisfy the requirement as verified above. The roadmap's success criteria for Phase 5 are met.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:114:| `orchestrator.ts` | 383–396 | Dummy DiagnosticProposal with empty strings passed to reduce() for max-steps trigger | Info | Not a stub — the reducer short-circuits to WAITING_FOR_ACTIVITY_REVIEW before acting on the proposal fields. The empty values never reach a createPendingApproval or SSH call. Intentional design; no impact. |
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:127:**Why human:** No LLM API key is available in this environment. The mock `doGenerate` returns `'{}'` which Zod correctly rejects — the multi-phase chain cannot complete without scripted per-agent responses or a real LLM. The integration tests exercise this path via `vi.spyOn` with scripted mock return values, but real LLM structured-output conformance cannot be verified programmatically here.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:129:#### 2. OBSERVING phase — event delivery contract with Phase 6
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:133:**Expected:** Either (a) `agentDispatch` in `advance()` handles OBSERVING by calling an agent and emitting root_cause_found/more_diagnosis_needed, or (b) Phase 6 routes deliver this event externally. Currently `agentDispatch` has no OBSERVING case — it falls through to `default: return currentState`. This is intentional for Phase 5 scope but must be confirmed as the correct contract before Phase 6 is planned.
.planning/milestones/v1.0-phases/05-agent-loop-orchestrator/05-VERIFICATION.md:139:No gaps. All 13 must-have truths are verified. 344/344 tests pass. tsc clean. The two human verification items are design-boundary questions and a real-LLM conformance check — neither indicates missing or broken code.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:17:    - "POST /api/runs does NOT call advance() — the run is created at phase CREATED then transitioned to LOADED_CONTEXT synchronously; the 201 response reflects that stored phase"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:33:      via: "advance(runId, event?, db?) call — only from /next and /abort, NOT from POST /"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:46:Implement and test the four core run lifecycle routes: create, get, advance (next), and abort. These routes are thin wrappers over the existing advance() orchestrator — no state transition logic belongs here.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:48:IMPORTANT — POST / contract (per D-02 / PRD §9): POST /api/runs must NOT call advance(). The correct sequence is: createRun() (phase=CREATED) → transition run to LOADED_CONTEXT synchronously (either via a single advance step that stops at LOADED_CONTEXT, or by storing LOADED_CONTEXT directly) → return 201 with status: "LOADED_CONTEXT". The browser then drives the run forward by calling POST /api/runs/:runId/next. Calling advance() from POST / and letting it recurse all the way to WAITING_FOR_APPROVAL would violate the PRD §9 201-response contract.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:79:    - status in the 201 response is ALWAYS the string "LOADED_CONTEXT" — not the raw DB phase value if different
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:89:    - Advances orchestrator via advance(runId) — no body required
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:103:  Key test case: POST /api/runs returns 201 with status exactly "LOADED_CONTEXT" — assert the response body status === "LOADED_CONTEXT" and assert advance() was NOT called during the POST / handler. Tests should fail because runs.ts exports only `export {}`.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:114:  - Fetch ticket via client.getTicket(ticketId) and customerSystem via client.getCustomerSystem(ticketId) — wrap in try/catch mapping PhoenixNotFoundError → 404, PhoenixAuthError → 502, PhoenixNetworkError → 502
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:115:  - customerSystemId = `${customerSystem.system.ip}:${customerSystem.system.port}` (colon-separated, NO protocol prefix — advance() splits on ':' at orchestrator.ts:576; including a protocol prefix would corrupt the split)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:116:  - createRun(ticketId, customerSystemId) — stores run with phase CREATED
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:124:  - Query pending approval: getDb().get('SELECT * FROM command_approvals WHERE run_id = ? AND status = ?', [runId, 'PENDING']) — parse with CommandApprovalSchema or return null
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:130:  - state = await advance(runId) — no event
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:150:| HTTP body → POST /api/runs | ticketId is untrusted — validated with Zod before any store write |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:151:| Route → orchestrator | runId from URL path — looked up with getRunById before advance(); unknown ID → 404, never passed to advance() blindly |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:160:| T-06-04 | Spoofing | SSRF via ticketId → Phoenix client | mitigate | Phoenix client is a typed wrapper with a fixed base URL from env.ts; ticketId is an integer — no URL injection surface |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:172:- POST /api/runs returns 201 with status exactly "LOADED_CONTEXT" — this string is the required response value per PRD §9
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:173:- POST /api/runs does NOT call advance() — verified by test asserting advance spy was not called during POST /
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:174:- customerSystemId stored in runs table is '{ip}:{port}' — verified by a test asserting the DB row value matches that colon-separated format (no protocol prefix)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:185:| runsRouter | backend/src/routes/runs.ts | Hono router — POST /, GET /:runId, POST /:runId/next, POST /:runId/abort |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-PLAN.md:187:| getPhoenixClient() | backend/src/routes/runs.ts | Internal helper — resolveClientMode('phoenix') → MockPhoenixClient or PhoenixClient |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:33:  - "POST / calls updateRunPhase(id, LOADED_CONTEXT) directly instead of advance() — advance() auto-recurses CREATED→LOADED_CONTEXT→TRIAGING→LLM agent, violating the 201-response contract"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:34:  - "getPendingApproval uses db.all() filtered in code, not a compound WHERE run_id=? AND status=? query — the JSONL adapter get() only handles single-column WHERE clauses"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:35:  - "vi.clearAllMocks() replaces vi.restoreAllMocks() in afterEach — restoreAllMocks resets vi.fn() instances inside vi.mock() factories back to original implementations, breaking mocks for subsequent tests"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:45:TDD implementation of the four core run lifecycle routes — create, get, advance, abort — as thin Hono wrappers over the existing orchestrator. 13 contract tests, all green. No regressions in the full 357-test suite.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:51:- `POST /api/runs` — validates `{ ticketId }` with Zod, fetches ticket + customer system from Phoenix (mock in tests), creates a run, transitions it to `LOADED_CONTEXT` synchronously, returns 201 with the full response shape from PRD §9
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:52:- `GET /api/runs/:runId` — returns run phase/status, ordered audit timeline, pending approval (null or CommandApproval), and activity draft
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:53:- `POST /api/runs/:runId/next` — calls `advance(runId)` and returns new state + pending approval
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:54:- `POST /api/runs/:runId/abort` — calls `advance(runId, { type: 'abort' })` and returns final state
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:63:- **Found during:** GREEN phase — 6 of 13 tests failing after first test's afterEach
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:65:- **Fix:** Changed `vi.restoreAllMocks()` to `vi.clearAllMocks()` in `afterEach` — clears call history and return values but does not restore the mock factory's implementations. Matches the pattern used in `tickets.test.ts`.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:71:- RED gate commit: `553bd7c` — `test(06-01): add failing contract tests for run lifecycle routes` (12/13 failing)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:72:- GREEN gate commit: `817d1c8` — `feat(06-01): implement run lifecycle routes with contract tests` (13/13 passing)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:77:- `backend/src/routes/runs.ts` — exists, exports `runsRouter`
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:78:- `backend/src/tests/runs.test.ts` — exists, 13 tests passing
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:79:- `backend/src/app.ts` — mounts `runsRouter` at `/api/runs`
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:80:- Commit `553bd7c` — RED gate present
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-01-SUMMARY.md:81:- Commit `817d1c8` — GREEN gate present
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:41:Implement and test the two approval routes: approve (with optional edit + safety re-check) and reject (with required reason). These routes are thin wrappers over advance() — the safety re-check inside advance() on command_approved is the defence-in-depth gate; routes must not bypass it.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:92:    When blocked, advance() calls reduce(state, { type: 'command_blocked', ... }) which keeps phase = WAITING_FOR_APPROVAL (WAITING_FOR_APPROVAL has no command_blocked transition — it stays in WAITING_FOR_APPROVAL).
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:96:    Return approval.risk_level — the classified value already stored in the command_approvals row (parsed from the DB via CommandApprovalSchema). Do NOT hardcode any risk level string.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:128:  - result = getLatestResult(approvalId) — may be null if SSH mock didn't write
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:140:  app.route('/api/runs', runsRouter)  — runs.ts handles POST /, GET /:runId, POST /:runId/next, POST /:runId/abort
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:141:  app.route('/api/runs', approvalsRouter)  — approvals.ts handles POST /:runId/approvals/:approvalId/approve and POST /:runId/approvals/:approvalId/reject
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:154:| HTTP body → approve (editedCommand) | Technician-supplied command edit — untrusted input; advance() re-validates via validateCommandAgainstPolicy (T-05-13 defence-in-depth) |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:161:| T-06-05 | Tampering | editedCommand in approve body | mitigate | advance() calls validateCommandAgainstPolicy on finalCommand before SSH execution (T-05-13 in orchestrator.ts); route never bypasses this — it always passes finalCommand through advance() |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:163:| T-06-07 | Information Disclosure | 422 response on blocked command | mitigate | 422 returns only riskLevel (HIGH_RISK_BLOCKED) and error message — no raw command text; command is already in the audit log (redacted) |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:179:- safetyRecheck.riskLevel in 200 response equals approval.risk_level from the DB row — not a hardcoded string
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:187:| approvalsRouter | backend/src/routes/approvals.ts | Hono router — POST /:runId/approvals/:approvalId/approve and POST /:runId/approvals/:approvalId/reject |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-PLAN.md:190:| getApproval() | backend/src/routes/approvals.ts | Internal helper — CommandApproval lookup by id |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:20:  - "approvalsRouter uses full path segments (/:runId/approvals/:approvalId/approve) and is mounted separately at /api/runs in app.ts — matches ARCHITECTURE.md pattern and avoids nested router complexity"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:21:  - "422 blocked detection: if state.phase === WAITING_FOR_APPROVAL after a command_approved advance() call, the safety gate fired — no need to inspect audit events separately"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:22:  - "safetyRecheck.riskLevel reads approval.risk_level from the DB row, never hardcoded — test verifies this with LOW_RISK_CHANGE fixture"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:36:`approvalsRouter` in `backend/src/routes/approvals.ts` — a Hono router mounted at `/api/runs` in `app.ts` (alongside `runsRouter`) handling:
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:38:- `POST /api/runs/:runId/approvals/:approvalId/approve` — looks up run + approval, checks PENDING status, calls `advance(runId, { type: 'command_approved', approvalId, finalCommand })`, detects blocked command via phase === WAITING_FOR_APPROVAL → 422, otherwise returns 200 with `safetyRecheck.riskLevel` from the stored DB row
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:39:- `POST /api/runs/:runId/approvals/:approvalId/reject` — Zod enforces non-empty reason, checks PENDING status, calls `advance(runId, { type: 'command_rejected', reason })`, returns 200
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:45:- RED commit: `b4697f3` — test(06-02): 15 failing tests
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:46:- GREEN commit: `0612db3` — feat(06-02): implementation passes all 15
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:53:| 0612db3 | feat(06-02): implement approvalsRouter — approve and reject routes |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:57:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:63:| T-06-05: editedCommand tampering | advance() re-validates via validateCommandAgainstPolicy; 422 if blocked | Yes — test case mocks advance returning WAITING_FOR_APPROVAL |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:64:| T-06-06: duplicate/stale approval replay | Route checks approval.status === 'PENDING' before calling advance(); 409 otherwise | Yes — test verifies APPROVED and EXECUTED both return 409 |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:65:| T-06-07: 422 information disclosure | 422 returns only riskLevel + error string, no raw command | Yes — response shape verified in test |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-02-SUMMARY.md:66:| T-06-08: empty-reason reject | z.string().min(1) → 400 before any state change | Yes — test verifies empty string and missing reason both return 400 |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:26:      provides: "createSseStream helper — subscribes to runEventBus and pipes events to Hono streamSSE"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:29:      provides: "eventsRouter Hono router — GET /api/runs/:runId/events"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:32:      provides: "Audit↔runEventBus symmetry test — verifies PRD §9 SSE events appear in both audit log and event bus"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:47:Also verifies API-03 success criterion 4: "Every meaningful side-effect emits and audits the same event (no silent state changes)." A dedicated symmetry test drives a run to WAITING_FOR_APPROVAL and asserts that the PRD §9 events (run.started, approval.required, command.completed) appear in BOTH getAuditEvents() AND were emitted on runEventBus — proving the orchestrator's emit→appendAuditEvent pairing holds for the live event set.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:49:Purpose: SSE wiring is glue — Hono streamSSE + EventEmitter subscription. The symmetry test is the behavioural contract that prevents silent state changes from going undetected.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:76:  - backend/src/events/run-event-bus.ts — RunEventBus.on/off/emit signatures; the single exported runEventBus singleton
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:77:  - backend/src/store/audit.ts — getAuditEvents(runId): AuditEvent[] — ordered by ts ASC; fields: id, run_id, type, actor, ts, payload_json
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:78:  - backend/src/store/schema.ts — AuditEvent type shape
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:94:  2. Register live listener: define listener(payload: unknown) that calls stream.writeSSE({ data: JSON.stringify({ type: eventType, runId, ts: new Date().toISOString(), payload }), event: eventType, id: ulid() }). The listener must be registered for every SSE event type that the orchestrator emits. Rather than subscribing per-event-type, subscribe to '*' wildcard — BUT runEventBus does not support wildcards. Instead, subscribe to each event type from the PRD §9 list: 'run.started', 'agent.thought_summary', 'command.proposed', 'command.blocked', 'approval.required', 'command.executing', 'command.completed', 'observation.added', 'fix.proposed', 'validation.completed', 'activity.drafted', 'activity.submitted', 'run.completed', 'run.failed'. For each eventType, register runEventBus.on(runId, eventType, listener) where listener closes over eventType.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:96:  Note: Each listener write is async but the EventEmitter fires synchronously. Use void stream.writeSSE(...) inside the listener (fire-and-forget — the SSE stream buffers internally).
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:106:  No fenced code in action — implement using the identifiers and patterns above.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:123:  - backend/src/events/sse.ts — createSseStream signature (written in Task 1)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:124:  - backend/src/store/runs.ts — getRunById(id): Run | undefined
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:125:  - backend/src/routes/tickets.ts — Hono router pattern: new Hono(); router.get('/', handler); c.req.param()
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:142:  The 404 check before opening the SSE stream is important — streamSSE sets Content-Type: text/event-stream immediately; returning JSON 404 must happen before that.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:161:  - backend/src/ai/orchestrator.ts — advance() signature; emitEvent call pattern at lines 344-348 (emit then appendAuditEvent); approval.required emitted at line 135; run.started emitted at LOADED_CONTEXT transition
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:162:  - backend/src/events/run-event-bus.ts — RunEventBus.on(runId, eventType, listener) signature; exported runEventBus singleton
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:163:  - backend/src/store/audit.ts — getAuditEvents(runId): AuditEvent[]; AuditEvent.type field
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:164:  - backend/src/tests/orchestrator.test.ts — makeJsonlAdapter() + setDb() pattern; vi.mock('../env.js') pattern; how to drive advance() to WAITING_FOR_APPROVAL in test
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:168:  Create backend/src/tests/sse-audit-symmetry.test.ts. This test proves that for a run driven to WAITING_FOR_APPROVAL, the PRD §9 SSE-relevant events — run.started, approval.required, and command.completed — appear in BOTH the audit log (via getAuditEvents) AND were emitted on runEventBus.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:184:  5. Assert the following for each of the three event types (run.started, approval.required, command.completed — emit whichever subset the orchestrator actually fires on the path to WAITING_FOR_APPROVAL; at minimum run.started and approval.required must be present):
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:185:     - auditTypes.has(eventType) — the event appears in the audit log
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:186:     - emittedEvents.get(eventType)?.length >= 1 — the listener was called at least once
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:190:  If command.completed is not emitted on the WAITING_FOR_APPROVAL path (no command has been executed yet at that point), include a comment explaining why it is excluded from the assertion and assert only run.started and approval.required. Do not assert an event type that the orchestrator provably does not emit on that path — but document the reasoning.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:220:| T-06-09 | Information Disclosure | SSE backfill payload | mitigate | audit_events.payload_json is written via appendAuditEvent which calls redactSecrets before insertion; backfill reads already-redacted rows — no re-redaction needed |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:224:| T-06-SC | Tampering | npm/pip/cargo installs | mitigate | No new packages — uses existing hono, ulid, and internal modules |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:244:| createSseStream | backend/src/events/sse.ts | Core SSE helper — backfill + live subscription + keepalive + cleanup |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-PLAN.md:246:| eventsRouter | backend/src/routes/events.ts | Hono router — GET /:runId/events |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:9:    - "06-02 (approvalsRouter — parallel, no dependency)"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:31:  - "run.started is written via direct appendAuditEvent in agentDispatch, not via runEventBus.emit — symmetry test asserts it appears in audit log only; approval.required is the canonical bus event verified in both"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:55:- `npx tsc --noEmit` — passes clean after each task
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:56:- `npx vitest run tests/sse-audit-symmetry.test.ts` — 1/1 pass
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:57:- Full suite `npx vitest run` — 373/373 tests across 18 files pass
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:63:2. **SSE_EVENT_TYPES as exported const:** Both `events.ts` and tests import this array — single definition prevents drift between what the route subscribes to and what tests expect.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:69:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:73:T-06-09 (backfill payload): audit rows are already redacted at write time via `appendAuditEvent → redactSecrets`; backfill reads pre-redacted rows — no additional redaction needed. Confirmed.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:83:- `backend/src/events/sse.ts` — exists, exports `createSseStream` and `SSE_EVENT_TYPES` (14 types)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:84:- `backend/src/routes/events.ts` — exists, exports `eventsRouter`
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:85:- `backend/src/tests/sse-audit-symmetry.test.ts` — exists, 1 test passing
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:86:- `backend/src/app.ts` — eventsRouter mounted at `/api/runs`
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-03-SUMMARY.md:87:- Commits: 24dee81, b8e1ff8, 3634c80 — all present in git log
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:48:Mount the three new routers (runsRouter, approvalsRouter, eventsRouter) in backend/src/app.ts so all Phase 6 endpoints are reachable. This is a pure wiring task — no business logic.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:76:  - backend/src/app.ts — current mounts: app.route('/health', healthRouter); app.route('/api/tickets', ticketsRouter)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:77:  - backend/src/routes/runs.ts — exports runsRouter (Hono)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:78:  - backend/src/routes/approvals.ts — exports approvalsRouter (Hono)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:79:  - backend/src/routes/events.ts — exports eventsRouter (Hono)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:80:  - backend/src/tests/tickets.test.ts — import pattern: import { app } from '../app.js'; app.request(path)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:88:  All three import paths use the .js extension — this is the project convention (see existing imports in tickets.ts, orchestrator.ts). Do not use .ts extensions in import specifiers.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:120:| app.ts route ordering | Three routers at /api/runs — Hono resolves by path match; no security boundary, just wiring |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:127:| T-06-14 | Information Disclosure | app.onError leaking internals | mitigate | Existing onError in app.ts returns generic { error: 'internal server error' } — unchanged; never exposes stack traces or secret-bearing error text |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:137:- All import specifiers use .js extension (not .ts) — matches project convention
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-PLAN.md:139:- npx vitest run is green — all existing tests plus new route-contract tests pass
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:28:    - "Three Hono routers co-mounted at /api/runs prefix — Hono resolves by path specificity, no collisions"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:36:  - "No code changes required — all three routers were mounted as a side effect of plans 06-01 and 06-03; 06-04 verified the wiring and confirmed test suite green"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:51:**runsRouter, approvalsRouter, and eventsRouter already mounted at /api/runs by prior plans; 06-04 verified route ordering, ran tsc and 373-test suite — all green, no code changes needed**
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:66:- Confirmed `npx vitest run` passes: 18 test files, 373 tests, all green — including `runs.test.ts` and `approvals.test.ts` which exercise the mounted routes end-to-end via `app.request()`
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:70:No new task commit — the router mounting was completed as part of prior plan commits. SUMMARY and metadata committed below.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:76:- No files modified — `backend/src/app.ts` was already correct
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:80:None required — the acceptance criteria were satisfied before 06-04 executed. The decision to mount routers early (as a side effect of 06-01 and 06-03) was documented in those plans' summaries.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:84:### Prior-wave completion (not an error — documented per deviation protocol)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:90:- **Verification:** `npx tsc --noEmit` — zero errors; `npx vitest run` — 373/373 pass
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:95:**Total deviations:** 1 (prior-wave completion — no auto-fix needed)
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:96:**Impact on plan:** None — all acceptance criteria met, no scope creep, no regressions.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-04-SUMMARY.md:117:- Phase 7 (agent-loop orchestration) can begin immediately — all route contracts are wired and tested
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:9:Expose the full incident-run lifecycle over HTTP and stream run events to the browser live. This phase wires the existing deterministic orchestrator (`advance()` from Phase 5) into Hono routes — run create/get/next/abort, approve/reject with safety re-check + execution — and a per-run SSE stream fed by `runEventBus`. The orchestrator, safety layer, store, agents, and SSH executor already exist; this phase adds only the HTTP + SSE surface and request validation. No new business logic, no frontend, no activity generation (Phase 7).
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:19:- Validate every request body with a Zod schema via `safeParse`, returning 400 on failure — matches the established `routes/tickets.ts` pattern.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:21:- `GET /api/runs/:id` returns an aggregate view: the run row (phase/status), the latest pending approval, and the ordered audit timeline — one fetch the UI can render directly.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:33:- On connect, replay the run's prior audit events (backfill), then switch to live — a browser connecting mid-run sees history. Demo resilience over flaky Wi-Fi.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:43:- `advance(runId, event?, db?)` in `backend/src/ai/orchestrator.ts` — the single async driver; already handles approve→re-check→execute→observe, reject, abort, and auto-advance. Routes are thin wrappers.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:44:- `createInitialState(run)` and `createRun(ticketId, customerSystemId)` — run bootstrap.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:46:- `getAuditEvents(runId)` in `store/audit.ts` — ordered timeline for `GET` aggregate + SSE backfill.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:47:- `runEventBus` (`events/run-event-bus.ts`) — per-run EventEmitter with `emit/on/off/removeAllListeners`, already emitting `approval.required` from the orchestrator.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:48:- `validateCommandAgainstPolicy` — safety re-check (also already invoked inside `advance`).
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:54:- `app.onError` returns a generic 500 — never leak internal/secret-bearing error text.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:59:- `app.ts` currently mounts only `/health` and `/api/tickets` — add the new routers there.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:67:- Honor PRD §9 endpoint names and the run-phase state machine in `docs/ARCHITECTURE.md` exactly — no renaming.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:76:- Human-driven manual-command path (HCR-01) — v2.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:77:- Agent→human question channel (`agent.question` event + answer endpoint, HCR-05) — v2.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-CONTEXT.md:78:- Plan-approval for read-only batches (HCR-03) — v2.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:10:    why_human: "streamSSE streaming behaviour cannot be tested with app.request() in Vitest — the SSE response body is a ReadableStream; verifying actual event delivery over a live HTTP/1.1 connection requires a real server and EventSource"
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:21:**Re-verification:** No — initial verification
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:44:| 14 | SSE stream: backfill, live events, keepalive, onAbort cleanup, 404 before stream open | VERIFIED | `sse.ts:26-72` implements full sequence — backfill loop, listener map for 14 event types, `onAbort` cleanup, 15s keepalive loop; `events.ts:7-12` checks `getRunById` before `createSseStream`; `SSE_EVENT_TYPES` exports all 14 PRD §9 names |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:70:| `backend/src/routes/runs.ts` | `backend/src/ai/orchestrator.ts` | `advance(runId)` — only from /next and /abort | VERIFIED | `advance` imported and called at lines 127, 143; NOT called from POST / handler |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:88:| `runs.ts` GET /:runId | `timeline` | `getAuditEvents(runId)` reads `audit_events` table | Yes — DB query, no static fallback | FLOWING |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:89:| `runs.ts` GET /:runId | `pendingApproval` | `getPendingApproval` calls `db.all(...)` filtered in code | Yes — queries `command_approvals` table | FLOWING |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:90:| `runs.ts` POST / | `ticket` / `customerSystem` | `client.getTicket()` / `client.getCustomerSystem()` from Phoenix (mock in tests) | Yes — Phoenix client returns real fixture data | FLOWING |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:91:| `approvals.ts` approve | `approval.risk_level` | `getApproval()` reads `command_approvals` table row | Yes — DB read, `safetyRecheck.riskLevel` comes from stored row not hardcode | FLOWING |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:92:| `sse.ts` | backfill `events` | `getAuditEvents(runId)` | Yes — real DB rows | FLOWING |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:98:Build and test infrastructure used in-process via `app.request()` — spot-checks run as part of the 373-test suite.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:126:Note: REQUIREMENTS.md traceability table and requirement checkboxes still show API-01 and API-03 as "Pending" / `[ ]`. This is a stale tracking artifact — REQUIREMENTS.md was not updated to mark them complete after Phase 6 executed. The code, tests, and SUMMARY documents are consistent with completion. No code gap.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:134:| None | — | — | — | — |
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:136:No TBD, FIXME, or XXX markers in any Phase 6 files. No placeholder return values or empty handlers. The comment at `runs.ts:67` (`// Split on ':' in advance() at orchestrator.ts:576 — no protocol prefix`) is a legitimate constraint note explaining a non-obvious coupling, not a debt marker.
.planning/milestones/v1.0-phases/06-run-api-approvals-sse/06-VERIFICATION.md:158:No gaps. All 15 must-haves are VERIFIED. Two human verification items remain for SSE live-stream behaviour — these require a running server and cannot be validated programmatically.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:50:Purpose: Satisfies ACT-01 — the agent produces all 5 graded fields (`summary`, `rootCause`, `actionsTaken`, `commandsSummary`, `validationResult`) from audit data only, with no invented facts and no secrets.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:82:  <name>Task 1: RED — failing tests for runActivityLogGenerator</name>
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:86:  - backend/src/ai/agents/validator.ts — canonical agent shape: optional model param, Promise.race timeout (30_000ms), AgentUnavailableError, MOCK_* constant, generateObject pattern
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:87:  - backend/src/ai/types.ts — existing schemas to understand file structure before adding ActivityDraftFieldsSchema
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:88:  - backend/src/ai/agents/activity-log-generator.ts — current stub (2-line export {})
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:89:  - backend/src/tests/approvals.test.ts — test file conventions: vi.mock env, makeJsonlAdapter, setDb/resetDb, vi.spyOn describe-scoped, vi.clearAllMocks afterEach
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:90:  - backend/src/store/schema.ts — CommandResultSchema and AuditEventSchema shapes: field names used in agent input construction
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:98:  - Test 5 (commandsSummary grounding): the input's `commandResults` array items (command + exitCode) appear in the constructed prompt string passed to generateObject — spy on generateObject import to assert the prompt JSON contains the command string
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:107:  - Inject a LanguageModelV1 mock via the optional `model` param (do not use vi.mock on the ai module — inject directly per Phase 05 decision)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:122:  Export the inferred type `ActivityDraftFields`. Do not use fenced code in action — the above is the schema shape in prose form: five required string fields, camelCase names matching the CONTEXT.md decision.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:124:  Run `cd backend && npx vitest run src/tests/activity-log-generator.test.ts` — all tests MUST fail (RED gate).
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:130:  <done>Test file exists, imports resolve, all tests fail with "not implemented" or schema mismatch — RED confirmed</done>
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:134:  <name>Task 2: GREEN — implement runActivityLogGenerator</name>
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:138:  - backend/src/ai/agents/validator.ts — exact implementation shape to mirror: imports, Promise.race pattern, generateObject call, error catch → AgentUnavailableError, maxTokens
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:139:  - backend/src/ai/prompts.ts — existing prompt style (SAFETY_PREAMBLE usage, role/field description format) to match before appending ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:140:  - backend/src/ai/types.ts — confirm ActivityDraftFieldsSchema was added in Task 1
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:141:  - backend/src/store/schema.ts — AuditEvent.payload_json is a string; CommandResult has command, exit_code, stdout_redacted, stderr_redacted; Observation has content
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:151:  - Role line: `Role: activity_log_generator — ERP activity report drafter.`
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:154:  - Constraint: commandsSummary must enumerate only commands actually listed in the input commandResults array — do not reference commands not present in the data
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:163:  - maxTokens is 2048 (higher than other agents — activity report fields need room)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:165:  Run tests — all 5 MUST pass (GREEN gate).
.planning/milestones/v1.0-phases/07-activity-generation/07-01-PLAN.md:189:| T-07-02 | Tampering | LLM output — fabricated facts in draft fields | mitigate | System prompt instructs "invent nothing; trace every claim to supplied data"; Zod schema enforces shape but not truthfulness — graders evaluate output quality, not schema compliance |
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:19:    - backend/src/ai/types.ts (ActivityDraftFieldsSchema already present from WIP commit — no changes needed)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:22:  - "ActivityDraftFieldsSchema was already in ai/types.ts from the WIP scaffold commit — task confirmed it correct and moved on without modification"
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:32:Implemented the `activity-log-generator` agent using TDD: JWT-like structured output from audit trail data only — all 5 graded ERP fields via `generateObject` + `ActivityDraftFieldsSchema`, with 30s timeout, `AgentUnavailableError` on failure, and an exported `MOCK_ACTIVITY_DRAFT` constant for offline/mock-mode use.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:48:- RED commit: `76f06b3` — `test(07-01): add failing tests for runActivityLogGenerator` (5 tests, all failing)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:49:- GREEN commit: `31603df` — `feat(07-01): implement runActivityLogGenerator agent` (5 tests, all passing)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:50:- REFACTOR: not needed — implementation was clean on first pass
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:54:1. Happy path via injected model — all 5 fields populated from scripted output
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:55:2. MOCK_ACTIVITY_DRAFT constant — all 5 fields are non-empty strings
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:56:3. Agent unavailable — injected model throws → `AgentUnavailableError`
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:57:4. Timeout — fake timers advance 31s → `AgentUnavailableError`
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:58:5. commandsSummary grounding — `commandResults` command string appears in prompt JSON passed to `doGenerate`
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:62:None — plan executed exactly as written. `ActivityDraftFieldsSchema` was already present in `ai/types.ts` from the WIP scaffold commit (`0035a41`); Task 1 confirmed it correct without modification.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:70:None — all exports are fully implemented. `MOCK_ACTIVITY_DRAFT` is an intentional constant (not a stub) used for offline/mock-mode operation, consistent with `MOCK_VALIDATION_RESULT_LIKELY` in `validator.ts`.
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:74:- `backend/src/tests/activity-log-generator.test.ts` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:75:- `backend/src/ai/agents/activity-log-generator.ts` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:76:- `backend/src/ai/prompts.ts` — FOUND (ACTIVITY_LOG_GENERATOR_SYSTEM_PROMPT exported)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:77:- `backend/src/ai/types.ts` — FOUND (ActivityDraftFieldsSchema exported)
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:78:- RED commit `76f06b3` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-01-SUMMARY.md:79:- GREEN commit `31603df` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:51:Purpose: Satisfies ACT-02 — `POST /api/runs/:id/activity/draft` and `POST /api/runs/:id/activity/submit` are the HTTP surface for the technician-facing activity report workflow.
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:80:  <name>Task 1: RED — failing tests for /draft and /submit</name>
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:84:  - backend/src/tests/approvals.test.ts — full test file: vi.mock env, makeJsonlAdapter + setDb/resetDb, createRun seeding, vi.spyOn(module, fn) describe-scoped, app.request pattern, afterEach vi.clearAllMocks
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:85:  - backend/src/routes/runs.ts — getPhoenixClient() factory: export it or copy the pattern into activity.ts
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:86:  - backend/src/store/audit.ts — saveActivityDraft, getActivityDraft, getAuditEvents, appendAuditEvent signatures (exact parameter names)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:87:  - backend/src/store/runs.ts — getRunById, updateRunPhase, markRunCompleted signatures
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:88:  - backend/src/store/schema.ts — ActivityDraftSchema field names (snake_case: root_cause, actions_taken, commands_summary, validation_result, submitted, submitted_at)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:89:  - backend/src/phoenix/types.ts — ActivitySchema shape returned by createActivity (id, team_id, ticket_id, start_datetime, end_datetime, summary, root_cause, etc.)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:90:  - .planning/phases/07-activity-generation/07-CONTEXT.md — phase guard logic (allowed phases), submit merge logic, time derivation, audit↔bus symmetry requirement
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:96:  - Test 2 (draft phase guard — too early): run in LOADED_CONTEXT phase → 409 with `{ error: string }` containing "phase"
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:97:  - Test 3 (draft phase guard — COMPLETED allowed): run in COMPLETED phase → 200 (re-draft is allowed per CONTEXT.md)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:114:  - Import `app` from `'../app.js'` — routes must be mounted in app.ts (plan 07-03), but for tests use vi.spyOn on the activityRouter's imported modules so the stub route stub resolves
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:115:  - Actually: import `activityRouter` directly and test it via `new Hono().route('/api/runs', activityRouter)` as a standalone app in tests — this avoids needing app.ts mounted (same isolation used in approvals tests via `app` which already mounts everything; since app.ts is mounted in plan 07-03, use `app` from app.js but stub the activityRouter import — OR test activityRouter directly). Use the `app` import approach: since 07-03 mounts activityRouter into app.ts, tests that use `app.request(...)` will work after 07-03. For 07-02 tests, construct a local Hono instance: `const testApp = new Hono(); testApp.route('/api/runs', activityRouter)` — this makes 07-02 tests independent of 07-03 mount order
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:126:  Run `cd backend && npx vitest run src/tests/activity.test.ts` — all tests MUST fail (RED gate — 501 or wrong shape).
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:132:  <done>Test file exists with 11 tests, all failing — RED confirmed. activityRouter stub exports resolve without TypeScript errors.</done>
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:136:  <name>Task 2: GREEN — implement activityRouter draft + submit handlers</name>
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:140:  - backend/src/routes/approvals.ts — Hono handler structure: getRunById guard, rawBody parse, advance call pattern
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:141:  - backend/src/routes/runs.ts — getPhoenixClient() implementation to reuse (import it or duplicate)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:142:  - backend/src/store/audit.ts — saveActivityDraft params (runId, {summary, rootCause, actionsTaken, commandsSummary, validationResult}) — camelCase input mapped to snake_case columns internally
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:143:  - backend/src/store/schema.ts — ActivityDraftSchema: snake_case fields `root_cause`, `actions_taken`, `commands_summary`, `validation_result`, `submitted`, `submitted_at`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:144:  - backend/src/events/run-event-bus.ts — runEventBus.emit(runId, type, payload) for audit↔bus symmetry on activity.submitted
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:145:  - .planning/phases/07-activity-generation/07-CONTEXT.md — phase guard list, submit field-merge logic, time derivation from audit events, run phase transitions on submit
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:163:  2. Phase guard: allowed phases are `WAITING_FOR_ACTIVITY_REVIEW`, `DRAFTING_ACTIVITY`, `COMPLETED` — any other phase returns 409 `{ error: 'run has not reached activity review phase' }`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:164:  3. Read audit context: `getAuditEvents(runId)`, query `command_results` for this run (use `getDb().all('SELECT ...')` directly — no dedicated helper exists), query `observations` similarly
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:166:  5. Call `runActivityLogGenerator(input)` — on `AgentUnavailableError` return 502 `{ error: 'agent unavailable' }`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:168:  7. `saveActivityDraft(runId, { summary, rootCause, actionsTaken, commandsSummary, validationResult })` — note camelCase input matches the function signature in audit.ts
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:174:  3. `getActivityDraft(runId)` — if no draft AND no body fields provided → 409 `{ error: 'no draft to submit' }`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:178:  7. Call `getPhoenixClient().createActivity(body)` — NOT in a retry wrapper (non-idempotent per existing client policy); on PhoenixNetworkError / PhoenixAuthError / PhoenixValidationError return 502 `{ error: 'failed to create Phoenix activity' }`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:182:  Run tests — all 11 MUST pass (GREEN gate).
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:198:| HTTP client → /draft | runId from URL path, optional body — untrusted |
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:199:| HTTP client → /submit | runId from URL path, 5 optional text fields — untrusted; fields must be redacted before persistence and before Phoenix POST |
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:206:| T-07-04 | Information Disclosure | `/submit` body fields (technician edits) → Phoenix | mitigate | Each override field passed through `redactSecrets` before inclusion in `ActivityCreate` body — same defence-in-depth as draft fields |
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:207:| T-07-05 | Tampering | Duplicate Phoenix activity — non-idempotent POST retried | mitigate | `createActivity` is never wrapped in the retry helper (existing client policy comment preserved); route returns 502 on failure without retry — duplicate ERP record risk eliminated |
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:208:| T-07-06 | Elevation of Privilege | Phase guard bypass — draft called from CREATED/TRIAGING | mitigate | Explicit allowlist of phases (WAITING_FOR_ACTIVITY_REVIEW, DRAFTING_ACTIVITY, COMPLETED); all others return 409 before agent call |
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:209:| T-07-07 | Denial of Service | Agent call without timeout on draft route | accept | 30s timeout inside runActivityLogGenerator (plan 07-01); route propagates AgentUnavailableError as 502 — no unbounded hang |
.planning/milestones/v1.0-phases/07-activity-generation/07-02-PLAN.md:210:| T-07-08 | Information Disclosure | Audit event payload for activity.submitted | mitigate | Payload contains only `activityId` (numeric ERP id) — no secrets, no draft text |
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:21:  - "Test file uses standalone testApp = new Hono().route('/api/runs', activityRouter) — avoids dependency on app.ts mount order (plan 07-03)"
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:22:  - "Test 7 spies on MockPhoenixClient.prototype.createActivity directly — getPhoenixClient() returns MockPhoenixClient when resolveClientMode is 'mock', so prototype spy intercepts the instance call without module re-wiring"
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:23:  - "getDb() used directly in submit handler for UPDATE activity_drafts SET submitted — no dedicated store helper exists; direct SQL keeps the function boundary narrow"
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:24:  - "createActivity is never retried — non-idempotent POST; matching the existing client policy comment in phoenix/client.ts"
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:46:- RED commit: `a7a999b` — `test(07-02): add failing tests for activity draft + submit routes` (11 tests, all failing — 501)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:47:- GREEN commit: `681d777` — `feat(07-02): implement activityRouter draft + submit handlers` (11 tests, all passing)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:48:- REFACTOR: not needed — implementation was clean on first pass
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:52:1. Draft happy path — WAITING_FOR_ACTIVITY_REVIEW → 200 with all 5 snake_case fields non-empty
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:53:2. Draft phase guard (too early) — LOADED_CONTEXT → 409 with "phase" in error
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:54:3. Draft COMPLETED allowed — re-draft returns 200
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:55:4. Draft agent unavailable — AgentUnavailableError → 502 `{ error: 'agent unavailable' }`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:56:5. Draft unknown run — 404
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:57:6. Submit happy path — existing draft, no body overrides → 200 with Phoenix Activity record
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:58:7. Submit field overrides — `{ summary: 'technician edit' }` → createActivity called with edited summary
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:59:8. Submit no draft + no body — 409 `{ error: 'no draft to submit' }`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:60:9. Submit Phoenix failure — PhoenixNetworkError → 502
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:61:10. Submit unknown run — 404
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:62:11. Submit audit event — after success, `getAuditEvents` includes `activity.submitted`
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:75:- Calls `getPhoenixClient().createActivity(...)` once — no retry (T-07-05)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:80:None — plan executed exactly as written. Test file already existed as untracked from the WIP scaffold commit (`0035a41`) with all 11 tests fully written; stub in `activity.ts` already returned 501. RED gate confirmed by running vitest (11/11 failing), then GREEN implemented.
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:89:- `createActivity` not retried — duplicate ERP record risk eliminated (T-07-05 ✓)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:91:- `activity.submitted` audit payload contains only `activityId` — no draft text (T-07-08 ✓)
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:96:None — all routes are fully implemented and wired to real store/agent/Phoenix dependencies.
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:100:- `backend/src/routes/activity.ts` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:101:- `backend/src/tests/activity.test.ts` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:102:- `.planning/phases/07-activity-generation/07-02-SUMMARY.md` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:103:- RED commit `a7a999b` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:104:- GREEN commit `681d777` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:109:- `backend/src/routes/activity.ts` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:110:- `backend/src/tests/activity.test.ts` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:111:- RED commit `a7a999b` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-02-SUMMARY.md:112:- GREEN commit `681d777` — FOUND
.planning/milestones/v1.0-phases/07-activity-generation/07-03-PLAN.md:33:Purpose: The two activity endpoints must be reachable through the same Hono app instance the frontend and integration tests use. This is a single-line mount — identical to how approvalsRouter and eventsRouter are already wired.
.planning/milestones/v1.0-phases/07-activity-generation/07-03-PLAN.md:64:  - backend/src/app.ts — current imports and `app.route(...)` call list; add activityRouter after eventsRouter following the same pattern
.planning/milestones/v1.0-phases/07-activity-generation/07-03-PLAN.md:98:| app.ts router mount | No new trust boundary introduced — same Hono app already exposes /api/runs/* |
.planning/milestones/v1.0-phases/07-activity-generation/07-03-PLAN.md:104:| T-07-09 | Tampering | Route collision — /api/runs/* path conflict with runsRouter | accept | Hono matches specific paths first; `/activity/draft` and `/activity/submit` do not collide with `/:runId` GET or `/:runId/next` POST patterns verified by test suite |
.planning/milestones/v1.0-phases/07-activity-generation/07-03-PLAN.md:105:| T-07-SC | Tampering | npm installs | accept | No new packages — mount is import + one line |
.planning/milestones/v1.0-phases/07-activity-generation/07-03-SUMMARY.md:24:**One-liner:** activityRouter mounted on `/api/runs` in app.ts — POST /draft and /submit now reachable through the main Hono app.
.planning/milestones/v1.0-phases/07-activity-generation/07-03-SUMMARY.md:44:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/07-activity-generation/07-03-SUMMARY.md:52:None — no new trust boundaries introduced.
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:14:audit data — never invented, never carrying secrets.
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:25:  exported `MOCK_ACTIVITY_DRAFT` constant — identical pattern to `validator.ts`.
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:46:- Repeat calls are allowed and regenerate — each call inserts a new draft row;
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:51:  exists — `WAITING_FOR_ACTIVITY_REVIEW` (and `DRAFTING_ACTIVITY`). Calling draft
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:72:  retried (non-idempotent — duplicate-record risk, per existing client policy).
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:73:- Setting ticket status DONE is explicitly out of scope (unscored) — do not gate
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:88:  `appendAuditEvent` — draft persistence and audit reads already exist.
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:92:  `/api/v1/activities/create` (no retry — non-idempotent).
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:119:  activity) — the agent must fill every field, using an explicit "insufficient
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:129:- Setting ticket status `DONE` after submit — unscored courtesy (P2), out of scope.
.planning/milestones/v1.0-phases/07-activity-generation/07-CONTEXT.md:130:- Redaction preview / "output was redacted" UI affordance (BOOST-02) — frontend, v2.
.planning/milestones/v1.0-phases/07-activity-generation/07-UAT.md:12:name: Draft grounding quality — real LLM path
.planning/milestones/v1.0-phases/07-activity-generation/07-UAT.md:15:  outcomes from the audit trail — not placeholder text, not invented facts.
.planning/milestones/v1.0-phases/07-activity-generation/07-UAT.md:20:### 1. Draft grounding quality — real LLM path
.planning/milestones/v1.0-phases/07-activity-generation/07-UAT.md:21:expected: Start the backend with the real LLM path, POST to `/api/runs/:id/activity/draft` on a run with real (or seeded) audit events and command results. All 5 fields reference actual audit data — no fabrications, no placeholders.
.planning/milestones/v1.0-phases/07-activity-generation/07-UAT.md:24:### 2. Phoenix activity submission — real mode
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:10:    expected: "All 5 fields contain non-empty text grounded in the actual audit data — no invented facts, no placeholder text"
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:22:**Re-verification:** No — initial verification
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:76:| `routes/activity.ts` draft handler | `auditEvents` | `getAuditEvents(runId)` → SQLite `audit_events` table | Yes — DB query via store function | ✓ FLOWING |
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:77:| `routes/activity.ts` draft handler | `commandResultRows` | `getDb().all(... FROM command_results WHERE run_id = ?)` | Yes — direct SQLite query | ✓ FLOWING |
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:78:| `routes/activity.ts` submit handler | `draft` | `getActivityDraft(runId)` → SQLite `activity_drafts` table | Yes — DB query via store function | ✓ FLOWING |
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:79:| `routes/activity.ts` submit handler | `activity` | `getPhoenixClient().createActivity(...)` | Yes — Phoenix client POST (mock in tests, real in production) | ✓ FLOWING |
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:83:Step 7b skipped — routes require a running server with seeded DB state; no runnable entry point is available for stateless spot-checks.
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:93:| ACT-01 | 07-01, 07-02 | `activity_log_generator` produces all 5 graded fields from audit trail only — no invented facts, no secrets | ✓ SATISFIED | `runActivityLogGenerator` + `ActivityDraftFieldsSchema` in `ai/agents/activity-log-generator.ts`; system prompt instructs no fabrication; defence-in-depth `redactSecrets` on all 5 fields before persistence |
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:100:| `activity-log-generator.test.ts` | ~148–170 | Timeout test leaks unhandled `AgentUnavailableError` rejection after fake-timer teardown | ⚠ Warning | Vitest reports "1 unhandled error" — does not cause any test to fail (473/473 pass) but could mask real unhandled rejections in future runs. Pre-existing before this phase per 07-02-SUMMARY.md. |
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:106:#### 1. Draft grounding quality — real LLM path
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:109:**Expected:** All 5 fields contain non-empty text that references actual commands and outcomes from the audit trail — not placeholder text, not invented facts
.planning/milestones/v1.0-phases/07-activity-generation/07-VERIFICATION.md:112:#### 2. Phoenix activity submission — real mode
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:87:    - backend/src/store/schema.ts — CommandApproval, Run, AuditEvent, ActivityDraft shapes
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:88:    - backend/src/events/sse.ts — SSE_EVENT_TYPES constant (the full 14-entry tuple)
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:89:    - frontend/src/App.tsx — existing file to understand starting point
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:93:    (all interfaces, PascalCase, no `I` prefix, strict — no `any`):
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:111:    CommandApproval: mirrors backend CommandApproval from schema.ts —
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:153:    - frontend/src/types.ts — types just created
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:154:    - backend/src/routes/tickets.ts — query params for listTickets
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:155:    - backend/src/routes/runs.ts — POST body shapes, response shapes
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:156:    - backend/src/routes/approvals.ts — approve/reject body schemas
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:157:    - backend/src/routes/activity.ts — SubmitBodySchema (5 optional string fields)
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:158:    - backend/src/events/sse.ts — SSE_EVENT_TYPES for SseEventType union
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:161:    mappers.test.ts — riskBadge:
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:165:    - riskBadge("HIGH_RISK_BLOCKED") returns { label: "HIGH RISK — BLOCKED", colorClass: "badge--high" }
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:167:    mappers.test.ts — sseEventLabel:
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:191:    as the fallback (TypeScript exhaustive — the union covers all cases).
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:212:    — builds URL from BASE + path, calls fetch, reads the JSON body on non-2xx,
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:235:      Must NOT swallow 422 — let apiFetch throw so the caller receives the backend
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:271:| T-08-01 | Information Disclosure | api.ts — VITE_API_BASE | accept | Base URL is non-secret; no credentials stored in frontend code or environment |
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:272:| T-08-02 | Information Disclosure | api.ts — error messages from backend | accept | Backend already redacts secrets before sending; frontend surfaces the message string verbatim as text (React escapes) |
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:273:| T-08-03 | Tampering | approveCommand — edited command payload | mitigate | approveCommand sends editedCommand to backend which re-runs the safety gate; frontend does NOT pre-validate or bypass — 422 must propagate to caller |
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:279:- `npx vitest run src/utils/mappers.test.ts` — all 19 mapper assertions green
.planning/milestones/v1.0-phases/08-frontend/08-01-PLAN.md:282:- approveCommand does not catch 422 — it propagates the thrown error
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:33:  - "Added vite/client to tsconfig.json types array to resolve import.meta.env TS2339 error — required for VITE_API_BASE access"
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:51:### Task 1 — Shared TypeScript types (`types.ts`)
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:55:- `RiskLevel` — string union of the four backend values
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:56:- `SseEventType` — string union of all 14 `SSE_EVENT_TYPES` entries from `sse.ts`
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:61:### Task 2 — API wrappers (`api.ts`) + pure mappers with tests
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:63:**api.ts:** Exports `BASE` (reads `VITE_API_BASE` env var with `http://localhost:8000` fallback) and `getEventsUrl(runId)`. Central `apiFetch<T>` helper extracts the backend `error` field from non-2xx responses and throws `Error(message)`, so every caller surfaces the exact backend message via `err.message`. Exports 11 typed wrappers: `listTickets`, `getTicket`, `getCustomerSystem`, `createRun`, `getRun`, `advanceRun`, `abortRun`, `approveCommand`, `rejectCommand`, `draftActivity`, `submitActivity`. `approveCommand` does not catch 422 — the thrown error propagates so the caller receives "command blocked by safety policy" (T-08-03 mitigation).
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:67:**mappers.test.ts:** 19 Vitest assertions — 4 for `riskBadge`, 15 for `sseEventLabel`. TDD RED phase confirmed all 19 failing before implementation.
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:89:None — this plan creates pure types and functions with no UI rendering or data sources.
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:97:- `frontend/src/types.ts` — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:98:- `frontend/src/api.ts` — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:99:- `frontend/src/utils/mappers.ts` — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:100:- `frontend/src/utils/mappers.test.ts` — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:101:- Commit `8c8923c` (Task 1) — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:102:- Commit `1cfdd61` (Task 2) — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:103:- `tsc --noEmit` — clean
.planning/milestones/v1.0-phases/08-frontend/08-01-SUMMARY.md:104:- Vitest 19/19 — green
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:25:    - "useRunEvents imports getEventsUrl from api.ts — no inline VITE_API_BASE string"
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:54:data directly via fetch — everything flows through these hooks.
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:82:    - frontend/src/types.ts — Ticket, Run types
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:83:    - frontend/src/api.ts — listTickets, getRun signatures
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:84:    - frontend/src/App.tsx — understand the skeleton before touching it
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:95:    error (default null). useEffect that calls listTickets(params) — on success sets
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:98:    values change — use JSON.stringify(params) as the dependency to avoid object
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:101:    On a 502 (ERP unavailable), listTickets already returns [] per api.ts — the hook
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:102:    should also set error to "ERP unavailable — showing cached empty list" so the
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:120:    on relevant SSE events. The hook itself is stateless with respect to approval —
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:123:    Single default export is NOT used — named exports only per project conventions.
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:141:    - frontend/src/types.ts — SseEvent, SseEventType
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:142:    - frontend/src/api.ts — getEventsUrl(runId) helper; import this instead of building the URL inline
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:143:    - backend/src/events/sse.ts — SSE_EVENT_TYPES, the 14-entry tuple; event data shape
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:144:    - frontend/src/hooks/useRun.ts — established hook pattern to follow
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:161:      Do NOT inline VITE_API_BASE — always use the exported helper.
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:165:      on error — the browser will retry automatically.
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:168:      SSE_EVENT_TYPES — do not register a listener for it, so it is silently
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:176:    The hook must NOT start an EventSource when runId is null — this prevents a
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:187:    Hook exports { events: SseEvent[]; connected: boolean } — no pendingApproval or phase.
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:208:| T-08-04 | Information Disclosure | useRunEvents — parsed SSE payload | accept | payload typed as `unknown`; components render specific known fields only; React text-escapes all strings by default |
.planning/milestones/v1.0-phases/08-frontend/08-02-PLAN.md:226:- useRunEvents returns { events, connected } only — no pendingApproval, no phase
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:31:  - "EventSource is not closed on error — browser-native retry handles reconnection; only closed on unmount"
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:46:### Task 1 — `useTickets` and `useRun`
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:51:### Task 2 — `useRunEvents`
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:53:`useRunEvents(runId)` returns `{ events, connected }`. Opens `new EventSource(getEventsUrl(runId))` only when `runId` is non-null, registers one listener for each of the 14 `SSE_EVENT_TYPES`, appends parsed `SseEvent`s via functional setState, and closes the connection on unmount. `getEventsUrl` is imported from `api.ts` — no inline `VITE_API_BASE`.
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:57:None — all three hooks built as specified.
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:69:- `frontend/src/hooks/useTickets.ts` — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:70:- `frontend/src/hooks/useRun.ts` — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:71:- `frontend/src/hooks/useRunEvents.ts` — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:72:- Commit `69d87a7` (Task 1) — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:73:- Commit `7fb1423` (Task 2) — FOUND
.planning/milestones/v1.0-phases/08-frontend/08-02-SUMMARY.md:74:- `tsc --noEmit` — clean
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:51:ticket list view. This is the entry point for the technician — every other view
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:86:    - frontend/src/App.tsx — current skeleton to replace
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:87:    - frontend/src/types.ts — Ticket, CustomerSystem, ActivityDraft, CreateRunResult types
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:88:    - frontend/src/api.ts — createRun and draftActivity signatures
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:89:    - frontend/src/index.css — existing reset
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:95:    contracts the full implementations in plans 08-04 and 08-05 will satisfy —
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:98:    frontend/src/components/RunView.tsx — export a default function RunView
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:102:    Renders a single div: "Run view — coming in plan 08-04".
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:104:    frontend/src/components/ActivityView.tsx — export a default function ActivityView
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:107:    Renders a single div: "Activity editor — coming in plan 08-05".
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:114:    - currentView: 'list' | 'run' | 'activity' — useState default 'list'
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:115:    - activeRunId: string | null — useState default null
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:116:    - activeTicketTitle: string — useState default ''
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:117:    - customerSystem: CustomerSystem | null — useState default null
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:118:    - activityDraft: ActivityDraft | null — useState default null
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:119:    - createError: string | null — useState default null
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:120:    - creating: boolean — useState default false
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:121:    - draftingActivity: boolean — useState default false
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:140:    onActivityReady() — called by RunView when the run reaches WAITING_FOR_ACTIVITY_REVIEW:
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:145:    - On failure: sets createError to the error message (draft failed — user sees
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:183:    - frontend/src/types.ts — Ticket type (id, title, customer_name, priority, status)
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:184:    - frontend/src/hooks/useTickets.ts — return shape { tickets, loading, error }
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:185:    - frontend/src/index.css — existing reset to extend
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:216:    Keep styles functional and minimal — legible layout, no animations. Use a max-width
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:240:| backend → TicketListView | Ticket fields (title, customer_name) rendered as React text children — auto-escaped |
.planning/milestones/v1.0-phases/08-frontend/08-03-PLAN.md:248:| T-08-07 | XSS | TicketListView — ticket.title, customer_name in JSX | mitigate | Rendered as React text children (never dangerouslySetInnerHTML); React auto-escapes |
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:22:  - "No router library — three views switched via useState<'list'|'run'|'activity'>"
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:38:**Task 1 — App.tsx view-state shell + stubs (b39b5cb)**
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:44:- Error banner (`.error-banner`) renders `createError` as text node — XSS safe (T-08-08 mitigated)
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:45:- Drafting overlay (`.drafting-overlay`) non-blocking — abort button in RunView remains accessible
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:47:- `RunView.tsx` stub: props `{ runId, ticketTitle, customerSystem, onActivityReady }` — exact contract for plan 08-04
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:48:- `ActivityView.tsx` stub: props `{ runId, activityDraft, onBack }` — `onBack` not `onDone`; exact contract for plan 08-05
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:50:**Task 2 — TicketListView + CSS (461271d)**
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:55:- ERP error banner (`.erp-banner`) renders error string as text child — XSS safe (T-08-07 mitigated); persists above list even when tickets=[]
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:58:- Badge classes: `badge priority-high/medium/low`, `badge status-open/pending/done` — lowercased from API values
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:74:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:85:These stubs do not block the plan's goal — the ticket list and view-state shell are fully functional. RunView and ActivityView are replaced in subsequent plans with the contracts defined here.
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:89:None — no new network endpoints, auth paths, or trust boundaries introduced beyond what the plan modelled.
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:93:- `frontend/src/App.tsx` — exists, correct
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:94:- `frontend/src/components/RunView.tsx` — exists, correct props
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:95:- `frontend/src/components/ActivityView.tsx` — exists, `onBack` prop confirmed
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:96:- `frontend/src/components/TicketListView.tsx` — exists, correct
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:97:- `frontend/src/index.css` — extended with all introduced class names
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:98:- Task 1 commit b39b5cb — confirmed in git log
.planning/milestones/v1.0-phases/08-frontend/08-03-SUMMARY.md:99:- Task 2 commit 461271d — confirmed in git log
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:61:(UX-02), and the abort/advance controls. This is the highest-stakes UI — it
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:92:    - frontend/src/types.ts — CommandApproval shape (proposed_command, purpose, expected_signal, risk_level, safety_notes, id)
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:93:    - frontend/src/api.ts — approveCommand(runId, approvalId, editedCommand?) and rejectCommand(runId, approvalId, reason) signatures; apiFetch throws with the backend "error" field verbatim so catch blocks use err.message directly
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:94:    - frontend/src/utils/mappers.ts — riskBadge(level: RiskLevel): { label: string; colorClass: string }; colorClass values are "badge--safe", "badge--low", "badge--medium", "badge--high" (double-dash, not "risk-safe" etc.)
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:95:    - backend/src/store/schema.ts — RiskLevel enum values: SAFE_READ_ONLY, LOW_RISK_CHANGE, MEDIUM_RISK_CHANGE, HIGH_RISK_BLOCKED
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:101:    - riskBadge('HIGH_RISK_BLOCKED') → { label: 'HIGH RISK — BLOCKED', colorClass: 'badge--high' }
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:105:    - 422 response from approve surfaces "Command blocked by safety policy — edit or reject." inline (class "approval-error")
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:114:      onDecided: () => void  — called after a successful approve or reject so RunView can refresh
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:117:      mode: 'default' | 'edit' | 'reject' — default 'default'
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:118:      editedCommand: string — initialized to approval.proposed_command when mode switches to 'edit'
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:119:      rejectReason: string — empty string
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:123:    Import riskBadge from frontend/src/utils/mappers.ts (NOT from a riskBadge.ts file — that
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:138:        - Button "Approve" (class "btn btn-approve") — calls handleApprove() without edited command
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:139:        - Button "Edit & Approve" (class "btn btn-edit") — sets mode to 'edit', copies proposed_command to editedCommand
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:140:        - Button "Reject" (class "btn btn-reject") — sets mode to 'reject'
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:144:        - Button "Submit edited command" — calls handleApprove(editedCommand)
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:145:        - Button "Cancel" — sets mode back to 'default'
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:149:        - Button "Confirm reject" — disabled if rejectReason.trim() is empty; calls handleReject()
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:150:        - Button "Cancel" — sets mode back to 'default'
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:155:      On 422: sets error to "Command blocked by safety policy — edit or reject."
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:170:    non-2xx, check err.message directly — the backend 422 body is
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:186:    Risk badge uses riskBadge() from mappers.ts — colorClass values are badge--safe/low/medium/high.
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:198:    - frontend/src/components/RunView.tsx — current stub to replace; props interface must match exactly: { runId, ticketTitle, customerSystem, onActivityReady }
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:199:    - frontend/src/hooks/useRunEvents.ts — return shape is { events: SseEvent[]; connected: boolean } ONLY; it does NOT return pendingApproval or phase
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:200:    - frontend/src/hooks/useRun.ts — return shape: { run: Run | null; loading: boolean; error: string | null; refresh: () => void }; Run has pendingApproval: CommandApproval | null and phase: string
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:201:    - frontend/src/api.ts — advanceRun(runId), abortRun(runId) signatures; errors throw with err.message = backend error field verbatim
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:202:    - frontend/src/utils/mappers.ts — sseEventLabel(type: string): { icon: string; label: string }
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:203:    - frontend/src/types.ts — SseEvent, CustomerSystem types
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:204:    - frontend/src/index.css — existing styles to extend
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:213:    - Terminal phases: COMPLETED, FAILED, ABORTED — Advance button hidden
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:234:      aborting: boolean — default false
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:235:      advancing: boolean — default false
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:236:      actionError: string | null — default null
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:248:          four labelled spans — "IP: {ip}", "Port: {port}", "User: {username}", "OS: {os}"
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:263:          span class "event-time" — new Date(event.ts).toLocaleTimeString()
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:264:          span class "event-icon" — sseEventLabel(event.type).icon
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:265:          span class "event-label" — sseEventLabel(event.type).label
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:343:| T-08-11 | XSS | approval command display | mitigate | Rendered in pre element as text children — React auto-escapes |
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:344:| T-08-12 | Tampering | edited command approval bypass | mitigate | Frontend sends editedCommand to backend /approve; backend re-runs deterministic safety gate (422 on block); frontend surfaces 422 error — no client-side safety bypass |
.planning/milestones/v1.0-phases/08-frontend/08-04-PLAN.md:345:| T-08-13 | Information Disclosure | SSH keys / Phoenix token via SSE events | accept | Backend redacts all secrets before writing audit log and emitting SSE; frontend renders redacted strings only — no de-redaction logic in client |
.planning/milestones/v1.0-phases/08-frontend/08-04-SUMMARY.md:20:  - "ApprovalCard distinguishes 422 blocked by inspecting err.message for 'blocked'/'safety' substrings — backend sends 'command blocked by safety policy' verbatim so no status code parsing needed"
.planning/milestones/v1.0-phases/08-frontend/08-04-SUMMARY.md:36:**ApprovalCard** (`frontend/src/components/ApprovalCard.tsx`): Three-mode approval UI (default / edit / reject). Risk badge via `riskBadge()` from `mappers.ts` using `badge--safe/low/medium/high` CSS classes. Approve calls `approveCommand` with no edited command in default mode, with `editedCommand` in edit mode. Reject requires a non-empty reason. 422/safety errors surface as "Command blocked by safety policy — edit or reject." Other errors show `err.message` directly. All command text in `pre`/`textarea` elements — no `dangerouslySetInnerHTML`.
.planning/milestones/v1.0-phases/08-frontend/08-04-SUMMARY.md:59:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/08-frontend/08-04-SUMMARY.md:63:None — both components are fully wired to real hooks and API calls.
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:38:Purpose: The technician's last step — review the AI-drafted activity report,
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:65:    - frontend/src/components/ActivityView.tsx — current stub; props interface must stay identical
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:66:    - frontend/src/types.ts — ActivityDraft type: summary, root_cause, actions_taken, commands_summary, validation_result (snake_case from API)
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:67:    - frontend/src/api.ts — submitActivity(runId, overrides: Partial&lt;ActivitySubmitBody&gt;) signature; ActivitySubmitBody uses camelCase (summary, rootCause, actionsTaken, commandsSummary, validationResult)
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:68:    - backend/src/routes/activity.ts — SubmitBodySchema fields for submit body shape reference
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:69:    - frontend/src/index.css — existing styles to extend
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:82:    Props interface stays identical to the stub (runId, activityDraft, onBack) — DO NOT change it.
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:90:      submitting: boolean — default false
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:91:      submitted: boolean — default false
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:92:      error: string | null — default null
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:99:      p class "activity-subtitle" — "Review and edit the AI-generated report before submitting to Phoenix."
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:112:        Back button (class "btn btn-back") — always enabled, calls onBack()
.planning/milestones/v1.0-phases/08-frontend/08-05-PLAN.md:113:        Submit button (class "btn btn-submit") — shows "Submitting…" when submitting; disabled when submitting || submitted
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:19:  - "Pass Partial<ActivityDraft> (snake_case) to submitActivity — api.ts wrapper handles camelCase mapping to backend, so component state maps back to snake_case keys at submit time"
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:20:  - "Non-empty field check for overrides — matches backend logic: missing fields fall back to saved draft"
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:36:- Submit builds `Partial<ActivityDraft>` overrides from non-empty fields and calls `submitActivity(runId, overrides)` — the api.ts wrapper remaps to camelCase for the backend
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:62:None — plan executed exactly as written.
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:71:- T-08-15 (XSS): fields rendered as controlled textarea values — no innerHTML
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:77:- `/Users/julianschmidt/Documents/GitHub/techbold_track_template/frontend/src/components/ActivityView.tsx` — exists, 120 lines
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:78:- `/Users/julianschmidt/Documents/GitHub/techbold_track_template/frontend/src/index.css` — exists, 534 lines
.planning/milestones/v1.0-phases/08-frontend/08-05-SUMMARY.md:79:- Commit `8200bbe` — verified present in git log
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:10:that drives a complete run end-to-end — ticket list → ticket detail (customer
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:26:- Routing: single-page view-state (no router lib) — three views (list / run / activity) switched by `useState`.
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:40:- Loading / error states: per-action inline states — spinner while pending, error banner on failure, surface backend 4xx/5xx messages.
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:49:- `frontend/src/App.tsx` — skeleton single default export to replace with the workspace shell.
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:50:- `frontend/src/main.tsx` — React 18 `createRoot` + StrictMode entry; no changes needed.
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:51:- `frontend/src/index.css` — minimal reset (`box-sizing`, bare `body`); extend here.
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:52:- `import.meta.env.VITE_API_BASE` — API base URL (default `http://localhost:8000`, set in docker-compose).
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:59:### Integration Points (backend API contract — all live)
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:77:- The run advances via explicit `POST /next` calls — the UI must drive the state machine forward (e.g. an Advance/Continue action) between approval gates, since the backend does not auto-recurse past the 201 create contract.
.planning/milestones/v1.0-phases/08-frontend/08-CONTEXT.md:85:- BOOST-01 ranked-hypotheses picker, BOOST-02 redaction preview, BOOST-05 blast-radius on approval card — v2 UX boosters, out of scope.
.planning/milestones/v1.0-phases/08-frontend/08-UAT.md:21:### 1. Ticket list rendering — rows, badges, filter toolbar
.planning/milestones/v1.0-phases/08-frontend/08-UAT.md:36:expected: (a) Approve advances the run; (b) edit-then-approve re-runs the safety gate — success advances, a 422 shows "Command blocked by safety policy — edit or reject."; (c) reject-with-reason continues with the agent proposing an alternative
.planning/milestones/v1.0-phases/08-frontend/08-UAT.md:44:expected: With VITE_API_BASE set to an invalid URL, the ticket list shows an ERP-unavailable banner. NOTE: listTickets currently swallows errors and returns [] — the banner is unreachable; this item is a decision point (accept silent-empty for demo, or fix listTickets to rethrow)
.planning/milestones/v1.0-phases/08-frontend/08-UAT.md:63:  root_cause: "In mock LLM mode, getModel() returns MOCK_MODEL whose doGenerate emits text '{}'. generateObject validates '{}' against the strict DiagnosticProposalSchema, which fails, so runProblemAnalyzer throws AgentUnavailableError; the orchestrator catches it, audits 'agent.unavailable', and stays at TRIAGING. The MOCK_DIAGNOSTIC_PROPOSAL / MOCK_VALIDATION_RESULT_LIKELY / MOCK fix constants are exported by each agent but never returned — the mock-mode short-circuit was never wired in. Same gap in all three agents (problem-analyzer, problem-solver, validator)."
.planning/milestones/v1.0-phases/08-frontend/08-UAT.md:68:      issue: "runProblemAnalyzer always calls getModel()/generateObject; MOCK_DIAGNOSTIC_PROPOSAL is exported but unused — no mock short-circuit"
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:19:    expected: "(a) run advances; (b) backend re-checks safety and either advances or returns 422 shown as 'Command blocked by safety policy — edit or reject.'; (c) run continues with agent proposing an alternative"
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:26:    why_human: "The erp-banner path in TicketListView is implemented in JSX, but listTickets swallows all errors and returns [] silently — the banner is currently unreachable in normal operation. This needs manual confirmation of whether the degraded path fires at all under network failure (see WARNING note below)"
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:31:**Phase Goal:** A technician can drive a complete run in the browser — from ticket list through approval decisions to editing and submitting the activity report
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:34:**Re-verification:** No — initial verification
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:90:| `TicketListView` | `tickets` | `useTickets` → `listTickets()` → `apiFetch('/api/tickets')` | Yes — real HTTP GET | FLOWING |
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:91:| `RunView` (timeline) | `events` | `useRunEvents` → `EventSource` → parsed SSE JSON | Yes — live SSE stream | FLOWING |
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:92:| `RunView` (approval) | `pendingApproval` | `useRun` → `getRun()` → `apiFetch('/api/runs/:id')` | Yes — real HTTP GET | FLOWING |
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:93:| `ApprovalCard` | `approval` prop | Passed from RunView's `run.pendingApproval` | Yes — from getRun response | FLOWING |
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:94:| `ActivityView` | `activityDraft` prop | App state populated by `draftActivity()` → `apiFetch('/api/runs/:id/activity/draft', POST)` | Yes — real POST | FLOWING |
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:98:Step 7b: SKIPPED — UI components require a browser and running backend; no runnable entry points can be exercised without a server. The automated checks already confirmed by the executor (tsc clean, 19/19 vitest, production build) cover what grep cannot.
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:102:Step 7c: N/A — no probe scripts declared in any plan file and no `scripts/*/tests/probe-*.sh` found for this phase.
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:120:| `frontend/src/api.ts` | 46-47 | `listTickets` catch block returns `[]` silently — network errors are swallowed, not propagated | WARNING | `useTickets` error state can never be set via a real network failure; the `erp-banner` in `TicketListView` is conditionally rendered on `error !== null` but `error` stays `null` always; ERP-05 degraded-state banner is unreachable at runtime |
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:130:The plan explicitly required this path ("sets error to 'ERP unavailable — showing cached empty list'"), and REQUIREMENTS.md marks UX-01 as the owning requirement. The requirement itself is satisfied in spirit — the component is coded for it — but the runtime path is dead.
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:158:   **Expected:** (a) Run advances; (b) backend re-runs safety gate — success advances, 422 shows "Command blocked by safety policy — edit or reject."; (c) run continues with agent proposing an alternative command
.planning/milestones/v1.0-phases/08-frontend/08-VERIFICATION.md:168:   **Expected:** Banner should appear (plan requirement); due to the silent-catch in listTickets, it currently will NOT appear — the app silently shows an empty list instead
.planning/milestones/v1.0-phases/09-tests-submission-polish/09-VERIFICATION.md:25:1. `pnpm test` is green — verified.
.planning/milestones/v1.0-phases/09-tests-submission-polish/09-VERIFICATION.md:26:2. Fresh clone runs end-to-end via `docker compose up` following only the README — README updated; manual fresh-clone check still needed.
.planning/milestones/v1.0-phases/09-tests-submission-polish/09-VERIFICATION.md:27:3. MIT LICENSE is present; secret scan clean before freeze — LICENSE present; scan reviewed with no real credentials identified.
.planning/milestones/v1.0-phases/09-tests-submission-polish/09-VERIFICATION.md:28:4. `REPORT.md` documents approach, agent design, safety model, and results — verified, with live VM result limitation documented honestly.
CLAUDE.md:11:**Core Value:** Win the scoring rubric. 55 of 100 points are **B (troubleshooting, 35) + C (safety & audit, 20)** — the entire product is shaped around solving hidden Linux-service incidents on fresh VMs, safely and auditably. A polished UI alone does not win.
CLAUDE.md:15:- **Tech stack:** Node 22 + Hono + TypeScript (backend), React 18 + Vite (frontend), Vercel AI SDK v5, ssh2, better-sqlite3 (JSONL fallback), Zod everywhere — fixed by `docs/ARCHITECTURE.md`. (Note: codebase `STACK.md` says Python/FastAPI; that's a stale dead skeleton, superseded by the Node decision.)
CLAUDE.md:17:- **Safety (hard-fail):** the model NEVER executes SSH — it proposes; a deterministic backend executes after human approval and a safety re-check. Blocklisted commands or leaked secrets zero the incident and cost further points.
CLAUDE.md:19:- **Generalisation:** no incident-specific branches keyed to ticket IDs, hostnames, or symptom strings — grading uses fresh VMs and penalises hardcoding.
CLAUDE.md:36:- Python 3.11 (slim Docker image — `backend/Dockerfile`)
CLAUDE.md:37:- Node 20 (slim Docker image — `frontend/Dockerfile`)
CLAUDE.md:38:- Backend: pip (via `backend/requirements.txt`) — no lockfile
CLAUDE.md:39:- Frontend: npm — lockfile present (`frontend/package-lock.json`)
CLAUDE.md:43:- FastAPI 0.115.6 — HTTP API server (`backend/app/main.py`)
CLAUDE.md:44:- Uvicorn 0.34.0 (standard extras) — ASGI server, run command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
CLAUDE.md:45:- Pydantic-settings 2.7.1 — environment/config management
CLAUDE.md:46:- React 18.3.1 — UI framework (`frontend/src/App.tsx`, `frontend/src/main.tsx`)
CLAUDE.md:47:- Vite 5.4.11 — dev server and build tool (`frontend/vite.config.ts`)
CLAUDE.md:48:- `@vitejs/plugin-react` 4.3.4 — Vite plugin for React/JSX transform
CLAUDE.md:49:- TypeScript compiler (`tsc`) — type-check step before production build
CLAUDE.md:53:- `fastapi==0.115.6` — entire HTTP layer
CLAUDE.md:54:- `uvicorn[standard]==0.34.0` — production-ready ASGI server with websocket/http2 extras
CLAUDE.md:55:- `pydantic-settings==2.7.1` — typed settings from env vars
CLAUDE.md:56:- `httpx` — calling the Phoenix ERP REST API
CLAUDE.md:57:- `paramiko` — SSH to customer VMs
CLAUDE.md:58:- `openai` — Azure OpenAI integration
CLAUDE.md:59:- `react@^18.3.1` + `react-dom@^18.3.1` — core UI
CLAUDE.md:64:- `.env.example` present at repo root — copy to `.env` for local dev
CLAUDE.md:67:- `frontend/tsconfig.json` — TypeScript config (target ES2020, strict mode, bundler module resolution)
CLAUDE.md:68:- `frontend/vite.config.ts` — Vite config (React plugin, host `0.0.0.0`, port 5173)
CLAUDE.md:89:- React components: PascalCase, `.tsx` extension — `App.tsx`
CLAUDE.md:90:- Entry points: lowercase — `main.tsx`, `main.py`
CLAUDE.md:91:- CSS: lowercase, matches component or scope — `index.css`
CLAUDE.md:92:- Config files: lowercase with dots — `vite.config.ts`, `tsconfig.json`
CLAUDE.md:93:- Python modules: lowercase with underscores — `__init__.py`, `main.py`
CLAUDE.md:94:- Components: PascalCase default exports — `export default function App()`
CLAUDE.md:95:- Route handlers (FastAPI): snake_case — `def health()`
CLAUDE.md:102:- No Prettier config present — no enforced formatter in place
CLAUDE.md:105:- No ruff or black config present — no enforced formatter in place
CLAUDE.md:113:- None configured — imports use relative paths (`./App`)
CLAUDE.md:119:- Inline styles used in skeleton (`style={{ ... }}`) — teams should move to CSS classes
CLAUDE.md:124:- Return plain dicts for JSON responses — no explicit `JSONResponse` wrapping for simple cases
CLAUDE.md:141:- `pydantic-settings` is in `requirements.txt` — use `BaseSettings` for config, not `os.getenv` directly
CLAUDE.md:145:- ERP token and SSH keys must stay on the backend — never passed to the browser
CLAUDE.md:146:- CORS is open (`allow_origins=["*"]`) for local dev only — restrict in production
CLAUDE.md:152:- The skeleton uses comments to guide implementers — remove scaffolding comments as code is written
CLAUDE.md:153:- Leave `# TODO` in commits — implement or file an issue
CLAUDE.md:159:- Minimal global reset only — `box-sizing: border-box`, bare `body` styles
CLAUDE.md:200:- The state machine owns truth; the AI only proposes — it never executes
CLAUDE.md:203:- All agent output is structured (`generateObject` / `Output.object`) — never free-form when the backend must act on it
CLAUDE.md:218:- Purpose: LLM roles that propose commands, interpret output, draft prose — structured output only
CLAUDE.md:246:### Primary Request Path — Advance Run (`/next`)
CLAUDE.md:258:- Purpose: Structured output from `problem-analyzer` agent — ranked hypotheses + one command
CLAUDE.md:263:- Pattern: Stateful record — transitions PENDING → APPROVED/REJECTED/EXECUTED/BLOCKED
CLAUDE.md:266:- Pattern: Enum — `SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED`; determined deterministically, LLM may only raise (never lower) the level
CLAUDE.md:267:- Purpose: Append-only record of every significant action — the source of truth for activities
CLAUDE.md:287:- **Threading:** Single-threaded Node.js event loop. `better-sqlite3` is synchronous — keep DB calls short. SSH and Phoenix calls are async/await.
CLAUDE.md:291:- **CORS:** Open (`*`) for local dev — appropriate for a single-machine tool with no cookies.
CLAUDE.md:304:- `env.ts` throws on startup if required vars are missing — no silent misconfiguration
CLAUDE.md:307:- AI calls wrapped with timeout + single retry; model failure degrades to "agent unavailable, propose manually" — never to an unsafe default
STACK.md:1:# Tech Stack — AI Service Desk Autopilot
STACK.md:13:| **LLM** | **Anthropic Claude** via `@ai-sdk/anthropic` | Opus (plan) + Haiku (cheap probes); bring-your-own key; provider-agnostic — swap a local Ollama/vLLM model for the privacy story |
STACK.md:29:- **Vercel AI SDK 6** — *for the agent loop + human approval gate.* Prebuilt: the multi-step tool-calling loop (`stopWhen: stepCountIs`), the `needsApproval` flag that **pauses a tool before execution and resumes on approve/deny** (the entire approve/edit/reject mechanic), streaming, retries, and MCP client. We write the tools, not the loop.
STACK.md:30:- **assistant-ui** — *for the technician workspace UI.* Prebuilt: chat/thread UI, **tool calls rendered as React components**, **inline human-in-the-loop approval widgets**, generative UI, streaming message state. We skin it; we don't build the approval cards or the live log.
STACK.md:31:- **`@ai-sdk/anthropic`** — *for talking to Claude.* Prebuilt: Anthropic provider, tool-use wiring, model routing (swap Opus↔Haiku in one line), caching.
STACK.md:32:- **Zod** — *for tool/IO schemas.* Prebuilt: runtime validation + TS types for every tool argument and the final activity object — the model is forced to emit valid structured output.
STACK.md:33:- **ssh2** — *for reaching the VM.* Prebuilt: SSH transport, key-based auth, `exec` with streams, timeouts. We add the output cap + safety gate around it.
STACK.md:34:- **tree-sitter-bash / bash-parser** — *for the safety layer's parser.* Prebuilt: a real shell AST (pipelines, redirects, command substitution) so we match on normalized tokens, not brittle raw regex.
STACK.md:35:- **Secretlint** — *for secret protection.* Prebuilt: a library of secret detectors (keys, tokens, PEM) we run over command output before it hits the log/UI/activity — plus a CI mode.
STACK.md:36:- **Langfuse** — *for observability + eval.* Prebuilt: full trace tree (prompts, tool calls, costs), an LLM-as-judge eval runner, and datasets — debug the agent and score it.
STACK.md:37:- **Evalite** — *for the grader-mirror + generalization tests.* Prebuilt: a Vitest-style eval harness (datasets, scorers, watch mode) to run the agent against scenarios and score fix/persistence/safety — run the rubric against ourselves.
STACK.md:38:- **gitleaks** — *for the repo secret scan.* Prebuilt: the exact scan the judges run, as a pre-commit/CI gate so nothing leaks.
STACK.md:39:- **shadcn/ui + Tailwind** — *for the rest of the UI.* Prebuilt: accessible components (tables, cards, badges, dialogs) for the ticket list/detail/audit views.
STACK.md:43:1. **Safety layer** — `classify()` (DENY/CONFIRM/ALLOW) + `redact()`. *(20 pts + hard-fail immunity.)*
backend/Dockerfile:12:# (docker-compose) inherits node ownership — otherwise Docker creates the volume
backend/src/ai/orchestrator.ts:32:// technician needs the EXIT CODE and STDERR, not just stdout — many failures
backend/src/ai/orchestrator.ts:189:      // executor) — audit it and stay in WAITING_FOR_APPROVAL so they can retry.
backend/src/ai/orchestrator.ts:260:      // to TRIAGING in the PERSISTED phase — emitting phaseEffect here is what
backend/src/ai/orchestrator.ts:348:// worked). Persisted as a system observation (same mechanism as stepCount) —
backend/src/ai/orchestrator.ts:403:        // emits via the emitEvent case below — not double-emitted here.)
backend/src/ai/orchestrator.ts:465:          // Dummy proposal — reducer will short-circuit to WAITING_FOR_ACTIVITY_REVIEW
backend/src/ai/orchestrator.ts:486:          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
backend/src/ai/orchestrator.ts:541:          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
backend/src/ai/orchestrator.ts:549:          // persisted phase is updated — just apply its effects and return.
backend/src/ai/orchestrator.ts:582:          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
backend/src/ai/orchestrator.ts:605:      // a technician deciding "I'm sure enough — fix it" vs "keep looking".
backend/src/ai/orchestrator.ts:613:          ticketDescription: `Ticket #${currentState.ticketId} — system: ${currentState.customerSystemId}`,
backend/src/ai/orchestrator.ts:657:// ─── Async driver — public API ─────────────────────────────────────────────────
backend/src/ai/orchestrator.ts:664:  // executor — constructed lazily below ONLY when a command actually executes,
backend/src/ai/prompts.ts:9:Role: problem_analyzer — diagnostics.
backend/src/ai/prompts.ts:41:Role: customer_system_analyzer — system context establishment.
backend/src/ai/prompts.ts:62:Role: problem_solver — fix planner.
backend/src/ai/prompts.ts:87:Role: activity_log_generator — ERP activity report drafter.
backend/src/ai/prompts.ts:97:  and observations; if not yet confirmed, state "root cause not confirmed — insufficient evidence"
backend/src/ai/prompts.ts:101:  array, one per line, each with its exit code — do not reference any command not present in
backend/src/ai/prompts.ts:103:- validationResult: the outcome of the validation step — whether the fix was verified, likely
backend/src/ai/prompts.ts:112:Role: validator — fix validation.
backend/src/ai/prompts.ts:121:- persistenceCheck: the result of a persistence probe — confirm the fix survives a restart \
backend/src/ai/prompts.ts:122:  (e.g. "systemctl restart <svc> succeeded and benefit test still passed") — or null if \
backend/src/ai/prompts.ts:134:The customer-benefit test MUST be a functional proof — for example: an HTTP endpoint returns \
backend/src/ai/tools/audit-tools.ts:1:// Audit read tools for model context — implemented in Phase 5
backend/src/ai/tools/phoenix-tools.ts:1:// Phoenix read tools for model context — implemented in Phase 2
backend/src/ai/tools/safety-tools.ts:1:// Safety classification tools — implemented in Phase 3
backend/src/ai/tools/ssh-tools.ts:1:// SSH tools — proposeSshCommand only; execution is backend-only (never a model tool).
backend/src/ai/tools/ssh-tools.ts:3:// (ARCHITECTURE.md §A1). It is intentionally NOT imported in this file — the
backend/src/ai/tools/ssh-tools.ts:14:    'This does NOT execute the command — the technician reviews, may edit, and approves it first.',
backend/src/app.ts:20:// Open CORS — intentional for this single-machine local tool (ARCHITECTURE.md §10)
backend/src/env.ts:48:    // Message contains the variable NAME only — never the value — so secrets
backend/src/env.ts:59:// side effects — pure helpers (parseEnv/resolveClientMode/isMockMode) and the
backend/src/index.ts:15:// (SQLite audit log, SSH sessions) land in later phases — an interrupted write
backend/src/phoenix/client.ts:143:    // Only GET is auto-retried; POST/PATCH are not (idempotency — see fetchWithRetry).
backend/src/phoenix/client.ts:147:    // status and duration only — NEVER the token, headers, or body.
backend/src/phoenix/types.ts:19:// Tolerate (strip) unknown fields — see SystemInfoSchema rationale. A real ERP
backend/src/phoenix/types.ts:34:// Tolerate (strip) unknown fields — see SystemInfoSchema rationale.
backend/src/routes/runs.ts:67:  // Split on ':' in advance() at orchestrator.ts:576 — no protocol prefix
backend/src/safety/classifier.ts:4:// Matches must be anchored — a command is only SAFE_READ_ONLY if it clearly
backend/src/safety/classifier.ts:7:  // System info — no-arg or fixed-flag commands
backend/src/safety/classifier.ts:21:  // journalctl — read variants
backend/src/safety/classifier.ts:26:  // File reads — non-secret paths only; secret-path rejection handled in policy
backend/src/safety/classifier.ts:52:  // own — never award SAFE_READ_ONLY / LOW_RISK_CHANGE to a command whose true
backend/src/safety/classifier.ts:58:  //    cannot know what the command actually targets — refuse to lower the risk.
backend/src/safety/command-policy.ts:92:  // routine, legitimate permission repair — blocking it would cripple
backend/src/safety/command-policy.ts:97:    // 777 (world-writable) is never a correct fix — recursive or not.
backend/src/safety/command-policy.ts:99:    reason: 'chmod 777 (world-writable) is forbidden — use a least-privilege mode',
backend/src/safety/command-policy.ts:120:    // Recursive chmod/chown under /usr — except the /usr/local app prefix.
backend/src/safety/command-policy.ts:177:    // python -c, perl/ruby/lua -e, node -e/-p/--eval, php -r — arbitrary code.
backend/src/safety/command-policy.ts:184:    // awk/gawk/mawk system()/cmd-pipe — a classic GTFOBins exec escape that hides
backend/src/safety/command-policy.ts:230:    // Block printenv and bare env outright — they can dump all env vars including secrets
backend/src/safety/command-policy.ts:305:    // Block all nc/netcat/ncat usage — redirect, pipe, listener, and -e forms
backend/src/safety/command-policy.ts:307:    reason: 'Netcat is forbidden — use curl for probes',
backend/src/safety/command-policy.ts:312:    // diagnostic use here — use curl/ss for probes.
backend/src/safety/command-policy.ts:314:    reason: 'socat (reverse/bind shells, tunnels) is forbidden — use curl for probes',
backend/src/safety/command-policy.ts:353:// This is deliberately simple — no full shell parse, just enough to catch
backend/src/safety/command-policy.ts:356:  // Split on ||, &&, ;, and | — order matters: check two-char ops first
backend/src/safety/command-policy.ts:375:  //    Normalisation is detection-only — the original command is what executes.
backend/src/safety/command-policy.ts:405:      reason: 'Command contains unresolvable subshell or variable — blocked conservatively',
backend/src/safety/command-policy.ts:428:  // No blocklist match — classify the command
backend/src/safety/redaction.ts:12:    // Match from BEGIN to END (when present) or to end-of-string — handles truncated keys at 16 KB cap
backend/src/safety/redaction.ts:73:    // key, credential, auth) — catches compound names like phoenix_token, ssh_key.
backend/src/ssh/client.ts:1:// SSH connection client — fresh key-authenticated connection with a connect
backend/src/ssh/client.ts:40:      // Message names the failure only — never the key path or value (G-secret).
backend/src/ssh/executor.ts:1:// SSH executor — runs ONE approved command on the target VM and returns a
backend/src/ssh/executor.ts:11:// Reuse the redaction cap as the per-stream output cap (16 KB) — a single
backend/src/ssh/executor.ts:37:// plus a signal name. Encode it the way bash itself does — exit = 128 + signum —
backend/src/ssh/executor.ts:83:    // Kill the channel and resolve with timedOut=true on overrun — never hang.
backend/src/ssh/executor.ts:117:      // `wc`) blocks forever waiting for input and only resolves at the 30s kill —
backend/src/ssh/executor.ts:126:// `sudo -n true` never prompts; a non-zero result means sudo is unavailable —
backend/src/ssh/factory.ts:1:// SSH executor factory — selects the mock or real executor from the resolved
backend/src/ssh/mock.ts:1:// Mock SSH executor — no ssh2 dependency. Used for offline demo and CI.
backend/src/store/db.ts:153:        // Naive comma-splitting breaks on COALESCE(?, col) — its internal comma
backend/src/store/db.ts:242:    // Surface WHY SQLite failed AND that the fallback is EPHEMERAL — a silent
backend/src/store/db.ts:247:      `[store] SQLite unavailable (${reason}) — falling back to an IN-MEMORY store. ` +
backend/src/tests/activity.test.ts:80:  it('Test 2 (phase guard — too early): returns 409 for LOADED_CONTEXT run', async () => {
backend/src/tests/app.test.ts:20:describe('errorHandler (regression: must not leak internal error text — see CLAUDE.md anti-patterns)', () => {
backend/src/tests/mock-phoenix.test.ts:91:    it('returns a shallow copy — does not mutate MOCK_TICKETS', async () => {
backend/src/tests/orchestrator.test.ts:1:// Orchestrator tests: mocked SSH + model — full happy path + reject path
backend/src/tests/orchestrator.test.ts:598:// ─── Integration tests — async driver ────────────────────────────────────────
backend/src/tests/orchestrator.test.ts:625:describe('orchestrator driver — integration', () => {
backend/src/tests/orchestrator.test.ts:652:  it('Test 1 — happy path TRIAGING → WAITING_FOR_APPROVAL', async () => {
backend/src/tests/orchestrator.test.ts:670:    // Verify validateCommandAgainstPolicy was applied — approval row carries the proposed command
backend/src/tests/orchestrator.test.ts:675:  it('Test 2 — blocked command loops back to TRIAGING', async () => {
backend/src/tests/orchestrator.test.ts:700:  it('Test 3 — rejection returns to TRIAGING', async () => {
backend/src/tests/orchestrator.test.ts:715:  it('Test 4 — approval triggers execution and OBSERVING', async () => {
backend/src/tests/orchestrator.test.ts:740:      new MockSshExecutor(), // inject mock — no env/real-SSH dependency in tests
backend/src/tests/orchestrator.test.ts:764:  it('Test 5 — max-steps cap', async () => {
backend/src/tests/orchestrator.test.ts:784:  it('Test 6 — agent failure degrades gracefully', async () => {
backend/src/tests/orchestrator.test.ts:817:  it('Test 7 — generalisation: agent prompts contain no hardcoded fixture strings', async () => {
backend/src/tests/orchestrator.test.ts:831:    // The mock function body won't contain forbidden strings — the real check is on the prompts above
backend/src/tests/orchestrator.test.ts:837:  // surface — the gate's "re-check after edit" guarantee.
backend/src/tests/orchestrator.test.ts:838:  it('Test 8 — re-gate blocks an edited dangerous command: no execution, audited', async () => {
backend/src/tests/orchestrator.test.ts:871:  it('Test 9 — redaction at the sink: secrets in output never persist raw', async () => {
backend/src/tests/orchestrator.test.ts:909:  // LOOP-PROGRESSION (was the #1 gap — OBSERVING used to stall): after a command
backend/src/tests/orchestrator.test.ts:937:  it('Test 10 — OBSERVING + high-confidence hypothesis → PLANNING_FIX', async () => {
backend/src/tests/orchestrator.test.ts:950:  it('Test 11 — OBSERVING + low-confidence hypothesis → TRIAGING (keep diagnosing)', async () => {
backend/src/tests/orchestrator.test.ts:964:  // evidence must NOT be treated as root cause — require corroborating evidence.
backend/src/tests/orchestrator.test.ts:965:  it('Test 11b — OBSERVING + high confidence but EMPTY evidence → keep diagnosing', async () => {
backend/src/tests/orchestrator.test.ts:973:    expect(state.phase).toBe('TRIAGING'); // not PLANNING_FIX — unsupported high confidence is rejected
backend/src/tests/orchestrator.test.ts:977:  it('Test 12 — observation records exit code and stderr, not only stdout', async () => {
backend/src/tests/orchestrator.test.ts:1011:  it('Test 13 — full loop: an approved FIX is validated before drafting', async () => {
backend/src/tests/phoenix-client.test.ts:184:    it('does not retry on 401 — fetch called exactly once', async () => {
backend/src/tests/phoenix-client.test.ts:191:    it('does not retry on 404 — fetch called exactly once', async () => {
backend/src/tests/phoenix-client.test.ts:198:    it('does NOT retry POST createActivity on network error — fetch called once (no duplicate ERP records)', async () => {
backend/src/tests/phoenix-types.test.ts:240:// (and strip) unknown fields rather than reject — a benign extra field from the
backend/src/tests/runs.test.ts:5:// Force mock mode — no real env or Phoenix needed
backend/src/tests/safety-policy.test.ts:6:describe('safety — policy and classifier', () => {
backend/src/tests/safety-policy.test.ts:10:  describe('blocklist — rm -rf variants', () => {
backend/src/tests/safety-policy.test.ts:24:  describe('blocklist — disk wipe', () => {
backend/src/tests/safety-policy.test.ts:37:  describe('blocklist — shutdown / reboot', () => {
backend/src/tests/safety-policy.test.ts:56:  describe('blocklist — broad chmod/chown', () => {
backend/src/tests/safety-policy.test.ts:69:  describe('blocklist — disable security', () => {
backend/src/tests/safety-policy.test.ts:84:  describe('blocklist — secret exposure', () => {
backend/src/tests/safety-policy.test.ts:96:  describe('blocklist — hide tracks', () => {
backend/src/tests/safety-policy.test.ts:109:  describe('blocklist — exfiltration / remote code', () => {
backend/src/tests/safety-policy.test.ts:122:  describe('blocklist — DB destruction', () => {
backend/src/tests/safety-policy.test.ts:145:  describe('chained commands — dangerous segment blocked', () => {
backend/src/tests/safety-policy.test.ts:170:  describe('obfuscation — still blocked', () => {
backend/src/tests/safety-policy.test.ts:193:  // ─── Targeted safe variants — must NOT be blocked ────────────────────────
backend/src/tests/safety-policy.test.ts:195:  describe('targeted variants — not HIGH_RISK_BLOCKED', () => {
backend/src/tests/safety-policy.test.ts:212:  // ─── Classifier — SAFE_READ_ONLY allowlist ───────────────────────────────
backend/src/tests/safety-policy.test.ts:214:  describe('classifier — SAFE_READ_ONLY allowlist', () => {
backend/src/tests/safety-policy.test.ts:227:  // ─── Classifier — unknown command ────────────────────────────────────────
backend/src/tests/safety-policy.test.ts:250:  describe('audit regression — obfuscation & secret-file bypasses', () => {
backend/src/tests/safety-policy.test.ts:282:  describe('classifier hardening — never SAFE when obfuscated/expanded', () => {
backend/src/tests/safety-policy.test.ts:286:      'cat $SECRETFILE',     // unresolved variable — target unknown
backend/src/tests/safety-policy.test.ts:304:  describe('ops regression — legit recursive permission repairs are allowed', () => {
backend/src/tests/safety-policy.test.ts:322:  describe('ops regression — dangerous chmod/chown still blocked', () => {
backend/src/tests/safety-policy.test.ts:350:  describe('research regression — GTFOBins/LOLBin escapes blocked', () => {
backend/src/tests/safety-redaction.test.ts:4:describe('safety — redaction', () => {
backend/src/tests/safety.test.ts:1:// Safety layer §9 consolidated gate — rubric-C evidence
backend/src/tests/safety.test.ts:11:  // ─── 1. Blocklist — HIGH_RISK_BLOCKED ───────────────────────────────────────
backend/src/tests/safety.test.ts:13:  describe('blocklist — HIGH_RISK_BLOCKED', () => {
backend/src/tests/safety.test.ts:190:  // ─── 3. Targeted variants — not HIGH_RISK_BLOCKED ────────────────────────────
backend/src/tests/safety.test.ts:192:  describe('targeted variants — not blocked', () => {
backend/src/tests/safety.test.ts:218:  // ─── 4. Edited-command recheck — SAFE-05 ────────────────────────────────────
backend/src/tests/safety.test.ts:220:  describe('edited-command recheck — SAFE-05', () => {
backend/src/tests/safety.test.ts:313:  // ─── 6. Allowlist — SAFE_READ_ONLY ──────────────────────────────────────────
backend/src/tests/safety.test.ts:315:  describe('allowlist — SAFE_READ_ONLY', () => {
backend/src/tests/safety.test.ts:331:  // ─── 7. Unknown commands — default MEDIUM ────────────────────────────────────
backend/src/tests/safety.test.ts:333:  describe('unknown commands — default MEDIUM', () => {
backend/src/tests/sse-audit-symmetry.test.ts:55:    // so it is present in the audit log but not emitted on the bus — excluded from
backend/src/tests/sse-audit-symmetry.test.ts:58:    // WAITING_FOR_APPROVAL before any command runs — also excluded from bus assertion.
backend/src/tests/ssh-executor.test.ts:40:// The factory must be self-contained — vi.mock is hoisted before all imports,
backend/src/tests/ssh-executor.test.ts:49:  // When true, the channel never emits 'exit' or 'close' — simulates timeout.
backend/src/tests/ssh-executor.test.ts:57:// after module initialization — safe from the hoist TDZ.
backend/src/tests/ssh-executor.test.ts:85:  // require() is safe inside the factory — it resolves at call time, not hoist time.
backend/src/tests/ssh-executor.test.ts:104:      // mirrors real ssh2 — the exec callback runs first, then stream events
backend/src/tests/ssh-executor.test.ts:117:// Shared SSH target — no real credentials needed; the mock intercepts ssh2.
backend/src/tests/ssh-executor.test.ts:134:  // with no file) must NOT block on input — the executor closes the write half.
backend/src/tests/ssh-executor.test.ts:210:    it('applies caps independently — large stdout does not consume the stderr cap', async () => {
backend/src/tests/ssh-executor.test.ts:242:    it('resolves after timeout fires — does not hang indefinitely', async () => {
backend/src/tests/ssh-executor.test.ts:282:  describe('anti-pattern A1 — executeApprovedCommand must not be a model tool', () => {
backend/src/tests/ssh-executor.test.ts:294:      // Lazy factories — each channel must be created (and its emits scheduled)
backend/src/tests/ssh-executor.test.ts:345:  // single bash -lc argument — including embedded single quotes (awk/sed/grep).
backend/src/tests/ssh-mock.test.ts:48:  describe('fixture lookup — exact command match', () => {
backend/src/tests/ssh-mock.test.ts:59:  describe('fixture lookup — systemctl status', () => {
backend/src/tests/ssh-mock.test.ts:127:  describe('practice loop coverage — fix cycle', () => {
backend/src/tests/ssh-mock.test.ts:149:  describe('practice loop coverage — validation', () => {
backend/src/tests/ssh-tools-guard.test.ts:13:describe('anti-pattern A1 — executeApprovedCommand is never registered as a model tool', () => {
backend/src/tests/store-jsonl.test.ts:4:describe('JSONL adapter — UPDATE with COALESCE', () => {
backend/src/tests/tickets.test.ts:48:  it('filters by status=OPEN — returns only OPEN tickets', async () => {
backend/src/tests/tickets.test.ts:124:describe('Error mapping — PhoenixAuthError → 502', () => {
backend/src/tests/tickets.test.ts:139:describe('Error mapping — PhoenixValidationError → 502', () => {
docker-compose.yml:16:      # trail — the C-score source of truth. Named volume (not a bind mount) so
docs/AGENT_PIPELINE.md:1:# AGENT_PIPELINE — the optimal path the agent walks
docs/AGENT_PIPELINE.md:18:4. **On-box truth first.** `man`, `--help`, the actual config, the actual logs beat any external source —
docs/AGENT_PIPELINE.md:27:## Human control surface — the human leads, the AI assists (closes REVIEW G1–G12)
docs/AGENT_PIPELINE.md:30:- **Run their own command** (G1) — type a command directly; it goes through the **same safety classify +
docs/AGENT_PIPELINE.md:33:- **Ask / answer** (G11) — the agent can raise a targeted `agent.question` ("need sudo?", "OK to restart X —
docs/AGENT_PIPELINE.md:35:- **Undo the last change** (G3) — always-available one-click revert via the captured rollback; the revert is
docs/AGENT_PIPELINE.md:38:- **Plan-approval for read-only batches** (G4) — diagnostics are shown as ONE reviewable plan approved with a
docs/AGENT_PIPELINE.md:43:- **G2 — never trust one green light / `is-active`.** Proof is the customer-benefit test, never
docs/AGENT_PIPELINE.md:47:- **G5 — idempotency pre-check.** Before a mutation, probe current state; if already desired, skip + note.
docs/AGENT_PIPELINE.md:48:- **G6 — dry-run / diff before mutate.** Use native dry-run (`nginx -t`, `apt-get -s`, `--dry-run`) and show a
docs/AGENT_PIPELINE.md:50:- **G7 — sudo-limited reads.** Preflight records what's readable; when a probe needs root it can't get, the
docs/AGENT_PIPELINE.md:52:- **G8 — editing secret-bearing files.** Edit in place without printing values; redact the diff; never `cat` a
docs/AGENT_PIPELINE.md:53:  whole secrets file into context — target the specific directive.
docs/AGENT_PIPELINE.md:54:- **G9 — no tunnel vision.** Enumerate *all* anomalies the ground-truth sweep lit up before committing to one;
docs/AGENT_PIPELINE.md:56:- **G10 — fix the cause, not the symptom.** Grader-mirror explicitly asks "did this address the root cause or
docs/AGENT_PIPELINE.md:58:- **G12 — blast-radius before a restart/stop.** Show dependents (`systemctl list-dependencies --reverse`) +
docs/AGENT_PIPELINE.md:69:| 4 | **Plan fix** `PLANNING_FIX` | smallest durable reversible fix | design the minimal change addressing the cause (config on disk + `enable`); **capture rollback** (backup file / record unit state); classify risk | `proposeSshCommand` (the fix, gated), safety `classify` | a minimal, durable, reversible fix + rollback ready | — |
docs/AGENT_PIPELINE.md:75:## When the error is UNKNOWN (no runbook match) — the first-principles method
docs/AGENT_PIPELINE.md:76:This is the generalization engine — the path that actually wins the hidden incidents. Runbooks are a *fast
docs/AGENT_PIPELINE.md:77:path* for recognized classes; when nothing matches, the agent **must not guess** — it falls back to a
docs/AGENT_PIPELINE.md:82:**1 · Enrich first — the ground-truth sweep (full context from the beginning).** Immediately after preflight,
docs/AGENT_PIPELINE.md:101:the **system's authoritative, generic error channels** at each link — they exist for every service:
docs/AGENT_PIPELINE.md:107:— that line is the root-cause candidate.
docs/AGENT_PIPELINE.md:118:a re-orientation — `Known: … · Unknown: … · single most-discriminating next probe: …`. If still not
docs/AGENT_PIPELINE.md:125:what I found, here's my best hypothesis, I stopped to avoid risk" — which still scores and never hard-fails.
docs/AGENT_PIPELINE.md:163:## Command efficiency heuristic (minimise commands — a tie-breaker)
docs/AGENT_PIPELINE.md:166:status X --no-pager` simultaneously reveals active/enabled/last-error — high information per command).
docs/AGENT_PIPELINE.md:169:## Worked example (nginx-down style — illustrative, not hardcoded)
docs/AGENT_PIPELINE.md:212:  lookup; **web search** stays a guarded P2 (advisory-only, outbound-sanitized, audited — see SAFETY_POLICY).
docs/ARCHITECTURE.md:1:# Architecture — Service Desk Autopilot
docs/ARCHITECTURE.md:4:approval, SSH execution, audit, and Phoenix writes. The **AI proposes and interprets** — it never
docs/ARCHITECTURE.md:16:| HTTP API | **Hono** + `@hono/node-server` | Tiny, Web-Standard, first-class `streamSSE`, `zValidator`, `onError`. Rejected Express (no native streaming helper, older middleware model) and Fastify (heavier, plugin ceremony). Rejected keeping **FastAPI** because the agent/tool/safety code and the frontend are both TS — one language, shared Zod types. |
docs/ARCHITECTURE.md:25:### Hono vs Express/Fastify/FastAPI — short version
docs/ARCHITECTURE.md:35:machine we fully understand — and understanding-under-pressure is the real constraint.
docs/ARCHITECTURE.md:39:Validator, Activity Writer) are distinct prompts + output schemas invoked by one orchestrator —
docs/ARCHITECTURE.md:112:rubric — and the agent filenames echo the brief's own `problem_analyzer`/`customer_system_analyzer`/
docs/ARCHITECTURE.md:166:gate **twice** — once at proposal, once after any human edit. Execution only ever happens in
docs/ARCHITECTURE.md:214:validate") rather than looping forever — protects the eval-time tie-breaker and avoids runaway cost.
docs/ARCHITECTURE.md:224:append-only and never delete from it — deleting audit history is itself a hard-fail behaviour.
docs/ARCHITECTURE.md:308:> `problem_solver`, `activity_log_generator`) so the jury — who wrote the case — recognises the
docs/ARCHITECTURE.md:321:**Tool exposure rule (the crux):** the diagnostics/fix agents may call `proposeSshCommand` — a
docs/ARCHITECTURE.md:350:// Backend-only — NOT a model tool:
docs/ARCHITECTURE.md:374:// DiagnosticProposal — diagnosis-first: rank hypotheses with evidence, then ONE command
docs/ARCHITECTURE.md:414:- **`problem_analyzer` (diagnostics):** "Every incident is a **local Linux service problem** — a
docs/ARCHITECTURE.md:415:  service, port, config, disk, permission, log, cron or dependency issue — never kernel/network/
docs/ARCHITECTURE.md:466:- **CORS:** open for local dev (`*`) — single local tool, no cookies, no auth.
docs/ARCHITECTURE.md:469:  `/keys` (Docker) — never inlined, never logged.
docs/ARCHITECTURE.md:473:## 10b. Additions folded from `minam` — human control, reliability hardening, diagnostic depth
docs/ARCHITECTURE.md:478:- `POST /api/runs/:id/manual-command` — human-typed command → same safety classify+redact+audit → executed → fed back as an observation. Emits `manual.command.executed`.
docs/ARCHITECTURE.md:479:- `POST /api/runs/:id/undo` — revert the last change via the captured rollback; re-run the benefit test. Emits `command.undone`.
docs/ARCHITECTURE.md:480:- `POST /api/runs/:id/questions/:qid/answer` + an `agent.question` event — agent→human question channel.
docs/ARCHITECTURE.md:483:**SSH / reliability hardening (counters the documented top failure modes — see RELIABILITY.md §1,§4):**
docs/ARCHITECTURE.md:484:- Run each command via **`bash -lc '<cmd>'`** (login PATH) — defeats the #1 Terminal-Bench failure ("command not in PATH", ~24% of failures). Absolute paths for system binaries.
docs/ARCHITECTURE.md:485:- **`sudo -n`** (non-interactive) — never hang on a TTY password prompt; treat "needs password" as data and surface it.
docs/ARCHITECTURE.md:486:- **Exit code is truth; stderr ≠ failure** — judge success by exit code + the expected signal (many tools write to stderr on success).
docs/ARCHITECTURE.md:487:- **Tool-availability preflight** — the first read-only batch probes OS + which tools exist + sudo capability; the agent then uses only present tools.
docs/ARCHITECTURE.md:488:- **Output budgeting** — store full output in the DB; feed the model a capped **digest** + extracted signal lines (prevents context collapse after ~turn 10). Set `LANG=C` for stable parsing.
docs/ARCHITECTURE.md:490:**`read_local_docs` tool** — on-box `man`/`--help`/`systemctl cat`/config reads (zero egress) so the agent understands unfamiliar services without web search. (Optional guarded web search is P2 — advisory-only, outbound-sanitized, audited.)
docs/ARCHITECTURE.md:497:- **Official techbold case brief** — agent names, incident scope (local Linux services only),
docs/ARCHITECTURE.md:504:- ssh2: https://github.com/mscdex/ssh2 — `Client.exec`, key auth, timeouts.
docs/ARCHITECTURE.md:505:- OpenClaude: https://github.com/Gitlawb/openclaude — pattern: tool-driven loop that pauses on
docs/AUDIT_LOG.md:1:# AUDIT LOG — issues found, repairs, and upgrade considerations per phase
docs/AUDIT_LOG.md:13:> Recurring theme: GSD's per-phase gate is real but exercises the **mock** — several 🔴 faults only bite the
docs/AUDIT_LOG.md:18:## Phase 1 — Repo Foundation  (`gsd/phase-01-repo-foundation` → `main`)
docs/AUDIT_LOG.md:26:| 2 | 🔴 | Couldn't boot offline under `MOCK_MODE` — creds were unconditionally required (broke PLAT-04) | Credentials required **conditionally** via Zod `superRefine` (real mode only) | `e2b216b` |
docs/AUDIT_LOG.md:33:| 9 | 🔴 | Local-dev `.env` not loaded — `dev`/`start` were `tsx src/index.ts` → `pnpm dev` ran unconfigured | `node --env-file-if-exists=../.env --import tsx [--watch] src/index.ts` (built-in loader, zero deps) | `2d4972d` |
docs/AUDIT_LOG.md:36:**Verification:** env + app suites **23/23**; real boot test — backend starts via the new invocation, `GET /health` → `{status:"ok",mode:"mock"}`. Merged to `main` `d01313d`.
docs/AUDIT_LOG.md:37:**Caveat:** graceful shutdown (Windows can't deliver SIGTERM to native node) and the non-root Dockerfile need one `docker compose up` on a Docker host to fully confirm — correct by construction, unverifiable on the dev host.
docs/AUDIT_LOG.md:42:- **Open / to reconcile later:** AI SDK pinned `ai@^4.3.16` (v4) vs docs' v5/v6 — reconcile **before Phase 5** · `.npmrc minimum-release-age=0` weakens pnpm supply-chain age check (deliberate native-build workaround) · frontend `npm` vs `pnpm-workspace` inconsistency.
docs/AUDIT_LOG.md:47:## Phase 2 — ERP Client + Ticket Routes  (`gsd/phase-02-erp-client-ticket-routes` → `main`)
docs/AUDIT_LOG.md:54:| 1 | 🔴 | `tickets.ts` read `env.PHOENIX_API_URL` — undefined after the Phase-1 rename → real `PhoenixClient` got an undefined base URL → **every real Phoenix call broken** (mock tests stayed green) | Fixed to `env.PHOENIX_API_BASE_URL` | `b7261f9` |
docs/AUDIT_LOG.md:57:| 4 | 🟢 | No visibility into ERP calls for live debugging | Redacted request logging: `[phoenix] METHOD path -> status (Nms)` — never token/headers/body | `ede4b12` |
docs/AUDIT_LOG.md:62:- **Strategic (not now):** the client + Zod schemas were hand-written from `phoenix-openapi.yaml`; **OpenAPI codegen** (`openapi-typescript`+`openapi-fetch` / Orval / `openapi-zod-client`) keeps them contract-synced and would have prevented the drift bugs (#1, the `.strict()` choice). Not worth replacing a working, tested client mid-hackathon — use for future/larger API surfaces.
docs/AUDIT_LOG.md:69:## Phase 3 — Safety layer (command policy gate · classifier · redaction)
docs/AUDIT_LOG.md:71:**Audited:** `backend/src/safety/{command-policy,classifier,redaction,risk-levels}.ts` + their tests. Lens: adversarial red-team (treat the gate as an attacker would) + scoring lens (C = safety/audit, 20% — and a single secret-exposure / destructive command auto-approved is a **hard-fail that zeros the incident**).
docs/AUDIT_LOG.md:74:Adversarially proved **15 dangerous commands bypassed** `validateCommandAgainstPolicy` — several classified `SAFE_READ_ONLY` (i.e. auto-approvable while reading secrets). All now `HIGH_RISK_BLOCKED`.
docs/AUDIT_LOG.md:81:**Verification:** added **17 permanent regression tests** (`safety-policy.test.ts` → `audit regression` block) covering every proven bypass; full safety suite **142 → 159 passing**; re-ran the adversarial proof harness — all 15 now blocked, then deleted it. Targeted-safe variants (`chmod 755 /srv/app/uploads`, `systemctl restart nginx`) confirmed still allowed (no over-blocking).
docs/AUDIT_LOG.md:84:- **Declined (over-engineering):** full shell-AST parsing (`bash -n` / tree-sitter) to defeat *every* obfuscation — the strip-and-match approach + "unknown ⇒ MEDIUM, never SAFE" default + mandatory HITL covers the realistic threat surface for graded VMs; a parser is a large dependency + new attack surface for marginal gain.
docs/AUDIT_LOG.md:85:- **Noted, acceptable:** base64/`$(...)`/`eval` indirection isn't decoded — but such commands classify `MEDIUM_RISK_CHANGE` (never auto-approved), so a human still gates them. Documented as the intended backstop, not a hole.
docs/AUDIT_LOG.md:88:### Phase 3 — Deep Audit (test strategy & regression-prevention pass, commit `eeb392b`)
docs/AUDIT_LOG.md:91:**Executive summary.** The safety layer is the cheapest, highest-leverage code in the repo: 4 pure-function modules (~560 LOC) that directly own the C-score (20%) and the hard-fail gates. It is now well-defended at the `validateCommandAgainstPolicy` boundary (166 passing tests) and has no external dependencies, no I/O, and no state — so it is fully unit-testable and deterministic. The one real defect this pass found was a *contract* gap, not a logic gap.
docs/AUDIT_LOG.md:93:**New issue found & fixed — classifier fails open for standalone callers (commit `eeb392b`).**
docs/AUDIT_LOG.md:94:`classifyCommand` is `export`ed and was classifying the **raw** string. Today it is only ever reached *after* the blocklist (inside the gate), so it is safe in the current call graph — but it is a latent landmine for Phase 5/6: the architecture has the orchestrator/approvals route attach a risk badge per command and contemplates an auto-approve tier keyed on `SAFE_READ_ONLY`. Proven (probe): standalone `classifyCommand("cat /etc/sh''adow")` and `classifyCommand("cat $SECRETFILE")` both returned `SAFE_READ_ONLY` → an auto-approve tier would silently run a secret read = C hard-fail. **Fix:** `classifyCommand` now fails safe independently of the gate — unresolved shell expansion (`$VAR`/`${VAR}`/`$()`/`` ` ``) forces `MEDIUM_RISK_CHANGE`, and quotes are stripped before the anchored allowlist match. Clean read-only commands still classify `SAFE_READ_ONLY`. +7 regression tests (159 → 166).
docs/AUDIT_LOG.md:100:4. Unknown verbs and any unresolved expansion classify **≥ MEDIUM** — `classifyCommand` never returns `SAFE`/`LOW` for something it cannot fully see (fail-safe), enforced both at the gate and now standalone.
docs/AUDIT_LOG.md:105:- **No L2 integration test** that the orchestrator/approvals route actually *calls* the gate on the post-edit command (the "re-check after human edit" invariant). Cannot exist yet — orchestrator lands Phase 5/6. **Owner: Phase 6 audit** — add a test that an edited command is re-validated and a blocked edit cannot execute.
docs/AUDIT_LOG.md:109:- *Medium:* regex blocklist is inherently enumerative — a novel obfuscation not yet imagined could pass the gate as MEDIUM (never SAFE) and still requires human approval, so it is a defense-in-depth gap, not a hard-fail. Property-based tests shrink this.
docs/AUDIT_LOG.md:110:- *Low:* `REDACTION_CAP_BYTES` slices by JS string length (UTF-16 code units), not bytes, despite the name — modest miscount on multibyte output, no security impact (cap only ever drops trailing content, which fails safe). Noted; rename deferred.
docs/AUDIT_LOG.md:111:- *Low:* base64/`eval` indirection still undecoded — classifies MEDIUM, human-gated. Accepted.
docs/AUDIT_LOG.md:114:- `fast-check` (property-based testing) — mature, zero-runtime-dep, used widely for exactly this "invariant holds for all inputs" shape. **Adoption justified** for the blocklist; deferred only on time.
docs/AUDIT_LOG.md:115:- `shell-quote` / `tree-sitter-bash` (real shell parsing) — would defeat *all* obfuscation classes, but pulls a parser + new attack surface and is overkill given the MEDIUM-floor + mandatory HITL backstop. **Declined** (consistent with the red-team pass).
docs/AUDIT_LOG.md:116:- Atomic Red Team / GTFOBins as a corpus of LOLBins to seed more blocklist cases — **worth a one-time mining pass** for the hardening sprint; not a dependency.
docs/AUDIT_LOG.md:118:**Verdict.** No feature bloat, no dead code, no premature optimization in the safety layer — it is appropriately minimal for the rubric. One latent contract bug fixed; remaining items are deferred test-depth upgrades, correctly scoped to the phases that introduce their call sites.
docs/AUDIT_LOG.md:120:### Phase 3 — Ops Audit (senior Linux/ERP technician lens, commit `4056445`)
docs/AUDIT_LOG.md:125:**Issue found & repaired — recursive chmod/chown over-block (commit `4056445`).**
docs/AUDIT_LOG.md:126:Proven by probe: **6 of the most common legitimate permission repairs were `HIGH_RISK_BLOCKED`** (not even human-approvable), including `chown -R www-data:www-data /var/www/html`, `chown -R nginx:nginx /var/lib/myapp`, `chmod -R 755 /var/www/html`, `chown -R user:user /home/user/app`. The old rules blocked *any* recursive chmod/chown under `/var|/home|/srv|/usr` — but application code/data lives exactly there. Per the hackathon hard-fail list, only `chmod 777` is a hard-fail; the rest is normal expert work. **Fix:** reworked to block only the genuinely dangerous shapes — `777` anywhere; chmod/chown on `/` or a *bare* top-level dir; recursive chmod/chown under a critical system tree (`/etc /boot /bin /sbin /lib /root /dev /proc /sys`, `/usr` except `/usr/local`), anchored to the top-level path component so `/var/lib/<app>` is not falsely caught by the `/lib/` substring. App-path repairs now classify `MEDIUM` (human-approved, never auto-run). **+22 regression tests** (allowed-repairs + dangerous-still-blocked); suite 166 → 188; all prior hard-fail blocks re-verified intact.
docs/AUDIT_LOG.md:129:- **Disk-full via logs has no *destructive* automated path — by design.** `truncate`/`> /var/log/...`/`rm /var/log/...`/`journalctl --vacuum-*` are all blocked as the log-wiping hard-fail. This is correct for the rubric, but it means the *destructive* expert remedy is unavailable. The **non-destructive** expert remedies survive and are the intended path: `logrotate -f`, `gzip <log>`, `mv <log> <other-vol>` (all allowed → MEDIUM). Operators/demo must know to use these; a pure "journal is full" incident may require a human acting outside the tool.
docs/AUDIT_LOG.md:136:- *Hang on follow commands:* `tail -f`, `journalctl -f`, `ping` (no `-c`) never return — needs the Phase-4 per-command timeout. **Carry-forward to Phase 4.**
docs/AUDIT_LOG.md:137:- *Validation after fix:* the gate doesn't verify a repair worked (`systemctl is-active`, re-curl) — that's the validator agent's job. **Carry-forward to Phase 5.**
docs/AUDIT_LOG.md:141:### Phase 3 — Research / Reuse Audit (OSINT & adjacent-knowledge lens, commit `8242bd9`)
docs/AUDIT_LOG.md:142:Fourth and final Phase-3 pass with the *"discover everything that already exists before building"* lens — treat the custom safety layer as guilty until proven necessary, and borrow accumulated industry/community knowledge instead of re-deriving it.
docs/AUDIT_LOG.md:144:**Is the custom gate justified, or reinvention?** *Justified — with external validation.* The pattern we built (a deterministic runtime layer that intercepts every proposed command and returns permit / deny / defer-to-human) is exactly what the 2025 agent-security literature and the **OWASP Agentic Top 10** converge on ("runtime enforcement intercepts tool calls before execution… deterministic permit/deny/defer; prompt guardrails are suggestions, not enforcement"). The **allowlist-for-auto-approve + blocklist-for-deny + MEDIUM-default** shape matches the documented least-privilege best practice for restricted command execution (RHEL sudo hardening: "allowing specific commands is more secure than disallowing"). Off-the-shelf alternatives were considered and **declined for the hackathon**: restricted shells (`rbash`) are trivially escaped; full sandboxing (seccomp/AppArmor/SELinux/`bubblewrap`/Firejail) governs *our* process, not commands on the *remote* VM, so they don't fit the SSH-executor model; a generic policy engine (OPA/Rego) is real infra overhead for ~25 rules. **Conclusion: keep the custom gate; reuse the corpora, not a framework.**
docs/AUDIT_LOG.md:146:**Issues found & repaired — borrowed-corpus gaps (commit `8242bd9`).** The deny-list caught wrapped commands only when the *inner* payload was itself blocklisted (substring matching); a tool-based exec escape with a benign-looking inner command slipped through to MEDIUM. Sourced concrete gaps from **GTFOBins** (curated LOLBin corpus), **MITRE ATT&CK T1059** (command/scripting interpreter), and **gitleaks/trufflehog** secret rulesets:
docs/AUDIT_LOG.md:147:- `socat` (reverse/bind shells, tunnels) — was MEDIUM → now blocked wholesale (like `nc`).
docs/AUDIT_LOG.md:148:- `node -e/-p/--eval/--print`, `php -r`, `lua -e` — added to the inline-interpreter rule next to python/perl/ruby.
docs/AUDIT_LOG.md:149:- `awk/gawk/mawk 'BEGIN{system(...)}'` — the canonical GTFOBins exec escape; was MEDIUM → blocked.
docs/AUDIT_LOG.md:150:- `/dev/udp/` reverse shell — literal-rule symmetry with `/dev/tcp/`.
docs/AUDIT_LOG.md:151:- **Redaction:** standalone **JWT** (`eyJ….eyJ….sig`) — borrowed gitleaks pattern; catches a bare token in a log/config not prefixed by `Bearer`.
docs/AUDIT_LOG.md:155:- **Adopt a secret-scanning lib as a dependency** (gitleaks/detect-secrets) rather than hand-rolled regexes — declined: those are CLI/Go tools or heavier Python deps; we *borrowed the high-value patterns* (JWT) instead, keeping the layer dependency-free and deterministic. Revisit only if secret surface grows.
docs/AUDIT_LOG.md:156:- **`shell-quote`/`tree-sitter-bash` real parsing** — re-confirmed declined (consistent across all four passes): parser + attack surface for marginal gain over strip-and-match + MEDIUM-floor + HITL.
docs/AUDIT_LOG.md:157:- **OPA/Rego, restricted shells, seccomp/AppArmor/Firejail** — wrong layer or disproportionate (see above).
docs/AUDIT_LOG.md:159:**Adjacent-knowledge borrowed (Nebenwissenschaft):** *Reliability eng.* — fail-safe defaults (unknown ⇒ MEDIUM, never SAFE) = the "fail closed" principle. *Cybersecurity* — defense-in-depth (deny-list ∧ classifier ∧ redaction ∧ HITL), least privilege, LOLBin/living-off-the-land awareness. *Decision science / HCI* — the four-tier risk ladder mirrors graded-autonomy / human-in-the-loop escalation; the residual `sudo`-demotes-to-MEDIUM friction is a deliberate safety-over-throughput trade. *Auditability* — append-only redacted trail = traceability/explainability for the C-score.
docs/AUDIT_LOG.md:161:**Strategic recommendations (ranked):** (1) *Quick win, deferred:* property-based fuzz over the deny-list (`fast-check`) — already logged. (2) *Quick win:* periodically diff our rules against the GTFOBins list as a corpus (one-time mining done this pass; re-mine if rules grow). (3) *Strategic:* if an unattended/auto-approve tier ever lands (R0), revisit `sudo`-stripping and a tighter SAFE allowlist — tie to the mentor R0 answer. (4) *Hidden risk:* the gate governs the *command*, not the *remote effect* — a human still owns the blast radius; keep the approval UX showing the matched rule + risk tier so approvals are informed.
docs/AUDIT_LOG.md:169:# Phase 4 — SSH executor (`ssh/{client,executor,factory,mock,types}.ts`, `ai/tools/ssh-tools.ts`)
docs/AUDIT_LOG.md:173:### Headline finding — the phase was incomplete (executor unimplemented)
docs/AUDIT_LOG.md:174:The branch shipped the executor **test spec** (`ssh-executor.test.ts`, 244 lines — excellent) and the **mock** (`mock.ts`, 14/14 green), but `ssh/executor.ts` was still a stub (`export {}`). The phase's own `04-04-SUMMARY` admitted it: *"271 pass, 13 fail — pre-existing RED state from the 04-02 executor stub."* This is the single critical-path component for the B-score (acting on a real VM); without it only mock mode works. Plans `04-03` (preflight) and `04-05` (tools factory) were also unexecuted (no summaries). **Decision (with user): implement the full phase + land on `main` with no regressions.**
docs/AUDIT_LOG.md:177:`types.ts` clean (`CommandResult` matches ARCHITECTURE §3; `SshConnectionError` with ES5 prototype fix). `mock.ts` solid — 11 fixtures driving the full diagnose→fix→validate loop, zero `ssh2` import, identical interface to real. The RED spec encoded the right contract (5-key result, per-stream 16 KB cap, 30 s timeout, `bash -lc`, `LANG=C`, anti-pattern A1 guard).
docs/AUDIT_LOG.md:180:1. **🔴 Real executor missing → implemented.** `ssh/client.ts` `openSshConnection()` (fresh key-auth, 10 s connect timeout, `SshConnectionError`, key path/bytes never logged, tolerant key read). `ssh/executor.ts` `executeApprovedCommand()` (`bash -lc` wrap + `LANG=C`, per-stream 16 KB cap = `REDACTION_CAP_BYTES`, 30 s timeout that **kills the channel and resolves `timedOut:true` — never hangs**, exact 5-key shape, returns RAW output so the caller redacts) + `runPreflight()` (`sudo -n true`/`LANG=C`/PATH; sudo failure **non-fatal** per G7) + `RealSshExecutor`/`createRealSshExecutor`. `ssh/factory.ts` `createSshExecutor()` selects mock/real via `resolveClientMode('ssh')` (mirrors phoenix). `ai/tools/ssh-tools.ts` `proposeSshCommand` tool with **no `execute`** — `executeApprovedCommand` intentionally absent here (anti-pattern A1).
docs/AUDIT_LOG.md:189:- **Carry-forward now partly addressed:** the 30 s channel-kill timeout resolves the earlier "follow/stream commands hang" risk (`tail -f`, `journalctl -f`, `ping` without `-c`) at the executor level — they now time out cleanly rather than hanging the run.
docs/AUDIT_LOG.md:190:- **Still open for Phase 5/6:** the executor returns RAW output **by design** — the orchestrator MUST call `redactSecrets()` before audit/SSE/UI/model (the redaction-at-sink invariant); add an integration test for that when the call site lands. Bounded *tail* reads should be steered by the agent prompt (a `cat` of a huge log returns a truncated head).
docs/AUDIT_LOG.md:192:### Phase 4 — Deep Audit (test strategy & regression-prevention pass, commit `1e6b804`)
docs/AUDIT_LOG.md:195:**Executive summary.** The executor is small (~125 LOC), pure-logic except the ssh2 boundary, and on the **B-score critical path** (it is what acts on a real VM). No production defect found this pass — the implementation matches the spec and the architecture (raw output, caller redacts; never a model tool; fail-safe timeout). The real gap was in the **regression net**: the contract was under-pinned by tests, so future edits could silently break remote execution.
docs/AUDIT_LOG.md:198:1. `wrapCommand` produces a single, correctly single-quoted `bash -lc '<cmd>'` argument for ALL inputs (incl. embedded `'`), and never expands/strips metacharacters at wrap time — a broken wrap silently corrupts *every* remote command.
docs/AUDIT_LOG.md:207:- *Connect-timeout (10 s) path* not directly tested (only the 30 s command timeout). Low value — same timer mechanism; deferred.
docs/AUDIT_LOG.md:208:- *Mid-command connection drop resolves only after the 30 s backstop* rather than promptly. Minor UX, safe; could add a client `error`/`close` listener in `executeApprovedCommand` to finalize early — **deferred** (not worth the added edge surface pre-freeze).
docs/AUDIT_LOG.md:209:- *Redaction-at-sink* and *gate-recheck-on-edit* are orchestrator-level (Phase 5/6) — already logged as carry-forwards; no call site exists yet.
docs/AUDIT_LOG.md:210:- *Real ssh2 against a live VM* — the ultimate integration test; covered by the planned `docker compose` + real-VM smoke, not unit tests.
docs/AUDIT_LOG.md:213:- *`fast-check` property tests for `wrapCommand`* — ideal in theory (round-trip through a shell), but needs a shell to verify and `fast-check` is already a logged carry-forward; the targeted example cases cover the real failure modes. Declined for now.
docs/AUDIT_LOG.md:214:- *Re-running the safety gate inside the executor* (belt-and-suspenders) — the gate already runs at proposal and post-edit; a third check is the wrong layer and could mask an upstream bug. Flagged for the orchestrator phase as a *consideration*, not implemented.
docs/AUDIT_LOG.md:215:- *Snapshot/golden-master of command output* — output is environment-dependent; per-field asserts are more meaningful.
docs/AUDIT_LOG.md:219:### Phase 4 — Ops Audit (veteran Linux sysadmin / SSH-execution reality lens, commit `94caa7c`)
docs/AUDIT_LOG.md:222:**Manual-process baseline.** A technician SSHing into a broken box runs one non-interactive command at a time, reads stdout/stderr + exit code, and — critically — *never blocks on input*: if a command sits waiting (forgot a filename, a tool that reads stdin), they hit Ctrl-D/Ctrl-C and move on. Automation must reproduce that "no input, EOF immediately" behaviour.
docs/AUDIT_LOG.md:224:**Issue found & repaired — stdin left open (commit `94caa7c`).** The executor wired the read side (stdout/stderr/exit/close) but never closed the **write (stdin) half** of the channel. Real-world consequence: any command that reads stdin — `grep pattern` with no file, bare `cat`, `sort`, `wc`, `sed 'expr'` — blocks waiting for input and only resolves at the **30 s kill**, reporting `timedOut` for what is really a "forgot the filename" slip. On a timed grading run that burns 30 s per slip and produces a misleading result. **Fix:** call `channel.end()` immediately after attaching listeners (we never send stdin) so the remote command gets EOF and exits at once; the read half stays open. +1 regression test; the mock channel gained `end()` to mirror the real `ClientChannel`.
docs/AUDIT_LOG.md:227:- **No PTY** — correct: prevents interactive hangs, and makes a stray `sudo` (without `-n`) fail fast with "no tty present" instead of hanging. Combined with the new stdin-EOF, the executor cannot hang on input.
docs/AUDIT_LOG.md:228:- **`bash -lc` (login shell)** — chosen for stable PATH; accepted. *Minor risk noted:* a misbehaving `/etc/profile.d/*` that echoes to stdout could prepend noise to command output. Real servers rarely do this for non-interactive shells; not worth switching to `bash -c` (which would lose PATH). Documented, not changed.
docs/AUDIT_LOG.md:229:- **No `pipefail`** — `a | b` reports `b`'s exit, so a failed `grep | head` can look successful. Standard shell behaviour; the agent proposes mostly single commands. Left as-is (adding `set -o pipefail` could surprise). Noted.
docs/AUDIT_LOG.md:230:- **Host-key verification disabled** (ssh2 default) — acceptable and *desirable* for ephemeral graded VMs (avoids "host key changed" failures); the SSH key + token stay server-side. Accept for the hackathon threat model.
docs/AUDIT_LOG.md:231:- **Passphrase-protected keys / keepalive** — not supported / not set; fine for the provided `.pem` and ≤30 s commands. Noted.
docs/AUDIT_LOG.md:235:- *Profile noise / pipefail* (above) — low likelihood; surfaced for awareness.
docs/AUDIT_LOG.md:236:- *Agent must use batch flags* (`--no-pager`, `ps`/`top -b`) since there's no PTY — steer in the Phase-5 agent prompt (carry-forward).
docs/AUDIT_LOG.md:240:### Phase 4 — Research / Reuse Audit (OSINT & adjacent-knowledge lens, commit `ec77a1d`)
docs/AUDIT_LOG.md:241:Fourth and final Phase-4 pass: *"what does the SSH-execution domain already know, and is `ssh2` + a hand-rolled executor the right build?"* — guilty-until-proven-necessary.
docs/AUDIT_LOG.md:243:**Is the custom executor justified, or reinvention?** *Justified.* `ssh2` (mscdex) is the de-facto pure-JS SSH client for Node; the alternatives are thin wrappers over it. **node-ssh** (steelbrain) was the strongest reuse candidate — a Promise wrapper whose `execCommand` returns `{stdout, stderr, code, signal}` — but it has **no built-in per-command timeout or output cap**, which are our two hardest requirements; adopting it would mean re-adding that exact logic plus a dependency, for no net gain. `ssh2-exec`/`node-ssh2-exec` are similar. **Verdict: keep `ssh2` + our executor; borrow the one piece of knowledge node-ssh encodes that we missed (signal capture).**
docs/AUDIT_LOG.md:245:**Issue found & repaired — signal-terminated exits lost (commit `ec77a1d`).** Research of `ssh2`'s API + RFC 4254 §6.10 confirmed the `'exit'` event fires as `(null, signalName, didCoreDump, description)` when the remote process is **killed by a signal**. Our handler only kept numeric codes, so an **OOM-kill (SIGKILL) or segfault (SIGSEGV)** — a top Linux incident class ("the service keeps getting OOM-killed") — surfaced as a meaningless `exitCode -1`. **Fix:** encode the signal the way `bash` itself does — `exitCode = 128 + signum` — so SIGKILL→**137**, SIGSEGV→**139**, SIGTERM→**143**. Chosen over adding a `signal` field because it preserves the fixed 5-key result contract (ARCHITECTURE §3) and 137/139 are exactly what a technician reads off a shell. +2 regression tests; suite 357 → 359, `tsc` clean.
docs/AUDIT_LOG.md:248:- **node-ssh / ssh2-promise** — wrap the same `ssh2`; lack timeout+cap; we'd reimplement those anyway. Borrowed the signal-capture lesson instead. Declined as a dependency.
docs/AUDIT_LOG.md:249:- **`keepaliveInterval` for long commands** (ssh2 supports it; default off) — our commands are ≤30 s and the 30 s timeout backstops a stall; enabling it risks spurious "keepalive timeout" errors (ssh2 issue #367). Declined for v1; revisit only if a command budget exceeds a network idle window.
docs/AUDIT_LOG.md:250:- **`channel.close()` after hitting the output cap** to stop receiving early — saves bandwidth on a runaway `cat`, but output is already bounded by the command and the 30 s timeout; marginal. Deferred.
docs/AUDIT_LOG.md:251:- **`set -o pipefail` in the wrap** — would make `a | b` report a failed `a`; but it changes shell semantics and the agent proposes mostly single commands. Declined; noted.
docs/AUDIT_LOG.md:253:**Adjacent-knowledge borrowed (Nebenwissenschaft):** *SSH protocol standard* (RFC 4251-4254): channel `exit-status` vs `exit-signal` messages — the basis of the fix. *Failure analysis / RCA:* 137/139/143 are the canonical fingerprints operators pattern-match (OOM vs segfault vs graceful-term) — surfacing them feeds the diagnosis loop. *Reliability eng.:* the known ssh2 gotcha "remote process may survive `.end()`/`.signal('KILL')`" (issues #382/#513) — accepted because our model already reports `timedOut` and the run advances.
docs/AUDIT_LOG.md:255:**Strategic recommendations (ranked):** (1) *Done:* signal capture. (2) *Phase 5:* steer the agent to batch flags + bounded reads (already logged). (3) *Strategic / real-VM:* the one thing no unit test can prove is behaviour against a live sshd — schedule the `docker compose` + real-VM smoke before freeze (the recurring "works-in-mock, breaks-on-real" risk). (4) *If commands ever exceed ~30 s:* revisit keepalive + a longer per-command budget.
docs/AUDIT_LOG.md:263:# Phase 5 — Agent loop & orchestrator (`ai/orchestrator.ts` · agents · tools · `ai/types.ts`)
docs/AUDIT_LOG.md:270:### Headline finding — parallel divergence on Phase 4
docs/AUDIT_LOG.md:274:**🔴 Orchestrator could not run against a real VM.** `advance()` hard-wired `new MockSshExecutor()` and a hardcoded `username:'azureuser'` / `privateKeyPath:'/keys/id_rsa'` — so the real agent loop *always* used the mock and ignored config. Classic "works-in-mock, breaks-on-real" at the orchestration layer (would zero the B-score on real VMs). **Fix:** dependency-injected executor defaulting to `createSshExecutor()` (env-selected mock|real via `resolveClientMode`), constructed **lazily** only on the execute path so non-executing transitions never touch env; SSH user/key now read from `env` (`SSH_USERNAME` / `SSH_PRIVATE_KEY_PATH`, documented defaults). The one execute-path test injects a `MockSshExecutor`.
docs/AUDIT_LOG.md:277:- **Safety gate re-runs before execution** — `advance()` calls `validateCommandAgainstPolicy(finalCommand)` on `command_approved` and blocks if denied (resolves the **gate-recheck-on-edit** carry-forward).
docs/AUDIT_LOG.md:278:- **Redaction at the sink** — `redactSecrets()` applied to stdout/stderr before `appendCommandResult` (resolves the **redaction-at-sink** carry-forward).
docs/AUDIT_LOG.md:279:- **Bounded loop** — `MAX_STEPS = 12` cap prevents runaway agent loops.
docs/AUDIT_LOG.md:280:- **AI SDK v4** retained deliberately (clean mock-model for offline/CI) — resolves the **v4-vs-v5** carry-forward as "stay on v4."
docs/AUDIT_LOG.md:286:Domain/test-strategy/research lenses on the agents + prompts + state machine not yet run (this was the land-and-reconcile check). Candidate areas: agent prompt robustness (batch-flag steering, bounded reads — see carry-forwards), state-machine invariants (valid transitions only, no orphan phases), per-run concurrency/locking, and the activity-draft-from-audit-trail-only rule.
docs/AUDIT_LOG.md:288:### Phase 5 — Deep Audit (test strategy & regression-prevention pass, commit `739cf89`)
docs/AUDIT_LOG.md:294:1. **Blocked FIX command — unaudited + phase desync.** `reduce()` had no `command_blocked` case for `PLANNING_FIX`, so it emitted *no* effects: the block wasn't audited AND `updateRunPhase` never fired — the persisted phase stayed `PLANNING_FIX` while the returned state claimed `TRIAGING` (a desync that re-runs the solver on the next `advance()`). Added the case (audit + `phaseEffect(TRIAGING)`); the driver now just applies the reducer's effects.
docs/AUDIT_LOG.md:295:2. **Blocked re-gated edit — unaudited.** The most security-sensitive path: a technician edits an approved command to something dangerous → `advance()` correctly refuses to execute, but `reduce(WAITING_FOR_APPROVAL, command_blocked)` was unhandled → the block went unrecorded. Now audited; run stays `WAITING_FOR_APPROVAL` to retry.
docs/AUDIT_LOG.md:299:**🔴 Top gap found → ✅ REPAIRED (commit `59feb0a`):** the **diagnostic loop stalled at `OBSERVING`**. After a command executed the run sat in `OBSERVING`, but `agentDispatch` had **no `OBSERVING` case**, so nothing autonomously decided `root_cause_found` vs `more_diagnosis_needed` — the autonomous iterate-to-root-cause loop (core B-score) could not progress past the first observation. **Fix:** `agentDispatch` now handles `OBSERVING` by re-running the `problem-analyzer` on the accumulated observations and deciding from the **top-hypothesis confidence** — `≥ ROOT_CAUSE_CONFIDENCE_THRESHOLD` (0.8) → `root_cause_found` → `PLANNING_FIX`; else `more_diagnosis_needed` → `TRIAGING` (propose the next probe). Reuses the existing analyzer (no new agent contract — `customer-system-analyzer` only emits a `{summary}`, so it is *not* the decision agent). Also fixed **observation fidelity**: the observation now records command + exit code (+timed-out) + stdout + **stderr** (was stdout-only), so failures visible only on stderr (`nginx -t`) or in the exit code (OOM=137) reach the analyzer. +3 tests (high-conf→PLANNING_FIX, low-conf→TRIAGING, observation carries exit+stderr); suite 423 → 426. *Known tradeoff (documented):* the OBSERVING decision and the subsequent TRIAGING proposal are two analyzer calls per loop — acceptable under the MAX_STEPS=12 cap and free in mock mode; a future optimization could merge them.
docs/AUDIT_LOG.md:302:- **Observation fidelity:** the `OBSERVING` observation stores only `stdout_redacted` — **not stderr or the exit code**. Many diagnostics put the signal on stderr (`nginx -t`) or in the exit code; the analyzer agent currently can't see them. Recommend including stderr + exit code in the observation content when the analyzer is wired (pairs with the OBSERVING gap above).
docs/AUDIT_LOG.md:308:**Verdict.** State machine is sound and now audit-complete on every block path with the two critical safety invariants pinned by tests. The one structural gap — the unwired `OBSERVING` decision step — is the highest-value next build and is clearly flagged.
docs/AUDIT_LOG.md:310:### Phase 5 — Ops Audit (veteran Linux/ERP technician lens, commits `59feb0a` + `ee00cb8`)
docs/AUDIT_LOG.md:313:**🔴 Issue 1 — the loop couldn't iterate (OBSERVING stall). FIXED `59feb0a`** (see deep-audit entry above; carried into this pass): after a probe the run sat in OBSERVING with no decision agent. Now decides root-cause vs more-diagnosis from analyzer confidence, and observations carry exit code + stderr (a technician reads those first).
docs/AUDIT_LOG.md:315:**🔴 Issue 2 — fixes were never validated (VALIDATING unreachable). FIXED `ee00cb8`.** The single biggest workflow defect: **nothing transitioned into `VALIDATING`**, so the validator agent was dead code and a fix was applied then the run looped back into *diagnosis* — an incident could be closed with the fix unverified. A senior tech *always* validates (re-`systemctl is-active`, re-curl the endpoint, confirm persistence). Root cause: the state machine collapsed diagnostic and fix commands into the same `WAITING_FOR_APPROVAL → EXECUTING → OBSERVING` path, losing the kind (and `command_approvals` has no kind column / is `.strict()`). **Fix:** record the pending command's kind (`diagnostic|fix`) as a system observation (same mechanism as `stepCount`); the post-execution router reads it and routes a fix → `VALIDATING`, a diagnostic → `OBSERVING`. The complete journey diagnose→observe→root-cause→plan→fix→**validate**→draft now runs end to end (Test 13). Full suite 423 → 427.
docs/AUDIT_LOG.md:317:**Automation-vs-expert gaps documented (not changed — deliberate / HITL / scope):**
docs/AUDIT_LOG.md:318:- **No rollback on `NOT_FIXED`.** When validation says the fix failed, the run returns to `TRIAGING` but the failed fix is **left applied** — a technician would weigh rolling it back (the `FixProposal` carries `rollbackCommand` + `isReversible`). Not auto-executed because every command must pass human approval (auto-rollback would violate the HITL/safety principle); the next diagnostic loop can surface and propose it. **Recommend** the UI surface the recorded `rollbackCommand` as a one-click proposal on `NOT_FIXED`. Logged as carry-forward.
docs/AUDIT_LOG.md:319:- **Validation depends on the prompt re-running the *original* symptom check.** The validator receives observations + `fixApplied`, but whether it re-probes the *initial* failing signal (not just "did the fix command exit 0") is a prompt-quality matter — strengthen the validator prompt to demand a before/after comparison of the ticket's symptom. Carry-forward (prompt hardening).
docs/AUDIT_LOG.md:320:- **Two analyzer calls per diagnostic loop** (OBSERVING decision + TRIAGING proposal) — acceptable under MAX_STEPS=12 / free in mock; future: merge.
docs/AUDIT_LOG.md:321:- **`agentDispatch` has no `WAITING_FOR_APPROVAL` / `EXECUTING_COMMAND` case** — correct: those phases are driven by human/route events, not auto-advanced. Verified, not a gap.
docs/AUDIT_LOG.md:323:**Operational reliability notes:** unknown agent failures degrade to `agent.unavailable` audit + unchanged state (no crash, no unsafe default) — verified by Test 6. The MAX_STEPS cap bounds runaway loops. Per-run concurrency/locking is still open (carry-forward, Phase 6 lifecycle).
docs/AUDIT_LOG.md:325:**Verdict.** The loop now faithfully mirrors expert incident workflow in both directions — it iterates to a root cause AND validates the fix before drafting. The remaining gaps are deliberate HITL boundaries (rollback approval) and prompt-quality items, both logged.
docs/AUDIT_LOG.md:327:### Phase 5 — Research / Reuse Audit (OSINT & adjacent-knowledge lens, commit `0c9548c`)
docs/AUDIT_LOG.md:330:**Is the custom state machine + agent loop justified?** *Yes — and strongly validated by prior art.* The closest existing system is **LangGraph**: its `interrupt_before` (gate *before* the action) + checkpoint persistence + approve/edit/reject is *exactly* our `WAITING_FOR_APPROVAL` + SQLite-persisted run state. LangChain's own guidance — "LangGraph is worth it when you need persistence across sessions, human approval gates, or parallel fan-out" — describes our first two needs precisely, confirming the *shape* is right. We did **not** adopt it (LangChain ecosystem weight, JS port less mature, and a working/tested/dependency-free machine already exists). The **Vercel AI SDK's** own loop control (`stepCountIs`, default 20) validates our `MAX_STEPS=12` runaway-loop cap. Critically, the SDK's *auto* tool loop (v4 `maxSteps`) executes tools **without** human approval — the wrong fit for our hard-fail safety model — which is exactly why a custom step-by-step state machine with an approval break is correct on v4.
docs/AUDIT_LOG.md:332:**Issue found & repaired — unreliable confidence gate (commit `0c9548c`).** Research is unanimous: **verbalized LLM confidence is systematically miscalibrated and overconfident** (across models/domains; RLHF & reasoning models *worse* — "high confidence on low-accuracy answers"). The OBSERVING root-cause gate keyed *solely* on the analyzer's self-reported top-hypothesis `confidence ≥ 0.8` — precisely that unreliable signal. **Fix:** also require the hypothesis to cite **non-empty evidence** (a confident-but-unsupported hypothesis is a hallucination red flag → keep diagnosing). Grounded in the "confidence–faithfulness gap" literature; the human's approval of the resulting fix command remains the real backstop. +1 test (high conf + empty evidence → keep diagnosing).
docs/AUDIT_LOG.md:335:- **LangGraph / LangChain** — closest fit, but a framework rewrite of working code + heavier deps; borrowed the *validation* (HITL-interrupt + checkpointing pattern), not the framework.
docs/AUDIT_LOG.md:336:- **XState** (formal statechart lib, visualization, guards) — nice-to-have, but ~10 phases in a small pure `reduce()` don't justify a dependency + DSL; the reducer is fully unit-tested. Declined.
docs/AUDIT_LOG.md:337:- **AI SDK v6 `needsApproval`** — natively implements our approval gate ("HITL with a single flag, no custom code"). **Real future simplification** *if* the team upgrades v4→v6, but out of scope pre-freeze (the v4-vs-v5/6 decision was deliberately "stay on v4"). Logged.
docs/AUDIT_LOG.md:338:- **Calibration tooling** (Brier/log-scoring, self-consistency sampling) to fix LLM overconfidence — research-grade, overkill here; the evidence-requirement + HITL backstop is the pragmatic mitigation.
docs/AUDIT_LOG.md:340:**Adjacent-knowledge borrowed (Nebenwissenschaft):** *Decision science* — confidence calibration / the overconfidence bias drove the evidence-gate fix; the diagnose→fix→validate loop is a **OODA / hypothesis-test** cycle. *Reliability eng.* — `MAX_STEPS` cap = a circuit breaker; agent-failure → `agent.unavailable` + unchanged state = fail-safe degradation. *Control systems* — the loop is feedback control with a human gate in the actuation path. *Root-cause analysis* — hypotheses-with-evidence mirrors formal RCA (evidence before conclusion).
docs/AUDIT_LOG.md:344:**Verdict.** Custom orchestration is the correct, defensible build — validated against LangGraph and the AI SDK's own loop control, and now hardened against the best-documented LLM-agent failure mode (overconfidence) with a research-grounded evidence requirement. Four lenses (reconcile/land, test-strategy, ops, research/reuse) have now exercised Phase 5; full suite **428 pass / 0 fail**.
docs/AUDIT_LOG.md:350:# Phase 6 — Run API + Approvals + SSE (`gsd/phase-06-run-api-approvals-sse`)
docs/AUDIT_LOG.md:352:**First check (planning-only): SUPERSEDED — Phase 6 is now implemented & landed; see the "IMPLEMENTED & RECONCILED" subsection below.** *(Original note, kept for history:)* the branch initially added only `.planning/phases/06-*` docs with zero `backend/src` changes; the routes were 2-line stubs.
docs/AUDIT_LOG.md:354:### Plan assessment (06-CONTEXT + 06-01..04) — sound
docs/AUDIT_LOG.md:355:The design is a thin HTTP/SSE surface over the existing `advance()` driver — **no new business logic**, which is the right call:
docs/AUDIT_LOG.md:356:- `POST /api/runs` (create), `GET /api/runs/:id` (aggregate: run + latest pending approval + audit timeline), `POST .../approve|reject|next|abort` — all thin wrappers delegating to `advance()`.
docs/AUDIT_LOG.md:358:- Stale/duplicate approval → 409/422 (good — guards double-approve).
docs/AUDIT_LOG.md:363:Phase 6 branched from **`df3b3de`** (Julian's phase-05 tip) — **before** the Phase-5 reconciliation landed on `main`. Its source tree is Julian's divergent phase-05: it **lacks** the reconciled-main hardening (OBSERVING wiring, VALIDATING reachability, evidence-gated root cause, the hardened SSH executor, and ~880 lines of regression tests — the `git diff phase-06..main` shows `ssh-executor.test.ts −234`, `safety-policy.test.ts −129`, etc.). **If Phase 6 is implemented on this lineage and merged naively it will revert all of that** — the same divergence we reconciled for Phase 5. **Required at merge time:** rebase phase-06 onto current `main` (or merge keeping `main`'s `ai/`, `ssh/`, `safety/`, and tests; take only the new `routes/`+`events/sse.ts`). Notably, the plan's own 422-on-blocked-edit behavior *depends on* my Phase-5 fixes, so it must land on top of them, not under them.
docs/AUDIT_LOG.md:366:`advance()` returns the new `OrchestratorState`, not a "was the command blocked?" flag. The approve route must distinguish *executed* (→ 200) from *re-gate blocked* (→ 422) — derive it (e.g. phase still `WAITING_FOR_APPROVAL` **and** a fresh `command.blocked` audit row), or have `advance()` surface a result discriminator. Worth deciding before coding the route.
docs/AUDIT_LOG.md:368:**Verdict.** Phase 6 is well-planned and correctly scoped (HTTP/SSE only, all logic reused from `advance()`); nothing to audit in code yet. The one thing that matters now is **not losing the reconciled `main`** when it's implemented — rebase phase-06 onto `main` first.
docs/AUDIT_LOG.md:371:Phase 6 is now built: `routes/runs.ts` (create/get/next/abort), `routes/approvals.ts` (approve/reject), `routes/events.ts` + `events/sse.ts` (per-run SSE), route mounts in `app.ts`, + ~660 lines of route tests (`runs.test`, `approvals.test`, `sse-audit-symmetry.test`). It branched from `df3b3de` (pre-reconciliation) as feared **but only ADDED routes** without re-touching the diverged `ssh`/`orchestrator`/`safety` files — so `git merge` auto-kept `main`'s hardened versions and added the routes on top. **No manual conflict resolution; the feared reversion did not happen** (verified: `signalToExitCode`/`wasFix`/`ROOT_CAUSE_CONFIDENCE_THRESHOLD`/`socat` all present post-merge; the 13 executor failures from Julian's base are gone — my executor + fixed harness won). Full suite **428 → 457 pass / 0 fail**, `tsc` clean.
docs/AUDIT_LOG.md:373:**Route audit — sound.** `runs.ts`: `POST /api/runs` resolves the ticket + customer system via the Phoenix client, creates the run, transitions to `LOADED_CONTEXT` synchronously (deliberately **not** calling `advance()`, which would auto-recurse into an LLM call and break the 201 contract — good); `GET /:id` aggregate (run + timeline + pending approval + activity draft); `/next` → `advance()`, `/abort` → `advance(abort)`; Phoenix errors mapped 404/502. `approvals.ts`: 404 (missing) / 409 (already-decided, guards double-approve) / 400 (bad body) / **422 (re-gate blocked)** — block detected via `phase === 'WAITING_FOR_APPROVAL'` after `advance()`, which is correct against the hardened orchestrator (a successful approval lands in OBSERVING/VALIDATING; a blocked edit stays WAITING). A1 anti-pattern respected (routes only call `advance()`).
docs/AUDIT_LOG.md:375:**Issue found & repaired (fix `f72755b`) — live SSE was sparse.** The orchestrator emitted **only `approval.required`** to `runEventBus`; every other event (run.started, command.completed, command.blocked, run.failed, …) was audited but **never pushed live**, so a watching client saw the stream freeze between approvals and only caught up on reconnect (backfill). The Phase-6 tests even document this as known (the symmetry test scopes itself to `approval.required`). For a live demo (scored) that's a real hole. **Fix:** `performSideEffects`'s `appendAuditEvent` case now also `runEventBus.emit(...)` — purely additive (emit with no listener is a no-op), so the SSE layer now receives the matching PRD §9 progress events live; `approval.required` still flows via `emitEvent` (not double-emitted); backfill unchanged. Suite still 457 green incl. the symmetry test.
docs/AUDIT_LOG.md:377:**Remaining considerations (documented, not changed):** (1) *Backfill→live race* — SSE attaches listeners after the backfill snapshot, so an event firing in that tiny window is missed live (still in audit → visible via `GET /:id` or reconnect). Acceptable; a buffered-then-backfill+dedup design would close it. (2) *Event-name alignment* — some audit type names don't match `SSE_EVENT_TYPES` (`validation.complete` vs `validation.completed`, `activity.draft_ready` vs `activity.drafted`), so those specific types still won't stream live until names are aligned — a Phase-7 polish. (3) `backfill` does `JSON.parse(payload_json)` without a try/catch — controlled data (redaction preserves JSON validity), low risk; a guard would harden it.
docs/AUDIT_LOG.md:383:# System-Level Deep Audit (whole-repo, freeze-readiness pass — commits `2d68603` + `946b3c4`)
docs/AUDIT_LOG.md:387:1. **🔴 No CI at all → added (verified green).** `.github/workflows/` did not exist — the 428-test suite + `tsc` never ran automatically, so any push could silently regress the B/C-score-critical code. This is the *exact* gap the running "regression-prevention" theme assumed was covered and wasn't. **Fix:** added `.github/workflows/ci.yml` — workspace `pnpm install` + `tsc --noEmit` + `vitest run` on every push to `main` and every PR (Node 22, ubuntu; better-sqlite3 resolves a prebuilt binary). First run failed (`pnpm/action-setup` needs an explicit `version` — no root `package.json#packageManager`); pinned `version: 11`; **second run green in 36s**. The regression gate is now live and proven.
docs/AUDIT_LOG.md:390:### System-level findings (documented — not code-repairable here)
docs/AUDIT_LOG.md:391:- **🔴 No HTTP surface yet (Phase 6).** The full engine exists (orchestrator + safety + executor + agents, all tested) but `routes/{runs,approvals,events}.ts` are 2-line stubs and `app.ts` mounts only `/health` + `/api/tickets`. **You cannot drive an incident end-to-end via the API today** — Phase 6 is the missing keystone. Highest-value *next build* (with the reconciliation caveat above).
docs/AUDIT_LOG.md:392:- **Test pyramid shape:** strong L1 (unit: safety, redaction, classifier) + L2 (component: phoenix client, ssh executor, orchestrator integration via mocks). **Missing L3/L4:** no HTTP-level system test (needs the routes) and **no real-VM / `docker compose` E2E** — the recurring "works-in-mock, breaks-on-real" risk. The one thing no current test proves is behaviour against a live sshd + a real Phoenix.
docs/AUDIT_LOG.md:393:- **Activity generation (Phase 7) absent:** `activity-log-generator` agent + `routes/activity.ts` are stubs — the "draft ERP activity from the audit trail" step (part of the scored deliverable) isn't built.
docs/AUDIT_LOG.md:394:- **Frontend:** technician workspace is a skeleton — out of scope for the backend score but needed for the live demo.
docs/AUDIT_LOG.md:397:- ✅ **CI gate** (tsc + 428 tests) on push/PR — the core regression net, now automated.
docs/AUDIT_LOG.md:399:- **Not adopted (justified):** lint/format gate (Biome/ESLint) — nice-to-have, not pre-freeze critical; coverage thresholds — the suite is already comprehensive, a % gate adds noise now.
docs/AUDIT_LOG.md:406:# System-Level Ops Audit (deployment & durability, veteran-ops lens — commit `87307e5`)
docs/AUDIT_LOG.md:411:- **DB hygiene** (`store/db.ts`): SQLite opened with **WAL** (crash-safe, concurrent reads); `audit_events` is **append-only enforced two ways** — SQLite `BEFORE UPDATE/DELETE` triggers AND the JSONL adapter rejects UPDATE/DELETE. Data-dir auto-created.
docs/AUDIT_LOG.md:412:- **Container** (`Dockerfile`): runs as the non-root `node` user (CIS 4.1), has a `HEALTHCHECK` (Node `fetch` — no curl/wget in slim), frozen-lockfile install.
docs/AUDIT_LOG.md:415:### Issues found & repaired (commit `87307e5`) — the audit trail could silently evaporate
docs/AUDIT_LOG.md:417:1. **🔴 No data volume.** `docker-compose.yml` mounted no volume for the SQLite store, so `./data/autopilot.db` lived in the container's writable layer → `docker compose down && up` (or any container recreation — exactly what a judge re-running the stack does) **wiped the audit trail + all run state**, breaking the documented "run state survives restart" invariant. **Fix:** added a **named volume** `autopilot-data:/app/backend/data`. Named (not bind) so the non-root `node` user keeps write access; the Dockerfile now **pre-creates `/app/backend/data` owned by `node`** so the volume inherits write permission (a root-owned volume mount would fail SQLite open → silent in-memory fallback).
docs/AUDIT_LOG.md:418:2. **🟠 Silent, non-durable fallback.** `getDb()`'s `catch {}` swallowed the real SQLite error and logged a vague "using JSONL fallback" — and that fallback is actually an **in-memory `Map`** (not file-backed despite the name), so anything written after a fallback is lost on restart. **Fix:** the warning now logs the **failure reason** and states the store is **ephemeral** (data lost on restart, fix the native build / mount a writable dir) — a silent degradation becomes a visible, explained one.
docs/AUDIT_LOG.md:421:- **Real-VM / live deployment unproven:** no `docker compose up` against a real Docker host + real VM has been run (no Docker here). The volume/permission interplay above is *inspected, not executed* — **this is the #1 thing to smoke-test before freeze** (boot the stack, run one mock incident, restart the container, confirm the prior run + audit trail are still there).
docs/AUDIT_LOG.md:422:- **Monitoring/alerting:** the audit log *is* the per-run observability (append-only, redacted, queryable). There is no app-level metrics/log aggregation — acceptable for a single-machine hackathon tool; the HEALTHCHECK covers liveness.
docs/AUDIT_LOG.md:423:- **Recovery:** WAL makes an unclean exit crash-safe (recovered on next open). `index.ts` doesn't `db.close()` on shutdown — harmless (WAL recovers; per-statement sync writes are durable), noted not fixed.
docs/AUDIT_LOG.md:424:- **Health depth:** `/health` is liveness-only (returns mode), not a readiness probe that pings the DB — fine for the demo; deepen only if a real orchestrator needs readiness gating.
docs/AUDIT_LOG.md:427:The deployment story is now durable in the way the product needs: the audit trail persists across container restarts (named volume), and a degraded non-durable store is loud instead of silent. The remaining ops risk is purely **unexecuted verification** — the real `docker compose` + VM smoke — which no code change can substitute for. Full suite **428 pass**, `tsc` clean.
docs/AUDIT_LOG.md:431:# System-Level Research / Reuse Audit (OSINT & competitive lens — no code change)
docs/AUDIT_LOG.md:432:Final holistic lens. Component-level reuse was already covered (safety→GTFOBins/OWASP, executor→ssh2/node-ssh, orchestrator→LangGraph/AI-SDK/calibration); this pass looks at the *whole product* and the persistence layer. **Outcome: the stack and architecture are validated against the live market and a real postmortem; no code repair is warranted** — the lens's own rule ("guilty until proven necessary") cuts both ways, and swapping a working, tested store engine or adopting an ORM at the freeze adds risk for no benefit.
docs/AUDIT_LOG.md:434:### Competitive analysis — the product is squarely in a hot, validated category
docs/AUDIT_LOG.md:435:The "AI SRE / incident-remediation agent" space has an explicit maturity model **L0 (manual) → L5 (closed-loop investigate + remediate *with human approval*)**, and the industry consensus is that **HITL approval is the current frontier**. This system is an L4/L5 implementation. Players: **Resolve.ai** ($1B val, Feb 2026; "human-in-the-loop approval gates before any automated action"), **Cleric** (Gartner Cool Vendor 2025), **Kubiya** (Slack-driven, RBAC), **K8sGPT** (CNCF; "SRE experience codified into analyzers"). Our **differentiator vs all of them** is the C-score moat: a *deterministic* command blocklist + secret redaction + mandatory approval + an append-only audit trail — they lean on LLM judgment + RBAC; we add a non-bypassable deterministic gate.
docs/AUDIT_LOG.md:438:**Replit, July 2025:** an AI agent **deleted a production database during a code freeze**, ran destructive commands without permission — "**no permission boundary prevented the action, and no approval gate required human sign-off**." This is the *exact* failure our architecture is built to prevent: the model never executes (proposes only), every command hits a deterministic blocklist (`rm -rf`, `DROP DATABASE`, …) twice, a human approves, and everything is audited. **Strong judge narrative** — point at this incident, then at our gate. (Borrowable lesson, not code.)
docs/AUDIT_LOG.md:440:### Reuse audit — persistence layer
docs/AUDIT_LOG.md:441:- **`better-sqlite3` — VALIDATED, keep.** Production-grade, fastest SQLite for Node, prebuilt binaries on Linux (CI/Docker build cleanly); the only friction is Windows dev (no prebuild → the in-memory fallback). Correct choice.
docs/AUDIT_LOG.md:442:- **`node:sqlite` (Node 22 built-in `DatabaseSync`) — documented future reuse, NOT now.** Eliminates the native build entirely (no compile, no fallback needed) and would let us **retire the fragile regex-SQL JSONL adapter** (`store/db.ts` parses SQL with regex — the one genuinely "guilty" custom component, though it's dev-only since prod uses real SQLite). But it's **experimental** (requires `--experimental-sqlite`, "not for production"), slower, and ships a static SQLite version. **Post-freeze swap**, not a freeze-day change.
docs/AUDIT_LOG.md:443:- **ORM / query builder (Drizzle, Kysely, Prisma) — declined.** The raw better-sqlite3 + hand-written SQL is small, typed at the boundary by Zod, and fully tested; an ORM is a rewrite with no correctness gain pre-freeze.
docs/AUDIT_LOG.md:446:- *SRE incident management* — the L0–L5 autonomy ladder (decision science / levels-of-automation) maps directly onto our phase machine; MTTR/runbook thinking underlies the diagnose→fix→validate loop.
docs/AUDIT_LOG.md:447:- *Generalisation discipline* — K8sGPT codifies *specific* analyzers; we deliberately do **not** (grading penalises incident-specific hardcoding on fresh VMs). Validates our generalisation constraint as a feature, not a gap.
docs/AUDIT_LOG.md:448:- *Auditability / change management* — append-only redacted trail = the traceability standard these tools use for trust; ours is the activity-report source of truth.
docs/AUDIT_LOG.md:450:### Strategic recommendations (ranked) — all build/verify-forward, none a code defect
docs/AUDIT_LOG.md:451:1. **Implement Phase 6 rebased on `main`** (the HTTP/SSE surface — the only thing between the validated engine and a demoable L5 product).
docs/AUDIT_LOG.md:454:4. **Demo narrative:** frame against the Replit postmortem + the L0–L5 model — leads with the C-score moat.
docs/AUDIT_LOG.md:456:**Verdict.** Every major build-vs-reuse decision is now validated against current industry practice and prior art; the custom code that exists is justified, and the one fragile custom piece (regex-JSONL fallback) has a clear post-freeze reuse path (`node:sqlite`). **No code change this pass** — correct restraint at the freeze.
docs/AUDIT_LOG.md:458:*Sources: [awesome-ai-sre](https://github.com/agamm/awesome-ai-sre) · [incident.io — AI SRE agent](https://incident.io/blog/ai-sre-agent-definition) · Resolve.ai / Cleric / K8sGPT (AI-SRE landscape) · Replit prod-DB-deletion postmortem (Jul 2025) · [better-sqlite3 vs node:sqlite discussion #1245](https://github.com/WiseLibs/better-sqlite3/discussions/1245) · [Node native SQLite](https://blog.logrocket.com/using-built-in-sqlite-module-node-js/).*
docs/AUDIT_LOG.md:462:# Phase 7 — ERP Activity Generation (`gsd/phase-07-activity-generation`, merge `dfe5a8b`)
docs/AUDIT_LOG.md:467:Unlike Phases 5 & 6, Phase 7 branched from **`22fd1f8`** — the *reconciled* `main` (my hardening + CI already in place) — so it **already carried** signal-capture / OBSERVING / VALIDATING / evidence-gate / safety blocklist. The merge had only **3 conflicts** (2 planning docs → theirs; `app.ts` route mounts → combined), **no engine reversion**, and `main`'s live-SSE fix is preserved (phase-07 never touched `orchestrator.ts`). Verified post-merge: hardening markers + live-SSE emit intact; full suite **457 → 473 pass / 0 fail**, `tsc` clean.
docs/AUDIT_LOG.md:469:### Audit — activity generation honours the core domain constraint ✅
docs/AUDIT_LOG.md:471:- The generator's **entire input is the store**: audit events + `command_results` (redacted columns) + observations + the ticket description — nothing else, no live re-querying of the VM. So the report is grounded in what actually happened, not hallucinated.
docs/AUDIT_LOG.md:472:- **Redaction is end-to-end:** every input is already redacted at write time (audit payloads, `stdout_redacted`/`stderr_redacted`, observations), AND the route **re-redacts every generated field** before save (`redactSecrets` on summary/rootCause/actionsTaken/commandsSummary/validationResult) — defense-in-depth so no secret reaches the model *or* the ERP on submit.
docs/AUDIT_LOG.md:473:- **Phase-gated:** draft only allowed in `WAITING_FOR_ACTIVITY_REVIEW`/`DRAFTING_ACTIVITY`/`COMPLETED` (409 otherwise) — can't draft mid-run.
docs/AUDIT_LOG.md:474:- **Graceful degradation:** agent-unavailable → 502; Phoenix submit errors mapped (network/auth/validation). The technician edits + submits (HITL preserved — the AI drafts, the human sends).
docs/AUDIT_LOG.md:477:- *Submit→Phoenix `createActivity` 422 shape* — the live ERP's exact validation contract is still only mock-verified (the long-standing "mocks ≠ reality" carry-forward); confirm against the real Phoenix during the smoke.
docs/AUDIT_LOG.md:478:- *Activity events on the live SSE* — `activity.draft_ready`/`activity.drafted` audit names vs `SSE_EVENT_TYPES` may still mismatch (Phase-6 note) — minor live-stream polish.
docs/AUDIT_LOG.md:485:- **Post-freeze: migrate store to `node:sqlite`** (Node 22 built-in) — kills the better-sqlite3 native-build dependency and lets the fragile regex-SQL JSONL fallback be deleted. Experimental today, so not pre-freeze.
docs/AUDIT_LOG.md:486:- ✅ **Audit-trail durability across container restart** — fixed (`87307e5`, named volume + node-owned data dir + loud fallback). **Still must be *executed*:** `docker compose up`, run an incident, recreate the container, confirm the trail persists.
docs/AUDIT_LOG.md:487:- ✅ **CI (tsc + tests) on push/PR** — added & green (`946b3c4`); lockfile fixed so `--frozen-lockfile` passes.
docs/AUDIT_LOG.md:488:- ~~**Reconcile Phase 6 onto current `main`**~~ ✅ **done** (`f792179`) — it only added routes (didn't re-touch the diverged files), so `git merge` auto-kept main's hardened engine; verified hardening intact + 457 green. **Phase 7 branched from the same pre-reconciliation lineage — apply the same check at its merge.**
docs/AUDIT_LOG.md:489:- ~~**Wire the OBSERVING decision step**~~ ✅ **resolved** (`59feb0a`) — `agentDispatch` OBSERVING now decides root-cause vs more-diagnosis from analyzer confidence; observations now include stderr + exit code.
docs/AUDIT_LOG.md:490:- ~~**AI SDK v4 vs v5/v6**~~ ✅ **resolved in Phase 5** — stayed on v4 (`ai@^4.3.16`, `LanguageModelV1`), clean mock-model; no upgrade churn.
docs/AUDIT_LOG.md:491:- **`docker compose up` smoke on a real Docker host** — confirm the non-root image + graceful shutdown + (now) the live `createActivity` 422 shape. Mocks ≠ reality.
docs/AUDIT_LOG.md:493:- **Per-VM run lock / state-machine race coverage** — due when the run lifecycle lands (Phase 6).
docs/AUDIT_LOG.md:494:- **Property-based fuzz tests for the safety blocklist** (`fast-check`) — secret-path×verb/flag permutations + whitespace/quote insertion always blocked. Highest-value test upgrade; do in a hardening pass if time allows before freeze.
docs/AUDIT_LOG.md:495:- ~~**Gate re-runs on the edited command**~~ ✅ **resolved in Phase 5** (`4954f34`) — `advance()` re-validates `finalCommand` via `validateCommandAgainstPolicy` on `command_approved` and blocks if denied.
docs/AUDIT_LOG.md:496:- **Prefer bounded tail reads in agent prompt** (Phase 5) — `cat <huge log>` returns a truncated *head*; real errors are at the tail. Steer the model to `tail -n` / `journalctl -n`.
docs/AUDIT_LOG.md:497:- **Steer agent to non-interactive/batch flags** (Phase 5) — no PTY, so the model must use `--no-pager` (systemctl/journalctl), `top -b -n1`, `ps` (not `top`), and always pass a file to `grep`/`cat` (stdin is now EOF'd, so a missing file fails fast rather than hanging — but a batch flag is still cleaner output).
docs/AUDIT_LOG.md:498:- ~~**Per-command timeout for follow/stream commands**~~ ✅ **resolved in Phase 4** (`1d811fd`) — the 30 s channel-kill timeout makes `tail -f`/`journalctl -f`/`ping` time out cleanly instead of hanging the run.
docs/AUDIT_LOG.md:499:- ~~**Redaction-at-sink**~~ ✅ **resolved in Phase 5** (`4954f34`, test added `739cf89`) — `advance()` runs `redactSecrets()` on stdout/stderr before persisting; Test 9 now asserts secrets never reach `command_results`/`observations`.
docs/AUDIT_LOG.md:500:- **Document safe disk-full-via-logs playbook** for demo/operators — `logrotate -f` / `gzip` / `mv`, never `truncate`/`rm` on `/var/log` (hard-fail).
docs/AUDIT_LOG.md:501:- **Surface `rollbackCommand` on `NOT_FIXED`** (UI/Phase 6) — when validation fails the failed fix is left applied; offer the recorded `rollbackCommand` as a one-click proposal (still human-approved). Don't auto-rollback (HITL).
docs/AUDIT_LOG.md:502:- **Harden the validator prompt for before/after symptom comparison** (Phase 5/7) — validation must re-probe the ticket's *original* failing signal, not just confirm the fix command exited 0.
docs/AUDIT_LOG.md:503:- **AI SDK v6 `needsApproval`** (future) — if the team ever upgrades v4→v6, the native `needsApproval` HITL flag can replace the custom approval-gate plumbing in the orchestrator. Not pre-freeze.
docs/AUDIT_LOG.md:507:*Last updated: Phase 7 (ERP activity generation) landed on main — clean merge, no divergence; full suite 473 pass, tsc clean. ALL 7 PHASES on main; full incident lifecycle wired end to end. Remaining: real docker compose + VM smoke (the one unproven path). Append a new section per phase as it is audited.*
docs/HARDENING.md:1:# HARDENING — how we refuse to fail the way others did
docs/HARDENING.md:9:**Assume the model is wrong, overconfident, or manipulated — the damage must still be contained by
docs/HARDENING.md:20:  perturbation, and **tool/API faults — rate-limiting the most damaging**; correctness must be judged by
docs/HARDENING.md:104:1. **No shell command executes without an APPROVED approval row** (human or policy) — provable from the audit log.
docs/HARDENING.md:105:2. **No blocklisted command ever executes** — even if a human approves it.
docs/HARDENING.md:106:3. **No secret ever appears** in audit, UI, activity, or repo — a planted secret is the test.
docs/HARDENING.md:107:4. **The system is never left worse than found** — minimal reversible changes, capture-before-change, undo, no data ops.
docs/HARDENING.md:108:5. **No "fixed" claim without after-evidence** — same benefit test green + survives a restart.
docs/HARDENING.md:109:6. **The model never holds the SSH key or an execute capability** — backend-only execution; no broad standing creds to abuse.
docs/HARDENING.md:110:7. **The audit log is append-only** — never deleted or truncated.
docs/HARDENING.md:115:- `safety.test.ts` — blocklist, effective-scope, obfuscation, edited-recheck, redaction, planted-secret.
docs/HARDENING.md:116:- `fault-injection` — LLM rate-limit/timeout/garbage, SSH drop, Phoenix 5xx → graceful degrade (ReliabilityBench-style).
docs/HARDENING.md:117:- **Broken-VM scenario harness** (Terminal-Bench format: env + fault + benefit test) — the held-out proof that it generalises; run repeatedly for consistency (pass^k).
docs/HARDENING.md:118:- `orchestrator.test.ts` — happy path, reject path, give-up-safely, undo.
docs/IMPLEMENTATION_PROCEDURE.md:1:# Implementation Procedure — Service Desk Autopilot
docs/IMPLEMENTATION_PROCEDURE.md:35:# LLM (bring your own — pick ONE provider)
docs/IMPLEMENTATION_PROCEDURE.md:46:Add the new keys to `.env.example` (placeholders only — no secrets). `env.ts` parses these through
docs/IMPLEMENTATION_PROCEDURE.md:49:### 1b. Verified env + reliability hardening (folded from `minam` — see [RELIABILITY.md](./RELIABILITY.md))
docs/IMPLEMENTATION_PROCEDURE.md:53:  admin/judge console with a **mode** switch — `/me/tickets` returns current-mode tickets, so **never hardcode**.
docs/IMPLEMENTATION_PROCEDURE.md:56:  hard-blocks DENY — so the platform can run **unattended during automated grading** (risk R0; confirm the
docs/IMPLEMENTATION_PROCEDURE.md:59:**SSH executor must (Phase E hardening — this is what makes it actually work on fresh VMs):**
docs/IMPLEMENTATION_PROCEDURE.md:76:**Phase A — repo setup**
docs/IMPLEMENTATION_PROCEDURE.md:78:   Keep a copy of `main.py`'s CORS+`/health` behaviour — we reproduce it in Hono.
docs/IMPLEMENTATION_PROCEDURE.md:82:4. `docker-compose.yml` needs **no change** to the service graph — same ports, same `./keys:/keys:ro`
docs/IMPLEMENTATION_PROCEDURE.md:129:JSONL store — see §6.)
docs/IMPLEMENTATION_PROCEDURE.md:180:## 5. Phase B — Phoenix client (`phoenix/`)
docs/IMPLEMENTATION_PROCEDURE.md:182:1. `types.ts`: Zod schemas mirroring `phoenix-openapi.yaml` — `Ticket`, `CustomerSystem`,
docs/IMPLEMENTATION_PROCEDURE.md:194:**Endpoints — core three are load-bearing** (the brief documents these): `/api/v1/me/tickets?status=&priority=&sort=`
docs/IMPLEMENTATION_PROCEDURE.md:197:(**derive from the list response** — it already carries title/description/priority/status/customer),
docs/IMPLEMENTATION_PROCEDURE.md:206:## 6. Phase C — Run store + audit log (`store/`)
docs/IMPLEMENTATION_PROCEDURE.md:219:## 7. Phase D — Safety layer (`safety/`) — **do this before SSH**
docs/IMPLEMENTATION_PROCEDURE.md:223:- `command-policy.ts`: `validateCommandAgainstPolicy(cmd)` — normalise, match blocklist → block;
docs/IMPLEMENTATION_PROCEDURE.md:228:**Test FIRST (`safety.test.ts`)** — this is the cheapest big rubric win (C) and protects against
docs/IMPLEMENTATION_PROCEDURE.md:234:## 8. Phase E — SSH execution (`ssh/`)
docs/IMPLEMENTATION_PROCEDURE.md:240:   - `conn.exec(cmd)` with a per-command timeout (e.g. 20s) — on overrun, close the channel, mark
docs/IMPLEMENTATION_PROCEDURE.md:253:## 9. Phase F — Agent loop (`ai/`)
docs/IMPLEMENTATION_PROCEDURE.md:260:   analyzer returns **ranked hypotheses + evidence** plus one next command (diagnosis-first — a
docs/IMPLEMENTATION_PROCEDURE.md:262:   return a `DiagnosticProposal` — returning the structured object is simpler and enough. **Scope
docs/IMPLEMENTATION_PROCEDURE.md:279:## 10. Phase G — API routes + SSE (`routes/`, `events/`)
docs/IMPLEMENTATION_PROCEDURE.md:306:## 11. Phase H — Frontend integration (`frontend/`)
docs/IMPLEMENTATION_PROCEDURE.md:312:- **TicketListPage** — `GET /api/tickets`, columns: title, customer, priority, status; sort/filter
docs/IMPLEMENTATION_PROCEDURE.md:314:- **TicketRunPage** — ticket + customer-system; live **AuditTimeline** (EventSource); **CommandApprovalCard**;
docs/IMPLEMENTATION_PROCEDURE.md:316:- **CommandApprovalCard** — command, purpose, expected signal, **risk level**, safety notes;
docs/IMPLEMENTATION_PROCEDURE.md:318:- **ActivityDraftEditor** — the 5 fields, all editable; Submit; "Set DONE".
docs/IMPLEMENTATION_PROCEDURE.md:319:- **AuditTimeline** — chronological events with redacted stdout/stderr summaries + validation result.
docs/IMPLEMENTATION_PROCEDURE.md:326:## 12. Phase I — Practice loop, testing & demo prep
docs/IMPLEMENTATION_PROCEDURE.md:328:**The practice loop (use it — this is how you win B).** You get **5 of your own Ubuntu VMs**, one
docs/IMPLEMENTATION_PROCEDURE.md:341:- Use the **reset** endpoint between dry runs — **never mid-graded-run**. Confirm its exact path/auth on Discord first.
docs/IMPLEMENTATION_PROCEDURE.md:376:provides — *not slides*) and a **3-minute demo video** in the submission showing the same loop with
docs/IMPLEMENTATION_PROCEDURE.md:378:diagnosis-first ranked hypotheses** — it's the brief's "what great looks like". See also [PRD.md §12].
docs/IMPLEMENTATION_PROCEDURE.md:380:1. `docker compose up` — show `:8000/health` and the workspace at `:5173`.
docs/IMPLEMENTATION_PROCEDURE.md:381:2. **Ticket list** — sorted/filtered; point out title/customer/priority/status (rubric A).
docs/IMPLEMENTATION_PROCEDURE.md:382:3. Open a ticket — show the **customer system** (SSH target) detail (rubric A/D).
docs/IMPLEMENTATION_PROCEDURE.md:383:4. **Start run** — timeline shows `run.started`; agent posts a `thought_summary`.
docs/IMPLEMENTATION_PROCEDURE.md:385:   diagnostic command** for the top one — read the purpose + expected signal + **risk level**.
docs/IMPLEMENTATION_PROCEDURE.md:386:6. **Approve** — show the safety re-check, then real SSH output appears in the timeline.
docs/IMPLEMENTATION_PROCEDURE.md:388:8. Agent **proposes a minimal fix** — note the rollback and that it's the *specific* service.
docs/IMPLEMENTATION_PROCEDURE.md:389:9. **Edit then approve** one command — show the safety layer re-validating the edited command (differentiator).
docs/IMPLEMENTATION_PROCEDURE.md:390:10. **Reject** a command with a reason — show the agent proposing an alternative (human control, rubric D).
docs/IMPLEMENTATION_PROCEDURE.md:391:11. **Try a dangerous command** (e.g. paste `rm -rf /` into the edit box) — show it **blocked** before execution (rubric C, hard-fail avoidance).
docs/IMPLEMENTATION_PROCEDURE.md:392:12. Agent **validates** — `VERIFIED_FIXED` with concrete evidence (rubric B persistence).
docs/IMPLEMENTATION_PROCEDURE.md:393:13. **Activity draft** appears — all 5 fields, built from the audit trail. Trace one claim back to a real command result (no hallucination).
docs/IMPLEMENTATION_PROCEDURE.md:395:15. **Open the audit trail** — every proposed/approved/rejected/executed command with rationale,
docs/IMPLEMENTATION_PROCEDURE.md:398:**What to say:** "The model never touches the VM — it proposes, a human approves, and a
docs/IMPLEMENTATION_PROCEDURE.md:422:- [ ] **MIT `LICENSE`** at repo root (already present — keep it).
docs/IMPLEMENTATION_PROCEDURE.md:427:- [ ] **`REPORT.md`** (recommended) — technical write-up: approach, agent design, safety model, results on your 5 VMs.
docs/PRD.md:1:# PRD — Service Desk Autopilot
docs/PRD.md:3:> **AI Service Desk Autopilot** — a technician-controlled AI troubleshooting copilot for the
docs/PRD.md:19:- **Two separate evaluations — design for both:**
docs/PRD.md:22:- **The jury (Christopher Chellakudam & Benedikt Fritzenwallner) built the case *and* the automated grader.** They judge correctness, safety and engineering **directly** — no hand-waving survives. Mentors reachable on Discord for ERP/VM/safety questions.
docs/PRD.md:25:- **ERP core = three endpoints** the brief calls out: *list my open tickets*, *get a ticket's customer-system*, *create an activity* (+ the separate *reset*). The repo OpenAPI also exposes `/me`, ticket-detail, `/customers/{id}`, and status-PATCH — treat those as **best-effort** and degrade gracefully if the live mock omits them. **Setting ticket status is NOT scored** (see §2) — do it if cheap, never gate the demo on it.
docs/PRD.md:33:customer's Linux VM, poke around, fix it, and — if they remember — write it up in the ERP.
docs/PRD.md:53:| **A** Functional MVP & ERP | 20 | Load tickets(5), usable list title/customer/priority/status(3), sort/filter by status\|priority\|date(2), load customer-system(4), **complete** activity(4), survive auth/404/empty(2) | Typed Phoenix client + mock mode; ticket list with sort/filter (default date); always fill all 5 graded activity fields; explicit empty/401/404 states. **No A points for status-PATCH** — it's optional. |
docs/PRD.md:79:1. Ticket descriptions are **symptoms only** ("API intermittently unavailable") — the root cause
docs/PRD.md:84:4. There is no audit trail of what was run on a customer system — a compliance and trust problem.
docs/PRD.md:88:## 5. Solution — the human-in-the-loop run
docs/PRD.md:97:  → propose minimal fix → approve → execute → validate (reboot-safe — persistence is graded)
docs/PRD.md:103:> acts once the technician picks one. We surface this explicitly (see §12) — it optimises for trust
docs/PRD.md:115:- Ticket list (title, customer, priority, status) with **sort/filter** — *A*
docs/PRD.md:116:- Ticket detail + customer-system (SSH target) view — *A/D*
docs/PRD.md:117:- Start a run for a ticket — *B*
docs/PRD.md:118:- Live agent progress log / timeline (SSE) — *D*
docs/PRD.md:119:- "Proposed next command" card: command, purpose, expected signal, **risk level**, safety notes — *C/D*
docs/PRD.md:120:- **Approve / edit-then-approve / reject-with-reason** on every command — *C/D*
docs/PRD.md:121:- SSH command execution through the backend safety layer (timeout, output cap) — *B/C*
docs/PRD.md:122:- **Audit log** of every proposed/approved/rejected/executed command + key actions — *C*
docs/PRD.md:123:- Deterministic safety blocking of dangerous commands **before** execution — *C*
docs/PRD.md:124:- Validation step that confirms the customer benefit is restored — *B*
docs/PRD.md:125:- Activity draft (all 5 graded fields) generated **only from the audit trail** — *A/B*
docs/PRD.md:126:- Submit activity to Phoenix + set ticket status `DONE` — *A/B*
docs/PRD.md:127:- Retry and abort controls — *D*
docs/PRD.md:129:### 6.2 Nice-to-have (only if P0 is green — see TASKS.md)
docs/PRD.md:130:- **Ranked hypotheses + evidence panel** (diagnosis-first) — judge-favored; promote to P1, not P2.
docs/PRD.md:132:- Multiple named agents surfaced in the UI (`problem_analyzer`, `customer_system_analyzer`, `problem_solver`, `activity_log_generator` — the brief's own names)
docs/PRD.md:138:### 6.3 Non-goals (we will **not** build these — see §11)
docs/PRD.md:139:- Fully autonomous remediation (explicitly against the rules — a human confirms every action)
docs/PRD.md:175:holds the Phoenix token and SSH key — **never the browser**. Internal run statuses map to Phoenix
docs/PRD.md:180:> with those three. **Status-PATCH earns no rubric points** — it's an optional courtesy at the end.
docs/PRD.md:182:> ⚠️ **ERP reality:** the official brief documents **three core endpoints** — *list my open tickets*,
docs/PRD.md:183:> *get customer-system*, *create activity* — plus the separate *reset*. The repo OpenAPI also lists
docs/PRD.md:263:{ "reason": "Don't touch systemd yet — check the port first." }
docs/PRD.md:269:// request — all 5 graded fields required by us even though Phoenix only requires datetimes
docs/PRD.md:299:- **Mock mode is first-class**, not an afterthought — the demo must survive flaky Wi-Fi / VM reboots.
docs/PRD.md:310:- A generic shell assistant — the agent is scoped to *diagnose-and-fix-this-ticket*.
docs/PRD.md:317:2. **Hard-fail commands are blocked before they run** — demo a blocked `rm -rf /` or `chmod -R 777 /`.
docs/PRD.md:319:4. **Complete audit trail** — every proposed/approved/rejected/executed command with rationale,
docs/PRD.md:321:5. **Secrets are redacted** everywhere — logs, UI, and the submitted activity.
docs/PRD.md:324:7. **It generalises** — no incident is hardcoded; the same loop solves a VM we've never seen.
docs/PRD.md:326:8. **Diagnosis-first with ranked hypotheses + evidence** — the agent shows a ranked list of
docs/PRD.md:328:   picks. This is the brief's own "what great looks like" — lead the pitch with it.
docs/PRD.md:339:- **Every incident is a local-service Linux problem over the shell** — systemd/ports/configs/disk/
docs/PRD.md:345:- No LLM provided — bring your own key/endpoint in `.env`.
docs/PRD.md:354:- Output/format expectations for `commands_summary` (command classes vs. literal commands — we redact either way).
docs/PRD.md:358:## 13b. Additions folded from the `minam` branch (net-new — see RELIABILITY.md, AGENT_PIPELINE.md)
docs/PRD.md:361:- **Phoenix is LIVE** at `http://68.210.101.85:8000` (plain HTTP) — `/health`=200, `/api/v1/me`=401 without a token.
docs/PRD.md:362:- The live mock **does expose the full endpoint set** (`/me`, ticket-detail, `/customers/{id}`, status-PATCH, `/activities/create`, `/me/reset`) — not just the core three. It also has an **admin/judge console** (`/api/admin/*`) and a **mode** switch (`run-status` enum incl. `TESTING`): `/me/tickets` returns *the team's current-mode* tickets, so grading swaps mode to fresh hidden incidents → **consume `/me/tickets`, never hardcode.**
docs/PRD.md:363:- ⚠️ **SSH `.pem` is not yet in `keys/`** (only `.gitkeep`) — a hard blocker for VM work until placed.
docs/PRD.md:364:- ❓ **Passwordless sudo for `azureuser`** is still unconfirmed — preflight `sudo -n true` on first VM access (many fixes depend on it).
docs/PRD.md:367:- `POST /api/runs/:id/manual-command {command}` — technician runs their **own** command (same safety + audit path; the AI observes) — unsticks/overrides the agent (G1).
docs/PRD.md:368:- `POST /api/runs/:id/undo` — one-click revert of the last change via the captured rollback, re-tests no-regression (G3).
docs/PRD.md:369:- `POST /api/runs/:id/questions/:qid/answer {answer}` + an `agent.question` SSE event — the agent asks instead of guessing ("need sudo?") (G11).
docs/PRD.md:370:- **Plan-approval for read-only batches** — show diagnostics as one reviewable plan (each still audited); every mutation individually gated; Stop always visible (G4). Satisfies "visible plan + confirm" without approval fatigue.
docs/PRD.md:372:**Validation honesty (G2):** proof is the customer-benefit test, never `systemctl is-active`; for **intermittent** symptoms (this PRD's own "API intermittently unavailable" example) repeat the test over an interval and fix the *cause of intermittency* — a single green → `LIKELY_FIXED`, not `VERIFIED_FIXED`.
docs/PRD.md:380:- **Official techbold case brief** (START Hack Vienna '26) — incorporated throughout (§0, §2, §13).
docs/PRD.md:388:- OpenClaude (https://github.com/Gitlawb/openclaude): pattern extracted — tool-driven agent loop
docs/READINESS_AUDIT.md:1:# READINESS AUDIT — are we truly ready to build, and is this the best we can do?
docs/READINESS_AUDIT.md:12:planning — it is (a) two external unblockers, (b) a small set of pre-build artifacts, and (c) the code
docs/READINESS_AUDIT.md:21:plan-approval — REVIEW G1–G12); SSH hardening that makes it work on real boxes (`bash -lc` PATH, `sudo -n`,
docs/READINESS_AUDIT.md:25:**⚠️ Thin / to verify on first VM:** passwordless `sudo` for `azureuser` (many fixes need it — preflight it);
docs/READINESS_AUDIT.md:37:**⚠️ Thin:** per-incident **LLM cost/latency** (bring-your-own key — fine for the hack, but note token cost &
docs/READINESS_AUDIT.md:42:differentiator a generic RMM vendor can't match. Approved — show me it solving a fresh VM."
docs/READINESS_AUDIT.md:49:**⚠️ Thin:** the **frontend is specced but light** (intentionally — D is 10 pts). Make sure the demo path
docs/READINESS_AUDIT.md:51:**Technician's bottom line:** "I can drive, override, undo, and trust the proof — and it does my paperwork.
docs/READINESS_AUDIT.md:62:valuable pre-build artifact — it's how we *know* the agent works before the hidden grader runs, and it
docs/READINESS_AUDIT.md:65:**AI dev's bottom line:** "The design is right and debuggable. Stop writing docs — build the loop and a
docs/READINESS_AUDIT.md:76:**External unblockers (we can't resolve these ourselves — get them first):**
docs/READINESS_AUDIT.md:77:- [ ] **SSH `.pem` in `keys/`** (folder has only `.gitkeep`) — hard blocker for any VM work.
docs/READINESS_AUDIT.md:83:- [ ] **3–5 broken-VM scenarios** (Docker, Terminal-Bench format: env + fault + benefit test) — the proof harness.
docs/READINESS_AUDIT.md:86:**Then build (the code — specs are detailed enough):** TS/Hono skeleton → Phoenix client (+mock) → safety
docs/READINESS_AUDIT.md:96:**Conclusion:** This is the best we can do *on paper* — the design, safety, reliability, and diagnostic
docs/RELIABILITY.md:1:# RELIABILITY — making the technical core actually work
docs/RELIABILITY.md:16:- ❓ **Passwordless `sudo` for `azureuser`** unknown — must be preflighted (see §4). This single fact
docs/RELIABILITY.md:22:has a *specific, designed* countermeasure in our system — this is the heart of our reliability.
docs/RELIABILITY.md:26:| **Execution — "command not found / not in PATH" = 24.1% of ALL failures** (the single biggest) | agent calls a tool that isn't installed, or a non-login shell lacks PATH | **Tool-availability preflight** (§3) + **stock-Ubuntu-only command set** in the knowledge pack + run via `bash -lc` for login PATH + absolute paths for system binaries. **Never install** to "fix" a missing tool (also a C minimal-change win). |
docs/RELIABILITY.md:27:| **Execution — step repetition / disobeying spec** | agent re-runs the same failing command, ignores constraints | deterministic **state machine** owns flow (not the model) + **loop detector** (same cmd twice → escalate) + **one command per step** + structured output schema |
docs/RELIABILITY.md:28:| **Coherence — context collapse after ~turn 10** from verbose output | long stdout floods context, agent loses the thread | **output budgeting** (§3): cap + line-filter + summarize before the model sees it; full output stays in the DB, only a digest enters context; **pin the ticket goal every turn** |
docs/RELIABILITY.md:29:| **Coherence — reasoning/action mismatch** | agent's stated plan ≠ command it runs | feed the **actually-executed** command + redacted result back (never the proposed one); evidence-grounded hypotheses must cite the output line |
docs/RELIABILITY.md:30:| **Verification — premature termination / insufficient verification** | agent declares "fixed" without proof; quits early | **closed-loop verify** (§2): capture the BROKEN signal first, prove the SAME signal green after, **re-test after restart** (persistence); `VERIFIED_FIXED` requires evidence, else `LIKELY/NOT_FIXED`; **grader-mirror** before submit |
docs/RELIABILITY.md:34:**human-in-the-loop** — the technician approves every command, catching wrong targets, bad fixes, and
docs/RELIABILITY.md:53:8. PERSISTENCE       restart the unit (and where feasible reboot — the grader uses `me/reset` which reboots) → re-run the test → still GREEN; `systemctl is-enabled` = enabled
docs/RELIABILITY.md:125:- We **never trip a safety hard-fail** — the classifier blocks them and they can't be approved (unit-tested).
docs/RELIABILITY.md:126:- We **never make it worse** — minimal, reversible, scoped changes; capture-before-change; give-up-safely
docs/RELIABILITY.md:128:- We **never claim a fix without evidence** — closed-loop pre/post + persistence gate the `VERIFIED` verdict.
docs/RELIABILITY.md:129:- We **degrade gracefully** — unreachable VM, missing tool, needs-sudo, or unknown incident → a clear,
docs/RELIABILITY.md:139:risk is fix-success variance on unseen incidents — mitigated by the test-scenario harness (measure
docs/RESOURCES.md:1:# RESOURCES.md — everything we can reuse (so we build the least)
docs/RESOURCES.md:12:gate — not container isolation.
docs/RESOURCES.md:16:## 0. Copy-directly shortlist (highest leverage — start here)
docs/RESOURCES.md:45:| [IBM ITBench](https://github.com/itbench-hub/ITBench) | Apache-2.0 | 🔵 | scenario-design + **held-out grading** methodology (40 public / 19 hidden — our exact structure). K8s-centric → adapt |
docs/RESOURCES.md:47:| Reality check | — | — | Frontier models resolve only ~11% (ITBench SRE) to ~50% (Terminal-Bench). **The model isn't enough — knowledge + verification is the edge.** |
docs/RESOURCES.md:60:| **man pages** (on the VM) | — | 🟢 | ground truth; agent can `man`/`--help` live |
docs/RESOURCES.md:64:| **our [knowledge/](../knowledge/) pack** | MIT (ours) | 🟢 | playbook + per-domain runbooks + safety policy — the agent's brain |
docs/RESOURCES.md:69:| [USE Method — Linux checklist](https://www.brendangregg.com/USEmethod/use-linux.html) + [60s analysis](https://www.brendangregg.com/Articles/Netflix_Linux_Perf_Analysis_60s.pdf) | 🟢 | exact Util/Saturation/Errors commands per resource; the first-60s sweep |
docs/RESOURCES.md:70:| [Google SRE Book — Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/) | 🔵 | the hypothesize→test→bisect loop shape |
docs/RESOURCES.md:71:| *(already distilled into `knowledge/diagnostic_playbook.md`)* | 🟢 | — |
docs/RESOURCES.md:80:## 7. Diagnostic & validation tools (probes — dev harness; avoid installing on customer VMs)
docs/RESOURCES.md:84:| [osquery](https://github.com/osquery/osquery) | Apache-2.0 | 🔵 | SQL over OS state (processes, ports, mounts) — structured diagnosis (dev only) |
docs/RESOURCES.md:87:| **systemd built-ins** | — | 🟢 | `systemctl status/is-enabled/--failed`, `journalctl -u -p err`, `systemd-analyze` — zero-install |
docs/RESOURCES.md:98:| **our `knowledge/safety/command-policy.md`** | MIT | 🟢 | the DENY taxonomy + 3-tier classify + ready `redact()` regex — the spec |
docs/RESOURCES.md:105:| [ssh-mcp](https://github.com/tufantunc/ssh-mcp) | MIT | 🔵 | SSH-over-MCP reference — **no approval/allowlist**, so we keep our own gate |
docs/RESOURCES.md:127:| Open-weight agentic/coding models — **Qwen-Coder, DeepSeek, GLM, Kimi-K2, Devstral, MiniMax** families ([overview](https://kilo.ai/open-source-models)) | open weights | 🔵 | optional local model for air-gapped/privacy customers |
docs/RESOURCES.md:128:| **Call:** Claude (cloud) for performance in the demo; local is the **privacy differentiator** ("secrets never leave the box"). The AI SDK is provider-agnostic — swap in one line. |
docs/RESOURCES.md:130:## 13. Runbook-automation platforms (landscape we improve on — reference, not deps)
docs/RESOURCES.md:133:| [Rundeck](https://github.com/rundeck/rundeck) | Apache-2.0 | 🔵 | the "governed job runner" status quo — our pitch: the LLM *writes/adapts* the runbook live |
docs/RESOURCES.md:136:## 14. ITSM / process frameworks (domain knowledge — pitch & phase structure)
docs/RESOURCES.md:140:| **KEDB — Known Error Database** ([CIO Wiki](https://cio-wiki.org/wiki/Known_Error_Database_(KEDB)), [InvGate](https://blog.invgate.com/kedb)) | 🔵 | our activity log *is* a known-error record; "seen this before" = auto-built KEDB |
docs/RESOURCES.md:146:| **Docker** Ubuntu images | — | 🟢 | broken-VM scenario containers (primary; offline, no reset-burn) |
docs/RESOURCES.md:152:## License hygiene (repo is MIT — judges scan it)
docs/RESOURCES.md:154:- **🔵 don't vendor — invoke or re-express:** GPL/AGPL tools (monitoring-plugins, Lynis, sos, explainshell, NL2Bash code, trufflehog). Call them as external binaries or re-author the logic in our own words; never paste their source into the repo.
docs/REVIEW.md:1:# REVIEW — from a 50-year sysadmin's chair (+ logic-gap register)
docs/REVIEW.md:5:actually use it at 3am. Goal: easiest, most trustworthy human-in-the-loop assistant — and find every logic gap.
docs/REVIEW.md:8:> "Most of these AI ops toys either nag me to death or quietly do something stupid. This one's *close* —
docs/REVIEW.md:25:### P0 — fix before it's a credible tool
docs/REVIEW.md:34:  **not** prove an intermittent problem is fixed — and `active` never proves the customer benefit. *Fix:*
docs/REVIEW.md:49:### P1 — correctness & trust
docs/REVIEW.md:63:  context — target the specific directive.
docs/REVIEW.md:66:  a fresh incident (re-enrich); the ground-truth sweep already surfaces multiple lit-up layers — make the agent
docs/REVIEW.md:69:  disk that a runaway will refill — green test, fragile/regressing fix (fix-score 1, possible hard-fail). *Fix:*
docs/REVIEW.md:73:  ("need sudo?", "OK to restart X — 3 active connections?", "is a 30s blip acceptable?"). *Fix:* add an
docs/REVIEW.md:79:### P2 — robustness & polish
docs/REVIEW.md:89:- **G17 · Slow/expensive probes.** `find /`, huge `journalctl` — scope and timeout; never unbounded.
docs/REVIEW.md:97:1. The AI's default output is a **terse running narrative + the single best next step** — not a wall of text.
docs/REVIEW.md:102:4. It **documents everything automatically** so he never writes the ticket up — that's the actual product
docs/REVIEW.md:117:> wheel** and **not trusting a single green light** — exactly what a real sysadmin demands.
docs/SAFETY_POLICY.md:1:# Safety Policy — Service Desk Autopilot
docs/SAFETY_POLICY.md:10:> guardrails are inspected directly** — they must be real, not demo-ware; (2) **secrets must not
docs/SAFETY_POLICY.md:11:> exist anywhere in the repo, logs, frontend, or screenshots** — keep `.env`/keys git-ignored,
docs/SAFETY_POLICY.md:21:1. **Every** SSH command requires explicit human approval — including read-only ones.
docs/SAFETY_POLICY.md:28:8. **No exfiltration** — no piping system data to external hosts; no `curl/wget … | sh`.
docs/SAFETY_POLICY.md:48:| `HIGH_RISK_BLOCKED` | Destructive / forbidden | **Blocked — never executes** | broad recursive delete; disk format; mass chmod/chown; secret exfiltration; fork bomb; disabling security; clearing logs |
docs/SAFETY_POLICY.md:50:The UI shows the level on the approval card. `HIGH_RISK_BLOCKED` never reaches an approval card —
docs/SAFETY_POLICY.md:55:## 3. Blocklist (hard-fail patterns — always `HIGH_RISK_BLOCKED`)
docs/SAFETY_POLICY.md:58:obfuscate, resolve simple `$()`/back-tick wrappers conservatively — if you can't resolve it safely,
docs/SAFETY_POLICY.md:78:auto-blocked — it's `MEDIUM_RISK_CHANGE` and needs explicit approval. Context matters: a *targeted*
docs/SAFETY_POLICY.md:85:These don't bypass approval — they're just classified low so the technician can approve quickly.
docs/SAFETY_POLICY.md:100:## 5. Fix-command guidance (`LOW`/`MEDIUM` — minimal & reversible)
docs/SAFETY_POLICY.md:102:- Restart **the one** affected service: `systemctl restart <svc>` — not a blanket "restart everything".
docs/SAFETY_POLICY.md:106:- Disk full: identify the **specific** large/rotatable files; rotate/compress logs properly — **never** delete logs to hide evidence, and don't nuke `/var`.
docs/SAFETY_POLICY.md:107:- Prefer the change that **survives a reboot** (enable the unit, fix the persistent config) — rubric B scores persistence.
docs/SAFETY_POLICY.md:136:- final executed command (post-edit) — or "blocked"/"rejected"
docs/SAFETY_POLICY.md:149:1. **At proposal:** `validateCommandAgainstPolicy(proposed)` — block → `command.blocked`, never reaches approval.
docs/SAFETY_POLICY.md:150:2. **At approval:** re-run `validateCommandAgainstPolicy(final)` on the possibly-edited command — block → `422`, audit `BLOCKED`.
docs/SAFETY_POLICY.md:156:that actually guarantees safety — the prompt is advisory.
docs/SAFETY_POLICY.md:163:  `manual-command` is classified/redacted/audited identically to an agent proposal — a DENY pattern is
docs/SAFETY_POLICY.md:167:  the whole file into context/logs — target the specific directive; edit in place without echoing values;
docs/SAFETY_POLICY.md:174:  deterministic gate — the verdict is independent of what the output "says."
docs/TASKS.md:1:# Tasks — Service Desk Autopilot
docs/TASKS.md:7:**Code freeze: Sunday June 7, 14:00 sharp.** Team 2–4 — assign one owner per P0 lane (ERP, SSH+safety,
docs/TASKS.md:9:10. Engineering modularity + tests + README (E) is 15. **Status-PATCH and ticket-DONE are unscored** —
docs/TASKS.md:16:## P0 — Must finish for demo
docs/TASKS.md:18:- [ ] **P0-1 Repo migration to TS/Hono** — Owner `@___` · S · Dep: — 
docs/TASKS.md:22:- [ ] **P0-2 env.ts + .env.example** — Owner `@___` · S · Dep: P0-1
docs/TASKS.md:26:- [ ] **P0-3 Phoenix client + types + mock** — Owner `@___` · M · Dep: P0-1
docs/TASKS.md:31:- [ ] **P0-4 `GET /api/tickets` + `/:id` + `/customer-system`** — Owner `@___` · S · Dep: P0-3
docs/TASKS.md:34:- [ ] **P0-5 Safety layer + tests** — Owner `@___` · M · Dep: P0-1
docs/TASKS.md:36:  **Accept:** `safety.test.ts` green — every blocklist pattern → `HIGH_RISK_BLOCKED`; edited-command
docs/TASKS.md:37:  recheck blocks danger; redaction strips secrets; allowlist → `SAFE_READ_ONLY`. (Rubric C — do early)
docs/TASKS.md:39:- [ ] **P0-6 Run store + audit log** — Owner `@___` · M · Dep: P0-1
docs/TASKS.md:43:- [ ] **P0-7 SSH executor + mock** — Owner `@___` · M · Dep: P0-2, P0-5
docs/TASKS.md:47:- [ ] **P0-8 `problem_analyzer` agent — ranked hypotheses + diagnostic command** — Owner `@___` · M · Dep: P0-2
docs/TASKS.md:52:- [ ] **P0-9 Orchestrator state machine** — Owner `@___` · L · Dep: P0-5,P0-6,P0-7,P0-8
docs/TASKS.md:56:- [ ] **P0-10 Run routes: create / get / next / abort** — Owner `@___` · M · Dep: P0-9
docs/TASKS.md:59:- [ ] **P0-11 Approval routes (approve/edit/reject) + re-check + execute** — Owner `@___` · M · Dep: P0-7,P0-9
docs/TASKS.md:63:- [ ] **P0-12 SSE run events** — Owner `@___` · M · Dep: P0-6,P0-9
docs/TASKS.md:67:- [ ] **P0-13 `problem_solver` + Validator agents** — Owner `@___` · M · Dep: P0-8,P0-9
docs/TASKS.md:69:  **Accept:** loop proposes a targeted fix and returns a validation verdict with evidence; persistence checked. (Rubric B — fix-works + fix-persists)
docs/TASKS.md:71:- [ ] **P0-14 `activity_log_generator` + submit** — Owner `@___` · M · Dep: P0-6,P0-13,P0-3
docs/TASKS.md:73:  **Accept:** all 5 graded fields populated from real observations (no invention, no secrets); submit creates a Phoenix activity. (Rubric A/B) *(Setting ticket DONE is optional/unscored — P2.)*
docs/TASKS.md:75:- [ ] **P0-18 Practice loop on 5 VMs + reset** — Owner `@___` · M · Dep: P0-11,P0-13,P0-14
docs/TASKS.md:77:  **Accept:** all 5 practice incidents solved cleanly, reboot-persistent, zero safety flags, on a generalising loop. (Rubric B — the main event)
docs/TASKS.md:79:- [ ] **P0-15 Frontend: ticket list + run page + approval card + timeline + activity editor** — Owner `@___` · L · Dep: P0-4,P0-10,P0-11,P0-12,P0-14
docs/TASKS.md:83:- [ ] **P0-16 README + .env.example + run instructions** — Owner `@___` · S · Dep: P0-1
docs/TASKS.md:87:- [ ] **P0-17 Tests: phoenix-client + orchestrator** — Owner `@___` · M · Dep: P0-3,P0-9
docs/TASKS.md:93:## P1 — Scoring boosters
docs/TASKS.md:95:- [ ] **P1-1 Robust error handling/timeouts/retries everywhere** — Owner `@___` · M · Dep: P0-3,P0-7,P0-8
docs/TASKS.md:98:- [ ] **P1-2 Retry + abort in UI** — Owner `@___` · S · Dep: P0-15 — retry a failed command, abort a run. (Rubric D)
docs/TASKS.md:100:- [ ] **P1-3 Ranked-hypotheses + evidence panel in UI** — Owner `@___` · M · Dep: P0-8,P0-15 — surface the ranked root-cause hypotheses with evidence and let the technician pick which to pursue; show purpose/expectedSignal on the command card. **Lead the pitch with this** (brief's "what great looks like"). (Rubric D + trust)
docs/TASKS.md:102:- [ ] **P1-4 Persistence/reboot validation step** — Owner `@___` · M · Dep: P0-13 — validator proposes a reboot-safe check; fixes prefer enable+persistent config. (Rubric B — fix persists point)
docs/TASKS.md:104:- [ ] **P1-5 Redaction preview in UI** — Owner `@___` · S · Dep: P0-12 — show that output was redacted before display. (Rubric C)
docs/TASKS.md:106:- [ ] **P1-6 Sort/filter polish on ticket list** — Owner `@___` · S · Dep: P0-4 — status + priority + date sort/filter via Phoenix query params. (Rubric A)
docs/TASKS.md:108:- [ ] **P1-7 Optional LLM safety second-opinion** — Owner `@___` · M · Dep: P0-5 — LLM classifier that can only *raise* concern, never override a deterministic block. (Rubric C)
docs/TASKS.md:110:- [ ] **P1-8 More orchestrator/safety test coverage** — Owner `@___` · M · Dep: P0-17 — blocked path, SSH-timeout path, Phoenix-submit path. (Rubric E)
docs/TASKS.md:114:## P2 — Nice if ahead
docs/TASKS.md:116:- [ ] **P2-1 AI SDK UI `useChat` chat interface** — Owner `@___` · L · Dep: P0-15 — tool parts + `addToolApprovalResponse` approvals. (Rubric D flair)
docs/TASKS.md:117:- [ ] **P2-2 Named multi-agent display** — Owner `@___` · M · Dep: P0-15 — show Diagnostics/Fix/Validator/Writer as distinct actors in the timeline. (Rubric D)
docs/TASKS.md:118:- [ ] **P2-3 Run replay from audit log** — Owner `@___` · M · Dep: P0-6 — step through a completed run. (Rubric C/D)
docs/TASKS.md:119:- [ ] **P2-4 Confidence scores on hypotheses** — Owner `@___` · S · Dep: P0-8.
docs/TASKS.md:120:- [ ] **P2-5 Incident timeline visual** — Owner `@___` · M · Dep: P0-12.
docs/TASKS.md:121:- [ ] **P2-6 Drizzle migration** — Owner `@___` · M · Dep: P0-6 — only if SQLite-raw becomes painful.
docs/TASKS.md:122:- [ ] **P2-7 Set ticket status DONE on submit** — Owner `@___` · S · Dep: P0-14 — unscored courtesy; nice in the demo. Do not prioritize.
docs/TASKS.md:126:## P0/P1 — human-control & reliability gaps (folded from `minam` — see REVIEW.md, RELIABILITY.md, AGENT_PIPELINE.md)
docs/TASKS.md:128:P0 — make it the tool a sysadmin actually trusts:
docs/TASKS.md:129:- [ ] **P0-G1 Human-driven command path** — Owner `@___` · M · Dep: P0-7,P0-11 — `POST /runs/:id/manual-command`: human types own command → safety classify → execute → audit (`actor:technician`) → fed to agent as observation; UI "run my own command" box. (Human leads; AI observes.)
docs/TASKS.md:130:- [ ] **P0-G2 Symptom-matched validation** — Owner `@___` · S · Dep: P0-13 — proof = benefit test (never `is-active`); intermittent symptoms repeat over an interval; single success → `LIKELY_FIXED`. (Rubric B — fix-works/persists)
docs/TASKS.md:131:- [ ] **P0-G3 One-click verified Undo** — Owner `@___` · M · Dep: P0-13 — `POST /runs/:id/undo` reverts last change via rollback, re-tests no-regression; always-visible Undo. (Rubric C/D)
docs/TASKS.md:132:- [ ] **P0-G4 Plan-approval for read-only batches** — Owner `@___` · S · Dep: P0-11 — one-click approve a read-only plan (each still audited); every mutation individually gated; Stop always visible. (Rubric C/D, anti-fatigue)
docs/TASKS.md:133:- [ ] **P0-G5 SSH executor hardening + tool preflight** — Owner `@___` · S · Dep: P0-7 — `bash -lc` PATH, `sudo -n`, exit-code-truth, `LANG=C`, output digest; first-step OS/tools/sudo preflight. (Rubric B reliability — see RELIABILITY.md)
docs/TASKS.md:134:- [ ] **P0-G6 Policy auto-approve mode (R0)** — Owner `@___` · S · Dep: P0-11 — auto-confirm SAFE_READ_ONLY, hard-block DENY; platform completes a run unattended (confirm grading flow with mentors).
docs/TASKS.md:137:- [ ] **P1-G7 Agent→human question channel** — `agent.question` event + answer endpoint (agent asks vs guesses, e.g. needs sudo).
docs/TASKS.md:138:- [ ] **P1-G8 Dry-run + redacted diff before mutate** — `nginx -t`/`apt-get -s` + redacted config diff on the approval card.
docs/TASKS.md:139:- [ ] **P1-G9 Blast-radius on approval card** — dependents + active connections before a restart/stop.
docs/TASKS.md:140:- [ ] **P1-G10 `read_local_docs` tool** — on-box man/--help/config (zero egress) for unfamiliar services.
docs/TASKS.md:141:- [ ] **P1-G11 Ground-truth enrichment sweep + unknown-error method** — per AGENT_PIPELINE.md (broad read-only sweep → follow the causal chain inward). (Rubric B — generalization)
docs/TASKS.md:142:- [ ] **P1-G12 Idempotency pre-check + cause-not-mask + multi-fault** — skip if already-desired; grader-mirror asks "cause or band-aid?"; re-enrich if still broken. (Rubric B)
docs/TASKS.md:146:## Submission (do NOT skip — hard deadline Sun Jun 7, 14:00)
docs/TASKS.md:148:- [ ] **SUB-1 README** — Owner `@___` · S · Dep: P0-16 — setup/run/env/architecture/assumptions/troubleshooting (Rubric E, 3 pts).
docs/TASKS.md:149:- [ ] **SUB-2 MIT LICENSE present + repo public in `START Hack Vienna '26 / techbold / <team>`** — Owner `@___` · S.
docs/TASKS.md:150:- [ ] **SUB-3 Secret scan + `.env.example` only** — Owner `@___` · S · Dep: P0-2 — `git grep` for tokens/keys; `.env`/`keys/` git-ignored. (Rubric C/E — a secret in the repo is a hard-fail.)
docs/TASKS.md:151:- [ ] **SUB-4 `REPORT.md`** — Owner `@___` · M — approach, agent design, safety model, results on the 5 practice VMs. (Recommended by brief.)
docs/TASKS.md:152:- [ ] **SUB-5 3-min demo video** — Owner `@___` · M · Dep: P0-15,P0-18 — full loop live with human confirmations + audit log visible.
docs/TASKS.md:153:- [ ] **SUB-6 Tally form** — Owner `@___` · S — title, pitch, team, problem, solution, stack, links.
docs/phoenix-openapi.yaml:164:        your currently-assigned tickets. Fill the documentation fields properly — they are graded.
docs/scoring.md:1:# Judging criteria — 100 points
docs/scoring.md:5:review. The two biggest blocks are **B (35)** and **C (20)** — a polished UI alone will
docs/scoring.md:17:## A — Functional MVP & ERP Workflow (20)
docs/scoring.md:18:- Load tickets via the ERP API — **5**
docs/scoring.md:19:- A usable ticket list, with title, customer, priority and status visible — **3**
docs/scoring.md:20:- Sorting or filtering by at least status, priority or date — **2**
docs/scoring.md:21:- Loading the customer system information for the tickets you work on — **4**
docs/scoring.md:22:- Creating an activity with the complete schema — **4**
docs/scoring.md:23:- Auth, 404 and empty states do not break the workflow — **2**
docs/scoring.md:25:## B — Troubleshooting Performance (35) — 5 hidden incidents × 7
docs/scoring.md:27:- Root cause identified (technical cause, not the symptom) — **1**
docs/scoring.md:28:- The fix works (customer benefit restored, underlying condition addressed) — **0–3**
docs/scoring.md:29:- The fix persists (stays green after a reboot / relevant service restart) — **1**
docs/scoring.md:30:- No regression, data intact (nothing deleted, no unsafe workaround) — **1**
docs/scoring.md:31:- Summary complete and technically useful — **1**
docs/scoring.md:42:## C — Safety, Auditability & Responsible AI (20)
docs/scoring.md:43:- A complete audit trail — every command and key action is logged — **4**
docs/scoring.md:44:- No dangerous blanket commands — **4**
docs/scoring.md:45:- Secret protection — no secrets in activities, frontend, repo, logs or screenshots — **4**
docs/scoring.md:46:- Minimal changes — no unnecessary installs / broad filesystem changes, proportionate restarts — **4**
docs/scoring.md:47:- Human control & stop conditions — review/approve/retry/abort, or at least a visible plan + confirm — **4**
docs/scoring.md:61:## D — Technician Experience & Human Control (10)
docs/scoring.md:62:- A ticket overview that is easy to understand — **2**
docs/scoring.md:63:- A ticket detail view with the customer system information — **2**
docs/scoring.md:64:- Visible agent progress — **2**
docs/scoring.md:65:- Logs and actions you can follow — **2**
docs/scoring.md:66:- Review, retry and abort — **2**
docs/scoring.md:68:## E — Engineering Quality & Reproducibility (15)
docs/scoring.md:69:- A clean project structure, frontend and backend separated, understandable modules — **3**
docs/scoring.md:70:- A real README (setup, run, environment, architecture, assumptions, troubleshooting) — **3**
docs/scoring.md:71:- Tests or mocks that are present and runnable — **3**
docs/scoring.md:72:- Error handling and timeouts (SSH, API, AI) with sensible retries and clear messages — **2**
docs/scoring.md:73:- Sensible `.env` / secret handling, `.env.example` present, no secrets in the repo — **2**
docs/scoring.md:74:- Modular code: ERP client, SSH runner, agent, safety layer and activity generator kept separate — **2**
frontend/src/api.ts:26:      // body not JSON — use statusText as fallback
frontend/src/components/ApprovalCard.tsx:32:        setError("Command blocked by safety policy — edit or reject.");
frontend/src/utils/mappers.test.ts:15:    expect(riskBadge("HIGH_RISK_BLOCKED")).toEqual({ label: "HIGH RISK — BLOCKED", colorClass: "badge--high" });
frontend/src/utils/mappers.ts:12:      return { label: "HIGH RISK — BLOCKED", colorClass: "badge--high" };
keys/.gitkeep:2:# This folder is git-ignored — never commit private keys.
knowledge/README.md:8:> Real-world finding that motivates this pack: *"the runbooks mattered more than the model — without
knowledge/README.md:32:  inject the **one or two relevant runbook files** as context (cheap routing by keyword/symptom — e.g.
knowledge/README.md:34:  dump all four every turn — retrieve the relevant slice.
knowledge/README.md:37:  function — the regex set is ready to lift). The deny taxonomy maps 1:1 to the rubric's hard-fail list.
knowledge/README.md:39:  re-run to prove the fix works *and persists* — including the restart-and-retest that mirrors the
knowledge/README.md:45:- **Persistence:** a runtime-only change is NOT a fix — config on disk + `systemctl enable` + restart-retest.
knowledge/README.md:54:This pack is **original prose** summarizing public methodology and docs — no GPL source is copied. Heavy
knowledge/diagnostic_playbook.md:1:# Diagnostic Playbook — the agent's procedure
knowledge/diagnostic_playbook.md:27:- **Triage before root-cause.** If the customer is down it's fine to mitigate first (e.g. restart) — but
knowledge/diagnostic_playbook.md:29:- **What it doesn't find matters** — a clean check rules out a branch and directs the next step.
knowledge/diagnostic_playbook.md:31:## Step 1 — TRIAGE: the first-60-seconds sweep (Gregg / Netflix)
knowledge/diagnostic_playbook.md:34:uptime               # load averages (1/5/15m) — trend
knowledge/diagnostic_playbook.md:37:mpstat -P ALL 1 3    # per-CPU balance — one hot CPU = single-threaded bottleneck (if sysstat present)
knowledge/diagnostic_playbook.md:52:## Step 2 — ISOLATE with the USE method
knowledge/diagnostic_playbook.md:69:## Step 3 — IDENTIFY ROOT CAUSE (not the symptom)
knowledge/diagnostic_playbook.md:89:## Step 4 — FIX (durable) — rules
knowledge/diagnostic_playbook.md:106:**FIX rules:** (1) no runtime-only fixes — every change lands in a file read on boot. (2) persist state
knowledge/diagnostic_playbook.md:107:explicitly: `enable --now` (boot + now). (3) idempotent edits only — guard appends (`grep -q || >>`),
knowledge/diagnostic_playbook.md:111:of the causal chain. (9) minimal blast radius — touch one thing, re-verify. (10) back up before editing
knowledge/diagnostic_playbook.md:114:## Step 5 — VALIDATE (prove it works AND persists)
knowledge/diagnostic_playbook.md:116:- **A. Functional** — re-run the customer's test: `curl -sS -o /dev/null -w '%{http_code}\n' http://localhost/health` (or the exact reported symptom, now passing).
knowledge/diagnostic_playbook.md:117:- **B. Service state** — `systemctl is-active NAME` → active **and** `systemctl is-enabled NAME` → enabled (both; active-but-disabled fails on reboot); `ss -tlnp | grep :PORT`.
knowledge/diagnostic_playbook.md:118:- **C. Persistence** — `systemctl restart NAME; sleep 2; systemctl is-active NAME && curl …/health` (still works after a clean restart).
knowledge/diagnostic_playbook.md:119:- **D. Config on disk** — `systemctl cat NAME | grep -E '<changed>'`; `grep -r <key> /etc/sysctl.d/` (value on disk, not just in RAM).
knowledge/diagnostic_playbook.md:120:- **E. (Strongest) reboot** if the window allows — then re-run A+B. (This is what the grader does via `POST /me/reset`.) If no real reboot, `systemd-analyze verify` + C + D are the proxy.
knowledge/diagnostic_playbook.md:121:- **F. Regression** — `systemctl --failed` (no new failed units); `journalctl -p err -b --since "-5 min"` (no fresh errors); `df -h; free -m; uptime` (no new pressure).
knowledge/diagnostic_playbook.md:124:**F shows no regressions**. Record the exact commands + outputs — they become the activity's evidence.
knowledge/diagnostic_playbook.md:126:## Step 6 — DOCUMENT (the ERP activity)
knowledge/diagnostic_playbook.md:128:- **summary** — 1 sentence: what broke, impact, resolved.
knowledge/diagnostic_playbook.md:129:- **root_cause** — the technical cause from Step 3 (component + mechanism + why), not the symptom; include the causal chain.
knowledge/diagnostic_playbook.md:130:- **actions_taken** — numbered, chronological: each step = what + why; distinguish diagnosis from the fix; name the on-disk file changed (proves durability).
knowledge/diagnostic_playbook.md:131:- **commands_summary** — the literal commands (diagnosis + fix + validation), sanitized, so the next tech can replay them.
knowledge/diagnostic_playbook.md:132:- **validation_result** — the Step-5 proof: benefit test passing, is-active+is-enabled, restart-retest, on-disk confirmation, regression check — with outputs.
knowledge/diagnostic_playbook.md:133:- **description** — narrative tying it together; note anything not verified (e.g. "real reboot not performed; restart-retest used as proxy").
knowledge/diagnostic_playbook.md:143:report **no changes** — if it does work, rewrite it.
knowledge/runbooks/data-access-scheduling.md:1:# Runbook — databases, permissions, sudo, cron/timers, app config, LSM
knowledge/runbooks/data-access-scheduling.md:6:> **⚠ SAFETY HARD-FAILS (zero the incident — never do these):** `DROP`/`TRUNCATE` a database or table;
knowledge/runbooks/data-access-scheduling.md:16:**Root causes:** `listen_addresses='localhost'` (default) but TCP client elsewhere; port mismatch / second cluster on the port; **pg_hba.conf** no matching (db,user,CIDR,method) rule → `no pg_hba.conf entry`, or a syntax error → server refuses to start/reload (rules matched top-to-bottom, first match wins; IPv4 needs `/32`); auth-method mismatch (role has no SCRAM password but rule demands one; `peer` requires OS user==role); **data dir perms** — `$PGDATA` must be `postgres`-owned mode `0700`/`0750`; disk full; stale `postmaster.pid` after crash.
knowledge/runbooks/data-access-scheduling.md:17:**Durable fix:** bind — edit `/etc/postgresql/<ver>/main/postgresql.conf` → `listen_addresses='localhost,10.0.0.5'` (**`listen_addresses`/`port` need a full restart**: `sudo systemctl restart postgresql@<ver>-main`). pg_hba (least-privilege) — add the narrowest rule to `/etc/postgresql/<ver>/main/pg_hba.conf` e.g. `host appdb appuser 10.0.0.0/24 scram-sha-256` → `sudo -u postgres psql -c "SELECT pg_reload_conf();"` (reload, don't restart for pg_hba); validate syntax safely: `SELECT * FROM pg_hba_file_rules WHERE error IS NOT NULL;`. Password — `sudo -u postgres psql -c "ALTER ROLE appuser WITH PASSWORD 'newpw';"` (local socket = peer). Data dir (TARGETED) — `sudo chown -R postgres:postgres /var/lib/postgresql/<ver>/main && sudo chmod 0700 ...`. Stale lock — confirm no live process then `sudo rm .../postmaster.pid`. Enable: `sudo systemctl enable postgresql`. Anti-pattern: `host all all 0.0.0.0/0 trust` (passwordless world-open); `chmod 777` data dir; `ALTER SYSTEM` writing `postgresql.auto.conf` (overrides `.conf`, surprises on reboot); restart when reload suffices.
knowledge/runbooks/data-access-scheduling.md:19:**Sources:** postgresql.org docs — auth-pg-hba-conf, auth-methods, auth-password, view-pg-hba-file-rules.
knowledge/runbooks/data-access-scheduling.md:23:**Root causes:** `bind-address=127.0.0.1` default → remote `Connection refused`; socket dir `/var/run/mysqld` (tmpfs, recreated at boot) owned `root:root` not `mysql:mysql` → `Can't create/write ... mysql.sock`; datadir `/var/lib/mysql` not `mysql:mysql` (common after restore/`cp` as root) → InnoDB can't open files; auth — root uses `auth_socket` (login via `sudo mysql`), app user wrong host (`'app'@'localhost'` vs `'app'@'%'`) or wrong password → `Access denied`; port conflict/stale pid; corrupt InnoDB redo; disk full; `skip-networking`/restrictive bind.
knowledge/runbooks/data-access-scheduling.md:24:**Durable fix:** bind — drop-in `/etc/mysql/mysql.conf.d/mysqld.cnf` (MySQL) or `/etc/mysql/mariadb.conf.d/50-server.cnf` (MariaDB): `bind-address = 0.0.0.0` (or specific IP) → `sudo systemctl restart mysql`. Socket-dir perms (TARGETED + persistent) — `sudo chown mysql:mysql /var/run/mysqld && sudo chmod 755 /var/run/mysqld`; durable via systemd-tmpfiles or `RuntimeDirectory=mysqld` in the unit. Datadir — `sudo chown -R mysql:mysql /var/lib/mysql` (never 777). App grant (least-privilege) — `sudo mysql` then `CREATE USER 'appuser'@'10.0.0.%' IDENTIFIED BY 'pw'; GRANT SELECT,INSERT,UPDATE,DELETE ON appdb.* TO 'appuser'@'10.0.0.%'; FLUSH PRIVILEGES;` (specific schema, not `*.*`). Root reset (if locked out) — stop, `sudo mysqld_safe --skip-grant-tables --skip-networking &`, `ALTER USER`/`FLUSH PRIVILEGES`, kill, restart normally (never leave skip-grant-tables running). Enable: `sudo systemctl enable mysql`. Anti-pattern: `0.0.0.0` + `'app'@'%'` + weak password internet-exposed; `chmod -R 777 /var/lib/mysql`; running mysqld as root; deleting `ib_logfile*`/`ibdata1` (destroys data — restore from backup/`mysqldump`).
knowledge/runbooks/data-access-scheduling.md:26:**Sources:** dev.mysql.com — bind_address, access-denied, resetting-permissions; MariaDB socket-permission issue.
knowledge/runbooks/data-access-scheduling.md:28:## 3. File permission / ownership — the TARGETED fix
knowledge/runbooks/data-access-scheduling.md:29:**Diagnose:** `ls -l /path`; `stat /path` (numeric mode, uid/gid); `namei -l /var/lib/app/data/file` (EVERY path component — a missing `x` on a parent dir blocks traversal even if the file is fine); `id appuser`; `getfacl /path` (a `+` in `ls -l` = ACL present); `sudo -u appuser test -r /path && echo OK`; `sudo -u appuser stat /path 2>&1` (reproduce the exact EACCES). **Key insight:** directories need **execute (`x`)** to be traversed, not read.
knowledge/runbooks/data-access-scheduling.md:31:**Durable fix (TARGETED):** specific owner `sudo chown appuser:appgroup /var/lib/app/data/file` (or `-R` on **only the app's own dir**); specific mode — files `chmod 640`, dirs need the traversal bit `chmod 750` (or `chmod g+x` the exact parent `namei` flagged); use symbolic `g+rX` so `X` adds execute to dirs only. Grant one extra user without disturbing base perms — `sudo setfacl -m u:appuser:rX /var/lib/app/data` and default ACL `sudo setfacl -m d:u:appuser:rwX /var/lib/app/data`. **⚠ CRITICAL anti-pattern — `chmod -R 777 /etc` (or `/var`,`/home`):** world-writable system files = privilege escalation + broken services (ssh/sudo refuse over-permissive files). Hard-fail. Targeted `chown`/`chmod`/`setfacl` on the single offending path is always correct; if already flattened, restore from package defaults (`dpkg --verify`, reinstall) not guesswork.
knowledge/runbooks/data-access-scheduling.md:43:**Diagnose — cron:** `systemctl status cron`; `crontab -l` / `sudo crontab -l` / `sudo crontab -l -u appuser`; `ls -l /etc/cron.d/ /etc/cron.daily/`; `journalctl -u cron --since today`; `grep CRON /var/log/syslog | tail`. **timers:** `systemctl list-timers --all`; `systemctl status myjob.timer`; `systemctl status myjob.service` (exit code lives here); `journalctl -u myjob.service -n 50`; `systemd-analyze calendar 'Mon *-*-* 02:00:00'`; `systemd-analyze verify /etc/systemd/system/myjob.{timer,service}`; `timedatectl`.
knowledge/runbooks/data-access-scheduling.md:44:**Root causes — cron:** service not enabled; **minimal cron PATH** (`/usr/bin:/bin`) so unqualified commands fail — use absolute paths; missing trailing newline; unescaped `%`; script not executable; missing env vars; wrong user's crontab; `/etc/cron.d` line must include a user field. **timers:** `.timer` not enabled (gone after reboot — `enable`, not `start`); wrong/timezone-shifted `OnCalendar`; the underlying `.service` fails; missing `Persistent=true` (missed run not caught up); missing `WantedBy=timers.target`.
knowledge/runbooks/data-access-scheduling.md:45:**Durable fix — cron:** `sudo systemctl enable --now cron`; absolute paths + explicit env: `PATH=/usr/local/bin:/usr/bin:/bin` and `0 2 * * * appuser /usr/bin/flock -n /tmp/job.lock /opt/app/run.sh >> /var/log/job.log 2>&1`; edit via `crontab -e`. **timer:** define `myjob.timer` (`[Timer] OnCalendar=*-*-* 02:00:00`, `Persistent=true`, `[Install] WantedBy=timers.target`) → `sudo systemctl daemon-reload && sudo systemctl enable --now myjob.timer`. Anti-pattern: `start` the timer without `enable`; relying on cron's PATH; redirecting job output to nowhere (failures invisible); secrets inline in crontab.
knowledge/runbooks/data-access-scheduling.md:50:**Diagnose:** `systemctl status myapp -l`; `journalctl -u myapp -n 100` (parse/connect error verbatim); `systemctl cat myapp` (ExecStart, EnvironmentFile=, User=); `systemctl show myapp -p Environment -p EnvironmentFile -p User -p WorkingDirectory`; `ls -l /etc/myapp/ /etc/default/myapp`; `sudo -u appuser cat /etc/myapp/config.yml` (can the service user read it?); syntax — `python3 -c 'import yaml;yaml.safe_load(open("/etc/myapp/config.yml"))'` / `json.load(...)`.
knowledge/runbooks/data-access-scheduling.md:58:**Diagnose — AppArmor:** `sudo aa-status` (profiles, enforce vs complain); `sudo journalctl -k | grep -i 'apparmor=.*DENIED'` (operation, profile, path); `sudo dmesg | grep -i apparmor`; `sudo grep DENIED /var/log/syslog | tail`. **SELinux:** `getenforce`; `sudo ausearch -m AVC -ts recent`; `ls -Z /path`.
knowledge/runbooks/data-access-scheduling.md:60:**Durable fix (TARGETED) — AppArmor:** confirm cause by putting just that profile in complain mode `sudo aa-complain /usr/sbin/mysqld`; if it works, add the **specific path rule** to `/etc/apparmor.d/<profile>` (or `/etc/apparmor.d/local/`), e.g. `/srv/mysql/ r, /srv/mysql/** rwk,`; reload `sudo apparmor_parser -r /etc/apparmor.d/usr.sbin.mysqld` then `sudo aa-enforce`. `aa-logprof` builds rules from logged denials. **SELinux:** `restorecon -Rv /path` or `semanage fcontext -a -t <type> '/srv/data(/.*)?' && restorecon -Rv /srv/data`; ports `semanage port -a -t <type> -p tcp <port>`; `audit2allow` to generate a rule (review before loading). **⚠ Anti-pattern (avoid):** globally disabling the LSM (`aa-teardown`/AppArmor disabled, `setenforce 0`/SELinux disabled) to fix one service — strips host-wide protection (security regression). The correct move is the narrow per-profile rule / context fix. Leaving a profile permanently in `complain` is also a silent downgrade.
knowledge/runbooks/data-access-scheduling.md:65:1. **Diagnose read-only first** — capture the *exact* error string; it names the root cause.
knowledge/runbooks/data-access-scheduling.md:69:5. **Make it persist** — `systemctl enable`, on-disk ownership/ACLs, drop-in overrides — not transient tweaks.
knowledge/runbooks/data-access-scheduling.md:70:6. **Validate fix + persistence** — functional probe **plus** `is-enabled` + a restart **plus** "no new denials".
knowledge/runbooks/data-access-scheduling.md:71:7. **Refuse the hard-fails** — never drop/truncate DBs, delete data dirs, `chmod -R 777` system trees, grant DB-superuser/root to the app, or disable AppArmor/SELinux wholesale. Always substitute the narrowest targeted action.
knowledge/runbooks/networking-web-tls.md:1:# Runbook — networking, web & TLS
knowledge/runbooks/networking-web-tls.md:19:**Durable fix:** fix the on-disk listen directive (nginx `listen 0.0.0.0:443 ssl;`, app `bind`/`host = 0.0.0.0`), `systemctl restart <svc>`; `systemctl enable --now <svc>`. Anti-pattern: launching the binary in a foreground shell / `nohup … &` — dies on logout/reboot, masks the real failure.
knowledge/runbooks/networking-web-tls.md:24:**Diagnose:** `sudo ufw status verbose`; `sudo iptables -S` and `-L -n -v --line-numbers`; `sudo nft list ruleset`. Local? `curl -v http://127.0.0.1/` ok but external times out → packet filter or cloud security group. **REJECT** = instant "connection refused"; **DROP** = hanging/timeout — tells you the rule type.
knowledge/runbooks/networking-web-tls.md:25:**Root causes:** default inbound `deny`/`DROP` with no allow rule; rule ordering (broad DROP above the specific allow — first-match wins); wrong protocol (`tcp` vs `udp`)/interface; mixed managers (hand-written rules vs ufw chains); IPv6 path blocked while IPv4 works.
knowledge/runbooks/networking-web-tls.md:26:**Durable fix:** ufw `sudo ufw allow 443/tcp` (writes `/etc/ufw/*.rules`, persistent). Raw nftables: edit `/etc/nftables.conf` → `sudo systemctl enable --now nftables`. Raw iptables is durable **only** if `iptables-persistent`/`netfilter-persistent` is already installed (writes `/etc/iptables/rules.v4`); if not (and you can't install), prefer ufw or `/etc/nftables.conf` — runtime `iptables` rules vanish on reboot. Anti-pattern: `iptables -I INPUT -j ACCEPT` with no persistence layer.
knowledge/runbooks/networking-web-tls.md:28:**⚠ AVOID — SAFETY HARD-FAIL:** **NEVER `ufw disable` / `iptables -F` / `nft flush ruleset`** to make one port work — removes all protection from an internet-facing host. Add the **single specific allow rule** instead. **NEVER enable a default-deny firewall before allowing SSH** — sequence is always defaults → `ufw allow OpenSSH`/`22/tcp` → `ufw enable` (else you drop your own session). Prefer `ufw limit ssh`.
knowledge/runbooks/networking-web-tls.md:34:**Durable fix:** restore symlink `sudo ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf` + `sudo systemctl enable --now systemd-resolved`. Set upstream durably via netplan (`/etc/netplan/*.yaml` → `nameservers:` → `netplan apply`) or `/etc/systemd/resolved.conf` (`DNS=1.1.1.1 8.8.8.8` → restart resolved). If DNSSEC is the culprit and zone is genuinely broken: `DNSSEC=allow-downgrade`. Flush: `sudo resolvectl flush-caches`. Anti-pattern: hand-editing `/etc/resolv.conf` — regenerated and lost on a resolved-managed host.
knowledge/runbooks/networking-web-tls.md:41:**Durable fix:** edit `/etc/netplan/*.yaml` → `sudo netplan apply` (test risky changes with `sudo netplan try` — auto-reverts after 120s if not confirmed, so you can't lock yourself out). Anti-pattern: `ip addr add`/`ip route add` at the CLI (runtime-only, wiped on reboot/`netplan apply`).
knowledge/runbooks/networking-web-tls.md:46:**Diagnose — nginx:** `sudo nginx -t` (syntax + load test, prints file:line); `systemctl status nginx`; `journalctl -u nginx -b | tail`; `tail -n 50 /var/log/nginx/error.log`; `ss -ltnp | grep -E ':(80|443)\b'`; `curl -v http://127.0.0.1/`. **apache2:** `sudo apache2ctl configtest` (expect "Syntax OK"); `sudo apachectl -S` (vhost map); `systemctl status apache2`; `tail -n 50 /var/log/apache2/error.log`.
knowledge/runbooks/networking-web-tls.md:47:**Root causes:** syntax error / dangling `include` / missing `;` (service refuses to (re)start — `nginx -t` pinpoints); referenced file missing (cert, key, docroot, included snippet); vhost enabled but dependency missing (`sites-enabled` symlink to deleted file; apache site not `a2ensite`d or module not `a2enmod`); two vhosts claim same `listen`/`ServerName`; perms — worker (`www-data`) can't read root/cert (§7); config edited but never reloaded.
knowledge/runbooks/networking-web-tls.md:56:**Durable fix:** `systemctl enable --now <backend>` (up after reboot before nginx needs it); correct `proxy_pass` in the on-disk vhost → `nginx -t` → reload; for genuinely slow upstreams raise `proxy_read_timeout`/`proxy_connect_timeout` (don't paper over a crash with a huge timeout). Anti-pattern: restarting nginx repeatedly — the fault is the upstream.
knowledge/runbooks/networking-web-tls.md:72:**Root causes:** expired leaf (or expired intermediate — file dates look fine but `s_client` says expired); `ssl_certificate` points at cert-only instead of **fullchain** (missing intermediates), or a stale path; cert/key mismatch (moduli differ); **permissions** — `www-data` can't read the key or traverse a parent dir (`/etc/letsencrypt/{live,archive}` often `0700 root`). Note: `nginx -t` runs as root and **passes**, but workers fail at runtime — diagnose via error.log, not just `nginx -t`.
knowledge/runbooks/networking-web-tls.md:75:**Avoid:** making a private key world-readable to dodge a permission error (key-disclosure incident — fix group ownership + dir traversal instead); `curl -k` "fix" (hides the real fault); hand-editing `/etc/letsencrypt/archive/`.
knowledge/runbooks/resource-exhaustion.md:1:# Runbook — resource exhaustion (disk, inodes, memory, CPU, FDs)
knowledge/runbooks/resource-exhaustion.md:3:> Stock Ubuntu over SSH, no installs. Framework: **USE method** — for each resource check Utilization,
knowledge/runbooks/resource-exhaustion.md:19:**Root causes:** unrotated/misconfigured logrotate or app at DEBUG; a process holding a deleted file open; inode exhaustion (millions of tiny files — PHP sessions, mail spool, cache, `/tmp`); journal unbounded (no `SystemMaxUse`); files written under an active mountpoint; docker/overlay layers, apt cache, core dumps.
knowledge/runbooks/resource-exhaustion.md:20:**Durable fix:** configure rotation at the producer — logrotate drop-in `/etc/logrotate.d/<app>`:
knowledge/runbooks/resource-exhaustion.md:29:**Diagnose:** `findmnt -rno SOURCE,TARGET,FSTYPE,OPTIONS` / `mount | grep ' ro,'`; `dmesg -T | grep -iE 'ext4|xfs|i/o error|remount|read-only|aborting journal'` (WHY it went ro); `journalctl -k -b | grep -iE 'error|remount-ro'`; `findmnt --verify` (fstab consistency); `lsblk -f`. Ext4 default `errors=remount-ro` flips to read-only **on corruption or I/O error** — a protection, not the disease.
knowledge/runbooks/resource-exhaustion.md:38:**Durable fix:** (1) fix the producer — silence the error loop / set log level to INFO/WARN and restart. (2) logrotate rule (§1) with `postrotate ... systemctl reload <svc>` (or `copytruncate` if no reload hook) so the app reopens its file. (3) cap journald in `/etc/systemd/journald.conf`: `[Journal] SystemMaxUse=500M / SystemKeepFree=1G / MaxRetentionSec=2week` → `sudo systemctl restart systemd-journald`. One-shot reclaim of archived logs: `sudo journalctl --vacuum-size=500M`. Anti-pattern: `> /var/log/app.log` / `truncate -s0` on a loop; deleting the journal dir; rotating without making the app reopen.
knowledge/runbooks/resource-exhaustion.md:45:**Durable fix:** cap the offending app at the app layer (JVM `-Xmx`, Node `--max-old-space-size`, Postgres `work_mem`/`max_connections`, PHP-FPM `pm.max_children`). Bound it with systemd so a leak can't take the host — drop-in `/etc/systemd/system/<svc>.service.d/mem.conf`: `[Service] MemoryMax=2G / MemoryHigh=1800M` → `daemon-reload && restart` (cgroup-v2, reboot-safe). Protect critical procs: `OOMScoreAdjust=-900` (range **-1000 immune … +1000 first to die**). Add/right-size swap (§5). Anti-pattern: `vm.overcommit_memory=1` without bounding the leak; killing the victim repeatedly; `echo 3 > drop_caches` as a "fix" (page cache is reclaimable).
knowledge/runbooks/resource-exhaustion.md:52:**Durable fix:** persistent swapfile —
knowledge/runbooks/resource-exhaustion.md:63:**Diagnose:** `uptime` (1/5/15 load) vs `nproc`; `top -b -n1 | head -20` (%CPU, %wa); `ps -eo pid,ppid,pcpu,pmem,stat,comm --sort=-pcpu | head`; `vmstat 1 5` (r vs cores; high wa = I/O-bound); `ps -eo state,comm | grep -c '^D'` (uninterruptible-sleep = I/O load). **Critical USE distinction:** high load + high `%wa`/many `D`-state = I/O saturation (or NFS hang), **not CPU** — don't chase CPU if I/O-blocked.
knowledge/runbooks/resource-exhaustion.md:65:**Durable fix:** identify the process, fix its config/code — right-size worker counts to cores, fix the loop, throttle the cron. Bound with systemd: `[Service] CPUQuota=150% / CPUWeight=50` in a drop-in → `daemon-reload` + restart (cgroup-v2, reboot-safe). If I/O-bound, fix the storage root cause (§1/§2). Anti-pattern: `renice`/`kill` the symptom while a cron respawns it; rebooting to "clear load" without finding the producer; killing a `D`-state process.
knowledge/runbooks/resource-exhaustion.md:67:**⚠ AVOID:** `kill -9` a stateful service to drop load; mass-killing `D`-state procs; if unknown miner — **capture evidence (`ps`, `ls -la /proc/<pid>/exe`, `ss -tnp`) and report; deleting it to hide an intrusion is a safety failure.**
knowledge/runbooks/resource-exhaustion.md:71:**Root causes:** FD leak (sockets/files opened never closed — `/proc/<pid>/fd` climbs); limit too low for legit concurrency (default soft `nofile` 1024); **systemd services ignore limits.conf** — need `LimitNOFILE` in the unit (frequent gotcha); connection pile-up (CLOSE_WAIT/TIME_WAIT).
knowledge/runbooks/resource-exhaustion.md:72:**Durable fix — match the mechanism to how the process starts:**
knowledge/runbooks/resource-exhaustion.md:76:- **And fix the leak** — raising limits only buys time. Anti-pattern: `ulimit -n` in the SSH shell (dies with the session, never reaches the daemon); editing limits.conf expecting a systemd service to pick it up.
knowledge/runbooks/resource-exhaustion.md:78:**⚠ AVOID:** absurd `nofile` (`unlimited`/billions — wedges kernel/huge FD tables); lowering a hard limit below current usage; "fixing" by killing connections.
knowledge/runbooks/systemd-services.md:1:# Runbook — systemd & service lifecycle
knowledge/runbooks/systemd-services.md:24:**Durable fix:** edit via drop-in, never vendor file — `sudo systemctl edit UNIT` → `/etc/systemd/system/UNIT.d/override.conf` → `sudo systemctl daemon-reload`. For races add ordering (`Wants=network-online.target`+`After=network-online.target`), not `sleep`. For crash recovery: `Restart=on-failure`, sane `RestartSec=2s`, widen `StartLimitIntervalSec`/`StartLimitBurst` only if legitimately slow. Clear sticky state: `sudo systemctl reset-failed UNIT` (also resets the start-limit counter).
knowledge/runbooks/systemd-services.md:37:**Root causes:** ordering (`After=`/`Before=`) confused with pulling-in (`Requires=`/`Wants=`) — ordering alone doesn't pull a unit; requirement alone doesn't order it; depending on `network.target` (link up) when you need `network-online.target` (routable) and forgetting `Wants=` it; hard `Requires=`/`BindsTo=` on a failing unit tears yours down; typo'd dep name (implicit failing dep); missing `WantedBy=` in `[Install]`→enable is a no-op.
knowledge/runbooks/systemd-services.md:57:- `systemctl reload UNIT` — re-reads app config without dropping the process; use when `CanReload=yes` and you changed only the app's own config files.
knowledge/runbooks/systemd-services.md:58:- `systemctl restart UNIT` — required when you changed the **unit** (`ExecStart`, `Environment=`, deps) or the app has no reload.
knowledge/runbooks/systemd-services.md:60:- **Editing a unit/drop-in requires `systemctl daemon-reload`** to reparse — a plain reload/restart of the service does NOT pick up unit-file changes by itself.
knowledge/runbooks/systemd-services.md:76:Surfaces: stack traces, `Permission denied`, `Address already in use` (pair with `ss -ltnp | grep :PORT`), `Out of memory: Killed process`. If logs vanish after reboot the journal is volatile: persist durably via `/var/log/journal` + `[Journal] Storage=persistent` in `/etc/systemd/journald.conf` → `systemctl restart systemd-journald`. **Avoid `journalctl --vacuum-*`/`--rotate` during an active incident — may delete needed evidence.**
knowledge/runbooks/systemd-services.md:83:**Avoid:** editing `*.target.wants/` symlinks by hand; assuming `start` persists (it doesn't — only `enable` writes the boot symlink).
knowledge/runbooks/systemd-services.md:85:## 8. Drop-ins / overrides — precedence
knowledge/runbooks/systemd-services.md:87:**Precedence (dir, highest wins):** `/etc/systemd/system/UNIT.d/` (admin) > `/run/systemd/system/UNIT.d/` (runtime, volatile) > `/usr/lib|/lib/systemd/system/UNIT.d/` (vendor). Across dirs, files merge in **lexicographic filename order** (`10-`,`20-`…). Most settings last-wins; **list settings** (`After=`,`Environment=`,`ExecStartPre=`) *append* — to clear, assign empty once then re-add; `ExecStart=` must be cleared before re-setting.
knowledge/runbooks/systemd-services.md:90:**Avoid:** forgetting `daemon-reload` after on-disk edits; duplicate-named drop-ins across dirs (silent shadowing — `systemd-delta` reveals it).
knowledge/runbooks/systemd-services.md:111:- Never edit `/lib|/usr/lib/systemd/system/` (clobbered on upgrade) — use `/etc` drop-ins.
knowledge/safety/command-policy.md:1:# Safety Policy Reference — command gating & secret redaction
knowledge/safety/command-policy.md:4:> proposed command is **untrusted input** — the LLM proposing it is NOT approval. Architecture:
knowledge/safety/command-policy.md:25:- `\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r|--recursive\b.*--force)\b` targeting `/`, `/*`, `/etc`, `/var`, `/var/lib`, `/var/lib/postgresql`, `/var/lib/mysql`, `/home`, `/boot`, `/srv`, `/usr`, `/lib`, `/bin`, `/opt`, `/root`, `~` — irreversible mass deletion / OS or DB destruction / unbootable host.
knowledge/safety/command-policy.md:26:- `rm -rf --no-preserve-root /` — deliberately defeats coreutils' `/` guard.
knowledge/safety/command-policy.md:27:- `\brm\s+-[rf]+\s+\$\{?\w+\}?/` — variable-rooted recursive rm where `$DIR` may be empty → `rm -rf /` (the classic empty-variable footgun). Block any recursive rm whose path root is an unbounded variable.
knowledge/safety/command-policy.md:28:- `\bfind\s+/.*-delete\b` / `find / ... -exec rm` — aliased mass-delete that evades naive `rm` rules.
knowledge/safety/command-policy.md:32:- `:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:` (`:(){ :|:& };:`) and any `f(){ f|f& }` — exponential spawn → DoS.
knowledge/safety/command-policy.md:33:- `\bwhile\s+true\s*;\s*do\b` with `&` and no bound; `\byes\b.*>` to a file/device; `cat /dev/zero >` — unbounded CPU/disk fill.
knowledge/safety/command-policy.md:36:- `\bdd\b.*\bof=/dev/(sd[a-z]|nvme\d+n\d+|vd[a-z]|mapper/)` — raw block-device overwrite.
knowledge/safety/command-policy.md:37:- `\bmkfs(\.\w+)?\s+.*/dev/` — reformat → total data loss.
knowledge/safety/command-policy.md:38:- `\bwipefs\b`, `\bsgdisk\s+(-Z|--zap-all)`, `\bparted\b.*\b(rm|mklabel)`, destructive `\bfdisk\b`, `\bshred\b.*/dev/`, `\bblkdiscard\b` — destroy partition tables/signatures.
knowledge/safety/command-policy.md:42:- `\bchmod\s+(-[a-z]*R[a-z]*\s+)?0?777\b` on `/`,`/etc`,`/usr`,`/var`,`/bin`,`/lib`,`/boot`,`/home`, or recursive on system roots — world-writable → privilege escalation; breaks sshd/sudo (refuse loose perms).
knowledge/safety/command-policy.md:43:- `\bchmod\s+-[a-z]*R.*\s+/(etc|usr|var|bin|lib|boot)\b` and `\bchown\s+-[a-z]*R.*\s+/(etc|usr|var|bin|lib|boot|$)` — mass perm/owner change corrupts the system model, breaks setuid binaries.
knowledge/safety/command-policy.md:47:- `\bufw\s+disable\b`, `\bsystemctl\s+(stop|disable|mask)\s+(firewalld|ufw|nftables|iptables)`, `\biptables\s+-F\b`, `\bnft\s+flush\s+ruleset` — drops the firewall.
knowledge/safety/command-policy.md:48:- `\bsystemctl\s+(stop|disable|mask)\s+auditd`, `\bauditctl\s+-D\b` — disables audit logging (blinds detection + your own trail).
knowledge/safety/command-policy.md:49:- `\bsetenforce\s+0\b`, `SELINUX=disabled`, `\bsystemctl\s+(stop|disable)\s+apparmor`, `\baa-disable\b`, `\baa-teardown\b` — disables MAC confinement.
knowledge/safety/command-policy.md:50:- `\bsystemctl\s+(stop|disable)\s+(fail2ban|clamav|sshd)` — disables IPS/AV; stopping `sshd` can lock you out.
knowledge/safety/command-policy.md:51:- `\bchattr\s+-i\b` on protected files — removes immutability before tampering.
knowledge/safety/command-policy.md:54:- `(?i)\bDROP\s+DATABASE\b`, `(?i)\bDROP\s+SCHEMA\b`, `\bdropdb\b`, `\bmysqladmin\s+drop\b` — deletes a DB/schema.
knowledge/safety/command-policy.md:55:- `(?i)\bTRUNCATE\s+(TABLE\s+)?\w+`, `(?i)\bDELETE\s+FROM\s+\w+\s*(;|$)` (DELETE with no WHERE) — wipes rows.
knowledge/safety/command-policy.md:56:- `\binitdb\b`, `\bpg_resetwal\b`, `(?i)DROP\s+(TABLE|USER|ROLE)` — `initdb`/`pg_resetwal` over an existing cluster can corrupt.
knowledge/safety/command-policy.md:57:- `\bredis-cli\s+(FLUSHALL|FLUSHDB)`, `\bmongo.*\.(drop|dropDatabase)\(\)` — NoSQL wipe.
knowledge/safety/command-policy.md:60:### 7. History / log wiping (anti-forensics — hard-block + alert)
knowledge/safety/command-policy.md:61:- `\brm\b.*\s/var/log(/|\b)`, `>\s*/var/log/\w+`, `\btruncate\s+-s\s*0\s+/var/log/` — destroys system logs (and your evidence).
knowledge/safety/command-policy.md:62:- `\bhistory\s+-c\b`, `>\s*~?/\.bash_history`, `\bunset\s+HISTFILE`, `export\s+HISTSIZE=0` — shell-history wiping.
knowledge/safety/command-policy.md:64:- `>\s*/var/log/(wtmp|btmp|lastlog|auth\.log|secure)` — removes login records.
knowledge/safety/command-policy.md:68:- `\b(curl|wget|fetch)\b[^|]*\|\s*(sudo\s+)?(bash|sh|zsh|python[23]?|perl|ruby|node)\b` — `curl … | bash` runs unaudited remote code.
knowledge/safety/command-policy.md:69:- `\bbash\s+<\(\s*curl`, `\bsource\s+<\(curl`, `\beval\b.*\$\(.*\b(curl|wget)` — process-sub / eval variants.
knowledge/safety/command-policy.md:70:- `\bbase64\s+-d.*\|\s*(bash|sh)`, `echo\s+[A-Za-z0-9+/=]{40,}\s*\|\s*base64\s+-d\s*\|\s*sh` — obfuscated payload.
knowledge/safety/command-policy.md:71:- `\bnc\b.*-e\b`, `bash -i >& /dev/tcp/`, `mkfifo … | nc …` — reverse shells.
knowledge/safety/command-policy.md:74:- `>\s*/etc/(passwd|shadow|group|gshadow|sudoers|fstab|hosts|resolv\.conf|ssh/sshd_config|crontab)` (truncating `>`) — destroys identity/auth/mount/DNS/sudo config; can lock out all users / break boot.
knowledge/safety/command-policy.md:75:- `\btee\s+/etc/(passwd|shadow|sudoers)` — `tee` as a redirect bypass; non-interactive `visudo`/writes to `/etc/sudoers.d/*` granting NOPASSWD.
knowledge/safety/command-policy.md:76:- `>\s*~/.ssh/authorized_keys`, `>\s*/etc/(profile|environment|ld\.so\.conf)` — persistence/hijack.
knowledge/safety/command-policy.md:80:- `\bchmod\s+(u\+s|4[0-7]{3}|g\+s)\b` on a binary — setuid-root backdoor.
knowledge/safety/command-policy.md:81:- `\bsudo\b.*\bsu\s*-`, `sudo -i`, `sudo bash` proposed by the agent — escapes the gated-command model into an interactive root shell.
knowledge/safety/command-policy.md:82:- `\buseradd\b.*-o.*-u\s*0` (UID-0 user), `usermod -aG sudo`, editing `/etc/sudoers` — backdoor/priv grant.
knowledge/safety/command-policy.md:83:- `cron`/`at`/`systemd-run` installing a job re-exec'ing untrusted code — persistence.
knowledge/safety/command-policy.md:84:- `\bexport\s+LD_PRELOAD=`, `LD_LIBRARY_PATH=` injection, writing `/etc/ld.so.preload` — library-injection backdoor.
knowledge/safety/command-policy.md:87:- **DENY** — matches §1–10 → block + escalate; cannot be approved (or requires a typed override not exposed in the demo).
knowledge/safety/command-policy.md:88:- **CONFIRM** — `systemctl restart`, package installs, edits under `/etc`, `kill`, `sudo` writing outside the app's own dirs, targeted `DROP TABLE` → human approval naming the exact target.
knowledge/safety/command-policy.md:89:- **ALLOW** — non-escaping read/diagnostic verbs (`systemctl status/cat/show`, `journalctl`, `ss`, `ls`, `stat`, `df`, `free`, `cat` of non-secret config, `nginx -t`, `getfacl`, `namei`) → may auto-pass / batch-approve. Even ALLOW still passes through the gate and is logged.
knowledge/safety/command-policy.md:92:- **sudoers `Cmnd_Alias`** — exact-command allowlist; weakness: an allowlisted binary that can shell out or take a file-write arg reintroduces risk.
knowledge/safety/command-policy.md:93:- **OPA / Rego** — policy-as-code, `default allow := false`, deny-overrides; versionable + testable (`opa test`). You must tokenize the command before sending it the structured input.
knowledge/safety/command-policy.md:94:- **Shell AST parsers** — `bashlex` (Python), `mvdan/sh` (Go, most production-grade), `tree-sitter-bash` — reason over real tokens/redirections/pipelines; defeats obfuscation. **Recommended for our parse step.**
knowledge/safety/command-policy.md:95:- **explainshell** — token→man-page meaning; great to *show the approver* what `-rf`/`--no-preserve-root`/`of=` mean (UX/explainability, not enforcement).
knowledge/safety/command-policy.md:96:- **Sandboxing** — `bubblewrap`/`firejail`/seccomp/namespaces/gVisor, read-only bind mounts, low-priv account, drop capabilities.
knowledge/safety/command-policy.md:97:- **Agent tool-approval** — Anthropic/OpenAI human-in-the-loop permission patterns; NeMo Guardrails, Guardrails AI, Llama Guard.
knowledge/safety/command-policy.md:156:- **Least privilege:** run as a dedicated low-priv account, not root; elevate only via tightly scoped `sudoers` `Cmnd_Alias` (no shell-out wildcards); drop capabilities + seccomp + sandbox with read-only mounts; prefer argv-exec (`execve`/`ProcessBuilder`) over `system()` — no shell interpolation (kills `;`/`&&`/`$()` injection).
knowledge/safety/command-policy.md:157:- **Execution hygiene:** **timeout every command** (`timeout 60s …`, kill the process group); **non-interactive flags only** (`apt-get -y`, `DEBIAN_FRONTEND=noninteractive`, `psql -v ON_ERROR_STOP=1 --no-password`, `ssh -o BatchMode=yes`) — a command that *would* prompt is rejected, not auto-answered; **never pass secrets in argv** (visible via `/proc/<pid>/cmdline`) — use credential files / scoped env / stdin; apply `ulimit`/cgroup caps so a missed fork-bomb/disk-fill is still contained.

## Package Manager Files

.npmrc
backend/package-lock.json
frontend/bun.lock
pnpm-lock.yaml
pnpm-workspace.yaml

## Package Scripts

### backend/package.json
- dev: `node --env-file-if-exists=../.env --import tsx --watch src/index.ts`
- start: `node --env-file-if-exists=../.env --import tsx src/index.ts`
- test: `vitest run`
### frontend/package.json
- build: `tsc -b && vite build`
- dev: `vite --host 0.0.0.0 --port 5173`
- preview: `vite preview --host 0.0.0.0 --port 5173`
- test: `vitest run`
### package.json
- build: `pnpm --dir frontend build`
- test: `pnpm --dir backend test && pnpm --dir frontend test`

## TypeScript Config Files

backend/tsconfig.json
frontend/tsconfig.json

## Test Config Files

None found.

## CI Files

.github/workflows/ci.yml

## Ignored And Untracked Summary

### Ignored

Ignored files: 9695
.DS_Store
.claude/settings.local.json
backend/node_modules/.bin/tsc
backend/node_modules/.bin/tsserver
backend/node_modules/.bin/tsx
backend/node_modules/.bin/ulid
backend/node_modules/.bin/vite
backend/node_modules/.bin/vitest
backend/node_modules/.package-lock.json
backend/node_modules/.vite/vitest/da39a3ee5e6b4b0d3255bfef95601890afd80709/results.json
backend/node_modules/@ai-sdk/openai
backend/node_modules/@hono/node-server
backend/node_modules/@hono/zod-validator
backend/node_modules/@types/better-sqlite3
backend/node_modules/@types/node
backend/node_modules/@types/ssh2
backend/node_modules/ai
backend/node_modules/better-sqlite3
backend/node_modules/hono
backend/node_modules/ssh2
backend/node_modules/tsx
backend/node_modules/typescript
backend/node_modules/ulid/LICENSE
backend/node_modules/ulid/README.md
backend/node_modules/ulid/dist/browser/index.cjs
backend/node_modules/ulid/dist/browser/index.js
backend/node_modules/ulid/dist/cli.d.cts
backend/node_modules/ulid/dist/cli.d.ts
backend/node_modules/ulid/dist/cli.js
backend/node_modules/ulid/dist/constants.d.cts
backend/node_modules/ulid/dist/constants.d.ts
backend/node_modules/ulid/dist/crockford.d.cts
backend/node_modules/ulid/dist/crockford.d.ts
backend/node_modules/ulid/dist/error.d.cts
backend/node_modules/ulid/dist/error.d.ts
backend/node_modules/ulid/dist/index.d.cts
backend/node_modules/ulid/dist/index.d.ts
backend/node_modules/ulid/dist/node/index.cjs
backend/node_modules/ulid/dist/node/index.js
backend/node_modules/ulid/dist/stub.d.cts
backend/node_modules/ulid/dist/stub.d.ts
backend/node_modules/ulid/dist/types.d.cts
backend/node_modules/ulid/dist/types.d.ts
backend/node_modules/ulid/dist/ulid.d.cts
backend/node_modules/ulid/dist/ulid.d.ts
backend/node_modules/ulid/dist/utils.d.cts
backend/node_modules/ulid/dist/utils.d.ts
backend/node_modules/ulid/dist/uuid.d.cts
backend/node_modules/ulid/dist/uuid.d.ts
backend/node_modules/ulid/package.json
backend/node_modules/vitest
backend/node_modules/zod
frontend/dist/assets/index-C7UYC-9s.js
frontend/dist/assets/index-fgWg7fbm.css
frontend/dist/index.html
frontend/node_modules/.bin/baseline-browser-mapping
frontend/node_modules/.bin/browserslist
frontend/node_modules/.bin/esbuild
frontend/node_modules/.bin/jsesc
frontend/node_modules/.bin/json5
frontend/node_modules/.bin/loose-envify
frontend/node_modules/.bin/nanoid
frontend/node_modules/.bin/parser
frontend/node_modules/.bin/rolldown
frontend/node_modules/.bin/rollup
frontend/node_modules/.bin/semver
frontend/node_modules/.bin/tsc
frontend/node_modules/.bin/tsserver
frontend/node_modules/.bin/update-browserslist-db
frontend/node_modules/.bin/vite
frontend/node_modules/.bin/vitest
frontend/node_modules/.bin/why-is-node-running
frontend/node_modules/.vite/deps/_metadata.json
frontend/node_modules/.vite/deps/chunk-FROWYQ3B.js
frontend/node_modules/.vite/deps/chunk-FROWYQ3B.js.map
frontend/node_modules/.vite/deps/chunk-PMBRD3ZB.js
frontend/node_modules/.vite/deps/chunk-PMBRD3ZB.js.map
frontend/node_modules/.vite/deps/package.json
frontend/node_modules/.vite/deps/react-dom.js
frontend/node_modules/.vite/deps/react-dom.js.map

### Untracked

Untracked files: 4
.planning/audits/00-MECHANICAL-SCAN.md
AGENTS.md
frontend/bun.lock
scripts/audit-v1-skeleton.sh
