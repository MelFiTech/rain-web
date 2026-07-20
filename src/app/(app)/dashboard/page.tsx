"use client";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/contexts/toast-context";
import { fetchDashboard } from "@/services/dashboard";
import type { DashboardSummary } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const summary = await fetchDashboard();
      setData(summary);
    } catch {
      setLoadFailed(true);
      setData(null);
      toast.error("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (loadFailed || !data) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted">Could not load dashboard data.</p>
        <Button className="mt-4" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }

  return <DashboardView data={data} />;
}
