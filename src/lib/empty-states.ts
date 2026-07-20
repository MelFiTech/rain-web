import type {
  DashboardSummary,
  Institution,
  InstitutionSettings,
  NotificationPreferences,
} from "@/types";
import { LOW_BALANCE_THRESHOLD } from "@/types";

export function emptyInstitution(): Institution {
  return {
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    contactName: "",
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailVerificationResults: true,
  emailEarnings: true,
  emailTeamActivity: true,
  emailLowBalance: true,
  inAppNotifications: true,
};

export function defaultInstitutionSettings(
  profile?: Institution
): InstitutionSettings {
  const inst = profile ? { ...profile } : emptyInstitution();
  return {
    profile: inst,
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    sessions: [],
    developer: {
      apiKey: {
        keyPrefix: "rain_live",
        maskedKey: "—",
        createdAt: new Date(0).toISOString(),
      },
      webhooks: [],
    },
    settlementBank: null,
  };
}

export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  walletBalance: 0,
  totalVerifications: 0,
  usersReported: 0,
  totalEarnings: 0,
  recentVerifications: [],
  recentReports: [],
  recentEarnings: [],
  reportStream: [],
};

export const EMPTY_WALLET_STATE = {
  balance: 0,
  lowBalanceThreshold: LOW_BALANCE_THRESHOLD,
  transactions: [] as const,
};
