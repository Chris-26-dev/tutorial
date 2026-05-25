"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart2, CheckCircle2, CreditCard, Eye, FileText, Mail, Plus, Printer, ReceiptText, Send, Trash2, Users } from "lucide-react";
import { Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BankAccount, CashflowEntry, Customer, Expense, Invoice, Reports, Transaction, Vendor } from "@/lib/data/quickbooks";
import { buildQuickBooksLiveReports } from "@/lib/liveReports";
import { CrudDialog, DataTable, type DataTableColumn, EmptyState, FilterTabs, formatCurrency, formatDate, initials, PageHeader, SearchInput, StatusBadge, SummaryCard, usePersistentState } from "@/components/shared";

const qbGreen = "#2CA01C";
const pieColors = ["#2CA01C", "#F59E0B", "#DC2626", "#6B7280", "#4D9DE0", "#8B5CF6", "#14B8A6", "#F97316"];

function currencyTooltip(value: unknown) {
  return formatCurrency(Number(value));
}

function total(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}

function useClientReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}

function ChartBox({ className, children }: { className: string; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <div className={className}>{mounted ? children : <div className="h-full w-full" />}</div>;
}

function SelectControl({ value, onChange, children, label }: { value: string; onChange: (value: string) => void; children: React.ReactNode; label: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
      <select className="h-10 rounded border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#2CA01C]" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function DetailUnavailable({ section, href }: { section: string; href: string }) {
  return <div className="space-y-5"><PageHeader title="Record unavailable" breadcrumb={[{ label: section, href }, { label: "Record unavailable" }]} /><div className="rounded border border-[#E3E8EE] bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">This record could not be found.</h2><p className="mt-2 text-sm text-slate-500">It may have been deleted, or the browser-local data was reset.</p><Link href={href} className="mt-4 inline-flex rounded bg-[#2CA01C] px-4 py-2 text-sm font-semibold text-white">Back to {section}</Link></div></div>;
}

export function QuickBooksDashboard({ invoices, expenses, transactions, reports }: { invoices: Invoice[]; expenses: Expense[]; transactions: Transaction[]; cashflow: CashflowEntry[]; reports: Reports }) {
  const totalIncome = total(invoices.map((invoice) => invoice.paid || invoice.total));
  const totalExpenses = total(expenses.map((expense) => expense.total));
  const netProfit = totalIncome - totalExpenses;
  const outstanding = total(invoices.map((invoice) => invoice.balanceDue));
  const chartData = reports.profitAndLoss.map((entry) => ({ month: entry.month.replace(" 2026", ""), Income: entry.income, Expenses: entry.totalExpenses }));
  const statusData = ["paid", "unpaid", "overdue", "draft"].map((status) => ({ name: status, value: invoices.filter((invoice) => invoice.status === status).length })).filter((item) => item.value > 0);
  const outstandingInvoices = invoices.filter((invoice) => invoice.balanceDue > 0).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" breadcrumb={[{ label: "QuickBooks" }, { label: "Dashboard" }]} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Income" value={formatCurrency(totalIncome)} delta={8.2} color={qbGreen} icon={<FileText className="h-5 w-5" />} />
        <SummaryCard label="Total Expenses" value={formatCurrency(totalExpenses)} delta={-3.4} color="#DC2626" icon={<CreditCard className="h-5 w-5" />} />
        <SummaryCard label="Net Profit" value={formatCurrency(netProfit)} delta={5.1} color={qbGreen} icon={<BarChart2 className="h-5 w-5" />} />
        <SummaryCard label="Outstanding Invoices" value={formatCurrency(outstanding)} delta={-1.8} color="#F59E0B" icon={<ReceiptText className="h-5 w-5" />} />
      </section>
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold text-slate-950">Cash flow</h2>
          <ChartBox className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip formatter={currencyTooltip} />
                <Legend />
                <Bar dataKey="Income" fill="#2CA01C" radius={[3, 3, 0, 0]} animationDuration={700} />
                <Bar dataKey="Expenses" fill="#DC2626" radius={[3, 3, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>
        <div className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-950">Invoice status</h2>
          {statusData.length ? (
            <ChartBox className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3} animationDuration={700}>
                    {statusData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>
          ) : <EmptyState icon={<FileText className="h-5 w-5" />} title="No invoices" description="Invoice status appears once invoices exist." />}
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm lg:col-span-3">
          <h2 className="mb-3 text-base font-semibold text-slate-950">Recent transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-2">Date</th><th>Description</th><th>Category</th><th className="text-right">Amount</th><th>Type</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-emerald-50/40">
                    <td className="py-3 text-slate-500">{formatDate(transaction.date)}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.category}</td>
                    <td className={`text-right font-semibold ${transaction.amount >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(transaction.amount)}</td>
                    <td className="capitalize">{transaction.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-slate-950">Outstanding invoices</h2>
          <div className="space-y-3">
            {outstandingInvoices.map((invoice) => (
              <Link key={invoice.id} href={`/quickbooks/invoices/${invoice.id}`} className="flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-950">{invoice.customerName}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(invoice.balanceDue)}</p>
                </div>
                <span className="rounded-full bg-[#F8D7DA] px-2 py-1 text-xs font-semibold text-[#721C24]">{invoice.dueDate < "2026-05-23" ? "Overdue" : "Due soon"}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-950">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["New Invoice", "Add Expense", "Record Payment", "Add Customer"].map((action) => (
            <button key={action} type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded bg-[#2CA01C] px-4 font-semibold text-white hover:bg-[#1E7A14]"><Plus className="h-4 w-4" />{action}</button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function QuickBooksInvoicesPage({ invoices, customers }: { invoices: Invoice[]; customers: Customer[] }) {
  const router = useRouter();
  const [invoiceRows, setInvoiceRows, resetInvoices] = usePersistentState("quickbooks.invoices", invoices);
  const [customerRows] = usePersistentState("quickbooks.customers", customers);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const customerOptions = useMemo(() => customerRows.map((customer) => ({ id: customer.id, name: customer.name, email: customer.email })), [customerRows]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "invoice") {
      setCreateOpen(true);
    }
  }, []);

  function recordPayment(ids: string[]) {
    setInvoiceRows((current) => current.map((invoice) => ids.includes(invoice.id) ? { ...invoice, status: "paid", paid: invoice.total, balanceDue: 0, payments: [...invoice.payments, { date: "2026-05-23", amount: invoice.balanceDue || invoice.total, method: "ACH", reference: `PMT-${invoice.invoiceNumber}` }] } : invoice));
    setSelectedIds([]);
  }

  function deleteInvoices(ids: string[]) {
    setInvoiceRows((current) => current.filter((invoice) => !ids.includes(invoice.id)));
    setSelectedIds([]);
  }

  function createInvoice(values: Record<string, string>) {
    const customer = customerOptions.find((item) => item.id === values.customerId) ?? customerOptions[0];
    const totalValue = Number(values.total || 0);
    const subtotal = Math.round((totalValue / 1.08) * 100) / 100;
    const tax = Math.round((totalValue - subtotal) * 100) / 100;
    const status = (values.status || "unpaid") as Invoice["status"];
    const paid = status === "paid" ? totalValue : 0;
    const invoice: Invoice = {
      id: `qb-local-inv-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      invoiceNumber: `INV-${Math.floor(3000 + Math.random() * 6000)}`,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      terms: "Net 30",
      status,
      amount: totalValue,
      subtotal,
      tax,
      total: totalValue,
      paid,
      balanceDue: totalValue - paid,
      lineItems: [{ description: values.description || "Accounting services", quantity: 1, rate: subtotal, amount: subtotal }],
      payments: paid ? [{ date: values.issueDate, amount: paid, method: "ACH", reference: "Initial payment" }] : []
    };
    setInvoiceRows((current) => [invoice, ...current]);
    setCreateOpen(false);
  }

  const filteredInvoices = useMemo(() => invoiceRows.filter((invoice) => {
    const statusMatch = activeStatus === "all" || invoice.status === activeStatus;
    const searchMatch = [invoice.customerName, invoice.invoiceNumber, invoice.status].join(" ").toLowerCase().includes(search.toLowerCase());
    const dateMatch = dateRange === "all" || invoice.issueDate >= "2026-05-01";
    return statusMatch && searchMatch && dateMatch;
  }), [activeStatus, dateRange, invoiceRows, search]);
  const tabs = ["all", "paid", "unpaid", "overdue", "draft"].map((status) => ({ label: status === "all" ? "All" : status[0].toUpperCase() + status.slice(1), value: status, count: status === "all" ? invoiceRows.length : invoiceRows.filter((invoice) => invoice.status === status).length }));
  const columns: DataTableColumn<Invoice>[] = [
    { key: "customer", header: "Customer", accessor: (invoice) => invoice.customerName, sortValue: (invoice) => invoice.customerName },
    { key: "number", header: "Invoice #", accessor: (invoice) => invoice.invoiceNumber, sortValue: (invoice) => invoice.invoiceNumber },
    { key: "issueDate", header: "Issue Date", accessor: (invoice) => formatDate(invoice.issueDate), sortValue: (invoice) => invoice.issueDate },
    { key: "dueDate", header: "Due Date", accessor: (invoice) => formatDate(invoice.dueDate), sortValue: (invoice) => invoice.dueDate },
    { key: "amount", header: "Amount", accessor: (invoice) => formatCurrency(invoice.total), sortValue: (invoice) => invoice.total, align: "right" },
    { key: "balance", header: "Balance Due", accessor: (invoice) => formatCurrency(invoice.balanceDue), sortValue: (invoice) => invoice.balanceDue, align: "right" },
    { key: "status", header: "Status", accessor: (invoice) => <StatusBadge status={invoice.status} variant="qb" />, sortValue: (invoice) => invoice.status },
    { key: "actions", header: "Actions", accessor: (invoice) => <div className="flex justify-end gap-2 opacity-0 transition group-hover:opacity-100"><button type="button" onClick={(event) => { event.stopPropagation(); recordPayment([invoice.id]); }} className="text-emerald-700 disabled:opacity-40" disabled={invoice.balanceDue === 0}>Pay</button><button type="button" onClick={(event) => { event.stopPropagation(); deleteInvoices([invoice.id]); }} className="text-red-700"><Trash2 className="h-4 w-4" /></button></div>, align: "right" }
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Invoices" breadcrumb={[{ label: "QuickBooks" }, { label: "Invoices" }]} actions={<><button className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetInvoices}>Reset data</button><button className="rounded bg-[#2CA01C] px-4 py-2 font-semibold text-white hover:bg-[#1E7A14]" onClick={() => setCreateOpen(true)}>New Invoice</button></>} />
      <div className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <FilterTabs tabs={tabs} activeTab={activeStatus} onChange={setActiveStatus} color={qbGreen} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <SearchInput placeholder="Search invoices" value={search} onChange={setSearch} />
            <SelectControl label="Date range" value={dateRange} onChange={setDateRange}><option value="all">All dates</option><option value="month">This month</option></SelectControl>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-[#E3E8EE] bg-white p-3"><p className="text-slate-500">Overdue</p><p className="text-xl font-semibold text-red-700">{formatCurrency(total(invoiceRows.filter((invoice) => invoice.status === "overdue").map((invoice) => invoice.balanceDue)))}</p></div>
        <div className="rounded border border-[#E3E8EE] bg-white p-3"><p className="text-slate-500">Due 30 days</p><p className="text-xl font-semibold text-amber-700">{formatCurrency(total(invoiceRows.filter((invoice) => invoice.status === "unpaid").map((invoice) => invoice.balanceDue)))}</p></div>
        <div className="rounded border border-[#E3E8EE] bg-white p-3"><p className="text-slate-500">Paid</p><p className="text-xl font-semibold text-emerald-700">{formatCurrency(total(invoiceRows.map((invoice) => invoice.paid)))}</p></div>
      </div>
      {selectedIds.length ? <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#2CA01C] bg-[#E6F4E3] px-4 py-3"><p className="font-semibold text-[#155724]">{selectedIds.length} selected</p><div className="flex gap-2"><button className="rounded bg-white px-3 py-1.5 text-sm font-semibold text-[#155724]" onClick={() => recordPayment(selectedIds)}>Record Payment</button><button className="rounded bg-white px-3 py-1.5 text-sm font-semibold text-red-700" onClick={() => deleteInvoices(selectedIds)}>Delete</button></div></div> : null}
      <DataTable columns={columns} data={filteredInvoices} selectable selectedIds={selectedIds} getRowId={(invoice) => invoice.id} onSelectRow={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onRowClick={(invoice) => router.push(`/quickbooks/invoices/${invoice.id}`)} paginated perPage={10} />
      <CrudDialog open={createOpen} title="New QuickBooks invoice" description="Creates an invoice in browser-local JSON state." accent={qbGreen} submitLabel="Create invoice" onClose={() => setCreateOpen(false)} onSubmit={createInvoice} fields={[{ name: "customerId", label: "Customer", type: "select", required: true, options: customerOptions.map((customer) => ({ label: customer.name, value: customer.id })) }, { name: "description", label: "Description", required: true }, { name: "issueDate", label: "Issue date", type: "date", required: true }, { name: "dueDate", label: "Due date", type: "date", required: true }, { name: "total", label: "Total", type: "number", step: "0.01", required: true }, { name: "status", label: "Status", type: "select", options: [{ label: "Unpaid", value: "unpaid" }, { label: "Draft", value: "draft" }, { label: "Paid", value: "paid" }] }]} />
    </div>
  );
}

export function QuickBooksInvoiceDetail({ invoice, customer }: { invoice: Invoice; customer: Customer | null }) {
  return (
    <div className="space-y-5">
      <PageHeader title={invoice.invoiceNumber} breadcrumb={[{ label: "Invoices", href: "/quickbooks/invoices" }, { label: invoice.invoiceNumber }]} actions={<><button className="rounded border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700"><Printer className="mr-2 inline h-4 w-4" />Print</button><button className="rounded border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700"><Send className="mr-2 inline h-4 w-4" />Send</button><button className="rounded bg-[#2CA01C] px-3 py-2 font-semibold text-white">Record Payment</button></>} />
      <div className="grid gap-5 lg:grid-cols-4">
        <section className="rounded border border-[#E3E8EE] bg-white p-6 shadow-sm lg:col-span-3">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row">
            <div><p className="text-sm font-semibold uppercase text-slate-500">Bill To</p><h2 className="mt-2 text-xl font-semibold text-slate-950">{invoice.customerName}</h2><p className="text-slate-500">{invoice.customerEmail}</p></div>
            <div className="grid gap-2 text-sm sm:text-right"><StatusBadge status={invoice.status} variant="qb" /><p>Issue: {formatDate(invoice.issueDate)}</p><p>Due: {formatDate(invoice.dueDate)}</p><p>Terms: {invoice.terms}</p></div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm"><thead className="text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="py-2">#</th><th>Description</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{invoice.lineItems.map((item, index) => <tr key={item.description}><td className="py-3">{index + 1}</td><td>{item.description}</td><td className="text-right">{item.quantity}</td><td className="text-right">{formatCurrency(item.rate)}</td><td className="text-right font-semibold">{formatCurrency(item.amount)}</td></tr>)}</tbody></table>
          </div>
          <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div><div className="flex justify-between"><span>Tax</span><span>{formatCurrency(invoice.tax)}</span></div><div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div><div className="flex justify-between"><span>Paid</span><span>{formatCurrency(invoice.paid)}</span></div><div className="flex justify-between text-lg font-semibold text-[#1E7A14]"><span>Balance Due</span><span>{formatCurrency(invoice.balanceDue)}</span></div></div>
          <div className="mt-6"><h3 className="mb-2 font-semibold text-slate-950">Payment history</h3>{invoice.payments.length ? <table className="min-w-full text-sm"><tbody>{invoice.payments.map((payment) => <tr key={payment.reference} className="border-t"><td className="py-2">{formatDate(payment.date)}</td><td>{payment.method}</td><td>{payment.reference}</td><td className="text-right">{formatCurrency(payment.amount)}</td></tr>)}</tbody></table> : <p className="text-sm text-slate-500">No payments recorded.</p>}</div>
        </section>
        <aside className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F4E3] font-semibold text-[#155724]">{initials(invoice.customerName)}</div><h2 className="mt-3 text-lg font-semibold text-slate-950">{invoice.customerName}</h2><p className="text-sm text-slate-500">{invoice.customerEmail}</p><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Total billed</span><span>{formatCurrency(customer?.totalBilled ?? invoice.total)}</span></div><div className="flex justify-between"><span>Outstanding</span><span className="font-semibold text-red-700">{formatCurrency(customer?.outstanding ?? invoice.balanceDue)}</span></div></div></aside>
      </div>
    </div>
  );
}

export function QuickBooksInvoiceDetailRouteClient({ id, invoices, customers }: { id: string; invoices: Invoice[]; customers: Customer[] }) {
  const [invoiceRows] = usePersistentState("quickbooks.invoices", invoices);
  const [customerRows] = usePersistentState("quickbooks.customers", customers);
  const ready = useClientReady();
  const invoice = useMemo(() => invoiceRows.find((item) => item.id === id) ?? null, [id, invoiceRows]);

  if (!invoice && !ready) {
    return null;
  }

  if (!invoice) {
    return <DetailUnavailable section="Invoices" href="/quickbooks/invoices" />;
  }

  const customer = customerRows.find((item) => item.id === invoice.customerId) ?? null;
  const customerInvoices = invoiceRows.filter((item) => item.customerId === invoice.customerId);
  const customerSummary = customer ? { ...customer, balance: total(customerInvoices.map((item) => item.balanceDue)), totalBilled: total(customerInvoices.map((item) => item.total)), totalPaid: total(customerInvoices.map((item) => item.paid)), outstanding: total(customerInvoices.map((item) => item.balanceDue)), invoiceCount: customerInvoices.length, lastInvoiceDate: [...customerInvoices.map((item) => item.issueDate)].sort().at(-1) ?? customer.lastInvoiceDate } : null;

  return <QuickBooksInvoiceDetail invoice={invoice} customer={customerSummary} />;
}

export function QuickBooksExpensesPage({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const [expenseRows, setExpenseRows, resetExpenses] = usePersistentState("quickbooks.expenses", expenses);
  const categories = ["all", ...Array.from(new Set(expenseRows.map((expense) => expense.category)))];
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "expense") {
      setCreateOpen(true);
    }
  }, []);

  function markExpensesPaid(ids: string[]) {
    setExpenseRows((current) => current.map((expense) => ids.includes(expense.id) ? { ...expense, status: "paid" } : expense));
    setSelectedIds([]);
  }

  function deleteExpenses(ids: string[]) {
    setExpenseRows((current) => current.filter((expense) => !ids.includes(expense.id)));
    setSelectedIds([]);
  }

  function createExpense(values: Record<string, string>) {
    const amount = Number(values.amount || 0);
    const taxAmount = Math.round(amount * 0.08 * 100) / 100;
    const expense: Expense = {
      id: `qb-local-exp-${Date.now()}`,
      vendorId: values.vendorName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      vendorName: values.vendorName,
      category: values.category,
      date: values.date,
      description: values.description,
      amount,
      taxAmount,
      total: Math.round((amount + taxAmount) * 100) / 100,
      paymentMethod: values.paymentMethod,
      status: (values.status || "pending") as Expense["status"],
      receiptNumber: `R-${Math.floor(6000 + Math.random() * 3000)}`,
      notes: values.notes || "Created in this browser session."
    };
    setExpenseRows((current) => [expense, ...current]);
    setCreateOpen(false);
  }

  const filteredExpenses = expenseRows.filter((expense) => (category === "all" || expense.category === category) && (paymentMethod === "all" || expense.paymentMethod === paymentMethod) && [expense.vendorName, expense.description, expense.category].join(" ").toLowerCase().includes(search.toLowerCase()));
  const categoryData = categories.filter((item) => item !== "all").map((item) => ({ name: item, value: total(expenseRows.filter((expense) => expense.category === item).map((expense) => expense.total)) }));
  const columns: DataTableColumn<Expense>[] = [
    { key: "date", header: "Date", accessor: (expense) => formatDate(expense.date), sortValue: (expense) => expense.date },
    { key: "vendor", header: "Vendor", accessor: (expense) => expense.vendorName, sortValue: (expense) => expense.vendorName },
    { key: "category", header: "Category", accessor: (expense) => expense.category, sortValue: (expense) => expense.category },
    { key: "description", header: "Description", accessor: (expense) => expense.description, sortValue: (expense) => expense.description },
    { key: "method", header: "Payment Method", accessor: (expense) => expense.paymentMethod, sortValue: (expense) => expense.paymentMethod },
    { key: "amount", header: "Amount", accessor: (expense) => formatCurrency(expense.total), sortValue: (expense) => expense.total, align: "right" },
    { key: "status", header: "Status", accessor: (expense) => <StatusBadge status={expense.status} variant="qb" />, sortValue: (expense) => expense.status },
    { key: "actions", header: "Actions", accessor: (expense) => <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button type="button" className="text-emerald-700 disabled:opacity-40" disabled={expense.status === "paid"} onClick={(event) => { event.stopPropagation(); markExpensesPaid([expense.id]); }}>Pay</button><button type="button" className="text-red-700" onClick={(event) => { event.stopPropagation(); deleteExpenses([expense.id]); }}><Trash2 className="h-4 w-4" /></button></div>, align: "right" }
  ];
  const monthTotal = total(expenseRows.filter((expense) => expense.date.startsWith("2026-05")).map((expense) => expense.total));
  const largest = [...categoryData].sort((left, right) => right.value - left.value)[0];

  return (
    <div className="space-y-5">
      <PageHeader title="Expenses" breadcrumb={[{ label: "QuickBooks" }, { label: "Expenses" }]} actions={<><button className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetExpenses}>Reset data</button><button className="rounded bg-[#2CA01C] px-4 py-2 font-semibold text-white hover:bg-[#1E7A14]" onClick={() => setCreateOpen(true)}>Add Expense</button></>} />
      <div className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><FilterTabs tabs={categories.map((item) => ({ label: item === "all" ? "All" : item, value: item }))} activeTab={category} onChange={setCategory} color={qbGreen} /><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><SearchInput placeholder="Search expenses" value={search} onChange={setSearch} /><SelectControl label="Payment" value={paymentMethod} onChange={setPaymentMethod}><option value="all">All methods</option><option value="Credit card">Credit card</option><option value="ACH">ACH</option><option value="Debit card">Debit card</option></SelectControl></div></div></div>
      <div className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Total This Month" value={formatCurrency(monthTotal)} color={qbGreen} /><SummaryCard label="This Quarter" value={formatCurrency(total(expenseRows.map((expense) => expense.total)))} color={qbGreen} /><SummaryCard label="Largest Category" value={largest ? largest.name : "None"} color="#F59E0B" /></div>
      {selectedIds.length ? <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#2CA01C] bg-[#E6F4E3] px-4 py-3"><p className="font-semibold text-[#155724]">{selectedIds.length} selected</p><div className="flex gap-2"><button className="rounded bg-white px-3 py-1.5 text-sm font-semibold text-[#155724]" onClick={() => markExpensesPaid(selectedIds)}>Mark Paid</button><button className="rounded bg-white px-3 py-1.5 text-sm font-semibold text-red-700" onClick={() => deleteExpenses(selectedIds)}>Delete</button></div></div> : null}
      <div className="grid gap-5 lg:grid-cols-10"><div className="lg:col-span-7"><DataTable columns={columns} data={filteredExpenses} onRowClick={(expense) => router.push(`/quickbooks/expenses/${expense.id}`)} paginated perPage={10} selectable selectedIds={selectedIds} onSelectRow={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} getRowId={(expense) => expense.id} /></div><div className="rounded border border-[#E3E8EE] bg-white p-4 shadow-sm lg:col-span-3"><h2 className="text-base font-semibold text-slate-950">By category</h2><ChartBox className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={95} animationDuration={700}>{categoryData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip formatter={currencyTooltip} /><Legend /></PieChart></ResponsiveContainer></ChartBox></div></div>
      <CrudDialog open={createOpen} title="New QuickBooks expense" description="Creates an expense in browser-local JSON state." accent={qbGreen} submitLabel="Create expense" onClose={() => setCreateOpen(false)} onSubmit={createExpense} fields={[{ name: "vendorName", label: "Vendor", required: true }, { name: "category", label: "Category", type: "select", required: true, options: ["Software", "Utilities", "Salaries", "Travel", "Office Supplies", "Marketing", "Professional Services", "Equipment"].map((item) => ({ label: item, value: item })) }, { name: "date", label: "Date", type: "date", required: true }, { name: "amount", label: "Amount", type: "number", step: "0.01", required: true }, { name: "paymentMethod", label: "Payment method", type: "select", options: [{ label: "Credit card", value: "Credit card" }, { label: "ACH", value: "ACH" }, { label: "Debit card", value: "Debit card" }] }, { name: "status", label: "Status", type: "select", options: [{ label: "Pending", value: "pending" }, { label: "Paid", value: "paid" }, { label: "Reimbursable", value: "reimbursable" }] }, { name: "description", label: "Description", type: "textarea", required: true }, { name: "notes", label: "Notes", type: "textarea" }]} />
    </div>
  );
}

export function QuickBooksExpenseDetail({ expense }: { expense: Expense }) {
  return <div className="mx-auto max-w-3xl space-y-5"><PageHeader title="Expense receipt" breadcrumb={[{ label: "Expenses", href: "/quickbooks/expenses" }, { label: expense.receiptNumber }]} /><section className="rounded border border-[#E3E8EE] bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row"><div><p className="text-sm uppercase tracking-wide text-slate-500">Vendor</p><h2 className="text-2xl font-semibold text-slate-950">{expense.vendorName}</h2><p className="mt-2"><StatusBadge status={expense.status} variant="qb" /></p></div><div className="text-sm sm:text-right"><p>{formatDate(expense.date)}</p><p>{expense.paymentMethod}</p><p>{expense.receiptNumber}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-sm font-semibold text-slate-500">Category</p><p className="mt-1 inline-flex rounded bg-[#E6F4E3] px-2 py-1 text-sm font-semibold text-[#155724]">{expense.category}</p></div><div><p className="text-sm font-semibold text-slate-500">Description</p><p className="mt-1 text-slate-800">{expense.description}</p></div></div><div className="ml-auto mt-6 max-w-sm space-y-2 border-t pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(expense.amount)}</span></div><div className="flex justify-between"><span>Tax</span><span>{formatCurrency(expense.taxAmount)}</span></div><div className="flex justify-between text-xl font-semibold"><span>Total</span><span>{formatCurrency(expense.total)}</span></div></div><div className="mt-6 rounded bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-500">Notes</p><p className="mt-1">{expense.notes}</p></div></section></div>;
}

export function QuickBooksExpenseDetailRouteClient({ id, expenses }: { id: string; expenses: Expense[] }) {
  const [expenseRows] = usePersistentState("quickbooks.expenses", expenses);
  const ready = useClientReady();
  const expense = useMemo(() => expenseRows.find((item) => item.id === id) ?? null, [expenseRows, id]);

  if (!expense && !ready) {
    return null;
  }

  if (!expense) {
    return <DetailUnavailable section="Expenses" href="/quickbooks/expenses" />;
  }

  return <QuickBooksExpenseDetail expense={expense} />;
}

export function QuickBooksCustomersPage({ customers }: { customers: Customer[] }) {
  const [customerRows, setCustomerRows, resetCustomers] = usePersistentState("quickbooks.customers", customers);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "customer") {
      setCreateOpen(true);
    }
  }, []);

  function createCustomer(values: Record<string, string>) {
    const customer: Customer = {
      id: `qb-local-customer-${Date.now()}`,
      name: values.name,
      email: values.email,
      balance: 0,
      totalBilled: 0,
      totalPaid: 0,
      outstanding: 0,
      invoiceCount: 0,
      lastInvoiceDate: "2026-05-23",
      status: "active"
    };
    setCustomerRows((current) => [customer, ...current]);
    setCreateOpen(false);
  }

  const filtered = customerRows.filter((customer) => (status === "all" || customer.status === status) && [customer.name, customer.email].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <><CardGrid title="Customers" basePath="/quickbooks/customers" records={filtered} tabs={[{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Overdue", value: "overdue" }]} active={status} onChange={setStatus} search={search} onSearch={setSearch} onDelete={(id) => setCustomerRows((current) => current.filter((customer) => customer.id !== id))} actions={<><button className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetCustomers}>Reset data</button><button className="rounded bg-[#2CA01C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E7A14]" onClick={() => setCreateOpen(true)}>Add Customer</button></>} /><CrudDialog open={createOpen} title="New QuickBooks customer" description="Creates a customer in browser-local JSON state." accent={qbGreen} submitLabel="Create customer" onClose={() => setCreateOpen(false)} onSubmit={createCustomer} fields={[{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }]} /></>;
}

export function QuickBooksVendorsPage({ vendors }: { vendors: Vendor[] }) {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const records = vendors.map((vendor) => ({ ...vendor, email: vendor.email, totalBilled: vendor.totalBilled, lastInvoiceDate: vendor.lastExpenseDate, invoiceCount: vendor.expenseCount }));
  const filtered = records.filter((vendor) => (status === "all" || vendor.status === status) && [vendor.name, vendor.email, vendor.category].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <CardGrid title="Vendors" basePath="/quickbooks/vendors" records={filtered} tabs={[{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Overdue", value: "overdue" }]} active={status} onChange={setStatus} search={search} onSearch={setSearch} />;
}

type GridRecord = { id: string; name: string; email: string; totalBilled: number; outstanding: number; lastInvoiceDate?: string; invoiceCount: number; status: string };

function CardGrid({ title, basePath, records, tabs, active, onChange, search, onSearch, actions, onDelete }: { title: string; basePath: string; records: GridRecord[]; tabs: { label: string; value: string }[]; active: string; onChange: (value: string) => void; search: string; onSearch: (value: string) => void; actions?: ReactNode; onDelete?: (id: string) => void }) {
  return <div className="space-y-5"><PageHeader title={title} breadcrumb={[{ label: "QuickBooks" }, { label: title }]} actions={actions} /><div className="flex flex-col gap-3 rounded border border-[#E3E8EE] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><FilterTabs tabs={tabs} activeTab={active} onChange={onChange} color={qbGreen} /><SearchInput placeholder={`Search ${title.toLowerCase()}`} value={search} onChange={onSearch} /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{records.map((record) => <div key={record.id} className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm hover:border-[#2CA01C]"><Link href={`${basePath}/${record.id}`}><div className="flex items-start gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F4E3] font-semibold text-[#155724]">{initials(record.name)}</div><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-slate-950">{record.name}</h2><p className="truncate text-sm text-slate-500">{record.email}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><p className="text-slate-500">Total billed</p><p className="font-semibold">{formatCurrency(record.totalBilled)}</p></div><div><p className="text-slate-500">Outstanding</p><p className={`font-semibold ${record.outstanding > 0 ? "text-red-700" : "text-emerald-700"}`}>{formatCurrency(record.outstanding)}</p></div><div><p className="text-slate-500">Last invoice</p><p className="font-semibold">{record.lastInvoiceDate ? formatDate(record.lastInvoiceDate) : "None"}</p></div><div><p className="text-slate-500">Count</p><p className="font-semibold">{record.invoiceCount}</p></div></div><span className="mt-5 inline-flex rounded bg-[#2CA01C] px-3 py-2 text-sm font-semibold text-white">View</span></Link>{onDelete ? <button type="button" className="mt-3 inline-flex items-center gap-2 rounded border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => onDelete(record.id)}><Trash2 className="h-4 w-4" />Delete</button> : null}</div>)}</div></div>;
}

export function QuickBooksCustomerDetail({ customer, invoices }: { customer: Customer; invoices: Invoice[] }) {
  return <HistoryDetail title={customer.name} backHref="/quickbooks/customers" email={customer.email} stats={[["Total Billed", customer.totalBilled], ["Total Paid", customer.totalPaid], ["Outstanding", customer.outstanding], ["# Invoices", customer.invoiceCount]]} rows={invoices} kind="invoice" />;
}

export function QuickBooksCustomerDetailRouteClient({ id, customers, invoices }: { id: string; customers: Customer[]; invoices: Invoice[] }) {
  const [customerRows] = usePersistentState("quickbooks.customers", customers);
  const [invoiceRows] = usePersistentState("quickbooks.invoices", invoices);
  const ready = useClientReady();
  const customer = useMemo(() => customerRows.find((item) => item.id === id) ?? null, [customerRows, id]);

  if (!customer && !ready) {
    return null;
  }

  if (!customer) {
    return <DetailUnavailable section="Customers" href="/quickbooks/customers" />;
  }

  const customerInvoices = invoiceRows.filter((invoice) => invoice.customerId === customer.id);

  return <QuickBooksCustomerDetail customer={{ ...customer, balance: total(customerInvoices.map((invoice) => invoice.balanceDue)), totalBilled: total(customerInvoices.map((invoice) => invoice.total)), totalPaid: total(customerInvoices.map((invoice) => invoice.paid)), outstanding: total(customerInvoices.map((invoice) => invoice.balanceDue)), invoiceCount: customerInvoices.length, lastInvoiceDate: [...customerInvoices.map((invoice) => invoice.issueDate)].sort().at(-1) ?? customer.lastInvoiceDate }} invoices={customerInvoices} />;
}

export function QuickBooksVendorDetail({ vendor, expenses }: { vendor: Vendor; expenses: Expense[] }) {
  return <HistoryDetail title={vendor.name} backHref="/quickbooks/vendors" email={vendor.email} stats={[['Total Billed', vendor.totalBilled], ['Total Paid', vendor.totalPaid], ['Outstanding', vendor.outstanding], ['# Expenses', vendor.expenseCount]]} rows={expenses} kind="expense" />;
}

function HistoryDetail({ title, backHref, email, stats, rows, kind }: { title: string; backHref: string; email: string; stats: [string, number][]; rows: (Invoice | Expense)[]; kind: "invoice" | "expense" }) {
  return <div className="space-y-5"><PageHeader title={title} breadcrumb={[{ label: backHref.includes("customers") ? "Customers" : "Vendors", href: backHref }, { label: title }]} /><div className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm"><p className="text-slate-500">{email}</p><div className="mt-5 grid gap-3 sm:grid-cols-4">{stats.map(([label, value]) => <div key={label} className="rounded bg-slate-50 p-3"><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-semibold">{label.startsWith("#") ? value : formatCurrency(value)}</p></div>)}</div></div><div className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm"><h2 className="mb-3 text-base font-semibold text-slate-950">History</h2><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Date</th><th>{kind === "invoice" ? "Invoice" : "Receipt"}</th><th>Status</th><th className="text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id}><td className="py-3">{formatDate(kind === "invoice" ? (row as Invoice).issueDate : (row as Expense).date)}</td><td>{kind === "invoice" ? (row as Invoice).invoiceNumber : (row as Expense).receiptNumber}</td><td><StatusBadge status={row.status} variant="qb" /></td><td className="text-right font-semibold">{formatCurrency(kind === "invoice" ? (row as Invoice).total : (row as Expense).total)}</td></tr>)}</tbody></table></div></div></div>;
}

export function QuickBooksBankingPage({ accounts }: { accounts: BankAccount[] }) {
  return <div className="space-y-5"><PageHeader title="Banking" breadcrumb={[{ label: "QuickBooks" }, { label: "Banking" }]} /><div className="grid gap-4 lg:grid-cols-3">{accounts.map((account) => <Link key={account.id} href={`/quickbooks/banking/${account.id}`} className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm hover:border-[#2CA01C]"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-950">{account.bankName}</h2><p className="text-sm text-slate-500">{account.name} • {account.accountNumber}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize">{account.type}</span></div><p className="mt-5 text-3xl font-semibold">{formatCurrency(account.currentBalance)}</p><p className="text-sm text-slate-500">Available {formatCurrency(account.availableBalance)}</p><p className="mt-3 text-sm text-slate-500">Last reconciled {formatDate(account.lastReconciled)}</p><span className="mt-5 inline-flex rounded bg-[#2CA01C] px-3 py-2 text-sm font-semibold text-white">View Transactions</span></Link>)}</div></div>;
}

export function QuickBooksBankAccountDetail({ account, transactions }: { account: BankAccount; transactions: Transaction[] }) {
  const [transactionRows, setTransactionRows, resetTransactions] = usePersistentState(`quickbooks.transactions.${account.id}`, transactions);
  const [filter, setFilter] = useState("all");
  const filtered = transactionRows.filter((transaction) => filter === "all" || (filter === "reconciled" ? transaction.reconciled : !transaction.reconciled));
  const unreconciledCount = transactionRows.filter((transaction) => !transaction.reconciled).length;

  function reconcileTransactions(ids: string[]) {
    setTransactionRows((current) => current.map((transaction) => ids.includes(transaction.id) ? { ...transaction, reconciled: true, status: "reconciled" } : transaction));
  }

  return <div className="space-y-5"><PageHeader title={account.name} breadcrumb={[{ label: "Banking", href: "/quickbooks/banking" }, { label: account.name }]} actions={<><button className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetTransactions}>Reset</button><button className="rounded bg-[#2CA01C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E7A14]" onClick={() => reconcileTransactions(filtered.filter((transaction) => !transaction.reconciled).map((transaction) => transaction.id))}>Reconcile Visible</button></>} /><div className="grid gap-4 lg:grid-cols-4"><div className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm lg:col-span-3"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="text-xl font-semibold text-slate-950">{account.bankName} • {account.accountNumber}</h2><p className="text-slate-500">Balance {formatCurrency(account.currentBalance)}</p></div><FilterTabs tabs={[{ label: "All", value: "all" }, { label: "Reconciled", value: "reconciled" }, { label: "Unreconciled", value: "unreconciled" }]} activeTab={filter} onChange={setFilter} color={qbGreen} /></div></div><aside className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Unreconciled</p><p className="mt-2 text-3xl font-semibold text-orange-700">{unreconciledCount}</p><p className="mt-3 text-sm text-slate-500">Last reconciled {formatDate(account.lastReconciled)}</p></aside></div><div className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Date</th><th>Description</th><th>Reference</th><th className="text-right">Spent</th><th className="text-right">Received</th><th className="text-right">Balance</th><th>✓</th><th className="text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((transaction) => <tr key={transaction.id}><td className="py-3">{formatDate(transaction.date)}</td><td>{transaction.description}</td><td>{transaction.reference}</td><td className="text-right text-red-700">{transaction.spent ? formatCurrency(transaction.spent) : ""}</td><td className="text-right text-emerald-700">{transaction.received ? formatCurrency(transaction.received) : ""}</td><td className="text-right">{formatCurrency(transaction.balance)}</td><td>{transaction.reconciled ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : null}</td><td className="text-right">{transaction.reconciled ? <span className="text-slate-400">Done</span> : <button type="button" className="font-semibold text-[#2CA01C]" onClick={() => reconcileTransactions([transaction.id])}>Reconcile</button>}</td></tr>)}</tbody></table></div></div></div>;
}

export function QuickBooksReportsPage({ reports, invoices, expenses }: { reports: Reports; invoices: Invoice[]; expenses: Expense[] }) {
  const [active, setActive] = useState("profit");
  const [invoiceRows] = usePersistentState("quickbooks.invoices", invoices);
  const [expenseRows] = usePersistentState("quickbooks.expenses", expenses);
  const liveReports = useMemo(() => buildQuickBooksLiveReports(reports, invoices, invoiceRows, expenses, expenseRows), [expenseRows, expenses, invoiceRows, invoices, reports]);
  const reportList = [{ id: "profit", label: "Profit and Loss" }, { id: "balance", label: "Balance Sheet" }, { id: "expenses", label: "Expenses by Category" }, { id: "aged", label: "Aged Receivables" }, { id: "customers", label: "Top Customers" }];
  return <div className="space-y-5"><PageHeader title="Reports" breadcrumb={[{ label: "QuickBooks" }, { label: "Reports" }]} /><div className="grid gap-5 lg:grid-cols-5"><aside className="rounded border border-[#E3E8EE] bg-white p-3 shadow-sm lg:col-span-1">{reportList.map((report) => <button key={report.id} type="button" className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm font-semibold ${active === report.id ? "bg-[#E6F4E3] text-[#155724]" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setActive(report.id)}>{report.label}</button>)}</aside><section className="rounded border border-[#E3E8EE] bg-white p-5 shadow-sm lg:col-span-4">{active === "profit" ? <ProfitReport reports={liveReports} /> : null}{active === "balance" ? <BalanceReport reports={liveReports} /> : null}{active === "expenses" ? <ExpenseReport reports={liveReports} /> : null}{active === "aged" ? <AgedReport reports={liveReports} /> : null}{active === "customers" ? <TopCustomersReport reports={liveReports} /> : null}</section></div></div>;
}

function ProfitReport({ reports }: { reports: Reports }) {
  return <div><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">Profit and Loss</h2><select className="h-9 rounded border border-slate-200 px-3 text-sm"><option>Last 6 months</option></select></div><ChartBox className="h-64"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><LineChart data={reports.profitAndLoss}><XAxis dataKey="month" /><YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} /><Tooltip formatter={currencyTooltip} /><Legend /><Line type="monotone" dataKey="income" stroke="#2CA01C" strokeWidth={2} animationDuration={700} /><Line type="monotone" dataKey="netProfit" stroke="#0EA5E9" strokeWidth={2} animationDuration={700} /></LineChart></ResponsiveContainer></ChartBox><div className="mt-5 overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Month</th><th className="text-right">Income</th><th className="text-right">COGS</th><th className="text-right">Gross</th><th className="text-right">Expenses</th><th className="text-right">Net</th></tr></thead><tbody className="divide-y divide-slate-100">{reports.profitAndLoss.map((row) => <tr key={row.month}><td className="py-3">{row.month}</td><td className="text-right">{formatCurrency(row.income)}</td><td className="text-right">{formatCurrency(row.costOfGoods)}</td><td className="text-right">{formatCurrency(row.grossProfit)}</td><td className="text-right">{formatCurrency(row.totalExpenses)}</td><td className="text-right font-semibold">{formatCurrency(row.netProfit)}</td></tr>)}</tbody></table></div></div>;
}

function BalanceReport({ reports }: { reports: Reports }) {
  return <div><h2 className="mb-4 text-lg font-semibold text-slate-950">Balance Sheet</h2><div className="grid gap-5 md:grid-cols-2"><ReportBucket title="Assets" values={reports.balanceSheet.assets} /><div className="space-y-5"><ReportBucket title="Liabilities" values={reports.balanceSheet.liabilities} /><ReportBucket title="Equity" values={reports.balanceSheet.equity} /></div></div></div>;
}

function ReportBucket({ title, values }: { title: string; values: Record<string, number> }) {
  return <div className="rounded border border-slate-200 p-4"><h3 className="mb-3 font-semibold text-slate-950">{title}</h3>{Object.entries(values).map(([label, value]) => <div key={label} className="flex justify-between border-b border-slate-100 py-2 text-sm"><span>{label}</span><span className="font-semibold">{formatCurrency(value)}</span></div>)}<div className="flex justify-between pt-3 font-semibold"><span>Total</span><span>{formatCurrency(total(Object.values(values)))}</span></div></div>;
}

function ExpenseReport({ reports }: { reports: Reports }) {
  return <div><h2 className="mb-4 text-lg font-semibold text-slate-950">Expenses by Category</h2><div className="grid gap-5 lg:grid-cols-2"><ChartBox className="h-72"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><PieChart><Pie data={reports.expensesByCategory} dataKey="amount" nameKey="category" outerRadius={95} animationDuration={700}>{reports.expensesByCategory.map((entry, index) => <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip formatter={currencyTooltip} /><Legend /></PieChart></ResponsiveContainer></ChartBox><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Category</th><th className="text-right">Amount</th><th className="text-right">%</th></tr></thead><tbody>{reports.expensesByCategory.map((row) => <tr key={row.category} className="border-t"><td className="py-2">{row.category}</td><td className="text-right">{formatCurrency(row.amount)}</td><td className="text-right">{row.percentage.toFixed(1)}%</td></tr>)}</tbody></table></div></div>;
}

function AgedReport({ reports }: { reports: Reports }) {
  return <div><h2 className="mb-4 text-lg font-semibold text-slate-950">Aged Receivables</h2><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Customer</th><th className="text-right">Current</th><th className="text-right">1-30</th><th className="text-right">31-60</th><th className="text-right">61-90</th><th className="text-right">90+</th><th className="text-right">Total</th></tr></thead><tbody>{reports.agedReceivables.map((row) => <tr key={row.name} className="border-t"><td className="py-3">{row.name}</td><td className="text-right">{formatCurrency(row.current)}</td><td className="bg-amber-50 text-right">{formatCurrency(row.days30)}</td><td className="bg-orange-50 text-right">{formatCurrency(row.days60)}</td><td className="bg-red-50 text-right">{formatCurrency(row.days90)}</td><td className="bg-red-100 text-right">{formatCurrency(row.over90)}</td><td className="text-right font-semibold">{formatCurrency(row.total)}</td></tr>)}</tbody></table></div></div>;
}

function TopCustomersReport({ reports }: { reports: Reports }) {
  return <div><h2 className="mb-4 text-lg font-semibold text-slate-950">Top Customers</h2><div className="grid gap-5 lg:grid-cols-2"><ChartBox className="h-72"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={reports.topCustomers} layout="vertical"><XAxis type="number" tickFormatter={(value) => `$${Number(value) / 1000}k`} /><YAxis dataKey="name" type="category" width={110} /><Tooltip formatter={currencyTooltip} /><Bar dataKey="totalRevenue" fill="#2CA01C" animationDuration={700} /></BarChart></ResponsiveContainer></ChartBox><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Rank</th><th>Customer</th><th className="text-right">Revenue</th><th className="text-right">Invoices</th></tr></thead><tbody>{reports.topCustomers.map((row, index) => <tr key={row.customerId} className="border-t"><td className="py-2">{index + 1}</td><td>{row.name}</td><td className="text-right">{formatCurrency(row.totalRevenue)}</td><td className="text-right">{row.invoiceCount}</td></tr>)}</tbody></table></div></div>;
}