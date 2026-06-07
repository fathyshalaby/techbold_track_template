# techbold | AI Service Desk Autopilot

A technician-controlled AI troubleshooting copilot for the techbold START Hack Vienna '26 track. It:

1. reads assigned tickets from the **Phoenix ERP**,
2. loads the affected **customer system** (SSH target),
3. has an AI propose **one diagnostic command at a time** (ranked root-cause hypotheses + evidence),
4. runs **only** technician-approved commands over **SSH**, through a deterministic **safety layer**,
5. iterates to a root cause, proposes a **minimal, reversible fix**, and **validates** it, then
6. drafts a complete ERP **activity** built **only from the audit trail** for the technician to edit and submit.

**The AI never acts on its own.** Every command is approved (or edited / rejected) by a human, and re-checked by the safety layer before it can run. Blocklisted or secret-leaking commands never execute.

> Status: **built and runnable.** Node/Hono backend + React/Vite frontend, 559 passing backend tests in the latest Phase 3 verification run. Boots fully offline in mock mode - no credentials needed to demo.

---

## 1. Tech stack

| Layer | Stack |
|-------|-------|
| Backend | **Node 22 | Hono | TypeScript** (run via `tsx`), **Vercel AI SDK v4** (`@ai-sdk/openai`), **ssh2**, **better-sqlite3** (mock-only in-memory fallback), **Zod** |
| Frontend | **React 18 | Vite | TypeScript** (single-page technician workspace) |
| Storage | SQLite append-only audit trail (run state, command approvals, results, observations, activity drafts) |
| Tooling | pnpm workspace | Vitest | Docker Compose |

> Note: `STACK.md` and the auto-generated stack section of `CLAUDE.md` describe an earlier Python/FastAPI skeleton - that is **superseded**; the authoritative stack is the table above and `docs/ARCHITECTURE.md`.

### Layout
```
backend/        Node + Hono API: routes/, ai/ (orchestrator + agents), safety/, ssh/, phoenix/, store/, events/
frontend/       React + Vite technician workspace (src/App.tsx)
knowledge/      diagnostic playbook + runbooks (encoded into the agents)
docs/           ARCHITECTURE.md, PRD.md, scoring.md (rubric), phoenix-openapi.yaml, AUDIT_LOG.md, ...
docker-compose.yml   backend (:8000) + frontend (:5173)
.env.example    copy to .env (defaults to MOCK_MODE=true - runs offline)
keys/           put your SSH .pem here (git-ignored)
```

---

## 2. Quick start - runs offline, no credentials

```bash
cp .env.example .env
docker compose up --build
```

- Technician workspace -> **http://localhost:5173**
- Backend health -> **http://localhost:8000/health**

`.env.example` ships **`MOCK_MODE=true`**, so the stack boots fully offline against a **mock Phoenix** (seeded sample tickets), a **mock SSH** executor, and a **mock LLM**. You can click through the entire flow (pick a ticket -> drive the agent -> approve commands -> submit the activity) with **no Phoenix token, no SSH key, and no LLM key.** This is the recommended way to demo.

### Run without Docker
Requires **Node 22+** and **pnpm** (`corepack enable` or `npm i -g pnpm`).
```bash
pnpm install                 # at the repo root (pnpm workspace)

pnpm dev:backend             # API on :8000, reads ../.env
pnpm dev:frontend            # workspace on :5173
```

### Tests
```bash
pnpm typecheck
pnpm test                    # backend and frontend Vitest
pnpm build                   # frontend production build
pnpm check                   # typecheck, test, build
```

---

## 3. Going live (real Phoenix / SSH / LLM)

Set the relevant vars in `.env` and flip the matching mock flag off (or set `MOCK_MODE=false` for all):

| Variable | Meaning |
|----------|---------|
| `PHOENIX_API_BASE_URL`, `PHOENIX_API_TOKEN` | The ERP and your team Bearer token |
| `SSH_PRIVATE_KEY_PATH`, `SSH_USERNAME` | SSH to the customer VM (default user `azureuser`); mount the `.pem` into `keys/` |
| `OPENAI_API_KEY`, `LLM_PROVIDER`, `LLM_MODEL` | Bring-your-own LLM (default `openai` / `gpt-4o`) - none is provided by organisers |
| `MOCK_MODE` / `MOCK_PHOENIX` / `MOCK_SSH` / `MOCK_LLM` | `MOCK_MODE=true` in `.env.example` makes all services run offline; per-service flags can override when `MOCK_MODE=false` |
| `VITE_API_BASE` | URL the browser uses to reach the backend (default `http://localhost:8000`) |
| `PORT` | Backend port (default `8000`) |

`env.ts` validates config at startup and **fails fast** with the missing variable's name (never its value). In real SSH mode `SSH_PRIVATE_KEY_PATH` is required. `.env` and `keys/` are git-ignored - **never commit secrets.**

