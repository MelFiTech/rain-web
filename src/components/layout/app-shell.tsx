"use client";

import { VerifySheetProvider } from "@/contexts/verify-sheet-context";
import { useAuth } from "@/contexts/auth-context";
import { RainMark } from "@/components/ui/logo";
import { useInactivityLogout } from "@/hooks/use-inactivity-logout";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

const COLLAPSE_KEY = "rain:sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem(COLLAPSE_KEY, v ? "0" : "1");
      return !v;
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleInactivityLogout = useCallback(async () => {
    await logout();
    router.replace("/login?reason=inactivity");
  }, [logout, router]);

  useInactivityLogout(Boolean(user), handleInactivityLogout);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RainMark className="h-10 w-10" />
          <div className="h-1 w-16 rounded-full skeleton" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <VerifySheetProvider>
      <div className="h-screen flex p-1 sm:p-1.5 lg:pl-0 overflow-hidden">
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        showAdmin={Boolean(user.isPlatformAdmin)}
      />
      <div
        data-shell-main
        className="flex-1 flex flex-col min-w-0 bg-surface rounded-2xl border border-line shadow-[0_1px_2px_rgba(20,10,15,0.03),0_12px_32px_-12px_rgba(20,10,15,0.08)] overflow-hidden"
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto no-scrollbar px-2 sm:px-3 lg:px-4 py-6 pb-12 animate-fade-in">
          {children}
        </main>
      </div>
      </div>
    </VerifySheetProvider>
  );
}
