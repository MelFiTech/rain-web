import { delay } from "@/lib/utils";
import type {
  Institution,
  InstitutionSettings,
  NotificationPreferences,
} from "@/types";
import { settingsStore } from "./mock-data";

export async function fetchSettings(): Promise<InstitutionSettings> {
  await delay(500);
  return {
    profile: { ...settingsStore.data.profile },
    notificationPreferences: {
      ...settingsStore.data.notificationPreferences,
    },
    sessions: [...settingsStore.data.sessions],
  };
}

export async function updateProfile(
  profile: Partial<Institution>
): Promise<{ success: true } | { success: false; error: string }> {
  await delay(700);
  settingsStore.data.profile = {
    ...settingsStore.data.profile,
    ...profile,
  };
  return { success: true };
}

export async function updateNotificationPreferences(
  prefs: NotificationPreferences
): Promise<{ success: true }> {
  await delay(500);
  settingsStore.data.notificationPreferences = { ...prefs };
  return { success: true };
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  await delay(700);

  if (!input.currentPassword || !input.newPassword) {
    return { success: false, error: "All password fields are required." };
  }

  if (input.currentPassword !== "password123") {
    return { success: false, error: "Current password is incorrect." };
  }

  if (input.newPassword.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters.",
    };
  }

  if (input.newPassword !== input.confirmPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  return { success: true };
}

export async function logoutSession(
  sessionId: string
): Promise<{ success: boolean }> {
  await delay(400);
  settingsStore.data.sessions = settingsStore.data.sessions.filter(
    (s) => s.id !== sessionId || s.current
  );
  return { success: true };
}

export async function logoutAllSessions(): Promise<{ success: boolean }> {
  await delay(500);
  settingsStore.data.sessions = settingsStore.data.sessions.filter(
    (s) => s.current
  );
  return { success: true };
}
