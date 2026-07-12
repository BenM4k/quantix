import {
  boolean,
  pgTable,
  text,
  uuid,
  unique,
  index,
  timestamp,
} from "drizzle-orm/pg-core";

import {
  uuidPk,
  money,
  quantity,
  timestamps,
  organizationColumn,
} from "./shared.schema";

import { stockMovementTypeEnum } from "./tables.enums";

/* ============================================================
 * Warehouse
 *
 * MVP:
 * one warehouse per organization.
 *
 * Future:
 * multi warehouse feature flag.
 * ============================================================ */

export const warehouse = pgTable(
  "warehouse",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    name: text("name").notNull(),

    isDefault: boolean("is_default").notNull().default(false),

    active: boolean("active").notNull().default(true),

    ...timestamps(),
  },
  (table) => [
    unique("warehouse_org_id_unique").on(table.organizationId, table.id),

    index("warehouse_org_idx").on(table.organizationId),

    index("warehouse_active_idx").on(table.organizationId, table.active),
  ],
);

/* ============================================================
 * Product
 *
 * Inventory master record.
 *
 * Quantity is intentionally NOT here.
 * ============================================================ */

export const product = pgTable(
  "product",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    sku: text("sku").notNull(),

    name: text("name").notNull(),

    uom: text("uom").notNull().default("unit"),

    sellPrice: money("sell_price").notNull().default("0"),

    costPrice: money("cost_price").notNull().default("0"),

    taxRateId: uuid("tax_rate_id"),

    reorderThreshold: quantity("reorder_threshold"),

    active: boolean("active").notNull().default(true),

    ...timestamps(),
  },
  (table) => [
    unique("product_org_sku_unique").on(table.organizationId, table.sku),

    unique("product_org_id_unique").on(table.organizationId, table.id),

    index("product_org_idx").on(table.organizationId),

    index("product_active_idx").on(table.organizationId, table.active),

    index("product_tax_rate_idx").on(table.taxRateId),
  ],
);

/* ============================================================
 * Stock Ledger Entry
 *
 * SOURCE OF TRUTH FOR STOCK.
 *
 * Insert only.
 *
 * Examples:
 *
 * +10 purchase_receipt
 * -2 sale
 * -3 adjustment
 *
 * Current stock:
 *
 * SUM(quantity_delta)
 *
 * ============================================================ */

export const stockLedgerEntry = pgTable(
  "stock_ledger_entry",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    productId: uuid("product_id").notNull(),

    warehouseId: uuid("warehouse_id").notNull(),

    quantityDelta: quantity("quantity_delta").notNull(),

    unitCost: money("unit_cost").notNull().default("0"),

    movementType: stockMovementTypeEnum("movement_type").notNull(),

    /*
     * Polymorphic source.
     *
     * Examples:
     *
     * invoice
     * stock_adjustment
     * purchase_receipt
     */
    sourceType: text("source_type"),

    sourceId: uuid("source_id"),

    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    createdBy: uuid("created_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("stock_entry_org_id_unique").on(table.organizationId, table.id),

    index("stock_entry_product_idx").on(table.organizationId, table.productId),

    index("stock_entry_warehouse_idx").on(
      table.organizationId,
      table.warehouseId,
    ),

    index("stock_entry_product_warehouse_idx").on(
      table.organizationId,
      table.productId,
      table.warehouseId,
    ),

    index("stock_entry_source_idx").on(table.sourceType, table.sourceId),

    index("stock_entry_date_idx").on(table.organizationId, table.occurredAt),
  ],
);

/* ============================================================
 * Stock Adjustment
 *
 * Header/audit record.
 *
 * The actual quantity change happens through
 * stock_ledger_entry rows.
 * ============================================================ */

export const stockAdjustment = pgTable(
  "stock_adjustment",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    warehouseId: uuid("warehouse_id").notNull(),

    reason: text("reason").notNull(),

    createdBy: uuid("created_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("stock_adjustment_org_id_unique").on(table.organizationId, table.id),

    index("stock_adjustment_org_idx").on(table.organizationId),

    index("stock_adjustment_warehouse_idx").on(
      table.organizationId,
      table.warehouseId,
    ),
  ],
);

/* ============================================================
 * Types
 * ============================================================ */

export type Warehouse = typeof warehouse.$inferSelect;

export type NewWarehouse = typeof warehouse.$inferInsert;

export type Product = typeof product.$inferSelect;

export type NewProduct = typeof product.$inferInsert;

export type StockLedgerEntry = typeof stockLedgerEntry.$inferSelect;

export type NewStockLedgerEntry = typeof stockLedgerEntry.$inferInsert;

export type StockAdjustment = typeof stockAdjustment.$inferSelect;

export type NewStockAdjustment = typeof stockAdjustment.$inferInsert;
