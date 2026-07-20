"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { Inbox, type LucideIcon } from "lucide-react";

export const DATA_TABLE_EMPTY_MIN_HEIGHT =
  "min-h-[min(360px,45vh)]";

/** Apply to the table body wrapper when `data` is empty so the empty state centers in the card. */
export function dataTableBodyClassName(isEmpty: boolean): string {
  return cn(
    "min-h-0 flex-1 -mx-1 px-1",
    isEmpty
      ? "flex flex-col items-center justify-center"
      : "overflow-x-auto overflow-y-auto no-scrollbar [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-card"
  );
}

export interface DataTableEmptyState {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

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
  /** @deprecated Prefer `emptyState` */
  emptyMessage?: string;
  emptyState?: DataTableEmptyState;
  emptyClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found.",
  emptyState,
  emptyClassName,
}: DataTableProps<T>) {
  if (data.length === 0) {
    const state = emptyState ?? {
      icon: Inbox,
      title: emptyMessage,
    };

    return (
      <div
        className={cn(
          "flex h-full w-full flex-1 flex-col items-center justify-center",
          DATA_TABLE_EMPTY_MIN_HEIGHT,
          emptyClassName
        )}
      >
        <EmptyState
          icon={state.icon}
          title={state.title}
          description={state.description}
          action={state.action}
          className="py-0"
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-medium text-muted",
                  col.hideOnMobile && "hidden md:table-cell",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
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
                    "px-4 py-4 text-sm text-foreground",
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
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-muted">
        {total} result{total !== 1 ? "s" : ""}
      </p>
      {totalPages > 1 && (
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
      )}
    </div>
  );
}
