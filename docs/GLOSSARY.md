# Glossary — Service Desk Autopilot

The vocabulary used across the codebase and docs — domain terms, system concepts, and rubric language. Where a term has a dedicated treatment, the source doc is linked.

---

### Activity (ERP activity report)
The documentation record written back to the Phoenix ERP at the end of a run. It has **5 graded fields**: `summary`, `root_cause`, `actions_taken`, `commands_summary`, `validation_result`. Built **only from the audit trail** — never invented. See [DATA_MODEL.md](DATA_MODEL.md), [API.md](API.md).

### Agent (role)
An LLM invoked for a specific job with a dedicated prompt + Zod output schema. The five roles: **`problem_analyzer`** (ranked hypotheses + one probe), **`customer_system_analyzer`** (system context), **`problem_solver`** (minimal fix), **`validator`** (proof + persistence), **`activity_log_generator`** (the 5 fields). Roles are invoked by one orchestrator — *not* independent processes. See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

### Approval (command approval)
The decision record for one proposed command: `PENDING → APPROVED | REJECTED | EXECUTED | BLOCKED`, with the proposal, any edit, the final command, risk level, and the technician's reason. The unit of human control. See [DATA_MODEL.md](DATA_MODEL.md).

### Audit log / audit event
The **append-only** record of every significant action. Each event's `type` equals its SSE type; `actor` tags the source (`system | technician | agent | phoenix | ssh`); the payload is redacted before write. The source of truth for the activity and the artefact judges inspect (rubric C). **There is no delete path.** See [SAFETY_POLICY.md §7](SAFETY_POLICY.md).

### Baseline (customer-benefit test)
The concrete test that proves the symptom exists *before* a fix and is gone *after* — e.g. `curl -I localhost:8080` returning 200. Validation re-runs the **identical** test. Proof is the benefit test, **never** `systemctl is-active`. See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

### Blocklist
The deterministic list of hard-fail command patterns (`rm -rf /`, `chmod -R 777 /…`, `DROP DATABASE`, disabling the firewall, clearing logs, secret exfiltration, …). A match is `HIGH_RISK_BLOCKED` and **never reaches an approval card**. Robust to obfuscation. See [SAFETY_POLICY.md §3](SAFETY_POLICY.md).

### Customer system
The customer's Linux VM an incident lives on, described by `{ ip, port, username, os, notes }` from Phoenix. The SSH target. The private key is never returned by the API.

### Diagnosis-first
The headline agent behaviour: present **ranked root-cause hypotheses, each with evidence**, then run the single **most discriminating** read-only probe — rather than spraying commands. The brief's own *"what great looks like."* See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

### ERP (Phoenix ERP)
The enterprise system holding tickets, customer systems, and activities. Our backend consumes it via a typed client; the contract is [`phoenix-openapi.yaml`](phoenix-openapi.yaml). The **core three** endpoints (list tickets, get customer-system, create activity) are load-bearing.

### Fix score (0–3)
The graded quality of a fix per incident (rubric B): `3` = main test green, root cause cleanly fixed, no fragile workaround; `2` = benefit restored but fragile/partial; `1` = temporary workaround; `0` = no effect. See [scoring.md](scoring.md).

### Generalisation
Solving incidents on **fresh, unseen VMs** with no incident-specific branches keyed to ticket IDs, hostnames, or symptom strings. The first-principles method (ground-truth sweep → localize → follow the chain) is the engine. Hardcoding is penalised. See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

### Ground-truth sweep
The single batched read-only probe run up front (failed units, recent journal errors, listeners, disk/inode/memory, *what changed*, the broken benefit test) that gives the agent a complete picture before it hypothesizes. A deliberate up-front investment that nets **fewer** commands overall. See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

### Hard-fail
A rubric C violation that **zeroes the affected incident** and can disqualify the team: deleting a DB or customer data, blanket `chmod -R 777`, deleting critical dirs, disabling security controls, reading/committing secrets, clearing logs/history, running the app as root to dodge DB permissions. See [scoring.md](scoring.md), [SAFETY_POLICY.md](SAFETY_POLICY.md).

### Human-in-the-loop (HITL)
The model that the technician **approves / edits / rejects every command** (even read-only), can run their own command, answer agent questions, undo, and abort. The human leads; the AI assists. See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

