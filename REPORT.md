# REPORT — techbold AI Service Desk Autopilot

## Problem

Today, remote IT troubleshooting is manual and under-documented: a technician SSHes into a
customer VM, tries things, and fixes the issue — but the decisive steps rarely make it into the
ERP. Knowledge evaporates after every ticket. We build an AI copilot that does the troubleshooting
**under the technician's control** and **documents every step automatically**.

## Solution overview

A technician opens a ticket, the app loads the customer system, and an AI agent proposes
diagnostic and fix commands **one at a time**. The technician approves, edits, or rejects each
one. Approved commands pass a deterministic safety layer, run over SSH, and the (redacted) result
is fed back so the agent re-plans — until it validates the fix. The full audit log becomes a
precise activity that is written back to the ERP.

## Key design decisions

1. **Two backends, one shared safety core (Node is the primary graded backend; Python is a secondary mirror at safety parity).** We ship both a Python (FastAPI/paramiko) and
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

5. **Model choice.** Primary is Azure OpenAI `gpt-4o` (native function calling, cheap, fast).
   Because it's a small model, tool defs are simple, tool-call JSON is validated with a repair
   path, and documentation uses structured output. A local model (Qwen3-Coder-30B via LM Studio)
   is a config-switch fallback for offline/rate-limit resilience — not the primary brain.

## Tech stack

React + Vite + TypeScript · FastAPI + paramiko + OpenAI SDK · Hono + Vercel AI SDK v4 (`@ai-sdk/openai`) +
ssh2 · Azure OpenAI `gpt-4o` (+ local Qwen fallback) · Docker Compose.

## How it maps to the rubric

- **A (ERP workflow):** ERP client with auth/retries; ticket list with sort + status/priority
  filters; system load; complete activity create; clean 401/404/empty handling.
- **B (troubleshooting):** diagnosis-first agent, minimal/persistent fixes, validation; built for
  generalisation (no hardcoded incidents).
- **C (safety/audit):** deny-list, risk-tiered human gate (writes), full audit trail, LLM input
  guard + PII redaction, minimal-change prompting. No secrets in repo/logs/activity.
- **D (technician UX):** ticket overview + detail with system info, visible agent progress,
  followable audit log, approve/edit/reject/abort.
- **E (engineering):** modular separation, two-build structure, real README, runnable tests
  (shared dual-engine + backend-py pytest + node typecheck), error handling + timeouts + retries
  for SSH/ERP/LLM, `.env.example` with no secrets.

## Known limitations / next steps

- Runs are in-memory (single-user demo); persist to a DB for multi-technician use.
- SSE progress streaming is deferred — the frontend renders progress from each POST response.
- Per-VM key mapping is solved by trying all keys; a deterministic map would be marginally faster.
- `gpt-4o` is small; a stronger model (or the local 30B) would lift hard-incident accuracy.
