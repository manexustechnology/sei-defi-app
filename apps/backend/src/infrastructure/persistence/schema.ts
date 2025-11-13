import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey(),
  assetPair: text('asset_pair').notNull(),
  side: text('side').notNull(),
  quantity: numeric('quantity', { precision: 20, scale: 8 }).notNull(),
  price: numeric('price', { precision: 20, scale: 8 }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export type OrderRecord = typeof ordersTable.$inferSelect;
export type InsertOrderRecord = typeof ordersTable.$inferInsert;

// Re-export pool schema
export * from './pool-schema';
