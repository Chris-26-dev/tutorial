import type { AgingRow, Expense, Invoice, Reports } from "@/lib/data/quickbooks";
import type { XeroAgingRow, XeroBill, XeroInvoice, XeroReports } from "@/lib/data/xero";

const REPORT_TODAY = "2026-05-23";
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EPSILON = 0.005;

type ProfitRow = {
  month: string;
  income: number;
  costOfGoods: number;
  grossProfit: number;
  expenses: Record<string, number>;
  totalExpenses: number;
  netProfit: number;
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sum(values: number[]) {
  return roundCurrency(values.reduce((total, value) => total + value, 0));
}

function monthLabel(value: string) {
  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!year || !month) {
    return value;
  }

  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function monthSortKey(label: string) {
  const [monthText, yearText] = label.split(" ");
  return (Number(yearText) || 0) * 100 + Math.max(MONTH_NAMES.indexOf(monthText), 0);
}

function sortMonths(values: Iterable<string>) {
  return [...new Set(values)].sort((left, right) => monthSortKey(left) - monthSortKey(right));
}

function dateToDayNumber(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function agingBucket(dueDate: string) {
  const ageInDays = Math.floor(dateToDayNumber(REPORT_TODAY) - dateToDayNumber(dueDate));

  if (ageInDays <= 0) {
    return "current" as const;
  }
  if (ageInDays <= 30) {
    return "days30" as const;
  }
  if (ageInDays <= 60) {
    return "days60" as const;
  }
  if (ageInDays <= 90) {
    return "days90" as const;
  }

  return "over90" as const;
}

function buildGroupedTotals<T>(items: T[], keyOf: (item: T) => string, valueOf: (item: T) => number, include?: (item: T) => boolean) {
  const totals = new Map<string, number>();

  items.forEach((item) => {
    if (include && !include(item)) {
      return;
    }

    const key = keyOf(item);
    totals.set(key, roundCurrency((totals.get(key) ?? 0) + valueOf(item)));
  });

  return totals;
}

function diffGroupedTotals<T>(initialItems: T[], currentItems: T[], keyOf: (item: T) => string, valueOf: (item: T) => number, include?: (item: T) => boolean) {
  const initialTotals = buildGroupedTotals(initialItems, keyOf, valueOf, include);
  const currentTotals = buildGroupedTotals(currentItems, keyOf, valueOf, include);
  const deltas = new Map<string, number>();

  for (const key of new Set([...initialTotals.keys(), ...currentTotals.keys()])) {
    const delta = roundCurrency((currentTotals.get(key) ?? 0) - (initialTotals.get(key) ?? 0));

    if (Math.abs(delta) > EPSILON) {
      deltas.set(key, delta);
    }
  }

  return deltas;
}

function diffCategoryTotalsByMonth<T>(initialItems: T[], currentItems: T[], monthOf: (item: T) => string, categoryOf: (item: T) => string, valueOf: (item: T) => number, include?: (item: T) => boolean) {
  const initialTotals = buildGroupedTotals(initialItems, (item) => `${monthOf(item)}::${categoryOf(item)}`, valueOf, include);
  const currentTotals = buildGroupedTotals(currentItems, (item) => `${monthOf(item)}::${categoryOf(item)}`, valueOf, include);
  const deltas = new Map<string, Map<string, number>>();

  for (const key of new Set([...initialTotals.keys(), ...currentTotals.keys()])) {
    const delta = roundCurrency((currentTotals.get(key) ?? 0) - (initialTotals.get(key) ?? 0));

    if (Math.abs(delta) <= EPSILON) {
      continue;
    }

    const [month, category] = key.split("::");
    const monthMap = deltas.get(month) ?? new Map<string, number>();

    monthMap.set(category, delta);
    deltas.set(month, monthMap);
  }

  return deltas;
}

function mergeProfitRows<T extends ProfitRow>(baseRows: T[], incomeDeltas: Map<string, number>, expenseDeltas: Map<string, number>, expenseCategoryDeltas: Map<string, Map<string, number>>) {
  const baseByMonth = new Map(baseRows.map((row) => [row.month, row]));
  const costRatios = baseRows.filter((row) => row.income > EPSILON).map((row) => row.costOfGoods / row.income);
  const defaultCostRatio = costRatios.length ? sum(costRatios) / costRatios.length : 0.25;
  const months = sortMonths([...baseByMonth.keys(), ...incomeDeltas.keys(), ...expenseDeltas.keys(), ...expenseCategoryDeltas.keys()]);

  return months.map((month) => {
    const base = baseByMonth.get(month);
    const incomeDelta = incomeDeltas.get(month) ?? 0;
    const expenseDelta = expenseDeltas.get(month) ?? 0;
    const costRatio = base && base.income > EPSILON ? base.costOfGoods / base.income : defaultCostRatio;
    const expenses = { ...(base?.expenses ?? {}) };

    for (const [category, delta] of (expenseCategoryDeltas.get(month) ?? new Map<string, number>()).entries()) {
      const nextAmount = roundCurrency((expenses[category] ?? 0) + delta);

      if (Math.abs(nextAmount) <= EPSILON) {
        delete expenses[category];
      } else {
        expenses[category] = nextAmount;
      }
    }

    const income = roundCurrency((base?.income ?? 0) + incomeDelta);
    const costOfGoods = roundCurrency((base?.costOfGoods ?? 0) + incomeDelta * costRatio);
    const totalExpenses = roundCurrency((base?.totalExpenses ?? 0) + expenseDelta);
    const grossProfit = roundCurrency(income - costOfGoods);
    const netProfit = roundCurrency(grossProfit - totalExpenses);

    return { month, income, costOfGoods, grossProfit, expenses, totalExpenses, netProfit } as T;
  });
}

function mergeCategoryRows(baseRows: { category: string; amount: number; percentage: number }[], deltas: Map<string, number>) {
  const merged = new Map(baseRows.map((row) => [row.category, { ...row }]));

  for (const [category, delta] of deltas.entries()) {
    const row = merged.get(category) ?? { category, amount: 0, percentage: 0 };
    row.amount = roundCurrency(row.amount + delta);
    merged.set(category, row);
  }

  const rows = [...merged.values()].filter((row) => row.amount > EPSILON).sort((left, right) => right.amount - left.amount);
  const totalAmount = sum(rows.map((row) => row.amount));

  return rows.map((row) => ({ ...row, percentage: totalAmount > EPSILON ? roundCurrency((row.amount / totalAmount) * 100) : 0 }));
}

function invoiceCashByMonth(invoices: Invoice[]) {
  const totals = new Map<string, number>();

  invoices.forEach((invoice) => {
    if (invoice.payments.length) {
      invoice.payments.forEach((payment) => {
        const key = monthLabel(payment.date);
        totals.set(key, roundCurrency((totals.get(key) ?? 0) + payment.amount));
      });
      return;
    }

    if (invoice.paid > EPSILON) {
      const key = monthLabel(invoice.issueDate);
      totals.set(key, roundCurrency((totals.get(key) ?? 0) + invoice.paid));
    }
  });

  return totals;
}

function paidExpensesByMonth(expenses: Expense[]) {
  return buildGroupedTotals(expenses, (expense) => monthLabel(expense.date), (expense) => expense.total, (expense) => expense.status === "paid");
}

function buildQuickBooksAgingRows(invoices: Invoice[]) {
  const rows = new Map<string, AgingRow>();

  invoices.forEach((invoice) => {
    const row = rows.get(invoice.customerId) ?? {
      customerId: invoice.customerId,
      name: invoice.customerName,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0
    };

    if (invoice.balanceDue > EPSILON) {
      row[agingBucket(invoice.dueDate)] = roundCurrency(row[agingBucket(invoice.dueDate)] + invoice.balanceDue);
      row.total = roundCurrency(row.total + invoice.balanceDue);
    }

    rows.set(invoice.customerId, row);
  });

  return rows;
}

function mergeQuickBooksAging(baseRows: AgingRow[], initialRows: Map<string, AgingRow>, currentRows: Map<string, AgingRow>) {
  const merged = new Map(baseRows.map((row) => [row.customerId ?? row.name, { ...row }]));

  for (const id of new Set([...initialRows.keys(), ...currentRows.keys()])) {
    const initial = initialRows.get(id);
    const current = currentRows.get(id);
    const row = merged.get(id) ?? {
      customerId: current?.customerId ?? initial?.customerId ?? id,
      name: current?.name ?? initial?.name ?? id,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0
    };

    row.current = roundCurrency(row.current + (current?.current ?? 0) - (initial?.current ?? 0));
    row.days30 = roundCurrency(row.days30 + (current?.days30 ?? 0) - (initial?.days30 ?? 0));
    row.days60 = roundCurrency(row.days60 + (current?.days60 ?? 0) - (initial?.days60 ?? 0));
    row.days90 = roundCurrency(row.days90 + (current?.days90 ?? 0) - (initial?.days90 ?? 0));
    row.over90 = roundCurrency(row.over90 + (current?.over90 ?? 0) - (initial?.over90 ?? 0));
    row.total = roundCurrency(row.current + row.days30 + row.days60 + row.days90 + row.over90);

    merged.set(id, row);
  }

  return [...merged.values()].sort((left, right) => right.total - left.total);
}

function quickBooksCustomerMetrics(invoices: Invoice[]) {
  const metrics = new Map<string, { customerId: string; name: string; totalRevenue: number; invoiceCount: number }>();

  invoices.forEach((invoice) => {
    if (invoice.status === "draft") {
      return;
    }

    const metric = metrics.get(invoice.customerId) ?? { customerId: invoice.customerId, name: invoice.customerName, totalRevenue: 0, invoiceCount: 0 };
    metric.totalRevenue = roundCurrency(metric.totalRevenue + invoice.total);
    metric.invoiceCount += 1;
    metrics.set(invoice.customerId, metric);
  });

  return metrics;
}

function mergeQuickBooksTopCustomers(baseRows: Reports["topCustomers"], initialMetrics: Map<string, { customerId: string; name: string; totalRevenue: number; invoiceCount: number }>, currentMetrics: Map<string, { customerId: string; name: string; totalRevenue: number; invoiceCount: number }>) {
  const merged = new Map(baseRows.map((row) => [row.customerId, { ...row }]));

  for (const id of new Set([...merged.keys(), ...initialMetrics.keys(), ...currentMetrics.keys()])) {
    const base = merged.get(id);
    const initial = initialMetrics.get(id);
    const current = currentMetrics.get(id);
    const totalRevenue = roundCurrency((base?.totalRevenue ?? 0) + (current?.totalRevenue ?? 0) - (initial?.totalRevenue ?? 0));
    const invoiceCount = Math.max(0, (base?.invoiceCount ?? 0) + (current?.invoiceCount ?? 0) - (initial?.invoiceCount ?? 0));

    if (totalRevenue <= EPSILON && !base) {
      continue;
    }

    merged.set(id, {
      customerId: id,
      name: current?.name ?? initial?.name ?? base?.name ?? id,
      totalRevenue,
      invoiceCount
    });
  }

  return [...merged.values()].filter((row) => row.totalRevenue > EPSILON).sort((left, right) => right.totalRevenue - left.totalRevenue).slice(0, 5);
}

export function buildQuickBooksLiveReports(baseReports: Reports, initialInvoices: Invoice[], currentInvoices: Invoice[], initialExpenses: Expense[], currentExpenses: Expense[]): Reports {
  const incomeDeltas = diffGroupedTotals(initialInvoices, currentInvoices, (invoice) => monthLabel(invoice.issueDate), (invoice) => invoice.total, (invoice) => invoice.status !== "draft");
  const expenseDeltas = diffGroupedTotals(initialExpenses, currentExpenses, (expense) => monthLabel(expense.date), (expense) => expense.total);
  const expenseCategoryDeltas = diffCategoryTotalsByMonth(initialExpenses, currentExpenses, (expense) => monthLabel(expense.date), (expense) => expense.category, (expense) => expense.total);
  const profitAndLoss = mergeProfitRows(baseReports.profitAndLoss, incomeDeltas, expenseDeltas, expenseCategoryDeltas);
  const agedReceivables = mergeQuickBooksAging(baseReports.agedReceivables, buildQuickBooksAgingRows(initialInvoices), buildQuickBooksAgingRows(currentInvoices));
  const expensesByCategory = mergeCategoryRows(baseReports.expensesByCategory, diffGroupedTotals(initialExpenses, currentExpenses, (expense) => expense.category, (expense) => expense.total));
  const topCustomers = mergeQuickBooksTopCustomers(baseReports.topCustomers, quickBooksCustomerMetrics(initialInvoices), quickBooksCustomerMetrics(currentInvoices));
  const accountsReceivableDelta = sum(currentInvoices.map((invoice) => invoice.balanceDue)) - sum(initialInvoices.map((invoice) => invoice.balanceDue));
  const accountsPayableDelta = sum(currentExpenses.filter((expense) => expense.status !== "paid").map((expense) => expense.total)) - sum(initialExpenses.filter((expense) => expense.status !== "paid").map((expense) => expense.total));
  const cashInDelta = sum([...invoiceCashByMonth(currentInvoices).values()]) - sum([...invoiceCashByMonth(initialInvoices).values()]);
  const cashOutDelta = sum([...paidExpensesByMonth(currentExpenses).values()]) - sum([...paidExpensesByMonth(initialExpenses).values()]);
  const netProfitDelta = sum(profitAndLoss.map((row) => row.netProfit)) - sum(baseReports.profitAndLoss.map((row) => row.netProfit));

  return {
    ...baseReports,
    profitAndLoss,
    balanceSheet: {
      assets: {
        ...baseReports.balanceSheet.assets,
        Checking: roundCurrency((baseReports.balanceSheet.assets.Checking ?? 0) + cashInDelta - cashOutDelta),
        "Accounts Receivable": roundCurrency((baseReports.balanceSheet.assets["Accounts Receivable"] ?? 0) + accountsReceivableDelta)
      },
      liabilities: {
        ...baseReports.balanceSheet.liabilities,
        "Accounts Payable": roundCurrency((baseReports.balanceSheet.liabilities["Accounts Payable"] ?? 0) + accountsPayableDelta)
      },
      equity: {
        ...baseReports.balanceSheet.equity,
        "Current Year Earnings": roundCurrency((baseReports.balanceSheet.equity["Current Year Earnings"] ?? 0) + netProfitDelta)
      }
    },
    agedReceivables,
    expensesByCategory,
    topCustomers
  };
}

function xeroBillCategory(bill: XeroBill) {
  return bill.lineItems[0]?.description?.trim() || bill.contactName;
}

function xeroInvoiceCashByMonth(invoices: XeroInvoice[]) {
  const totals = new Map<string, number>();

  invoices.forEach((invoice) => {
    if (invoice.payments.length) {
      invoice.payments.forEach((payment) => {
        const key = monthLabel(payment.date);
        totals.set(key, roundCurrency((totals.get(key) ?? 0) + payment.amount));
      });
      return;
    }

    if (invoice.paid > EPSILON) {
      const key = monthLabel(invoice.date);
      totals.set(key, roundCurrency((totals.get(key) ?? 0) + invoice.paid));
    }
  });

  return totals;
}

function xeroBillCashByMonth(bills: XeroBill[]) {
  const totals = new Map<string, number>();

  bills.forEach((bill) => {
    if (bill.payments.length) {
      bill.payments.forEach((payment) => {
        const key = monthLabel(payment.date);
        totals.set(key, roundCurrency((totals.get(key) ?? 0) + payment.amount));
      });
      return;
    }

    const paidAmount = roundCurrency(bill.total - bill.amountDue);

    if (paidAmount > EPSILON) {
      const key = monthLabel(bill.date);
      totals.set(key, roundCurrency((totals.get(key) ?? 0) + paidAmount));
    }
  });

  return totals;
}

function buildXeroAgingRowsFromInvoices(invoices: XeroInvoice[]) {
  const rows = new Map<string, XeroAgingRow>();

  invoices.forEach((invoice) => {
    const row = rows.get(invoice.contactId) ?? {
      contactId: invoice.contactId,
      name: invoice.contactName,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0
    };

    if (invoice.due > EPSILON) {
      row[agingBucket(invoice.dueDate)] = roundCurrency(row[agingBucket(invoice.dueDate)] + invoice.due);
      row.total = roundCurrency(row.total + invoice.due);
    }

    rows.set(invoice.contactId, row);
  });

  return rows;
}

function buildXeroAgingRowsFromBills(bills: XeroBill[]) {
  const rows = new Map<string, XeroAgingRow>();

  bills.forEach((bill) => {
    const row = rows.get(bill.contactId) ?? {
      contactId: bill.contactId,
      name: bill.contactName,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0
    };

    if (bill.amountDue > EPSILON) {
      row[agingBucket(bill.dueDate)] = roundCurrency(row[agingBucket(bill.dueDate)] + bill.amountDue);
      row.total = roundCurrency(row.total + bill.amountDue);
    }

    rows.set(bill.contactId, row);
  });

  return rows;
}

function mergeXeroAging(baseRows: XeroAgingRow[], initialRows: Map<string, XeroAgingRow>, currentRows: Map<string, XeroAgingRow>) {
  const merged = new Map(baseRows.map((row) => [row.contactId, { ...row }]));

  for (const id of new Set([...initialRows.keys(), ...currentRows.keys()])) {
    const initial = initialRows.get(id);
    const current = currentRows.get(id);
    const row = merged.get(id) ?? {
      contactId: id,
      name: current?.name ?? initial?.name ?? id,
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0
    };

    row.current = roundCurrency(row.current + (current?.current ?? 0) - (initial?.current ?? 0));
    row.days30 = roundCurrency(row.days30 + (current?.days30 ?? 0) - (initial?.days30 ?? 0));
    row.days60 = roundCurrency(row.days60 + (current?.days60 ?? 0) - (initial?.days60 ?? 0));
    row.days90 = roundCurrency(row.days90 + (current?.days90 ?? 0) - (initial?.days90 ?? 0));
    row.over90 = roundCurrency(row.over90 + (current?.over90 ?? 0) - (initial?.over90 ?? 0));
    row.total = roundCurrency(row.current + row.days30 + row.days60 + row.days90 + row.over90);

    merged.set(id, row);
  }

  return [...merged.values()].sort((left, right) => right.total - left.total);
}

function xeroCustomerMetrics(invoices: XeroInvoice[]) {
  const metrics = new Map<string, { contactId: string; name: string; totalRevenue: number; invoiceCount: number }>();

  invoices.forEach((invoice) => {
    if (invoice.status === "draft" || invoice.status === "repeating") {
      return;
    }

    const metric = metrics.get(invoice.contactId) ?? { contactId: invoice.contactId, name: invoice.contactName, totalRevenue: 0, invoiceCount: 0 };
    metric.totalRevenue = roundCurrency(metric.totalRevenue + invoice.total);
    metric.invoiceCount += 1;
    metrics.set(invoice.contactId, metric);
  });

  return metrics;
}

function mergeXeroTopCustomers(baseRows: XeroReports["topCustomers"], initialMetrics: Map<string, { contactId: string; name: string; totalRevenue: number; invoiceCount: number }>, currentMetrics: Map<string, { contactId: string; name: string; totalRevenue: number; invoiceCount: number }>) {
  const merged = new Map(baseRows.map((row) => [row.contactId, { ...row }]));

  for (const id of new Set([...merged.keys(), ...initialMetrics.keys(), ...currentMetrics.keys()])) {
    const base = merged.get(id);
    const initial = initialMetrics.get(id);
    const current = currentMetrics.get(id);
    const totalRevenue = roundCurrency((base?.totalRevenue ?? 0) + (current?.totalRevenue ?? 0) - (initial?.totalRevenue ?? 0));
    const invoiceCount = Math.max(0, (base?.invoiceCount ?? 0) + (current?.invoiceCount ?? 0) - (initial?.invoiceCount ?? 0));

    if (totalRevenue <= EPSILON && !base) {
      continue;
    }

    merged.set(id, {
      contactId: id,
      name: current?.name ?? initial?.name ?? base?.name ?? id,
      totalRevenue,
      invoiceCount
    });
  }

  return [...merged.values()].filter((row) => row.totalRevenue > EPSILON).sort((left, right) => right.totalRevenue - left.totalRevenue).slice(0, 5);
}

function mergeCashSummary(baseRows: XeroReports["cashSummary"], cashInDeltas: Map<string, number>, cashOutDeltas: Map<string, number>) {
  const baseByMonth = new Map(baseRows.map((row) => [row.month, row]));
  const months = sortMonths([...baseByMonth.keys(), ...cashInDeltas.keys(), ...cashOutDeltas.keys()]);

  return months.map((month) => {
    const base = baseByMonth.get(month);
    const cashIn = roundCurrency((base?.cashIn ?? 0) + (cashInDeltas.get(month) ?? 0));
    const cashOut = roundCurrency((base?.cashOut ?? 0) + (cashOutDeltas.get(month) ?? 0));

    return {
      month,
      cashIn,
      cashOut,
      netMovement: roundCurrency(cashIn - cashOut)
    };
  });
}

export function buildXeroLiveReports(baseReports: XeroReports, initialInvoices: XeroInvoice[], currentInvoices: XeroInvoice[], initialBills: XeroBill[], currentBills: XeroBill[]): XeroReports {
  const incomeDeltas = diffGroupedTotals(initialInvoices, currentInvoices, (invoice) => monthLabel(invoice.date), (invoice) => invoice.total, (invoice) => invoice.status !== "draft" && invoice.status !== "repeating");
  const expenseDeltas = diffGroupedTotals(initialBills, currentBills, (bill) => monthLabel(bill.date), (bill) => bill.total, (bill) => bill.status !== "draft");
  const expenseCategoryDeltas = diffCategoryTotalsByMonth(initialBills, currentBills, (bill) => monthLabel(bill.date), xeroBillCategory, (bill) => bill.total, (bill) => bill.status !== "draft");
  const profitAndLoss = mergeProfitRows(baseReports.profitAndLoss, incomeDeltas, expenseDeltas, expenseCategoryDeltas);
  const agedReceivables = mergeXeroAging(baseReports.agedReceivables, buildXeroAgingRowsFromInvoices(initialInvoices), buildXeroAgingRowsFromInvoices(currentInvoices));
  const agedPayables = mergeXeroAging(baseReports.agedPayables, buildXeroAgingRowsFromBills(initialBills), buildXeroAgingRowsFromBills(currentBills));
  const expensesByCategory = mergeCategoryRows(baseReports.expensesByCategory, diffGroupedTotals(initialBills, currentBills, xeroBillCategory, (bill) => bill.total, (bill) => bill.status !== "draft"));
  const cashSummary = mergeCashSummary(
    baseReports.cashSummary,
    diffGroupedTotals(initialInvoices.flatMap((invoice) => invoice.payments.length ? invoice.payments.map((payment) => ({ date: payment.date, amount: payment.amount })) : invoice.paid > EPSILON ? [{ date: invoice.date, amount: invoice.paid }] : []), currentInvoices.flatMap((invoice) => invoice.payments.length ? invoice.payments.map((payment) => ({ date: payment.date, amount: payment.amount })) : invoice.paid > EPSILON ? [{ date: invoice.date, amount: invoice.paid }] : []), (payment) => monthLabel(payment.date), (payment) => payment.amount),
    diffGroupedTotals(initialBills.flatMap((bill) => bill.payments.length ? bill.payments.map((payment) => ({ date: payment.date, amount: payment.amount })) : bill.total - bill.amountDue > EPSILON ? [{ date: bill.date, amount: bill.total - bill.amountDue }] : []), currentBills.flatMap((bill) => bill.payments.length ? bill.payments.map((payment) => ({ date: payment.date, amount: payment.amount })) : bill.total - bill.amountDue > EPSILON ? [{ date: bill.date, amount: bill.total - bill.amountDue }] : []), (payment) => monthLabel(payment.date), (payment) => payment.amount)
  );
  const topCustomers = mergeXeroTopCustomers(baseReports.topCustomers, xeroCustomerMetrics(initialInvoices), xeroCustomerMetrics(currentInvoices));
  const accountsReceivableDelta = sum(currentInvoices.map((invoice) => invoice.due)) - sum(initialInvoices.map((invoice) => invoice.due));
  const accountsPayableDelta = sum(currentBills.map((bill) => bill.amountDue)) - sum(initialBills.map((bill) => bill.amountDue));
  const cashInDelta = sum([...xeroInvoiceCashByMonth(currentInvoices).values()]) - sum([...xeroInvoiceCashByMonth(initialInvoices).values()]);
  const cashOutDelta = sum([...xeroBillCashByMonth(currentBills).values()]) - sum([...xeroBillCashByMonth(initialBills).values()]);
  const netProfitDelta = sum(profitAndLoss.map((row) => row.netProfit)) - sum(baseReports.profitAndLoss.map((row) => row.netProfit));

  return {
    ...baseReports,
    profitAndLoss,
    balanceSheet: {
      assets: {
        ...baseReports.balanceSheet.assets,
        "Business Current": roundCurrency((baseReports.balanceSheet.assets["Business Current"] ?? 0) + cashInDelta - cashOutDelta),
        "Accounts Receivable": roundCurrency((baseReports.balanceSheet.assets["Accounts Receivable"] ?? 0) + accountsReceivableDelta)
      },
      liabilities: {
        ...baseReports.balanceSheet.liabilities,
        "Accounts Payable": roundCurrency((baseReports.balanceSheet.liabilities["Accounts Payable"] ?? 0) + accountsPayableDelta)
      },
      equity: {
        ...baseReports.balanceSheet.equity,
        "Current Year Earnings": roundCurrency((baseReports.balanceSheet.equity["Current Year Earnings"] ?? 0) + netProfitDelta)
      }
    },
    agedReceivables,
    agedPayables,
    expensesByCategory,
    cashSummary,
    topCustomers
  };
}