import { QuickBooksInvoicesPage } from "@/components/quickbooks/QuickBooksViews";
import { getCustomers, getInvoices } from "@/lib/data/quickbooks";

export default function QuickBooksInvoicesRoute() {
  return <QuickBooksInvoicesPage invoices={getInvoices()} customers={getCustomers()} />;
}