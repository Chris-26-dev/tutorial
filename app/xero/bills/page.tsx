import { XeroBillsPage } from "@/components/xero/XeroViews";
import { getBills } from "@/lib/data/xero";

export default function XeroBillsRoute() {
  return <XeroBillsPage bills={getBills()} />;
}