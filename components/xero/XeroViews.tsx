"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart2, CheckCircle2, Clock, CreditCard, Edit, Eye, FileText, Landmark, Receipt, Send, Trash2, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { XeroBankAccount, XeroBill, XeroCashflowEntry, XeroContact, XeroInvoice, XeroReports, XeroTransaction } from "@/lib/data/xero";
import { buildXeroLiveReports } from "@/lib/liveReports";
import { CrudDialog, DataTable, type DataTableColumn, FilterTabs, formatCurrency, formatDate, initials, PageHeader, SearchInput, StatusBadge, SummaryCard, usePersistentState } from "@/components/shared";

const xeroBlue = "#13B5EA";

function currencyTooltip(value: unknown) {
  return formatCurrency(Number(value));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
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
      <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#13B5EA]" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

export function XeroDashboard({ invoices, bills, accounts, transactions, cashflow }: { invoices: XeroInvoice[]; bills: XeroBill[]; accounts: XeroBankAccount[]; transactions: XeroTransaction[]; cashflow: XeroCashflowEntry[] }) {
  const moneyIn = sum(invoices.map((invoice) => invoice.paid));
  const moneyOut = sum(bills.map((bill) => bill.total - bill.amountDue));
  const outstanding = sum(invoices.map((invoice) => invoice.due));
  const overdueBills = sum(bills.filter((bill) => bill.status === "overdue").map((bill) => bill.amountDue));
  const todos = [
    { label: `${invoices.filter((invoice) => invoice.status === "overdue").length} invoices overdue`, href: "/xero/invoices" },
    { label: `${bills.filter((bill) => bill.status === "awaiting_payment").length} bills due this week`, href: "/xero/bills" },
    { label: `${sum(accounts.map((account) => account.unreconciledCount))} items to reconcile`, href: "/xero/bank" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" breadcrumb={[{ label: "Xero" }, { label: "Dashboard" }]} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Money In" value={formatCurrency(moneyIn)} delta={7.8} color="#13B5EA" icon={<FileText className="h-5 w-5" />} topBorder />
        <SummaryCard label="Money Out" value={formatCurrency(moneyOut)} delta={-2.1} color="#F97316" icon={<Receipt className="h-5 w-5" />} topBorder />
        <SummaryCard label="Outstanding" value={formatCurrency(outstanding)} delta={3.2} color="#6366F1" icon={<Clock className="h-5 w-5" />} topBorder />
        <SummaryCard label="Overdue Bills" value={formatCurrency(overdueBills)} delta={-4.4} color="#DC2626" icon={<CreditCard className="h-5 w-5" />} topBorder />
      </section>
      <section className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Account Watchlist</h2>
            <div className="mt-4 space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold text-slate-950">{account.accountName}</p><p className="text-sm text-slate-500">{formatCurrency(account.currentBalance)} {account.currency}</p></div>
                    {account.unreconciledCount > 0 ? <Link href={`/xero/bank/${account.id}`} className="text-sm font-semibold text-[#13B5EA]">Reconcile</Link> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  </div>
                  <ChartBox className="mt-3 h-12"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><LineChart data={account.sparkline.map((value, index) => ({ index, value }))}><Line type="monotone" dataKey="value" stroke={account.color} dot={false} strokeWidth={2} animationDuration={700} /></LineChart></ResponsiveContainer></ChartBox>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">To Do</h2>
            <div className="mt-3 space-y-2">{todos.map((todo) => <Link key={todo.label} href={todo.href} className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-sky-50">{todo.label}</Link>)}</div>
          </div>
        </div>
        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Cash Flow Forecast</h2>
            <ChartBox className="mt-4 h-80"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><AreaChart data={cashflow}><XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} /><YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} /><Tooltip formatter={currencyTooltip} /><Legend /><Area type="monotone" dataKey="projectedBalance" name="Projected balance" stroke="#13B5EA" fill="#13B5EA" fillOpacity={0.18} animationDuration={700} /><Area type="monotone" dataKey="actualBalance" name="Actual balance" stroke="#10B981" fill="#10B981" fillOpacity={0.12} animationDuration={700} /></AreaChart></ResponsiveContainer></ChartBox>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Recent Activity</h2>
            <div className="mt-3 divide-y divide-slate-100">{transactions.slice(0, 10).map((transaction) => <div key={transaction.id} className="flex items-center gap-3 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-[#13B5EA]"><Landmark className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium text-slate-950">{transaction.description}</p><p className="text-sm text-slate-500">{formatDate(transaction.date)} • {accounts.find((account) => account.id === transaction.accountId)?.accountName}</p></div><p className={`font-semibold ${transaction.amount >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(transaction.amount)}</p></div>)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function XeroInvoicesPage({ invoices, contacts }: { invoices: XeroInvoice[]; contacts: XeroContact[] }) {
  const router = useRouter();
  const [invoiceRows, setInvoiceRows, resetInvoices] = usePersistentState("xero.invoices", invoices);
  const [contactRows] = usePersistentState("xero.contacts", contacts);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [sort, setSort] = useState("date_desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "invoice") {
      setCreateOpen(true);
    }
  }, []);

  function handleCreateInvoice(values: Record<string, string>) {
    const contact = contactRows.find((item) => item.id === values.contactId) ?? contactRows[0];
    const total = Number(values.total || 0);
    const subtotal = Math.round((total / 1.08) * 100) / 100;
    const tax = Math.round((total - subtotal) * 100) / 100;
    const invoice: XeroInvoice = {
      id: `xe-local-inv-${Date.now()}`,
      contactId: contact.id,
      contactName: contact.name,
      invoiceNumber: `INV-${Math.floor(3000 + Math.random() * 6000)}`,
      reference: values.reference || "New invoice",
      date: values.date,
      dueDate: values.dueDate,
      status: (values.status || "draft") as XeroInvoice["status"],
      paid: 0,
      due: total,
      subtotal,
      tax,
      total,
      notes: "Created in this browser session.",
      lineItems: [{ description: values.reference || "Accounting services", quantity: 1, unitPrice: subtotal, discount: 0, tax, amount: total }],
      payments: [],
      activity: [{ label: "Created", date: values.date }]
    };
    setInvoiceRows((current) => [invoice, ...current]);
    setCreateOpen(false);
  }

  function deleteInvoices(ids: string[]) {
    setInvoiceRows((current) => current.filter((invoice) => !ids.includes(invoice.id)));
    setSelectedIds([]);
  }

  function markInvoicesPaid(ids: string[]) {
    setInvoiceRows((current) => current.map((invoice) => ids.includes(invoice.id) ? { ...invoice, status: "paid", paid: invoice.total, due: 0, payments: [...invoice.payments, { date: "2026-05-23", amount: invoice.due || invoice.total, method: "Bank transfer", reference: `PAY-${invoice.invoiceNumber}` }], activity: [...invoice.activity, { label: "Paid", date: "2026-05-23" }] } : invoice));
    setSelectedIds([]);
  }

  const filteredInvoices = useMemo(() => {
    const rows = invoiceRows.filter((invoice) => (activeStatus === "all" || invoice.status === activeStatus) && (customer === "all" || invoice.contactId === customer) && [invoice.contactName, invoice.invoiceNumber, invoice.reference].join(" ").toLowerCase().includes(search.toLowerCase()));
    return [...rows].sort((left, right) => sort === "due_asc" ? left.dueDate.localeCompare(right.dueDate) : right.date.localeCompare(left.date));
  }, [activeStatus, customer, invoiceRows, search, sort]);
  const tabs = ["all", "draft", "awaiting_payment", "paid", "repeating"].map((status) => ({ label: status === "all" ? "All" : status === "awaiting_payment" ? "Awaiting Payment" : status[0].toUpperCase() + status.slice(1), value: status, count: status === "all" ? invoiceRows.length : invoiceRows.filter((invoice) => invoice.status === status).length }));
  const columns: DataTableColumn<XeroInvoice>[] = [
    { key: "to", header: "To", accessor: (invoice) => invoice.contactName, sortValue: (invoice) => invoice.contactName },
    { key: "number", header: "Invoice #", accessor: (invoice) => invoice.invoiceNumber, sortValue: (invoice) => invoice.invoiceNumber },
    { key: "reference", header: "Reference", accessor: (invoice) => invoice.reference, sortValue: (invoice) => invoice.reference },
    { key: "date", header: "Date", accessor: (invoice) => formatDate(invoice.date), sortValue: (invoice) => invoice.date },
    { key: "due", header: "Due Date", accessor: (invoice) => formatDate(invoice.dueDate), sortValue: (invoice) => invoice.dueDate },
    { key: "paid", header: "Paid", accessor: (invoice) => formatCurrency(invoice.paid), sortValue: (invoice) => invoice.paid, align: "right" },
    { key: "amountDue", header: "Due", accessor: (invoice) => formatCurrency(invoice.due), sortValue: (invoice) => invoice.due, align: "right" },
    { key: "status", header: "Status", accessor: (invoice) => <StatusBadge status={invoice.status} variant="xero" />, sortValue: (invoice) => invoice.status },
    { key: "actions", header: "", accessor: (invoice) => <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button type="button" onClick={(event) => { event.stopPropagation(); markInvoicesPaid([invoice.id]); }} className="text-emerald-700 disabled:opacity-40" disabled={invoice.due === 0}>Pay</button><button type="button" onClick={(event) => { event.stopPropagation(); deleteInvoices([invoice.id]); }} className="text-red-700"><Trash2 className="h-4 w-4" /></button></div> }
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Invoices" breadcrumb={[{ label: "Xero" }, { label: "Invoices" }]} actions={<><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetInvoices}>Reset data</button><button className="rounded-lg bg-[#13B5EA] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E9FD4]" onClick={() => setCreateOpen(true)}>New Invoice</button></>} />
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="space-y-4"><FilterTabs tabs={tabs} activeTab={activeStatus} onChange={setActiveStatus} variant="underline" color={xeroBlue} /><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><SearchInput placeholder="Search invoices" value={search} onChange={setSearch} /><div className="flex flex-col gap-3 sm:flex-row"><SelectControl label="Customer" value={customer} onChange={setCustomer}><option value="all">All customers</option>{contactRows.filter((contact) => contact.type !== "supplier").map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</SelectControl><SelectControl label="Sort" value={sort} onChange={setSort}><option value="date_desc">Newest</option><option value="due_asc">Due soon</option></SelectControl></div></div></div></div>
      <div className="grid gap-3 sm:grid-cols-4"><MiniSummary label="Draft" value={sum(invoiceRows.filter((invoice) => invoice.status === "draft").map((invoice) => invoice.total))} /><MiniSummary label="Awaiting" value={sum(invoiceRows.filter((invoice) => invoice.status === "awaiting_payment").map((invoice) => invoice.due))} /><MiniSummary label="Overdue" value={sum(invoiceRows.filter((invoice) => invoice.status === "overdue").map((invoice) => invoice.due))} /><MiniSummary label="Paid" value={sum(invoiceRows.map((invoice) => invoice.paid))} /></div>
      {selectedIds.length ? <BulkBar count={selectedIds.length} actions={[{ label: "Mark Paid", onClick: () => markInvoicesPaid(selectedIds) }, { label: "Delete", onClick: () => deleteInvoices(selectedIds), danger: true }]} /> : null}
      <DataTable columns={columns} data={filteredInvoices} selectable selectedIds={selectedIds} getRowId={(invoice) => invoice.id} onSelectRow={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onRowClick={(invoice) => router.push(`/xero/invoices/${invoice.id}`)} paginated perPage={15} />
      <CrudDialog open={createOpen} title="New Xero invoice" description="Creates an invoice in browser-local JSON state." accent={xeroBlue} submitLabel="Create invoice" onClose={() => setCreateOpen(false)} onSubmit={handleCreateInvoice} fields={[{ name: "contactId", label: "Customer", type: "select", required: true, options: contactRows.filter((contact) => contact.type !== "supplier").map((contact) => ({ label: contact.name, value: contact.id })) }, { name: "reference", label: "Reference", required: true }, { name: "date", label: "Date", type: "date", required: true }, { name: "dueDate", label: "Due date", type: "date", required: true }, { name: "total", label: "Total", type: "number", step: "0.01", required: true }, { name: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Awaiting Payment", value: "awaiting_payment" }] }]} />
    </div>
  );
}

function MiniSummary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-semibold text-slate-950">{formatCurrency(value)}</p></div>;
}

function BulkBar({ count, actions }: { count: number; actions: { label: string; onClick: () => void; danger?: boolean }[] }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#13B5EA] bg-sky-50 px-4 py-3"><p className="font-semibold text-slate-950">{count} selected</p><div className="flex flex-wrap gap-2">{actions.map((action) => <button key={action.label} type="button" onClick={action.onClick} className={`rounded-lg bg-white px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-slate-50 ${action.danger ? "text-red-700" : "text-slate-700"}`}>{action.label}</button>)}</div></div>;
}

function DetailUnavailable({ section, href }: { section: string; href: string }) {
  return <div className="space-y-5"><PageHeader title="Record unavailable" breadcrumb={[{ label: section, href }, { label: "Record unavailable" }]} /><div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">This record could not be found.</h2><p className="mt-2 text-sm text-slate-500">It may have been deleted, or the browser-local data was reset.</p><Link href={href} className="mt-4 inline-flex rounded-lg bg-[#13B5EA] px-4 py-2 text-sm font-semibold text-white">Back to {section}</Link></div></div>;
}

export function XeroInvoiceDetail({ invoice, contact }: { invoice: XeroInvoice; contact: XeroContact | null }) {
  return <DocumentDetail kind="invoice" title={invoice.invoiceNumber} backHref="/xero/invoices" status={invoice.status} dueInfo={`Due ${formatDate(invoice.dueDate)}`} name={invoice.contactName} email={contact?.email ?? "accounts@example"} reference={invoice.reference} date={invoice.date} dueDate={invoice.dueDate} amountDue={invoice.due} subtotal={invoice.subtotal} tax={invoice.tax} total={invoice.total} paid={invoice.paid} notes={invoice.notes} lineItems={invoice.lineItems} payments={invoice.payments} activity={invoice.activity} />;
}

export function XeroInvoiceDetailRouteClient({ id, invoices, contacts }: { id: string; invoices: XeroInvoice[]; contacts: XeroContact[] }) {
  const [invoiceRows] = usePersistentState("xero.invoices", invoices);
  const [contactRows] = usePersistentState("xero.contacts", contacts);
  const ready = useClientReady();
  const invoice = useMemo(() => invoiceRows.find((item) => item.id === id) ?? null, [id, invoiceRows]);

  if (!invoice && !ready) {
    return null;
  }

  if (!invoice) {
    return <DetailUnavailable section="Invoices" href="/xero/invoices" />;
  }

  return <XeroInvoiceDetail invoice={invoice} contact={contactRows.find((contact) => contact.id === invoice.contactId) ?? null} />;
}

export function XeroBillsPage({ bills }: { bills: XeroBill[] }) {
  const router = useRouter();
  const [billRows, setBillRows, resetBills] = usePersistentState("xero.bills", bills);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "bill") {
      setCreateOpen(true);
    }
  }, []);

  const suppliers = useMemo(() => Array.from(new Map(billRows.map((bill) => [bill.contactId, { id: bill.contactId, name: bill.contactName }])).values()), [billRows]);

  function processBills(ids: string[]) {
    setBillRows((current) => current.map((bill) => ids.includes(bill.id) ? { ...bill, status: "paid", amountDue: 0, payments: [...bill.payments, { date: "2026-05-23", amount: bill.amountDue, method: "Bank payment", reference: `PAY-${bill.reference}` }], activity: [...bill.activity, { label: "Paid", date: "2026-05-23" }] } : bill));
    setSelectedIds([]);
  }

  function deleteBills(ids: string[]) {
    setBillRows((current) => current.filter((bill) => !ids.includes(bill.id)));
    setSelectedIds([]);
  }

  function createBill(values: Record<string, string>) {
    const supplier = suppliers.find((item) => item.id === values.contactId) ?? suppliers[0];
    const total = Number(values.total || 0);
    const subtotal = Math.round((total / 1.08) * 100) / 100;
    const tax = Math.round((total - subtotal) * 100) / 100;
    const bill: XeroBill = {
      id: `xe-local-bill-${Date.now()}`,
      contactId: supplier.id,
      contactName: supplier.name,
      reference: values.reference || `BILL-${Math.floor(4000 + Math.random() * 4000)}`,
      date: values.date,
      dueDate: values.dueDate,
      plannedDate: values.plannedDate,
      status: (values.status || "awaiting_payment") as XeroBill["status"],
      amountDue: total,
      subtotal,
      tax,
      total,
      notes: "Created in this browser session.",
      lineItems: [{ description: values.reference || "Supplier bill", quantity: 1, unitPrice: subtotal, discount: 0, tax, amount: total }],
      payments: [],
      activity: [{ label: "Created", date: values.date }]
    };
    setBillRows((current) => [bill, ...current]);
    setCreateOpen(false);
  }

  const filteredBills = billRows.filter((bill) => (activeStatus === "all" || bill.status === activeStatus) && [bill.contactName, bill.reference].join(" ").toLowerCase().includes(search.toLowerCase()));
  const tabs = ["all", "draft", "awaiting_payment", "paid", "overdue"].map((status) => ({ label: status === "all" ? "All" : status === "awaiting_payment" ? "Awaiting Payment" : status[0].toUpperCase() + status.slice(1), value: status, count: status === "all" ? billRows.length : billRows.filter((bill) => bill.status === status).length }));
  const columns: DataTableColumn<XeroBill>[] = [
    { key: "from", header: "From", accessor: (bill) => bill.contactName, sortValue: (bill) => bill.contactName },
    { key: "reference", header: "Reference", accessor: (bill) => bill.reference, sortValue: (bill) => bill.reference },
    { key: "date", header: "Date", accessor: (bill) => formatDate(bill.date), sortValue: (bill) => bill.date },
    { key: "due", header: "Due Date", accessor: (bill) => formatDate(bill.dueDate), sortValue: (bill) => bill.dueDate },
    { key: "planned", header: "Planned Date", accessor: (bill) => formatDate(bill.plannedDate), sortValue: (bill) => bill.plannedDate },
    { key: "amount", header: "Amount Due", accessor: (bill) => formatCurrency(bill.amountDue), sortValue: (bill) => bill.amountDue, align: "right" },
    { key: "status", header: "Status", accessor: (bill) => <StatusBadge status={bill.status} variant="xero" />, sortValue: (bill) => bill.status },
    { key: "actions", header: "Actions", accessor: (bill) => <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button type="button" onClick={(event) => { event.stopPropagation(); processBills([bill.id]); }} className="text-emerald-700 disabled:opacity-40" disabled={bill.amountDue === 0}>Pay</button><button type="button" onClick={(event) => { event.stopPropagation(); deleteBills([bill.id]); }} className="text-red-700"><Trash2 className="h-4 w-4" /></button></div>, align: "right" }
  ];
  return <div className="space-y-5"><PageHeader title="Bills to Pay" breadcrumb={[{ label: "Xero" }, { label: "Bills" }]} actions={<><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetBills}>Reset data</button><button className="rounded-lg bg-[#13B5EA] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E9FD4]" onClick={() => setCreateOpen(true)}>New Bill</button></>} /><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="space-y-4"><FilterTabs tabs={tabs} activeTab={activeStatus} onChange={setActiveStatus} variant="underline" color={xeroBlue} /><SearchInput placeholder="Search bills" value={search} onChange={setSearch} /></div></div><div className="grid gap-3 sm:grid-cols-3"><MiniSummary label="Overdue" value={sum(billRows.filter((bill) => bill.status === "overdue").map((bill) => bill.amountDue))} /><MiniSummary label="Due this week" value={sum(billRows.filter((bill) => bill.status === "awaiting_payment").map((bill) => bill.amountDue))} /><MiniSummary label="Due this month" value={sum(billRows.map((bill) => bill.amountDue))} /></div>{selectedIds.length ? <BulkBar count={selectedIds.length} actions={[{ label: "Process Payment", onClick: () => processBills(selectedIds) }, { label: "Delete", onClick: () => deleteBills(selectedIds), danger: true }]} /> : null}<DataTable columns={columns} data={filteredBills} selectable selectedIds={selectedIds} getRowId={(bill) => bill.id} onSelectRow={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onRowClick={(bill) => router.push(`/xero/bills/${bill.id}`)} paginated perPage={15} /><CrudDialog open={createOpen} title="New Xero bill" description="Creates a payable in browser-local JSON state." accent={xeroBlue} submitLabel="Create bill" onClose={() => setCreateOpen(false)} onSubmit={createBill} fields={[{ name: "contactId", label: "Supplier", type: "select", required: true, options: suppliers.map((supplier) => ({ label: supplier.name, value: supplier.id })) }, { name: "reference", label: "Reference", required: true }, { name: "date", label: "Date", type: "date", required: true }, { name: "dueDate", label: "Due date", type: "date", required: true }, { name: "plannedDate", label: "Planned date", type: "date", required: true }, { name: "total", label: "Total", type: "number", step: "0.01", required: true }, { name: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Awaiting Payment", value: "awaiting_payment" }] }]} /></div>;
}

export function XeroBillDetail({ bill, contact }: { bill: XeroBill; contact: XeroContact | null }) {
  return <DocumentDetail kind="bill" title={bill.reference} backHref="/xero/bills" status={bill.status} dueInfo={`Planned ${formatDate(bill.plannedDate)}`} name={bill.contactName} email={contact?.email ?? "billing@example"} reference={bill.reference} date={bill.date} dueDate={bill.dueDate} amountDue={bill.amountDue} subtotal={bill.subtotal} tax={bill.tax} total={bill.total} paid={bill.total - bill.amountDue} notes={bill.notes} lineItems={bill.lineItems} payments={bill.payments} activity={bill.activity} />;
}

export function XeroBillDetailRouteClient({ id, bills, contacts }: { id: string; bills: XeroBill[]; contacts: XeroContact[] }) {
  const [billRows] = usePersistentState("xero.bills", bills);
  const [contactRows] = usePersistentState("xero.contacts", contacts);
  const ready = useClientReady();
  const bill = useMemo(() => billRows.find((item) => item.id === id) ?? null, [billRows, id]);

  if (!bill && !ready) {
    return null;
  }

  if (!bill) {
    return <DetailUnavailable section="Bills" href="/xero/bills" />;
  }

  return <XeroBillDetail bill={bill} contact={contactRows.find((contact) => contact.id === bill.contactId) ?? null} />;
}

function DocumentDetail({ kind, title, backHref, status, dueInfo, name, email, reference, date, dueDate, amountDue, subtotal, tax, total, paid, notes, lineItems, payments, activity }: { kind: "invoice" | "bill"; title: string; backHref: string; status: string; dueInfo: string; name: string; email: string; reference: string; date: string; dueDate: string; amountDue: number; subtotal: number; tax: number; total: number; paid: number; notes: string; lineItems: XeroInvoice["lineItems"]; payments: XeroInvoice["payments"]; activity: XeroInvoice["activity"] }) {
  return <div className="space-y-5"><PageHeader title={title} breadcrumb={[{ label: kind === "invoice" ? "Invoices" : "Bills", href: backHref }, { label: title }]} actions={kind === "bill" ? <button className="rounded-lg bg-[#13B5EA] px-4 py-2 font-semibold text-white">Schedule Payment</button> : null} /><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={status} variant="xero" /><p className="font-semibold text-slate-700">{dueInfo}</p></div></div><div className="grid gap-5 lg:grid-cols-12"><section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8"><div className="grid gap-5 border-b border-slate-200 pb-5 md:grid-cols-2"><div><p className="text-sm font-semibold uppercase text-slate-500">{kind === "invoice" ? "To" : "From"}</p><h2 className="mt-2 text-xl font-semibold text-slate-950">{name}</h2><p className="text-slate-500">{email}</p></div><div className="text-sm md:text-right"><p>Reference: {reference}</p><p>Date: {formatDate(date)}</p><p>Due: {formatDate(dueDate)}</p></div></div><div className="mt-5 overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Description</th><th className="text-right">Qty</th><th className="text-right">Unit Price</th><th className="text-right">Disc%</th><th className="text-right">Tax</th><th className="text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{lineItems.map((item) => <tr key={item.description}><td className="py-3">{item.description}</td><td className="text-right">{item.quantity}</td><td className="text-right">{formatCurrency(item.unitPrice)}</td><td className="text-right">{item.discount}%</td><td className="text-right">{formatCurrency(item.tax)}</td><td className="text-right font-semibold">{formatCurrency(item.amount)}</td></tr>)}</tbody></table></div><div className="ml-auto mt-5 max-w-sm space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>Tax</span><span>{formatCurrency(tax)}</span></div><div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div></div><div className="mt-6 grid gap-5 md:grid-cols-2"><div><h3 className="mb-2 font-semibold text-slate-950">Payment history</h3>{payments.length ? payments.map((payment) => <div key={payment.reference} className="flex justify-between border-t py-2 text-sm"><span>{formatDate(payment.date)}</span><span>{formatCurrency(payment.amount)}</span></div>) : <p className="text-sm text-slate-500">No payments recorded.</p>}</div><div><h3 className="mb-2 font-semibold text-slate-950">Notes</h3><p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{notes}</p></div></div></section><aside className="space-y-5 lg:col-span-4"><div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Amount due</p><p className={`mt-2 text-3xl font-semibold ${amountDue > 0 ? "text-[#13B5EA]" : "text-emerald-700"}`}>{formatCurrency(amountDue)}</p><div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span>Paid</span><span>{formatCurrency(paid)}</span></div><div className="flex justify-between"><span>Total</span><span>{formatCurrency(total)}</span></div></div></div><div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-950">Activity timeline</h3><div className="mt-3 space-y-3">{activity.map((item) => <div key={`${item.label}-${item.date}`} className="flex gap-3 text-sm"><div className="mt-1 h-2 w-2 rounded-full bg-[#13B5EA]" /><div><p className="font-medium text-slate-950">{item.label}</p><p className="text-slate-500">{formatDate(item.date)}</p></div></div>)}</div></div></aside></div></div>;
}

export function XeroContactsPage({ contacts }: { contacts: XeroContact[] }) {
  const router = useRouter();
  const [contactRows, setContactRows, resetContacts] = usePersistentState("xero.contacts", contacts);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "contact") {
      setCreateOpen(true);
    }
  }, []);

  function createContact(values: Record<string, string>) {
    const contact: XeroContact = {
      id: `xe-local-contact-${Date.now()}`,
      name: values.name,
      email: values.email,
      phone: values.phone || "(555) 010-0000",
      type: (values.type || "customer") as XeroContact["type"],
      group: values.group || "General",
      address: values.address || "Local browser contact",
      taxNumber: values.taxNumber || "LOCAL-TAX",
      outstandingReceivable: 0,
      outstandingPayable: 0,
      lastActivity: "2026-05-23"
    };
    setContactRows((current) => [contact, ...current]);
    setCreateOpen(false);
  }

  function deleteContact(id: string) {
    setContactRows((current) => current.filter((contact) => contact.id !== id));
  }

  const filtered = contactRows.filter((contact) => (type === "all" || contact.type === type || contact.type === "both") && (group === "all" || contact.group === group) && [contact.name, contact.email, contact.phone].join(" ").toLowerCase().includes(search.toLowerCase()));
  const groups = Array.from(new Set(contactRows.map((contact) => contact.group)));
  const columns: DataTableColumn<XeroContact>[] = [
    { key: "name", header: "Name", accessor: (contact) => contact.name, sortValue: (contact) => contact.name },
    { key: "email", header: "Email", accessor: (contact) => contact.email, sortValue: (contact) => contact.email },
    { key: "phone", header: "Phone", accessor: (contact) => contact.phone, sortValue: (contact) => contact.phone },
    { key: "receivable", header: "Outstanding Receivable", accessor: (contact) => formatCurrency(contact.outstandingReceivable), sortValue: (contact) => contact.outstandingReceivable, align: "right" },
    { key: "payable", header: "Outstanding Payable", accessor: (contact) => formatCurrency(contact.outstandingPayable), sortValue: (contact) => contact.outstandingPayable, align: "right" },
    { key: "activity", header: "Last Activity", accessor: (contact) => formatDate(contact.lastActivity), sortValue: (contact) => contact.lastActivity },
    { key: "actions", header: "Actions", accessor: (contact) => <button type="button" className="text-red-700 opacity-0 group-hover:opacity-100" onClick={(event) => { event.stopPropagation(); deleteContact(contact.id); }}><Trash2 className="h-4 w-4" /></button>, align: "right" }
  ];
  return <div className="space-y-5"><PageHeader title="Contacts" breadcrumb={[{ label: "Xero" }, { label: "Contacts" }]} actions={<><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetContacts}>Reset data</button><button className="rounded-lg bg-[#13B5EA] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E9FD4]" onClick={() => setCreateOpen(true)}>New Contact</button></>} /><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><FilterTabs tabs={[{ label: "All", value: "all" }, { label: "Customers", value: "customer" }, { label: "Suppliers", value: "supplier" }]} activeTab={type} onChange={setType} color={xeroBlue} /><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><SearchInput placeholder="Search contacts" value={search} onChange={setSearch} /><SelectControl label="Group" value={group} onChange={setGroup}><option value="all">All groups</option>{groups.map((item) => <option key={item} value={item}>{item}</option>)}</SelectControl></div></div></div><DataTable columns={columns} data={filtered} onRowClick={(contact) => router.push(`/xero/contacts/${contact.id}`)} paginated perPage={15} /><CrudDialog open={createOpen} title="New Xero contact" description="Creates a contact in browser-local JSON state." accent={xeroBlue} submitLabel="Create contact" onClose={() => setCreateOpen(false)} onSubmit={createContact} fields={[{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone" }, { name: "type", label: "Type", type: "select", options: [{ label: "Customer", value: "customer" }, { label: "Supplier", value: "supplier" }, { label: "Both", value: "both" }] }, { name: "group", label: "Group", placeholder: "General" }, { name: "taxNumber", label: "Tax number" }, { name: "address", label: "Address", type: "textarea" }]} /></div>;
}

export function XeroContactDetail({ contact, invoices, bills }: { contact: XeroContact; invoices: XeroInvoice[]; bills: XeroBill[] }) {
  const [tab, setTab] = useState("overview");
  return <div className="space-y-5"><PageHeader title={contact.name} breadcrumb={[{ label: "Contacts", href: "/xero/contacts" }, { label: contact.name }]} actions={<button className="rounded-lg bg-[#13B5EA] px-4 py-2 font-semibold text-white"><Edit className="mr-2 inline h-4 w-4" />Edit</button>} /><section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-lg font-semibold text-[#13B5EA]">{initials(contact.name)}</div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-semibold text-slate-950">{contact.name}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">{contact.type}</span></div><p className="mt-1 text-slate-500">{contact.email} • {contact.phone}</p><p className="mt-2 text-sm text-slate-500">{contact.address}</p><p className="text-sm text-slate-500">Tax number: {contact.taxNumber}</p></div></div></section><FilterTabs tabs={[{ label: "Overview", value: "overview" }, { label: "Invoices", value: "invoices" }, { label: "Bills", value: "bills" }, { label: "History", value: "history" }]} activeTab={tab} onChange={setTab} variant="underline" color={xeroBlue} />{tab === "overview" ? <div className="grid gap-4 sm:grid-cols-2"><SummaryCard label="Receivable" value={formatCurrency(contact.outstandingReceivable)} color={xeroBlue} /><SummaryCard label="Payable" value={formatCurrency(contact.outstandingPayable)} color="#F97316" /></div> : null}{tab === "invoices" ? <SimpleInvoiceTable invoices={invoices} /> : null}{tab === "bills" ? <SimpleBillTable bills={bills} /> : null}{tab === "history" ? <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-950">History</h2><div className="mt-3 space-y-2 text-sm">{[...invoices.map((invoice) => `${formatDate(invoice.date)} invoice ${invoice.invoiceNumber}`), ...bills.map((bill) => `${formatDate(bill.date)} bill ${bill.reference}`)].map((item) => <p key={item} className="rounded bg-slate-50 p-2">{item}</p>)}</div></div> : null}</div>;
}

export function XeroContactDetailRouteClient({ id, contacts, invoices, bills }: { id: string; contacts: XeroContact[]; invoices: XeroInvoice[]; bills: XeroBill[] }) {
  const [contactRows] = usePersistentState("xero.contacts", contacts);
  const [invoiceRows] = usePersistentState("xero.invoices", invoices);
  const [billRows] = usePersistentState("xero.bills", bills);
  const ready = useClientReady();
  const contact = useMemo(() => contactRows.find((item) => item.id === id) ?? null, [contactRows, id]);

  if (!contact && !ready) {
    return null;
  }

  if (!contact) {
    return <DetailUnavailable section="Contacts" href="/xero/contacts" />;
  }

  const contactInvoices = invoiceRows.filter((invoice) => invoice.contactId === contact.id);
  const contactBills = billRows.filter((bill) => bill.contactId === contact.id);
  const lastActivity = [contact.lastActivity, ...contactInvoices.map((invoice) => invoice.date), ...contactBills.map((bill) => bill.date)].sort().at(-1) ?? contact.lastActivity;

  return <XeroContactDetail contact={{ ...contact, outstandingReceivable: sum(contactInvoices.map((invoice) => invoice.due)), outstandingPayable: sum(contactBills.map((bill) => bill.amountDue)), lastActivity }} invoices={contactInvoices} bills={contactBills} />;
}

function SimpleInvoiceTable({ invoices }: { invoices: XeroInvoice[] }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Invoice</th><th>Date</th><th>Status</th><th className="text-right">Due</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t"><td className="py-2">{invoice.invoiceNumber}</td><td>{formatDate(invoice.date)}</td><td><StatusBadge status={invoice.status} variant="xero" /></td><td className="text-right">{formatCurrency(invoice.due)}</td></tr>)}</tbody></table></div>;
}

function SimpleBillTable({ bills }: { bills: XeroBill[] }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Bill</th><th>Date</th><th>Status</th><th className="text-right">Due</th></tr></thead><tbody>{bills.map((bill) => <tr key={bill.id} className="border-t"><td className="py-2">{bill.reference}</td><td>{formatDate(bill.date)}</td><td><StatusBadge status={bill.status} variant="xero" /></td><td className="text-right">{formatCurrency(bill.amountDue)}</td></tr>)}</tbody></table></div>;
}

export function XeroBankPage({ accounts }: { accounts: XeroBankAccount[] }) {
  return <div className="space-y-5"><PageHeader title="Bank Accounts" breadcrumb={[{ label: "Xero" }, { label: "Bank Accounts" }]} /><div className="grid gap-4 lg:grid-cols-3">{accounts.map((account) => <Link key={account.id} href={`/xero/bank/${account.id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-[#13B5EA]"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold text-slate-950">{account.bankName}</h2><p className="text-sm text-slate-500">{account.accountName} • {account.accountNumber}</p></div>{account.unreconciledCount > 0 ? <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">{account.unreconciledCount} unreconciled</span> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}</div><p className="mt-5 text-3xl font-semibold">{formatCurrency(account.currentBalance)}</p><p className="text-sm text-slate-500">{account.currency}</p><span className="mt-5 inline-flex rounded-lg bg-[#13B5EA] px-3 py-2 text-sm font-semibold text-white">Reconcile {account.unreconciledCount} items</span></Link>)}</div></div>;
}

export function XeroBankAccountDetail({ account, transactions }: { account: XeroBankAccount; transactions: XeroTransaction[] }) {
  const [transactionRows, setTransactionRows, resetTransactions] = usePersistentState(`xero.transactions.${account.id}`, transactions);
  const [tab, setTab] = useState("all");
  const filtered = transactionRows.filter((transaction) => tab === "all" || (tab === "reconciled" ? transaction.status === "reconciled" : transaction.type === tab));
  const unreconciledCount = transactionRows.filter((transaction) => transaction.status !== "reconciled").length;

  function reconcileTransactions(ids: string[]) {
    setTransactionRows((current) => current.map((transaction) => ids.includes(transaction.id) ? { ...transaction, status: "reconciled" } : transaction));
  }

  return <div className="space-y-5"><PageHeader title={account.accountName} breadcrumb={[{ label: "Bank Accounts", href: "/xero/bank" }, { label: account.accountName }]} actions={<><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetTransactions}>Reset</button><button className="rounded-lg bg-[#13B5EA] px-4 py-2 font-semibold text-white" onClick={() => reconcileTransactions(filtered.filter((transaction) => transaction.status !== "reconciled").map((transaction) => transaction.id))}>Reconcile Visible</button></>} /><div className="grid gap-5 lg:grid-cols-10"><section className="space-y-4 lg:col-span-7"><div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Balance</p><p className="text-3xl font-semibold text-slate-950">{formatCurrency(account.currentBalance)}</p><div className="mt-4"><FilterTabs tabs={[{ label: "All", value: "all" }, { label: "Spend", value: "spend" }, { label: "Receive", value: "receive" }, { label: "Reconciled", value: "reconciled" }]} activeTab={tab} onChange={setTab} color={xeroBlue} /></div></div><div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Date</th><th>Description</th><th>Reference</th><th className="text-right">Spent</th><th className="text-right">Received</th><th className="text-right">Balance</th><th>✓</th><th className="text-right">Action</th></tr></thead><tbody>{filtered.map((transaction) => <tr key={transaction.id} className="border-t"><td className="py-3">{formatDate(transaction.date)}</td><td>{transaction.description}</td><td>{transaction.reference}</td><td className="text-right text-red-700">{transaction.spent ? formatCurrency(transaction.spent) : ""}</td><td className="text-right text-emerald-700">{transaction.received ? formatCurrency(transaction.received) : ""}</td><td className="text-right">{formatCurrency(transaction.balance)}</td><td>{transaction.status === "reconciled" ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : null}</td><td className="text-right">{transaction.status !== "reconciled" ? <button type="button" className="font-semibold text-[#13B5EA]" onClick={() => reconcileTransactions([transaction.id])}>Reconcile</button> : <span className="text-slate-400">Done</span>}</td></tr>)}</tbody></table></div></div></section><aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3"><h2 className="text-base font-semibold text-slate-950">Reconciliation</h2><p className="mt-4 text-3xl font-semibold text-orange-700">{unreconciledCount}</p><p className="text-sm text-slate-500">Unreconciled items</p><p className="mt-4 text-sm text-slate-500">Last reconciled {formatDate(account.lastReconciled)}</p></aside></div></div>;
}

export function XeroReportsPage({ reports, invoices, bills }: { reports: XeroReports; invoices: XeroInvoice[]; bills: XeroBill[] }) {
  const [active, setActive] = useState("profit");
  const [invoiceRows] = usePersistentState("xero.invoices", invoices);
  const [billRows] = usePersistentState("xero.bills", bills);
  const liveReports = useMemo(() => buildXeroLiveReports(reports, invoices, invoiceRows, bills, billRows), [billRows, bills, invoiceRows, invoices, reports]);
  const cards = [{ id: "profit", name: "Profit and Loss", description: "Income, expenses, and net profit by month.", icon: BarChart2 }, { id: "balance", name: "Balance Sheet", description: "Assets, liabilities, and equity by section.", icon: Landmark }, { id: "receivables", name: "Aged Receivables", description: "Outstanding customer balances by age.", icon: FileText }, { id: "payables", name: "Aged Payables", description: "Supplier bills grouped by age.", icon: Receipt }, { id: "cash", name: "Cash Summary", description: "Cash in, cash out, and net movement.", icon: CreditCard }, { id: "expenses", name: "Expenses by Category", description: "Spend distribution by category.", icon: Users }];
  return <div className="space-y-5"><PageHeader title="Reports" breadcrumb={[{ label: "Xero" }, { label: "Reports" }]} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map((card) => { const Icon = card.icon; return <button key={card.id} type="button" className={`rounded-lg border bg-white p-5 text-left shadow-sm hover:border-[#13B5EA] ${active === card.id ? "border-[#13B5EA]" : "border-slate-200"}`} onClick={() => setActive(card.id)}><Icon className="h-5 w-5 text-[#13B5EA]" /><h2 className="mt-3 text-lg font-semibold text-slate-950">{card.name}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{card.description}</p><span className="mt-4 inline-flex rounded-lg bg-[#13B5EA] px-3 py-2 text-sm font-semibold text-white">Run</span></button>; })}</div><section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">{active === "profit" ? <XeroProfit reports={liveReports} /> : null}{active === "balance" ? <XeroBalance reports={liveReports} /> : null}{active === "receivables" ? <Aging title="Aged Receivables" rows={liveReports.agedReceivables} /> : null}{active === "payables" ? <Aging title="Aged Payables" rows={liveReports.agedPayables} /> : null}{active === "cash" ? <CashSummary reports={liveReports} /> : null}{active === "expenses" ? <ExpenseCategories reports={liveReports} /> : null}</section></div>;
}

function XeroProfit({ reports }: { reports: XeroReports }) {
  return <div><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-950">Profit and Loss</h2><div className="flex gap-2"><select className="h-9 rounded-lg border border-slate-200 px-3 text-sm"><option>Last 6 months</option></select><button className="rounded-lg border border-slate-200 px-3 text-sm font-semibold">Compare</button></div></div><ChartBox className="h-72"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={reports.profitAndLoss}><XAxis dataKey="month" /><YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} /><Tooltip formatter={currencyTooltip} /><Legend /><Bar dataKey="income" fill="#13B5EA" animationDuration={700} /><Bar dataKey="totalExpenses" fill="#F97316" animationDuration={700} /></BarChart></ResponsiveContainer></ChartBox><ReportTable rows={reports.profitAndLoss} /></div>;
}

function ReportTable({ rows }: { rows: XeroReports["profitAndLoss"] }) {
  return <div className="mt-5 overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Month</th><th className="text-right">Income</th><th className="text-right">COGS</th><th className="text-right">Gross</th><th className="text-right">Expenses</th><th className="text-right">Net</th></tr></thead><tbody>{rows.map((row) => <tr key={row.month} className="border-t"><td className="py-2">{row.month}</td><td className="text-right">{formatCurrency(row.income)}</td><td className="text-right">{formatCurrency(row.costOfGoods)}</td><td className="text-right">{formatCurrency(row.grossProfit)}</td><td className="text-right">{formatCurrency(row.totalExpenses)}</td><td className="text-right font-semibold">{formatCurrency(row.netProfit)}</td></tr>)}</tbody></table></div>;
}

function XeroBalance({ reports }: { reports: XeroReports }) {
  return <div><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">Balance Sheet</h2><input type="date" className="h-9 rounded-lg border border-slate-200 px-3 text-sm" defaultValue="2026-05-23" /></div><div className="grid gap-5 md:grid-cols-2"><Bucket title="Assets" values={reports.balanceSheet.assets} /><div className="space-y-5"><Bucket title="Liabilities" values={reports.balanceSheet.liabilities} /><Bucket title="Equity" values={reports.balanceSheet.equity} /></div></div></div>;
}

function Bucket({ title, values }: { title: string; values: Record<string, number> }) {
  return <details className="rounded-lg border border-slate-200 p-4" open><summary className="cursor-pointer font-semibold text-slate-950">{title}</summary><div className="mt-3">{Object.entries(values).map(([label, value]) => <div key={label} className="flex justify-between border-t border-slate-100 py-2 text-sm"><span>{label}</span><span className="font-semibold">{formatCurrency(value)}</span></div>)}</div></details>;
}

function Aging({ title, rows }: { title: string; rows: XeroReports["agedReceivables"] }) {
  return <div><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">{title}</h2><input type="date" className="h-9 rounded-lg border border-slate-200 px-3 text-sm" defaultValue="2026-05-23" /></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Customer</th><th className="text-right">Current</th><th className="text-right">1-30</th><th className="text-right">31-60</th><th className="text-right">61-90</th><th className="text-right">90+</th><th className="text-right">Total</th></tr></thead><tbody>{rows.map((row) => <tr key={row.contactId} className="border-t"><td className="py-3">{row.name}</td><td className="text-right">{formatCurrency(row.current)}</td><td className="bg-blue-50 text-right">{formatCurrency(row.days30)}</td><td className="bg-amber-50 text-right">{formatCurrency(row.days60)}</td><td className="bg-orange-50 text-right">{formatCurrency(row.days90)}</td><td className="bg-red-50 text-right">{formatCurrency(row.over90)}</td><td className="text-right font-semibold">{formatCurrency(row.total)}</td></tr>)}</tbody></table></div></div>;
}

function CashSummary({ reports }: { reports: XeroReports }) {
  return <div><h2 className="mb-4 text-lg font-semibold text-slate-950">Cash Summary</h2><ChartBox className="h-72"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}><BarChart data={reports.cashSummary}><XAxis dataKey="month" /><YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} /><Tooltip formatter={currencyTooltip} /><Legend /><Bar dataKey="cashIn" fill="#13B5EA" animationDuration={700} /><Bar dataKey="cashOut" fill="#F97316" animationDuration={700} /></BarChart></ResponsiveContainer></ChartBox></div>;
}

function ExpenseCategories({ reports }: { reports: XeroReports }) {
  return <div><h2 className="mb-4 text-lg font-semibold text-slate-950">Expenses by Category</h2><table className="min-w-full text-sm"><thead className="text-left text-xs uppercase text-slate-500"><tr><th className="py-2">Category</th><th className="text-right">Amount</th><th className="text-right">%</th></tr></thead><tbody>{reports.expensesByCategory.map((row) => <tr key={row.category} className="border-t"><td className="py-2">{row.category}</td><td className="text-right">{formatCurrency(row.amount)}</td><td className="text-right">{row.percentage.toFixed(1)}%</td></tr>)}</tbody></table></div>;
}