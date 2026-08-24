import {
  boolean,
  pgTable,
  text,
  uuid,
  unique,
  index,
  timestamp,
  bigint,
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

    address: text("address"),

    imageUrl: text("image_url"),

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

    imageUrl: text("image_url"),

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
 * Insert-only, immutable.
 * ============================================================ */

export const stockLedgerEntry = pgTable(
  "stock_ledger_entry",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    productId: uuid("product_id").notNull(),

    warehouseId: uuid("warehouse_id").notNull(),

    quantity: quantity("quantity").notNull(),

    quantityDelta: quantity("quantity_delta").notNull(),

    unitCost: money("unit_cost").notNull().default("0"),

    movementType: stockMovementTypeEnum("movement_type").notNull(),

    sourceType: text("source_type").notNull().default("manual"),

    sourceId: uuid("source_id"),

    reason: text("reason"),

    sequenceNumber: bigint("sequence_number", { mode: "number" }).notNull(),

    createdBy: text("created_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("stock_entry_org_id_unique").on(table.organizationId, table.id),

    index("stock_entry_product_idx").on(table.organizationId, table.productId),

    index("stock_entry_warehouse_idx").on(
      table.organizationId,
      table.warehouseId,
    ),

    index("stock_entry_product_warehouse_seq_idx").on(
      table.organizationId,
      table.productId,
      table.warehouseId,
      table.sequenceNumber,
    ),

    index("stock_entry_source_idx").on(table.sourceType, table.sourceId),

    index("stock_entry_date_idx").on(table.organizationId, table.createdAt),
  ],
);

/* ============================================================
 * Product Stock Summary (Cache of quantity & average cost)
 * ============================================================ */

export const productStockSummary = pgTable(
  "product_stock_summary",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    productId: uuid("product_id").notNull(),

    warehouseId: uuid("warehouse_id").notNull(),

    quantityOnHand: quantity("quantity_on_hand").notNull().default("0"),

    averageCost: money("average_cost").notNull().default("0"),

    lastSequenceNumber: bigint("last_sequence_number", { mode: "number" })
      .notNull()
      .default(0),

    ...timestamps(),
  },
  (table) => [
    unique("product_stock_summary_org_prod_wh_unique").on(
      table.organizationId,
      table.productId,
      table.warehouseId,
    ),

    index("product_stock_summary_org_prod_idx").on(
      table.organizationId,
      table.productId,
    ),
  ],
);

/* ============================================================
 * Stock Adjustment
 *
 * Header/audit record.
 * ============================================================ */

export const stockAdjustment = pgTable(
  "stock_adjustment",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    warehouseId: uuid("warehouse_id").notNull(),

    reason: text("reason").notNull(),

    createdBy: text("created_by").notNull(),

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

export type ProductStockSummary = typeof productStockSummary.$inferSelect;

export type NewProductStockSummary = typeof productStockSummary.$inferInsert;

export type StockAdjustment = typeof stockAdjustment.$inferSelect;

export type NewStockAdjustment = typeof stockAdjustment.$inferInsert;

