"use client";

import { ConfidenceBadge } from "@/components/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton, SkeletonCards } from "@/components/ui/skeleton";
import { SparkBars, Sparkline } from "@/components/ui/sparkline";
import {
  CHART_SERIES,
  VerificationChart,
} from "@/components/verification-chart";
import { formatDateTime, formatNaira } from "@/lib/format";
import { fetchDashboard } from "@/services/dashboard";
import type { DashboardSummary, VerificationRecord } from "@/types";
import { ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const ANNOUNCEMENTS = [
  {
    title: "BVN-linked lookups are live",
    body: "Verifications now cross-check BVN-linked accounts across all member institutions automatically.",
    date: "Jul 15",
  },
  {
    title: "Scheduled maintenance",
    body: "Rain will be briefly unavailable on Jul 22, 01:00–02:30 WAT while we upgrade the network.",
    date: "Jul 12",
  },
  {
    title: "120 institutions on Rain",
    body: "The network keeps growing — verification coverage just got wider across Nigeria.",
    date: "Jul 8",
  },
];

const REPORT_CATEGORIES = [
  { label: "Scam", count: 34 },
  { label: "Mule account", count: 27 },
  { label: "Identity theft", count: 19 },
  { label: "Loan fraud", count: 12 },
  { label: "Chargeback", count: 8 },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await fetchDashboard();
      setData(summary);
    } catch {
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={4} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <p className="text-sm text-muted">{error || "No data"}</p>
        <Button className="mt-4" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }

  const stats = [
    {
      label: "Wallet balance",
      value: formatNaira(data.walletBalance),
      href: "/wallet",
      trend: "-2.1%",
      trendTone: "danger" as const,
      viz: (
        <Sparkline
          data={[54, 50, 52, 47, 49, 44, 48, 45]}
          color={CHART_SERIES.verifications.color}
        />
      ),
    },
    {
      label: "Total verifications",
      value: data.totalVerifications.toLocaleString(),
      href: "/history",
      trend: "+12.5%",
      trendTone: "success" as const,
      viz: (
        <SparkBars
          data={[3, 5, 4, 6, 7, 6, 8, 9]}
          color={CHART_SERIES.verifications.color}
        />
      ),
    },
    {
      label: "Users reported",
      value: data.usersReported.toLocaleString(),
      href: "/reports",
      trend: "0.0%",
      trendTone: "soft" as const,
      viz: (
        <Sparkline data={[4, 5, 4, 5, 5, 4, 5, 5]} color="var(--subtle)" />
      ),
    },
    {
      label: "Total earnings",
      value: formatNaira(data.totalEarnings),
      href: "/earnings",
      trend: "+6.5%",
      trendTone: "success" as const,
      viz: (
        <Sparkline
          data={[2, 3, 3, 4, 5, 5, 6, 7]}
          color={CHART_SERIES.matches.color}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-hover/40 transition-colors h-full">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted uppercase tracking-wider truncate">
                  {stat.label}
                </p>
                <Badge tone={stat.trendTone} className="shrink-0">
                  {stat.trend}
                </Badge>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
                  {stat.value}
                </p>
                {stat.viz}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Verification activity"
            description="Weekly verifications and confirmed matches"
            action={
              <div className="flex items-center gap-4">
                {Object.values(CHART_SERIES).map((s) => (
                  <span
                    key={s.label}
                    className="flex items-center gap-1.5 text-xs text-muted"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            }
          />
          <VerificationChart />
        </Card>

        <Card>
          <CardHeader
            title="Report categories"
            description="Confirmed matches by type"
          />
          <div className="space-y-4">
            {REPORT_CATEGORIES.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{c.label}</span>
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {c.count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-hover overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.count / REPORT_CATEGORIES[0].count) * 100}%`,
                      background: CHART_SERIES.verifications.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
            <span className="text-sm text-muted">Match rate</span>
            <span className="text-sm font-semibold text-ink tabular-nums">
              32%
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Recent verifications"
            action={
              <Link
                href="/history"
                className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="space-y-1">
            {data.recentVerifications.map((v) => (
              <VerificationRow key={v.id} record={v} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Announcements" description="Updates from Rain" />
          <div className="space-y-1">
            {ANNOUNCEMENTS.map((a) => (
              <div
                key={a.title}
                className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-hover/50 transition-colors"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hover">
                  <Megaphone className="h-3.5 w-3.5 text-muted" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-ink truncate">
                      {a.title}
                    </p>
                    <span className="text-[11px] text-subtle whitespace-nowrap">
                      {a.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    {a.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function VerificationRow({ record }: { record: VerificationRecord }) {
  return (
    <Link
      href={`/history?id=${record.id}`}
      className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-hover transition-colors"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink truncate">
            {record.maskedIdentifier}
          </p>
          <Badge tone={record.result === "match" ? "success" : "violet"}>
            {record.result === "match" ? "Match" : "No match"}
          </Badge>
        </div>
        <p className="text-xs text-muted mt-0.5">
          {formatNaira(record.amountCharged)} ·{" "}
          {formatDateTime(record.createdAt)}
        </p>
      </div>
      {record.confidence ? (
        <ConfidenceBadge confidence={record.confidence} />
      ) : (
        <span className="text-xs text-subtle">—</span>
      )}
    </Link>
  );
}
