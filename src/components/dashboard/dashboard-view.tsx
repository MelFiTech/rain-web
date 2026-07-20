"use client";

import { ConfidenceBadge } from "@/components/confidence-badge";
import { dashboardListPanelClassName } from "@/components/dashboard/dashboard-list-panel";
import { LiveReportStreamCard } from "@/components/dashboard/live-report-stream-card";
import { ReportCategoriesPanel } from "@/components/dashboard/report-categories-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SparkBars, Sparkline } from "@/components/ui/sparkline";
import {
  ChartHeadlineStrip,
  ChartLegendPills,
  LANDING_CHART,
  VerificationChart,
} from "@/components/verification-chart";
import { formatNaira, formatRelative, identifierTypeLabel } from "@/lib/format";
import { resolveVerificationRecommendation } from "@/lib/recommendation";
import { cn } from "@/lib/utils";
import type { DashboardSummary, VerificationRecord } from "@/types";
import { ArrowRight, ShieldCheck, ShieldX } from "lucide-react";
import Link from "next/link";

const REPORT_CATEGORIES = [
  { label: "Scam", count: 34 },
  { label: "Mule account", count: 27 },
  { label: "Identity theft", count: 19 },
  { label: "Loan fraud", count: 12 },
  { label: "Chargeback", count: 8 },
];

interface DashboardViewProps {
  data: DashboardSummary;
  /** Static embed (e.g. landing hero) — no navigation, no live stream */
  preview?: boolean;
}

export function DashboardView({ data, preview = false }: DashboardViewProps) {
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
          gradientFrom={LANDING_CHART.skyLight}
          gradientTo={LANDING_CHART.sky}
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
          gradientFrom={LANDING_CHART.skyLight}
          gradientTo={LANDING_CHART.violet}
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
        <Sparkline
          data={[4, 5, 4, 5, 5, 4, 5, 5]}
          gradientFrom="var(--subtle)"
          gradientTo="var(--muted)"
        />
      ),
    },
    {
      label: "Total earnings",
      value: formatNaira(data.totalEarnings),
      href: "/wallet?tab=earnings",
      trend: "+6.5%",
      trendTone: "success" as const,
      viz: (
        <Sparkline
          data={[2, 3, 3, 4, 5, 5, 6, 7]}
          gradientFrom="#f2679e"
          gradientTo={LANDING_CHART.pinkDeep}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const inner = (
            <Card
              className={cn(
                "h-full",
                !preview && "transition-colors hover:bg-hover/40"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-medium uppercase tracking-wider text-muted">
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
                <div className="flex shrink-0 items-center pb-0.5">
                  {stat.viz}
                </div>
              </div>
            </Card>
          );

          if (preview) {
            return <div key={stat.label}>{inner}</div>;
          }

          return (
            <Link key={stat.label} href={stat.href}>
              {inner}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3">
        <Card
          padding="none"
          className="relative flex flex-col overflow-hidden xl:col-span-2"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            aria-hidden
            style={{
              background:
                "radial-gradient(620px 280px at 0% 100%, rgba(121,173,227,0.08), transparent 65%), radial-gradient(520px 280px at 100% 0%, rgba(234,76,137,0.07), transparent 60%)",
            }}
          />
          <div className="relative shrink-0 px-5 pt-5 sm:px-6 sm:pt-6">
            <CardHeader
              className="mb-3"
              title="Verification activity"
              description="Weekly verifications and confirmed matches"
              action={<ChartLegendPills />}
            />
            <ChartHeadlineStrip />
          </div>
          <CardContent
            className={cn(
              "relative flex flex-1 flex-col px-3 pt-0 sm:px-4",
              preview ? "min-h-[200px] pb-3 sm:pb-4" : "min-h-[280px] pb-4 sm:pb-5"
            )}
          >
            <VerificationChart />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader
            title="Report categories"
            description="Confirmed matches by type"
          />
          <ReportCategoriesPanel
            categories={REPORT_CATEGORIES}
            matchRate={32}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="none" className="py-4 sm:py-5">
          <CardHeader
            className="mb-3 items-center px-3 sm:px-4"
            title="Recent verifications"
            action={
              preview ? (
                <span className="inline-flex items-center gap-1 text-sm text-muted">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </span>
              ) : (
                <Link
                  href="/history"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )
            }
          />
          <div
            className={dashboardListPanelClassName(preview, {
              centered: data.recentVerifications.length === 0,
            })}
          >
            {data.recentVerifications.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No verifications yet"
                description={
                  preview
                    ? "Verification activity will appear here."
                    : "Run a check from Verify user to see results here."
                }
                className="py-0"
              />
            ) : (
              data.recentVerifications.map((v) => (
                <VerificationRow
                  key={v.id}
                  record={v}
                  preview={preview}
                />
              ))
            )}
          </div>
        </Card>

        <Card padding="none" className="py-4 sm:py-5">
          <LiveReportStreamCard
            events={data.reportStream}
            preview={preview}
          />
        </Card>
      </div>
    </div>
  );
}

function VerificationRow({
  record,
  preview,
}: {
  record: VerificationRecord;
  preview?: boolean;
}) {
  const isMatch = record.result === "match";

  const content = (
    <>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          isMatch ? "bg-ok-bg text-ok-fg" : "bg-hover text-muted"
        )}
        aria-hidden
      >
        {isMatch ? (
          <ShieldCheck className="h-4 w-4" strokeWidth={2} />
        ) : (
          <ShieldX className="h-4 w-4" strokeWidth={2} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-mono text-sm font-medium text-ink">
            {record.maskedIdentifier}
          </p>
          <Badge tone={isMatch ? "success" : "violet"} className="shrink-0">
            {isMatch ? "Match" : "No match"}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">
          {identifierTypeLabel(record.identifierType)}
          <span className="text-subtle"> · </span>
          <span className="font-mono text-[11px] text-subtle">
            {record.reference}
          </span>
          <span className="text-subtle sm:hidden">
            {" "}
            · {formatRelative(record.createdAt)}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="hidden text-xs text-subtle tabular-nums sm:block">
          {formatRelative(record.createdAt)}
        </span>
        {record.confidence ? (
          <ConfidenceBadge
            confidence={record.confidence}
            className="items-end"
          />
        ) : (
          <span className="inline-flex items-center rounded-full bg-hover px-2.5 py-1 text-xs font-medium text-muted">
            Clear
          </span>
        )}
        {(() => {
          const rec = resolveVerificationRecommendation(record);
          if (rec.severity === "none") return null;
          return (
            <span
              className={cn(
                "max-w-[140px] truncate text-right text-[10px] font-medium leading-tight",
                rec.severity === "critical" || rec.severity === "high"
                  ? "text-red-700 dark:text-red-400"
                  : "text-amber-800 dark:text-amber-300",
              )}
              title={rec.summary}
            >
              {rec.title}
            </span>
          );
        })()}
      </div>
    </>
  );

  const className =
    "flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors";

  if (preview) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={`/history?id=${record.id}`} className={cn(className, "hover:bg-hover")}>
      {content}
    </Link>
  );
}
