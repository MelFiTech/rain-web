import { apiGet, apiPatch, isApiConfigured } from "@/lib/api-client";
import { EMPTY_DASHBOARD_SUMMARY } from "@/lib/empty-states";
import type { DashboardSummary, NotificationItem } from "@/types";

export async function fetchDashboard(): Promise<DashboardSummary> {
  if (!isApiConfigured()) {
    return { ...EMPTY_DASHBOARD_SUMMARY };
  }
  return apiGet<DashboardSummary>("/platform/dashboard");
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  if (!isApiConfigured()) {
    return [];
  }
  return apiGet<NotificationItem[]>("/platform/notifications");
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isApiConfigured()) return;
  await apiPatch(`/platform/notifications/${encodeURIComponent(id)}`, {
    read: true,
  });
}
