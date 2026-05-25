import { QuickBooksInvoiceDetailRouteClient } from "@/components/quickbooks/QuickBooksViews";
import { getCustomers, getInvoices } from "@/lib/data/quickbooks";

export default async function QuickBooksInvoiceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <QuickBooksInvoiceDetailRouteClient id={id} invoices={getInvoices()} customers={getCustomers()} />;
}