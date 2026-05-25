import bankAccountsJson from "@/data/quickbooks/sample-data/bank-accounts.json";
import cashflowJson from "@/data/quickbooks/sample-data/cashflow.json";
import customersJson from "@/data/quickbooks/sample-data/customers.json";
import expensesJson from "@/data/quickbooks/sample-data/expenses.json";
import invoicesJson from "@/data/quickbooks/sample-data/invoices.json";
import reportsJson from "@/data/quickbooks/sample-data/reports.json";
import transactionsJson from "@/data/quickbooks/sample-data/transactions.json";
import vendorsJson from "@/data/quickbooks/sample-data/vendors.json";

export type DataFilter = {
  status?: string;
  customerId?: string;
  vendorId?: string;
  accountId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  type?: string;
};

export type LineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type Payment = {
  date: string;
  amount: number;
  method: string;
  reference: string;
};

export type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  terms: string;
  status: "paid" | "unpaid" | "overdue" | "draft";
  amount: number;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balanceDue: number;
  lineItems: LineItem[];
  payments: Payment[];
};

export type Expense = {
  id: string;
  vendorId: string;
  vendorName: string;
  category: string;
  date: string;
  description: string;
  amount: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  status: "paid" | "pending" | "reimbursable";
  receiptNumber: string;
  notes: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  invoiceCount: number;
  lastInvoiceDate: string;
  status: "active" | "overdue";
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  balance: number;
  email: string;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  expenseCount: number;
  lastExpenseDate: string;
  status: "active" | "overdue";
};

export type BankAccount = {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  type: "checking" | "savings" | "credit";
  currentBalance: number;
  availableBalance: number;
  currency: string;
  lastReconciled: string;
  color: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  reference: string;
  category: string;
  spent: number;
  received: number;
  amount: number;
  balance: number;
  status: string;
  type: "credit" | "debit";
  reconciled: boolean;
};

export type CashflowEntry = {
  date: string;
  projectedIn: number;
  projectedOut: number;
  projectedBalance: number;
  actualIn: number;
  actualOut: number;
  actualBalance: number;
};

export type ProfitAndLossEntry = {
  month: string;
  income: number;
  costOfGoods: number;
  grossProfit: number;
  expenses: Record<string, number>;
  totalExpenses: number;
  netProfit: number;
};

export type AgingRow = {
  customerId?: string;
  contactId?: string;
  name: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
};

