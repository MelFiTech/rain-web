"use client";

import { useVerifySheet } from "@/contexts/verify-sheet-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function VerifyRedirect() {
  const { openVerifySheet } = useVerifySheet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const ref = searchParams.get("ref") || searchParams.get("id") || undefined;
    openVerifySheet(ref ? { ref } : undefined);
    router.replace("/dashboard");
  }, [openVerifySheet, router, searchParams]);

  return null;
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyRedirect />
    </Suspense>
  );
}
