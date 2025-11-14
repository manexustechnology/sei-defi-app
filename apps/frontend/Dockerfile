FROM node:24-slim AS base
WORKDIR /app

FROM base AS deps
# Install pnpm and build dependencies
RUN npm install -g pnpm
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false
RUN pnpm nx build frontend --configuration=production --skip-nx-cache

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/frontend/server.js"]
