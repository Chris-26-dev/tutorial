import { XeroContactsPage } from "@/components/xero/XeroViews";
import { getContacts } from "@/lib/data/xero";

export default function XeroContactsRoute() {
  return <XeroContactsPage contacts={getContacts()} />;
}