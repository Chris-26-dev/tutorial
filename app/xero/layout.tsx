import { ReactNode } from "react";
import { XeroShell } from "@/components/xero/XeroShell";

export default function XeroLayout({ children }: { children: ReactNode }) {
  return <XeroShell>{children}</XeroShell>;
}