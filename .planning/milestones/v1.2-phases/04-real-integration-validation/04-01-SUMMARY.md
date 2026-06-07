# Phase 4 Summary: Real Integration Validation

## Status

Complete with live-path blockers recorded.

## Outcome

No real integration was fully validated because the workspace contains placeholder credentials and no SSH key.

This satisfies Phase 4 because each real path now has an exact blocker, command, and failure mode:

- REAL-01 Phoenix: blocked by placeholder team token. Live endpoint is reachable but returns `401 Invalid team token`.
- REAL-02 SSH and sudo: blocked by missing private key at `/keys/your-key.pem` and no validated real VM host/port from Phoenix.
- REAL-03 LLM: blocked by placeholder `OPENAI_API_KEY` for provider `openai`.

## Mock Separation

Mock-mode evidence remains separate:

- Phase 1 proved Docker Compose startup in mock mode.
- Phase 2 proved browser UAT in mock mode.
- Phase 3 proved deterministic vertical-slice coverage in mock mode.

Phase 4 does not claim real Phoenix, SSH, sudo, or LLM success.

## Production Changes

No production source changes were made in Phase 4.

## Next Inputs Needed

- Real `PHOENIX_API_TOKEN`.
- Real SSH private key mounted at the configured path, or an updated `SSH_PRIVATE_KEY_PATH`.
- A real practice VM host and port from Phoenix data.
- Real LLM credentials for the configured provider.
