# Build deps with Bun, but inside the SAME Debian (bookworm) base the runtime
# uses. Building on oven/bun:1 (Debian trixie) links better-sqlite3 against a
# newer glibc (GLIBC_2.38) than node:22-slim (bookworm, glibc 2.36) provides, so
# the durable SQLite store fails to load at runtime. Bun cannot run better-sqlite3
# itself, so the runtime must be Node - hence build and run on matching glibc.
FROM node:22 AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g bun@1
# Bun reads the root workspaces list, so every declared workspace manifest must be
# present for `bun install` to resolve the graph, even when filtering to backend.
COPY package.json bun.lock ./
COPY apps/backend/package.json apps/backend/
COPY apps/dashboard/package.json apps/dashboard/
COPY packages/contracts/package.json packages/contracts/
RUN bun install --frozen-lockfile --filter techbold-track-backend

FROM node:22-slim
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Bun uses an isolated store (node_modules/.bun) plus per-package symlink trees.
# The backend's deps resolve only via these workspace symlinks, so copy them too -
# without this, `node` cannot find tsx/hono/better-sqlite3 at runtime.
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/package.json ./
# Shared base tsconfig referenced via "extends" by apps/backend/tsconfig.json.
COPY tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/backend/tsconfig.json apps/backend/
COPY apps/backend/src ./apps/backend/src
# Backend imports @techbold/contracts at runtime; the node_modules symlink resolves
# to this workspace source, so it must ship in the runtime image.
COPY packages/contracts ./packages/contracts
RUN mkdir -p /app/apps/backend/data && chown -R node:node /app
USER node
WORKDIR /app/apps/backend
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "src/index.ts"]
