# REPORT — techbold AI Service Desk Autopilot

## Problem

techbold's technicians fix customer IT incidents by SSHing into remote Linux VMs and running
diagnostics and repairs by hand — but that work is **risky** (one careless command on a production
box can wipe a database) and **under-documented** (the decisive steps rarely reach the ERP, so
hard-won knowledge evaporates after every ticket). The real challenge isn't "can an LLM suggest
shell commands" — it's whether an agent can troubleshoot a machine it has **never seen**, fix the
**root cause** so the fix survives a reboot, and do it under tight human control with a complete
audit trail and zero destructive actions. So what we build is **trustworthy, self-documenting
remote troubleshooting**: an AI copilot that proposes one command at a time, a deterministic safety
layer plus a per-command human gate that make a catastrophic action impossible, an automatic
write-back that turns the whole session into a proper ERP activity — and a system that gets
**smarter with every incident it resolves**.

## Solution overview

A technician opens a ticket, the app loads the customer system, and an AI agent proposes
diagnostic and fix commands **one at a time**. The technician approves, edits, or rejects each
one. Approved commands pass a deterministic safety layer, run over SSH, and the (redacted) result
is fed back so the agent re-plans — until it validates the fix. The full audit log becomes a
precise activity that is written back to the ERP.

## Key design decisions

1. **Two interchangeable backends, one shared core.** We ship both a Python (FastAPI/paramiko) and
   a Node (Hono/Vercel AI SDK/ssh2) backend implementing the **same** HTTP contract
   (`shared/api-contract.md`), driven by one React frontend. The expensive parts — the safety
   rules, agent spec, and API contract — are written once in `shared/` and consumed by both, so
   the second backend is mostly thin glue, not double work. This also demonstrates the architecture
   is genuinely provider/stack-agnostic.

2. **Step-wise human-in-the-loop, not autonomous tool loops.** The agent is asked for exactly one
   action per turn (`run_command` or `conclude`). The backend creates a step and pauses for any
   state-changing command; approval/rejection spans separate HTTP requests. This makes the per-command approval gate
   server-authoritative and the audit trail exact. In Node we deliberately define AI SDK tools
   **without** `execute` and manage the messages/HITL ourselves to keep editing + safety in our code.

3. **Safety is deterministic, and the human gate is risk-tiered.** A regex deny-list (hard-block) +
   read-only allow-list classifies every command before it can run, independent of the model;
   blocked commands never execute, even if approved. Rules live in one JSON validated in both
   Python `re` and JS `RegExp` (25/25 tests) so both backends behave identically. Read-only
   diagnostics run automatically while **every write** (`needs_review`) requires approve/edit/reject
   — concentrating the technician's attention where it matters instead of training rubber-stamping
   (15 harmless reads erode the gate for the dangerous 16th; toggle `AUTO_RUN_READONLY=false` for
   approve-everything). An **LLM input guard** then scrubs secrets and PII — passwords, tokens,
   JWT/AWS/GitHub keys, `scheme://user:pass@` connection strings, emails, private keys — from
   **every** message sent to the model (not just tool results), and from the audit log and the
   activity. The SSH key never leaves the backend.

4. **Persistence-aware fixing.** The agent is instructed to fix the root cause and ensure the fix
   survives a reboot/restart (`systemctl enable --now`, persisted config) — matching the grader's
   reboot/restart persistence check.

5. **Pluggable models, with a real local fallback.** Three interchangeable providers behind one
   `LLM_PROVIDER` env var, zero code change: Azure OpenAI `gpt-5.4-nano` (primary — native function
   calling, cheap, fast), OpenRouter (hosted escape hatch to a stronger model on a hard incident),
   and a **fully local** model (Qwen3-Coder-30B via LM Studio / Ollama) for offline / rate-limit /
   data-residency resilience — the agent keeps working with no internet and no customer data leaving
   the box. Because the primary is a small model, tool defs are kept simple, tool-call JSON is
   validated with a repair path, and documentation uses structured output, so flipping to the 30B
   or a hosted model only raises the ceiling. A PII/secret guard scrubs every message *before* it
   reaches any provider, so the choice of brain never changes the safety posture.

6. **A knowledge harness + an agent that evolves.** Two layers feed the model real Linux expertise
   instead of leaning on its parametric memory (both in `backend-py`, the demoed build):
   - **Static knowledge pack** (`docs/knowledge/` → `knowledge.py`): a human-authored *diagnostic
     playbook* (triage → isolate → root cause → durable fix → validate → document) is baked into the
     system prompt as the method for **any** incident, alongside four symptom-routed runbooks
     (systemd services, networking/web/TLS, resource exhaustion, data-access/scheduling) and a
     command-policy doc. Cheap keyword routing injects the **single most relevant** runbook per
     ticket — guidance, not a script — so the agent generalises to unseen incidents instead of
     guessing. Missing files degrade to empty strings; it never raises.
   - **Self-evolving solution memory** (`memory.py`): a local **SQLite FTS5** store of the agent's
     *own* solved cases. On `conclude` the solution (symptom → root cause → fix commands →
     validation) is saved; at the start of each new run, similar past cases are recalled by keyword
     and injected as the **first hypotheses to check**. Each solved incident makes the next one
     smarter — a closed learning loop with **zero new dependencies** (stdlib `sqlite3` + FTS5),
     thread-safe and best-effort (a DB hiccup never breaks a run). Every field passes through
     `safety.redact()` before insertion, so **no secret ever lands in the store** (rubric C), and the
     DB persists across container restarts via a Docker volume.

## Tech stack

React + Vite + TypeScript · FastAPI + paramiko + OpenAI SDK · Hono + Vercel AI SDK v6 (`@ai-sdk/azure`) +
ssh2 · Pluggable LLM: Azure `gpt-5.4-nano` | OpenRouter | local Qwen3-Coder-30B (LM Studio/Ollama) ·
Markdown knowledge pack + SQLite FTS5 self-evolving solution memory · Docker Compose.

## How it maps to the rubric

- **A (ERP workflow):** ERP client with auth/retries; ticket list with sort + status/priority
  filters; system load; complete activity create; clean 401/404/empty handling.
- **B (troubleshooting):** diagnosis-first agent, minimal/persistent fixes, validation; built for
  generalisation (no hardcoded incidents), grounded by a static runbook harness and a self-evolving
  solution memory that recalls the agent's own past fixes; one env var swaps in a stronger/local
  model for hard incidents.
- **C (safety/audit):** deny-list, risk-tiered human gate (writes), full audit trail, LLM input
  guard + PII redaction, minimal-change prompting. No secrets in repo/logs/activity.
- **D (technician UX):** ticket overview + detail with system info, visible agent progress,
  followable audit log, approve/edit/reject/abort.
- **E (engineering):** modular separation, two-build structure, real README, runnable tests
  (shared dual-engine + backend-py pytest + node typecheck), error handling + timeouts + retries
  for SSH/ERP/LLM, `.env.example` with no secrets.

## Known limitations / next steps

- Live run state is in-memory (single-user demo); the **solution memory** persists across restarts,
  but active runs would need a DB for multi-technician use.
- The knowledge harness + self-evolving memory currently live in `backend-py` (the demoed build);
  porting them to the Node build is mechanical glue, not yet done.
- Memory recall is keyword-based (FTS5); semantic embeddings would improve recall on paraphrased
  symptoms.
- SSE progress streaming is deferred — the frontend renders progress from each POST response.
- Per-VM key mapping is solved by trying all keys; a deterministic map would be marginally faster.
- `gpt-5.4-nano` is small; a stronger model (or the local 30B) would lift hard-incident accuracy.
