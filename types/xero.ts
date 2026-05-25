export interface XeroContact {
  id: string;
  name: string;
  email: string;
  type: "customer" | "supplier" | "employee";
}

export interface XeroInvoice {
  id: string;
  contactId: string;
  status: "draft" | "awaiting-approval" | "approved" | "paid";
  total: number;
  dueDate: string;
}

export interface XeroTransaction {
  id: string;
  date: string;
  payee: string;
  amount: number;
  account: string;
  status: "unreconciled" | "matched" | "reconciled";
}

export interface XeroSampleData {
  contacts: XeroContact[];
  invoices: XeroInvoice[];
  transactions: XeroTransaction[];
}
