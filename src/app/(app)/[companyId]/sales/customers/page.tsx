import React from "react";
import { getAuthContext } from "@/lib/auth-context";
import { getCustomersService } from "@/services/sales/customer.service";
import { CustomersClient } from "./customers-client";
import { PageContainer } from "@/components/layout/page-container";

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

  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = Number(resolvedSearchParams.pageSize) || 20;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : undefined;

  const customersRes = await getCustomersService(company.id, role, {
    page,
    pageSize,
    search,
    sort,
  });

  const customers = customersRes.ok ? customersRes.value.rows : [];
  const totalCustomers = customersRes.ok ? customersRes.value.total : 0;

  return (
    <PageContainer>
      <CustomersClient
        companyId={companyId}
        customers={customers}
        totalCustomers={totalCustomers}
        userRole={role}
      />
    </PageContainer>
  );
}
