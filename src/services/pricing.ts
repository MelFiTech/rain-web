import { apiGet, apiPatch, isApiConfigured } from "@/lib/api-client";

export type PlatformPricing = {
  walletFundingFee: number;
  verificationCost: number;
  rewardAmount: number;
};

const DEFAULT_PRICING: PlatformPricing = {
  walletFundingFee: 100,
  verificationCost: 50,
  rewardAmount: 25,
};

let cachedPricing: PlatformPricing | null = null;

export async function fetchPlatformPricing(): Promise<PlatformPricing> {
  if (cachedPricing) return cachedPricing;

  if (isApiConfigured()) {
    try {
      cachedPricing = await apiGet<PlatformPricing>("/platform/config/pricing");
      return cachedPricing;
    } catch {
      /* fall through */
    }
  }

  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (base) {
    try {
      const res = await fetch(`${base}/public/pricing`);
      if (res.ok) {
        cachedPricing = (await res.json()) as PlatformPricing;
        return cachedPricing;
      }
    } catch {
      /* fall through */
    }
  }

  return { ...DEFAULT_PRICING };
}

export async function updateWalletFundingFee(
  walletFundingFee: number
): Promise<
  | { success: true; pricing: PlatformPricing }
  | { success: false; error: string }
> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    const result = await apiPatch<{
      success: boolean;
      pricing?: PlatformPricing;
      error?: string;
    }>("/platform/config/pricing", { walletFundingFee });
    if (!result.success || !result.pricing) {
      return {
        success: false,
        error: result.error ?? "Could not update pricing.",
      };
    }
    cachedPricing = result.pricing;
    return { success: true, pricing: result.pricing };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not update pricing.",
    };
  }
}

export function clearPricingCache() {
  cachedPricing = null;
}
