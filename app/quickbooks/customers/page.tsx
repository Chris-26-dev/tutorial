import { QuickBooksCustomersPage } from "@/components/quickbooks/QuickBooksViews";
import { getCustomers } from "@/lib/data/quickbooks";

export default function QuickBooksCustomersRoute() {
  return <QuickBooksCustomersPage customers={getCustomers()} />;
}