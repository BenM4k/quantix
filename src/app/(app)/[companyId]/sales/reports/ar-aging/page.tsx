import { redirect } from "next/navigation";

export default async function LegacyARAgingRedirect({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  redirect(`/${companyId}/reports/ar-aging`);
}
