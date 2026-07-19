"use client";

import { cn } from "@/lib/utils";
import {
  Banknote,
  ClipboardList,
  History,
  LayoutDashboard,
  Moon,
  PanelLeft,
  Settings,
  ShieldAlert,
  Sun,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RainMark } from "@/components/ui/logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/report", label: "Report User", icon: ShieldAlert },
  { href: "/history", label: "Verification History", icon: History },
  { href: "/reports", label: "My Reports", icon: ClipboardList },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/earnings", label: "Earnings", icon: Banknote },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

function ThemeControl({ collapsed }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "light" ? "light" : "dark"
    );
  }, []);

  const apply = (next: "dark" | "light") => {
    if (next === "light") {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem("rain:theme", next);
    setTheme(next);
  };

  if (collapsed) {
    const next = theme === "dark" ? "light" : "dark";
    return (
      <button
        onClick={() => apply(next)}
        className="flex w-full items-center justify-center p-2.5 rounded-xl text-muted hover:bg-nav-hover hover:text-foreground transition-colors cursor-pointer"
        aria-label={`Switch to ${next} theme`}
        title={`Switch to ${next} theme`}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5">
      <button
        onClick={() => apply("light")}
        className={cn(
          "p-1.5 rounded-full transition-colors cursor-pointer",
          theme === "light"
            ? "bg-card text-foreground shadow-[0_1px_2px_rgba(20,10,15,0.08)]"
            : "text-muted hover:text-foreground"
        )}
        aria-label="Light theme"
        title="Light theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => apply("dark")}
        className={cn(
          "p-1.5 rounded-full transition-colors cursor-pointer",
          theme === "dark"
            ? "bg-card text-foreground shadow-[0_1px_2px_rgba(20,10,15,0.08)]"
            : "text-muted hover:text-foreground"
        )}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Sidebar({ open, onClose, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const renderContent = (isCollapsed: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "py-6",
          isCollapsed
            ? "flex flex-col items-center gap-3 px-0"
            : "flex items-center justify-between px-5"
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          title="Rain"
        >
          <RainMark className="h-8 w-8 shrink-0" />
          {!isCollapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-ink tracking-tight">
                Rain
              </div>
              <div className="text-[11px] text-muted">Risk Intelligence</div>
            </div>
          )}
        </Link>
        <div className={cn("flex items-center", isCollapsed && "flex-col")}>
          {onToggle && (
            <button
              onClick={onToggle}
              className="hidden lg:flex p-1.5 rounded-lg text-muted hover:bg-nav-hover hover:text-foreground transition-colors cursor-pointer"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          {onClose && !isCollapsed && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-hover cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-4 w-4 text-muted" />
            </button>
          )}
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1.5 overflow-y-auto no-scrollbar",
          isCollapsed ? "px-2.5" : "px-3"
        )}
      >
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm transition-colors",
                isCollapsed ? "justify-center p-2" : "px-3 py-2",
                active
                  ? "bg-card border border-line text-ink font-medium"
                  : "border border-transparent text-muted hover:bg-nav-hover hover:text-foreground"
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active && "text-primary")}
                strokeWidth={active ? 2 : 1.75}
              />
              {!isCollapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto", isCollapsed ? "p-2.5" : "p-3 pl-6")}>
        <ThemeControl collapsed={isCollapsed} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop — transparent, sits on the page background */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col transition-[width] duration-200 ease-out",
          collapsed ? "lg:w-[64px]" : "lg:w-60 xl:w-64"
        )}
      >
        {renderContent(!!collapsed)}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface shadow-xl animate-fade-in">
            {renderContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}

export { NAV_ITEMS };
