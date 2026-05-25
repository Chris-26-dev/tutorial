import { notFound } from "next/navigation";
import { QuickBooksVendorDetail } from "@/components/quickbooks/QuickBooksViews";
import { getExpenses, getVendorById } from "@/lib/data/quickbooks";

export default async function QuickBooksVendorDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = getVendorById(id);
  if (!vendor) {
    notFound();
  }
  return <QuickBooksVendorDetail vendor={vendor} expenses={getExpenses({ vendorId: vendor.id })} />;
}