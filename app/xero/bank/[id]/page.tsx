import { notFound } from "next/navigation";
import { XeroBankAccountDetail } from "@/components/xero/XeroViews";
import { getBankAccounts, getTransactions } from "@/lib/data/xero";

export default async function XeroBankAccountDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = getBankAccounts().find((item) => item.id === id);
  if (!account) {
    notFound();
  }
  return <XeroBankAccountDetail account={account} transactions={getTransactions(account.id)} />;
}