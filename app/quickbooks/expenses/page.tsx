import { QuickBooksExpensesPage } from "@/components/quickbooks/QuickBooksViews";
import { getExpenses } from "@/lib/data/quickbooks";

export default function QuickBooksExpensesRoute() {
  return <QuickBooksExpensesPage expenses={getExpenses()} />;
}