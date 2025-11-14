FROM node:24-slim AS base
WORKDIR /app

FROM base AS deps
# Install pnpm
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ENV NX_DAEMON=false
RUN pnpm nx build backend --configuration=production --skip-nx-cache

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install pnpm
RUN npm install -g pnpm
COPY --from=builder /app/dist/apps/backend/package.json ./package.json
COPY --from=builder /app/dist/apps/backend/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist/apps/backend/main.js ./main.js
COPY --from=builder /app/dist/apps/backend/assets ./assets
EXPOSE 3333
ENV PORT=3333
CMD ["node", "main.js"]
