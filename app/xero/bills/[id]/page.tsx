import { XeroBillDetailRouteClient } from "@/components/xero/XeroViews";
import { getBills, getContacts } from "@/lib/data/xero";

export default async function XeroBillDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <XeroBillDetailRouteClient id={id} bills={getBills()} contacts={getContacts()} />;
}