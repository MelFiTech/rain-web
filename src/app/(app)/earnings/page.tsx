"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SkeletonCards, SkeletonTable } from "@/components/ui/skeleton";
import { formatDateTime, formatNaira } from "@/lib/format";
import { fetchEarnings } from "@/services/earnings";
import type { EarningRecord, EarningsSummary } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function EarningsPage() {
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchEarnings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={4} />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  const stats = [
    { label: "Available earnings", value: formatNaira(data.available) },
    { label: "Pending earnings", value: formatNaira(data.pending) },
    { label: "Lifetime earnings", value: formatNaira(data.lifetime) },
    {
      label: "Rewarded matches",
      value: data.totalRewardedMatches.toLocaleString(),
    },
  ];

  const columns: Column<EarningRecord>[] = [
    {
      key: "identifier",
      header: "Identifier",
      render: (r) => (
        <span className="font-mono text-sm">{r.maskedIdentifier}</span>
      ),
    },
    {
      key: "report",
      header: "Report reference",
      render: (r) => (
        <span className="font-mono text-xs text-muted">{r.reportReference}</span>
      ),
    },
    {
      key: "amount",
      header: "Reward",
      render: (r) => (
        <span className="font-semibold tabular-nums">
          {formatNaira(r.amount)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      render: (r) => (
        <span className="text-xs text-muted">{formatDateTime(r.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          tone={
            r.status === "available"
              ? "success"
              : r.status === "pending"
                ? "warning"
                : "soft"
          }
        >
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-5">
          <h3 className="text-base font-semibold text-ink tracking-tight">
            Earnings history
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            ₦20 reward when your report contributes to another institution&apos;s
            verification result
          </p>
        </div>
        <DataTable
          columns={columns}
          data={data.records}
          keyExtractor={(r) => r.id}
          emptyMessage="No earnings yet. Submit quality reports to start earning."
        />
      </Card>
    </div>
  );
}
