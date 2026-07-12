import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  unique,
  uuid,
  index,
  timestamp,
} from "drizzle-orm/pg-core";
import { money, organizationColumn, timestamps, uuidPk } from "./shared.schema";
import { fiscalPeriodStatusEnum, fiscalYearStatusEnum } from "./tables.enums";

/* ============================================================
 * Company Profile
 *
 * 1:1 extension of Better Auth organization
 * ============================================================ */

export const companyProfile = pgTable(
  "company_profile",
  {
    organizationId: organizationColumn(),

    companyType: text("company_type").notNull().default("service"),

    baseCurrency: text("base_currency").notNull().default("USD"),

    dateFormat: text("date_format").notNull().default("YYYY-MM-DD"),

    fiscalYearStartMonth: integer("fiscal_year_start_month")
      .notNull()
      .default(1),

    fiscalYearStartDay: integer("fiscal_year_start_day").notNull().default(1),

    // Future:
    // defaultWarehouseId added after warehouse exists

    ...timestamps(),
  },
  (table) => [index("company_profile_org_idx").on(table.organizationId)],
);

/* ============================================================
 * Company Features
 * ============================================================ */

export const companyFeature = pgTable(
  "company_feature",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    featureKey: text("feature_key").notNull(),

    enabled: boolean("enabled").notNull().default(false),

    ...timestamps(),
  },
  (table) => [
    unique("company_feature_org_key_unique").on(
      table.organizationId,
      table.featureKey,
    ),

    index("company_feature_org_idx").on(table.organizationId),
  ],
);

/* ============================================================
 * Fiscal Year
 * ============================================================ */

export const fiscalYear = pgTable(
  "fiscal_year",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    label: text("label").notNull(),

    startDate: date("start_date").notNull(),

    endDate: date("end_date").notNull(),

    status: fiscalYearStatusEnum("status").notNull().default("open"),

    ...timestamps(),
  },
  (table) => [
    unique("fiscal_year_org_label_unique").on(
      table.organizationId,
      table.label,
    ),

    unique("fiscal_year_org_id_unique").on(table.organizationId, table.id),

    index("fiscal_year_org_idx").on(table.organizationId),

    index("fiscal_year_status_idx").on(table.organizationId, table.status),
  ],
);

/* ============================================================
 * Fiscal Period
 * ============================================================ */

export const fiscalPeriod = pgTable(
  "fiscal_period",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    fiscalYearId: uuid("fiscal_year_id").notNull(),

    periodNumber: integer("period_number").notNull(),

    startDate: date("start_date").notNull(),

    endDate: date("end_date").notNull(),

    status: fiscalPeriodStatusEnum("status").notNull().default("open"),

    closedAt: timestamp("closed_at", {
      withTimezone: true,
      mode: "date",
    }),

    closedBy: uuid("closed_by"),

    ...timestamps(),
  },
  (table) => [
    unique("fiscal_period_year_number_unique").on(
      table.fiscalYearId,
      table.periodNumber,
    ),

    unique("fiscal_period_org_id_unique").on(table.organizationId, table.id),

    index("fiscal_period_org_idx").on(table.organizationId),

    index("fiscal_period_status_idx").on(table.organizationId, table.status),
  ],
);

/* ============================================================
 * Numbering Sequence
 * ============================================================ */

export const numberingSequence = pgTable(
  "numbering_sequence",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    sequenceKey: text("sequence_key").notNull(),

    prefix: text("prefix"),

    nextNumber: integer("next_number").notNull().default(1),

    padding: integer("padding").notNull().default(4),

    ...timestamps(),
  },
  (table) => [
    unique("numbering_sequence_org_key_unique").on(
      table.organizationId,
      table.sequenceKey,
    ),

    index("numbering_sequence_org_idx").on(table.organizationId),
  ],
);

/* ============================================================
 * Tax Rate
 * ============================================================ */

export const taxRate = pgTable(
  "tax_rate",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    name: text("name").notNull(),

    ratePercent: money("rate_percent"),

    isDefault: boolean("is_default").notNull().default(false),

    active: boolean("active").notNull().default(true),

    ...timestamps(),
  },
  (table) => [
    index("tax_rate_org_idx").on(table.organizationId),

    index("tax_rate_active_idx").on(table.organizationId, table.active),
  ],
);

/* ============================================================
 * Types
 * ============================================================ */

export type CompanyProfile = typeof companyProfile.$inferSelect;

export type NewCompanyProfile = typeof companyProfile.$inferInsert;

export type CompanyFeature = typeof companyFeature.$inferSelect;

export type NewCompanyFeature = typeof companyFeature.$inferInsert;

export type FiscalYear = typeof fiscalYear.$inferSelect;

export type NewFiscalYear = typeof fiscalYear.$inferInsert;

export type FiscalPeriod = typeof fiscalPeriod.$inferSelect;

export type NewFiscalPeriod = typeof fiscalPeriod.$inferInsert;

export type NumberingSequence = typeof numberingSequence.$inferSelect;

export type NewNumberingSequence = typeof numberingSequence.$inferInsert;

export type TaxRate = typeof taxRate.$inferSelect;

export type NewTaxRate = typeof taxRate.$inferInsert;
