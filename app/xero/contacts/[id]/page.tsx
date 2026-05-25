import { XeroContactDetailRouteClient } from "@/components/xero/XeroViews";
import { getBills, getContacts, getInvoices } from "@/lib/data/xero";

export default async function XeroContactDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <XeroContactDetailRouteClient id={id} contacts={getContacts()} invoices={getInvoices()} bills={getBills()} />;
}