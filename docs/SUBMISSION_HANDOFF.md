# Submission Handoff

Last updated: 2026-06-07.

Use this document to record or present the project without overstating live validation.

## Demo Checklist

1. Start from a clean working tree or fresh clone.
2. Run:

```bash
cp .env.example .env
docker compose up --build
```

3. Open `http://localhost:3000`.
4. Confirm backend health at `http://localhost:8000/health`.
5. Start the primary status-api ticket.
6. Click through the agent steps until the diagnostic approval appears.
7. Show that the approval card has a real command and editable command field.
8. Approve the diagnostic command.
9. Continue to the fix approval and approve `sudo systemctl restart status-api`.
10. Continue through validation.
11. Open the activity draft.
12. Submit the activity.
13. Show the audit timeline and final completed run state.

## Evidence to Cite

| Claim                                           | Evidence                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| Fresh clone Docker Compose startup works        | [`README.md`](../README.md) quick start; `docker compose up --build`     |
| Browser workflow and SSE lifecycle              | [`apps/dashboard/app/dashboard/dashboard.test.tsx`](../apps/dashboard/app/dashboard/dashboard.test.tsx) |
| Run creation, approvals, validation, activity   | [`apps/backend/src/tests/runs.test.ts`](../apps/backend/src/tests/runs.test.ts), [`orchestrator.test.ts`](../apps/backend/src/tests/orchestrator.test.ts) |
| SSE audit and bus symmetry                      | [`apps/backend/src/tests/sse-audit-symmetry.test.ts`](../apps/backend/src/tests/sse-audit-symmetry.test.ts) |
| Safety gating and command policy                | [`apps/backend/src/tests/safety.test.ts`](../apps/backend/src/tests/safety.test.ts), [`safety-policy.test.ts`](../apps/backend/src/tests/safety-policy.test.ts) |
| Full CI gate (lint, test, build)                | Root `package.json` script `bun run check`                               |

## Submission Summary

Sphinx is a technician-controlled AI troubleshooting copilot. It loads Phoenix tickets, proposes one command at a time, gates every command through deterministic safety checks, executes only technician-approved commands, validates the result, and drafts an ERP activity from the audit trail.

Current verified path:

- Full mock-mode demo path through frontend and backend.
- Deterministic backend vertical-slice coverage for run creation, SSE, edited approval execution, validation, and activity submission.
- Docker Compose startup from a clean clone.

Current live blockers:

- Phoenix token is a placeholder and returns `401 Invalid team token`.
- SSH key is missing at `/keys/your-key.pem`.
- Real VM host/port is unavailable without Phoenix access.
- LLM key is a placeholder.

## Accepted Limitations

- Do not claim real hidden VM success from this workspace.
- Do not claim real Phoenix activity submission.
- Do not claim real SSH or sudo validation.
- Do not claim real LLM validation.
- Do claim mock-mode workflow validation, safety gating, audit trail, and deterministic vertical-slice coverage.

## Real Validation Inputs Needed

To move from mock evidence to real evidence, provide:

1. Real `PHOENIX_API_TOKEN`.
2. Real `.pem` key mounted under `keys/` and referenced by `SSH_PRIVATE_KEY_PATH`.
3. Practice VM access through Phoenix customer-system data.
4. Real LLM credential for the selected provider.

Then rerun live integration checks with real credentials listed above and confirm `/health` reports `"mode": "real"`.
