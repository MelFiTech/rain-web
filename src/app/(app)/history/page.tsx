"use client";

import { ConfidenceBadge } from "@/components/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  categoryLabel,
  formatDate,
  formatDateTime,
  formatNaira,
  formatTime,
  identifierTypeLabel,
} from "@/lib/format";
import {
  exportVerificationsCsv,
  getVerification,
  listVerifications,
} from "@/services/verification";
import type {
  ConfidenceLevel,
  VerificationFilters,
  VerificationRecord,
  VerificationResult,
} from "@/types";
import { Download, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function HistoryContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<VerificationFilters>({
    search: "",
    result: "all",
    confidence: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    pageSize: 8,
  });
  const [dateRange, setDateRange] = useState("all");
  const [data, setData] = useState<VerificationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<VerificationRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listVerifications(filters);
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      getVerification(id).then((r) => {
        if (r) {
          setSelected(r);
          setDetailOpen(true);
        }
      });
    }
  }, [searchParams]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportVerificationsCsv(filters);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rain-verifications-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<VerificationRecord>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (r) => (
        <span className="font-mono text-xs text-ink">{r.reference}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      hideOnMobile: true,
      render: (r) => (
        <span className="text-muted">{identifierTypeLabel(r.identifierType)}</span>
      ),
    },
    {
      key: "identifier",
      header: "Identifier",
      render: (r) => (
        <span className="font-mono text-sm">{r.maskedIdentifier}</span>
      ),
    },
    {
      key: "result",
      header: "Result",
      render: (r) => (
        <Badge tone={r.result === "match" ? "success" : "violet"}>
          {r.result === "match" ? "Match" : "No match"}
        </Badge>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      render: (r) =>
        r.confidence ? (
          <ConfidenceBadge confidence={r.confidence} />
        ) : (
          <span className="text-subtle text-xs">—</span>
        ),
    },
    {
      key: "sources",
      header: "Sources",
      hideOnMobile: true,
      render: (r) => (
        <span className="tabular-nums">{r.independentSourceCount}</span>
      ),
    },
    {
      key: "cost",
      header: "Cost",
      hideOnMobile: true,
      render: (r) => (
        <span className="tabular-nums">{formatNaira(r.amountCharged)}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => (
        <div className="whitespace-nowrap">
          <p className="text-xs text-foreground">{formatDate(r.createdAt)}</p>
          <p className="text-[11px] text-subtle mt-0.5">
            {formatTime(r.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "action",
      header: "",
      render: () => (
        <span className="text-xs text-muted hover:text-foreground">View</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="search-field flex items-center gap-2 h-9 flex-1 min-w-0 rounded-lg border border-line bg-card px-3 transition-colors">
            <Search className="h-4 w-4 text-subtle shrink-0" />
            <input
              placeholder="Search reference or identifier"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
              }
              className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle focus:outline-none"
            />
          </div>
          <Select
            variant="ghost"
            fieldSize="sm"
            value={filters.result || "all"}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                result: e.target.value as VerificationResult | "all",
                page: 1,
              }))
            }
            options={[
              { value: "all", label: "All results" },
              { value: "match", label: "Match" },
              { value: "no_match", label: "No match" },
            ]}
            className="w-auto shrink-0"
          />
          <Select
            variant="ghost"
            fieldSize="sm"
            value={filters.confidence || "all"}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                confidence: e.target.value as ConfidenceLevel | "all",
                page: 1,
              }))
            }
            options={[
              { value: "all", label: "All confidence" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "very_high", label: "Very High" },
            ]}
            className="w-auto shrink-0"
          />
          <Select
            variant="ghost"
            fieldSize="sm"
            value={dateRange}
            onChange={(e) => {
              const v = e.target.value;
              setDateRange(v);
              setFilters((f) => ({
                ...f,
                dateFrom:
                  v === "all"
                    ? ""
                    : new Date(Date.now() - Number(v) * 86400000)
                        .toISOString()
                        .slice(0, 10),
                dateTo: "",
                page: 1,
              }));
            }}
            options={[
              { value: "all", label: "All time" },
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
            ]}
            className="w-auto shrink-0"
            aria-label="Date range"
          />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-line bg-card text-sm font-medium text-foreground hover:bg-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Download className="h-4 w-4 text-muted" />
            {exporting ? "Exporting…" : "Export"}
          </button>
        </div>

        {loading ? (
          <SkeletonTable rows={6} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data}
              keyExtractor={(r) => r.id}
              onRowClick={(r) => {
                setSelected(r);
                setDetailOpen(true);
              }}
              emptyMessage="No verifications match your filters."
            />
            <Pagination
              page={filters.page || 1}
              totalPages={totalPages}
              total={total}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </>
        )}
      </Card>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Verification details"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge tone={selected.result === "match" ? "success" : "violet"}>
                {selected.result === "match" ? "Match" : "No match"}
              </Badge>
              {selected.confidence && (
                <ConfidenceBadge confidence={selected.confidence} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Reference" value={selected.reference} mono />
              <Detail
                label="Type"
                value={identifierTypeLabel(selected.identifierType)}
              />
              <Detail
                label="Identifier"
                value={selected.maskedIdentifier}
                mono
              />
              <Detail
                label="Sources"
                value={String(selected.independentSourceCount)}
              />
              <Detail
                label="Cost"
                value={formatNaira(selected.amountCharged)}
              />
              <Detail
                label="Date"
                value={formatDateTime(selected.createdAt)}
              />
              {selected.categories && (
                <div className="col-span-2">
                  <p className="text-xs text-muted">Categories</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selected.categories.map((c) => (
                      <Badge key={c}>{categoryLabel(c)}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected.confidence && (
              <p className="text-sm text-muted">
                {selected.confidence.description}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 text-ink ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={6} />}>
      <HistoryContent />
    </Suspense>
  );
}
