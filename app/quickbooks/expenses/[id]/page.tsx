import { QuickBooksExpenseDetailRouteClient } from "@/components/quickbooks/QuickBooksViews";
import { getExpenses } from "@/lib/data/quickbooks";

export default async function QuickBooksExpenseDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <QuickBooksExpenseDetailRouteClient id={id} expenses={getExpenses()} />;
}