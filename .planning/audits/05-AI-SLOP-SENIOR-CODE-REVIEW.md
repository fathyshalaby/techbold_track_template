# AI Slop / Senior Code Review

Owner: GPT-5 / Codex
Date: 2026-06-07
Mode: REPORT ONLY
Scope: Core source + frontend/runtime wiring

This report is audit-only. No source files were modified.

## Master Defect Map Traceability
The referenced file `.planning/audits/V1.1-MASTER-DEFECT-MAP.md` was not found in the workspace, so issues below are not yet linked to map IDs.

## Findings

### 1) High — Duplicate, disconnected frontend API/service layers on the main path
- **Path(s)**: `frontend/src/main.tsx:1-9`, `frontend/src/App.tsx:1-8`, `frontend/src/App.tsx:16-80`, `frontend/src/api.ts:1-120`, `frontend/src/hooks/useRun.ts:1-80`, `frontend/src/hooks/useRunEvents.ts:1-70`, `frontend/src/components/RunView.tsx:1-160`
- **Evidence**:
  - Entry point renders only `App.tsx` directly from `main.tsx`.
  - `App.tsx` defines and performs raw fetch calls inline (runs list, run creation, polling).
  - A parallel API module, hooks, and component flow exist but are not the active call path for the main app shell.
- **Why this harms team velocity**:
  - Creates two parallel implementations for one domain (`run` workflow).
  - Changes to backend contract force edits in multiple stacks, increases drift, and causes regressions that pass in one path and fail in another.
- **Smallest senior-style cleanup**:
  - Keep one bounded client layer (`api.ts`) and one `hooks/` consumption path.
  - Refactor `App.tsx` to consume shared hooks/services and delete or explicitly archive unused entry-level UI flow.

### 2) High — SSE contract is internally inconsistent between backend emission and frontend consumption
- **Path(s)**: `backend/src/events/sse.ts:32-45`, `backend/src/events/sse.ts:57-66`, `frontend/src/hooks/useRunEvents.ts:24-43`, `frontend/src/types.ts:1-140`
- **Evidence**:
  - Backend emits EventSource frames with plain JSON payloads, and event classification is placed inside payload content.
  - Frontend subscribes via `addEventListener(eventType, ...)`, expecting actual SSE event names.
  - Frontend type union expects richer event names than what is emitted.
- **Why this harms team velocity**:
  - Event-driven UI updates appear implemented but do not fire reliably in runtime; debugging becomes guesswork.
  - Hidden contract mismatch increases production incidents around real-time state.
- **Smallest senior-style cleanup**:
  - Decide one contract and enforce it end-to-end: either native SSE named events (preferred) and typed union update, or message-style payload routing with a single parser in the hook.
  - Add a lightweight contract test or compile-time check for event parsing.

### 3) Medium — Main entry component is over-commented and duplicates protocol/data definitions
- **Path(s)**: `frontend/src/App.tsx:1-20`, `frontend/src/App.tsx:24-79`, `frontend/src/App.tsx:80-170`
- **Evidence**:
  - App contains narrative section comments and verbose inline description blocks that describe flow already represented by code.
  - App also declares local fetch helpers and ad-hoc data shape assumptions while dedicated typed/shared modules exist.
- **Why this harms team velocity**:
  - Noise in control flow hinders quick parsing of production-critical branches.
  - Duplicate contract definitions cause stale comments and type shape mismatch during refactors.
- **Smallest senior-style cleanup**:
  - Replace high-density comments with clear identifiers and narrow helper names.
  - Centralize request logic in a shared `api.ts` client and keep App focused on render orchestration only.

### 4) Medium — Dead/unused component stack creates fake feature-completeness
- **Path(s)**: `frontend/src/components/RunView.tsx:1-200`, `frontend/src/components/ApprovalCard.tsx:1-120`, `frontend/src/components/ActivityView.tsx:1-160`, `frontend/src/components/ConnectionStatus.tsx:1-80`, `frontend/src/main.tsx:1-9`
- **Evidence**:
  - Main entrypoint (`main.tsx`) does not mount `components/RunView` and related modules.
  - `App.tsx` fully implements a separate run UI path.
- **Why this harms team velocity**:
  - Reviewers and contributors spend time understanding unused code paths; bug fixes and enhancements are applied to non-authoritative implementations.
  - Risk of shipping against the wrong behavioral surface.
- **Smallest senior-style cleanup**:
  - Make unused component stack explicit: either wire it into the main flow or move to a backlog folder with clear deprecation note.
  - Remove duplicate types/API dependencies from that subtree if unmounted.

### 5) Medium — Event type surface overstates behavior not currently produced/handled
- **Path(s)**: `frontend/src/types.ts:1-140`, `backend/src/events/sse.ts:1-90`, `frontend/src/hooks/useRunEvents.ts:1-70`
- **Evidence**:
  - Types list multiple event kinds (eg. thought summaries, command proposals, etc.) while backend currently emits simpler event metadata.
  - Consumers subscribe with rigid event listeners matching richer names.
- **Why this harms team velocity**:
  - False confidence in feature completeness; runtime missing cases appear as “UI never updates” rather than explicit contract failures.
- **Smallest senior-style cleanup**:
  - Align `RunEvent` union to the true emitted protocol first; expand only with backend emission and handler coverage in lock-step.

### 6) Low — Frontend imports and modules are structurally present but semantically split from app ownership
- **Path(s)**: `frontend/src/App.tsx:1-220`, `frontend/src/api.ts:1-120`, `frontend/src/components/*.tsx`, `frontend/src/main.tsx:1-9`
- **Evidence**:
  - There is clear scaffolding for two different app architectures without a shared ownership boundary.
  - App imports and runtime state management are coupled to one path; other modules look complete in isolation.
- **Why this harms team velocity**:
  - Onboarding cost increases because contributors cannot infer canonical pattern quickly.
  - Refactors become risky because it is unclear which abstraction stack is authoritative.
- **Smallest senior-style cleanup**:
  - Introduce explicit architecture boundary document in a single file comment block at entrypoint (one source of truth), then delete/park the unused branch.

## Non-findings
- No changes were made to source files, tests, or configs.
- Core backend orchestration and schema flow is mostly internally coherent and not the primary source of AI-slop symptoms identified.
