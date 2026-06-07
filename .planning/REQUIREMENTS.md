# Requirements: Service Desk Autopilot

**Defined:** 2026-06-07
**Core Value:** Win B+C on the scoring rubric: solve hidden Linux-service incidents on fresh VMs, safely and auditably.

## v1 Requirements

### Event Contract and Transport

- [ ] **EVNT-01**: Standardize backend SSE event names for run lifecycle state transitions.
- [ ] **EVNT-02**: Publish event payloads from a single shared contract used by backend and frontend.

### Frontend Wiring

- [ ] **FEIN-01**: Remove or migrate disconnected frontend app trees not mounted by `frontend/src/main.tsx`.
- [ ] **FEIN-02**: Ensure technician workflow rendering uses one runtime path with complete route handling.

### Tooling Baseline

- [ ] **TOOL-01**: Align package-manager assumptions and lockfile strategy across backend, frontend, and CI.
- [ ] **TOOL-02**: Normalize frontend Dockerfile and workspace build assumptions to the repository baseline.
- [ ] **TOOL-03**: Add and document monorepo scripts for install, lint, typecheck, test, and build.

### Store Behavior

- [ ] **STOR-01**: Make persistence mode explicit in startup configuration and runtime logs.
- [ ] **STOR-02**: Document and enforce fallback semantics when durable persistence is disabled.

## v2 Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Quality and Coverage

- **E2E-01**: Add deterministic vertical-slice coverage for run creation, SSE updates, approval edit/execute, and activity flow.
- **PLAN-01**: Remove stale planning artifacts and regenerate evidence-only docs after milestone close.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full RAG/knowledge graph | Outside this v1.1 skeleton rescue scope and requires data pipeline work |
| OAuth/social authentication flows | Not required for scoring path and adds extra identity complexity |
| Native desktop or mobile clients | Scope remains web-first technician demo and fix workflow |
| Generic system-administration command catalog beyond this incident domain | Product focus is incident repair sequence, not admin tooling |

## Traceability

Which phases cover which requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EVNT-01 | Phase 1 | Pending |
| EVNT-02 | Phase 1 | Pending |
| FEIN-01 | Phase 2 | Pending |
| FEIN-02 | Phase 2 | Pending |
| TOOL-01 | Phase 3 | Pending |
| TOOL-02 | Phase 3 | Pending |
| TOOL-03 | Phase 3 | Pending |
| STOR-01 | Phase 4 | Pending |
| STOR-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after v1.1 requirements draft*
