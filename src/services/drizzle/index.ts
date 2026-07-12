import "server-only";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./schemas/tables.relations";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle({ client: pool, relations });

export type Database = typeof db;

/**
 * The transaction handle type every DAL function accepts as its first
 * argument. DAL functions never open their own transaction — Services own
 * transactions (via withTenantTransaction below) and pass `tx` down.
 */
export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
