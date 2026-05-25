import { notFound } from "next/navigation";
import { QuickBooksBankAccountDetail } from "@/components/quickbooks/QuickBooksViews";
import { getBankAccounts, getTransactions } from "@/lib/data/quickbooks";

export default async function QuickBooksBankAccountDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = getBankAccounts().find((item) => item.id === id);
  if (!account) {
    notFound();
  }
  return <QuickBooksBankAccountDetail account={account} transactions={getTransactions(account.id)} />;
}