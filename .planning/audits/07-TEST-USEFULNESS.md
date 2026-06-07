# 07 - Test Usefulness Audit (v1.1)

Scope: Validate whether current tests prove the skeleton works end-to-end and identify the minimal useful set of v1.1 tests.

Status: REPORT ONLY (no source changes).

## 1) Executive findings

- The suite is strong at isolated handler coverage and policy checks, but weak at proving the connected runtime path.
- Most high-value gaps are missing integration/smoke coverage around startup, route-to-route flow, SSE/event wiring, and frontend/main-path rendering.
- No tests currently verify the full v1.1 skeleton behavior in one executable path.

## 2) Findings mapped to requested categories

### 2.1 Pass-always / low-signal assertions
- Finding: I did not find literal `expect(true).toBe(true)`-style pass-only tests.
- Evidence paths:
  - `backend/src/tests/*.ts` (scanned for `skip`/`todo` style and obvious pass-always patterns)
- Why it hurts velocity:
  - This is good; however, many tests are still not end-to-end and create a false sense of confidence.
- Smallest cleanup:
  - Keep this as-is and shift focus to high-signal integration tests that fail if real flow wiring is broken.

### 2.2 Tests that grep source text
- Finding: Multiple tests assert policy by reading file contents and matching strings instead of exercising behavior.
- Evidence:
  - `backend/src/tests/ssh-tools-guard.test.ts` reads AI tool source to ensure a tool name is not in a whitelist.
  - `backend/src/tests/ssh-executor.test.ts` recursively reads `ai/tools` and checks for forbidden substrings in source lines.
  - `backend/src/tests/ssh-mock.test.ts` performs similar source scans for disallowed patterns.
  - `backend/src/tests/orchestrator.test.ts` includes comments/CI-oriented assertions around hardcoded strings.
- Why it hurts velocity:
  - These pass when code shape matches policy but fail to verify actual runtime safety behavior, so regressions in execution path can ship undetected.
- Smallest cleanup:
  - Replace the multi-file string scans with one runtime-focused boundary test per policy family that invokes registration/execution and asserts actual tool availability or restriction.

### 2.3 Tests for deleted/unreachable behavior
- Finding: Frontend component and hook code exists but is not exercised through the mounted app path.
- Evidence:
  - `frontend/src/main.tsx` renders `App` directly.
  - `frontend/src/App.tsx` owns the main route structure.
  - `frontend/src/components/TicketListView.tsx`, `frontend/src/components/RunView.tsx`, `frontend/src/components/ActivityView.tsx`, `frontend/src/components/ApprovalCard.tsx`, and `frontend/src/hooks/*` are not directly validated by current tests.
  - `frontend/src/utils/mappers.test.ts` is the only frontend test file and only validates utility mapping.
- Why it hurts velocity:
  - Refactors can pass tests while main UI path silently breaks, forcing late manual verification and making regressions expensive.
- Smallest cleanup:
  - Add one App-level smoke test and one main flow component test that renders `App`, stubs API calls, and verifies key route-level UI behavior.

### 2.4 Duplicate/duplicated intent due excessive mocks
- Finding: Route-level and orchestration tests are highly mocked and mostly validate call wiring.
- Evidence:
  - `backend/src/tests/runs.test.ts` mocks env and stubs core orchestrator advance flow.
  - `backend/src/tests/approvals.test.ts` relies on mocked orchestrator advancement in most paths.
  - `backend/src/tests/activity.test.ts` mocks env and generator + Phoenix side effects.
  - `backend/src/tests/phoenix-client.test.ts` uses extensive global `fetch` stubs.
  - `backend/src/tests/orchestrator.test.ts` mocks analyzers/validators/executor pieces in many cases.
- Why it hurts velocity:
  - Teams spend time maintaining brittle tests that can pass while real composition and IO boundaries are broken.
- Smallest cleanup:
  - Keep one thin unit test per module, and replace overlapping mocked route/orchestrator tests with one realistic integration flow test per endpoint cluster.

### 2.5 Skipped, x-ed, or intentionally omitted test execution
- Finding: No explicit `describe.skip`, `it.skip`, `test.skip`, `xit`, or `xtest` markers were found in current test files.
- Why it hurts velocity:
  - Good baseline; no dead test debt in skipped state.
