FROM node:22-slim
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --config.minimum-release-age=0
COPY backend/src ./backend/src
# Pre-create the SQLite data dir owned by `node` so the named volume mounted there
# (docker-compose) inherits node ownership. Otherwise Docker creates the volume
# mountpoint as root, the non-root user can't write, and the store silently falls
# back to the in-memory adapter (losing the audit trail).
RUN mkdir -p /app/backend/data
# Run as the unprivileged built-in `node` user, not root (CIS Docker Benchmark 4.1).
# Install/build steps above ran as root; hand the tree to `node` for runtime.
RUN chown -R node:node /app
USER node
WORKDIR /app/backend
EXPOSE 8000
# Liveness probe via Node's built-in fetch (node:slim has no curl/wget).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "src/index.ts"]
