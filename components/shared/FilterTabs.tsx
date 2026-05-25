"use client";

type FilterTab = {
  label: string;
  value: string;
  count?: number;
};

type FilterTabsProps = {
  tabs: FilterTab[];
  activeTab: string;
  onChange: (value: string) => void;
  variant?: "pill" | "underline";
  color?: string;
};

export function FilterTabs({ tabs, activeTab, onChange, variant = "pill", color = "#2CA01C" }: FilterTabsProps) {
  if (variant === "underline") {
    return (
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${activeTab === tab.value ? "text-slate-950" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            style={activeTab === tab.value ? { borderBottomColor: color } : undefined}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {typeof tab.count === "number" ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tab.count}</span> : null}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${activeTab === tab.value ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          style={activeTab === tab.value ? { backgroundColor: color } : undefined}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {typeof tab.count === "number" ? <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{tab.count}</span> : null}
        </button>
      ))}
    </div>
  );
}