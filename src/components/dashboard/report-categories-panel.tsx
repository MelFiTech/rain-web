"use client";

/** Landing-aligned accent palette (pink / violet / sky). */
export const REPORT_CATEGORY_COLORS = [
  { bar: "#EA4C89", glow: "rgba(234, 76, 137, 0.35)" },
  { bar: "#7C6CF0", glow: "rgba(124, 108, 240, 0.35)" },
  { bar: "#79ADE3", glow: "rgba(121, 173, 227, 0.4)" },
  { bar: "#9CC6EE", glow: "rgba(156, 198, 238, 0.35)" },
  { bar: "#C2DEF6", glow: "rgba(194, 222, 246, 0.4)" },
] as const;

export interface ReportCategoryStat {
  label: string;
  count: number;
}

interface ReportCategoriesPanelProps {
  categories: ReportCategoryStat[];
  matchRate: number;
}

export function ReportCategoriesPanel({
  categories,
  matchRate,
}: ReportCategoriesPanelProps) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const max = categories[0]?.count ?? 1;

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -right-6 -top-4 h-28 w-28 rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(234,76,137,0.18) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mb-5 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary-soft/40 via-card to-info-bg/30">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch">
          <div className="px-4 py-3.5 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              Confirmed reports
            </p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
              {total}
            </p>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              By category this period
            </p>
          </div>

          <div className="flex w-[7.25rem] shrink-0 flex-col items-center justify-center border-l border-line/80 bg-hover/20 px-3 py-3.5 text-center sm:w-[7.75rem]">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Match rate
            </p>
            <div
              className="mt-2 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold tabular-nums text-ink"
              style={{
                background:
                  "conic-gradient(from 210deg, #EA4C89 0deg, #7C6CF0 120deg, #79ADE3 240deg, #EA4C89 360deg)",
                padding: "2px",
              }}
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-card text-ink">
                {matchRate}%
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-snug text-subtle">
              Verifications with a hit
            </p>
          </div>
        </div>
      </div>

      <div className="relative space-y-4">
        {categories.map((c, i) => {
          const palette = REPORT_CATEGORY_COLORS[i % REPORT_CATEGORY_COLORS.length];
          const width = (c.count / max) * 100;

          return (
            <div key={c.label}>
              <p className="mb-2 truncate text-sm font-medium text-foreground">
                {c.label}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-hover/80">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${palette.bar} 0%, ${palette.bar}99 55%, ${palette.glow} 100%)`,
                    boxShadow: `0 0 12px -2px ${palette.glow}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
