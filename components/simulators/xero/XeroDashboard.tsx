"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import contactsData from "@/data/xero/sample-data/contacts.json";
import { expenseFormSchema, payrollEmployeeSchema, type ExpenseFormValues, type PayrollEmployeeValues } from "@/lib/simulatorSchemas";
import type { XeroContact } from "@/types/xero";
import type { SimulatorState } from "@/types/tutorial";
import { ActionButton, ActionInput, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

const contacts = contactsData as XeroContact[];
const supplierOptions = contacts.filter((contact) => contact.type === "supplier").map((contact) => ({ label: contact.name, value: contact.id }));
const employeeOptions = contacts.filter((contact) => contact.type === "employee").map((contact) => ({ label: contact.name, value: contact.id }));
const accountOptions = [
  { label: "Office expenses", value: "office-expenses" },
  { label: "Subscriptions", value: "subscriptions" },
  { label: "Travel", value: "travel" }
];
const bankOptions = [{ label: "Business Bank", value: "business-bank" }];

interface XeroDashboardProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function XeroDashboard({ state, activeTarget, onAction }: XeroDashboardProps) {
  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      payeeId: "",
      paymentAccount: "business-bank",
      category: "",
      amount: 310
    }
  });
  const employeeForm = useForm<PayrollEmployeeValues>({
    resolver: zodResolver(payrollEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      payRate: 34
    }
  });
  const shellTitle = state === "company-setup" ? "Organisation setup" : state.includes("payroll") || state === "leave-management" ? "Payroll" : state.includes("expense") || state.includes("bill") ? "Business" : "Dashboard";

  return (
    <SimulatorShell platform="xero" title={shellTitle} activeTarget={activeTarget} onAction={onAction}>
      {state === "company-setup" ? (
        <div className="max-w-2xl space-y-4">
          <SimulatorCard title="Organisation details">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Organisation name
                <ActionInput activeTarget={activeTarget} onAction={onAction} target="organisation-name" placeholder="Organisation name" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Timezone
                <ActionSelect activeTarget={activeTarget} onAction={onAction} target="organisation-timezone" placeholder="Choose timezone" options={[{ label: "America/New York", value: "america-new-york" }, { label: "Europe/London", value: "europe-london" }, { label: "Australia/Sydney", value: "australia-sydney" }]} />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="organisation-save">Save organisation</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "dashboard" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <button type="button" className="text-left" disabled={activeTarget !== "dashboard-account-watchlist"} onClick={() => onAction("dashboard-account-watchlist", undefined, "commit")}>
            <SimulatorCard title="Account watchlist" className={activeTarget === "dashboard-account-watchlist" ? "target-highlight" : "sim-muted"}>
              <p className="text-3xl font-semibold text-slate-950">$24,900</p>
              <p className="mt-1 text-sm text-slate-500">Key account balances this month.</p>
            </SimulatorCard>
          </button>
          <button type="button" className="text-left" disabled={activeTarget !== "dashboard-bank-account"} onClick={() => onAction("dashboard-bank-account", undefined, "commit")}>
            <SimulatorCard title="Business Bank" className={activeTarget === "dashboard-bank-account" ? "target-highlight" : "sim-muted"}>
              <p className="text-3xl font-semibold text-slate-950">7</p>
              <p className="mt-1 text-sm text-slate-500">Statement lines waiting to reconcile.</p>
            </SimulatorCard>
          </button>
          <div className="text-left">
            <SimulatorCard title="Business menu" className="sim-muted">
              <p className="text-sm text-slate-500">Invoices, bills, expense claims, and products.</p>
            </SimulatorCard>
          </div>
        </div>
      ) : null}

      {state === "new-menu-open" ? (
        <div className="grid max-w-3xl gap-4 md:grid-cols-2">
          <SimulatorCard title="Business">
            <div className="space-y-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="menu-invoices" className="w-full justify-start">Invoices</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="menu-credit-note" className="w-full justify-start" variant="outline">Credit note</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-create" className="w-full justify-start" variant="outline">Bills to pay</ActionButton>
            </div>
          </SimulatorCard>
          <SimulatorCard title="Shortcuts">
            <p className="text-sm text-slate-500">Business workflows are grouped around sales, purchases, and products.</p>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "expense-form" ? (
        <form className="max-w-4xl" onSubmit={expenseForm.handleSubmit(() => onAction("expense-save", undefined, "commit"))}>
          <SimulatorCard title="Expenses">
            <div className="mb-4 flex flex-wrap gap-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="claim-new" variant="outline">New expense claim</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="expense-new" variant="outline">Spend money</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="receipt-upload-button" variant="outline">Upload receipt</ActionButton>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Controller control={expenseForm.control} name="payeeId" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Payee<ActionSelect activeTarget={activeTarget} onAction={onAction} target="expense-payee" placeholder="Choose payee" options={supplierOptions} value={field.value} onValueChange={field.onChange} /></label>} />
              <label className="space-y-2 text-sm font-medium text-slate-700">Claimant<ActionSelect activeTarget={activeTarget} onAction={onAction} target="claim-employee" placeholder="Choose claimant" options={employeeOptions} /></label>
              <Controller control={expenseForm.control} name="category" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Account<ActionSelect activeTarget={activeTarget} onAction={onAction} target="expense-category" placeholder="Choose account" options={accountOptions} value={field.value} onValueChange={field.onChange} /></label>} />
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="claim-submit">Submit claim</ActionButton>
              <button type="submit" className={activeTarget === "expense-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "expense-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#00B4D8] px-4 text-sm font-medium text-white">Save transaction</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "bill-payment" ? (
        <div className="max-w-5xl space-y-4">
          <SimulatorCard title="Bills to pay">
            <div className="mb-4 grid gap-4 md:grid-cols-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-create">New bill</ActionButton>
              <ActionSelect activeTarget={activeTarget} onAction={onAction} target="expense-payee" placeholder="Supplier" options={supplierOptions} />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-due-date" variant="outline">Due date</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bill-pay">Approve</ActionButton>
            </div>
            <button type="button" className={activeTarget === "batch-select-bills" ? "target-highlight grid w-full grid-cols-3 rounded-md border p-3 text-left" : "sim-muted grid w-full grid-cols-3 rounded-md border p-3 text-left"} disabled={activeTarget !== "batch-select-bills"} onClick={() => onAction("batch-select-bills", undefined, "commit")}>
              <span>Bright Office Supplies</span><span>$310.00</span><span>Awaiting payment</span>
            </button>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
              <ActionSelect activeTarget={activeTarget} onAction={onAction} target="batch-payment-account" placeholder="Payment account" options={bankOptions} />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="batch-pay">Make payment</ActionButton>
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
                <span className="inline-flex h-10 items-center rounded-md bg-[#00B4D8] px-4 text-sm font-medium text-white">Save employee</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "payroll-run" ? (
        <div className="max-w-4xl">
          <SimulatorCard title="Pay runs">
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="payroll-run">New pay run</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="payroll-preview" variant="outline">Preview pay run</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="payroll-submit">Post pay run</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "leave-management" ? (
        <div className="max-w-4xl space-y-4">
          <SimulatorCard title="Leave requests">
            <button type="button" className={activeTarget === "leave-request-row" ? "target-highlight grid w-full grid-cols-3 rounded-md border p-3 text-left" : "sim-muted grid w-full grid-cols-3 rounded-md border p-3 text-left"} disabled={activeTarget !== "leave-request-row"} onClick={() => onAction("leave-request-row", undefined, "commit")}>
              <span>Morgan Lee</span><span>May 20-22</span><span>Awaiting approval</span>
            </button>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="leave-calendar" variant="outline">Leave calendar</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="leave-approve">Approve leave</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}
    </SimulatorShell>
  );
}
