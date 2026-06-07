# For Judges — where each rubric criterion is demonstrated

A fast map from the techbold scoring rubric to the concrete evidence in this repo, plus an
**honest status** for each (what is proven in mock mode vs. what needs live credentials). We do not
overstate: see [`RESULTS.md`](RESULTS.md) and [`LIMITATIONS.md`](LIMITATIONS.md) for the full split.

**Fastest path to see it:** `cp .env.example .env && docker compose up --build` → open
http://localhost:3000. Runs fully offline (mock Phoenix/SSH/LLM), no credentials. Follow
[`DEMO_SCRIPT.md`](DEMO_SCRIPT.md).

| Rubric | What to look at | Status |
|---|---|---|
| **A · ERP workflow (20)** | Ticket list with sort/filter + detail + customer system: dashboard `/dashboard/tickets`; `apps/backend/src/phoenix/`. Five-field activity built from the audit trail and submitted, ticket closed on validation: `apps/backend/src/routes/activity.ts`. | Built + tested in mock; real Phoenix submission blocked on a team token. |
| **B · Troubleshooting (35)** | Diagnose→root-cause→fix→validate state machine + specialist agents (one command at a time, ranked hypotheses + evidence): `apps/backend/src/ai/`. Encoded method + symptom runbooks: `apps/backend/src/ai/knowledge.ts`, `knowledge/`. Persistence-aware validation. Generalised (no hardcoded incidents — see prompt-generalization tests). | Logic built + unit-tested in mock; **not yet validated against a real hidden VM** (needs Builder Base creds — the one open gap). |
| **C · Safety & audit (20)** | Deterministic blocklist + risk classifier + secret redaction, re-checked before every execution; model has no execute tool: `apps/backend/src/safety/`, `apps/backend/src/ssh/executor.ts`. Append-only audit trail (UI: `/dashboard/audit`). | Built + heavily tested (incl. hard-fail bypasses: `chmod 0777`, firewall-disable variants, inline DB-cred redaction). Strongest, fully demonstrable offline. |
| **D · Technician UX (10)** | Next.js dashboard: tickets, runs, approvals, resolutions, audit, backend-status, observability, memory. Approve / edit / reject / abort + live SSE event stream + risk badges. `apps/dashboard/`. | Built; demonstrable offline. |
| **E · Engineering (15)** | Bun monorepo, ~670 backend tests, CI (lint + typecheck + test + build + model lint + gitleaks secret-scan), one-command Docker, durable SQLite audit + Postgres memory, MIT license. | Built; CI green. |

## Hard-fail safety (rubric C — zeroes an incident if violated)
The deterministic gate blocks, regardless of approval: `rm -rf` system/data dirs, `chmod 777`/`0777`/world-write,
disabling the firewall (`ufw`/`iptables -F`/`-P …ACCEPT`/`nft flush`/`systemctl disable … ufw`), DB drops,
secret-file reads, reverse shells, fork bombs, and more — and redacts secrets (keys, tokens, inline DB
passwords, hashes) from every log, the UI, the model, and the ERP activity. See `apps/backend/src/tests/safety-*`.

## Honest status (do not over-credit)
- **Proven now (offline):** full technician workflow, safety gating, audit trail, deterministic vertical-slice coverage, Docker bring-up from a clean clone.
- **Not yet proven (needs live inputs):** real hidden-VM incident resolution and real Phoenix submission — blocked only by a placeholder Phoenix token, SSH key, and LLM key (`SUBMISSION_HANDOFF.md`). The system is built for it; it has not been run against the live grader from this workspace.

## Two backends, one repo
The **Node backend (`:8000`) + Next.js dashboard (`:3000`)** is the primary, graded/demo path. A
**Python/FastAPI backend** (`docker compose --profile py up`, `:8002`) is a fully-working alternative kept
at safety parity — you choose which to run.
