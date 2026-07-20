"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

/** Matches landing page pink / violet / sky accents. */
export const LANDING_CHART = {
  pink: "#EA4C89",
  pinkDeep: "#d63f7c",
  violet: "#7C6CF0",
  sky: "#79ADE3",
  skyLight: "#9CC6EE",
} as const;

export const CHART_SERIES = {
  verifications: {
    label: "Verifications",
    color: LANDING_CHART.sky,
  },
  matches: {
    label: "Confirmed matches",
    color: LANDING_CHART.pink,
  },
} as const;

const CHART_DATA = [
  { week: "Apr 27", verifications: 34, matches: 9 },
  { week: "May 4", verifications: 41, matches: 12 },
  { week: "May 11", verifications: 38, matches: 11 },
  { week: "May 18", verifications: 47, matches: 15 },
  { week: "May 25", verifications: 52, matches: 14 },
  { week: "Jun 1", verifications: 49, matches: 17 },
  { week: "Jun 8", verifications: 58, matches: 19 },
  { week: "Jun 15", verifications: 63, matches: 18 },
  { week: "Jun 22", verifications: 60, matches: 22 },
  { week: "Jun 29", verifications: 68, matches: 24 },
  { week: "Jul 6", verifications: 72, matches: 23 },
  { week: "Jul 13", verifications: 78, matches: 27 },
];

const chartConfig = {
  verifications: {
    label: CHART_SERIES.verifications.label,
    color: CHART_SERIES.verifications.color,
  },
  matches: {
    label: CHART_SERIES.matches.label,
    color: CHART_SERIES.matches.color,
  },
} satisfies ChartConfig;

export function getChartHeadlineStats() {
  const latest = CHART_DATA[CHART_DATA.length - 1];
  const prev = CHART_DATA[CHART_DATA.length - 2];
  const verificationsDelta = latest.verifications - prev.verifications;
  const matchesDelta = latest.matches - prev.matches;
  const matchRate = Math.round((latest.matches / latest.verifications) * 100);
  return { latest, verificationsDelta, matchesDelta, matchRate };
}

export function ChartLegendPills({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {Object.values(CHART_SERIES).map((s) => (
        <span
          key={s.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-hover/40 px-2.5 py-1 text-[11px] font-medium text-muted"
        >
          <span
            className="h-2 w-2 rounded-full ring-2 ring-card"
            style={{ background: s.color }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function ChartHeadlineStrip() {
  const { latest, verificationsDelta, matchesDelta, matchRate } =
    getChartHeadlineStats();

  return (
    <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
      <HeadlineStat
        label="Latest week"
        value={latest.verifications.toString()}
        sub="Verifications"
        delta={verificationsDelta}
        accent={LANDING_CHART.sky}
      />
      <HeadlineStat
        label="Confirmed"
        value={latest.matches.toString()}
        sub="Matches"
        delta={matchesDelta}
        accent={LANDING_CHART.pink}
      />
      <HeadlineStat
        label="Hit rate"
        value={`${matchRate}%`}
        sub="Of latest volume"
        accent={LANDING_CHART.violet}
      />
    </div>
  );
}

function HeadlineStat({
  label,
  value,
  sub,
  delta,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  delta?: number;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl border border-line px-3 py-2.5"
      style={{
        background: `linear-gradient(135deg, ${accent}14 0%, transparent 55%)`,
      }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-lg font-semibold tabular-nums tracking-tight text-ink">
          {value}
        </p>
        {delta !== undefined && (
          <span
            className={cn(
              "text-[11px] font-medium tabular-nums",
              delta >= 0 ? "text-ok-fg" : "text-bad-fg"
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>
      <p className="text-[11px] text-subtle">{sub}</p>
    </div>
  );
}

export function VerificationChart() {
  const { verificationsDelta } = getChartHeadlineStats();
  const trendPct =
    CHART_DATA.length >= 2
      ? (
          ((CHART_DATA[CHART_DATA.length - 1].verifications -
            CHART_DATA[CHART_DATA.length - 2].verifications) /
            CHART_DATA[CHART_DATA.length - 2].verifications) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto min-h-[240px] w-full flex-1 [&_.recharts-responsive-container]:!h-full"
      >
        <AreaChart
          accessibilityLayer
          data={CHART_DATA}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <YAxis hide domain={[0, "auto"]} />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            interval={2}
            tick={{ fill: "var(--subtle)", fontSize: 11 }}
            tickFormatter={(value: string) => value.split(" ")[0] ?? value}
          />
          <ChartTooltip
            labelFormatter={(week) => `Week of ${week}`}
            content={({ active, payload, label }) => (
              <ChartTooltipContent
                active={active}
                payload={
                  payload as unknown as
                    | ReadonlyArray<Record<string, unknown>>
                    | undefined
                }
                label={label}
                indicator="dot"
              />
            )}
          />
          <Area
            dataKey="verifications"
            type="monotone"
            fill="var(--color-verifications)"
            fillOpacity={0.22}
            stroke="var(--color-verifications)"
            strokeWidth={2}
          />
          <Area
            dataKey="matches"
            type="monotone"
            fill="var(--color-matches)"
            fillOpacity={0.28}
            stroke="var(--color-matches)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>

      <div className="flex shrink-0 items-start gap-2 border-t border-line pt-3 text-sm">
        <div className="grid gap-0.5">
          <div className="flex items-center gap-2 font-medium leading-none text-ink">
            {verificationsDelta >= 0 ? "Trending up" : "Trending down"} by{" "}
            {Math.abs(Number(trendPct))}% this week
            <TrendingUp
              className={cn(
                "h-4 w-4",
                verificationsDelta < 0 && "rotate-180"
              )}
            />
          </div>
          <p className="text-xs leading-none text-muted">
            {CHART_DATA[0]?.week} – {CHART_DATA[CHART_DATA.length - 1]?.week}
          </p>
        </div>
      </div>
    </div>
  );
}
