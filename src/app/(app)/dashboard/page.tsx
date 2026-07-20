"use client";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchDashboard } from "@/services/dashboard";
import type { DashboardSummary } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await fetchDashboard();
      setData(summary);
    } catch {
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <p className="text-sm text-muted">{error || "No data"}</p>
        <Button className="mt-4" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }

  return <DashboardView data={data} />;
}
