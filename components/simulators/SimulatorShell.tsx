"use client";

import { Bell, Building2, ChevronDown, CircleHelp, Home, Landmark, Receipt, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlatformId } from "@/types/tutorial";
import { targetClass, type SimulatorShellProps } from "./SimulatorPrimitives";

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Sales", icon: Receipt },
  { label: "Banking", icon: Landmark },
  { label: "Payroll", icon: Users },
  { label: "Reports", icon: Building2 }
];

const productChrome: Record<PlatformId, { name: string; sidebar: string; accent: string; surface: string }> = {
  quickbooks: {
    name: "QuickBooks",
    sidebar: "#2B3A52",
    accent: "#2CA01C",
    surface: "#F4F5F7"
  },
  xero: {
    name: "Xero",
    sidebar: "#1C2B4A",
    accent: "#00B4D8",
    surface: "#F5F6FA"
  }
};

export function SimulatorShell({ platform, title, activeTarget, onAction, children }: SimulatorShellProps) {
  const chrome = productChrome[platform];
  const businessTarget = activeTarget === "dashboard-business-menu" ? "dashboard-business-menu" : "business-menu";
  const isNewButtonActive = activeTarget === "new-button";
  const isBusinessMenuActive = activeTarget === businessTarget;
  const isSettingsActive = activeTarget === "dashboard-settings";

  return (
    <div className="h-full min-h-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid h-full grid-cols-[190px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 p-4 text-white" style={{ backgroundColor: chrome.sidebar }}>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15">{platform === "quickbooks" ? "qb" : "xe"}</div>
            <span>{chrome.name}</span>
          </div>
          {platform === "quickbooks" ? (
            <Button
              type="button"
              className={cn("w-full justify-start bg-[#2CA01C] text-white hover:bg-[#238316]", targetClass(activeTarget, "new-button"))}
              disabled={!isNewButtonActive}
              onClick={() => onAction("new-button", undefined, "commit")}
            >
              + New
            </Button>
          ) : null}
          <nav className="space-y-1 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const target = item.label === "Reports" ? "reports-nav" : item.label === "Banking" ? "banking-nav" : item.label === "Dashboard" ? "dashboard-nav" : "nav-placeholder";
              const isTargetActive = activeTarget === target;

              return (
                <button
                  type="button"
                  key={item.label}
                  className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-white/82 hover:bg-white/10 disabled:pointer-events-none", isTargetActive ? "target-highlight bg-white/10" : "sim-muted")}
                  disabled={!isTargetActive}
                  onClick={() => onAction(target, undefined, "commit")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-col" style={{ backgroundColor: chrome.surface }}>
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-slate-500">Sample company</p>
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {platform === "xero" ? (
                <button
                  type="button"
                  className={cn("flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100", targetClass(activeTarget, businessTarget))}
                  disabled={!isBusinessMenuActive}
                  onClick={() => onAction(businessTarget, undefined, "commit")}
                >
                  Business <ChevronDown className="h-4 w-4" />
                </button>
              ) : null}
              <Button type="button" variant="ghost" size="icon" className={targetClass(activeTarget, "dashboard-settings")} disabled={!isSettingsActive} onClick={() => onAction("dashboard-settings", undefined, "commit")} aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Help">
                <CircleHelp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-auto p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
