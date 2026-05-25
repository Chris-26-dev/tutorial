import { QuickBooksDashboard } from "@/components/quickbooks/QuickBooksViews";
import { getCashflow, getExpenses, getInvoices, getReports, getTransactions } from "@/lib/data/quickbooks";

export default function QuickBooksDashboardPage() {
  return <QuickBooksDashboard invoices={getInvoices()} expenses={getExpenses()} transactions={getTransactions()} cashflow={getCashflow()} reports={getReports()} />;
}