"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import transactionsData from "@/data/xero/sample-data/transactions.json";
import { bankRuleSchema, type BankRuleValues } from "@/lib/simulatorSchemas";
import type { SimulatorState } from "@/types/tutorial";
import type { XeroTransaction } from "@/types/xero";
import { ActionButton, ActionInput, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

const transactions = transactionsData as XeroTransaction[];

interface XeroBankReconciliationProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function XeroBankReconciliation({ state, activeTarget, onAction }: XeroBankReconciliationProps) {
  const ruleForm = useForm<BankRuleValues>({
    resolver: zodResolver(bankRuleSchema),
    defaultValues: {
      ruleName: "Cloud hosting",
      condition: "",
      category: ""
    }
  });

  return (
    <SimulatorShell platform="xero" title="Banking" activeTarget={activeTarget} onAction={onAction}>
      {state === "bank-connect" ? (
        <div className="max-w-3xl">
          <SimulatorCard title="Add bank account">
            <div className="grid gap-4 md:grid-cols-[auto_1fr_auto]">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-add-account">Add bank account</ActionButton>
              <ActionInput activeTarget={activeTarget} onAction={onAction} target="bank-search-bank" placeholder="Search bank" />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-connect">Connect feed</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "bank-feed" ? (
        <div className="max-w-5xl space-y-4">
          <SimulatorCard title="Business Bank">
            <div className="mb-4 flex flex-wrap gap-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-review-tab" variant="outline">Reconcile</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-import" variant="outline">Import statement</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="statement-file" variant="outline">CSV statement file</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="statement-import" variant="outline">Import transactions</ActionButton>
            </div>
            <div className="space-y-2">
              {transactions.map((transaction, index) => {
                const isTarget = activeTarget === "bank-transaction-row" && index === 0;

                return (
                  <button key={transaction.id} type="button" className={isTarget ? "target-highlight grid w-full grid-cols-5 rounded-md border p-3 text-left text-sm" : "sim-muted grid w-full grid-cols-5 rounded-md border p-3 text-left text-sm"} disabled={!isTarget} onClick={() => onAction("bank-transaction-row", undefined, "commit")}>
                    <span>{transaction.date}</span><span>{transaction.payee}</span><span>{transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span><span>{transaction.account}</span><span>{transaction.status}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-accept">OK</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "transaction-match" ? (
        <form className="max-w-4xl" onSubmit={ruleForm.handleSubmit(() => onAction("rule-save", undefined, "commit"))}>
          <SimulatorCard title="Bank rules">
            <div className="mb-4">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-rule-create">Create bank rule</ActionButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller control={ruleForm.control} name="condition" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Condition<ActionInput activeTarget={activeTarget} onAction={(target, value, phase) => { field.onChange(value); onAction(target, value, phase); }} target="rule-condition" placeholder="Contains text" value={field.value} onValueChange={field.onChange} /></label>} />
              <Controller control={ruleForm.control} name="category" render={({ field }) => <label className="space-y-2 text-sm font-medium text-slate-700">Account<ActionSelect activeTarget={activeTarget} onAction={onAction} target="transaction-category" placeholder="Choose account" options={[{ label: "Subscriptions", value: "subscriptions" }, { label: "Office expenses", value: "office-expenses" }, { label: "Travel", value: "travel" }]} value={field.value} onValueChange={field.onChange} /></label>} />
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" className={activeTarget === "rule-save" ? "target-highlight rounded-md" : "sim-muted rounded-md"} disabled={activeTarget !== "rule-save"}>
                <span className="inline-flex h-10 items-center rounded-md bg-[#00B4D8] px-4 text-sm font-medium text-white">Save rule</span>
              </button>
            </div>
          </SimulatorCard>
        </form>
      ) : null}
    </SimulatorShell>
  );
}
