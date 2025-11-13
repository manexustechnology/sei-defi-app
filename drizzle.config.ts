import type { Config } from 'drizzle-kit';

export default {
  schema: './apps/backend/src/infrastructure/persistence/schema.ts',
  out: './apps/backend/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/sui_trade_history',
  },
} satisfies Config;

