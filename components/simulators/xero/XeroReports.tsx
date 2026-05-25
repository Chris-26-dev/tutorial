"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { reportFilterSchema, type ReportFilterValues } from "@/lib/simulatorSchemas";
import type { SimulatorState } from "@/types/tutorial";
import { ActionButton, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

interface XeroReportsProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function XeroReports({ state, activeTarget, onAction }: XeroReportsProps) {
  const reportForm = useForm<ReportFilterValues>({
    resolver: zodResolver(reportFilterSchema),
    defaultValues: {
      reportPeriod: "",
      accountingBasis: "accrual"
    }
  });

  return (
    <SimulatorShell platform="xero" title="Reports" activeTarget={activeTarget} onAction={onAction}>
      {state === "reports-list" ? (
        <div className="grid max-w-5xl gap-4 md:grid-cols-2">
          <SimulatorCard title="Accounting reports">
            <div className="space-y-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reports-profit-loss" className="w-full justify-start" variant="outline">Profit and Loss</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reports-balance-sheet" className="w-full justify-start" variant="outline">Balance Sheet</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reports-aged-receivables" className="w-full justify-start" variant="outline">Aged Receivables Summary</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="budget-manager" className="w-full justify-start" variant="outline">Budget Manager</ActionButton>
            </div>
          </SimulatorCard>
          <SimulatorCard title="Report center">
            <p className="text-sm text-slate-500">Reports use periods and layouts to focus financial review.</p>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "report-detail" ? (
        <form className="max-w-5xl space-y-4" onSubmit={reportForm.handleSubmit(() => onAction("report-run", undefined, "commit"))}>
          <SimulatorCard title="Report settings">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
              <Controller control={reportForm.control} name="reportPeriod" render={({ field }) => <ActionSelect activeTarget={activeTarget} onAction={onAction} target="report-period" placeholder="Report period" options={[{ label: "This fiscal year", value: "this-fiscal-year" }, { label: "This month", value: "this-month" }, { label: "Last month", value: "last-month" }]} value={field.value} onValueChange={field.onChange} />} />
              <button type="submit" className={activeTarget === "report-run" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "report-run"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#00B4D8] px-4 text-sm font-medium text-white">Update</span>
              </button>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="report-export" variant="outline">Export</ActionButton>
            </div>
          </SimulatorCard>
          <SimulatorCard title="Report detail">
            <div className="space-y-2 text-sm">
              <button type="button" className={activeTarget === "aging-contact-row" ? "target-highlight flex w-full justify-between rounded-md border p-3" : "sim-muted flex w-full justify-between rounded-md border p-3"} disabled={activeTarget !== "aging-contact-row"} onClick={() => onAction("aging-contact-row", undefined, "commit")}><span>Atlas Labs</span><span>$1,480 outstanding</span></button>
              <div className="flex justify-between rounded-md border p-3"><span>Total income</span><span>$18,940</span></div>
              <div className="flex justify-between rounded-md border p-3"><span>Total expenses</span><span>$10,420</span></div>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "report-customize" ? (
        <div className="max-w-5xl space-y-4">
          <SimulatorCard title="Budget Manager">
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="budget-manager">Budget Manager</ActionButton>
              <ActionSelect activeTarget={activeTarget} onAction={onAction} target="budget-period" placeholder="Budget period" options={[{ label: "This fiscal year", value: "this-fiscal-year" }, { label: "Next fiscal year", value: "next-fiscal-year" }]} />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="budget-save">Save budget</ActionButton>
            </div>
            <div className="mt-4 grid grid-cols-4 rounded-md border text-sm">
              <div className="border-r bg-slate-50 p-3 font-medium">Account</div>
              <div className="border-r bg-slate-50 p-3 font-medium">Q1</div>
              <div className="border-r bg-slate-50 p-3 font-medium">Q2</div>
              <div className="bg-slate-50 p-3 font-medium">Q3</div>
              <div className="border-r p-3">Sales</div><div className="border-r p-3">$12,000</div><div className="border-r p-3">$13,500</div><div className="p-3">$14,000</div>
            </div>
          </SimulatorCard>
        </div>
      ) : null}
    </SimulatorShell>
  );
}
