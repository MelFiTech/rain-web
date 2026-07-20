import { delay, generateReference } from "@/lib/utils";
import type { EarningsSummary, WithdrawEarningsDestination } from "@/types";
import { MOCK_EARNINGS, settingsStore } from "./mock-data";
import { creditWallet } from "./wallet";

function getAvailableTotal(): number {
  return MOCK_EARNINGS.filter((e) => e.status === "available").reduce(
    (s, e) => s + e.amount,
    0
  );
}

function consumeAvailableEarnings(amount: number): number {
  let remaining = amount;
  let consumed = 0;
  for (const record of MOCK_EARNINGS) {
    if (record.status !== "available" || remaining <= 0) continue;
    record.status = "paid";
    remaining -= record.amount;
    consumed += record.amount;
  }
  return consumed;
}

export async function fetchEarnings(): Promise<EarningsSummary> {
  await delay(600);

  const available = getAvailableTotal();
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

export type WithdrawEarningsResult =
  | {
      success: true;
      reference: string;
      amount: number;
      destination: WithdrawEarningsDestination;
    }
  | {
      success: false;
      error: string;
      code?: "no_settlement_bank" | "insufficient";
    };

export async function withdrawEarnings(input: {
  amount: number;
  destination: WithdrawEarningsDestination;
}): Promise<WithdrawEarningsResult> {
  await delay(900);

  const available = getAvailableTotal();
  const amount = Math.floor(input.amount);

  if (!amount || amount < 1) {
    return { success: false, error: "Enter an amount to withdraw." };
  }
  if (amount > available) {
    return {
      success: false,
      error: `You only have ${available} available to withdraw.`,
      code: "insufficient",
    };
  }

  if (input.destination === "bank") {
    if (!settingsStore.data.settlementBank) {
      return {
        success: false,
        error:
          "Add a settlement bank account in Settings before withdrawing to your bank.",
        code: "no_settlement_bank",
      };
    }
  }

  const consumed = consumeAvailableEarnings(amount);
  if (consumed < amount) {
    return {
      success: false,
      error: "Could not withdraw that amount. Please try again.",
      code: "insufficient",
    };
  }

  const reference = generateReference(
    input.destination === "wallet" ? "EWW" : "EWB"
  );

  if (input.destination === "wallet") {
    creditWallet(
      amount,
      "reward_credit",
      `Earnings moved to wallet · ${reference}`
    );
  }

  return {
    success: true,
    reference,
    amount,
    destination: input.destination,
  };
}

export async function fetchSettlementBankForWithdraw() {
  await delay(200);
  const bank = settingsStore.data.settlementBank;
  return bank ? { ...bank } : null;
}

export function maskAccountNumber(num: string): string {
  const digits = num.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `******${digits.slice(-4)}`;
}
