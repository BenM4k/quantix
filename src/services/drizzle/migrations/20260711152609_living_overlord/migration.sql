CREATE TYPE "audit_action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "fiscal_period_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "fiscal_year_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "invoice_status" AS ENUM('draft', 'sent', 'partial', 'paid', 'void');--> statement-breakpoint
CREATE TYPE "journal_source_type" AS ENUM('invoice', 'payment', 'manual', 'stock_adjustment', 'payroll');--> statement-breakpoint
CREATE TYPE "journal_status" AS ENUM('posted', 'void');--> statement-breakpoint
CREATE TYPE "ledger_account_type" AS ENUM('asset', 'liability', 'equity', 'revenue', 'expense');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('bank_transfer', 'cash', 'card', 'other');--> statement-breakpoint
CREATE TYPE "stock_movement_type" AS ENUM('sale', 'purchase_receipt', 'adjustment', 'transfer_in', 'transfer_out', 'initial');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"created_at" timestamp with time zone NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "company_feature" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"feature_key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_feature_org_key_unique" UNIQUE("organization_id","feature_key")
);
--> statement-breakpoint
CREATE TABLE "company_profile" (
	"organization_id" uuid NOT NULL,
	"base_currency" text DEFAULT 'USD' NOT NULL,
	"date_format" text DEFAULT 'YYYY-MM-DD' NOT NULL,
	"fiscal_year_start_month" integer DEFAULT 1 NOT NULL,
	"fiscal_year_start_day" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_period" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"fiscal_year_id" uuid NOT NULL,
	"period_number" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "fiscal_period_status" DEFAULT 'open'::"fiscal_period_status" NOT NULL,
	"closed_at" timestamp with time zone,
	"closed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fiscal_period_year_number_unique" UNIQUE("fiscal_year_id","period_number"),
	CONSTRAINT "fiscal_period_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "fiscal_year" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"label" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "fiscal_year_status" DEFAULT 'open'::"fiscal_year_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fiscal_year_org_label_unique" UNIQUE("organization_id","label"),
	CONSTRAINT "fiscal_year_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "numbering_sequence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"sequence_key" text NOT NULL,
	"prefix" text,
	"next_number" integer DEFAULT 1 NOT NULL,
	"padding" integer DEFAULT 4 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "numbering_sequence_org_key_unique" UNIQUE("organization_id","sequence_key")
);
--> statement-breakpoint
CREATE TABLE "tax_rate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"rate_percent" numeric(19,4),
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"account_number_masked" text,
	"opening_balance" numeric(19,4) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bank_account_org_ledger_unique" UNIQUE("organization_id","ledger_account_id"),
	CONSTRAINT "bank_account_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "journal_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"fiscal_period_id" uuid NOT NULL,
	"entry_number" text NOT NULL,
	"entry_date" date NOT NULL,
	"memo" text,
	"source_type" "journal_source_type" NOT NULL,
	"source_id" uuid,
	"status" "journal_status" DEFAULT 'posted'::"journal_status" NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entry_org_number_unique" UNIQUE("organization_id","entry_number"),
	CONSTRAINT "journal_entry_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "journal_entry_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"debit" numeric(19,4) DEFAULT '0' NOT NULL,
	"credit" numeric(19,4) DEFAULT '0' NOT NULL,
	"department_id" uuid,
	"description" text,
	"line_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_line_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "ledger_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "ledger_account_type" NOT NULL,
	"parent_account_id" uuid,
	"department_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_account_org_code_unique" UNIQUE("organization_id","code"),
	CONSTRAINT "ledger_account_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"uom" text DEFAULT 'unit' NOT NULL,
	"sell_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"cost_price" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_rate_id" uuid,
	"reorder_threshold" numeric(19,4),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_org_sku_unique" UNIQUE("organization_id","sku"),
	CONSTRAINT "product_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "stock_adjustment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_adjustment_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "stock_ledger_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity_delta" numeric(19,4) NOT NULL,
	"unit_cost" numeric(19,4) DEFAULT '0' NOT NULL,
	"movement_type" "stock_movement_type" NOT NULL,
	"source_type" text,
	"source_id" uuid,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_entry_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "warehouse" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warehouse_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "credit_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(19,4) NOT NULL,
	"reason" text NOT NULL,
	"journal_entry_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_note_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"tax_id" text,
	"payment_terms_days" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"fiscal_period_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"status" "invoice_status" DEFAULT 'draft'::"invoice_status" NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(19,4) DEFAULT '0' NOT NULL,
	"tax_total" numeric(19,4) DEFAULT '0' NOT NULL,
	"total" numeric(19,4) DEFAULT '0' NOT NULL,
	"journal_entry_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_org_number_unique" UNIQUE("organization_id","invoice_number"),
	CONSTRAINT "invoice_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "invoice_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(19,4) NOT NULL,
	"unit_price" numeric(19,4) NOT NULL,
	"tax_rate_id" uuid,
	"line_total" numeric(19,4) NOT NULL,
	"line_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_line_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(19,4) NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"method" "payment_method" NOT NULL,
	"journal_entry_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"filename" text NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attachment_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"parent_department_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "department_org_id_unique" UNIQUE("organization_id","id"),
	CONSTRAINT "department_org_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"correlation_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_log_org_id_unique" UNIQUE("organization_id","id")
);
--> statement-breakpoint
CREATE INDEX "company_feature_org_idx" ON "company_feature" ("organization_id");--> statement-breakpoint
CREATE INDEX "company_profile_org_idx" ON "company_profile" ("organization_id");--> statement-breakpoint
CREATE INDEX "fiscal_period_org_idx" ON "fiscal_period" ("organization_id");--> statement-breakpoint
CREATE INDEX "fiscal_period_status_idx" ON "fiscal_period" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "fiscal_year_org_idx" ON "fiscal_year" ("organization_id");--> statement-breakpoint
CREATE INDEX "fiscal_year_status_idx" ON "fiscal_year" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "numbering_sequence_org_idx" ON "numbering_sequence" ("organization_id");--> statement-breakpoint
CREATE INDEX "tax_rate_org_idx" ON "tax_rate" ("organization_id");--> statement-breakpoint
CREATE INDEX "tax_rate_active_idx" ON "tax_rate" ("organization_id","active");--> statement-breakpoint
CREATE INDEX "bank_account_org_idx" ON "bank_account" ("organization_id");--> statement-breakpoint
CREATE INDEX "journal_entry_org_date_idx" ON "journal_entry" ("organization_id","entry_date");--> statement-breakpoint
CREATE INDEX "journal_entry_status_idx" ON "journal_entry" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "journal_entry_source_idx" ON "journal_entry" ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "journal_entry_period_idx" ON "journal_entry" ("fiscal_period_id");--> statement-breakpoint
CREATE INDEX "journal_line_entry_idx" ON "journal_entry_line" ("journal_entry_id","line_order");--> statement-breakpoint
CREATE INDEX "journal_line_account_idx" ON "journal_entry_line" ("organization_id","ledger_account_id");--> statement-breakpoint
CREATE INDEX "journal_line_department_idx" ON "journal_entry_line" ("department_id");--> statement-breakpoint
CREATE INDEX "ledger_account_org_idx" ON "ledger_account" ("organization_id");--> statement-breakpoint
CREATE INDEX "ledger_account_type_idx" ON "ledger_account" ("organization_id","type");--> statement-breakpoint
CREATE INDEX "ledger_account_active_idx" ON "ledger_account" ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "ledger_account_parent_idx" ON "ledger_account" ("parent_account_id");--> statement-breakpoint
CREATE INDEX "product_org_idx" ON "product" ("organization_id");--> statement-breakpoint
CREATE INDEX "product_active_idx" ON "product" ("organization_id","active");--> statement-breakpoint
CREATE INDEX "product_tax_rate_idx" ON "product" ("tax_rate_id");--> statement-breakpoint
CREATE INDEX "stock_adjustment_org_idx" ON "stock_adjustment" ("organization_id");--> statement-breakpoint
CREATE INDEX "stock_adjustment_warehouse_idx" ON "stock_adjustment" ("organization_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_entry_product_idx" ON "stock_ledger_entry" ("organization_id","product_id");--> statement-breakpoint
CREATE INDEX "stock_entry_warehouse_idx" ON "stock_ledger_entry" ("organization_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_entry_product_warehouse_idx" ON "stock_ledger_entry" ("organization_id","product_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_entry_source_idx" ON "stock_ledger_entry" ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "stock_entry_date_idx" ON "stock_ledger_entry" ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "warehouse_org_idx" ON "warehouse" ("organization_id");--> statement-breakpoint
CREATE INDEX "warehouse_active_idx" ON "warehouse" ("organization_id","active");--> statement-breakpoint
CREATE INDEX "credit_note_invoice_idx" ON "credit_note" ("organization_id","invoice_id");--> statement-breakpoint
CREATE INDEX "customer_org_idx" ON "customer" ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_active_idx" ON "customer" ("organization_id","active");--> statement-breakpoint
CREATE INDEX "customer_email_idx" ON "customer" ("organization_id","email");--> statement-breakpoint
CREATE INDEX "invoice_customer_idx" ON "invoice" ("organization_id","customer_id");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoice" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "invoice_outstanding_idx" ON "invoice" ("organization_id","status","due_date");--> statement-breakpoint
CREATE INDEX "invoice_period_idx" ON "invoice" ("fiscal_period_id");--> statement-breakpoint
CREATE INDEX "invoice_line_invoice_idx" ON "invoice_line" ("invoice_id","line_order");--> statement-breakpoint
CREATE INDEX "invoice_line_product_idx" ON "invoice_line" ("organization_id","product_id");--> statement-breakpoint
CREATE INDEX "payment_invoice_idx" ON "payment" ("organization_id","invoice_id");--> statement-breakpoint
CREATE INDEX "payment_date_idx" ON "payment" ("organization_id","paid_at");--> statement-breakpoint
CREATE INDEX "attachment_entity_idx" ON "attachment" ("organization_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "attachment_uploader_idx" ON "attachment" ("organization_id","uploaded_by");--> statement-breakpoint
CREATE INDEX "department_org_idx" ON "department" ("organization_id");--> statement-breakpoint
CREATE INDEX "department_parent_idx" ON "department" ("parent_department_id");--> statement-breakpoint
CREATE INDEX "department_active_idx" ON "department" ("organization_id","active");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" ("organization_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" ("organization_id","created_at");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id");--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id");--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");