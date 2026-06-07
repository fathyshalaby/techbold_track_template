---
status: complete
---

# 01-01 Fresh-Clone Runtime Validation Summary

## Completed

- Created a temporary local clone at `/tmp/techbold-v12-phase1-clone`.
- Copied `.env.example` to `.env` in the clone.
- Ran `docker compose up --build` and reproduced a backend startup failure.
- Fixed `backend/Dockerfile` so the backend container starts with Node directly instead of invoking pnpm at runtime.
- Removed the misleading container-only `.env` warning by relying on Compose `env_file` for Docker startup.
- Reran the clean-clone Docker Compose path from commit `5c7c946`.

## Source Changes

- `backend/Dockerfile`: changed backend runtime command from `pnpm tsx src/index.ts` to `node --import tsx src/index.ts`.
- `backend/Dockerfile`: adjusted touched comment punctuation to stay ASCII-only.

## Evidence

- `docker compose version`: Docker Compose v5.0.2.
- Initial failure: backend exited with `[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY]` while pnpm tried to run `install` at container startup.
- Fixed clone commit: `5c7c946`.
- `curl -fsS http://localhost:8000/health`: `{"status":"ok","mode":"mock","store":{"mode":"sqlite","durable":true}}`.
- `curl -fsS http://localhost:5173`: returned Vite HTML.
- `docker inspect` backend health status: `healthy`.
- Final logs: backend `Backend listening on :8000` and `Store mode: sqlite (durable)`; frontend Vite ready on `http://localhost:5173/`.

## Notes

- The Docker path now validates from a clean local clone with `.env.example` copied to `.env`.
- No README or infrastructure documentation changes were needed after the Dockerfile fix; the documented setup path matches observed behavior.
