# 01 Empty, Placeholder, Phase Leftovers Audit

Date: 2026-06-07
Mode: v1.1 Professional Skeleton Rescue
Scope: `AGENTS.md`, `.planning/audits/00-MECHANICAL-SCAN.md`, `.planning/codebase/*.md`, `.planning/graphs/`, and the full tracked repo.
Constraint: Report only. No source code was modified.

## Method

- Checked tracked empty files with `git ls-files` and file-size checks.
- Searched current source, tests, docs, and planning files for placeholders, TODO/FIXME/HACK, commented-out code, source-grep tests, stub exports, disconnected modules, stale phase artifacts, duplicate service layers, package-manager leftovers, and unclear modules.
- Treated archived milestone history and generated graph output as `ignore/generated` unless the stale content is repeated in current source, current docs, or current planning files.

## Summary

- Empty tracked files: none found.
- Current skeleton risks: disconnected AI tool files, a disconnected analyzer agent, fake/inaccurate persistence fallback, stale event-name contracts, swallowed frontend API failures, source-grep safety tests, stale docs, and disconnected demo/sandbox/shared tooling.
- Current TODO/FIXME/HACK in source: none found.
- Commented-out production code: none found.
- The largest v1.1 risk is not one empty file. It is current tracked files that imply capabilities the main path does not actually use.

## Findings

