import "server-only";

import { sql } from "drizzle-orm";
import { type Tx, db } from "@/services/drizzle";

/**
 * Every table's RLS policy checks `organization_id = current_organization_id()`,
 * where current_organization_id() reads the Postgres session variable
 * `app.organization_id` (see rls.sql).
 *
 * That variable is transaction-scoped (set_config(..., true) = "local" =
 * SET LOCAL semantics), so it MUST be set at the start of every transaction
 * that touches a tenant table — including reads. There is no such thing as
 * a "read that skips the transaction" here: without a transaction wrapping
 * it, the session variable from a previous query on a pooled connection
 * could leak into this one, or simply not be set at all, and RLS would
 * silently return zero rows (or worse, depending on your default-deny
 * setup) instead of throwing.
 *
 * Services call this once per business operation and pass `tx` into every
 * DAL call underneath. DAL functions never call db.transaction() or
 * withTenantTransaction() themselves — that would violate "Services own
 * transactions" and risk nested/duplicate SET LOCAL calls.
 */
export async function withTenantTransaction<T>(
  organizationId: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  if (!organizationId) {
    // Fail loudly. A missing organizationId here means either an auth bug
    // upstream or a Service that forgot to scope its call — either way,
    // silently proceeding would risk a cross-tenant query.
    throw new Error("withTenantTransaction: organizationId is required");
  }

  return db.transaction(async (tx) => {
    // Parameterized on purpose. Never string-interpolate SET LOCAL directly
    // (`SET LOCAL app.organization_id = '${organizationId}'`) — that's a
    // SQL injection vector. set_config() accepts a normal bound parameter.
    await tx.execute(
      sql`select set_config('app.organization_id', ${organizationId}, true)`,
    );

    return fn(tx);
  });
}

/**
 * Reminder for whoever sets up the DB connection: RLS is bypassed for the
 * table owner by default. If your app connects using the same role that
 * ran the migrations, every policy above is currently a no-op. Either:
 *   - connect as a separate, non-owner application role, or
 *   - run `ALTER TABLE <table> FORCE ROW LEVEL SECURITY;` for every table
 *     in rls.sql (needed even for the owner role).
 * This file can't fix that for you — it's a DB/infra config decision.
 */
