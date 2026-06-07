# Documentation — Service Desk Autopilot

The complete documentation set for **Service Desk Autopilot**, a technician-controlled AI troubleshooting copilot for the techbold START Hack Vienna '26 service-desk track. This page is the map: start here, then jump to whatever you need.

> **One-line product:** load a ticket + its SSH target from the Phoenix ERP → an AI proposes **one command at a time** with ranked root-cause hypotheses → the technician **approves / edits / rejects** → a deterministic backend runs only approved commands through a **safety gate** → it iterates to a root cause, applies a **minimal reversible fix**, **validates** it survives a restart, and drafts an ERP activity report **built only from the audit trail**. **The AI never acts on its own.**

---

## Start here (by who you are)

**🧑‍⚖️ A hackathon judge / first-time reader** — read in this order:
1. [**REPORT.md**](../REPORT.md) — the engineering report: approach, architecture, agent design, safety model, rubric mapping, status. *(repo root)*
2. [**Pitch deck**](pitch/PITCH_DECK.md) — the 4-minute story. *(renders to slides/PDF — see [pitch/README.md](pitch/README.md))*
3. [**scoring.md**](scoring.md) — the 100-point rubric we're built against.
4. [**RESULTS.md**](RESULTS.md) — what's actually built and tested today (254 tests green), honestly.

*New to the vocabulary? Keep [**GLOSSARY.md**](GLOSSARY.md) open alongside any doc.*

**🛠️ A developer picking up the build:**
1. [**../README.md**](../README.md) — setup & run.
2. [**ARCHITECTURE.md**](ARCHITECTURE.md) — stack, state machine, data model, folder layout.
3. [**IMPLEMENTATION_PROCEDURE.md**](IMPLEMENTATION_PROCEDURE.md) — the step-by-step build guide.
4. [**../.planning/ROADMAP.md**](../.planning/ROADMAP.md) + [**../.planning/STATE.md**](../.planning/STATE.md) — phases & current position.

**⚙️ An operator running or grading it:**
1. [**INFRASTRUCTURE.md**](INFRASTRUCTURE.md) — topology, containers, ports, env, mock mode, secrets.
2. [**LIMITATIONS.md**](LIMITATIONS.md) — constraints, failure modes, demo-day fallbacks.
3. [**SAFETY_POLICY.md**](SAFETY_POLICY.md) — exactly what is and isn't allowed to run.

---

## All documents, by topic

### Product & requirements
| Doc | What it is |
|---|---|
| [PRD.md](PRD.md) | Product requirements: pitch, users, scope (must/nice/non-goals), success metrics, our API contract, judge-facing differentiators |
| [scoring.md](scoring.md) | The official 100-point rubric (A–E) + hard-fails + tie-breakers — the thing we optimise for |
| [../.planning/PROJECT.md](../.planning/PROJECT.md) | Project charter: what it is, core value, validated/active/out-of-scope requirements, key decisions |
| [../.planning/REQUIREMENTS.md](../.planning/REQUIREMENTS.md) | The 39 v1 requirements with IDs, rubric tags, and phase traceability |

### Architecture & engineering
| Doc | What it is |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | The build contract: stack rationale, folder structure, request→execution flow, state machine, data model, tool/output schemas, prompting strategy |
| [INFRASTRUCTURE.md](INFRASTRUCTURE.md) | **(infra)** Runtime topology, containers, compose, ports, env config, mock mode, networking, data/state, secret handling, exact installed versions |
| [API.md](API.md) | Our backend's HTTP + SSE contract — implemented routes (from the code) vs planned run-lifecycle routes, the SSE event taxonomy, and the error model |
| [DATA_MODEL.md](DATA_MODEL.md) | The persisted schema (runs, audit_events, approvals, results, observations, activity_drafts), table relationships, the append-only invariant, and the redaction write-path |
| [../.planning/codebase/STRUCTURE.md](../.planning/codebase/STRUCTURE.md) · [STACK.md](../.planning/codebase/STACK.md) · [CONVENTIONS.md](../.planning/codebase/CONVENTIONS.md) · [TESTING.md](../.planning/codebase/TESTING.md) · [INTEGRATIONS.md](../.planning/codebase/INTEGRATIONS.md) · [CONCERNS.md](../.planning/codebase/CONCERNS.md) | Codebase-level references generated from the repo |
| [../STACK.md](../STACK.md) | ⚠️ Early stack-survey (proposes Next.js/AI SDK 6/Anthropic) — **superseded**; see ARCHITECTURE.md + INFRASTRUCTURE.md for the implemented stack |

