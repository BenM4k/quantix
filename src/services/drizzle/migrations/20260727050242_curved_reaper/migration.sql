CREATE TYPE "normal_balance" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('draft', 'confirmed', 'converted', 'cancelled');--> statement-breakpoint
CREATE TYPE "quote_status" AS ENUM('draft', 'sent', 'accepted', 'declined', 'expired', 'converted');--> statement-breakpoint
ALTER TYPE "invoice_status" ADD VALUE 'unpaid' BEFORE 'draft';--> statement-breakpoint
ALTER TYPE "journal_source_type" ADD VALUE 'adjustment' BEFORE 'stock_adjustment';--> statement-breakpoint
CREATE TABLE "product_stock_summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity_on_hand" numeric(19,4) DEFAULT '0' NOT NULL,
	"average_cost" numeric(19,4) DEFAULT '0' NOT NULL,
	"last_sequence_number" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_stock_summary_org_prod_wh_unique" UNIQUE("organization_id","product_id","warehouse_id")
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"quote_number" text NOT NULL,
	"quote_date" date NOT NULL,
	"expiry_date" date,
	"status" "quote_status" DEFAULT 'draft'::"quote_status" NOT NULL,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_total" numeric(19,4) DEFAULT '0' NOT NULL,
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_org_number_unique" UNIQUE("organization_id","quote_number"),
	CONSTRAINT "quote_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "quote_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"quote_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(19,4) NOT NULL,
	"unit_price" numeric(19,4) NOT NULL,
	"tax_rate_id" uuid,
	"tax_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"line_total" numeric(19,4) NOT NULL,
	"line_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_line_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "sales_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"order_number" text NOT NULL,
	"order_date" date NOT NULL,
	"status" "order_status" DEFAULT 'draft'::"order_status" NOT NULL,
	"source_quote_id" uuid,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_total" numeric(19,4) DEFAULT '0' NOT NULL,
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_order_org_number_unique" UNIQUE("organization_id","order_number"),
	CONSTRAINT "sales_order_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "sales_order_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(19,4) NOT NULL,
	"unit_price" numeric(19,4) NOT NULL,
	"tax_rate_id" uuid,
	"tax_amount" numeric(19,4) DEFAULT '0' NOT NULL,
	"line_total" numeric(19,4) NOT NULL,
	"line_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_order_line_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
DROP INDEX "stock_entry_product_warehouse_idx";--> statement-breakpoint
ALTER TABLE "journal_entry" ADD COLUMN "reversal_of_entry_id" uuid;--> statement-breakpoint
ALTER TABLE "ledger_account" ADD COLUMN "normal_balance" "normal_balance" DEFAULT 'debit'::"normal_balance" NOT NULL;--> statement-breakpoint
ALTER TABLE "ledger_account" ADD COLUMN "is_bank_account" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" ADD COLUMN "quantity" numeric(19,4) NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" ADD COLUMN "sequence_number" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "warehouse" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "warehouse" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "source_order_id" uuid;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "pdf_url" text;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "invoice_line" ADD COLUMN "tax_amount" numeric(19,4) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" ALTER COLUMN "movement_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "stock_movement_type";--> statement-breakpoint
CREATE TYPE "stock_movement_type" AS ENUM('initial', 'adjustment_in', 'adjustment_out', 'sale', 'sale_reversal');--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" ALTER COLUMN "movement_type" SET DATA TYPE "stock_movement_type" USING "movement_type"::"stock_movement_type";--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" DROP COLUMN "occurred_at";--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" ALTER COLUMN "source_type" SET DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "stock_ledger_entry" ALTER COLUMN "source_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ALTER COLUMN "status" SET DEFAULT 'unpaid'::"invoice_status";--> statement-breakpoint
DROP INDEX "stock_entry_date_idx";--> statement-breakpoint
CREATE INDEX "stock_entry_date_idx" ON "stock_ledger_entry" ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "journal_entry_reversal_idx" ON "journal_entry" ("reversal_of_entry_id");--> statement-breakpoint
CREATE INDEX "product_stock_summary_org_prod_idx" ON "product_stock_summary" ("organization_id","product_id");--> statement-breakpoint
CREATE INDEX "stock_entry_product_warehouse_seq_idx" ON "stock_ledger_entry" ("organization_id","product_id","warehouse_id","sequence_number");--> statement-breakpoint
CREATE INDEX "invoice_source_order_idx" ON "invoice" ("organization_id","source_order_id");--> statement-breakpoint
CREATE INDEX "quote_org_idx" ON "quote" ("organization_id");--> statement-breakpoint
CREATE INDEX "quote_customer_idx" ON "quote" ("organization_id","customer_id");--> statement-breakpoint
CREATE INDEX "quote_status_idx" ON "quote" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "quote_line_quote_idx" ON "quote_line" ("quote_id","line_order");--> statement-breakpoint
CREATE INDEX "quote_line_product_idx" ON "quote_line" ("organization_id","product_id");--> statement-breakpoint
CREATE INDEX "sales_order_org_idx" ON "sales_order" ("organization_id");--> statement-breakpoint
CREATE INDEX "sales_order_customer_idx" ON "sales_order" ("organization_id","customer_id");--> statement-breakpoint
CREATE INDEX "sales_order_status_idx" ON "sales_order" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "sales_order_quote_idx" ON "sales_order" ("organization_id","source_quote_id");--> statement-breakpoint
CREATE INDEX "sales_order_line_order_idx" ON "sales_order_line" ("order_id","line_order");--> statement-breakpoint
CREATE INDEX "sales_order_line_product_idx" ON "sales_order_line" ("organization_id","product_id");