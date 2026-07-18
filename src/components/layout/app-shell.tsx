"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-ink text-white flex items-center justify-center font-semibold">
            R
          </div>
          <div className="h-1 w-16 rounded-full skeleton" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-12 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
