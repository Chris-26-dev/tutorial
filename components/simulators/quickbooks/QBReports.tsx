"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { reportFilterSchema, type ReportFilterValues } from "@/lib/simulatorSchemas";
import type { SimulatorState } from "@/types/tutorial";
import { ActionButton, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

interface QBReportsProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function QBReports({ state, activeTarget, onAction }: QBReportsProps) {
  const reportForm = useForm<ReportFilterValues>({
    resolver: zodResolver(reportFilterSchema),
    defaultValues: {
      reportPeriod: "",
      accountingBasis: "accrual"
    }
  });

  return (
    <SimulatorShell platform="quickbooks" title="Reports" activeTarget={activeTarget} onAction={onAction}>
      {state === "reports-list" ? (
        <div className="grid max-w-5xl gap-4 md:grid-cols-2">
          <SimulatorCard title="Favorites">
            <div className="space-y-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reports-profit-loss" className="w-full justify-start" variant="outline">Profit & Loss</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reports-balance-sheet" className="w-full justify-start" variant="outline">Balance Sheet</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reports-cash-flow" className="w-full justify-start" variant="outline">Statement of Cash Flows</ActionButton>
            </div>
          </SimulatorCard>
          <SimulatorCard title="Report tips">
            <p className="text-sm text-slate-500">Use periods, basis, and columns to tune reports for the question you are answering.</p>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "report-detail" ? (
        <form className="max-w-5xl space-y-4" onSubmit={reportForm.handleSubmit(() => onAction("report-run", undefined, "commit"))}>
          <SimulatorCard title="Report filters">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
              <Controller control={reportForm.control} name="reportPeriod" render={({ field }) => <ActionSelect activeTarget={activeTarget} onAction={onAction} target="report-period" placeholder="Report period" options={[{ label: "This fiscal year", value: "this-fiscal-year" }, { label: "This month", value: "this-month" }, { label: "Last month", value: "last-month" }]} value={field.value} onValueChange={field.onChange} />} />
              <button type="submit" className={activeTarget === "report-run" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "report-run"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#2CA01C] px-4 text-sm font-medium text-white">Run report</span>
              </button>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="report-export" variant="outline">Export</ActionButton>
            </div>
          </SimulatorCard>
          <SimulatorCard title="Report detail">
            <div className="space-y-2 text-sm">
              <button type="button" className={activeTarget === "cash-flow-operating" ? "target-highlight flex w-full justify-between rounded-md border p-3" : "sim-muted flex w-full justify-between rounded-md border p-3"} disabled={activeTarget !== "cash-flow-operating"} onClick={() => onAction("cash-flow-operating", undefined, "commit")}><span>Operating activities</span><span>$6,820</span></button>
              <div className="flex justify-between rounded-md border p-3"><span>Income</span><span>$18,600</span></div>
              <div className="flex justify-between rounded-md border p-3"><span>Expenses</span><span>$11,780</span></div>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "report-customize" ? (
        <div className="max-w-5xl space-y-4">
          <SimulatorCard title="Customize report">
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="report-customize">Customize</ActionButton>
              <ActionSelect activeTarget={activeTarget} onAction={onAction} target="report-columns" placeholder="Display columns by" options={[{ label: "Customers", value: "customers" }, { label: "Months", value: "months" }, { label: "Classes", value: "classes" }]} />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="report-apply">Run report</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}
    </SimulatorShell>
  );
}
