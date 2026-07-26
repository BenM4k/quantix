import { inngest } from "@/lib/inngest";
import { withTenantTransaction } from "@/lib/tenant-context";
import { updateInvoicePdfUrl } from "@/dal/invoices/mutations";

export const generateInvoicePdf = inngest.createFunction(
  {
    id: "generate-invoice-pdf",
    triggers: [{ event: "invoice/pdf.generate" }],
  },
  async ({ event, step }) => {
    const { invoiceId, companyId } = event.data;

    await step.run("generate-and-save-pdf", async () => {
      console.log(`[Inngest] Generating PDF for invoice ${invoiceId} (company ${companyId})...`);

      const placeholderPdfUrl = `https://storage.quantix.internal/invoices/${invoiceId}.pdf`;

      await withTenantTransaction(companyId, async (tx) => {
        await updateInvoicePdfUrl(tx, companyId, invoiceId, placeholderPdfUrl);
      });

      return { pdfUrl: placeholderPdfUrl };
    });
  },
);
