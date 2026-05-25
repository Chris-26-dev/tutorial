import { QuickBooksCustomerDetailRouteClient } from "@/components/quickbooks/QuickBooksViews";
import { getCustomers, getInvoices } from "@/lib/data/quickbooks";

export default async function QuickBooksCustomerDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <QuickBooksCustomerDetailRouteClient id={id} customers={getCustomers()} invoices={getInvoices()} />;
}