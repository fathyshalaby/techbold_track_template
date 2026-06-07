# LIMITATIONS — Service Desk Autopilot

An honest, judge-facing register of what this system **does not** do, where it **can** fail, and what we deliberately traded away under a 24-hour build. Stating limits plainly is part of responsible AI (rubric C) and engineering maturity (rubric E) — and the jury built the grader, so hand-waving does not survive. Each limitation lists its **mitigation** and, where relevant, its **rubric impact**.

> Design stance behind every entry below: **assume the model is wrong, overconfident, or manipulated — the damage must still be contained by deterministic code, never by the prompt.** Limitations in the *model's* competence are bounded by the *backend's* guarantees.

---

## 1. Scope limitations (by design)

| Out of scope | Why | Consequence |
|---|---|---|
| Kernel, bootloader, hardware, cloud-networking faults | The brief restricts incidents to **local Linux services over the shell** | The agent will not attempt these; it documents them as out of scope rather than guessing |
| Fully autonomous remediation | Against the rules — a human confirms **every** action | Throughput is bounded by human approval; this is intentional, not a defect |
| Multi-tenant auth / RBAC / SSO | Single-team local tool; the Phoenix token is the only secret and stays server-side | No login; not deployable as a shared SaaS without adding auth |
| RAG / vector DB / web browsing (default) | Nothing in the case needs document retrieval; on-box `man`/`--help`/config is ground truth | The agent learns unfamiliar services from the box itself; guarded web search is a deferred P2 (advisory-only, sanitized, audited) |
| Analytics, charts, theming, animations | UI is only 10 of 100 rubric points | The UI is deliberately minimal — one ticket list, one run page |
| Generic shell assistant | The agent is scoped to *diagnose-and-fix-this-ticket* | It will not act as a free-form remote shell |

These are not gaps to close later — they are explicit non-goals (see [PRD.md §6.3](./PRD.md) and [.planning/REQUIREMENTS.md](../.planning/REQUIREMENTS.md) "Out of Scope").

## 2. Current implementation status (the largest limitation today)

The product is mid-build. The **foundation that carries the safety/audit points is complete and tested; the agent loop and UI are not yet wired**. See [RESULTS.md](./RESULTS.md) for the exact per-phase breakdown and test counts.

- **Done & tested (Phases 1–3, 254 tests green):** Zod-validated env, the Phoenix ERP client + mock, the deterministic safety layer (blocklist, classifier, redaction), and the append-only audit/run store.
- **Scaffolded, not yet functional (Phases 4–9):** the SSH executor, the orchestrator + the five agent roles, the run/approval API + SSE, activity generation, and the React workspace. These files exist as stubs.

**Implication:** an end-to-end *real-VM* run is not yet demonstrable from the committed code at the time of writing. The architecture, prompts, safety policy, and contracts are fully specified, and the mock-mode loop is the integration target. This document and [RESULTS.md](./RESULTS.md) are kept honest as phases land.

## 3. Reliability limitations of the AI core (and how we bound them)

LLM troubleshooting agents are genuinely hard — frontier models resolve only ~50% of Terminal-Bench and ~11% of ITBench-SRE tasks (see [RELIABILITY.md](./RELIABILITY.md)). We do **not** claim to beat that with prompting alone; we bound the failure modes structurally:

| Failure mode | Mitigation in our design |
|---|---|
| **Command not in PATH** (the single most common harness failure) | Every command runs via `bash -lc` (login PATH); absolute paths for system binaries; a tool-availability preflight |
| **Premature "it's fixed"** (false verification) | Proof is the customer-benefit test, never `systemctl is-active`; intermittent symptoms are tested over an interval; a single green → `LIKELY_FIXED`, not `VERIFIED_FIXED` |
| **Cause = symptom confusion** | Evidence gates between phases; the activity's `root_cause` must be a *technical cause*, traced to an observed line |
| **Context collapse on long transcripts** | Output budgeting — full output stored in the DB, a capped digest + extracted signal lines fed to the model; `LANG=C` for stable parsing |
| **Tunnel vision / a second fault** | The ground-truth sweep enumerates all anomalies before committing; if the benefit test still fails after a fix, the agent re-enriches |
| **Hanging on a password prompt** | `sudo -n` (non-interactive); "needs password" is surfaced as a question, never a hang |
| **Prompt injection via command output / MOTD / logs** | All command output is treated as **untrusted data, never instructions**; any resulting proposal still passes the full deterministic gate |
| **Runaway loops / cost** | `MAX_STEPS` cap and a loop detector; on the cap the run degrades to an honest partial activity |

**What we can and cannot guarantee.** We can guarantee that *no blocklisted command executes* and *no secret reaches the log/UI/activity* (deterministic, tested). We cannot guarantee the model finds every root cause on every hidden VM — when it cannot, it is designed to **give up safely**: revert partials, leave the system no worse than found, and write an honest partial activity (which still earns root-cause-attempt, no-regression, and summary credit).

