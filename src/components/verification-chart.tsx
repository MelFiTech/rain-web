"use client";

import { useEffect, useRef, useState } from "react";

export const CHART_SERIES = {
  verifications: { label: "Verifications", color: "#8B7CF6" },
  matches: { label: "Confirmed matches", color: "#EA4C89" },
};

const DATA = [
  { label: "Apr 27", verifications: 34, matches: 9 },
  { label: "May 4", verifications: 41, matches: 12 },
  { label: "May 11", verifications: 38, matches: 11 },
  { label: "May 18", verifications: 47, matches: 15 },
  { label: "May 25", verifications: 52, matches: 14 },
  { label: "Jun 1", verifications: 49, matches: 17 },
  { label: "Jun 8", verifications: 58, matches: 19 },
  { label: "Jun 15", verifications: 63, matches: 18 },
  { label: "Jun 22", verifications: 60, matches: 22 },
  { label: "Jun 29", verifications: 68, matches: 24 },
  { label: "Jul 6", verifications: 72, matches: 23 },
  { label: "Jul 13", verifications: 78, matches: 27 },
];

const H = 240;
const PAD = { top: 14, right: 12, bottom: 28, left: 40 };
const Y_MAX = 80;
const Y_TICKS = [0, 20, 40, 60, 80];

/* Catmull-Rom → cubic bezier for a smooth line through every point */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function VerificationChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = H - PAD.top - PAD.bottom;
  const stepX = DATA.length > 1 ? innerW / (DATA.length - 1) : 0;

  const x = (i: number) => PAD.left + i * stepX;
  const y = (v: number) => PAD.top + innerH - (v / Y_MAX) * innerH;

  const vPts: [number, number][] = DATA.map((d, i) => [x(i), y(d.verifications)]);
  const mPts: [number, number][] = DATA.map((d, i) => [x(i), y(d.matches)]);

  const baseline = PAD.top + innerH;
  const areaFor = (pts: [number, number][]) =>
    `${smoothPath(pts)} L ${pts[pts.length - 1][0]} ${baseline} L ${pts[0][0]} ${baseline} Z`;

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || stepX === 0) return;
    const px = e.clientX - rect.left - PAD.left;
    const idx = Math.min(
      DATA.length - 1,
      Math.max(0, Math.round(px / stepX))
    );
    setHover(idx);
  };

  const hovered = hover !== null ? DATA[hover] : null;
  // Flip the tooltip to the left of the crosshair past the midpoint
  const tooltipLeft =
    hover !== null ? x(hover) + (x(hover) > width / 2 ? -12 : 12) : 0;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label="Weekly verifications and confirmed matches over the last 12 weeks"
        >
          <defs>
            <linearGradient id="fill-verifications" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_SERIES.verifications.color}
                stopOpacity="0.22"
              />
              <stop
                offset="100%"
                stopColor={CHART_SERIES.verifications.color}
                stopOpacity="0"
              />
            </linearGradient>
            <linearGradient id="fill-matches" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_SERIES.matches.color}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={CHART_SERIES.matches.color}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Recessive grid + y labels */}
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--line)"
                strokeWidth={1}
                strokeDasharray={t === 0 ? undefined : "3 5"}
              />
              <text
                x={PAD.left - 10}
                y={y(t) + 3.5}
                textAnchor="end"
                fontSize={11}
                fill="var(--subtle)"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Sparse x labels — every third week */}
          {DATA.map((d, i) =>
            i % 3 === 0 ? (
              <text
                key={d.label}
                x={x(i)}
                y={H - 8}
                textAnchor="middle"
                fontSize={11}
                fill="var(--subtle)"
              >
                {d.label}
              </text>
            ) : null
          )}

          {/* Gradient areas under each line */}
          <path d={areaFor(vPts)} fill="url(#fill-verifications)" />
          <path d={areaFor(mPts)} fill="url(#fill-matches)" />

          {/* Series lines */}
          <path
            d={smoothPath(vPts)}
            fill="none"
            stroke={CHART_SERIES.verifications.color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d={smoothPath(mPts)}
            fill="none"
            stroke={CHART_SERIES.matches.color}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Hover layer: crosshair + ringed markers */}
          {hover !== null && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={baseline}
                stroke="var(--subtle)"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.6}
              />
              {(
                [
                  [vPts, CHART_SERIES.verifications.color],
                  [mPts, CHART_SERIES.matches.color],
                ] as [typeof vPts, string][]
              ).map(([pts, color], k) => (
                <circle
                  key={k}
                  cx={pts[hover][0]}
                  cy={pts[hover][1]}
                  r={4.5}
                  fill={color}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* Hit target covering the plot */}
          <rect
            x={PAD.left - 8}
            y={0}
            width={innerW + 16}
            height={H}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
      )}

      {/* Glass tooltip */}
      {hovered && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-line bg-glass backdrop-blur-xl px-3 py-2.5 shadow-[0_8px_24px_-8px_rgba(10,5,8,0.5)]"
          style={{
            left: tooltipLeft,
            top: PAD.top,
            transform: x(hover) > width / 2 ? "translateX(-100%)" : undefined,
          }}
        >
          <p className="text-[11px] font-medium text-muted mb-1.5">
            Week of {hovered.label}
          </p>
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-xs text-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: CHART_SERIES.verifications.color }}
              />
              Verifications
              <span className="ml-auto pl-4 font-semibold tabular-nums text-ink">
                {hovered.verifications}
              </span>
            </p>
            <p className="flex items-center gap-2 text-xs text-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: CHART_SERIES.matches.color }}
              />
              Matches
              <span className="ml-auto pl-4 font-semibold tabular-nums text-ink">
                {hovered.matches}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Screen-reader table view */}
      <table className="sr-only">
        <caption>Weekly verifications and confirmed matches</caption>
        <thead>
          <tr>
            <th>Week</th>
            <th>Verifications</th>
            <th>Confirmed matches</th>
          </tr>
        </thead>
        <tbody>
          {DATA.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.verifications}</td>
              <td>{d.matches}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
