# Phase 3: Safety Layer + Run Store - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the deterministic safety layer (`backend/src/safety/`) and the durable run store (`backend/src/store/`) — the two foundations that must exist before any SSH command can execute. The safety layer classifies every command (blocklist → risk level), redacts every string before it leaves the trust boundary, and re-validates edited commands at approval time. The run store persists runs, approvals, command results, observations, and activity drafts in an append-only audit log (SQLite with JSONL fallback). No SSH execution, no HTTP routes, no agents — those are later phases. This phase is the rubric-C (safety & audit, 20 pts) core: the guardrails and audit trail the judges inspect directly.

Governed verbatim by `docs/SAFETY_POLICY.md` (rules, blocklist, risk levels, redaction, audit record) and `docs/ARCHITECTURE.md` §6 (data model) — both LOCKED source of truth.
</domain>

<decisions>
## Implementation Decisions

### Classifier & Blocklist Implementation
- Normalize before matching: collapse whitespace, strip obfuscation quotes, conservatively resolve `$()`/backtick wrappers — if a wrapper cannot be safely resolved, BLOCK it (SAFETY_POLICY §3).
- Blocklist is an array of labeled regex patterns (pattern + rule name + reason) so the audit log records WHICH rule blocked a command — judges inspect this directly.
- Deterministic precedence: blocklist (HIGH_RISK_BLOCKED) → medium-risk patterns → low-risk/change patterns → default. LLM second opinion may only RAISE a level, never lower a deterministic verdict.
- Unrecognized commands default to `MEDIUM_RISK_CHANGE` (explicit approval + UI warning), never silently `SAFE_READ_ONLY`.

### Redaction
- Implement the full SAFETY_POLICY §6 pattern set: `BEGIN … PRIVATE KEY` blocks, `password=`, `passwd`, `token=`, `secret=`, `api[_-]?key=`, `Authorization:` header values, bearer tokens, DB connection strings (`postgres://user:pass@…`), AWS/Azure-style keys, and secret-looking `KEY=VALUE` pairs.
- Replacement preserves context: `token=«redacted»` (keep the key name, mask only the value).
- Cap each stream at 16 KB before redaction to bound cost (SAFETY_POLICY §6).
- Redaction is a pure function invoked at every boundary — audit write, UI return, and model feed — a single chokepoint reused everywhere.

### Store & Persistence
- `better-sqlite3` (synchronous, per ARCHITECTURE.md) with the exact 6-table schema from ARCHITECTURE §6: `runs`, `audit_events`, `command_approvals`, `command_results`, `observations`, `activity_drafts`.
- JSONL fallback activates when better-sqlite3 fails to load/init (e.g. native build failure) — detect at init, log the active mode once.
- Append-only enforced by API absence: the store exposes no delete/update path for `audit_events` — enforced structurally, not by convention or soft-delete column.
- IDs are ULIDs with typed prefixes (`run_`, `ev_`, `appr_`) per the data model.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/safety/risk-levels.ts` — `RiskLevel` enum already defined (`SAFE_READ_ONLY | LOW_RISK_CHANGE | MEDIUM_RISK_CHANGE | HIGH_RISK_BLOCKED`). Build on it; do not redefine.
- `backend/src/env.ts` — `getEnv()`, `resolveClientMode()`, `isMockMode()` established in Phase 1. Lazy env parse pattern (no top-level side effects) — reuse for any store config.
- Phase 2 established the testing pattern: Vitest, `npm test`, TDD RED→GREEN, `.strict()` Zod at trust boundaries, `.js` ESM import suffixes.

### Established Patterns
- All shapes validated with Zod; inferred TS types exported alongside schemas.
- Pure functions for boundary logic (mirrors Phase 2's typed-error mapping); safety layer must stay dependency-free (no imports from routes/ or ai/).
- Tests live in `backend/src/tests/`; `safety.test.ts` and `orchestrator.test.ts` exist as empty stubs to fill.

### Integration Points
- Safety layer is consumed by the orchestrator (Phase 5) and approvals route (Phase 6) — keep the public API small: `validateCommandAgainstPolicy(command)`, `classifyCommand(command)`, `redactSecrets(string)`.
- Store is consumed by the orchestrator and route handlers — expose run lifecycle CRUD + append-only audit writes + typed row reads.
- `command_approvals.risk_level` and `audit_events.type` mirror enums/SSE event types defined elsewhere; keep string values aligned with ARCHITECTURE.
</code_context>

<specifics>
## Specific Ideas

- `safety.test.ts` must cover: every blocklist pattern → `HIGH_RISK_BLOCKED`; obfuscation variants (extra spaces, quotes, `chmod -R 777 ${HOME}`) → blocked or block-if-unresolvable; targeted variants (`chown azureuser /srv/app/uploads`) → LOW/MEDIUM not blocked; edited-safe-then-dangerous → blocked at approval; redaction strips keys/tokens/passwords/connection-strings while keeping context; allowlist reads → `SAFE_READ_ONLY`.
- The `audit_events` table value for `type` equals the SSE event type (forward-compatible with Phase 6); `actor` is one of `system | technician | agent | phoenix | ssh`.
- API-04 (run store persists runs/approvals/results/observations/activity drafts, JSONL fallback) is satisfied here even though the HTTP run routes arrive in Phase 6.
</specifics>

<deferred>
## Deferred Ideas

- SSH execution enforcement (non-interactive, timeout, output cap) — Phase 4 (`ssh/executor.ts`).
- Approval route wiring (422 + BLOCKED audit on dangerous edit over HTTP) — Phase 6; this phase provides the deterministic re-validation function the route will call.
- LLM safety second-opinion (BOOST-03) — v2; the deterministic layer is the guarantee.
</deferred>