| ID | Path | Evidence | Intended role | Path class | v1.1 decision |
| --- | --- | --- | --- | --- | --- |
| PH-001 | `backend/src/ai/tools/audit-tools.ts` | File only contains `// Audit read tools for model context - implemented in Phase 5` and `export {}`. `.planning/codebase/CONCERNS.md` also names it as an empty module. | AI SDK read tools for audit-log context. | Core-adjacent | delete |
| PH-002 | `backend/src/ai/tools/phoenix-tools.ts` | File only contains `// Phoenix read tools for model context - implemented in Phase 2` and `export {}`. No production imports found. | AI SDK read tools for Phoenix ticket/customer-system context. | Core-adjacent | delete |
| PH-003 | `backend/src/ai/tools/safety-tools.ts` | File only contains `// Safety classification tools - implemented in Phase 3` and `export {}`. No production imports found. | AI SDK read tools for command safety classification. | Core-adjacent | delete |
| PH-004 | `backend/src/ai/tools/ssh-tools.ts` | Exports `proposeSshCommand = tool(...)`, but no production agent imports it. Docs say the model's only shell tool is `proposeSshCommand`; current agents call `generateObject` without tools. | Model-facing safe SSH proposal tool. | Core-adjacent | wire |
| PH-005 | `backend/src/ai/agents/customer-system-analyzer.ts` | Implements `runCustomerSystemAnalyzer`, and the prompt exists, but no production import was found. `.planning/codebase/ARCHITECTURE.md` says it is not wired into the main run flow. | Read-only baseline agent before problem analysis. | Core-adjacent | wire |
| PH-006 | `backend/src/events/sse.ts`, `frontend/src/hooks/useRunEvents.ts`, `backend/src/ai/orchestrator.ts` | Shared/frontend event contracts include `validation.completed` and `activity.drafted`, while the orchestrator emits/audits `validation.complete` and `activity.draft_ready`. | Live run progress event contract. | Core | finish |
| PH-007 | `frontend/src/api.ts` | `listTickets()` catches every error and returns `[]`, while `useTickets()` has an error path that never sees those failures. | Frontend API wrapper for ticket list. | Core | finish |
| PH-008 | `backend/src/routes/approvals.ts` | The approval route accepts `editedCommand`, sets `finalCommand`, then returns `safetyRecheck` from the original approval risk instead of reclassifying the edited command. | Human approval and safety response for final SSH command. | Core | finish |
| PH-009 | `backend/src/store/db.ts` | Store mode is `sqlite | jsonl`, but `makeJsonlAdapter()` is an in-memory `Map`. SQLite failures fall back to that adapter and log a warning. | Durable audit/run store fallback. | Core | finish |
| PH-010 | `README.md`, `docs/INFRASTRUCTURE.md`, `backend/src/store/db.ts` | Docs claim real mode refuses non-durable fallback and/or JSONL fallback provides durability, but code falls back to an in-memory adapter named `jsonl`. | Truthful persistence documentation. | Core docs | finish |
| PH-011 | `backend/src/app.ts` | Exports `errorHandler`, but `createApp()` wires an inline `app.onError` handler instead. | Reusable app-level error handling. | Core | wire |
| PH-012 | `backend/src/ai/model.ts` | `MOCK_MODEL` returns `{}` from `doGenerate`; structured agents need schema-valid objects. Mock diagnostic/activity fixtures exist in tests, not in production mock mode. | Offline/mock LLM mode for full troubleshooting loop. | Core | finish |
| PH-013 | `backend/src/ai/agents/problem-analyzer.ts`, `problem-solver.ts`, `validator.ts`, `activity-log-generator.ts`, `customer-system-analyzer.ts` | Agent `catch` blocks normalize failures to `AgentUnavailableError` but drop the original cause. This is not silent, but it makes model/provider failures harder to diagnose. | Agent error boundary. | Core | simplify |
| PH-014 | `backend/src/tests/ssh-tools-guard.test.ts` | Reads `../ai/tools/ssh-tools.ts` as text and asserts regex/source strings such as `tool(` and absence of `execute`. | Safety invariant test for model tool shape. | Test | finish |
| PH-015 | `backend/src/tests/ssh-executor.test.ts` | Contains recursive `grepDir()` source scanning and asserts no `executeApprovedCommand` appears in AI tool files. | Safety invariant test for execution isolation. | Test | finish |
| PH-016 | `backend/src/tests/ssh-mock.test.ts` | Contains recursive source scanning for guard checks instead of behavioral/module-boundary assertions. | Safety invariant test for SSH mock boundaries. | Test | finish |
| PH-017 | `backend/src/store/db.ts`, `backend/src/tests/orchestrator.test.ts`, `backend/src/tests/sse-audit-symmetry.test.ts`, `backend/src/tests/ssh-executor.test.ts`, `frontend/src/hooks/useTickets.ts` | Stale `eslint-disable` comments exist even though no repo lint contract is wired. Tests also use broad `vi.spyOn<any, any>` suppressions. | Suppression comments and test type workarounds. | Mixed | simplify |
| PH-018 | `backend/package-lock.json` | Tracked npm lockfile exists alongside root `pnpm-lock.yaml`, `.npmrc`, and pnpm-based backend scripts/Dockerfile. | Backend dependency lock. | Core tooling | simplify |
| PH-019 | `frontend/bun.lock` | Untracked Bun lock exists while frontend package scripts and root workspace use pnpm/npm conventions. | Frontend dependency lock. | Core tooling | delete |
| PH-020 | `demo/package.json`, `demo/remotion/package.json`, `demo/remotion/package-lock.json` | Demo packages are tracked but outside `pnpm-workspace.yaml`; Remotion uses its own npm lock. | Demo video tooling. | Non-core | backlog |
| PH-021 | `sandbox/package.json` | Uses Bun scripts and is outside root workspace scripts. `sandbox/README.md` references root-style `sandbox:*` commands that do not exist in the root package. | Local fake-VM incident harness. | Non-core | wire |
| PH-022 | `package.json`, `.github/workflows/ci.yml` | Root `build` only builds frontend. CI runs backend typecheck and backend tests only. Frontend tests/build and non-core packages are not covered. | Project verification entrypoints. | Core tooling | finish |
| PH-023 | `frontend/Dockerfile` | Uses `node:20-slim`, `npm install`, and `npm run dev`, while the main project uses Node 22/pnpm and production frontend build output. | Frontend container for local/demo use. | Core tooling | simplify |
| PH-024 | `.env.example`, `backend/src/env.ts` | `.env.example` describes Azure/OpenAI-compatible settings that are not represented by the current env schema. | Truthful runtime configuration template. | Core docs | finish |
| PH-025 | `backend/src/phoenix/client.ts` | `getMe()` is implemented and tested, but no production caller was found. `setStatus()` is wired from activity submission, so it is not a leftover. | Phoenix current-user lookup. | Core-adjacent | backlog |
| PH-026 | `docs/LIMITATIONS.md` | Says the product is mid-build, the agent loop/UI are not wired, SSH/orchestrator/routes/activity/frontend are stubs, and orchestrator tests are pending. Current source has those modules implemented. | Honest limitations register. | Non-core docs | finish |
| PH-027 | `demo/record.mjs` | Uses stale UI selectors/text such as `.tk`, `.ticket-head`, `Start AI troubleshooting session`, `Generate documentation`, `.field`, and `Submit activity to ERP`. Current frontend uses different run and activity review labels. | Demo recording script. | Non-core | backlog |
| PH-028 | `demo/README.md` | References ticket `#7001` and demo flow details that do not match current scenario IDs and UI labels. | Demo operator documentation. | Non-core docs | backlog |
| PH-029 | `backend/src/sandbox/*`, `sandbox/scenarios/*` | Backend imports `backend/src/sandbox/registry.js`; top-level sandbox has a separate scenario registry and JSON catalog. These are two scenario layers with overlapping intent. | Scenario data for mock Phoenix and sandbox harness. | Mixed | simplify |
| PH-030 | `shared/safety-rules.json` | Claims shared safety rules, but production backend uses `backend/src/safety/command-policy.ts`; no production import of the JSON rules was found. | Cross-backend safety policy source. | Non-core safety-adjacent | backlog |
| PH-031 | `shared/tests/check_safety.mjs`, `shared/tests/check_safety.py` | Tests validate shared safety JSON but are not wired into root scripts or CI. | Shared safety-rule verification. | Non-core test | backlog |
| PH-032 | `shared/agent-spec.md` | Describes Python and Node backends, Azure/OpenRouter/local providers, and broader cross-backend architecture that no longer matches the current tracked app. | Cross-backend agent contract. | Non-core docs | delete |
| PH-033 | `.planning/codebase/STACK.md` | Contains old Python/FastAPI stack content despite current backend being TypeScript/Hono. | Current codebase stack map. | Planning docs | finish |
| PH-034 | `.planning/codebase/ARCHITECTURE.md` | Mixes useful current TypeScript/Hono notes with unresolved disconnected-agent notes. | Current architecture map. | Planning docs | finish |
| PH-035 | `.planning/codebase/STRUCTURE.md` | Contains old references to `requirements.txt`, `backend/app/main.py`, and Python skeleton structure. | Current structure map. | Planning docs | finish |
| PH-036 | `.planning/codebase/CONVENTIONS.md` | Contains old Python/FastAPI convention sections and stale lint/test assumptions. | Current coding conventions. | Planning docs | finish |
| PH-037 | `.planning/codebase/TESTING.md` | Contains old Python/FastAPI testing content and also flags source-grep test concerns. | Current testing map. | Planning docs | finish |
| PH-038 | `.planning/codebase/CONCERNS.md` | Contains old "backend entirely unimplemented" Python skeleton concerns alongside current TypeScript skeleton concerns. | Current concern register. | Planning docs | finish |
| PH-039 | `.planning/codebase/INTEGRATIONS.md` | References `backend/app/main.py` and old integration shape, while current integrations live in TypeScript modules. | Current integration map. | Planning docs | finish |
| PH-040 | `REPORT.md` | Claims two interchangeable backends, Python/FastAPI/Paramiko and Hono/AI SDK v6. The repo now has a Node/Hono backend only. | Submission or project report. | Non-core docs | finish |
| PH-041 | `docs/RESULTS.md` | Says only phases 1-3 are complete and that AI/SSH/events/routes are stubs. Current source has implemented TypeScript modules. | Results/status documentation. | Non-core docs | finish |
| PH-042 | `docs/GLOSSARY.md` | Defines old coarse phase values such as `ANALYSIS`, `DIAGNOSIS`, `FIX`, `VALIDATION`, and `REPORT`; current run phases use newer values. | Shared term definitions. | Non-core docs | finish |
| PH-043 | `CLAUDE.md` | Contains instructions such as leaving TODO comments that conflict with `AGENTS.md` v1.1 skeleton rescue rules. | Agent guidance. | Project guidance | finish |
| PH-044 | `.planning/STATE.md`, `.planning/PROJECT.md` | Current planning state still lists manual validation debt: fresh clone Docker, real Phoenix/SSH/LLM, demo video, and submission form. | Release readiness tracking. | Planning docs | backlog |
| PH-045 | `.planning/audits/00-MECHANICAL-SCAN.md` | Untracked generated scan includes archive hits and historical phase references. Useful as scan evidence but noisy as a current defect list. | Mechanical scan baseline. | Audit docs | ignore/generated |
| PH-046 | `scripts/audit-v1-skeleton.sh` | Untracked one-off scanner that writes `00-MECHANICAL-SCAN.md`; not wired into package scripts. | Audit helper script. | Non-core tooling | delete |
| PH-047 | `.planning/graphs/` | Ignored generated graph output. It should not drive current defect counts unless a current graph node points to a tracked current file issue. | Generated planning graph. | Generated | ignore/generated |
| PH-048 | `.planning/milestones/**` | Archive contains old TODO/TBD/stub references and historical plan text. These are not current source defects by themselves. | Historical phase records. | Archive | ignore/generated |
| PH-049 | `docs/API.md` | Lists run lifecycle endpoints as planned/stubbed Phase 6+ work even though the current backend mounts implemented run, approval, event, and activity routes. | Backend API reference. | Non-core docs | finish |
| PH-050 | `docs/TASKS.md` | Keeps old unchecked P0 build tasks such as repo migration, Phoenix client, SSH executor, run routes, SSE, activity generator, and frontend, despite current source containing those modules. | Build task board. | Non-core docs | finish |

## Negative Findings

- No empty tracked files were found.
- No current tracked source TODO/FIXME/HACK markers were found outside docs/planning/history text.
- No current production commented-out code block was found.
- `keys/.gitkeep` and `demo/remotion/public/.gitkeep` are not empty tracked files; both contain explanatory text.

## Highest-Risk Skeleton Decisions

1. Finish the current core flow contract: SSE event names, approval reclassification, mock LLM output, and activity/Phoenix status behavior need to be made truthful and connected.
2. Delete or backlog disconnected AI tool placeholders. Empty `export {}` files should not remain in source.
3. Replace fake durability. The in-memory adapter should not be named `jsonl`, and real mode should not silently lose audit durability.
4. Replace source-grep safety tests with behavior or module-boundary tests.
5. Pick a package-manager and workspace boundary. Backend npm lockfiles, untracked frontend Bun lockfiles, and out-of-workspace demo/sandbox packages are skeleton leftovers until intentionally wired or removed.
6. Refresh `.planning/codebase/*.md`, `REPORT.md`, `docs/RESULTS.md`, `docs/GLOSSARY.md`, and `CLAUDE.md` so project guidance no longer describes the old Python/dual-backend skeleton.
