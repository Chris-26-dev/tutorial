import { XeroInvoicesPage } from "@/components/xero/XeroViews";
import { getContacts, getInvoices } from "@/lib/data/xero";

export default function XeroInvoicesRoute() {
  return <XeroInvoicesPage invoices={getInvoices()} contacts={getContacts()} />;
}