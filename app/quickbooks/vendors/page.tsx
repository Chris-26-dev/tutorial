import { QuickBooksVendorsPage } from "@/components/quickbooks/QuickBooksViews";
import { getVendors } from "@/lib/data/quickbooks";

export default function QuickBooksVendorsRoute() {
  return <QuickBooksVendorsPage vendors={getVendors()} />;
}