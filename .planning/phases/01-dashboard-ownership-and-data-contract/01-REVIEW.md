---
phase: "01-dashboard-ownership-and-data-contract"
status: clean
reviewed_at: "2026-06-07T08:37:15+02:00"
depth: standard
files_reviewed:
  - .env.example
  - apps/backend/package.json
  - apps/backend/src/app.ts
  - apps/backend/src/events/sse.ts
  - apps/backend/src/routes/dashboard.ts
  - apps/backend/src/routes/runs.ts
  - apps/backend/src/store/audit.ts
  - apps/backend/src/store/runs.ts
  - apps/backend/src/tests/app.test.ts
  - apps/backend/src/tests/dashboard.test.ts
  - apps/backend/src/tests/runs.test.ts
  - apps/backend/src/tests/sse-audit-symmetry.test.ts
  - apps/backend/src/tests/activity.test.ts
  - apps/dashboard/Dockerfile
  - apps/dashboard/app/dashboard/activity/page.tsx
  - apps/dashboard/app/dashboard/approvals/page.tsx
  - apps/dashboard/app/dashboard/audit/page.tsx
  - apps/dashboard/app/dashboard/backend-status/page.tsx
  - apps/dashboard/app/dashboard/dashboard.test.tsx
  - apps/dashboard/app/dashboard/memory/page.tsx
  - apps/dashboard/app/dashboard/observability/page.tsx
  - apps/dashboard/app/dashboard/page.tsx
  - apps/dashboard/app/dashboard/runs/[runId]/page.tsx
  - apps/dashboard/app/dashboard/runs/page.tsx
  - apps/dashboard/app/dashboard/tickets/[ticketId]/page.tsx
  - apps/dashboard/app/dashboard/tickets/page.tsx
  - apps/dashboard/app/globals.css
  - apps/dashboard/app/layout.tsx
  - apps/dashboard/app/page.tsx
  - apps/dashboard/components.json
  - apps/dashboard/components/app-sidebar.tsx
  - apps/dashboard/components/backend-status.tsx
  - apps/dashboard/components/dashboard-shell.tsx
  - apps/dashboard/components/refresh-button.tsx
  - apps/dashboard/components/run-workflow.tsx
  - apps/dashboard/components/ticket-detail-actions.tsx
  - apps/dashboard/components/ticket-table.tsx
  - apps/dashboard/components/ui/badge.tsx
  - apps/dashboard/components/ui/button.tsx
  - apps/dashboard/components/ui/card.tsx
  - apps/dashboard/components/ui/dialog.tsx
  - apps/dashboard/components/ui/input.tsx
  - apps/dashboard/components/ui/sheet.tsx
  - apps/dashboard/components/ui/skeleton.tsx
  - apps/dashboard/components/ui/table.tsx
  - apps/dashboard/components/ui/textarea.tsx
  - apps/dashboard/components/ui/tooltip.tsx
  - apps/dashboard/lib/api.ts
  - apps/dashboard/lib/events.ts
  - apps/dashboard/lib/source-labels.ts
  - apps/dashboard/lib/utils.ts
  - apps/dashboard/next-env.d.ts
  - apps/dashboard/next.config.ts
  - apps/dashboard/package.json
  - apps/dashboard/postcss.config.mjs
  - apps/dashboard/tailwind.config.ts
  - apps/dashboard/tsconfig.json
  - apps/dashboard/vitest.config.ts
  - apps/dashboard/vitest.setup.ts
  - apps/frontend/package.json
  - apps/frontend/src/types.test.ts
  - apps/frontend/src/types.ts
  - bun.lock
  - docker-compose.yml
  - docs/API.md
  - docs/ARCHITECTURE.md
  - docs/LIMITATIONS.md
  - docs/README.md
  - package.json
  - packages/contracts/package.json
  - packages/contracts/src/contracts.test.ts
  - packages/contracts/src/dashboard.ts
  - packages/contracts/src/events.ts
  - packages/contracts/src/index.ts
  - packages/contracts/src/runs.ts
  - packages/contracts/src/tickets.ts
  - packages/contracts/tsconfig.json
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
---

