---
phase: "01-dashboard-ownership-and-data-contract"
status: fixed
fixed_at: "2026-06-07T08:34:12+02:00"
review_path: ".planning/phases/01-dashboard-ownership-and-data-contract/01-REVIEW.md"
fix_commit: "84a1ea66c74940f02210dae4712096eca087e495"
findings:
  critical_fixed: 0
  warning_fixed: 3
  info_fixed: 0
  total_fixed: 3
---

# Phase 01 Code Review Fix Report

## Fixed Findings

### Warning: activity draft storage did not enforce redaction at the store boundary

- Trace: `CR-01-001` in `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`
- Files changed:
  - `apps/backend/src/store/audit.ts`
  - `apps/backend/src/tests/activity.test.ts`
- Fix: `saveActivityDraft` now redacts all five persisted activity fields before inserting into `activity_drafts`.
- Regression: added a direct store-boundary test that writes token, password, API key, bearer token, and secret-looking values through `saveActivityDraft` and verifies the persisted draft does not contain the raw secret values.

### Warning: API documentation was out of sync with shared contracts and dashboard calls

- Trace: `CR-01-002` in `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`
- Files changed:
  - `docs/API.md`
- Fix: updated source labels to the canonical `@techbold/contracts` values, documented pending approval response casing as the actual store/contract shape, and corrected activity submit request casing and success status.

### Warning: dashboard image did not explicitly drop root privileges

- Trace: `CR-01-003` in `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`
- Files changed:
  - `apps/dashboard/Dockerfile`
- Fix: final runtime copies now use `--chown=bun:bun`, and the final stage runs as `USER bun`.

## Info Finding

The `dev:frontend` alias finding remains informational. Phase 01 intentionally makes the Next.js dashboard the primary frontend command and keeps Vite as `dev:vite`; the ownership decision is documented in Phase 01 docs.

## Verification

- `bun run --filter techbold-track-backend test -- activity` - PASS, 2 files and 20 tests.
- `bun run --filter techbold-track-backend typecheck` - PASS.
- `bun run --filter techbold-track-dashboard build` - PASS.
- `docker compose build frontend` - PASS.
- `docker image inspect techbold_track_template-frontend:latest --format '{{.Config.User}}'` - PASS, output `bun`.
- `bun run check` - PASS, including Biome, typecheck, contracts/backend/dashboard/frontend tests, dashboard/Vite builds, and artifact guard.

