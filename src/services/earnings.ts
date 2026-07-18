import { delay } from "@/lib/utils";
import type { EarningsSummary } from "@/types";
import { MOCK_EARNINGS } from "./mock-data";

export async function fetchEarnings(): Promise<EarningsSummary> {
  await delay(600);

  const available = MOCK_EARNINGS.filter((e) => e.status === "available").reduce(
    (s, e) => s + e.amount,
    0
  );
  const pending = MOCK_EARNINGS.filter((e) => e.status === "pending").reduce(
    (s, e) => s + e.amount,
    0
  );
  const lifetime = MOCK_EARNINGS.reduce((s, e) => s + e.amount, 0);

  return {
    available,
    pending,
    lifetime: lifetime + 280,
    totalRewardedMatches: MOCK_EARNINGS.length + 14,
    records: [...MOCK_EARNINGS],
  };
}
