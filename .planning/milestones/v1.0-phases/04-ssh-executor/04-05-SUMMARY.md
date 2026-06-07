---
phase: 04-ssh-executor
plan: "05"
subsystem: ai
tags: [vercel-ai-sdk, ssh, tool, mock, typescript]

# Dependency graph
requires:
  - phase: 04-03
    provides: executeApprovedCommand, runPreflight, createSshExecutor (real)
  - phase: 04-04
    provides: MockSshExecutor, createMockSshExecutor, MOCK_SSH_FIXTURES

provides:
  - proposeSshCommand AI SDK tool (no execute callback)
  - executeApprovedCommand backend-only async function (re-exported from ssh-tools.ts)
  - createSshExecutor() factory — selects mock/real via resolveClientMode('ssh')
  - A1 guard test preventing executeApprovedCommand ever being registered as a model tool

affects: [05-orchestrator, ai-agents, phase-5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "proposeSshCommand uses tool() with parameters (not execute) — AI SDK v4 pattern for proposal-only tools"
    - "createSshExecutor() factory switches on resolveClientMode — consistent with Phoenix/LLM client mode pattern"
    - "A1 guard test reads source at test time to enforce architectural invariant"

key-files:
  created:
    - backend/src/ai/tools/ssh-tools.ts
    - backend/src/tests/ssh-tools-guard.test.ts
  modified:
    - backend/src/tests/ssh-executor.test.ts
    - backend/src/tests/ssh-mock.test.ts

key-decisions:
  - "AI SDK v4 tool() uses `parameters` field, not `inputSchema` — corrected from plan wording"
  - "Pre-existing A1 guards in ssh-executor.test.ts and ssh-mock.test.ts were over-broad (banned any import from ai/tools/); narrowed to the true invariant: never passed to tool()"
  - "createSshExecutor in ssh-tools.ts builds a plain object adapter wrapping the real functions — avoids re-exporting executor.ts's createSshExecutor and shadowing it"

patterns-established:
  - "Proposal tools: tool({ description, parameters }) with NO execute — human approval gates all execution"
  - "A1 guard: source-level regex test asserting tool() never wraps executeApprovedCommand"

requirements-completed: [DIAG-06]

# Metrics
duration: 4min
completed: 2026-06-06
---

# Phase 4 Plan 05: SSH Tools Wiring Summary

**`proposeSshCommand` AI SDK v4 tool wired with no execute callback, `executeApprovedCommand` exported as backend-only function, `createSshExecutor()` factory selects mock/real via `resolveClientMode`, A1 guard test permanently enforces the architectural invariant**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-06T20:56:41Z
- **Completed:** 2026-06-06T21:00:05Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Implemented `backend/src/ai/tools/ssh-tools.ts` — 38-line module closing the Phase 4 wiring loop
- `proposeSshCommand` is a valid AI SDK v4 `tool()` with 5-field `parameters` schema and no `execute` property
- `createSshExecutor()` factory correctly delegates to `createMockSshExecutor()` or a real adapter based on `resolveClientMode('ssh')`
- A1 guard test (`ssh-tools-guard.test.ts`) permanently blocks any future attempt to pass `executeApprovedCommand` to `tool()`
- Full test suite green: 287/287 passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement ssh-tools.ts** - `faf45f0` (feat)
2. **Task 2: A1 guard test + fix over-broad A1 assertions** - `9136971` (test)

## Files Created/Modified
- `backend/src/ai/tools/ssh-tools.ts` - proposeSshCommand tool, executeApprovedCommand backend fn, createSshExecutor factory
- `backend/src/tests/ssh-tools-guard.test.ts` - A1 enforcement guard (3 tests)
- `backend/src/tests/ssh-executor.test.ts` - Narrowed A1 assertion from "never imported" to "never passed to tool()"
- `backend/src/tests/ssh-mock.test.ts` - Narrowed A1 assertion from "never imported" to "never passed to tool()"

## Decisions Made
- AI SDK v4 `tool()` uses `parameters` not `inputSchema` — the plan used v5 terminology; corrected at implementation time
- The real SSH adapter in `createSshExecutor()` is a plain object satisfying `SshExecutor` rather than re-using `executor.ts`'s own `createSshExecutor` — avoids name collision and keeps the factory logic explicit
- Pre-existing A1 guards in `ssh-executor.test.ts` and `ssh-mock.test.ts` asserted zero imports of executor symbols in `ai/tools/` — now that `ssh-tools.ts` legitimately imports them, those guards were over-broad. Narrowed to the correct invariant: `tool(` never wraps `executeApprovedCommand`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] AI SDK v4 uses `parameters` not `inputSchema` in tool()**
- **Found during:** Task 1 (implement ssh-tools.ts)
- **Issue:** Plan referenced `inputSchema` which is a v5 API; installed SDK is v4.3.19 which requires `parameters`
- **Fix:** Used `parameters: z.object({...})` in the `tool()` call
- **Files modified:** `backend/src/ai/tools/ssh-tools.ts`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `faf45f0`

**2. [Rule 1 - Bug] Over-broad A1 guards in pre-existing tests broke on legitimate imports**
- **Found during:** Task 2 (full test suite run)
- **Issue:** `ssh-executor.test.ts` and `ssh-mock.test.ts` A1 guards grepped for any reference to executor symbols in `ai/tools/` — this was correct when `ssh-tools.ts` was a stub but fails now that it legitimately imports `executeApprovedCommand` and `createMockSshExecutor` to build the factory
- **Fix:** Narrowed both guards to the correct A1 invariant: regex `tool\s*\([^)]*executeApprovedCommand` must not match — imports are allowed, wrapping in `tool()` is not
- **Files modified:** `backend/src/tests/ssh-executor.test.ts`, `backend/src/tests/ssh-mock.test.ts`
- **Verification:** Full suite 287/287 green
- **Committed in:** `9136971`

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes were necessary for correctness — one an API version mismatch, one a test guard that had become stale. No scope creep.

## Issues Encountered
- Relative import paths from `ai/tools/` required `../../ssh/` prefix (not `../ssh/`) — caught immediately by `tsc`

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 wiring is fully closed: safety layer, run store, SSH executor, SSH mock, and SSH tools are all implemented
- Phase 5 (orchestrator) can import `createSshExecutor` from `ai/tools/ssh-tools.ts` and call `executeApprovedCommand` through it — it never needs to know whether it's talking to a real VM or the mock
- `proposeSshCommand` is ready to be passed to `generateObject`/`streamText` agent calls
- Blocker remains: SSH `.pem` key not yet in `keys/` for real VM operation

---
*Phase: 04-ssh-executor*
*Completed: 2026-06-06*
