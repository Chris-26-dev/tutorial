import { ReactNode } from "react";
import { QuickBooksShell } from "@/components/quickbooks/QuickBooksShell";

export default function QuickBooksLayout({ children }: { children: ReactNode }) {
  return <QuickBooksShell>{children}</QuickBooksShell>;
}