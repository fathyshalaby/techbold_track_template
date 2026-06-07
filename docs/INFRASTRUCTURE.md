# INFRASTRUCTURE - Service Desk Autopilot

How the system is packaged, configured, networked, and run - locally, in Docker, and during grading. This is the operator-facing companion to [ARCHITECTURE.md](./ARCHITECTURE.md) (which covers the *internal* software design). It documents what actually ships in the repo today, with exact versions, and flags the few places where prose elsewhere has drifted from the installed reality.

> **Mental model.** Our container is the **control plane** - it holds the LLM client, the safety gate, the audit store, and the SSH client. The customer's Ubuntu VM is the **target**, reached *outbound* over SSH. There is no inbound connection to the VM and no agent installed on it. The "sandbox" that protects the customer box is the deterministic safety gate, not container isolation.

---

## 1. Runtime topology

```text
developer / judge machine

Browser --HTTP :5173--> frontend container (Vite dev server, React 18)
   |                         |
   | HTTP + SSE :8000        | VITE_API_BASE=http://localhost:8000
   v                         v
backend container (Node 22 | Hono | tsx)
   |- /health, /api/tickets, /api/runs, /api/runs/:id/events (SSE)
   |- SQLite audit DB on the autopilot-data volume
   |- reads SSH private key from /keys/*.pem (read-only bind mount)
   `- outbound:
        |- HTTPS/HTTP -> Phoenix ERP (http://68.210.101.85:8000)
        |- SSH :22 -> customer Ubuntu VM(s), user azureuser
        `- HTTPS -> LLM provider (OpenAI by default; bring-your-own key)

host.docker.internal -> optional Phoenix mock running on the host
```

Two containers, orchestrated by Docker Compose. The backend is the only component that holds secrets (the Phoenix token and the SSH key) and the only one that talks to the customer VM. The browser never sees a secret and never talks to Phoenix, SSH, or the LLM directly.

## 2. Technology stack (as installed - authoritative)

These are the **exact versions resolved in the lockfile** (`pnpm-lock.yaml`), verified by a clean `pnpm install`. Where this differs from older prose, **this table wins** (see section 9, Drift notes).

| Layer | Choice | Installed version |
|---|---|---|
| Backend runtime | Node.js | **22** (`node:22-slim`) |
| Backend language | TypeScript (run via **tsx**, no build step in dev) | TS 5.9 | tsx 4.22 |
| HTTP framework | **Hono** + `@hono/node-server` | hono 4.12 | node-server 1.19 |
| Request validation | `@hono/zod-validator` + **Zod** | validator 0.4 | zod 3.25 |
| Agent / LLM SDK | **Vercel AI SDK** (`ai`) + `@ai-sdk/openai` provider | **ai 4.3.19** | openai-provider 1.3.24 |
| SSH transport | **ssh2** | 1.17 |
| Persistence | **better-sqlite3** (synchronous) + JSONL fallback | better-sqlite3 11.10 |
| ID generation | **ulid** (sortable run/event IDs) | 3.0 |
| Tests | **Vitest** | 3.2 |
| Frontend runtime | Node.js (build/dev only) | **22** (`node:22-slim`) |
| Frontend framework | **React** + **Vite** | react 18.3 | vite 5.4 | TS 5.6 |
| Package manager | **pnpm** (workspace, via corepack) | pnpm 10.x |

**Provider note.** The LLM is bring-your-own. The repo wires the **OpenAI** provider (`@ai-sdk/openai`, `OPENAI_API_KEY`, default model `gpt-4o`). Because the Vercel AI SDK is provider-agnostic, swapping to Anthropic / Azure OpenAI / a local Ollama or vLLM model is a one-file change in `backend/src/ai/model.ts` plus the matching `.env` keys - the rest of the agent code is unchanged.

## 3. Containers

### Backend - `backend/Dockerfile`
- Base `node:22-slim`; enables **corepack** for pnpm.
- Installs dependencies with `pnpm install --frozen-lockfile` against the committed `pnpm-lock.yaml` (reproducible builds - rubric E).
- **Runs as the unprivileged built-in `node` user**, not root (CIS Docker Benchmark 4.1) - install/build runs as root, then the tree is `chown`ed and the process drops to `node`.
- No compile step: the server runs directly with `pnpm tsx src/index.ts`.
- **Healthcheck** uses Node's built-in `fetch` against `/health` (the slim image has no `curl`/`wget`): `node -e "fetch('http://127.0.0.1:8000/health')..."`, every 30s with a 10s start grace period.
- Exposes `:8000`.

### Frontend - `frontend/Dockerfile`
- Base `node:22-slim`; enables **corepack** for pnpm.
- Installs dependencies with `pnpm install --frozen-lockfile` from the repo root, using the workspace lockfile.
- Serves the Vite dev server with `pnpm dev` (`vite --host 0.0.0.0 --port 5173`).
- Exposes `:5173`. This is a **dev server**, intentionally - the brief asks for a working web prototype demonstrated live, not a production CDN build.

### Compose - `docker-compose.yml`
- `backend`: builds from repo root (needs the pnpm workspace files), loads `.env` with `required: false` (so the stack boots even without a `.env`), publishes `8000:8000`, bind-mounts `./keys:/keys:ro`, and adds `host.docker.internal:host-gateway`.
- `frontend`: builds from the repo root with `frontend/Dockerfile`, sets `VITE_API_BASE=http://localhost:8000`, publishes `5173:5173`, `depends_on: backend`.

```bash
docker compose up --build      # frontend :5173 | backend :8000/health
```

## 4. Configuration & environment

Config is parsed once, at first use, by `backend/src/env.ts` through a **Zod schema** and a `superRefine` for conditional requirements. Importing the module has no side effects (so tests run without a full environment); the first real access fails fast with a readable, **value-free** message (`Missing or invalid required env var: PHOENIX_API_TOKEN`) - the variable *name* only, never its value, so secrets can't leak into logs.

| Variable | Default | Required when | Purpose |
|---|---|---|---|
| `PHOENIX_API_BASE_URL` | `''` | Phoenix is real | ERP base URL (live mock: `http://68.210.101.85:8000`) |
| `PHOENIX_API_TOKEN` | `''` | Phoenix is real | `Authorization: Bearer` token (from Builder Base) |
| `OPENAI_API_KEY` | `''` | LLM is real | LLM provider key (bring-your-own) |
| `LLM_PROVIDER` | `openai` | - | provider selector |
| `LLM_MODEL` | `gpt-4o` | - | model id |
| `SSH_PRIVATE_KEY_PATH` | `/keys/your-key.pem` | real VM work | path to the mounted `.pem` |
| `SSH_USERNAME` | `azureuser` | real VM work | SSH user on the customer VM |
| `PORT` | `8000` | - | backend listen port |
| `MOCK_MODE` | `false`(1) | - | master offline switch |
| `MOCK_PHOENIX` / `MOCK_SSH` / `MOCK_LLM` | `false` | - | per-service offline switches |

(1) The schema default is `false`, but the committed **`.env.example` ships `MOCK_MODE=true`** so that `cp .env.example .env && docker compose up` boots fully offline with no real credentials and can never accidentally hit the live ERP with a placeholder token. Flip the mock flags to `false` and fill the credentials for real runs.

**Conditional requirement logic** (`env.ts` `superRefine`): Phoenix credentials are required only when `!MOCK_MODE && !MOCK_PHOENIX`; the LLM key only when `!MOCK_MODE && !MOCK_LLM`. `resolveClientMode('phoenix'|'ssh'|'llm')` returns `'mock' | 'real'` per service, so any subset of dependencies can be mocked independently.

## 5. Mock mode (first-class infrastructure, not an afterthought)

Every external dependency has an in-process mock: **Phoenix** (`backend/src/phoenix/mock.ts`), **SSH** (`backend/src/ssh/mock.ts`, scripted responses), and the **LLM**. With `MOCK_MODE=true` the entire ticket -> run -> propose -> approve -> (mock) execute -> activity loop runs **offline, deterministically, with zero credentials**. This is core infrastructure for two reasons:
1. **The live demo cannot hard-fail** on flaky conference Wi-Fi, a rebooting VM, or an expired token.
2. **Tests** drive the full loop with mocked fetch/SSH/model - no network, no real VM.

## 6. Networking & ports

| Port | Service | Notes |
|---|---|---|
| `8000` | backend HTTP + SSE | `/health`, `/api/*`, `/api/runs/:id/events` |
| `5173` | frontend dev server | reaches the backend via `VITE_API_BASE` |
| `22` (outbound) | SSH -> customer VM | key auth, connect + per-command timeout |

- **Reaching a host-run Phoenix mock:** use `host.docker.internal` (wired via `extra_hosts`), not `localhost`, from inside the container.
- **CORS** is open (`*`) on the backend - appropriate for a single-machine tool with no cookies and no browser-held secrets.
- **No inbound** path to the customer VM and **no backend auth** (single-team local tool; the Phoenix token is the only secret, and it stays server-side).

## 7. Data & state

- **Audit / run store:** SQLite via better-sqlite3 - a single file inside the backend container. Synchronous driver, so DB calls are short and ordered. **Append-only** for audit events: there is no delete path. The in-memory fallback activates only for mock/test mode; real mode refuses to start if SQLite is unavailable.
- **Run lifecycle** lives in the `runs` table (`current_phase` column); Phoenix ticket status (`OPEN`/`PENDING`/`DONE`) is written only at submit time.
- **Per-run SSE subscriptions** live in memory (`events/run-event-bus.ts`, module-level singletons); the durable run state lives in SQLite, so it survives a process restart.
- **Persistence across container restarts** is configured through the `autopilot-data` named volume mounted at `/app/backend/data`.

## 8. Secret handling & supply chain

- `.env` and `keys/` are **git-ignored**; only `.env.example` (placeholders) and `keys/.gitkeep` are committed.
- The **SSH private key** is read from the read-only `/keys` bind mount - never inlined into an image, never logged.
- The **Phoenix token** is read from the environment via `env.ts` and never returned to the browser.
- **Redaction** (`safety/redaction.ts`) runs on every string before it reaches the audit log, the UI, or the model.
- **Reproducible installs** via `pnpm --frozen-lockfile`. A **secret scan** (e.g. `gitleaks` / `git grep`) is run before the code freeze; the recommended CI gate is a gitleaks GitHub Action so nothing leaks on push.

## 9. Drift notes (where older prose disagrees with the build)

For honesty and to save a confused reader time:
- **`STACK.md`** (an early planning doc) proposes Next.js 15, "AI SDK 6", and Anthropic Claude. The implemented stack is **Vite + React + a Hono backend, AI SDK v4, OpenAI provider** - `STACK.md` now carries a banner pointing here and to `ARCHITECTURE.md`.
- **`ARCHITECTURE.md` / `PRD.md`** say "Vercel AI SDK v5". The lockfile resolves **`ai@4.3.19`**. The APIs the design relies on (`generateObject`, `Output.object`, `tool({ inputSchema })`, `stopWhen: stepCountIs`) are present in v4; the version label is cosmetic, the design holds.
- **The auto-generated stack/conventions block in `CLAUDE.md`** originally described the *deleted* Python/FastAPI skeleton; it has been corrected to the Node/Hono reality.

## 10. System requirements

- **Docker + Docker Compose** (primary path) - nothing else needed to run the stack.
- **Without Docker:** Node 22+ and pnpm (`corepack enable`) for the backend; Node 20+ for the frontend. `pnpm install && pnpm test` from the repo root; `pnpm --filter ... dev` / `npm run dev` to serve.
- **For real VM work:** a customer VM reachable over SSH from wherever the backend runs, the matching `.pem` in `keys/`, and (likely) passwordless `sudo` for `azureuser` - preflighted with `sudo -n true`, never assumed (see [LIMITATIONS.md](./LIMITATIONS.md)).

---

*Companions: [ARCHITECTURE.md](./ARCHITECTURE.md) (software design) | [LIMITATIONS.md](./LIMITATIONS.md) (constraints & failure modes) | [RESULTS.md](./RESULTS.md) (build status & test results).*
