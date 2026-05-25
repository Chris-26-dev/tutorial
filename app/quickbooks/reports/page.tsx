import { QuickBooksReportsPage } from "@/components/quickbooks/QuickBooksViews";
import { getExpenses, getInvoices, getReports } from "@/lib/data/quickbooks";

export default function QuickBooksReportsRoute() {
  return <QuickBooksReportsPage reports={getReports()} invoices={getInvoices()} expenses={getExpenses()} />;
}