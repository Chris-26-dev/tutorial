"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Bell, Building2, ChevronDown, CreditCard, FileText, Home, Landmark, LayoutDashboard, Menu, Plus, Users, X } from "lucide-react";

type QuickBooksShellProps = {
  children: ReactNode;
};

const groups = [
  { label: "OVERVIEW", items: [{ label: "Dashboard", href: "/quickbooks/dashboard", icon: LayoutDashboard }] },
  { label: "MONEY IN", items: [{ label: "Invoices", href: "/quickbooks/invoices", icon: FileText }, { label: "Customers", href: "/quickbooks/customers", icon: Users }] },
  { label: "MONEY OUT", items: [{ label: "Expenses", href: "/quickbooks/expenses", icon: CreditCard }, { label: "Vendors", href: "/quickbooks/vendors", icon: Building2 }] },
  { label: "BANKING", items: [{ label: "Banking", href: "/quickbooks/banking", icon: Landmark }] },
  { label: "ACCOUNTING", items: [{ label: "Reports", href: "/quickbooks/reports", icon: BarChart2 }] }
];

function titleFromPath(pathname: string) {
  const item = groups.flatMap((group) => group.items).find((navItem) => pathname.startsWith(navItem.href));
  return item?.label ?? "QuickBooks";
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen flex-col border-r border-[#E3E8EE] bg-white">
      <Link href="/quickbooks/dashboard" className="flex h-16 items-center gap-2 border-b border-[#E3E8EE] px-4" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded bg-[#2CA01C] text-sm font-bold text-white">qb</span>
        <span className="hidden text-base font-semibold text-slate-950 lg:inline">QuickBooks</span>
      </Link>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-5">
        <Link href="/" onClick={onNavigate} className="flex h-10 items-center gap-3 rounded-r border-l-4 border-transparent px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">
          <Home className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">Home</span>
        </Link>
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 hidden px-3 text-[11px] font-semibold tracking-wider text-slate-400 lg:block">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex h-10 items-center gap-3 rounded-r px-3 text-sm font-medium transition ${active ? "border-l-4 border-[#2CA01C] bg-[#E6F4E3] text-[#155724]" : "border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function QuickBooksShell({ children }: QuickBooksShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const title = useMemo(() => titleFromPath(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-sm text-slate-800">
      <div className="hidden md:fixed md:left-0 md:top-0 md:z-30 md:block md:h-screen md:w-20 lg:w-64">
        <Sidebar />
      </div>
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/40" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />
          <div className="relative h-full w-72 shadow-xl">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="md:pl-20 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-[#2CA01C] px-4 text-white shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/30 md:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold tracking-normal">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button type="button" className="inline-flex h-9 items-center gap-2 rounded bg-white px-3 text-sm font-semibold text-[#1E7A14] hover:bg-[#E6F4E3]" onClick={() => setMenuOpen((current) => !current)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded border border-[#E3E8EE] bg-white py-1 text-slate-700 shadow-lg">
                  <Link href="/quickbooks/invoices?create=invoice" className="block px-3 py-2 text-sm hover:bg-[#E6F4E3]" onClick={() => setMenuOpen(false)}>New Invoice</Link>
                  <Link href="/quickbooks/expenses?create=expense" className="block px-3 py-2 text-sm hover:bg-[#E6F4E3]" onClick={() => setMenuOpen(false)}>New Expense</Link>
                  <Link href="/quickbooks/customers?create=customer" className="block px-3 py-2 text-sm hover:bg-[#E6F4E3]" onClick={() => setMenuOpen(false)}>New Customer</Link>
                </div>
              ) : null}
            </div>
            <Link href="/" className="hidden h-9 items-center gap-2 rounded border border-white/30 px-3 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/30 hover:bg-white/10" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#1E7A14]">QA</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}