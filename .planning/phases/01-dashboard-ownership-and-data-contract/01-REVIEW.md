---
phase: "01-dashboard-ownership-and-data-contract"
status: findings
reviewed_at: "2026-06-07T08:29:11+02:00"
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
  warning: 3
  info: 1
  total: 4
---

# Phase 01 Code Review

## Findings

### Warning: activity draft storage does not enforce redaction at the store boundary

- File/line: `apps/backend/src/store/audit.ts:294`
- Impact: `appendAuditEvent`, `appendCommandResult`, and `appendObservation` all redact at write time, but `saveActivityDraft` stores its five UI-visible/activity fields directly. The current draft route may redact before calling it, but this public store function is also used from tests and can be called by future code with unredacted model, technician, or audit-derived text. That would persist secrets and expose them through `GET /api/runs/:runId`, dashboard activity summaries, or Phoenix submission, violating the project rule to redact before audit, UI, or model context.
- Suggested fix: apply `redactSecrets` to `summary`, `rootCause`, `actionsTaken`, `commandsSummary`, and `validationResult` inside `saveActivityDraft`, and add a regression test that direct calls cannot persist token/key/password-looking strings.

### Warning: API documentation is out of sync with shared contracts and dashboard calls

- File/line: `docs/API.md:83`, `docs/API.md:130`, `docs/API.md:157`
- Impact: The docs describe source labels as `live`, `mock`, `seed`, and `deferred`, but the shared contract exports `live-backend`, `mock-backend`, `seed-data`, and `deferred` in `packages/contracts/src/tickets.ts:1`. The `POST /api/runs/:runId/next` example shows camelCase approval fields, while the returned pending approval is the store/contract shape with fields such as `proposed_command` and `risk_level` (`apps/backend/src/routes/runs.ts:194`, `packages/contracts/src/runs.ts:11`). The activity submit example shows snake_case fields and `201`, while the dashboard client sends camelCase fields from `apps/dashboard/lib/api.ts:125`. Consumers following the docs will build against the wrong contract.
- Suggested fix: update `docs/API.md` to use the exact exported contract names and route response shapes, including canonical `SourceLabel` values, approval field casing, activity submit field casing, and the implemented success status.

### Warning: dashboard image does not explicitly drop root privileges

- File/line: `apps/dashboard/Dockerfile:20`
- Impact: The final dashboard runtime stage copies the built app and starts `bun run start`, but there is no `USER` directive or ownership adjustment. If the base image default is root, the primary UI container runs as root, which weakens Docker least-privilege posture and is inconsistent with the root-hardening expectations called out for this project.
- Suggested fix: add an explicit non-root runtime user in the final stage, for example `USER bun`, and make copied files readable by that user with `COPY --chown=bun:bun` or equivalent.

### Info: root command aliases conflict with the provided AGENTS command contract

- File/line: `package.json:15`, `package.json:17`, `docs/README.md:16`
- Impact: The supplied AGENTS.md instructions still describe `apps/frontend` as the React/Vite frontend and `bun run dev:frontend` as port 5173, while the root package now maps `dev:frontend` to the Next.js dashboard on port 3000 and moves Vite to `dev:vite`. This may be an intentional Phase 01 ownership change, but it leaves operator instructions split between old and new names.
- Suggested fix: reconcile the AGENTS instructions with the Phase 01 dashboard ownership decision, or keep `dev:frontend` on the Vite app and use `dev:dashboard` for the Next.js dashboard.

## Scope Notes

- Backend ownership boundary: the dashboard calls typed backend HTTP/SSE helpers and does not import Phoenix, SSH, model, safety, store, or audit internals.
- SSE sharing: backend and dashboard both consume `SSE_EVENT_TYPES` from `@techbold/contracts`; the contract symmetry test covers this.
- Dashboard behavior: listed buttons and links on the main path call real routes or navigate to real page files. No disconnected action handlers were found.
- Sample content: tests and source scan cover forbidden placeholder dashboard content, fake metrics/charts, throughput, conversion, revenue, and lorem content on the main path.
- Verification: `bun run check` passed, including Biome, typecheck, contracts/backend/dashboard/frontend tests, dashboard and Vite builds, and artifact guard.
