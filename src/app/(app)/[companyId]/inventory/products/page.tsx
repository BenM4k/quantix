import { redirect } from "next/navigation";

export default async function LegacyProductsRedirect({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  redirect(`/${companyId}/operations/products`);
}
