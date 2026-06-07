# Retrospective

## Milestone: v1.0 — milestone

**Shipped:** 2026-06-07
**Phases:** 9
**Plans:** 35

### What Was Built

Service Desk Autopilot moved from starter template to a full mock-mode hackathon submission slice: Phoenix integration, safety/audit core, SSH execution, AI orchestration, run APIs, SSE, activity generation, frontend workflow, tests, README, and report.

### What Worked

- Backend-owned execution and safety kept the AI boundary clear.
- Mock mode let the vertical slice run without live credentials.
- TDD around safety, SSH, orchestrator, and routes caught regressions early.
- Append-only audit as a product feature simplified activity generation and scoring alignment.

### What Was Inefficient

- Planning state became stale in places; ROADMAP and REQUIREMENTS required reconciliation at the end.
- Several human-needed checks accumulated instead of being resolved immediately.
- The SDK milestone completion extracted noisy accomplishment one-liners, requiring manual cleanup.

### Patterns Established

- Root `pnpm test` is the canonical verification command.
- Verification should treat Vitest unhandled errors as failures even when assertions pass.
- Submission docs should state credential-bound validation limits honestly.

### Key Lessons

- Keep active requirements synchronized as phases complete, or the milestone audit becomes noisy.
- Live credential dependencies should be surfaced as first-class manual gates, not hidden in verification footnotes.
- For hackathon work, mock-mode confidence is useful but not a substitute for final browser and real-VM passes.

## Cross-Milestone Trends

No prior milestones.

