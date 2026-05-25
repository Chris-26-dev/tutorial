import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPercent } from "./formatters";

type SummaryCardProps = {
  label: string;
  value: string;
  delta?: number;
  color?: string;
  icon?: ReactNode;
  topBorder?: boolean;
};

export function SummaryCard({ label, value, delta, color = "#2CA01C", icon, topBorder = false }: SummaryCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="rounded border border-slate-200 bg-white p-4 shadow-sm" style={topBorder ? { borderTopColor: color, borderTopWidth: 4 } : undefined}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{value}</p>
        </div>
        {icon ? <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-50" style={{ color }}>{icon}</div> : null}
      </div>
      {typeof delta === "number" ? (
        <div className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${positive ? "text-emerald-700" : "text-red-700"}`}>
          {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {formatPercent(delta)} vs last month
        </div>
      ) : null}
    </div>
  );
}