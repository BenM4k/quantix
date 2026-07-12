import "server-only";

import { and, eq } from "drizzle-orm";
import { Tx } from "@/services/drizzle";
import { customer } from "@/services/drizzle/schemas";

export async function getActiveCustomerById(
  tx: Tx,
  organizationId: string,
  customerId: string,
) {
  return tx.query.customer.findFirst({
    where: {
      organizationId,
      id: customerId,
      active: true,
    },
  });
}
