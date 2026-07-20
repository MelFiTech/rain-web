"use client";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { CuteAvatar } from "@/components/ui/avatar";
import { RainMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { getDashboardSummary, MOCK_USER } from "@/services/mock-data";
import { NAV_ITEMS } from "@/components/layout/sidebar";
import { Bell, Moon, ShieldCheck, Sun } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 920;

const GLASS_PANEL =
  "border border-white/55 bg-white/42 shadow-[0_1px_2px_rgba(20,10,15,0.04),0_12px_40px_-12px_rgba(20,10,15,0.12)] backdrop-blur-2xl backdrop-saturate-150";
const GLASS_HEADER =
  "border-b border-white/50 bg-white/28 backdrop-blur-xl backdrop-saturate-150";

export function LandingDashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.76);
  const data = useMemo(() => getDashboardSummary(), []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      setScale(w / DESIGN_WIDTH);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-transparent"
      role="img"
      aria-label="The Rain dashboard — verification activity, report categories, and live network signals"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ height: DESIGN_HEIGHT * scale }}
      >
        <div
          data-theme="light"
          className="pointer-events-none absolute left-0 top-0 origin-top-left select-none bg-transparent text-foreground"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <div className="flex h-full p-1.5">
            <aside className="flex w-64 shrink-0 flex-col">
              <div className="flex items-center justify-between px-5 py-6">
                <div className="flex items-center gap-2.5">
                  <RainMark className="h-8 w-8 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold tracking-tight text-ink">
                      Rain
                    </div>
                    <div className="text-[11px] text-muted">
                      Risk Intelligence
                    </div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 space-y-1.5 px-3">
                {NAV_ITEMS.map((item) => {
                  const active = item.href === "/dashboard";
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                        active
                          ? "border-line bg-card font-medium text-ink"
                          : "border-transparent text-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active && "text-primary"
                        )}
                        strokeWidth={active ? 2 : 1.75}
                      />
                      {item.label}
                    </div>
                  );
                })}
              </nav>

              <div className="mt-auto p-3 pl-6">
                <div className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5">
                  <span className="rounded-full bg-card p-1.5 text-foreground shadow-[0_1px_2px_rgba(20,10,15,0.08)]">
                    <Sun className="h-3.5 w-3.5" />
                  </span>
                  <span className="rounded-full p-1.5 text-muted">
                    <Moon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </aside>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl",
                GLASS_PANEL
              )}
            >
              <header className={cn("shrink-0", GLASS_HEADER)}>
                <div className="flex h-16 items-center justify-between gap-4 px-4">
                  <h1 className="truncate text-lg font-semibold tracking-tight text-ink">
                    Dashboard
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-b from-[#f2679e] to-[#d63f7c] px-4 text-sm font-medium text-white ring-1 ring-[#c93a72]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_10px_-2px_rgba(234,76,137,0.5)]">
                      <ShieldCheck className="h-4 w-4" />
                      Verify User
                    </span>
                    <span className="relative rounded-xl p-2">
                      <Bell className="h-[18px] w-[18px] text-muted" />
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <CuteAvatar className="h-8 w-8 ring-1 ring-line" />
                  </div>
                </div>
              </header>

              <main className="min-h-0 flex-1 overflow-hidden bg-white/12 px-4 py-5 backdrop-blur-sm">
                <DashboardView data={data} preview />
              </main>
            </div>
          </div>

          <span className="sr-only">{MOCK_USER.institution.name}</span>
        </div>
      </div>
    </div>
  );
}
