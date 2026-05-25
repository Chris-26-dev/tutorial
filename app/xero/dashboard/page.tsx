import { XeroDashboard } from "@/components/xero/XeroViews";
import { getBankAccounts, getBills, getCashflow, getInvoices, getTransactions } from "@/lib/data/xero";

export default function XeroDashboardPage() {
  return <XeroDashboard invoices={getInvoices()} bills={getBills()} accounts={getBankAccounts()} transactions={getTransactions()} cashflow={getCashflow()} />;
}