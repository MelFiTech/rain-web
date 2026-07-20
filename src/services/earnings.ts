import { apiGet, apiPost, isApiConfigured } from "@/lib/api-client";
import type {
  EarningsSummary,
  SettlementBankAccount,
  WithdrawEarningsDestination,
} from "@/types";

const EMPTY_EARNINGS: EarningsSummary = {
  available: 0,
  pending: 0,
  lifetime: 0,
  totalRewardedMatches: 0,
  records: [],
};

export async function fetchEarnings(): Promise<EarningsSummary> {
  if (!isApiConfigured()) {
    return { ...EMPTY_EARNINGS, records: [] };
  }
  return apiGet<EarningsSummary>("/platform/earnings");
}

export type WithdrawEarningsResult =
  | {
      success: true;
      reference: string;
      amount: number;
      destination: WithdrawEarningsDestination;
      payoutStatus?: "completed" | "queued" | "processing" | "pending_approval";
      processAfterAt?: string;
      monnifyStatus?: string;
    }
  | {
      success: false;
      error: string;
      code?:
        | "no_settlement_bank"
        | "insufficient"
        | "insufficient_wallet"
        | "pending_authorization"
        | "payout_failed";
    };

export type BankWithdrawalStatusResult = {
  reference: string;
  payoutStatus: "pending_approval" | "scheduled" | "processing" | "completed" | "failed";
  monnifyStatus: string;
  processAfterAt?: string;
  message?: string;
};

export async function withdrawEarnings(input: {
  amount: number;
  destination: WithdrawEarningsDestination;
}): Promise<WithdrawEarningsResult> {
  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "Earnings withdrawal is unavailable until the Rain API is connected (NEXT_PUBLIC_API_URL).",
    };
  }

  try {
    return await apiPost<WithdrawEarningsResult>("/platform/earnings/withdraw", input);
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Could not process withdrawal. Try again.",
    };
  }
}

export async function fetchSettlementBankForWithdraw(): Promise<SettlementBankAccount | null> {
  if (!isApiConfigured()) return null;
  try {
    return await apiGet<SettlementBankAccount | null>(
      "/platform/settings/settlement-bank"
    );
  } catch {
    return null;
  }
}

export function maskAccountNumber(num: string): string {
  const digits = num.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `******${digits.slice(-4)}`;
}

export async function fetchBankWithdrawalStatus(
  reference: string,
): Promise<BankWithdrawalStatusResult> {
  const encoded = encodeURIComponent(reference);
  return apiGet<BankWithdrawalStatusResult>(
    `/platform/earnings/withdrawals/${encoded}/status`,
  );
}
