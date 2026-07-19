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
} from "@/lib/format";
import {
  getPrimaryMaskedIdentifier,
  getReport,
  listReports,
} from "@/services/reports";
import type {
  ConfidenceLevel,
  ReportCategory,
  ReportFilters,
  ReportRecord,
} from "@/types";
import { REPORT_CATEGORIES } from "@/types";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function ReportsContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    category: "all",
    confidence: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    pageSize: 8,
  });
  const [dateRange, setDateRange] = useState("all");
  const [data, setData] = useState<ReportRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listReports(filters);
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
      getReport(id).then((r) => {
        if (r) {
          setSelected(r);
          setDetailOpen(true);
        }
      });
    }
  }, [searchParams]);

  const columns: Column<ReportRecord>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (r) => (
        <span className="font-mono text-xs text-ink">{r.reference}</span>
      ),
    },
    {
      key: "user",
      header: "User / Identifier",
      render: (r) => (
        <div>
          <p className="text-sm text-ink font-mono">
            {getPrimaryMaskedIdentifier(r)}
          </p>
          {r.fullName && (
            <p className="text-xs text-muted mt-0.5">{r.fullName}</p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <Badge>{categoryLabel(r.category)}</Badge>,
    },
    {
      key: "date",
      header: "Submitted",
      hideOnMobile: true,
      render: (r) => (
        <span className="text-xs text-muted">{formatDate(r.submittedAt)}</span>
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
      key: "confidence",
      header: "Confidence",
      render: (r) => <ConfidenceBadge confidence={r.confidence} />,
    },
    {
      key: "earnings",
      header: "Earnings",
      hideOnMobile: true,
      render: (r) => (
        <span className="tabular-nums font-medium">
          {formatNaira(r.earningsGenerated)}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      render: () => (
        <span className="text-xs text-muted">View</span>
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
            value={filters.category || "all"}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                category: e.target.value as ReportCategory | "all",
                page: 1,
              }))
            }
            options={[
              { value: "all", label: "All categories" },
              ...REPORT_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              })),
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
              emptyMessage="No reports match your filters."
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
        title="Report details"
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{categoryLabel(selected.category)}</Badge>
              <ConfidenceBadge confidence={selected.confidence} />
            </div>

            <p className="text-sm text-muted">
              {selected.confidence.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label="Reference" value={selected.reference} mono />
              <Field
                label="Submitted"
                value={formatDateTime(selected.submittedAt)}
              />
              {selected.fullName && (
                <Field label="Full name" value={selected.fullName} />
              )}
              {selected.bank && <Field label="Bank" value={selected.bank} />}
              {selected.maskedAccountNumber && (
                <Field
                  label="Account number"
                  value={selected.maskedAccountNumber}
                  mono
                />
              )}
              {selected.maskedPhone && (
                <Field label="Phone" value={selected.maskedPhone} mono />
              )}
              {selected.maskedEmail && (
                <Field label="Email" value={selected.maskedEmail} mono />
              )}
              {selected.maskedBvn && (
                <Field label="BVN" value={selected.maskedBvn} mono />
              )}
              {selected.maskedNin && (
                <Field label="NIN" value={selected.maskedNin} mono />
              )}
              <Field
                label="Incident date"
                value={formatDate(selected.incidentDate)}
              />
              {selected.amountInvolved != null && (
                <Field
                  label="Amount involved"
                  value={formatNaira(selected.amountInvolved)}
                />
              )}
              <Field
                label="Independent sources"
                value={String(selected.independentSourceCount)}
              />
              <Field
                label="Earnings generated"
                value={formatNaira(selected.earningsGenerated)}
              />
            </div>

            <div>
              <p className="text-xs text-muted mb-1">Description</p>
              <p className="text-sm text-ink leading-relaxed">
                {selected.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Field({
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

export default function ReportsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={6} />}>
      <ReportsContent />
    </Suspense>
  );
}
