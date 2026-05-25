"use client";

import { QBBankReconciliation } from "@/components/simulators/quickbooks/QBBankReconciliation";
import { QBChartOfAccounts } from "@/components/simulators/quickbooks/QBChartOfAccounts";
import { QBDashboard } from "@/components/simulators/quickbooks/QBDashboard";
import { QBInvoiceForm } from "@/components/simulators/quickbooks/QBInvoiceForm";
import { QBReports } from "@/components/simulators/quickbooks/QBReports";
import { XeroBankReconciliation } from "@/components/simulators/xero/XeroBankReconciliation";
import { XeroChartOfAccounts } from "@/components/simulators/xero/XeroChartOfAccounts";
import { XeroDashboard } from "@/components/simulators/xero/XeroDashboard";
import { XeroInvoiceForm } from "@/components/simulators/xero/XeroInvoiceForm";
import { XeroReports } from "@/components/simulators/xero/XeroReports";
import type { PlatformId, SimulatorActionPhase, SimulatorState } from "@/types/tutorial";

interface SimulatedUIProps {
  platform: PlatformId;
  simulatorState: SimulatorState;
  activeTarget: string;
  onAction: (target: string, value?: string, phase?: SimulatorActionPhase) => void;
}

const invoiceStates: SimulatorState[] = ["invoice-form", "invoice-review", "payment-form", "credit-memo-form"];
const bankingStates: SimulatorState[] = ["bank-connect", "bank-feed", "bank-reconciliation", "transaction-match"];
const reportStates: SimulatorState[] = ["reports-list", "report-detail", "report-customize"];

export function SimulatedUI({ platform, simulatorState, activeTarget, onAction }: SimulatedUIProps) {
  if (platform === "quickbooks") {
    if (invoiceStates.includes(simulatorState)) {
      return <QBInvoiceForm state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
    }

    if (simulatorState === "chart-of-accounts") {
      return <QBChartOfAccounts activeTarget={activeTarget} onAction={onAction} />;
    }

    if (bankingStates.includes(simulatorState)) {
      return <QBBankReconciliation state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
    }

    if (reportStates.includes(simulatorState)) {
      return <QBReports state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
    }

    return <QBDashboard state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
  }

  if (invoiceStates.includes(simulatorState)) {
    return <XeroInvoiceForm state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
  }

  if (simulatorState === "chart-of-accounts") {
    return <XeroChartOfAccounts activeTarget={activeTarget} onAction={onAction} />;
  }

  if (bankingStates.includes(simulatorState)) {
    return <XeroBankReconciliation state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
  }

  if (reportStates.includes(simulatorState)) {
    return <XeroReports state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
  }

  return <XeroDashboard state={simulatorState} activeTarget={activeTarget} onAction={onAction} />;
}
