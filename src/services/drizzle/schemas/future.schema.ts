import {
  boolean,
  pgTable,
  text,
  uuid,
  unique,
  index,
} from "drizzle-orm/pg-core";

import { uuidPk, timestamps, organizationColumn } from "./shared.schema";

/* ============================================================
 * Department
 *
 * Feature flag:
 *
 * departments
 *
 * Used later as:
 *
 * Cost center
 * Reporting dimension
 * Employee grouping
 *
 * Existing nullable references:
 *
 * ledger_account.department_id
 * journal_entry_line.department_id
 *
 * ============================================================ */

export const department = pgTable(
  "department",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    name: text("name").notNull(),

    parentDepartmentId: uuid("parent_department_id"),

    active: boolean("active").notNull().default(true),

    ...timestamps(),
  },
  (table) => [
    unique("department_org_id_unique").on(table.organizationId, table.id),

    unique("department_org_name_unique").on(table.organizationId, table.name),

    index("department_org_idx").on(table.organizationId),

    index("department_parent_idx").on(table.parentDepartmentId),

    index("department_active_idx").on(table.organizationId, table.active),
  ],
);

/* ============================================================
 * Attachment
 *
 * Generic file storage reference.
 *
 * Supports:
 *
 * invoice
 * product
 * employee (future)
 * contracts (future)
 *
 * Polymorphic reference:
 *
 * entity_type
 * entity_id
 *
 * Validation happens in Service layer.
 *
 * ============================================================ */

export const attachment = pgTable(
  "attachment",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    entityType: text("entity_type").notNull(),

    entityId: uuid("entity_id").notNull(),

    fileUrl: text("file_url").notNull(),

    filename: text("filename").notNull(),

    uploadedBy: uuid("uploaded_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("attachment_org_id_unique").on(table.organizationId, table.id),

    index("attachment_entity_idx").on(
      table.organizationId,
      table.entityType,
      table.entityId,
    ),

    index("attachment_uploader_idx").on(table.organizationId, table.uploadedBy),
  ],
);

/* ============================================================
 * Types
 * ============================================================ */

export type Department = typeof department.$inferSelect;

export type NewDepartment = typeof department.$inferInsert;

export type Attachment = typeof attachment.$inferSelect;

export type NewAttachment = typeof attachment.$inferInsert;
