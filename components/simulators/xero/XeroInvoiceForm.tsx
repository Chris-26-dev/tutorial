"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import contactsData from "@/data/xero/sample-data/contacts.json";
import invoicesData from "@/data/xero/sample-data/invoices.json";
import { invoiceFormSchema, paymentFormSchema, type InvoiceFormValues, type PaymentFormValues } from "@/lib/simulatorSchemas";
import type { XeroContact, XeroInvoice } from "@/types/xero";
import type { SimulatorState } from "@/types/tutorial";
import { ActionButton, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

const contacts = contactsData as XeroContact[];
const invoices = invoicesData as XeroInvoice[];
const customerOptions = contacts.filter((contact) => contact.type === "customer").map((contact) => ({ label: contact.name, value: contact.id }));
const invoiceOptions = invoices.map((invoice) => ({ label: `${invoice.id} - $${invoice.total.toLocaleString()}`, value: invoice.id }));
const bankOptions = [{ label: "Business Bank", value: "business-bank" }];

interface XeroInvoiceFormProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function XeroInvoiceForm({ state, activeTarget, onAction }: XeroInvoiceFormProps) {
  const invoiceForm = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: "",
      invoiceNumber: "2044",
      lineItem: "Advisory services",
      amount: 1480
    }
  });
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: "",
      paymentAccount: "",
      amount: 760
    }
  });

  return (
    <SimulatorShell platform="xero" title="Invoices" activeTarget={activeTarget} onAction={onAction}>
      {state === "invoice-form" ? (
        <form className="max-w-5xl" onSubmit={invoiceForm.handleSubmit(() => onAction("invoice-save", undefined, "commit"))}>
          <SimulatorCard title="New sales invoice">
            <div className="grid gap-4 md:grid-cols-3">
              <Controller control={invoiceForm.control} name="customerId" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Contact<ActionSelect activeTarget={activeTarget} onAction={onAction} target="customer-select" placeholder="Choose contact" options={customerOptions} value={field.value} onValueChange={field.onChange} /></label>} />
              <div className="space-y-2 text-sm font-medium text-slate-700"><span>Invoice no.</span><div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">2044</div></div>
              <div className="space-y-2 text-sm font-medium text-slate-700"><span>Due date</span><div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">05/28/2026</div></div>
            </div>
            <div className="mt-5 rounded-md border">
              <div className="grid grid-cols-[1fr_120px] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-normal text-slate-500"><span>Description</span><span>Amount</span></div>
              <div className="grid grid-cols-[1fr_120px] px-3 py-3 text-sm"><span>Advisory services</span><span>$1,480.00</span></div>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" className={activeTarget === "invoice-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "invoice-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#00B4D8] px-4 text-sm font-medium text-white">Save as draft</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "invoice-review" ? (
        <div className="max-w-5xl space-y-4">
          <SimulatorCard title="Awaiting approval">
            <button type="button" className={activeTarget === "invoice-row" ? "target-highlight grid w-full grid-cols-4 rounded-md border p-3 text-left" : "sim-muted grid w-full grid-cols-4 rounded-md border p-3 text-left"} disabled={activeTarget !== "invoice-row"} onClick={() => onAction("invoice-row", undefined, "commit")}>
              <span>Atlas Labs</span><span>xe-inv-2041</span><span>$1,480.00</span><span>Awaiting approval</span>
            </button>
          </SimulatorCard>
          <SimulatorCard title="Invoice actions">
            <div className="flex flex-wrap gap-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="invoice-approve">Approve</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="invoice-send" variant="outline">Email</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="receive-payment" variant="outline">Add payment</ActionButton>
            </div>
            <button type="button" onClick={() => onAction("email-preview", undefined, "commit")} className={activeTarget === "email-preview" ? "target-highlight mt-4 w-full rounded-md border bg-slate-50 p-4 text-left" : "sim-muted mt-4 w-full rounded-md border bg-slate-50 p-4 text-left"} disabled={activeTarget !== "email-preview"}>
              <p className="text-sm font-semibold text-slate-800">Email preview</p>
              <p className="mt-1 text-sm text-slate-500">Atlas Labs will receive the approved sales invoice.</p>
            </button>
            <div className="mt-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="send-confirm">Send</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "payment-form" ? (
        <form className="max-w-4xl" onSubmit={paymentForm.handleSubmit(() => onAction("payment-save", undefined, "commit"))}>
          <SimulatorCard title="Add payment">
            <div className="mb-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="receive-payment">Add payment</ActionButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller control={paymentForm.control} name="invoiceId" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Invoice<ActionSelect activeTarget={activeTarget} onAction={onAction} target="payment-invoice" placeholder="Choose invoice" options={invoiceOptions} value={field.value} onValueChange={field.onChange} /></label>} />
              <Controller control={paymentForm.control} name="paymentAccount" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Paid into<ActionSelect activeTarget={activeTarget} onAction={onAction} target="payment-account" placeholder="Choose account" options={bankOptions} value={field.value} onValueChange={field.onChange} /></label>} />
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" className={activeTarget === "payment-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "payment-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#00B4D8] px-4 text-sm font-medium text-white">Add payment</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}

      {state === "credit-memo-form" ? (
        <div className="max-w-4xl">
          <SimulatorCard title="Credit note">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">Contact<ActionSelect activeTarget={activeTarget} onAction={onAction} target="credit-customer" placeholder="Choose contact" options={customerOptions} /></label>
              <div className="space-y-2 text-sm font-medium text-slate-700"><span>Credit amount</span><div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">$150.00</div></div>
            </div>
            <div className="mt-5 flex justify-end">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="credit-save">Approve credit note</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}
    </SimulatorShell>
  );
}
