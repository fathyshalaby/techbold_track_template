# Roadmap: Service Desk Autopilot

## Milestones

- [x] **v1.0 milestone** - Service Desk Autopilot hackathon submission slice (shipped 2026-06-07)
- [x] **v1.1 Professional Skeleton Rescue** - skeleton rescue and buildability (completed 2026-06-07)
- [ ] **v1.2 Professional Skeleton Rescue Follow-up** - live validation, vertical-slice evidence, and submission handoff readiness

## Active Milestone: v1.2

Phase numbering is reset for this milestone.

- [x] **Phase 1: Fresh-Clone Runtime Validation** - completed 2026-06-07
- [x] **Phase 2: Browser SSE UAT** - completed 2026-06-07
- [x] **Phase 3: Vertical-Slice Coverage** - completed 2026-06-07
- [ ] **Phase 4: Real Integration Validation**
- [ ] **Phase 5: Submission and Evidence Handoff**

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 01 | Fresh-Clone Runtime Validation | Prove the skeleton installs and starts from a clean checkout. | LIVE-01, LIVE-02 | Complete |
| 02 | Browser SSE UAT | Prove the mounted frontend reflects the primary technician flow and SSE lifecycle. | UAT-01, UAT-02 | Complete |
| 03 | Vertical-Slice Coverage | Add deterministic coverage for the run, approval, SSE, and activity path. | E2E-01, PLAN-01 | Complete |
| 04 | Real Integration Validation | Validate or precisely block Phoenix, SSH, and LLM live paths. | REAL-01, REAL-02, REAL-03 | 5 |
| 05 | Submission and Evidence Handoff | Package demo/submission evidence and clean planning docs. | SUBM-01, PLAN-02 | 4 |

## Phase Details

### Phase 1: Fresh-Clone Runtime Validation

Goal: Prove the skeleton installs and starts from a clean checkout.

Requirements: LIVE-01, LIVE-02

Success criteria:
1. Fresh clone or clean worktree setup uses documented root commands without undocumented package-manager switches.
2. `docker compose up --build` either succeeds or records exact environment blockers with reproduction details.
3. Backend and frontend startup output matches documented environment and persistence assumptions.
4. README or infrastructure docs are corrected only where validation proves drift.

Plans:
- [x] 01-01-PLAN.md - Fresh-clone runtime validation

### Phase 2: Browser SSE UAT

Goal: Prove the mounted frontend reflects the primary technician flow and SSE lifecycle.

Requirements: UAT-01, UAT-02

Success criteria:
1. Browser UAT starts from the mounted frontend entry path and exercises ticket, run, approval, audit, and activity states.
2. SSE lifecycle updates appear in the UI without manual refresh.
3. Any failed browser step records whether the blocker is frontend, backend, test data, environment, or credential related.
4. UAT evidence is stored in planning artifacts without claiming unverified live behavior.

Plans:
- [x] 02-01-PLAN.md - Browser SSE UAT

### Phase 3: Vertical-Slice Coverage

Goal: Add deterministic coverage for the run, approval, SSE, and activity path.

Requirements: E2E-01, PLAN-01

Success criteria:
1. A deterministic test covers run creation, SSE update consumption, approval edit/execute, and activity flow.
2. The test verifies behavior rather than only checking mocks, source text, or handler existence.
3. Production changes made for testability trace to `.planning/audits/V1.1-MASTER-DEFECT-MAP.md`.
4. Root verification commands include the new coverage or clearly document the separate command.

Plans:
- [x] 03-01-PLAN.md - Vertical-slice coverage

### Phase 4: Real Integration Validation

Goal: Validate or precisely block Phoenix, SSH, and LLM live paths.

Requirements: REAL-01, REAL-02, REAL-03

Success criteria:
1. Phoenix API validation succeeds with real credentials or records the exact missing input, command, and failure mode.
2. SSH `.pem` validation against a practice VM succeeds or records the exact missing input, command, and failure mode.
3. Passwordless `sudo -n true` is confirmed for `azureuser` or recorded as a blocker.
4. Real LLM orchestrator loop validation succeeds or records the exact missing input, command, and failure mode.
5. Mock-mode behavior remains available and clearly separated from live-validation claims.

Plans:
- [ ] 04-01-PLAN.md - Real integration validation

### Phase 5: Submission and Evidence Handoff

Goal: Package demo/submission evidence and clean planning docs.

Requirements: SUBM-01, PLAN-02

Success criteria:
1. Demo-video checklist is grounded in verified behavior and explicit blockers.
2. External submission handoff notes include current setup, validation evidence, and accepted limitations.
3. Planning/docs artifacts distinguish completed evidence, deferred work, and blocked manual validation.
4. No stale active requirement or roadmap entry claims work that remains deferred or blocked.

Plans:
- [ ] 05-01-PLAN.md - Submission and evidence handoff

## Traceability Update Rule

After each phase, update `.planning/REQUIREMENTS.md` traceability statuses.

- v1.2 requirements mapped: 11/11
- Unmapped: 0

---
*Roadmap created for v1.2 on 2026-06-07*
