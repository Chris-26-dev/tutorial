type StatusBadgeProps = {
  status: string;
  variant: "qb" | "xero";
};

const qbStyles: Record<string, string> = {
  paid: "bg-[#D4EDDA] text-[#155724]",
  overdue: "bg-[#F8D7DA] text-[#721C24]",
  pending: "bg-[#FFF3CD] text-[#856404]",
  unpaid: "bg-[#FFF3CD] text-[#856404]",
  sent: "bg-[#FFF3CD] text-[#856404]",
  reimbursable: "bg-[#E6F4E3] text-[#155724]",
  draft: "bg-[#E2E3E5] text-[#383D41]",
  matched: "bg-[#D4EDDA] text-[#155724]",
  reconciled: "bg-[#D4EDDA] text-[#155724]",
  "for-review": "bg-[#FFF3CD] text-[#856404]"
};

const xeroStyles: Record<string, string> = {
  paid: "bg-[#ECFDF5] text-[#065F46]",
  awaiting: "bg-[#EFF6FF] text-[#1D4ED8]",
  awaiting_payment: "bg-[#EFF6FF] text-[#1D4ED8]",
  awaiting_approval: "bg-[#EFF6FF] text-[#1D4ED8]",
  overdue: "bg-[#FEF2F2] text-[#991B1B]",
  draft: "bg-[#F9FAFB] text-[#374151]",
  repeating: "bg-[#E0F2FE] text-[#0369A1]",
  reconciled: "bg-[#ECFDF5] text-[#065F46]",
  matched: "bg-[#EFF6FF] text-[#1D4ED8]",
  unreconciled: "bg-[#FFF7ED] text-[#C2410C]"
};

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const styles = variant === "qb" ? qbStyles : xeroStyles;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>{titleCase(status)}</span>;
}