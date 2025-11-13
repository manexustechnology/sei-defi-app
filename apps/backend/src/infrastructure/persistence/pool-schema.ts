import { decimal, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Liquidity pools table - stores pool information from DragonSwap and Sailor Finance
 */
export const poolsTable = pgTable('liquidity_pools', {
  id: uuid('id').primaryKey().defaultRandom(),
  poolAddress: text('pool_address').notNull().unique(),
  dex: text('dex').notNull(), // 'dragonswap' | 'sailor'
  token0: text('token0').notNull(),
  token1: text('token1').notNull(),
  token0Symbol: text('token0_symbol'),
  token1Symbol: text('token1_symbol'),
  feeTier: text('fee_tier'),
  tvl: decimal('tvl', { precision: 30, scale: 8 }),
  volume24h: decimal('volume_24h', { precision: 30, scale: 8 }),
  apr: decimal('apr', { precision: 10, scale: 2 }),
  metadata: jsonb('metadata'), // Store additional pool info
  isActive: text('is_active').notNull().default('true'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  dexIdx: index('pools_dex_idx').on(table.dex),
  addressIdx: index('pools_address_idx').on(table.poolAddress),
}));

/**
 * Pool historical data table - stores time-series data for pools
 */
export const poolHistoryTable = pgTable('pool_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  poolId: uuid('pool_id').notNull().references(() => poolsTable.id, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  reserve0: decimal('reserve0', { precision: 30, scale: 8 }).notNull(),
  reserve1: decimal('reserve1', { precision: 30, scale: 8 }).notNull(),
  tvl: decimal('tvl', { precision: 30, scale: 8 }),
  volume: decimal('volume', { precision: 30, scale: 8 }),
  price: decimal('price', { precision: 30, scale: 8 }), // token0/token1 price
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  poolTimestampIdx: index('pool_history_pool_timestamp_idx').on(table.poolId, table.timestamp),
  timestampIdx: index('pool_history_timestamp_idx').on(table.timestamp),
}));

export type PoolRecord = typeof poolsTable.$inferSelect;
export type InsertPoolRecord = typeof poolsTable.$inferInsert;
export type PoolHistoryRecord = typeof poolHistoryTable.$inferSelect;
export type InsertPoolHistoryRecord = typeof poolHistoryTable.$inferInsert;

