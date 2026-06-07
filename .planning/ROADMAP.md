# Roadmap: Service Desk Autopilot

## Milestones

- [x] **v1.0 milestone** — Service Desk Autopilot hackathon submission slice (shipped 2026-06-07)
- [ ] **v1.1 Professional Skeleton Rescue** — skeleton rescue and buildability (in planning)

## Planned Milestone: v1.1

| # | Phase | Goal | Requirements | Success criteria |
|---|-------|------|--------------|------------------|
| 01 | Event Contract Repair | Lock and verify SSE/event transport between backend and frontend | EVNT-01, EVNT-02 | 3 |
| 02 | Frontend Surface Consolidation | Remove duplicate runtime surfaces and centralize flow rendering | FEIN-01, FEIN-02 | 3 |
| 03 | Tooling Baseline Alignment | Make backend/frontend/container/CI package and script strategy deterministic | TOOL-01, TOOL-02, TOOL-03 | 4 |
| 04 | Store Mode Clarity | Clarify and enforce persistent store behavior under runtime fallback and startup | STOR-01, STOR-02 | 3 |

## Phase Details

### Phase 1: Event Contract Repair

Goal: Normalize event contracts so run state updates are timely and consistent.

Requirements: EVNT-01, EVNT-02

Success criteria:
1. Backend and frontend share one event-name contract definition.
2. SSE uses event names as transport channels with stable payload shape.
3. Approval and activity transitions update frontend state without manual refresh.
4. A minimal contract smoke test verifies one full run transition path.

### Phase 2: Frontend Surface Consolidation

Goal: Ensure only one runtime frontend flow is active and complete.

Requirements: FEIN-01, FEIN-02

Success criteria:
1. `frontend/src/main.tsx` renders the intended production App path.
2. Non-runtimes surfaces are deleted or moved behind a deliberate migration plan.
3. Critical user journey paths render from the mounted tree in clean local runs.

### Phase 3: Tooling Baseline Alignment

Goal: Remove toolchain drift and lock the repo to a single deterministic build strategy.

Requirements: TOOL-01, TOOL-02, TOOL-03

Success criteria:
1. One package manager policy applies to backend and frontend checks.
2. Frontend Docker and lockfile path align with root/backend conventions.
3. CI includes frontend typecheck and build checks with same baseline commands as local docs.
4. Monorepo scripts document a single install/lint/typecheck/test/build flow.

### Phase 4: Store Mode Clarity

Goal: Make runtime persistence mode explicit and auditable.

Requirements: STOR-01, STOR-02

Success criteria:
1. Startup configuration states active store mode and reason when fallback is active.
2. Runtime behavior differs clearly between durable and fallback modes and is documented.
3. Logs include clear warnings when non-persistent behavior is active.

## Traceability Update Rule

After each phase, update `.planning/REQUIREMENTS.md` traceability statuses.

- v1 requirements mapped: 9/9
- Unmapped: 0

---
*Roadmap reset with phase numbering to start at 1 for v1.1*
