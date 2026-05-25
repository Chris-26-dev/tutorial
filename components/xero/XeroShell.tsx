"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Bell, ChevronDown, FileText, Home, Landmark, LayoutDashboard, Menu, Plus, Receipt, Users, X } from "lucide-react";

type XeroShellProps = {
  children: ReactNode;
};

const groups = [
  { label: "", items: [{ label: "Dashboard", href: "/xero/dashboard", icon: LayoutDashboard }] },
  { label: "ACCOUNTING", items: [{ label: "Invoices", href: "/xero/invoices", icon: FileText }, { label: "Bills to Pay", href: "/xero/bills", icon: Receipt }, { label: "Bank Accounts", href: "/xero/bank", icon: Landmark }] },
  { label: "CONTACTS", items: [{ label: "Contacts", href: "/xero/contacts", icon: Users }] },
  { label: "REPORTS", items: [{ label: "Reports", href: "/xero/reports", icon: BarChart2 }] }
];

function crumbsFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean).slice(1);
  if (segments.length === 0) {
    return ["Dashboard"];
  }
  return segments.map((segment) => segment.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen flex-col bg-[#1C1C44] text-[#9BA3C1]">
      <Link href="/xero/dashboard" className="flex h-16 items-center gap-2 border-b border-white/10 px-4 text-white" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#13B5EA] text-sm font-bold">x</span>
        <span className="hidden text-base font-semibold lg:inline">Xero</span>
      </Link>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        <Link href="/" onClick={onNavigate} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#9BA3C1] transition hover:bg-white/10 hover:text-white">
          <Home className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">Home</span>
        </Link>
        {groups.map((group) => (
          <div key={group.label || "main"}>
            {group.label ? <p className="mb-2 hidden px-3 text-[11px] font-semibold tracking-wider text-[#6E769B] lg:block">{group.label}</p> : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${active ? "bg-[#13B5EA] text-white" : "text-[#9BA3C1] hover:bg-white/10 hover:text-white"}`}
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

export function XeroShell({ children }: XeroShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const crumbs = useMemo(() => crumbsFromPath(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-sm text-slate-800">
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 md:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <nav className="flex min-w-0 items-center gap-1 truncate text-sm text-slate-500">
              <Link href="/xero/dashboard" className="shrink-0 hover:text-slate-950">Xero</Link>
              {crumbs.map((crumb, index) => (
                <span key={`${crumb}-${index}`} className="inline-flex min-w-0 items-center gap-1">
                  <span>/</span>
                  <span className={index === crumbs.length - 1 ? "truncate font-semibold text-slate-950" : "truncate"}>{crumb}</span>
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#13B5EA] px-3 text-sm font-semibold text-white hover:bg-[#0E9FD4]" onClick={() => setMenuOpen((current) => !current)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-slate-700 shadow-lg">
                  <Link href="/xero/invoices?create=invoice" className="block px-3 py-2 text-sm hover:bg-sky-50" onClick={() => setMenuOpen(false)}>New Invoice</Link>
                  <Link href="/xero/bills?create=bill" className="block px-3 py-2 text-sm hover:bg-sky-50" onClick={() => setMenuOpen(false)}>New Bill</Link>
                  <Link href="/xero/contacts?create=contact" className="block px-3 py-2 text-sm hover:bg-sky-50" onClick={() => setMenuOpen(false)}>New Contact</Link>
                </div>
              ) : null}
            </div>
            <Link href="/" className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1C44] text-sm font-semibold text-white">XE</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}