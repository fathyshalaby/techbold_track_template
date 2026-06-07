# Agent Instructions

This project is in v1.1 Professional Skeleton Rescue mode.

Goal:
Make the existing skeleton clean, connected, buildable, and ready for the team to build on.

Non-goals:
- Do not add new product features unless required to make the primary skeleton flow work.
- Do not perform enterprise hardening.
- Do not rewrite the whole project.
- Do not keep fake, empty, placeholder, or disconnected files just because they exist.

Coding rules:
- Prefer simple working code over clever abstractions.
- Every core file must be used, exported intentionally, or deleted.
- Every placeholder must be finished, wired, simplified, deleted, or moved to backlog.
- Comments should be rare and useful.
- No broad comments explaining obvious code.
- No commented-out code.
- No TODO without a matching backlog item.
- No generated-by-AI style text.
- No emojis.
- No em dash characters.
- No fake tests, pass-always tests, source-grep tests, or tests that only prove mocks work.
- No empty tracked source files.
- No unused package kept without a documented reason.
- No duplicate service layers for the same concept.
- No silent catch blocks.
- No broad any types unless isolated at an external boundary.
- No UI element on the main path without a handler.
- No handler on the main path without a real effect.
- No endpoint on the main path without a caller or documented external consumer.

Style target:
Senior AI/ML Software Engineer style.
Use direct names, small functions, typed boundaries, explicit error handling, deterministic setup, clean scripts, and truthful docs.

Workflow:
Audit first.
Create report-only findings first.
Then fix in small GSD phases.
Every production change must trace back to .planning/audits/V1.1-MASTER-DEFECT-MAP.md.
