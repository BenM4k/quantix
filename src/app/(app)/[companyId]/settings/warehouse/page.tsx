import React from "react";
import { getAuthContext } from "@/lib/auth-context";
import { canX } from "@/lib/permissions";
import { getWarehouseService } from "@/services/warehouse/warehouse.service";
import { WarehouseForm } from "./warehouse-form";
import { PageContainer } from "@/components/layout/page-container";

import { CategorySubNav } from "@/components/navigation/category-sub-nav";

export default async function WarehouseSettingsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const { company, role } = await getAuthContext();

  const warehouseRes = await getWarehouseService(company.id, role);
  const warehouse = warehouseRes.ok ? warehouseRes.value : null;

  const canEdit = canX(role, company, "warehouse:edit");

  return (
    <WarehouseForm
      companyId={companyId}
      initialData={warehouse}
      canEdit={canEdit}
    />
  );
}
