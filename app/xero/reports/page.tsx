import { XeroReportsPage } from "@/components/xero/XeroViews";
import { getBills, getInvoices, getReports } from "@/lib/data/xero";

export default function XeroReportsRoute() {
  return <XeroReportsPage reports={getReports()} invoices={getInvoices()} bills={getBills()} />;
}