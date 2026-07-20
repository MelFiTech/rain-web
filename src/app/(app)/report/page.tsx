"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReportPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/reports?compose=1");
  }, [router]);

  return null;
}
