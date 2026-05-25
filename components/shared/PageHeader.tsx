import { ReactNode } from "react";
import Link from "next/link";

type Breadcrumb = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  breadcrumb?: Breadcrumb[];
  actions?: ReactNode;
};

export function PageHeader({ title, breadcrumb = [], actions }: PageHeaderProps) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumb.length > 0 ? (
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-sm text-slate-500">
            {breadcrumb.map((item, index) => (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 ? <span>/</span> : null}
                {item.href ? <Link className="hover:text-slate-900" href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}