# Phase 4 Context: Real Integration Validation

## Objective

Validate Phoenix, SSH, sudo, and real LLM paths, or record exact blockers where credentials or VM details are unavailable.

## Requirement Mapping

- REAL-01: validate Phoenix API access with real credentials or record the exact blocker.
- REAL-02: validate SSH `.pem` access and passwordless `sudo -n true` against a practice VM or record the exact blocker.
- REAL-03: validate the real LLM orchestrator loop or record the exact blocker.

## Starting Evidence

- Phase 1 proved clean-clone Docker Compose startup in mock mode.
- Phase 2 proved browser UAT in mock mode.
- Phase 3 proved deterministic vertical-slice coverage in mock mode.
- `.env` currently matches `.env.example` and contains placeholder credentials.

## Validation Boundaries

- Do not add product features.
- Do not print secrets.
- Do not mutate remote systems except for explicitly requested validation commands.
- Use read-only Phoenix and SSH probes where possible.
- If real credentials are absent, record the exact missing input and command that would validate it.

## Expected Checks

1. Phoenix:
   - Confirm whether `PHOENIX_API_TOKEN` is non-placeholder.
   - Probe `/api/v1/me` if a real token exists.
   - Record placeholder-token blocker if not.
2. SSH:
   - Confirm whether `SSH_PRIVATE_KEY_PATH` exists on disk.
   - Confirm whether a target VM host/port is available from real Phoenix data.
   - Run `ssh -i <key> -o BatchMode=yes azureuser@<host> true` only if host and key exist.
3. Sudo:
   - Run `ssh ... 'sudo -n true'` only after SSH succeeds.
4. LLM:
   - Confirm whether provider credentials are non-placeholder.
   - Run a minimal real model call only if credentials exist.
   - Otherwise record the exact missing credential.

## Acceptance

- REAL-01, REAL-02, and REAL-03 are marked complete when each is either validated or precisely blocked.
- Mock-mode evidence remains clearly separated from live integration claims.
