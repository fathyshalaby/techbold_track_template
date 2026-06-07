# Phase 3 Context: Vertical-Slice Coverage

## Objective

Add deterministic coverage for the primary run lifecycle: run creation, SSE event consumption, approval edit and execution, validation, activity draft, and activity submission.

## Requirement Mapping

- E2E-01: deterministic vertical-slice coverage for run creation, SSE updates, approval edit/execute, and activity flow.
- PLAN-01: every production change remains traceable to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`.

## Master Defect Map Trace

- V-002: missing broad smoke test for approval, command, activity, and UI-facing workflow.
- BL-002: future regressions in the critical workflow likely go undetected without focused integration/e2e coverage.

## Existing Evidence

- Phase 2 browser UAT completed the primary mounted frontend path in mock mode.
- Route-level backend tests exist for run creation and approvals.
- Existing approval tests verify edited command forwarding with a spy, but not the full app path through command execution, validation, and activity submission.
- Existing SSE tests verify contract symmetry, but not consumption during a full run lifecycle.

## Constraints

- Do not add product features.
- Do not add fake tests, source-grep tests, or tests that only prove mocks work.
- Use the real Hono app routes, real orchestrator, mock Phoenix, mock SSH, and deterministic built-in mock model.
- Production edits are only acceptable if the vertical-slice test exposes a real defect.

## Plan Shape

Add one focused backend test that:

1. Creates a run through `POST /api/runs`.
2. Advances to diagnostic approval through `POST /api/runs/:runId/next`.
3. Opens `GET /api/runs/:runId/events` and consumes the SSE backfill for `approval.required`.
4. Approves with an edited command and verifies the executed command result.
5. Advances through fix proposal, fix approval, validation, and activity review.
6. Generates and submits the activity draft.
7. Verifies final run status and audit event evidence.

## Acceptance

- `pnpm --dir backend test -- vertical-slice` passes.
- `pnpm --dir backend typecheck` passes.
- Planning artifacts record whether production code changed. If no production code changes are needed, PLAN-01 is satisfied by explicit trace and unchanged production behavior.