- Smallest cleanup:
  - Continue this standard; avoid adding skip-heavy debt and keep disabled tests removed or replaced.

### 2.6 Tests that cannot run as meaningful skeleton proof
- Finding: Nothing appears hard-skipped, but several tests are non-representative of connected runtime behavior.
- Evidence:
  - `backend/src/tests/model-provider.test.ts`/`phoenix`/orchestrator-style tests are useful for contracts but do not represent real startup + route composition.
  - Frontend tests do not instantiate app startup and therefore do not prove browser/runtime bootstrap behavior.
- Why it hurts velocity:
  - CI can be green while end-user and integration behavior remains unproven, delaying discovery until later integration passes.
- Smallest cleanup:
  - Add one executable skeleton smoke path per process boundary and gate non-trivial PRs on it.

### 2.7 Missing smoke tests and boot tests
- Finding: `backend/src/index.ts` has important startup/shutdown wiring (env validation, server binding, SIGINT/SIGTERM handlers), but no automated test exercises these in-process.
- Evidence:
  - `backend/src/index.ts` contains process bootstrap and lifecycle setup.
  - Test scan shows no dedicated backend boot/smoke entry covering process lifecycle.
  - Root/package scripts run unit suites only.
- Why it hurts velocity:
  - Critical startup breakage reaches production without a narrow, fast guard in CI.
- Smallest cleanup:
  - Add one lightweight boot smoke test that boots the backend with test env, asserts ready endpoint/route, and verifies graceful stop handling.

### 2.8 Missing main-flow regression tests
- Finding: No full skeleton flow test stitches ticket -> run -> approvals -> events -> activity into one executable sequence.
- Evidence:
  - Route tests are isolated: `tickets.test.ts`, `runs.test.ts`, `approvals.test.ts`, `events.test.ts`, `activity.test.ts`.
  - No single test covers sequence across routes and event bus.
- Why it hurts velocity:
  - Cross-route regressions slip through; individual endpoint fixes can break the user journey while all unit tests pass.
- Smallest cleanup:
  - Replace a subset of isolated route assertions with one end-to-end flow test using deterministic stubs and explicit state assertions.

## 3) v1.1 minimum useful test set (smallest set)

### 3.1 Backend
1. `backend/src/tests/integration/backend-smoke.test.ts`
   - Start server with test configuration, assert startup succeeds, `/api/tickets`/health-ish route responds, and graceful stop path executes once.
2. `backend/src/tests/integration/main-flow-regression.test.ts`
   - Create ticket, create run, call `/next`, submit approval path, and check persisted status/activity transitions.
3. `backend/src/tests/integration/sse-event-contract.test.ts`
   - Open SSE stream and verify event frame names, payload contract, and event bus replay/close behavior used by frontend consumers.
4. `backend/src/tests/integration/ai-boundary.test.ts`
   - Validate one typed AI/ML boundary path with a real-like provider stub and explicit schema/error handling.

### 3.2 Frontend
5. `frontend/src/tests/App.smoke.test.tsx`
   - Render `App`, assert main routes mount, API client is invoked, and unconnected UI branches are not silently hidden.
6. `frontend/src/tests/main-flow.integration.test.tsx`
   - Cover the same route-level story as backend through mocked API layer: create ticket, start run, process approval, render updated activity.
7. `frontend/src/tests/errors-handling.test.tsx`
   - Validate that API failures, empty states, and event stream drop are user-visible and non-crashing.

### 3.3 Test debt cleanup
8. Merge `ssh-tools-guard.test.ts`, `ssh-executor.test.ts`, `ssh-mock.test.ts` into one policy test that verifies behavior rather than textual matching.
9. Drop or rewrite one of the most redundant mocked route tests in `approvals`/`runs`/`activity` to reduce maintenance while keeping line-level unit tests where they add confidence.

## 4) Recommendation summary

- Primary v1.1 vertical slice to stabilize first: **backend-to-frontend run lifecycle** (ticket creation through run execution and activity visibility), with SSE event contract included.
- This slice should include one boot smoke test and one full main-flow regression test in each process boundary.
- Everything else should be pruned to low-noise unit tests and only one remaining mock-heavy layer per boundary.