export type Reports = {
  profitAndLoss: ProfitAndLossEntry[];
  balanceSheet: {
    assets: Record<string, number>;
    liabilities: Record<string, number>;
    equity: Record<string, number>;
  };
  agedReceivables: AgingRow[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  topCustomers: { customerId: string; name: string; totalRevenue: number; invoiceCount: number }[];
};

type RawCustomer = { id: string; name: string; email: string; balance: number };
type RawInvoice = { id: string; customerId: string; status: string; total: number; dueDate: string };
type RawVendor = { id: string; name: string; category: string; balance: number };
type RawTransaction = { id: string; date: string; description: string; amount: number; category: string; status: string };

const customersRaw = customersJson as RawCustomer[];
const invoicesRaw = invoicesJson as RawInvoice[];
const vendorsRaw = vendorsJson as RawVendor[];
const transactionsRaw = transactionsJson as RawTransaction[];
const expensesRaw = expensesJson as Expense[];
const bankAccountsRaw = bankAccountsJson as BankAccount[];
const cashflowRaw = cashflowJson as CashflowEntry[];
const reportsRaw = reportsJson as Reports;
const today = "2026-05-23";

function matchesDate(value: string, filters?: DataFilter) {
  if (filters?.dateFrom && value < filters.dateFrom) {
    return false;
  }
  if (filters?.dateTo && value > filters.dateTo) {
    return false;
  }
  return true;
}

function matchesSearch(values: string[], search?: string) {
  if (!search) {
    return true;
  }
  const needle = search.toLowerCase();
  return values.some((value) => value.toLowerCase().includes(needle));
}

function invoiceStatus(rawInvoice: RawInvoice): Invoice["status"] {
  if (rawInvoice.status === "paid") {
    return "paid";
  }
  if (rawInvoice.status === "draft") {
    return "draft";
  }
  return rawInvoice.dueDate < today ? "overdue" : "unpaid";
}

function normalizeInvoice(rawInvoice: RawInvoice, index: number): Invoice {
  const customer = customersRaw.find((item) => item.id === rawInvoice.customerId) ?? customersRaw[0];
  const status = invoiceStatus(rawInvoice);
  const issueDate = ["2026-05-01", "2026-05-06", "2026-04-10"][index] ?? "2026-05-12";
  const subtotal = Math.round((rawInvoice.total / 1.08) * 100) / 100;
  const tax = Math.round((rawInvoice.total - subtotal) * 100) / 100;
  const paid = status === "paid" ? rawInvoice.total : 0;

  return {
    id: rawInvoice.id,
    customerId: rawInvoice.customerId,
    customerName: customer.name,
    customerEmail: customer.email,
    invoiceNumber: rawInvoice.id.replace("qb-inv-", "INV-"),
    issueDate,
    dueDate: rawInvoice.dueDate,
    terms: "Net 30",
    status,
    amount: rawInvoice.total,
    subtotal,
    tax,
    total: rawInvoice.total,
    paid,
    balanceDue: rawInvoice.total - paid,
    lineItems: [
      { description: "Accounting workflow setup", quantity: 1, rate: subtotal * 0.6, amount: Math.round(subtotal * 60) / 100 },
      { description: "Training and support", quantity: 1, rate: subtotal * 0.4, amount: Math.round(subtotal * 40) / 100 }
    ],
    payments: paid > 0 ? [{ date: "2026-04-27", amount: paid, method: "ACH", reference: `PMT-${rawInvoice.id.slice(-4)}` }] : []
  };
}

function allInvoices() {
  return invoicesRaw.map(normalizeInvoice);
}

export function getInvoices(filters: DataFilter = {}): Invoice[] {
  return allInvoices().filter((invoice) => {
    const statusMatch = !filters.status || filters.status === "all" || invoice.status === filters.status;
    const customerMatch = !filters.customerId || invoice.customerId === filters.customerId;
    return statusMatch && customerMatch && matchesDate(invoice.issueDate, filters) && matchesSearch([invoice.customerName, invoice.invoiceNumber, invoice.status], filters.search);
  });
}

export function getInvoiceById(id: string): Invoice | null {
  return allInvoices().find((invoice) => invoice.id === id) ?? null;
}

export function getExpenses(filters: DataFilter = {}): Expense[] {
  return expensesRaw.filter((expense) => {
    const statusMatch = !filters.status || filters.status === "all" || expense.status === filters.status;
    const vendorMatch = !filters.vendorId || expense.vendorId === filters.vendorId;
    const categoryMatch = !filters.category || filters.category === "all" || expense.category === filters.category;
    return statusMatch && vendorMatch && categoryMatch && matchesDate(expense.date, filters) && matchesSearch([expense.vendorName, expense.category, expense.description, expense.paymentMethod], filters.search);
  });
}

export function getExpenseById(id: string): Expense | null {
  return expensesRaw.find((expense) => expense.id === id) ?? null;
}

export function getCustomers(filters: DataFilter = {}): Customer[] {
  return customersRaw
    .map((customer) => {
      const invoices = getInvoices({ customerId: customer.id });
      const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
      const outstanding = invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
      const lastInvoiceDate = invoices.map((invoice) => invoice.issueDate).sort().at(-1) ?? today;
      const hasOverdue = invoices.some((invoice) => invoice.status === "overdue");
      return {
        ...customer,
        totalBilled,
        totalPaid,
        outstanding,
        invoiceCount: invoices.length,
        lastInvoiceDate,
        status: hasOverdue ? "overdue" : "active"
      } satisfies Customer;
    })
    .filter((customer) => {
      const statusMatch = !filters.status || filters.status === "all" || customer.status === filters.status;
      return statusMatch && matchesSearch([customer.name, customer.email, customer.status], filters.search);
    });
}

export function getCustomerById(id: string): Customer | null {
  return getCustomers().find((customer) => customer.id === id) ?? null;
}

export function getVendors(filters: DataFilter = {}): Vendor[] {
  return vendorsRaw
    .map((vendor) => {
      const expenses = getExpenses({ vendorId: vendor.id });
      const totalBilled = expenses.reduce((sum, expense) => sum + expense.total, 0);
      const totalPaid = expenses.filter((expense) => expense.status === "paid").reduce((sum, expense) => sum + expense.total, 0);
      const outstanding = expenses.filter((expense) => expense.status === "pending").reduce((sum, expense) => sum + expense.total, 0) || vendor.balance;
      const lastExpenseDate = expenses.map((expense) => expense.date).sort().at(-1) ?? today;
      return {
        ...vendor,
        email: `billing@${vendor.id}.example`,
        totalBilled,
        totalPaid,
        outstanding,
        expenseCount: expenses.length,
        lastExpenseDate,
        status: outstanding > 0 ? "overdue" : "active"
      } satisfies Vendor;
    })
    .filter((vendor) => {
      const statusMatch = !filters.status || filters.status === "all" || vendor.status === filters.status;
      return statusMatch && matchesSearch([vendor.name, vendor.category, vendor.email], filters.search);
    });
}

export function getVendorById(id: string): Vendor | null {
  return getVendors().find((vendor) => vendor.id === id) ?? null;
}

export function getBankAccounts(): BankAccount[] {
  return bankAccountsRaw;
}

export function getTransactions(accountId?: string): Transaction[] {
  const accountIds = bankAccountsRaw.map((account) => account.id);
  let runningBalance = bankAccountsRaw[0]?.currentBalance ?? 0;
  const transactions = transactionsRaw.map((transaction, index) => {
    runningBalance += transaction.amount;
    return {
      id: transaction.id,
      accountId: accountIds[index % accountIds.length],
      date: transaction.date,
      description: transaction.description,
      reference: `QB-${transaction.id.slice(-3)}`,
      category: transaction.category,
      spent: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
      received: transaction.amount > 0 ? transaction.amount : 0,
      amount: transaction.amount,
      balance: Math.round(runningBalance * 100) / 100,
      status: transaction.status,
      type: transaction.amount > 0 ? "credit" : "debit",
      reconciled: transaction.status === "reconciled" || transaction.status === "matched"
    } satisfies Transaction;
  });
  return accountId ? transactions.filter((transaction) => transaction.accountId === accountId) : transactions;
}

export function getCashflow(): CashflowEntry[] {
  return cashflowRaw;
}

export function getReports(): Reports {
  return reportsRaw;
}