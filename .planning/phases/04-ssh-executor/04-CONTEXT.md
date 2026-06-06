# Phase 4: SSH Executor - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

The backend can execute a single approved command on a remote VM safely — fresh connection, non-interactive single exec, connect+command timeout, output cap, captured exit code and duration — and a scripted SSH mock drives the full agent loop offline without a real VM. A per-run preflight confirms `sudo -n true`, `LANG=C`, and PATH via `bash -lc` before any command runs.

This phase delivers `ssh/client.ts`, `ssh/executor.ts`, `ssh/mock.ts`, `ssh/types.ts`. It does NOT include the orchestrator wiring, approval routes, or agent loop (Phases 5–6). The executor is backend-only code, never registered as a model tool (ARCHITECTURE §A1).
</domain>

<decisions>
## Implementation Decisions

### Connection & Execution Model
- Fresh connect per command, close after execution — stateless, matches the one-approval-one-execution gate
- `conn.exec(cmd)` single non-interactive exec, no PTY — prevents interactive hangs
- Wrap commands as `bash -lc '<cmd>'` with `LANG=C` so PATH and locale are deterministic (Success Criterion #4)
- One in-flight command per run (serial) — the orchestrator already gates sequencing

### Timeouts, Output Caps & Result Shape
- Connect timeout: 10s
- Command timeout: 30s default; kill the channel on overrun and mark `timedOut: true` (Success Criterion #2)
- Output cap: 16 KB per stream (stdout and stderr each), reusing `REDACTION_CAP_BYTES` (Success Criterion #2)
- Result shape: `{ exitCode, stdout, stderr, durationMs, timedOut }` per ARCHITECTURE §3
- Executor returns RAW output; the CALLER applies `redactSecrets` before audit/UI/model (matches data-flow §3 lines 157–161)

### Mock SSH Design
- Exact-command → scripted result map, with a sensible default fallback result for unmatched commands
- In-code default fixtures covering the practice loop (uname, systemctl, ports, configs)
- Mock exposes an identical `executeApprovedCommand` signature and result shape as the real executor
- Mock preflight always returns success (sudo-n ok, LANG=C, PATH present)

### Preflight & Error Handling
- Run preflight once per run before the first command; cache the result (Success Criterion #4)
- Preflight checks: `sudo -n true` (passwordless sudo), force/confirm `LANG=C`, `bash -lc 'echo $PATH'`
- `sudo -n` failure is NON-FATAL — record a capability flag and surface "sudo unavailable" so the agent can ask (Safety Policy G7), never hang on a password prompt
- Connect/auth failure throws a typed SSH connection error, audited, surfaced as a clean run error — never retried blindly
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/safety/redaction.ts` — `redactSecrets()` and `REDACTION_CAP_BYTES` (16384). Caller applies redaction to executor output; the 16 KB constant doubles as the output cap.
- `backend/src/env.ts` — `resolveClientMode('ssh')` returns `'mock' | 'real'`; `SSH_PRIVATE_KEY_PATH` (default `/keys/your-key.pem`) and `SSH_USERNAME` (default `azureuser`) are already parsed and validated.
- `ssh2` ^1.16.0 and `@types/ssh2` are already in package.json dependencies.
- Existing stub files at `backend/src/ssh/{client,executor,mock,types}.ts` are empty `export {}` placeholders to be filled.

### Established Patterns
- Pure functions with explicit input/output types; Zod schemas for boundary validation (see `env.ts`, `redaction.ts`).
- Mock-vs-real selection via `resolveClientMode(service)` from `env.ts` — mocks mirror the real interface exactly (see `phoenix/mock.ts` precedent).
- Error messages never contain secret values, only key names (see `parseEnv`).
- Tests live in `backend/src/tests/*.test.ts` (vitest), one file per concern.

### Integration Points
- The approvals route / orchestrator (Phase 6) will call `executeApprovedCommand`, then pass result through `redactSecrets` before audit/SSE/UI (data flow §3).
- `store/audit.ts` records `command_result` + `observation` events with redacted output.
- `events/run-event-bus.ts` emits `command.completed` after execution.
</code_context>

<specifics>
## Specific Ideas

- Result shape is fixed by ARCHITECTURE §3 line 157: `{ exitCode, stdout, stderr, durationMs, timedOut }`.
- Preflight must use `sudo -n` (non-interactive) and never hang on a password prompt — explicit Safety Policy requirement (G7, line 169–171).
- Mock must be capable of driving the FULL agent loop offline (Success Criterion #3), so fixtures should cover a realistic diagnose→fix→validate sequence, not just `uname -a`.
</specifics>

<deferred>
## Deferred Ideas

- HCR-04 (SSH executor hardening + broader tool preflight beyond sudo/LANG/PATH) — v2, tracked in REQUIREMENTS.
- Connection pooling / persistent sessions — explicitly rejected for v1 in favor of stateless fresh-connect.
- Configurable mock preflight failure path — deferred; mock preflight always succeeds for v1.
</deferred>
