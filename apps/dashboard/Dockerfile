FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/dashboard/package.json apps/dashboard/
RUN bun install --frozen-lockfile --filter techbold-track-dashboard

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=deps /app/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY package.json bun.lock tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY apps/dashboard ./apps/dashboard
RUN bun run --filter techbold-track-dashboard build

FROM oven/bun:1
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/contracts ./packages/contracts
COPY --from=builder /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=builder /app/apps/dashboard ./apps/dashboard
COPY --from=builder /app/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY package.json bun.lock tsconfig.base.json ./
WORKDIR /app/apps/dashboard
EXPOSE 3000
CMD ["bun", "run", "start"]