---

## 4. The Phoenix ERP API (what the backend consumes)

Full contract: **`docs/phoenix-openapi.yaml`**. Every call sends `Authorization: Bearer <PHOENIX_API_TOKEN>`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/me` | The logged-in technician |
| GET | `/api/v1/me/tickets?status=&priority=&sort=` | Assigned tickets |
| GET | `/api/v1/tickets/{id}` | One ticket |
| GET | `/api/v1/tickets/{id}/customer-system` | SSH target `{ip, port, username, os, notes}` |
| PATCH | `/api/v1/tickets/{id}/status` | Set `OPEN` / `PENDING` / `DONE` |
| POST | `/api/v1/activities/create` | Write the activity back to the ERP |
| POST | `/api/v1/me/reset` | Clear activities + reboot the VMs |

The submitted activity is built only from the run's audit trail: `summary, root_cause, actions_taken, commands_summary, validation_result` (+ `ticket_id`, start/end). The ticket is set `DONE` **only when the fix was validated**.

---

## 5. The backend API (what the frontend consumes)

Base `http://localhost:8000`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness plus runtime and store mode |
| GET | `/api/tickets?status=&priority=&sort=` | Proxy the ERP ticket list |
| GET | `/api/tickets/:id` | `/api/tickets/:id/customer-system` | Ticket / SSH target |
| POST | `/api/runs` `{ticketId}` | Start an incident run |
| GET | `/api/runs/:id` | Run state + audit timeline + pending approval + activity draft |
| POST | `/api/runs/:id/next` | Advance the agent one step |
| POST | `/api/runs/:id/approvals/:aid/approve` `{editedCommand?}` | Approve (optionally edited) - safety re-checked |
| POST | `/api/runs/:id/approvals/:aid/reject` `{reason}` | Reject |
| POST | `/api/runs/:id/abort` | Abort the run |
| POST | `/api/runs/:id/activity/draft` | `/activity/submit` | Draft / submit the ERP activity |
| GET | `/api/runs/:id/events` | SSE stream of run events (live progress) |

---

## 6. How it's built (maps to the rubric)

- **A | ERP workflow** - typed Phoenix client (auth, retries, timeouts) + mock; ticket list with sort/filter; customer-system load; complete activity create + ticket close.
- **B | Troubleshooting** - an orchestrator state machine drives diagnose -> root-cause -> fix -> validate, one command per step, generalised (no incident hardcoding); diagnostic method + symptom-routed runbooks from `knowledge/` are encoded into the agents.
- **C | Safety & audit** - deterministic blocklist + risk classifier + secret redaction; every command gated at proposal **and** re-checked after a human edit; append-only audit trail (the source of truth for the activity); the model can never execute - it only proposes.
- **D | Technician UX** - `frontend/src/App.tsx`: ticket overview, run view with per-command approve / edit / reject / abort, risk badges, live event stream, the **audit trail**, and the editable activity before submit.
- **E | Engineering** - modular separation, 559 backend tests in the latest Phase 3 verification run, mocks for all three dependencies, fail-fast env, Docker, durable SQLite volume.

### The human-in-the-loop loop
`load ticket -> analyse -> propose ONE command -> human approves/edits/rejects -> safety re-check -> run over SSH -> observe -> repeat -> validate -> draft activity -> submit -> set status DONE`.

---

## 7. Scoring (100 pts) - see `docs/scoring.md`

A | ERP workflow (20) | **B | Troubleshooting (35)** | **C | Safety & audit (20)** | D | Technician UX (10) | E | Engineering (15). B + C are graded on **fresh hidden VMs** - built for generalisation, not hardcoded. **Hard fails** (deleting a DB, `chmod -R 777 /...`, disabling the firewall, leaking secrets, clearing logs, running as superuser to dodge perms) zero the incident - the safety layer blocks these deterministically.

---

## 8. Troubleshooting

- **Nothing loads / want a zero-setup demo** -> ensure `MOCK_MODE=true` in `.env` (the default); the stack runs fully offline with seeded tickets.
- **401 from Phoenix** (real mode) -> check `PHOENIX_API_TOKEN` / `Authorization: Bearer`.
- **SSH connect fails** (real mode) -> `.pem` at `SSH_PRIVATE_KEY_PATH`, user `azureuser`, VM reachable from the backend.
- **AI calls fail** (real mode) -> set `OPENAI_API_KEY` (BYO LLM; none provided).
- **`better-sqlite3` native build fails locally** -> use Docker, or run a mock flag; in real mode the app refuses to boot on the non-durable in-memory fallback rather than risk losing the audit trail.
- **Can't reach a locally-run mock from Docker** -> use `host.docker.internal`, not `localhost`.

MIT licensed (`LICENSE`). No secrets in the repo - `.env` and keys stay out (`.env.example` is the template).
