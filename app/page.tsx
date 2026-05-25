import Link from "next/link";
import { ArrowRight, BookOpenCheck, Landmark } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded border border-white/10 bg-white/5">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">Choose an accounting workspace</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Open a full learning clone for QuickBooks or Xero, or continue into the guided tutorial paths that were already here.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
            <div className="h-2 w-28 rounded-full bg-[#2CA01C]" />
            <h2 className="mt-6 text-3xl font-semibold">QuickBooks</h2>
            <p className="mt-3 min-h-16 text-sm leading-6 text-slate-300">Practice dashboards, invoices, expenses, customers, vendors, banking, and reports in a QuickBooks-style workspace.</p>
            <Link href="/quickbooks/dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded bg-[#2CA01C] px-5 text-sm font-semibold text-white hover:bg-[#1E7A14]">
              Open QuickBooks
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
            <div className="h-2 w-28 rounded-full bg-[#13B5EA]" />
            <h2 className="mt-6 text-3xl font-semibold">Xero</h2>
            <p className="mt-3 min-h-16 text-sm leading-6 text-slate-300">Explore invoices, bills, contacts, bank accounts, cash flow, and reporting in a Xero-style workspace.</p>
            <Link href="/xero/dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#13B5EA] px-5 text-sm font-semibold text-white hover:bg-[#0E9FD4]">
              Open Xero
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
        <section className="flex flex-col justify-between gap-4 rounded border border-white/10 bg-white/[0.06] p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Learn About Both</h2>
              <p className="text-sm text-slate-300">The original tutorial paths remain available.</p>
            </div>
          </div>
          <Link href="/learn/quickbooks" className="inline-flex h-10 items-center justify-center gap-2 rounded border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/10">
            Open tutorials
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        <footer className="text-center text-sm text-slate-400">Built for learning purposes only</footer>
      </section>
    </main>
  );
}
