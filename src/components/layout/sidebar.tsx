"use client";

import { cn } from "@/lib/utils";
import {
  Banknote,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldAlert,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/verify", label: "Verify User", icon: Search },
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
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white text-sm font-semibold tracking-tight">
            R
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink tracking-tight">
              Rain
            </div>
            <div className="text-[11px] text-muted">Risk Intelligence</div>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-hover cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-hover text-ink font-medium"
                  : "text-muted hover:bg-hover/70 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 mt-auto">
        <div className="px-3 py-3 mb-1">
          <p className="text-xs font-medium text-ink truncate">
            {user?.institution.name}
          </p>
          <p className="text-xs text-muted truncate mt-0.5">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-hover hover:text-foreground transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-60 xl:w-64 shrink-0 flex-col bg-surface h-screen sticky top-0">
        {content}
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
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export { NAV_ITEMS };
