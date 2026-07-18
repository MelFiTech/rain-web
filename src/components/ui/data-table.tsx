"use client";

import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  hideOnMobile?: boolean;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider",
                  col.hideOnMobile && "hidden md:table-cell",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-hover/60"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-3 py-3.5 text-sm text-foreground",
                    col.hideOnMobile && "hidden md:table-cell",
                    col.className
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-4 mt-2">
      <p className="text-xs text-muted">
        {total} result{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Previous
        </button>
        <span className="text-sm text-muted tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
