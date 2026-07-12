import {
  index,
  numeric,
  text,
  timestamp,
  uuid,
  type AnyPgColumnBuilder,
} from "drizzle-orm/pg-core";

/**
 * Standard UUID primary key.
 */
export const uuidPk = () => uuid("id").defaultRandom().primaryKey();

/**
 * Standard money type.
 *
 * Always use NUMERIC for monetary values.
 */
export const money = (name: string) =>
  numeric(name, {
    precision: 19,
    scale: 4,
  });

/**
 * Quantities.
 */
export const quantity = (name: string) =>
  numeric(name, {
    precision: 19,
    scale: 4,
  });

/**
 * Audit timestamps.
 */
export const timestamps = () => ({
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Common organization FK.
 *
 * NOTE:
 * references() is intentionally NOT added here to avoid
 * circular imports with Better Auth.
 */
export const organizationColumn = () => text("organization_id").notNull();

/**
 * Utility for generating organization indexes.
 */
export const organizationIndex = (
  table: {
    organizationId: AnyPgColumnBuilder;
  },
  name: string,
) => index(name).on(table.organizationId as never);
