import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  isApiConfigured,
} from "@/lib/api-client";
import { defaultInstitutionSettings } from "@/lib/empty-states";
import { getSession } from "@/lib/session";
import type {
  Institution,
  InstitutionSettings,
  NotificationPreferences,
  SettlementBankAccount,
  WebhookEndpoint,
  WebhookEventType,
} from "@/types";

export async function fetchSettings(): Promise<InstitutionSettings> {
  if (!isApiConfigured()) {
    return defaultInstitutionSettings(getSession()?.user.institution);
  }
  return apiGet<InstitutionSettings>("/platform/settings");
}

export async function updateProfile(
  profile: Partial<Institution>
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    await apiPatch("/platform/settings/profile", profile);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not save profile.",
    };
  }
}

export async function updateNotificationPreferences(
  prefs: NotificationPreferences
): Promise<{ success: true }> {
  if (!isApiConfigured()) {
    return { success: true };
  }
  await apiPatch("/platform/settings/notifications", prefs);
  return { success: true };
}

export async function updateSettlementBank(
  input: Omit<SettlementBankAccount, "updatedAt">
): Promise<
  { success: true; account: SettlementBankAccount } | { success: false; error: string }
> {
  const accountName = input.accountName.trim();
  const bankName = input.bankName.trim();
  const accountNumber = input.accountNumber.replace(/\D/g, "");

  if (!accountName || !bankName) {
    return { success: false, error: "Account name and bank are required." };
  }
  if (accountNumber.length < 10) {
    return { success: false, error: "Enter a valid 10-digit account number." };
  }

  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }

  try {
    const account = await apiPutSettlementBank({
      accountName,
      bankName,
      accountNumber,
    });
    return { success: true, account };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not save bank account.",
    };
  }
}

async function apiPutSettlementBank(
  input: Omit<SettlementBankAccount, "updatedAt">
): Promise<SettlementBankAccount> {
  return apiPost<SettlementBankAccount>("/platform/settings/settlement-bank", input);
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
}): Promise<
  | {
      success: true;
      accountName: string;
      bankName: string;
      accountNumber: string;
    }
  | { success: false; error: string }
> {
  const bankName = input.bankName.trim();
  const accountNumber = input.accountNumber.replace(/\D/g, "");

  if (!bankName) {
    return { success: false, error: "Select a bank first." };
  }
  if (accountNumber.length < 10) {
    return { success: false, error: "Enter a valid 10-digit account number." };
  }

  if (!isApiConfigured()) {
    return {
      success: false,
      error: "Bank lookup is unavailable until the Rain API is connected.",
    };
  }

  try {
    const res = await apiPost<{
      accountName: string;
      bankName: string;
      accountNumber: string;
    }>("/platform/settings/settlement-bank/resolve", { bankName, accountNumber });
    return {
      success: true,
      accountName: res.accountName,
      bankName: res.bankName,
      accountNumber: res.accountNumber,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not resolve account name.",
    };
  }
}

export async function initiateSettlementBankChangeOtp(): Promise<{
  success: true;
  requestId: string;
  deliveryHint: string;
}> {
  if (!isApiConfigured()) {
    throw new Error("Rain API is not configured.");
  }
  const res = await apiPost<{ requestId: string; deliveryHint?: string }>(
    "/platform/settings/settlement-bank/change-otp"
  );
  const profile = getSession()?.user.institution.email ?? "";
  return {
    success: true,
    requestId: res.requestId,
    deliveryHint: res.deliveryHint ?? maskEmail(profile),
  };
}

export async function confirmSettlementBankChange(input: {
  requestId: string;
  otp: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
}): Promise<
  { success: true; account: SettlementBankAccount } | { success: false; error: string }
> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    const account = await apiPost<SettlementBankAccount>(
      "/platform/settings/settlement-bank/confirm",
      input
    );
    return { success: true, account };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not confirm bank change.",
    };
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  if (!input.currentPassword || !input.newPassword) {
    return { success: false, error: "All password fields are required." };
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

  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }

  try {
    await apiPost("/platform/settings/password", {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not change password.",
    };
  }
}

export async function logoutSession(
  sessionId: string
): Promise<{ success: boolean }> {
  if (!isApiConfigured()) return { success: true };
  try {
    await apiPost(`/platform/settings/sessions/${encodeURIComponent(sessionId)}/logout`);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function logoutAllSessions(): Promise<{ success: boolean }> {
  if (!isApiConfigured()) return { success: true };
  try {
    await apiPost("/platform/settings/sessions/logout-all");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function rotateApiKey(): Promise<{
  fullKey: string;
  apiKey: InstitutionSettings["developer"]["apiKey"];
}> {
  if (!isApiConfigured()) {
    throw new Error("Rain API is not configured.");
  }
  return apiPost("/platform/settings/developer/api-key/rotate");
}

export async function initiateApiKeyRevealOtp(): Promise<
  | { success: true; requestId: string; deliveryHint: string }
  | { success: false; error: string }
> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    const res = await apiPost<{ requestId: string; deliveryHint: string }>(
      "/platform/settings/developer/api-key/reveal-otp",
    );
    return {
      success: true,
      requestId: res.requestId,
      deliveryHint: res.deliveryHint,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not send verification code.",
    };
  }
}

export async function confirmApiKeyReveal(input: {
  requestId: string;
  otp: string;
}): Promise<
  | { success: true; fullKey: string }
  | { success: false; error: string }
> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    const res = await apiPost<{ fullKey: string }>(
      "/platform/settings/developer/api-key/reveal",
      input,
    );
    return { success: true, fullKey: res.fullKey };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not reveal API key.",
    };
  }
}

export async function upsertWebhook(input: {
  id?: string;
  url: string;
  events: WebhookEventType[];
}): Promise<{ webhook: WebhookEndpoint; signingSecret?: string }> {
  if (!isApiConfigured()) {
    throw new Error("Rain API is not configured.");
  }
  if (input.id) {
    const webhook = await apiPatch<WebhookEndpoint>(
      `/platform/settings/developer/webhooks/${encodeURIComponent(input.id)}`,
      { url: input.url, events: input.events }
    );
    return { webhook };
  }
  return apiPost("/platform/settings/developer/webhooks", input);
}

export async function setWebhookEnabled(
  id: string,
  enabled: boolean
): Promise<{ success: true }> {
  if (!isApiConfigured()) {
    throw new Error("Rain API is not configured.");
  }
  await apiPatch(`/platform/settings/developer/webhooks/${encodeURIComponent(id)}`, {
    enabled,
  });
  return { success: true };
}

export async function removeWebhook(id: string): Promise<{ success: true }> {
  if (!isApiConfigured()) {
    throw new Error("Rain API is not configured.");
  }
  await apiDelete(`/platform/settings/developer/webhooks/${encodeURIComponent(id)}`);
  return { success: true };
}
