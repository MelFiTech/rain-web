"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-10 w-10 rounded-xl bg-ink text-white flex items-center justify-center font-semibold">
        R
      </div>
    </div>
  );
}