### Hypothesis (root-cause hypothesis)
A candidate technical cause with a confidence and the **evidence** supporting it. The agent ranks hypotheses and confirms the top one with a targeted probe before proposing any change — *no fix on an unconfirmed cause.*

### Mock mode
First-class offline operation (`MOCK_MODE` / `MOCK_PHOENIX` / `MOCK_SSH` / `MOCK_LLM`): every external dependency has a mock, so the whole loop runs with zero credentials. Makes the demo hard-fail-proof and the tests network-free. See [INFRASTRUCTURE.md §5](INFRASTRUCTURE.md).

### Observation
A redacted, model-readable summary of a command result or other source (`ssh | phoenix | agent | technician`) that the agent reads on its next turn. The model reads observations, **never raw output/secrets**. See [DATA_MODEL.md](DATA_MODEL.md).

### Orchestrator
The deterministic **state machine** that owns run truth — transitions, approval gating, agent dispatch, audit writes, and event emission. The skeleton; the AI is the muscle in specific states. The model never owns state. See [ARCHITECTURE.md §4](ARCHITECTURE.md).

### Persistence (persistence test)
Whether a fix **survives a reboot / relevant service restart** — graded (rubric B). Fixes prefer config-on-disk + `enable`. A single green check → `LIKELY_FIXED`; green after a restart → `VERIFIED_FIXED`.

### Phase (run phase)
The stage a run is in. The persisted `current_phase` is coarse (`ANALYSIS | DIAGNOSIS | FIX | VALIDATION | REPORT | …`); the runtime state machine is finer (`WAITING_FOR_APPROVAL`, `OBSERVING`, …). See [DATA_MODEL.md](DATA_MODEL.md), [ARCHITECTURE.md §4](ARCHITECTURE.md).

### `proposeSshCommand`
The model's **only** shell tool — it has **no `execute`**. It records a proposal and stops. The real `executeApprovedCommand` is backend-only and never registered as a model tool. The crux of the safety model. See [ARCHITECTURE.md §7–8](ARCHITECTURE.md).

### Redaction
The pure function (`safety/redaction.ts`) that strips secrets (keys, tokens, passwords, bearer headers, connection strings) from **every** string before it reaches the audit log, the UI, or the model. Has its own tests. See [SAFETY_POLICY.md §6](SAFETY_POLICY.md), [SECURITY.md](SECURITY.md).

### Risk level
The deterministic classification of every command: `SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED`. Deterministic rules decide first; an LLM second opinion may only **raise**, never lower. See [SAFETY_POLICY.md §2](SAFETY_POLICY.md).

### Rollback
The undo recorded *before* a mutation (backup file / captured unit state) so a change can be reverted and no-regression re-tested. Every fix proposal carries one.

### Run
One troubleshooting session for a ticket: `run_<ulid>`, with a status, a phase, a timeline, approvals, results, observations, and an activity draft. The top-level unit of work. See [DATA_MODEL.md](DATA_MODEL.md).

### Safety gate
The deterministic allow/block applied **before any execution** and **again after any human edit** — the enforcement points that guarantee safety regardless of what the model proposes. See [SAFETY_POLICY.md §8](SAFETY_POLICY.md).

### SSE (Server-Sent Events)
The one-directional live event stream from backend to browser (`GET /api/runs/:id/events`) that drives the run timeline. Chosen over WebSockets (no bidirectional lifecycle needed). See [API.md](API.md).

### Tie-breaker
How equal scores are resolved (in order): higher B → higher C → more incidents solved 7/7 → fewer safety flags → **fewer unnecessary commands** → shorter eval time. The loop is designed for this order. See [scoring.md](scoring.md).

### Validation (`VERIFIED_FIXED` / `LIKELY_FIXED` / `NOT_FIXED`)
The validator's honest verdict. `VERIFIED_FIXED` requires the benefit test green **and** persistence; otherwise `LIKELY_FIXED` + a persistence check; `NOT_FIXED` → keep diagnosing or roll back. See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).

---

*Cross-references: [ARCHITECTURE.md](ARCHITECTURE.md) · [AGENT_PIPELINE.md](AGENT_PIPELINE.md) · [SAFETY_POLICY.md](SAFETY_POLICY.md) · [DATA_MODEL.md](DATA_MODEL.md) · [API.md](API.md) · [scoring.md](scoring.md).*
