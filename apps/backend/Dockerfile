FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
RUN npm ci

FROM deps AS builder
COPY . .
ENV NX_DAEMON=false
RUN npx nx build backend --configuration=production --skip-nx-cache

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist/apps/backend/package.json ./package.json
COPY --from=builder /app/dist/apps/backend/package-lock.json ./package-lock.json
RUN npm ci --omit=dev
COPY --from=builder /app/dist/apps/backend/main.js ./main.js
COPY --from=builder /app/dist/apps/backend/assets ./assets
EXPOSE 3333
ENV PORT=3333
CMD ["node", "main.js"]
