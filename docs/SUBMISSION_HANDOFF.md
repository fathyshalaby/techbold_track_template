# Submission Handoff

Last updated: 2026-06-07.

**TL;DR — Status:** demo-ready in mock mode (the full loop runs offline); live Phoenix / SSH / LLM are wired and reachable, gated only by credentials. Run `docker compose up`, open http://localhost:3000.

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

_Paths below are internal verification logs kept in the repo (`.planning/`)._

| Claim | Evidence |
|---|---|
| Fresh clone Docker Compose startup works | `.planning/phases/01-fresh-clone-runtime-validation/01-VERIFICATION.md` |
| Browser UAT works in mounted frontend | `.planning/phases/02-browser-sse-uat/02-VERIFICATION.md` |
| SSE lifecycle updates are observed | `.planning/phases/02-browser-sse-uat/02-VERIFICATION.md` |
| Vertical-slice coverage exists | `.planning/phases/03-vertical-slice-coverage/03-VERIFICATION.md` |
| Real integrations are blocked with exact causes | `.planning/phases/04-real-integration-validation/04-VERIFICATION.md` |

## Submission Summary

Service Desk Autopilot is a technician-controlled AI troubleshooting copilot. It loads Phoenix tickets, proposes one command at a time, gates every command through deterministic safety checks, executes only technician-approved commands, validates the result, and drafts an ERP activity from the audit trail.

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

Then rerun Phase 4 checks from `.planning/phases/04-real-integration-validation/04-VERIFICATION.md`.
