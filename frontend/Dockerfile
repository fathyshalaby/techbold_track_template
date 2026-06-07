FROM node:22-slim
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
COPY package.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --config.minimum-release-age=0
COPY frontend ./frontend
WORKDIR /app/frontend
EXPOSE 5173
CMD ["pnpm", "dev"]
