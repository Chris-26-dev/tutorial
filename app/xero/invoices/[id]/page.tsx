import { XeroInvoiceDetailRouteClient } from "@/components/xero/XeroViews";
import { getContacts, getInvoices } from "@/lib/data/xero";

export default async function XeroInvoiceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <XeroInvoiceDetailRouteClient id={id} invoices={getInvoices()} contacts={getContacts()} />;
}