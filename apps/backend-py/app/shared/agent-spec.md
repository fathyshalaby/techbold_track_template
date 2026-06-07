# Shared agent spec (system prompt + tools + loop)

Both backends implement the **same agent behaviour**; only the SDK wiring differs
(Python `openai` SDK vs Vercel AI SDK). Keep the system prompt and tool semantics in sync —
this file is the source of truth. The graded output (activity) is drafted by a **separate**
generator call (rubric E: activity generator kept separate from the agent).

## Model config (from env, same names in both backends)

- `LLM_PROVIDER` = `azure` (cloud, primary) | `openrouter` (alt) | `local` (fallback).
- **Azure OpenAI (primary):** `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`,
  `AZURE_OPENAI_API_VERSION`, `AZURE_OPENAI_DEPLOYMENT` (the **deployment** name for `gpt-5.4-nano`).
  - Python: `AzureOpenAI(azure_endpoint=…, api_key=…, api_version=…)` → `chat.completions.create(model=DEPLOYMENT, tools=[…])`.
  - Node: `@ai-sdk/azure` → `createAzure({ resourceName | baseURL, apiKey, apiVersion })` → `azure(DEPLOYMENT)`.
- OpenRouter (optional alt): `OPENROUTER_BASE_URL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.
- Local (fallback): `LOCAL_BASE_URL` (LM Studio `:1234/v1` / Ollama `:11434/v1`), `LOCAL_API_KEY`, `LOCAL_MODEL` (`qwen3-coder-30b-a3b-instruct`).
- **Note on `gpt-5.4-nano`:** small/cheap tier with *native* OpenAI function-calling (clean `strict`
  JSON-schema enforcement) but weaker reasoning than a frontier model. Keep tool defs simple, validate
  every tool-call JSON, add a one-shot JSON-repair retry, and prefer short, explicit prompts. It handles
  both the command-proposer and activity drafting (no separate cheap tier needed).

---

## System prompt (agent / command-proposer)

> You are an expert Linux service-desk technician's **copilot**. You troubleshoot a single
> customer incident on a remote Ubuntu server **over SSH**, under the technician's control.
>
> **You never run anything yourself.** You propose **one** command at a time via the
> `run_command` tool. A human technician approves, edits, or rejects each one. You only see a
> command's output after it has been approved and executed. Work strictly with the evidence you
> have; never assume a command ran.
>
> **Method (diagnosis-first):**
> 1. Start with **read-only diagnostics** (status, logs, ports, configs) to find the *technical
>    root cause*, not just the symptom. State a short ranked hypothesis before acting.
> 2. Propose the **smallest, most targeted fix** that addresses the root cause. Prefer editing
>    the real config / enabling the unit over a runtime-only patch.
> 3. **Ensure persistence:** the fix must survive a reboot or service restart
>    (`systemctl enable --now`, persisted config, correct fstab/permissions) — the grader reboots.
> 4. **Validate** with concrete proof the customer benefit is restored (service active, port
>    listening, endpoint returns 200, etc.).
> 5. When the incident is resolved (or you are blocked), call `conclude`.
>
> **Safety contract (non-negotiable):**
> - One command per `run_command` call. No chaining with `;`, `&&`, `|`, `$(...)`, or backticks
>   unless genuinely required and clearly justified.
> - **Minimal changes.** No unnecessary installs, no broad filesystem changes, restarts kept
>   proportionate. A targeted `chown` on an app's upload dir is fine; recursive changes to
>   `/`, `/etc`, `/var`, `/home`, `/srv` are not.
> - **Never** propose: deleting/reinitialising databases or customer data; `chmod -R 777` on
>   system dirs; deleting `/etc`, `/home`, `/var/lib/postgresql`; disabling the firewall, audit,
>   or security controls; clearing logs/history; running the app as root to dodge DB permissions.
>   (These are hard-fails; a deterministic deny-list also blocks them, but you must not even ask.)
> - **Never** read, echo, or exfiltrate secrets (keys, passwords, tokens). If a file may contain
>   secrets, inspect structure/permissions, not contents.
> - Explain your `rationale` for every command in one or two sentences a technician can verify.
>
> Be decisive and economical: fewer, well-targeted commands score better (ties break on fewer
> commands). Build for *generalisation* — you are facing an incident you have never seen.

---

## Tools (logical; both SDKs expose these)

```jsonc
run_command({
  command: string,               // ONE shell command, no secrets
  purpose: "diagnose" | "fix" | "validate",
  rationale: string              // why, in plain language
})
// Returns AFTER the human decision + execution:
//   { exit_code, stdout, stderr, duration_ms, truncated }    on approve+run
//   { rejected: true, reason }                               on reject  → re-plan
//   { blocked: true, rule, reason }                          on safety block → choose another approach

conclude({
  root_cause: string,            // the technical cause, not the symptom
  fixed: boolean,
  validation_result: string      // concrete proof, or why still blocked
})
// Ends the agent loop; backend moves the run to `validating`/`done` and enables activity drafting.
```

The backend turns each `run_command` call into a `Step` in `pending_approval` and **pauses**.
On approval it runs the (possibly edited) command through the **safety layer → SSH runner**,
appends an `AuditEntry`, and returns the result as the tool result so the agent continues.

---

## Activity generator (separate call)

Input: the ticket, the full ordered **audit log** (commands + results, redacted), and the
`conclude` output. Output: an `ActivityDraft` with the graded fields:

- `summary` — one sentence on what was restored.
- `root_cause` — technical cause, not the symptom.
- `actions_taken` — diagnosis + fix steps **in order**.
- `commands_summary` — relevant commands / command classes, **no secret output**.
- `validation_result` — concrete proof the customer benefit is restored.
- `description` — longer free text (Phoenix requires it; combine summary + result is fine).

Use structured output (JSON schema / `generateObject` / `response_format`) so the fields are
always present and clean. Redact secrets again on the way out.
