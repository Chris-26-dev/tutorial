"use client";

import type { SimulatorComponentProps } from "../SimulatorPrimitives";
import { ActionButton, ActionSelect, SimulatorCard } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

export function QBChartOfAccounts({ activeTarget, onAction }: SimulatorComponentProps) {
  const isChartRowActive = activeTarget === "accounts-chart-row";

  return (
    <SimulatorShell platform="quickbooks" title="Accounting" activeTarget={activeTarget} onAction={onAction}>
      <div className="max-w-5xl space-y-4">
        <SimulatorCard title="Accounting center">
          <button type="button" className={isChartRowActive ? "target-highlight grid w-full grid-cols-4 rounded-md border p-3 text-left" : "sim-muted grid w-full grid-cols-4 rounded-md border p-3 text-left"} disabled={!isChartRowActive} onClick={() => onAction("accounts-chart-row", undefined, "commit")}>
            <span>Chart of accounts</span><span>Accounts list</span><span>Active</span><span>126 accounts</span>
          </button>
        </SimulatorCard>
        <SimulatorCard title="Chart of accounts">
          <div className="mb-4 flex justify-between">
            <p className="text-sm text-slate-500">Review account names, types, and detail types.</p>
            <ActionButton activeTarget={activeTarget} onAction={onAction} target="accounts-new-account">New</ActionButton>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border bg-slate-50 p-3 text-sm">Checking - Bank</div>
            <div className="rounded-md border bg-slate-50 p-3 text-sm">Accounts receivable - Other Current Asset</div>
            <ActionSelect activeTarget={activeTarget} onAction={onAction} target="accounts-detail-type" placeholder="Account type" options={[{ label: "Income", value: "income" }, { label: "Expense", value: "expense" }, { label: "Bank", value: "bank" }]} />
          </div>
        </SimulatorCard>
      </div>
    </SimulatorShell>
  );
}
