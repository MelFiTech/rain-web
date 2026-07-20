import { apiGet, apiPost, isApiConfigured } from "@/lib/api-client";
import { EMPTY_WALLET_STATE } from "@/lib/empty-states";
import type {
  FundWalletRequest,
  MonnifyFundSession,
  MonnifyFundSessionStatus,
  WalletFundingQuote,
  WalletState,
} from "@/types";
import { fetchPlatformPricing } from "@/services/pricing";

export async function getWalletFundingQuote(
  creditAmount: number
): Promise<WalletFundingQuote> {
  if (isApiConfigured() && creditAmount > 0) {
    try {
      return await apiGet<WalletFundingQuote>(
        `/platform/wallet/fund/quote?amount=${creditAmount}`
      );
    } catch {
      /* fall through */
    }
  }
  const pricing = await fetchPlatformPricing();
  const fee = pricing.walletFundingFee;
  return {
    creditAmount,
    fee,
    transferAmount: creditAmount + fee,
  };
}

export async function fetchWallet(): Promise<WalletState> {
  if (!isApiConfigured()) {
    return {
      balance: EMPTY_WALLET_STATE.balance,
      lowBalanceThreshold: EMPTY_WALLET_STATE.lowBalanceThreshold,
      transactions: [],
    };
  }
  return apiGet<WalletState>("/platform/wallet");
}

export async function fetchWalletBalance(): Promise<number> {
  const wallet = await fetchWallet();
  return wallet.balance;
}

export type FundWalletResult =
  | { success: true; balance: number; reference: string }
  | { success: false; error: string };

type FundSessionResponse =
  | { success: true; session: MonnifyFundSession }
  | { success: false; error: string };

type ConfirmFundResponse =
  | { success: true; balance: number; reference: string }
  | {
      success: false;
      error: string;
      status?: MonnifyFundSessionStatus;
    };

export async function createMonnifyFundSession(
  request: FundWalletRequest
): Promise<
  | { success: true; session: MonnifyFundSession }
  | { success: false; error: string }
> {
  if (!request.amount || request.amount < 100) {
    return { success: false, error: "Minimum funding amount is ₦100." };
  }

  if (request.amount > 5_000_000) {
    return { success: false, error: "Maximum funding amount is ₦5,000,000." };
  }

  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "Wallet funding is unavailable until the Rain API is connected (NEXT_PUBLIC_API_URL).",
    };
  }

  try {
    const result = await apiPost<FundSessionResponse>(
      "/platform/wallet/fund/sessions",
      { amount: request.amount }
    );
    if (!result.success) {
      return {
        success: false,
        error:
          ("error" in result && result.error) ||
          "Could not start Monnify checkout. Try again.",
      };
    }
    return { success: true, session: result.session };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Could not start Monnify checkout. Try again.",
    };
  }
}

export async function getMonnifyFundSession(
  sessionId: string
): Promise<MonnifyFundSession | null> {
  if (!isApiConfigured()) return null;
  try {
    return await apiGet<MonnifyFundSession>(
      `/platform/wallet/fund/sessions/${encodeURIComponent(sessionId)}`
    );
  } catch {
    return null;
  }
}

export async function confirmMonnifyFundSession(
  sessionId: string
): Promise<
  | { success: true; balance: number; reference: string }
  | { success: false; error: string; status?: MonnifyFundSessionStatus }
> {
  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "Wallet funding is unavailable until the Rain API is connected (NEXT_PUBLIC_API_URL).",
    };
  }

  try {
    const data = await apiPost<ConfirmFundResponse>(
      `/platform/wallet/fund/sessions/${encodeURIComponent(sessionId)}/confirm`
    );

    if (!data.success) {
      return {
        success: false,
        error:
          ("error" in data && data.error) ||
          "Could not confirm payment. Try again in a moment.",
        status: "status" in data ? data.status : undefined,
      };
    }

    return {
      success: true,
      balance: data.balance,
      reference: data.reference,
    };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "Could not confirm payment. Try again in a moment.";
    return { success: false, error: message };
  }
}

/** @deprecated Use createMonnifyFundSession + bank transfer flow */
export async function fundWallet(
  request: FundWalletRequest
): Promise<FundWalletResult> {
  const created = await createMonnifyFundSession(request);
  if (!created.success) return created;
  return confirmMonnifyFundSession(created.session.id);
}