# Phase 01 Code Review Re-Review

## Findings

No unfixed critical, warning, or info defects found in the Phase 01 scope.

## Prior Warning Verification

- Activity draft redaction is resolved. `saveActivityDraft` now redacts `summary`, `rootCause`, `actionsTaken`, `commandsSummary`, and `validationResult` at the store boundary before inserting into `activity_drafts` (`apps/backend/src/store/audit.ts:294`). The regression test writes secret-looking values directly through `saveActivityDraft`, reloads the persisted draft, and asserts the raw token, password, API key, bearer value, and secret are absent (`apps/backend/src/tests/activity.test.ts:131`).
- API documentation is aligned for the previously flagged contract drift. `docs/API.md` now uses canonical source labels from `packages/contracts/src/tickets.ts`, documents the snake_case pending approval shape returned by `apps/backend/src/routes/runs.ts`, and documents camelCase activity submit overrides with a `200` response. I also inspected `apps/backend/src/routes/activity.ts` as supporting source for the submit field casing, Phoenix snake_case translation, and status.
- The dashboard Docker runtime is hardened. The final stage copies runtime files with `--chown=bun:bun` and sets `USER bun` before `CMD ["bun", "run", "start"]` (`apps/dashboard/Dockerfile:24`).

## Regression Scan

- Re-scanned dashboard action wiring and found main-path buttons and links call backend helpers or navigate to real dashboard routes.
- Re-scanned dashboard imports for ownership leakage. The dashboard continues to call typed HTTP/SSE helpers and does not import backend Phoenix, SSH, model, safety, store, or audit internals.
- Re-scanned source labels, pending approval field casing, activity submit field casing, SSE event sharing, dashboard placeholder/fake metric bans, and redaction boundaries. No new warning-level defects were found.
- Accepted note: the root `dev:frontend` alias intentionally points at the primary Next.js dashboard, while `dev:vite` keeps the temporary Vite fallback. No concrete behavioral break was found from that ownership decision.

## Verification Evidence

- `git show --stat --oneline --decorate --no-renames 84a1ea66c74940f02210dae4712096eca087e495` inspected the fix commit scope.
- `bun run --filter techbold-track-backend test src/tests/activity.test.ts src/tests/runs.test.ts src/tests/dashboard.test.ts src/tests/sse-audit-symmetry.test.ts src/tests/app.test.ts` passed: 5 test files, 42 tests.
- `bun run --filter @techbold/contracts test` passed: 1 test file, 5 tests.
- `bun run --filter techbold-track-dashboard test` passed: 1 test file, 8 tests.
- `bun run --filter techbold-track-frontend test` passed: 1 test file, 2 tests. Vite emitted existing deprecation warnings, but tests passed.
- `bun run check` passed: Biome checked 153 files, all workspace typechecks passed, contracts/backend/dashboard/frontend tests passed, dashboard and Vite production builds passed, and artifact guard passed.
- `docker build -f apps/dashboard/Dockerfile -t techbold-dashboard-review:phase01 .` passed.
- `docker image inspect techbold-dashboard-review:phase01 --format '{{.Config.User}} {{json .Config.Cmd}} {{json .Config.WorkingDir}}'` returned `bun ["bun","run","start"] "/app/apps/dashboard"`.
- `docker run --rm --entrypoint sh techbold-dashboard-review:phase01 -lc 'id -u; id -g; whoami; test -r /app/apps/dashboard/package.json; test -r /app/apps/dashboard/.next/BUILD_ID; stat -c "%U:%G %a %n" /app/apps/dashboard/package.json /app/apps/dashboard/.next/BUILD_ID'` returned UID 1000, GID 1000, user `bun`, and readable `bun:bun` files.
