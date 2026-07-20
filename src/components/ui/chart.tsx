"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import * as RechartsPrimitive from "recharts";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted [&_.recharts-cartesian-grid_line]:stroke-line/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-line",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, item]) => item.color);
  if (!entries.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: entries
          .map(
            ([key, item]) =>
              `[data-chart=${id}]{--color-${key}:${item.color};}`
          )
          .join(""),
      }}
    />
  );
}

export function ChartTooltip({
  content,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return (
    <RechartsPrimitive.Tooltip
      cursor={false}
      content={content}
      wrapperStyle={{ outline: "none" }}
      {...props}
    />
  );
}

function formatTooltipValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(String).join(", ");
  return String(value);
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  indicator = "dot",
}: {
  active?: boolean;
  payload?: ReadonlyArray<Record<string, unknown>>;
  label?: string | number;
  hideLabel?: boolean;
  indicator?: "dot" | "line";
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line bg-glass backdrop-blur-xl px-3 py-2.5 shadow-[0_8px_24px_-8px_rgba(10,5,8,0.5)]">
      {!hideLabel && label != null && label !== "" ? (
        <p className="mb-1.5 text-[11px] font-medium text-muted">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const itemConfig = config[key];
          const labelText = itemConfig?.label ?? key;
          const color =
            typeof item.color === "string" ? item.color : undefined;
          return (
            <div
              key={key}
              className="flex items-center gap-2 text-xs text-foreground"
            >
              {indicator === "dot" ? (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color ?? "var(--muted)" }}
                />
              ) : (
                <span
                  className="h-0.5 w-3 shrink-0 rounded-full"
                  style={{ background: color ?? "var(--muted)" }}
                />
              )}
              <span>{labelText}</span>
              <span className="ml-auto pl-4 font-semibold tabular-nums text-ink">
                {formatTooltipValue(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
