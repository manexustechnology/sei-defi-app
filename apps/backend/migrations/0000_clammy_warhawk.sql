CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"asset_pair" text NOT NULL,
	"side" text NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
