# v1.1 Professional Skeleton Rescue

## Goal

Make the existing skeleton clean, connected, buildable, and team-ready.

This is not a feature milestone.
This is not enterprise hardening.
This is a professional rescue pass for the current project foundation.

## Source of Truth

Use these artifacts as primary input:

- AGENTS.md
- .planning/audits/V1.1-MASTER-DEFECT-MAP.md
- .planning/audits/00-MECHANICAL-SCAN.md
- .planning/audits/01-EMPTY-PLACEHOLDER-PHASE-LEFTOVERS.md
- .planning/audits/02-SKELETON-CONNECTIVITY.md
- .planning/audits/03-RUNTIME-PACKAGE-REALITY.md
- .planning/audits/04-PROFESSIONAL-TOOLING-BASELINE.md
- .planning/audits/05-AI-SLOP-SENIOR-CODE-REVIEW.md
- .planning/audits/06-CORE-VERTICAL-SLICE.md
- .planning/audits/07-TEST-USEFULNESS.md
- .planning/audits/08-SIMPLIFY-DELETE-BACKLOG.md
- .planning/codebase/
- .planning/graphs/

## Required Outcome

By the end of this milestone:

1. The project installs from a clean checkout.
2. The package manager and lockfile strategy are intentional.
3. The project has working dev, build, test, typecheck, lint, format, and quality commands where applicable.
4. The app, CLI, or main entrypoint starts without hidden manual steps.
5. The primary demo or user flow works end to end.
6. Empty tracked source files are finished, wired, deleted, simplified, or moved to backlog.
7. Placeholder and fake implementations on the core path are resolved.
8. Disconnected core files are wired or deleted.
9. Abandoned phase leftovers are removed or moved to backlog.
10. AI-slop code on the core path is cleaned.
11. Comments are minimal and useful.
12. README and development docs match reality.
13. The team can build new features on top without first repairing the skeleton.

## Non-goals

- No broad new product features.
- No enterprise security program.
- No full rewrite.
- No speculative architecture.
- No keeping fake modules because they might be useful later.
- No tests that only prove mocks or source text.
- No emojis.
- No em dash characters.

## Preferred Phase Shape

Phase 1:
Foundation gates: package manager, scripts, formatter, hooks, env example, README commands, and clean install baseline.

Phase 2:
Skeleton connectivity: resolve empty, placeholder, orphaned, missing, and disconnected core files.

Phase 3:
Primary vertical slice: make the main demo flow work end to end.

Phase 4:
Senior cleanup: remove AI-slop code, simplify overbuilt layers, improve names, types, boundaries, and error handling.

Phase 5:
Team handoff baseline: smoke tests, docs truth, contribution instructions, and backlog cleanup.

## Execution Rules

Every production change must trace back to .planning/audits/V1.1-MASTER-DEFECT-MAP.md.

For every broken file or module, choose exactly one decision:

- finish
- wire
- simplify
- delete
- backlog
- ignore/generated

Prefer the smallest connected fix.
Prefer deletion over fake completeness.
Prefer simple working code over clever abstractions.
