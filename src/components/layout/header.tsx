"use client";

import { formatNaira, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchNotifications, markNotificationRead } from "@/services/dashboard";
import { getWalletBalance } from "@/services/wallet";
import type { NotificationItem } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "./sidebar";

interface HeaderProps {
  onMenuClick: () => void;
}

function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  return match?.label ?? "Rain";
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setBalance(getWalletBalance());
    const notes = await fetchNotifications();
    setNotifications(notes);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => setBalance(getWalletBalance()), 2000);
    return () => clearInterval(interval);
  }, [load, pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;
  const title = getPageTitle(pathname);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md no-print">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-hover cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-ink tracking-tight truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/wallet"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-hover transition-colors"
          >
            <Wallet className="h-4 w-4 text-muted" />
            <span className="text-sm font-medium text-ink tabular-nums">
              {formatNaira(balance)}
            </span>
          </Link>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-xl hover:bg-hover cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5 text-muted" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-ink" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-xl animate-fade-in overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    Notifications
                  </span>
                  {unread > 0 && (
                    <span className="text-xs text-muted">{unread} new</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-sm text-muted text-center">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={async () => {
                          await markNotificationRead(n.id);
                          setNotifications((prev) =>
                            prev.map((x) =>
                              x.id === n.id ? { ...x, read: true } : x
                            )
                          );
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-hover transition-colors cursor-pointer",
                          !n.read && "bg-hover/50"
                        )}
                      >
                        <p className="text-sm font-medium text-ink">{n.title}</p>
                        <p className="text-xs text-muted mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-subtle mt-1">
                          {formatRelative(n.createdAt)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-hover cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-hover flex items-center justify-center text-xs font-semibold text-ink">
                {user?.name
                  ?.split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("") ?? "PN"}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-xl animate-fade-in overflow-hidden py-1">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-ink truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {user?.institution.name}
                  </p>
                </div>
                <div className="h-px bg-line mx-2" />
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-hover"
                >
                  <Settings className="h-4 w-4 text-muted" />
                  Settings
                </Link>
                <Link
                  href="/wallet"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-hover sm:hidden"
                >
                  <Wallet className="h-4 w-4 text-muted" />
                  Wallet · {formatNaira(balance)}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-hover cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-muted" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
