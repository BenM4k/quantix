import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import {
  getInvoiceKpis, type InvoiceKpis,
  getCustomerKpis, type CustomerKpis,
  getOrderKpis, type OrderKpis,
  getQuoteKpis, type QuoteKpis,
  getProductKpis, type ProductKpis,
} from "@/dal/module-kpis/queries";

export type { InvoiceKpis, CustomerKpis, OrderKpis, QuoteKpis, ProductKpis };

export const fetchInvoiceKpis = (orgId: string): Promise<InvoiceKpis> =>
  withTenantTransaction(orgId, (tx) => getInvoiceKpis(tx, orgId));

export const fetchCustomerKpis = (orgId: string): Promise<CustomerKpis> =>
  withTenantTransaction(orgId, (tx) => getCustomerKpis(tx, orgId));

export const fetchOrderKpis = (orgId: string): Promise<OrderKpis> =>
  withTenantTransaction(orgId, (tx) => getOrderKpis(tx, orgId));

export const fetchQuoteKpis = (orgId: string): Promise<QuoteKpis> =>
  withTenantTransaction(orgId, (tx) => getQuoteKpis(tx, orgId));

export const fetchProductKpis = (orgId: string): Promise<ProductKpis> =>
  withTenantTransaction(orgId, (tx) => getProductKpis(tx, orgId));

/**
 * Batched multi-module KPI fetchers to run inside a single tenant transaction,
 * avoiding concurrent transaction collisions on the pg client connection.
 */
export const fetchSalesKpis = async (orgId: string) => {
  return withTenantTransaction(orgId, async (tx) => {
    const invoiceKpis = await getInvoiceKpis(tx, orgId);
    const orderKpis = await getOrderKpis(tx, orgId);
    const quoteKpis = await getQuoteKpis(tx, orgId);
    const customerKpis = await getCustomerKpis(tx, orgId);
    return { invoiceKpis, orderKpis, quoteKpis, customerKpis };
  });
};

export const fetchReportsKpis = async (orgId: string) => {
  return withTenantTransaction(orgId, async (tx) => {
    const invoiceKpis = await getInvoiceKpis(tx, orgId);
    const productKpis = await getProductKpis(tx, orgId);
    const customerKpis = await getCustomerKpis(tx, orgId);
    return { invoiceKpis, productKpis, customerKpis };
  });
};
