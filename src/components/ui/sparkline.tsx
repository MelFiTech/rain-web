"use client";

interface SparkProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

function scale(data: number[], width: number, height: number, pad = 2) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (data.length - 1);
  return data.map(
    (v, i) =>
      [
        pad + i * stepX,
        pad + (height - pad * 2) * (1 - (v - min) / span),
      ] as [number, number]
  );
}

/* Compact smooth line, e.g. beside a stat value */
export function Sparkline({ data, color, width = 64, height = 28 }: SparkProps) {
  const pts = scale(data, width, height);
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
  return (
    <svg width={width} height={height} aria-hidden className="shrink-0">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Compact rounded bar strip, e.g. beside a count */
export function SparkBars({ data, color, width = 64, height = 28 }: SparkProps) {
  const max = Math.max(...data) || 1;
  const gap = 3;
  const barW = (width - gap * (data.length - 1)) / data.length;
  return (
    <svg width={width} height={height} aria-hidden className="shrink-0">
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * height);
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            rx={1.5}
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}
