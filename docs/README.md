# Documentation: Service Desk Autopilot

This is the documentation map for the current skeleton. Start with the documents below, depending on what you need to do.

## First Reads

| Reader | Start here |
|---|---|
| Judge or reviewer | [SUBMISSION_HANDOFF.md](SUBMISSION_HANDOFF.md), [RESULTS.md](RESULTS.md), [LIMITATIONS.md](LIMITATIONS.md) |
| Developer | [../README.md](../README.md), [ARCHITECTURE.md](ARCHITECTURE.md), [API.md](API.md) |
| Operator | [INFRASTRUCTURE.md](INFRASTRUCTURE.md), [SAFETY_POLICY.md](SAFETY_POLICY.md), [SUBMISSION_HANDOFF.md](SUBMISSION_HANDOFF.md) |
| Planner | [../.planning/ROADMAP.md](../.planning/ROADMAP.md), [../.planning/STATE.md](../.planning/STATE.md), [../.planning/REQUIREMENTS.md](../.planning/REQUIREMENTS.md) |

## Current Status

| Doc | Purpose |
|---|---|
| [RESULTS.md](RESULTS.md) | Verified behavior, test evidence, mock-mode status, and real integration blockers. |
| [LIMITATIONS.md](LIMITATIONS.md) | Scope limits, external blockers, safety boundaries, and fallback paths. |
| [SUBMISSION_HANDOFF.md](SUBMISSION_HANDOFF.md) | Demo checklist, evidence links, accepted limitations, and real-validation inputs needed. |

## Product and Requirements

| Doc | Purpose |
|---|---|
| [PRD.md](PRD.md) | Product intent, scope, success criteria, and differentiators. |
| [scoring.md](scoring.md) | The 100-point rubric and hard-fail rules. |
| [GLOSSARY.md](GLOSSARY.md) | Domain and rubric vocabulary. |

## Engineering

| Doc | Purpose |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, state machine, data model, request flow, and module boundaries. |
| [API.md](API.md) | Backend HTTP and SSE contract. |
| [DATA_MODEL.md](DATA_MODEL.md) | Persisted schema and append-only audit model. |
| [INFRASTRUCTURE.md](INFRASTRUCTURE.md) | Docker, ports, env, mock mode, storage, and secrets. |
| [IMPLEMENTATION_PROCEDURE.md](IMPLEMENTATION_PROCEDURE.md) | Historical build procedure. Use current README and planning state for exact status. |

## AI, Safety, and Reliability

| Doc | Purpose |
|---|---|
| [AGENT_PIPELINE.md](AGENT_PIPELINE.md) | Troubleshooting loop and role behavior. |
| [RELIABILITY.md](RELIABILITY.md) | Agent failure modes and mitigations. |
| [SAFETY_POLICY.md](SAFETY_POLICY.md) | Deterministic command gate and risk classification. |
| [SECURITY.md](SECURITY.md) | Threat model and secret handling. |
| [HARDENING.md](HARDENING.md) | Guard and test philosophy. |

## Planning Evidence

| Artifact | Purpose |
|---|---|
| [../.planning/phases/01-fresh-clone-runtime-validation/01-VERIFICATION.md](../.planning/phases/01-fresh-clone-runtime-validation/01-VERIFICATION.md) | Fresh-clone Docker Compose evidence. |
| [../.planning/phases/02-browser-sse-uat/02-VERIFICATION.md](../.planning/phases/02-browser-sse-uat/02-VERIFICATION.md) | Browser UAT and SSE evidence. |
| [../.planning/phases/03-vertical-slice-coverage/03-VERIFICATION.md](../.planning/phases/03-vertical-slice-coverage/03-VERIFICATION.md) | Deterministic vertical-slice test evidence. |
| [../.planning/phases/04-real-integration-validation/04-VERIFICATION.md](../.planning/phases/04-real-integration-validation/04-VERIFICATION.md) | Real integration blocker evidence. |

## Pitch Materials

| Doc | Purpose |
|---|---|
| [pitch/PITCH_DECK.md](pitch/PITCH_DECK.md) | Pitch deck source. |
| [pitch/PITCH_DECK.html](pitch/PITCH_DECK.html) | Rendered pitch deck. |
| [pitch/README.md](pitch/README.md) | Pitch rendering notes. |
