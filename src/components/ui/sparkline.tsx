"use client";

import { useId } from "react";

interface SparkProps {
  data: number[];
  /** @deprecated Prefer gradientFrom / gradientTo */
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  width?: number;
  height?: number;
}

const STROKE_WIDTH = 1.35;

function scalePoints(
  data: number[],
  width: number,
  height: number,
  padX = 2,
  padY = 4
): [number, number][] {
  const rawMin = Math.min(...data);
  const rawMax = Math.max(...data);
  const rawSpan = rawMax - rawMin || 1;
  const yPad = rawSpan * 0.12;
  const min = rawMin - yPad;
  const max = rawMax + yPad;
  const span = max - min || 1;
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;
  const innerH = height - padY * 2;

  return data.map(
    (v, i) =>
      [
        padX + i * stepX,
        padY + innerH * (1 - (v - min) / span),
      ] as [number, number]
  );
}

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${
      p2[0] - (p3[0] - p1[0]) / 6
    } ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function resolveGradient(
  gradientFrom?: string,
  gradientTo?: string,
  color?: string
): [string, string] {
  if (gradientFrom && gradientTo) return [gradientFrom, gradientTo];
  const c = color ?? "var(--muted)";
  return [c, c];
}

export function Sparkline({
  data,
  color,
  gradientFrom,
  gradientTo,
  width = 44,
  height = 18,
}: SparkProps) {
  const uid = useId().replace(/:/g, "");
  const [from, to] = resolveGradient(gradientFrom, gradientTo, color);
  const strokeId = `spark-line-${uid}`;
  const fillId = `spark-fill-${uid}`;
  const padY = 4;
  const pts = scalePoints(data, width, height, 2, padY);
  const line = smoothPath(pts);
  const baseline = height - padY;
  const area = `${line} L ${pts[pts.length - 1][0]} ${baseline} L ${pts[0][0]} ${baseline} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
      aria-hidden
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={to} stopOpacity={0.28} />
          <stop offset="100%" stopColor={to} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${fillId})`} />
      <path
        d={line}
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkBars({
  data,
  color,
  gradientFrom,
  gradientTo,
  width = 44,
  height = 18,
}: SparkProps) {
  const uid = useId().replace(/:/g, "");
  const [from, to] = resolveGradient(gradientFrom, gradientTo, color);
  const gradId = `spark-bars-${uid}`;
  const max = Math.max(...data) || 1;
  const gap = 2;
  const padY = 2;
  const barW = (width - gap * (data.length - 1)) / data.length;
  const innerH = height - padY;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
      aria-hidden
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const h = Math.max(2, (v / max) * (innerH - 1));
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            rx={1}
            fill={`url(#${gradId})`}
            opacity={i === data.length - 1 ? 1 : 0.5}
          />
        );
      })}
    </svg>
  );
}
