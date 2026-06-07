# apps/backend-py — Python / FastAPI backend (secondary)

A complete FastAPI implementation of the Service Desk Autopilot, ingested from the
`feat/ai-service-desk-autopilot` branch and brought to safety parity with the node backend
(`apps/backend`). **Node is the primary, shipped backend; this is the secondary.**

## Why it exists
Its run engine **auto-drives** (`runs.py` spawns a background thread) and, with
`auto_run_readonly=true`, **auto-executes read-only diagnostics while still gating every write** for
approval. That selective-HITL model is the variant that can run **unattended** — relevant to the
Phoenix Judge Console's `autograde` / `run` endpoints, where the strict per-command-approval node
backend would stall waiting for a human. Set `auto_run_readonly=false` for the strict-rubric reading
(approval on every command).

## Parity with the node backend
Brought up to `apps/backend` hardening during ingestion:
- **Redaction** (`app/safety.py`): node-parity 18-pattern set + known-value scrub + 16 KB cap
  (private keys, JWT, bearer, AWS id+secret, db-connection strings, vendor token prefixes —
  GitHub/Slack/OpenAI/Stripe/GitLab/Google — unix-crypt hashes, JSON/env/header variants).
- **Classifier** (`app/safety.py`): blocklist checked against the full command **and each chained
  segment**; commands with subshell/variable/backtick obfuscation are never auto-cleared as read-only.
- **LLM input guard** (`app/llm.py::_guard`): every outbound message (system/user/tool-result) is
  redacted before it reaches the provider — already present, kept.
- **Multi-provider model** (`app/llm.py`): Azure AI Foundry + classic Azure + OpenRouter + local —
  already present, kept.
- **Encoded knowledge** (`app/knowledge.py`): node-parity diagnostic method (USE, partial-failure
  bisection, durable-fix/persistence) + four per-symptom runbooks routed by symptom into the agent
  prompt (`app/agent.py`).

The deterministic safety ruleset is bundled self-contained at `app/shared/safety-rules.json`.

## Run
```bash
# standalone (dev)
cd apps/backend-py
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8002

# via docker compose (opt-in profile; coexists with node on :8000, this on :8002)
docker compose --profile py up backend-py
```

## Test
```bash
cd apps/backend-py && pip install pytest pydantic-settings && pytest -q
```
`tests/test_safety.py` covers the blocklist, read-only classification, needs-review default, and
node-parity redaction (vendor tokens, JWT, private-key block, 16 KB cap).

> Not in the node CI (which runs `bun test`/`tsc`). Verify Python changes with `pytest` locally.
