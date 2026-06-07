# Service Desk Autopilot Report

## Summary

Service Desk Autopilot is a human-controlled troubleshooting copilot for Linux service incidents. It is built around one hard rule: AI can propose and explain, but deterministic backend code owns safety, approval, execution, audit, and persistence.

The current implementation delivers the full mock-mode vertical slice:

- Phoenix ticket and customer-system loading.
- Run creation and deterministic state transitions.
- Specialist AI roles for analysis, fix planning, validation, and activity drafting.
- Human approval, edit-then-approve, and reject-with-reason flows.
- SSH executor with timeout, output cap, redaction, and mock mode.
- Append-only audit trail and SSE event stream.
- Activity draft and submit routes.
- Browser ticket list, run page, approval card, audit timeline, and activity editor.

## Architecture

The backend uses Node 22, Hono, TypeScript, Zod, Vitest, ssh2, better-sqlite3, and the Vercel AI SDK. The frontend uses React 18 and Vite.

The architecture is intentionally backend-led:

- `backend/src/app.ts` mounts the HTTP routes and central error handling.
- `backend/src/phoenix/` wraps the Phoenix ERP contract and provides offline fixtures.
- `backend/src/safety/` classifies commands, blocks dangerous patterns, and redacts secrets.
- `backend/src/store/` persists runs, approvals, command results, observations, activity drafts, and audit events.
- `backend/src/ssh/` executes one approved command at a time.
- `backend/src/ai/orchestrator.ts` drives the incident state machine.
- `backend/src/ai/agents/` contains specialist structured-output roles.
- `backend/src/events/` mirrors run events to SSE subscribers.

The frontend is a technician workspace, not an autonomous control surface. It presents tickets, run progress, approval decisions, audit events, and the activity draft editor.

## Agent Design

There are four main model roles:

- `problem_analyzer`: turns ticket context and observations into ranked hypotheses and one read-only diagnostic command.
- `problem_solver`: proposes a minimal reversible fix command once the evidence supports a root cause.
- `validator`: checks customer benefit and persistence, not just service state.
- `activity_log_generator`: drafts the five graded Phoenix activity fields from audit trail inputs.

Each agent returns a Zod-validated structured object. The orchestrator decides what to do with that object. The model never receives an execute tool and cannot bypass approval.

The orchestrator is deterministic. It advances through phases such as `TRIAGING`, `WAITING_FOR_APPROVAL`, `EXECUTING_COMMAND`, `OBSERVING`, `PLANNING_FIX`, `VALIDATING`, and `WAITING_FOR_ACTIVITY_REVIEW`. Rejections return the run to triage for an alternative. Blocked commands are audited and do not execute.

## Safety Model

Safety is enforced in layers:

1. Proposal-time validation classifies the model's command before it reaches the technician.
2. Approval-time validation rechecks the final command, including human edits.
3. SSH execution is backend-only, one command per invocation, non-interactive, timed, and output-capped.
4. Redaction runs before output reaches audit, UI, or model reuse.
5. Audit events are append-only and there is no delete path.

Commands classified as `HIGH_RISK_BLOCKED` never execute. The blocklist covers destructive recursive deletes, mass permission changes, DB destruction, log/history clearing, private key dumping, external exfiltration, disabling security controls, and similar hard-fail behavior.

## Audit And Activity

The audit log is the source of truth. It records proposed commands, risk levels, approval decisions, final commands, command results, observations, and activity draft/submission actions.

The activity generator is constrained to draft from audit trail inputs only. It produces:

- `summary`
- `root_cause`
- `actions_taken`
- `commands_summary`
- `validation_result`

The UI lets the technician edit these fields before submission to Phoenix.

## Test Results

Current automated verification:

- Backend: 20 test files, 473 tests passing.
- Frontend: 1 test file, 19 tests passing.
- Frontend production build passes.
- Root `pnpm test` runs backend then frontend tests.

Coverage areas include:

- Phoenix client auth, retry, empty list, not-found, ticket, customer-system, status, and activity creation behavior.
- Safety blocklist, obfuscation handling, edited-command recheck, redaction, and policy classification.
- SSH executor type contracts, timeout, output cap, mock behavior, and factory wiring.
- Orchestrator happy path, reject path, blocked-command path, max-step behavior, validation, and activity handoff.
- API routes for tickets, runs, approvals, SSE, and activity draft/submit.
- Frontend data mappers.

## Practice VM Status

The repository is ready for mock-mode demonstration and automated unit/integration checks. Live VM validation still depends on external event credentials:

- SSH `.pem` must be placed under `keys/`.
- `PHOENIX_API_TOKEN` must be filled.
- `OPENAI_API_KEY` must be filled for real LLM mode.
- Passwordless `sudo -n true` for `azureuser` should be confirmed before real remediation.

Because those credentials are not present in the repository, this report does not claim verified results on all five practice VMs from this machine. The real-mode checklist in `README.md` is the required handoff for live evaluation.

## Reproducibility

Mock mode is the default in `.env.example`, so a fresh clone can boot offline:

```bash
cp .env.example .env
docker compose up --build
```

Run verification locally:

```bash
pnpm install
pnpm test
pnpm --dir frontend build
```

## Known Limitations

- The final demo video and START Hack submission form are manual deliverables outside the repository.
- Real Phoenix, SSH, and LLM paths require credentials that must not be committed.
- Frontend automated tests currently cover mappers; the browser workflow should still be manually checked before submission.
- Some planning documents still contain historical starter-stack references; the implementation and README are the authoritative current state.

