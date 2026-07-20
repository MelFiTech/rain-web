import { delay } from "@/lib/utils";
import type {
  Institution,
  InstitutionSettings,
  NotificationPreferences,
  SettlementBankAccount,
  WebhookEndpoint,
  WebhookEventType,
} from "@/types";
import { settingsStore } from "./mock-data";

let settlementChangeOtpSession:
  | { requestId: string; code: string; expiresAt: number }
  | null = null;

export async function fetchSettings(): Promise<InstitutionSettings> {
  await delay(500);
  return {
    profile: { ...settingsStore.data.profile },
    notificationPreferences: {
      ...settingsStore.data.notificationPreferences,
    },
    sessions: [...settingsStore.data.sessions],
    developer: {
      apiKey: { ...settingsStore.data.developer.apiKey },
      webhooks: settingsStore.data.developer.webhooks.map((w) => ({ ...w, events: [...w.events] })),
    },
    settlementBank: settingsStore.data.settlementBank
      ? { ...settingsStore.data.settlementBank }
      : null,
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

export async function updateSettlementBank(
  input: Omit<SettlementBankAccount, "updatedAt">
): Promise<{ success: true; account: SettlementBankAccount } | { success: false; error: string }> {
  await delay(600);
  const accountName = input.accountName.trim();
  const bankName = input.bankName.trim();
  const accountNumber = input.accountNumber.replace(/\D/g, "");

  if (!accountName || !bankName) {
    return { success: false, error: "Account name and bank are required." };
  }
  if (accountNumber.length < 10) {
    return { success: false, error: "Enter a valid 10-digit account number." };
  }

  const account: SettlementBankAccount = {
    accountName,
    bankName,
    accountNumber,
    updatedAt: new Date().toISOString(),
  };
  settingsStore.data.settlementBank = account;
  return { success: true, account: { ...account } };
}

function maskEmail(value: string): string {
  const [localPart, domain] = value.split("@");
  if (!localPart || !domain) return value;
  if (localPart.length < 3) return `${localPart[0] ?? "*"}***@${domain}`;
  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
}

export async function resolveSettlementBankAccount(input: {
  bankName: string;
  accountNumber: string;
}): Promise<{ success: true; accountName: string } | { success: false; error: string }> {
  await delay(500);
  const bankName = input.bankName.trim();
  const accountNumber = input.accountNumber.replace(/\D/g, "");

  if (!bankName) {
    return { success: false, error: "Select a bank first." };
  }
  if (accountNumber.length < 10) {
    return { success: false, error: "Enter a valid 10-digit account number." };
  }

  const nameSeed = Number(accountNumber.slice(-2));
  const firstNames = ["Ada", "Ife", "Kemi", "Tobi", "Chidi", "Amaka"];
  const lastNames = ["Okafor", "Bello", "Adebayo", "Nwosu", "Lawal", "Eze"];
  const accountName = `${firstNames[nameSeed % firstNames.length]} ${lastNames[(nameSeed + 2) % lastNames.length]}`.toUpperCase();
  return { success: true, accountName };
}

export async function initiateSettlementBankChangeOtp(): Promise<{
  success: true;
  requestId: string;
  deliveryHint: string;
}> {
  await delay(500);
  const requestId = `settlement_change_${Date.now()}`;
  const code = "123456";
  settlementChangeOtpSession = {
    requestId,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  return {
    success: true,
    requestId,
    deliveryHint: maskEmail(settingsStore.data.profile.email),
  };
}

export async function confirmSettlementBankChange(input: {
  requestId: string;
  otp: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
}): Promise<{ success: true; account: SettlementBankAccount } | { success: false; error: string }> {
  await delay(500);
  if (
    !settlementChangeOtpSession ||
    settlementChangeOtpSession.requestId !== input.requestId
  ) {
    return { success: false, error: "OTP session expired. Request a new code." };
  }
  if (Date.now() > settlementChangeOtpSession.expiresAt) {
    settlementChangeOtpSession = null;
    return { success: false, error: "OTP has expired. Request a new code." };
  }
  if (input.otp.trim() !== settlementChangeOtpSession.code) {
    return { success: false, error: "Invalid OTP. Please try again." };
  }
  settlementChangeOtpSession = null;
  return updateSettlementBank({
    accountName: input.accountName,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
  });
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

function randomKeySuffix(length = 32): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function rotateApiKey(): Promise<{
  fullKey: string;
  apiKey: InstitutionSettings["developer"]["apiKey"];
}> {
  await delay(600);
  const suffix = randomKeySuffix();
  const fullKey = `rain_live_${suffix}`;
  const apiKey = {
    keyPrefix: "rain_live",
    maskedKey: `rain_live_••••••••••••${suffix.slice(-4)}`,
    createdAt: new Date().toISOString(),
    lastUsedAt: settingsStore.data.developer.apiKey.lastUsedAt,
  };
  settingsStore.data.developer.apiKey = apiKey;
  return { fullKey, apiKey: { ...apiKey } };
}

export async function upsertWebhook(input: {
  id?: string;
  url: string;
  events: WebhookEventType[];
}): Promise<{ webhook: WebhookEndpoint; signingSecret?: string }> {
  await delay(500);
  const secretSuffix = randomKeySuffix(8);
  const signingSecret = `whsec_${randomKeySuffix(24)}`;

  if (input.id) {
    const idx = settingsStore.data.developer.webhooks.findIndex(
      (w) => w.id === input.id
    );
    if (idx === -1) {
      throw new Error("Webhook not found");
    }
    const existing = settingsStore.data.developer.webhooks[idx];
    const updated: WebhookEndpoint = {
      ...existing,
      url: input.url.trim(),
      events: [...input.events],
    };
    settingsStore.data.developer.webhooks[idx] = updated;
    return { webhook: { ...updated, events: [...updated.events] } };
  }

  const webhook: WebhookEndpoint = {
    id: `wh_${Date.now()}`,
    url: input.url.trim(),
    events: [...input.events],
    secretPreview: `whsec_••••••••${secretSuffix}`,
    enabled: true,
  };
  settingsStore.data.developer.webhooks.push(webhook);
  return {
    webhook: { ...webhook, events: [...webhook.events] },
    signingSecret,
  };
}

export async function setWebhookEnabled(
  id: string,
  enabled: boolean
): Promise<{ success: true }> {
  await delay(300);
  const wh = settingsStore.data.developer.webhooks.find((w) => w.id === id);
  if (!wh) throw new Error("Webhook not found");
  wh.enabled = enabled;
  return { success: true };
}

export async function removeWebhook(id: string): Promise<{ success: true }> {
  await delay(400);
  settingsStore.data.developer.webhooks =
    settingsStore.data.developer.webhooks.filter((w) => w.id !== id);
  return { success: true };
}
