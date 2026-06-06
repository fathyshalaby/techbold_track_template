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
WORKDIR /app/backend
EXPOSE 8000
CMD ["pnpm", "tsx", "src/index.ts"]
