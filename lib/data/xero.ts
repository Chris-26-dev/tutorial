import bankAccountsJson from "@/data/xero/bank-accounts.json";
import billsJson from "@/data/xero/bills.json";
import cashflowJson from "@/data/xero/cashflow.json";
import contactsJson from "@/data/xero/contacts.json";
import invoicesJson from "@/data/xero/invoices.json";
import reportsJson from "@/data/xero/reports.json";
import transactionsJson from "@/data/xero/transactions.json";

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

export type XeroLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  amount: number;
};

export type XeroPayment = {
  date: string;
  amount: number;
  method: string;
  reference: string;
};

export type XeroActivity = {
  label: string;
  date: string;
};

export type XeroInvoice = {
  id: string;
  contactId: string;
  contactName: string;
  invoiceNumber: string;
  reference: string;
  date: string;
  dueDate: string;
  status: "draft" | "awaiting_payment" | "paid" | "overdue" | "repeating";
  paid: number;
  due: number;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  lineItems: XeroLineItem[];
  payments: XeroPayment[];
  activity: XeroActivity[];
};

export type XeroBill = {
  id: string;
  contactId: string;
  contactName: string;
  reference: string;
  date: string;
  dueDate: string;
  plannedDate: string;
  status: "draft" | "awaiting_payment" | "paid" | "overdue";
  amountDue: number;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  lineItems: XeroLineItem[];
  payments: XeroPayment[];
  activity: XeroActivity[];
};

export type XeroContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "customer" | "supplier" | "both";
  group: string;
  address: string;
  taxNumber: string;
  outstandingReceivable: number;
  outstandingPayable: number;
  lastActivity: string;
};

export type XeroBankAccount = {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  type: "checking" | "savings" | "credit";
  currentBalance: number;
  availableBalance: number;
  currency: string;
  lastReconciled: string;
  unreconciledCount: number;
  color: string;
  sparkline: number[];
};

export type XeroTransaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  reference: string;
  spent: number;
  received: number;
  amount: number;
  balance: number;
  status: string;
  type: "spend" | "receive";
};

export type XeroCashflowEntry = {
  date: string;
  projectedIn: number;
  projectedOut: number;
  projectedBalance: number;
  actualIn: number;
  actualOut: number;
  actualBalance: number;
};

export type XeroProfitAndLossEntry = {
  month: string;
  income: number;
  costOfGoods: number;
  grossProfit: number;
  expenses: Record<string, number>;
  totalExpenses: number;
  netProfit: number;
};

export type XeroAgingRow = {
  contactId: string;
  name: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
};

export type XeroReports = {
  profitAndLoss: XeroProfitAndLossEntry[];
  balanceSheet: {
    assets: Record<string, number>;
    liabilities: Record<string, number>;
    equity: Record<string, number>;
  };
  agedReceivables: XeroAgingRow[];
  agedPayables: XeroAgingRow[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  cashSummary: { month: string; cashIn: number; cashOut: number; netMovement: number }[];
  topCustomers: { contactId: string; name: string; totalRevenue: number; invoiceCount: number }[];
};

const invoicesRaw = invoicesJson as XeroInvoice[];
const billsRaw = billsJson as XeroBill[];
const contactsRaw = contactsJson as XeroContact[];
const bankAccountsRaw = bankAccountsJson as XeroBankAccount[];
const transactionsRaw = transactionsJson as XeroTransaction[];
const cashflowRaw = cashflowJson as XeroCashflowEntry[];
const reportsRaw = reportsJson as XeroReports;

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

export function getInvoices(filters: DataFilter = {}): XeroInvoice[] {
  return invoicesRaw.filter((invoice) => {
    const statusMatch = !filters.status || filters.status === "all" || invoice.status === filters.status;
    const customerMatch = !filters.customerId || invoice.contactId === filters.customerId;
    return statusMatch && customerMatch && matchesDate(invoice.date, filters) && matchesSearch([invoice.contactName, invoice.invoiceNumber, invoice.reference, invoice.status], filters.search);
  });
}

export function getInvoiceById(id: string): XeroInvoice | null {
  return invoicesRaw.find((invoice) => invoice.id === id) ?? null;
}

export function getBills(filters: DataFilter = {}): XeroBill[] {
  return billsRaw.filter((bill) => {
    const statusMatch = !filters.status || filters.status === "all" || bill.status === filters.status;
    const supplierMatch = !filters.vendorId || bill.contactId === filters.vendorId;
    return statusMatch && supplierMatch && matchesDate(bill.date, filters) && matchesSearch([bill.contactName, bill.reference, bill.status], filters.search);
  });
}

export function getBillById(id: string): XeroBill | null {
  return billsRaw.find((bill) => bill.id === id) ?? null;
}

export function getContacts(filters: DataFilter = {}): XeroContact[] {
  return contactsRaw.filter((contact) => {
    const typeMatch = !filters.type || filters.type === "all" || contact.type === filters.type || (filters.type === "customer" && contact.type === "both") || (filters.type === "supplier" && contact.type === "both");
    return typeMatch && matchesSearch([contact.name, contact.email, contact.phone, contact.group, contact.type], filters.search);
  });
}

export function getContactById(id: string): XeroContact | null {
  return contactsRaw.find((contact) => contact.id === id) ?? null;
}

export function getBankAccounts(): XeroBankAccount[] {
  return bankAccountsRaw;
}

export function getTransactions(accountId?: string): XeroTransaction[] {
  return accountId ? transactionsRaw.filter((transaction) => transaction.accountId === accountId) : transactionsRaw;
}

export function getCashflow(): XeroCashflowEntry[] {
  return cashflowRaw;
}

export function getReports(): XeroReports {
  return reportsRaw;
}