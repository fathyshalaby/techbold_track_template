# techbold · AI Service Desk Autopilot

An AI-assisted technician workspace that pulls real tickets from the **Phoenix ERP** mock,
loads the affected customer system, connects to the Linux VM over **SSH**, and — **under the
technician's control** — diagnoses and safely fixes the incident, then writes a clean activity
log back to the ERP.

> Every command the AI proposes is shown to the technician, who **approves, edits, or rejects
> it** before anything runs. A deterministic safety layer hard-blocks dangerous commands. Every
> action is logged.

This repo ships **two interchangeable backends** behind one shared HTTP contract and one React
frontend, so you can run the exact same workflow on either stack:

| Build | Stack | Port |
|-------|-------|------|
| **`backend-py`** | FastAPI · paramiko · OpenAI SDK (Azure) | `:8000` |
| **`backend-node`** | Hono · Vercel AI SDK (`@ai-sdk/azure`) · ssh2 | `:8001` |
| **`frontend`** | React + Vite + TypeScript (backend-agnostic) | `:5173` |

Both backends implement the identical contract in [`shared/api-contract.md`](shared/api-contract.md)
and load the **same** safety rules ([`shared/safety-rules.json`](shared/safety-rules.json)) and
agent spec ([`shared/agent-spec.md`](shared/agent-spec.md)).

---

## 1. Architecture

```
frontend/  (React + Vite)  ──HTTP──▶  backend-py (:8000)  ──▶  Phoenix ERP (tickets/activities)
   ticket list · detail · run view             OR             ──▶  Customer VM over SSH
   approve/edit/reject · audit · activity   backend-node (:8001) ──▶  Azure OpenAI gpt-5.4-nano

shared/   api-contract.md · safety-rules.json · agent-spec.md · tests/   (single source of truth)
```

Each backend keeps these as **separate modules** (rubric E):

| Module | backend-py | backend-node | Responsibility |
|--------|-----------|--------------|----------------|
| ERP client | `app/erp.py` | `src/erp.ts` | Phoenix REST (auth, retries, timeouts) |
| SSH runner | `app/ssh.py` | `src/ssh.ts` | one approved command, multi-key, timeouts |
| Safety layer | `app/safety.py` | `src/safety.ts` | deny/allow classify + secret redaction |
| LLM client | `app/llm.py` | `src/llm.ts` | Azure / OpenRouter / local switch |
| Agent | `app/agent.py` | `src/agent.ts` | prompt + tools → next single action |
| Runs (state machine) | `app/runs.py` | `src/runs.ts` | the human-in-the-loop engine + audit |
| Activity generator | `app/activity.py` | `src/activity.ts` | drafts the graded ERP documentation |

### The human-in-the-loop loop

```
POST /api/runs {ticket_id}
  → load ticket + system, agent proposes ONE command  (status: awaiting_approval)
technician approves / edits / rejects that command
  → safety re-check → SSH exec → redacted result fed back → agent proposes the next step
  → (reject = re-plan · abort = stop)
agent concludes (root cause + validation)             (status: done)
POST /api/runs/{id}/activity/draft → technician reviews/edits → /activity/submit → ERP + ticket DONE
```

The agent only ever proposes **one** command per turn; nothing executes without an explicit
human approval for that specific command.

### Safety model (rubric C)

- **Deterministic deny-list** (model-independent) hard-blocks `rm -rf /…`, `chmod -R 777` on
  system dirs, firewall/audit disabling, DB drops, `curl … | sh`, log/history wiping, etc.
  Blocked commands **never run**, even if approved.
- **Risk-tiered human gate.** Read-only diagnostics (`systemctl status`, `journalctl`, `ss`,
  `cat /var/log`…) run **automatically**; every command that **changes** the system (`needs_review`)
  requires an explicit **approve / edit / reject**. This focuses the technician's attention on writes
  and avoids approval fatigue (rubber-stamping 15 harmless reads erodes the gate that matters). Set
  `AUTO_RUN_READONLY=false` for strict "approve-everything" mode.
- **LLM input guard + redaction.** Secrets and PII (passwords, tokens, JWT/AWS/GitHub keys,
  connection-string credentials, emails, private keys) are scrubbed from **every** message sent to
  the LLM — not just tool results — and from the audit log and the ERP activity. The SSH key never
  leaves the backend.

Rules live once in `shared/safety-rules.json` and are validated in **both** Python `re` and JS
`RegExp` (`shared/tests/`, 25/25).

---

## 2. Setup

You need **Docker** (or Python 3.11+ and Node 20+ for local dev), plus, from Builder Base:
- the **Phoenix** base URL + your team **API token**,
- your **Azure OpenAI** endpoint/key/deployment for `gpt-5.4-nano`,
- the SSH **`.pem`** key(s) for the customer VMs.

```bash
cp .env.example .env          # fill PHOENIX_* and AZURE_OPENAI_* (values from Builder Base)
cp tb-hackathon-ssh/*.pem keys/    # keys/ is git-ignored; the SSH runner auto-picks the right key
```

`.env`, `keys/`, `important_stuff.txt`, and `tb-hackathon-ssh/` are **git-ignored** — never commit secrets.

### Environment variables

