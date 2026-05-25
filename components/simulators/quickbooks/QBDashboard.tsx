"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import vendorsData from "@/data/quickbooks/sample-data/vendors.json";
import { expenseFormSchema, payrollEmployeeSchema, type ExpenseFormValues, type PayrollEmployeeValues } from "@/lib/simulatorSchemas";
import type { QuickBooksVendor } from "@/types/quickbooks";
import type { SimulatorState } from "@/types/tutorial";
import { ActionButton, ActionInput, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

const vendors = vendorsData as QuickBooksVendor[];

const vendorOptions = vendors.map((vendor) => ({ label: vendor.name, value: vendor.id }));
const categoryOptions = [
  { label: "Office expenses", value: "office-expenses" },
  { label: "Utilities", value: "utilities" },
  { label: "Rent or lease", value: "rent" },
  { label: "Subscriptions", value: "subscriptions" }
];

interface QBDashboardProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function QBDashboard({ state, activeTarget, onAction }: QBDashboardProps) {
  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      payeeId: "",
      paymentAccount: "checking",
      category: "",
      amount: 215
    }
  });
  const employeeForm = useForm<PayrollEmployeeValues>({
    resolver: zodResolver(payrollEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      payRate: 32
    }
  });

  const shellTitle = state === "company-setup" ? "Company setup" : state.includes("payroll") ? "Payroll" : state.includes("expense") || state.includes("receipt") || state.includes("bill") ? "Expenses" : "Dashboard";

  return (
    <SimulatorShell platform="quickbooks" title={shellTitle} activeTarget={activeTarget} onAction={onAction}>
      {state === "company-setup" ? (
        <div className="max-w-2xl space-y-4">
          <SimulatorCard title="Tell us about your business">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Company name
                <ActionInput activeTarget={activeTarget} onAction={onAction} target="setup-company-name" placeholder="Company name" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Industry
                <ActionSelect activeTarget={activeTarget} onAction={onAction} target="setup-industry" placeholder="Choose industry" options={[{ label: "Professional services", value: "professional-services" }, { label: "Retail", value: "retail" }, { label: "Construction", value: "construction" }]} />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="setup-save">Save</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "dashboard" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <button type="button" className="text-left" disabled={activeTarget !== "dashboard-sales-card"} onClick={() => onAction("dashboard-sales-card", undefined, "commit")}>
            <SimulatorCard title="Sales" className={activeTarget === "dashboard-sales-card" ? "target-highlight" : "sim-muted"}>
              <p className="text-3xl font-semibold text-slate-950">$8,420</p>
              <p className="mt-1 text-sm text-slate-500">Open invoices and recent customer activity.</p>
            </SimulatorCard>
          </button>
          <button type="button" className="text-left" disabled={activeTarget !== "dashboard-bank-card"} onClick={() => onAction("dashboard-bank-card", undefined, "commit")}>
            <SimulatorCard title="Banking" className={activeTarget === "dashboard-bank-card" ? "target-highlight" : "sim-muted"}>
              <p className="text-3xl font-semibold text-slate-950">14</p>
              <p className="mt-1 text-sm text-slate-500">Transactions waiting for review.</p>
            </SimulatorCard>
          </button>
          <SimulatorCard title="Tasks">
            <div className="space-y-2 text-sm text-slate-600">
              <p>Review receipts</p>
              <p>Reconcile checking</p>
              <p>Run monthly reports</p>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "new-menu-open" ? (
        <div className="grid max-w-3xl gap-4 md:grid-cols-2">
          <SimulatorCard title="Customers">
            <div className="space-y-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="menu-invoice" className="w-full justify-start">Invoice</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="menu-credit-memo" className="w-full justify-start" variant="outline">Credit memo</ActionButton>
            </div>
          </SimulatorCard>
          <SimulatorCard title="Vendors">
            <div className="space-y-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="expense-new" className="w-full justify-start" variant="outline">Expense</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-create" className="w-full justify-start" variant="outline">Bill</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "expense-form" ? (
        <form className="max-w-3xl space-y-4" onSubmit={expenseForm.handleSubmit(() => onAction("expense-save", undefined, "commit"))}>
          <SimulatorCard title="Expense">
            <div className="mb-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="expense-new">Expense</ActionButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller control={expenseForm.control} name="payeeId" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Payee<ActionSelect activeTarget={activeTarget} onAction={onAction} target="expense-payee" placeholder="Choose payee" options={vendorOptions} value={field.value} onValueChange={field.onChange} /></label>} />
              <Controller control={expenseForm.control} name="category" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Category<ActionSelect activeTarget={activeTarget} onAction={onAction} target="expense-category" placeholder="Choose category" options={categoryOptions} value={field.value} onValueChange={field.onChange} /></label>} />
            </div>
            <div className="mt-5 flex justify-between">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="receipt-upload-button" variant="outline">Upload receipt</ActionButton>
              <button type="submit" className={activeTarget === "expense-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "expense-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#2CA01C] px-4 text-sm font-medium text-white">Save</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "receipt-upload" ? (
        <div className="max-w-3xl space-y-4">
          <SimulatorCard title="Receipts">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <button type="button" className={activeTarget === "receipt-upload-button" ? "target-highlight rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center" : "sim-muted rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center"} disabled={activeTarget !== "receipt-upload-button"} onClick={() => onAction("receipt-upload-button", undefined, "commit")}>
                Upload receipt image
              </button>
              <div className="space-y-3">
                <ActionSelect activeTarget={activeTarget} onAction={onAction} target="receipt-vendor-field" placeholder="Detected vendor" options={vendorOptions} />
                <ActionButton activeTarget={activeTarget} onAction={onAction} target="receipt-add" className="w-full">Add</ActionButton>
              </div>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "expense-categorization" ? (
        <div className="max-w-4xl space-y-4">
          <SimulatorCard title="For review">
            <button type="button" className={activeTarget === "bank-transaction-row" ? "target-highlight grid w-full grid-cols-4 rounded-md border p-3 text-left" : "sim-muted grid w-full grid-cols-4 rounded-md border p-3 text-left"} disabled={activeTarget !== "bank-transaction-row"} onClick={() => onAction("bank-transaction-row", undefined, "commit")}>
              <span>May 3</span><span>Office Supply Co</span><span>-$215.00</span><span>Uncategorized</span>
            </button>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <ActionSelect activeTarget={activeTarget} onAction={onAction} target="transaction-category" placeholder="Category" options={categoryOptions} />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="transaction-add">Add</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "bill-payment" ? (
        <div className="max-w-4xl space-y-4">
          <SimulatorCard title="Vendor bill">
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-create" variant="outline">Create bill</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-due-date" variant="outline">Due this month</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-pay">Schedule payment</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "payroll-employee" ? (
        <form className="max-w-3xl" onSubmit={employeeForm.handleSubmit(() => onAction("employee-save", undefined, "commit"))}>
          <SimulatorCard title="Employee profile">
            <div className="mb-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="employee-add">Add employee</ActionButton>
            </div>
            <Controller control={employeeForm.control} name="firstName" render={({ field }) => <ActionInput activeTarget={activeTarget} onAction={(target, value, phase) => { field.onChange(value?.split(" ")[0] ?? ""); employeeForm.setValue("lastName", value?.split(" ").slice(1).join(" ") ?? ""); onAction(target, value, phase); }} target="employee-name" placeholder="Employee name" value={`${field.value}${employeeForm.watch("lastName") ? ` ${employeeForm.watch("lastName")}` : ""}`} onValueChange={(value) => field.onChange(value)} />} />
            <div className="mt-5 flex justify-end">
              <button type="submit" className={activeTarget === "employee-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "employee-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#2CA01C] px-4 text-sm font-medium text-white">Save employee</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "payroll-run" ? (
        <div className="max-w-4xl space-y-4">
          <SimulatorCard title="Run payroll">
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="payroll-run">Run payroll</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="payroll-preview" variant="outline">Preview payroll</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="payroll-submit">Submit payroll</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "payroll-taxes" ? (
        <div className="max-w-4xl space-y-4">
          <SimulatorCard title="Payroll tax center">
            <div className="space-y-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="tax-center">Payroll tax center</ActionButton>
              <button type="button" className={activeTarget === "tax-liability-row" ? "target-highlight grid w-full grid-cols-3 rounded-md border p-3 text-left" : "sim-muted grid w-full grid-cols-3 rounded-md border p-3 text-left"} disabled={activeTarget !== "tax-liability-row"} onClick={() => onAction("tax-liability-row", undefined, "commit")}>
                <span>Federal withholding</span><span>$842.00</span><span>Due May 15</span>
              </button>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="tax-mark-reviewed">Mark reviewed</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}
    </SimulatorShell>
  );
}
