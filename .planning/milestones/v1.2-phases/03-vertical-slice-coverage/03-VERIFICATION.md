# Phase 3 Verification

## Commands

```bash
pnpm --dir backend test -- vertical-slice store-jsonl
pnpm --dir backend typecheck
```

## Results

- `pnpm --dir backend test -- vertical-slice store-jsonl`: passed.
  - 27 test files passed.
  - 559 tests passed.
  - Included `src/tests/vertical-slice.test.ts`.
  - Included `src/tests/store-jsonl.test.ts`.
- `pnpm --dir backend typecheck`: passed.

## Failure Evidence Found and Fixed

The new vertical-slice test initially exposed two JSONL adapter defects:

1. `SELECT ... WHERE approval_id = ? ORDER BY created_at DESC LIMIT 1` returned no row in JSONL mode, so the approval route returned `result: null` after a command had been executed.
2. `UPDATE activity_drafts SET submitted = 1, submitted_at = ? WHERE id = ?` did not update `submitted` in JSONL mode.

Both defects were fixed in `backend/src/store/db.ts` and covered by `backend/src/tests/store-jsonl.test.ts`.

## Traceability

- Requirement E2E-01: complete.
- Requirement PLAN-01: complete for Phase 3.
- Master defect map: V-002 and BL-002.
