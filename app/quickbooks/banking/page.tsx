import { QuickBooksBankingPage } from "@/components/quickbooks/QuickBooksViews";
import { getBankAccounts } from "@/lib/data/quickbooks";

export default function QuickBooksBankingRoute() {
  return <QuickBooksBankingPage accounts={getBankAccounts()} />;
}