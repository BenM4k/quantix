import { jsonb, pgTable, text, uuid, index, unique } from "drizzle-orm/pg-core";
import { organizationColumn, timestamps, uuidPk } from "./shared.schema";
import { auditActionEnum } from "./tables.enums";

/* ============================================================
 * Audit Log
 *
 * Append-only history.
 *
 * Examples:
 *
 * entity_type = invoice
 * entity_id   = invoice uuid
 *
 * before:
 * {
 *   status:"draft"
 * }
 *
 * after:
 * {
 *   status:"sent"
 * }
 *
 * ============================================================ */

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    userId: uuid("user_id"),

    entityType: text("entity_type").notNull(),

    entityId: uuid("entity_id").notNull(),

    action: auditActionEnum("action").notNull(),

    before: jsonb("before"),

    after: jsonb("after"),

    /*
     * Useful for debugging:
     *
     * API request id
     * background job id
     * webhook id
     */
    correlationId: text("correlation_id"),

    ...timestamps(),
  },
  (table) => [
    unique("audit_log_org_id_unique").on(table.organizationId, table.id),

    /*
     * Entity history lookup:
     *
     * "Show all changes for invoice X"
     */
    index("audit_entity_idx").on(
      table.organizationId,
      table.entityType,
      table.entityId,
    ),

    /*
     * User activity:
     *
     * "What did this employee change?"
     */
    index("audit_user_idx").on(table.organizationId, table.userId),

    /*
     * Timeline queries
     */
    index("audit_created_idx").on(table.organizationId, table.createdAt),
  ],
);

/* ============================================================
 * Types
 * ============================================================ */

export type AuditLog = typeof auditLog.$inferSelect;

export type NewAuditLog = typeof auditLog.$inferInsert;
