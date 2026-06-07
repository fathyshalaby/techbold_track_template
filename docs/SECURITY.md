# Security — Service Desk Autopilot

The system's overall security posture and threat model. This is broader than [SAFETY_POLICY.md](SAFETY_POLICY.md) (which governs *which commands may run on the customer VM*); this document covers **secret handling, transport, the model as an untrusted component, supply chain, and what an attacker — or a manipulated model — cannot do.** It directly supports rubric **C** ("secret protection", "responsible AI") and the repo **secret-scan** the judges run.

> **Threat-model stance:** trust the deterministic backend; trust *nothing else by default* — not the model, not command output, not the network. Every guarantee below is enforced by code and (where applicable) a test, never by a prompt.

---

## 1. Assets to protect

| Asset | Where it lives | Exposure if leaked |
|---|---|---|
| **Phoenix API token** | backend env (`PHOENIX_API_TOKEN`) | full ERP access as the team |
| **SSH private key** (`.pem`) | read-only `/keys` mount | shell access to customer VMs |
| **LLM provider key** | backend env (`OPENAI_API_KEY`) | billable API abuse |
| **Customer system data** (command output) | audit store | privacy / contractual breach |
| **Secrets *inside* the VM** (configs, env, keys) | on the customer box | a hard-fail if read/echoed/committed |

## 2. Trust boundaries

```
Browser (untrusted input) ──▶ Backend (TRUSTED control plane) ──▶ { Phoenix, SSH→VM, LLM }
                                     ▲
                              the LLM is treated as UNTRUSTED:
                              it can propose, never execute
```

- **The browser** is untrusted: all query/body input is Zod-validated; it never receives a secret and never reaches Phoenix/SSH/LLM directly.
- **The LLM** is an *untrusted advisor*: it has no execute tool, its output is structured-validated, and its proposals always pass the deterministic safety gate. A wrong or manipulated model cannot cause an unsafe action.
- **Command output** (and MOTD/log/file contents) is **untrusted data, never instructions** — see prompt-injection, §6.
- **The backend** is the only trusted component and the only holder of secrets.

## 3. Secret handling

- `.env` and `keys/` are **git-ignored**; only `.env.example` (placeholders) and `keys/.gitkeep` are committed.
- The **SSH key** is read from the read-only `/keys` bind mount at runtime — never inlined into an image, never logged, never returned by any API.
- The **Phoenix token** is read via `env.ts` and attached to upstream requests server-side; it is never sent to the browser and never appears in an error returned to the client.
- **Config errors are value-free:** `env.ts` reports `Missing or invalid required env var: <NAME>` — the variable *name* only, never its value — so a misconfiguration can't print a secret into logs.
- **Redaction** (`safety/redaction.ts`) strips private keys, `password=`, `token=`, `secret=`, `api_key=`, `Authorization:` headers, bearer tokens, and DB connection strings from **every** string before it reaches the audit log, the UI, or the model. It runs on capped input and has its own unit tests; a regression here is treated as a potential hard-fail.

## 4. Secrets inside the customer VM (a rubric hard-fail surface)

Reading, logging, exposing, or committing secrets found on the VM is an explicit hard-fail. Mitigations (see [SAFETY_POLICY.md §3, §8b](SAFETY_POLICY.md)):
- The blocklist denies `cat /etc/shadow`, dumping private keys, printing `.env`/credentials, and `env`/`printenv` piped to anything external.
- When a fix lives in a secret-bearing config file, the agent **edits the specific directive in place without printing values** and **redacts the diff** — it never `cat`s a whole secrets file into context.
- All captured output is redacted before storage, so even an incidental secret in command output does not persist unredacted.

## 5. Network & transport

