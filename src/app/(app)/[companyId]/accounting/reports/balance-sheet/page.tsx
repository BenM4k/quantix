import { redirect } from "next/navigation";

export default async function LegacyBalanceSheetRedirect({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  redirect(`/${companyId}/reports/balance-sheet`);
}
