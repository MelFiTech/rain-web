import { delay } from "@/lib/utils";
import type { DashboardSummary, NotificationItem } from "@/types";
import { getDashboardSummary, MOCK_NOTIFICATIONS } from "./mock-data";

export async function fetchDashboard(): Promise<DashboardSummary> {
  await delay(700);
  return getDashboardSummary();
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await delay(300);
  return [...MOCK_NOTIFICATIONS];
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(200);
  const item = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  if (item) item.read = true;
}