## 4. Safety-model limitations (the boundaries of the gate)

The safety layer is deterministic and strong, but it is a **policy**, not a sandbox, and it has edges:

- **Static classification of dynamic commands.** Heavily obfuscated constructs (deep `$()` nesting, base64-piped-to-shell, here-docs) cannot always be resolved statically. Policy: **if it cannot be resolved safely, it is blocked** — fail closed, never open. The cost of a false block is a re-plan; the cost of a false allow could be a hard-fail.
- **Allowlisted commands can still be misused.** `SAFE_READ_ONLY` means read-only and bounded, but e.g. reading the *wrong* file is still possible within policy — which is why **every** command (even read-only) requires approval and is audited.
- **The blocklist is a denylist of known-dangerous patterns**, complemented by tiered classification for everything else. It is robust to the obfuscation variants we test (whitespace, quotes, `${HOME}`) but is not a formal proof of safety for arbitrary input. The defence-in-depth layers (proposal check → edit re-check → executor constraints → redaction) exist precisely because no single layer is complete.
- **Redaction is pattern-based.** It catches keys, tokens, passwords, bearer headers, and connection strings, with its own tests. A novel secret format could slip a regex; mitigations are conservative caps, "redact on uncertainty," and never `cat`-ing whole secret-bearing files (target the specific directive).

## 5. ERP / external-integration limitations

- **Phoenix endpoint set is confirmed-but-external.** The live mock (`http://68.210.101.85:8000`) currently exposes the full set, but only the **core three** (list tickets, get customer-system, create activity) are load-bearing; everything else (`/me`, ticket detail, `/customers/{id}`, status-PATCH) **degrades gracefully** if the live mock changes.
- **Grading swaps "mode"** so `/me/tickets` returns fresh hidden incidents — hence **consume `/me/tickets`, never hardcode** ticket IDs.
- **Setting ticket status `DONE` is unscored** — done as a cheap courtesy at the end, never a gate on the demo.
- **Phoenix is plain HTTP**, not HTTPS, in the provided mock — outside our control; the token is still kept server-side and never logged.

## 6. Known external blockers & unconfirmed assumptions

These are tracked live in [.planning/STATE.md](../.planning/STATE.md) and [.planning/PROJECT.md](../.planning/PROJECT.md):

- ⚠️ **SSH `.pem` not yet placed in `keys/`** (only `.gitkeep`). A hard blocker for any real-VM work until provided out-of-band.
- ❓ **Passwordless `sudo` for `azureuser` is unconfirmed.** Many fixes depend on it. The SSH preflight runs `sudo -n true` and the agent **surfaces** "I need sudo to read X" rather than concluding "looks fine." Fixes prefer no-sudo paths where possible.
- ⏰ **Hard code freeze: Sunday June 7, 14:00.** Remaining phases (4–9) must land before then; the roadmap sequences them on the critical path.

## 7. Engineering / operational limitations

- **Frontend ships as a Vite dev server**, not a production build behind a CDN — appropriate for a live-demoed prototype, explicitly out of scope for production hardening per the brief.
- **No DB volume by default** — the SQLite file lives in the container's writable layer; durability spans a session, not container recreation (mitigated by the JSONL audit mirror). Add a named volume for a long-lived deployment.
- **Single-node, single-process.** No HA, no horizontal scale, no queue — by design for a single-team tool under a 24h box.
- **Version-label drift** between early prose ("AI SDK v5/v6", "Anthropic") and the installed build (AI SDK v4 + OpenAI provider) — reconciled in [INFRASTRUCTURE.md §9](./INFRASTRUCTURE.md); functionally equivalent and provider-swappable in one file.
- **Tests concentrate where the risk is** (safety, redaction, Phoenix client, env, routes). Orchestrator/agent tests are pending with their phase (the `orchestrator.test.ts` file is currently a skipped stub).

## 8. Demo-day risks & fallbacks

| Risk | Fallback |
|---|---|
| Flaky venue Wi-Fi / VM unreachable | **Mock mode** runs the entire loop offline, deterministically |
| Live LLM latency or rate-limit mid-pitch | `MOCK_LLM=true` replays a scripted plan; or pre-warm a run |
| Phoenix token expiry / 401 | `MOCK_PHOENIX=true`; the client also surfaces 401 as a clean state, not a crash |
| Agent goes down a blind alley live | Human takes over via the manual-command path (same safety + audit); or abort → partial activity |
| Something dangerous gets typed live | The deterministic gate blocks it before any approval card — this is a *feature to demo*, not a risk |

---

*Companions: [RELIABILITY.md](./RELIABILITY.md) (failure-mode analysis in depth) · [SAFETY_POLICY.md](./SAFETY_POLICY.md) (the gate) · [RESULTS.md](./RESULTS.md) (current status) · [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) (how it runs).*
