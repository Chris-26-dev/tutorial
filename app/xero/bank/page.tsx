import { XeroBankPage } from "@/components/xero/XeroViews";
import { getBankAccounts } from "@/lib/data/xero";

export default function XeroBankRoute() {
  return <XeroBankPage accounts={getBankAccounts()} />;
}