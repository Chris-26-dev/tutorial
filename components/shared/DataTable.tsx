"use client";

import { ReactNode, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Pagination } from "./Pagination";

type SortValue = string | number | boolean | Date | null | undefined;

export type DataTableColumn<T> = {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => SortValue;
  className?: string;
  align?: "left" | "right" | "center";
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  paginated?: boolean;
  perPage?: number;
  selectable?: boolean;
  selectedIds?: string[];
  getRowId?: (row: T) => string;
  onSelectRow?: (id: string) => void;
};

function normalizeSortValue(value: SortValue) {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "string") {
    return value.toLowerCase();
  }
  return value ?? "";
}

export function DataTable<T>({ columns, data, onRowClick, striped = true, hoverable = true, paginated = false, perPage = 10, selectable = false, selectedIds = [], getRowId, onSelectRow }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data;
    }

    const column = columns.find((item) => item.key === sortKey);
    if (!column?.sortValue) {
      return data;
    }

    return [...data].sort((left, right) => {
      const leftValue = normalizeSortValue(column.sortValue?.(left));
      const rightValue = normalizeSortValue(column.sortValue?.(right));
      if (leftValue < rightValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (leftValue > rightValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [columns, data, sortDirection, sortKey]);

  const visibleData = paginated ? sortedData.slice((page - 1) * perPage, page * perPage) : sortedData;

  function handleSort(column: DataTableColumn<T>) {
    if (!column.sortValue) {
      return;
    }
    if (sortKey === column.key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column.key);
    setSortDirection("asc");
  }

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {selectable ? <th className="w-11 px-4 py-3">□</th> : null}
              {columns.map((column) => (
                <th key={column.key} className={`whitespace-nowrap px-4 py-3 font-semibold ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"} ${column.className ?? ""}`}>
                  <button type="button" className="inline-flex items-center gap-1 disabled:cursor-default" onClick={() => handleSort(column)} disabled={!column.sortValue}>
                    {column.header}
                    {sortKey === column.key ? sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {visibleData.map((row, index) => {
              const rowId = getRowId?.(row) ?? String(index);
              const selected = selectedIds.includes(rowId);
              return (
                <tr
                  key={rowId}
                  className={`group ${striped && index % 2 === 1 ? "bg-slate-50/70" : "bg-white"} ${hoverable ? "hover:bg-emerald-50/50" : ""} ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable ? (
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={selected} onChange={() => onSelectRow?.(rowId)} aria-label={`Select row ${rowId}`} />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.key} className={`whitespace-nowrap px-4 py-3 ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"} ${column.className ?? ""}`}>
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {paginated ? <Pagination total={sortedData.length} page={page} perPage={perPage} onChange={setPage} /> : null}
    </div>
  );
}