import { redirect } from "next/navigation";

export default async function LegacyPnLRedirect({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  redirect(`/${companyId}/reports/p-and-l`);
}
