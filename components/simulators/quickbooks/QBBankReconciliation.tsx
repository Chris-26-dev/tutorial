"use client";

import transactionsData from "@/data/quickbooks/sample-data/transactions.json";
import type { QuickBooksTransaction } from "@/types/quickbooks";
import type { SimulatorState } from "@/types/tutorial";
import { ActionButton, ActionInput, ActionSelect, SimulatorCard, type SimulatorComponentProps } from "../SimulatorPrimitives";
import { SimulatorShell } from "../SimulatorShell";

const transactions = transactionsData as QuickBooksTransaction[];

interface QBBankReconciliationProps extends SimulatorComponentProps {
  state: SimulatorState;
}

export function QBBankReconciliation({ state, activeTarget, onAction }: QBBankReconciliationProps) {
  return (
    <SimulatorShell platform="quickbooks" title="Banking" activeTarget={activeTarget} onAction={onAction}>
      {state === "bank-connect" ? (
        <div className="max-w-3xl">
          <SimulatorCard title="Connect an account">
            <div className="grid gap-4 md:grid-cols-[auto_1fr_auto]">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-add-account">Link account</ActionButton>
              <ActionInput activeTarget={activeTarget} onAction={onAction} target="bank-search-bank" placeholder="Search bank" />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-connect">Connect checking</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "bank-feed" ? (
        <div className="max-w-5xl space-y-4">
          <SimulatorCard title="Bank transactions">
            <div className="mb-4 flex gap-2">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-review-tab" variant="outline">For review</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-import" variant="outline">Import statement</ActionButton>
            </div>
            <div className="space-y-2">
              {transactions.map((transaction, index) => {
                const isTarget = activeTarget === "bank-transaction-row" && index === 0;

                return (
                  <button key={transaction.id} type="button" className={isTarget ? "target-highlight grid w-full grid-cols-5 rounded-md border p-3 text-left text-sm" : "sim-muted grid w-full grid-cols-5 rounded-md border p-3 text-left text-sm"} disabled={!isTarget} onClick={() => onAction("bank-transaction-row", undefined, "commit")}>
                    <span>{transaction.date}</span><span>{transaction.description}</span><span>{transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span><span>{transaction.category}</span><span>{transaction.status}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="bank-accept">Accept</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="statement-file" variant="outline">CSV statement file</ActionButton>
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="statement-import" variant="outline">Import transactions</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "bank-reconciliation" ? (
        <div className="max-w-4xl space-y-4">
          <SimulatorCard title="Reconcile checking">
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reconcile-start">Start reconciling</ActionButton>
              <ActionInput activeTarget={activeTarget} onAction={onAction} target="statement-ending-balance" placeholder="Ending balance" />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="reconcile-finish">Finish now</ActionButton>
            </div>
            <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-900">Difference: $0.00</div>
          </SimulatorCard>
        </div>
      ) : null}

      {state === "transaction-match" ? (
        <div className="max-w-4xl space-y-4">
          <SimulatorCard title="Match transactions">
            <div className="mb-4 rounded-md border bg-slate-50 p-3 text-sm">Acme Corp Payment - $1,240.00</div>
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="match-find">Find match</ActionButton>
              <ActionSelect activeTarget={activeTarget} onAction={onAction} target="match-select-invoice" placeholder="Matching record" options={[{ label: "qb-inv-1001", value: "qb-inv-1001" }, { label: "qb-inv-1002", value: "qb-inv-1002" }]} />
              <ActionButton activeTarget={activeTarget} onAction={onAction} target="match-confirm">Match</ActionButton>
            </div>
          </SimulatorCard>
        </div>
      ) : null}
    </SimulatorShell>
  );
}
