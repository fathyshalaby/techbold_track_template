FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/contracts/package.json packages/contracts/
COPY apps/dashboard/package.json apps/dashboard/
RUN bun install --frozen-lockfile --filter techbold-track-dashboard

FROM oven/bun:1 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Next inlines NEXT_PUBLIC_* into the client bundle at BUILD time, so the
# browser's API base must be fixed here (the runtime env on the service only
# reaches server-rendered code). Defaults to the host-mapped backend port.
ARG NEXT_PUBLIC_API_BASE=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=deps /app/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY package.json bun.lock tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY apps/dashboard ./apps/dashboard
RUN bun run --filter techbold-track-dashboard build

# Minimal runtime from Next standalone output. The standalone bundle already
# contains the server, the traced node_modules, and the bundled @techbold/contracts
# code, so no workspace install is needed at runtime - hence a plain Node slim image.
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/dashboard/server.js"]
