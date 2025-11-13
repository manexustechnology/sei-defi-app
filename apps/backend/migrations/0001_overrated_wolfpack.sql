CREATE TABLE "pool_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"reserve0" numeric(30, 8) NOT NULL,
	"reserve1" numeric(30, 8) NOT NULL,
	"tvl" numeric(30, 8),
	"volume" numeric(30, 8),
	"price" numeric(30, 8),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liquidity_pools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_address" text NOT NULL,
	"dex" text NOT NULL,
	"token0" text NOT NULL,
	"token1" text NOT NULL,
	"token0_symbol" text,
	"token1_symbol" text,
	"fee_tier" text,
	"tvl" numeric(30, 8),
	"volume_24h" numeric(30, 8),
	"apr" numeric(10, 2),
	"metadata" jsonb,
	"is_active" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "liquidity_pools_pool_address_unique" UNIQUE("pool_address")
);
--> statement-breakpoint
ALTER TABLE "pool_history" ADD CONSTRAINT "pool_history_pool_id_liquidity_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."liquidity_pools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pool_history_pool_timestamp_idx" ON "pool_history" USING btree ("pool_id","timestamp");--> statement-breakpoint
CREATE INDEX "pool_history_timestamp_idx" ON "pool_history" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "pools_dex_idx" ON "liquidity_pools" USING btree ("dex");--> statement-breakpoint
CREATE INDEX "pools_address_idx" ON "liquidity_pools" USING btree ("pool_address");