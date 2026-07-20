"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/* Dev helper: signs in with the demo account and lands on the dashboard.
   Used for capturing authenticated marketing screenshots. */
export default function DemoPage() {
  const { login } = useAuth();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // Marketing shots use the light theme with a collapsed sidebar rail
    localStorage.setItem("rain:theme", "light");
    document.documentElement.dataset.theme = "light";
    // Collapsed rail by default; ?expanded=1 keeps the full sidebar
    const params = new URLSearchParams(window.location.search);
    localStorage.setItem(
      "rain:sidebar-collapsed",
      params.get("expanded") === "1" ? "0" : "1"
    );
    // ?clear=1 strips the shell background so captures carry alpha
    if (params.get("clear") === "1") {
      document.documentElement.dataset.shot = "clear";
    }
    (async () => {
      await login({
        email: "compliance@paynest.ng",
        password: "password123",
        rememberMe: true,
      });
      const to =
        new URLSearchParams(window.location.search).get("to") ?? "/dashboard";
      router.replace(to);
    })();
  }, [login, router]);

  return null;
}