### The AI agent (troubleshooting — rubric B)
| Doc | What it is |
|---|---|
| [AGENT_PIPELINE.md](AGENT_PIPELINE.md) | The canonical behavioural spec: the optimal phase-by-phase path, the first-principles method for unknown errors, decision logic, budgets, a worked example |
| [RELIABILITY.md](RELIABILITY.md) | Why agents fail and how our design defeats each; the verified diagnose→repair→validate protocol; honest can/cannot-guarantee statement |
| [../knowledge/README.md](../knowledge/README.md) | The install-free knowledge pack: diagnostic playbook + per-domain runbooks + safety ruleset (the agent's "brain") |
| [../knowledge/diagnostic_playbook.md](../knowledge/diagnostic_playbook.md) | The master procedure: triage → isolate (USE) → root cause (5 Whys) → durable fix → validate → document |
| [../knowledge/runbooks/](../knowledge/runbooks/) | systemd-services · networking-web-tls · resource-exhaustion · data-access-scheduling |

### Safety, audit & responsible AI (rubric C)
| Doc | What it is |
|---|---|
| [SAFETY_POLICY.md](SAFETY_POLICY.md) | The enforced rules: non-negotiables, 4-tier risk classification, the blocklist, the allowlist, redaction, the mandatory audit record, defence-in-depth enforcement points |
| [SECURITY.md](SECURITY.md) | Overall security posture & threat model: assets, trust boundaries, secret handling, the model as an untrusted component, prompt injection, supply chain, what an attacker/model cannot do |
| [HARDENING.md](HARDENING.md) | The "guard + test for every failure mode" QA contract — assume the model is wrong; damage is contained by code, not prompts |
| [../knowledge/safety/command-policy.md](../knowledge/safety/command-policy.md) | The DENY taxonomy + 3-tier classify + ready `redact()` regex spec |

### Status, results & limitations
| Doc | What it is |
|---|---|
| [RESULTS.md](RESULTS.md) | **(results)** Test results (254 green), build status per phase, requirement coverage, honest rubric self-assessment, performance, practice-VM template |
| [LIMITATIONS.md](LIMITATIONS.md) | **(limitations)** Scope limits, implementation status, AI-reliability bounds, safety-model edges, external blockers, demo-day risks & fallbacks |
| [READINESS_AUDIT.md](READINESS_AUDIT.md) | Pre-build audit of the whole spec/knowledge set from four hard-to-please perspectives |
| [REVIEW.md](REVIEW.md) | A veteran sysadmin's critique + the logic-gap register (G1–G12) folded back into the design |
| [AUDIT_LOG.md](AUDIT_LOG.md) | Running record of issues found, repairs, and upgrade decisions per build phase |

### Process & planning
| Doc | What it is |
|---|---|
| [IMPLEMENTATION_PROCEDURE.md](IMPLEMENTATION_PROCEDURE.md) | Step-by-step build guide for a tired team — thin vertical slice in mock mode first, then make it real |
| [TASKS.md](TASKS.md) | Rubric-prioritised task list (P0/P1/P2) with owners, difficulty, dependencies, acceptance criteria |
| [RESOURCES.md](RESOURCES.md) | Exhaustive catalog of reusable components/datasets/tools (build the least, reuse the most) |
| [../.planning/ROADMAP.md](../.planning/ROADMAP.md) · [STATE.md](../.planning/STATE.md) | The 9-phase roadmap and the live execution state |

### Contracts & reference
| Doc | What it is |
|---|---|
| [GLOSSARY.md](GLOSSARY.md) | Every domain, system, and rubric term defined — read any doc without friction |
| [API.md](API.md) | Our backend's HTTP/SSE contract (see also Architecture & engineering above) |
| [phoenix-openapi.yaml](phoenix-openapi.yaml) | The Phoenix ERP API contract (OpenAPI) the backend consumes |
| [../.planning/intel/API-SURFACE.md](../.planning/intel/API-SURFACE.md) | Notes on the live ERP surface |
| [pitch/PITCH_DECK.md](pitch/PITCH_DECK.md) + [pitch/README.md](pitch/README.md) | The pitch deck (Marp source + rendered HTML) and how to render PDF/PPTX |

---

## The four things to remember

1. **The model cannot execute.** Its only shell tool is *propose*; execution is backend-only, after human approval and a second safety check. (See [SAFETY_POLICY.md](SAFETY_POLICY.md), [ARCHITECTURE.md](ARCHITECTURE.md).)
2. **Safety is deterministic code, tested — not a prompt.** Hard-fail commands are blocked before any approval card. (See [HARDENING.md](HARDENING.md), [RESULTS.md](RESULTS.md).)
3. **The activity report is the audit log.** Nothing is invented; every claim traces to a real command result. (See [AGENT_PIPELINE.md](AGENT_PIPELINE.md).)
4. **It generalises.** No incident is hardcoded; an evidence-first method handles fresh, unseen VMs. (See [AGENT_PIPELINE.md](AGENT_PIPELINE.md), [RELIABILITY.md](RELIABILITY.md).)

*55 of the 100 rubric points are B (troubleshooting) + C (safety & audit). The whole product is shaped around those two blocks.*