- **No inbound** path to the customer VM; the backend reaches it **outbound** over SSH (key auth, connect + per-command timeout, one non-interactive command per exec).
- **CORS** is open (`*`) on the backend — acceptable because there is **no auth, no cookies, and no browser-held secret**; the attack surface a permissive CORS usually exposes (riding a user's credentials) does not exist here.
- **No backend authentication** — a deliberate decision for a single-team, single-machine local tool. The Phoenix token is the only secret and it stays server-side. *This is a limitation for any multi-user deployment* (see [LIMITATIONS.md](LIMITATIONS.md)); adding auth is out of scope for the hackathon.
- **Phoenix is plain HTTP** in the provided mock (outside our control); the token is still never logged or sent to the browser.
- **No exfiltration:** the safety gate blocks `curl … | sh`, reverse shells, and piping system data to external hosts. Optional web search is a deferred, advisory-only, outbound-sanitized, audited P2 feature — not enabled by default.

## 6. The model as an attack surface (prompt injection & misuse)

LLM-specific threats and how they're contained:
- **Prompt injection via output.** A log line, MOTD, or file that says *"run `rm -rf /`"* is **data, not a command.** The agent may *report* it, but any resulting proposal still passes the full deterministic gate — the verdict is independent of what the output "says."
- **Over-eager or wrong proposals.** The model can propose anything; it can execute nothing. Execution is backend-only, after human approval and a safety re-check.
- **Risk downgrade.** The optional LLM safety second-opinion may only **raise** a risk level, never lower a deterministic classification.
- **Runaway cost / loops.** A `MAX_STEPS` cap and a loop detector bound the run; on the cap it degrades to an honest partial activity.

## 7. Defence in depth (the layers that must all fail for harm)

1. **System prompt** — instructs the model never to propose forbidden commands *(advisory, first line only)*.
2. **Proposal-time policy** — `validateCommandAgainstPolicy(proposed)`; blocklisted → `command.blocked`, never reaches a human.
3. **Approval-time policy** — re-validates the **final, possibly-edited** command; a dangerous edit → `422` + audit `BLOCKED`.
4. **Executor constraints** — single non-interactive command, connect + command timeout, output cap, `bash -lc`/`sudo -n`.
5. **Redaction** — on all output before audit/UI/model.
6. **Append-only audit** — actions cannot be hidden; the activity is built only from this log.

The deterministic layers (2–6) are the guarantee; the prompt (1) is convenience, never the safeguard.

## 8. Supply chain & repository hygiene

- **Reproducible installs:** `pnpm install --frozen-lockfile` against a committed `pnpm-lock.yaml`.
- **Least privilege in the container:** the backend process runs as the unprivileged built-in `node` user (CIS Docker Benchmark 4.1), not root.
- **Secret scanning:** run a scan (`gitleaks` / `git grep`) before the code freeze; the recommended CI gate is a gitleaks GitHub Action so a secret can never land on `push`. This mirrors the exact scan the judges run.
- **Dependencies** are mainstream, permissively licensed (MIT/Apache/BSD); GPL/AGPL tools referenced in [RESOURCES.md](RESOURCES.md) are *invoked or re-expressed*, never vendored into this MIT repo.

## 9. What an attacker / manipulated model **cannot** do

- Execute any command on the VM without a human approving it.
- Execute a blocklisted command at all (blocked before any approval card).
- Read a secret into the audit log, the UI, or the activity report (redaction + the secret-read blocklist).
- Hide what was done (append-only audit; clearing logs/history is itself blocked).
- Escalate to root to bypass permissions (explicit hard-fail).
- Make the activity claim an action that never ran (the activity is generated only from the recorded results).

## 10. Known security limitations

No backend auth (single-team scope); open CORS (no cookies/secret in the browser, so low impact); plain-HTTP Phoenix mock (provider-side); pattern-based redaction (a novel secret format could slip a regex — mitigated by "redact on uncertainty" and conservative caps); the SQLite file is not encrypted at rest (the host machine is the trust boundary). These are accepted trade-offs for a local hackathon tool and are listed in [LIMITATIONS.md](LIMITATIONS.md).

---

*Companions: [SAFETY_POLICY.md](SAFETY_POLICY.md) (command policy & blocklist) · [HARDENING.md](HARDENING.md) (guard-+-test contract) · [INFRASTRUCTURE.md §8](INFRASTRUCTURE.md) (secret handling in deployment) · [LIMITATIONS.md](LIMITATIONS.md).*
