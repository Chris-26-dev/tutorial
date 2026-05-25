"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import customersData from "@/data/quickbooks/sample-data/customers.json";
import invoicesData from "@/data/quickbooks/sample-data/invoices.json";
import { invoiceFormSchema, paymentFormSchema, type InvoiceFormValues, type PaymentFormValues } from "@/lib/simulatorSchemas";
import type { QuickBooksCustomer, QuickBooksInvoice } from "@/types/quickbooks";
import type { SimulatorState } from "@/types/tutorial";
import { ActionButton, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

const customers = customersData as QuickBooksCustomer[];
const invoices = invoicesData as QuickBooksInvoice[];
const customerOptions = customers.map((customer) => ({ label: customer.name, value: customer.id }));
const invoiceOptions = invoices.map((invoice) => ({ label: `${invoice.id} - $${invoice.total.toLocaleString()}`, value: invoice.id }));
const accountOptions = [
  { label: "Checking", value: "checking" },
  { label: "Undeposited Funds", value: "undeposited-funds" }
];

interface QBInvoiceFormProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function QBInvoiceForm({ state, activeTarget, onAction }: QBInvoiceFormProps) {
  const invoiceForm = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: "",
      invoiceNumber: "1004",
      lineItem: "Consulting services",
      amount: 1240
    }
  });
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: "",
      paymentAccount: "",
      amount: 680
    }
  });

  return (
    <SimulatorShell platform="quickbooks" title="Sales" activeTarget={activeTarget} onAction={onAction}>
      {state === "invoice-form" ? (
        <form className="max-w-5xl space-y-4" onSubmit={invoiceForm.handleSubmit(() => onAction("invoice-save", undefined, "commit"))}>
          <SimulatorCard title="Invoice">
            <div className="grid gap-4 md:grid-cols-3">
              <Controller control={invoiceForm.control} name="customerId" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Customer<ActionSelect activeTarget={activeTarget} onAction={onAction} target="customer-select" placeholder="Choose customer" options={customerOptions} value={field.value} onValueChange={field.onChange} /></label>} />
              <div className="space-y-2 text-sm font-medium text-slate-700">
                Invoice no.
                <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">1004</div>
              </div>
              <div className="space-y-2 text-sm font-medium text-slate-700">
                Due date
                <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">05/31/2026</div>
              </div>
            </div>
            <div className="mt-5 rounded-md border">
              <div className="grid grid-cols-[1fr_120px] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-normal text-slate-500">
                <span>Product or service</span>
                <span>Amount</span>
              </div>
              <div className="grid grid-cols-[1fr_120px] px-3 py-3 text-sm">
                <span>Consulting services</span>
                <span>$1,240.00</span>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" className={activeTarget === "invoice-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "invoice-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#2CA01C] px-4 text-sm font-medium text-white">Save</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "invoice-review" ? (
        <div className="max-w-5xl space-y-4">
          <SimulatorCard title="Invoices">
            <button type="button" className={activeTarget === "invoice-row" ? "target-highlight grid w-full grid-cols-4 rounded-md border p-3 text-left" : "sim-muted grid w-full grid-cols-4 rounded-md border p-3 text-left"} disabled={activeTarget !== "invoice-row"} onClick={() => onAction("invoice-row", undefined, "commit")}>
              <span>Acme Corp</span><span>qb-inv-1001</span><span>$1,240.00</span><span>Draft</span>
            </button>
          </SimulatorCard>
          <SimulatorCard title="Invoice actions">
            <div className="flex flex-wrap gap-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="invoice-send">Review and send</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="invoice-approve" variant="outline">Approve</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="receive-payment" variant="outline">Receive payment</ActionButton>
            </div>
            <button type="button" onClick={() => onAction("email-preview", undefined, "commit")} className={activeTarget === "email-preview" ? "target-highlight mt-4 w-full rounded-md border bg-slate-50 p-4 text-left" : "sim-muted mt-4 w-full rounded-md border bg-slate-50 p-4 text-left"} disabled={activeTarget !== "email-preview"}>
              <p className="text-sm font-semibold text-slate-800">Email preview</p>
              <p className="mt-1 text-sm text-slate-500">Hi Acme Corp, your invoice for $1,240.00 is ready.</p>
            </button>
            <div className="mt-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="send-confirm">Send invoice</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "payment-form" ? (
        <form className="max-w-4xl" onSubmit={paymentForm.handleSubmit(() => onAction("payment-save", undefined, "commit"))}>
          <SimulatorCard title="Receive payment">
            <div className="mb-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="receive-payment">Receive payment</ActionButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller control={paymentForm.control} name="invoiceId" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Invoice<ActionSelect activeTarget={activeTarget} onAction={onAction} target="payment-invoice" placeholder="Choose invoice" options={invoiceOptions} value={field.value} onValueChange={field.onChange} /></label>} />
              <Controller control={paymentForm.control} name="paymentAccount" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Deposit to<ActionSelect activeTarget={activeTarget} onAction={onAction} target="payment-account" placeholder="Choose account" options={accountOptions} value={field.value} onValueChange={field.onChange} /></label>} />
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" className={activeTarget === "payment-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "payment-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#2CA01C] px-4 text-sm font-medium text-white">Save and close</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "credit-memo-form" ? (
        <div className="max-w-4xl">
          <SimulatorCard title="Credit memo">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Customer
                <ActionSelect activeTarget={activeTarget} onAction={onAction} target="credit-customer" placeholder="Choose customer" options={customerOptions} />
              </label>
              <div className="space-y-2 text-sm font-medium text-slate-700">
                Credit amount
                <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">$125.00</div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="credit-save">Save</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}
    </SimulatorShell>
  );
}
