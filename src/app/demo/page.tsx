"use client";

import { isApiConfigured } from "@/lib/api-client";
import Link from "next/link";

export default function DemoPage() {
  if (!isApiConfigured()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-sm text-muted">
          Set <code className="rounded bg-hover px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_API_URL</code>{" "}
          and sign in at{" "}
          <Link href="/login" className="text-primary hover:underline">
            /login
          </Link>{" "}
          to capture authenticated screenshots.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="max-w-md text-sm text-muted">
        Sign in at{" "}
        <Link href="/login" className="text-primary hover:underline">
          /login
        </Link>{" "}
        with your institution account, then open the dashboard for captures.
      </p>
    </div>
  );
}
