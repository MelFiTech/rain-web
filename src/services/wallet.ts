import { delay, generateId, generateReference } from "@/lib/utils";
import type {
  FundWalletRequest,
  TransactionType,
  WalletState,
  WalletTransaction,
} from "@/types";
import { MOCK_WALLET, walletStore } from "./mock-data";

export function getWalletBalance(): number {
  return walletStore.balance;
}

export function deductWallet(
  amount: number,
  type: TransactionType,
  description: string
): void {
  walletStore.balance -= amount;
  const txn: WalletTransaction = {
    id: generateId("txn"),
    type,
    amount: -Math.abs(amount),
    balanceAfter: walletStore.balance,
    description,
    reference: generateReference("CHG"),
    createdAt: new Date().toISOString(),
  };
  MOCK_WALLET.transactions.unshift(txn);
  MOCK_WALLET.balance = walletStore.balance;
}

export function creditWallet(
  amount: number,
  type: TransactionType,
  description: string
): void {
  walletStore.balance += amount;
  const txn: WalletTransaction = {
    id: generateId("txn"),
    type,
    amount: Math.abs(amount),
    balanceAfter: walletStore.balance,
    description,
    reference: generateReference(type === "funding" ? "FND" : "RWD"),
    createdAt: new Date().toISOString(),
  };
  MOCK_WALLET.transactions.unshift(txn);
  MOCK_WALLET.balance = walletStore.balance;
}

export async function fetchWallet(): Promise<WalletState> {
  await delay(500);
  return {
    balance: walletStore.balance,
    lowBalanceThreshold: MOCK_WALLET.lowBalanceThreshold,
    transactions: [...MOCK_WALLET.transactions],
  };
}

export type FundWalletResult =
  | { success: true; balance: number; reference: string }
  | { success: false; error: string };

export async function fundWallet(
  request: FundWalletRequest
): Promise<FundWalletResult> {
  await delay(1500);

  if (!request.amount || request.amount < 100) {
    return { success: false, error: "Minimum funding amount is ₦100." };
  }

  if (request.amount > 5_000_000) {
    return { success: false, error: "Maximum funding amount is ₦5,000,000." };
  }

  const reference = generateReference("FND");
  creditWallet(request.amount, "funding", "Wallet funding via Monnify");

  return {
    success: true,
    balance: walletStore.balance,
    reference,
  };
}
