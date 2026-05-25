export interface QuickBooksCustomer {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface QuickBooksVendor {
  id: string;
  name: string;
  category: string;
  balance: number;
}

export interface QuickBooksInvoice {
  id: string;
  customerId: string;
  status: "draft" | "sent" | "paid";
  total: number;
  dueDate: string;
}

export interface QuickBooksTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: "for-review" | "matched" | "reconciled";
}

export interface QuickBooksSampleData {
  customers: QuickBooksCustomer[];
  vendors: QuickBooksVendor[];
  invoices: QuickBooksInvoice[];
  transactions: QuickBooksTransaction[];
}
