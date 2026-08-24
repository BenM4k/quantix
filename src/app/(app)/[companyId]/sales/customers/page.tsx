import React from "react";
import { getAuthContext } from "@/lib/auth-context";
import { getCustomersService } from "@/services/sales/customer.service";
import { fetchCustomerKpis } from "@/services/module-kpis/module-kpis.service";
import { CustomersClient } from "./customers-client";
import { PageContainer } from "@/components/layout/page-container";

import { CategorySubNav } from "@/components/navigation/category-sub-nav";

export default async function CustomerMasterPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { companyId } = await params;
  const resolvedSearchParams = await searchParams;

  const { company, role } = await getAuthContext();

  const page     = Number(resolvedSearchParams.page) || 1;
  const pageSize = Number(resolvedSearchParams.pageSize) || 50;
  const search   = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const sort     = typeof resolvedSearchParams.sort   === "string" ? resolvedSearchParams.sort   : undefined;

  const [customersRes, kpis] = await Promise.all([
    getCustomersService(company.id, role, { page, pageSize, search, sort }),
    fetchCustomerKpis(company.id),
  ]);

  const customers      = customersRes.ok ? customersRes.value.rows : [];
  const totalCustomers = customersRes.ok ? customersRes.value.total : 0;

  return (
    <CustomersClient
      companyId={companyId}
      customers={customers}
      totalCustomers={totalCustomers}
      userRole={role}
      kpis={kpis}
    />
  );
}