| Variable | Meaning |
|----------|---------|
| `PHOENIX_API_BASE_URL`, `PHOENIX_API_TOKEN` | Real Phoenix ERP base URL + your team token |
| `SANDBOX_CASE_COUNT` | Number of local Docker fake-VM tickets to generate and expose (`0-5`); default `0` uses real Phoenix |
| `SANDBOX_DOCKER_PRIVILEGED` | Run the sandbox fake VMs privileged so Ubuntu systemd behaves correctly in Docker |
| `SSH_PRIVATE_KEY_PATH`, `SSH_KEY_DIR`, `SSH_USERNAME` | SSH to the VM (`azureuser`); runner tries the configured key, then every `*.pem` under `SSH_KEY_DIR` recursively |
| `LLM_PROVIDER` | `azure` (default) · `openrouter` · `local` |
| `AZURE_OPENAI_ENDPOINT` / `_API_KEY` / `_API_VERSION` / `_DEPLOYMENT` | Azure OpenAI `gpt-5.4-nano` |
| `LOCAL_BASE_URL`, `LOCAL_MODEL` | Local fallback (LM Studio `:1234/v1` / Ollama `:11434/v1`, e.g. `qwen3-coder-30b`) |
| `VITE_API_BASE` | Which backend the browser calls (`:8000` python · `:8001` node) |

---

## 3. Run

### Docker (everything)

```bash
docker compose up --build
# frontend → http://localhost:5173 · backend-py → :8000/health · backend-node → :8001/health
```

By default Compose uses the real Phoenix ERP tickets from `PHOENIX_API_BASE_URL`. To switch into the
local Docker fake-VM sandbox, set `SANDBOX_CASE_COUNT=1` in `.env` and run `docker compose up`.
Compose then builds that many broken Ubuntu containers, exposes them on SSH ports starting at `2201`,
starts a local Phoenix-compatible sandbox ERP, and the UI shows sandbox tickets starting at `7101`.
Set the count back to `0` to skip the local sandbox.

When sandbox cases are seeded, the ticket queue's **Case Source** dropdown can switch the running
backend between real Phoenix and Docker sandbox tickets without restarting Compose.

The frontend talks to `backend-py` by default. To demo the **Node** build, set
`VITE_API_BASE=http://localhost:8001` (compose `frontend.environment`) and restart the frontend.

### Local dev

```bash
# backend-py
cd backend-py && python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000

# backend-node
cd backend-node && npm install && npm run dev      # :8001

# frontend
cd frontend && npm install && npm run dev           # :5173
```

For the **local LLM** fallback, run LM Studio (or Ollama), set `LLM_PROVIDER=local`, and point
`LOCAL_BASE_URL` at it (`host.docker.internal` from Docker).

---

## 4. Tests

```bash
# shared safety rules — verified in BOTH engines (must agree)
python3 shared/tests/check_safety.py        # Python re
node    shared/tests/check_safety.mjs        # JS RegExp

# backend-py unit tests
cd backend-py && .venv/bin/pytest -q

# backend-node typecheck + safety check
cd backend-node && npm run typecheck && npm test

# frontend build / typecheck
cd frontend && npm run build
```

---

## 5. Assumptions

- One incident per ticket; the customer VM is reachable over SSH from where the backend runs.
- Customer system is a local Linux service problem solvable over the shell (no kernel/bootloader/cloud-net).
- `gpt-5.4-nano` (Azure) is a small model: tool defs are simple, tool-call JSON is validated, and
  documentation uses structured output. A local model is a fallback, not the primary brain.
- Runs are kept **in-memory** (single-user hackathon demo). Swap the run store for a DB to persist.
- The 5 per-case SSH keys are interchangeably tried; the runner uses whichever authenticates.

## 6. Troubleshooting

- **401 from Phoenix** → check `PHOENIX_API_TOKEN` / `Authorization: Bearer`.
- **Empty ticket list** → ensure the token is set and `GET /api/tickets` returns data.
- **SSH connect fails** → key(s) in `keys/`, user `azureuser`, VM reachable; raise `SSH_CONNECT_TIMEOUT`.
- **AI calls fail** → check `AZURE_OPENAI_*` (endpoint, key, deployment name, api-version); try `LLM_PROVIDER=local`.
- **Frontend can't reach backend** → set `VITE_API_BASE`; from Docker use `host.docker.internal` for host services.
- **Can't reach a locally-run Phoenix mock from Docker** → use `host.docker.internal`, not `localhost`.

## 7. Scoring map

A · ERP workflow (load/sort/filter tickets, system, create activity, clean 401/404) — see `app/erp.py`, frontend.
B · Troubleshooting — the agent + runs engine; build for generalisation, no hardcoding.
C · Safety/audit — deny-list, per-command human gate, full audit trail, secret redaction.
D · Technician UX — overview, detail, visible progress, followable logs, approve/retry/abort.
E · Engineering — modular, two-build separation, README, runnable tests, error handling/timeouts, `.env.example`.

See [`docs/scoring.md`](docs/scoring.md) for the full rubric and [`REPORT.md`](REPORT.md) for the technical write-up.

MIT licensed — see [`LICENSE`](LICENSE).
