import { redirect } from "next/navigation";

export default async function LegacyStockLedgerRedirect({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  redirect(`/${companyId}/operations/stock-ledger`);
}
