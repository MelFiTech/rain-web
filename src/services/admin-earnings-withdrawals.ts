import { apiGet, apiPost, isApiConfigured } from "@/lib/api-client";
import type { SettlementBankAccount } from "@/types";

export type EarningsWithdrawalAdminRecord = {
  id: string;
  reference: string;
  amount: number;
  status: string;
  institutionId: string;
  institutionName: string;
  institutionEmail: string;
  settlementBank: SettlementBankAccount | null;
  processAfterAt?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedByEmail?: string;
  rejectionReason?: string;
  monnifyStatus?: string;
  failureReason?: string;
  processedAt?: string;
};

export async function listEarningsWithdrawals(
  status?: string,
): Promise<EarningsWithdrawalAdminRecord[]> {
  if (!isApiConfigured()) return [];
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiGet<EarningsWithdrawalAdminRecord[]>(
    `/platform/admin/earnings-withdrawals${qs}`,
  );
}

export async function approveEarningsWithdrawal(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    await apiPost(
      `/platform/admin/earnings-withdrawals/${encodeURIComponent(id)}/approve`,
    );
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not approve withdrawal.",
    };
  }
}

export async function rejectEarningsWithdrawal(
  id: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    await apiPost(
      `/platform/admin/earnings-withdrawals/${encodeURIComponent(id)}/reject`,
      { reason },
    );
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not reject withdrawal.",
    };
  }
}
