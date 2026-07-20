"use client";

import { EarningsPanel } from "@/components/wallet/earnings-panel";
import { FundWalletModal } from "@/components/wallet/fund-wallet-modal";
import { WalletPageSkeleton } from "@/components/wallet/wallet-page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DATA_TABLE_EMPTY_MIN_HEIGHT } from "@/components/ui/data-table";
import { formatDateTime, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchWallet } from "@/services/wallet";
import type { WalletState, WalletTransaction } from "@/types";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type WalletTab = "wallet" | "earnings";

function parseWalletTab(value: string | null): WalletTab {
  if (value === "earnings") return "earnings";
  return "wallet";
}

const WALLET_TABS: { id: WalletTab; label: string }[] = [
  { id: "wallet", label: "Wallet" },
  { id: "earnings", label: "Earnings" },
];

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletPageSkeleton tab="wallet" />}>
      <WalletPageContent />
    </Suspense>
  );
}

const TYPE_LABELS: Record<WalletTransaction["type"], string> = {
  funding: "Wallet funding",
  verification_charge: "Verification charge",
  reward_credit: "Reward credit",
  adjustment: "Adjustment",
};

function WalletPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<WalletTab>(() =>
    parseWalletTab(searchParams.get("tab"))
  );
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundOpen, setFundOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWallet();
      setWallet(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    const data = await fetchWallet();
    setWallet(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setTab(parseWalletTab(searchParams.get("tab")));
  }, [searchParams]);

  const selectTab = (next: WalletTab) => {
    setTab(next);
    router.replace(
      next === "wallet" ? "/wallet" : `/wallet?tab=${next}`,
      { scroll: false }
    );
  };

  if (tab === "wallet" && (loading || !wallet)) {
    return <WalletPageSkeleton tab="wallet" />;
  }

  const isLow = wallet ? wallet.balance < wallet.lowBalanceThreshold : false;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {WALLET_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={cn(
              "h-9 shrink-0 cursor-pointer rounded-lg px-4 text-sm transition-colors",
              tab === t.id
                ? "border border-line bg-card font-medium text-ink"
                : "border border-transparent text-muted hover:bg-hover/60 hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "earnings" && <EarningsPanel />}

      {tab === "wallet" && wallet && (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                      Available balance
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
                      {formatNaira(wallet.balance)}
                    </p>
                  </div>
                  <Button
                    onClick={() => setFundOpen(true)}
                    size="sm"
                    className="shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Fund wallet
                  </Button>
                </div>
                {isLow && (
                  <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-hover px-4 py-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    <p className="text-muted">
                      Low balance warning — your wallet is below{" "}
                      {formatNaira(wallet.lowBalanceThreshold)}. Fund your
                      wallet to continue running verifications.
                    </p>
                  </div>
                )}
              </Card>

              <Card>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Quick tip
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  Fund via bank transfer to your Monnify one-time account. Each
                  verification costs ₦50 once your transfer is confirmed.
                </p>
              </Card>
            </div>

            <Card className="flex min-h-0 flex-1 flex-col">
              <CardHeader title="Transaction history" />
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto no-scrollbar",
                  wallet.transactions.length === 0 &&
                    cn(
                      "flex flex-col items-center justify-center",
                      DATA_TABLE_EMPTY_MIN_HEIGHT
                    )
                )}
              >
                {wallet.transactions.length === 0 ? (
                  <EmptyState
                    icon={Wallet}
                    title="No transactions yet"
                    description="Fund your wallet or run verifications to see charges and credits here."
                    action={
                      <Button size="sm" onClick={() => setFundOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Fund wallet
                      </Button>
                    }
                    className="py-0"
                  />
                ) : (
                  <div className="space-y-1">
                    {wallet.transactions.map((txn) => (
                      <TransactionRow key={txn.id} txn={txn} />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <FundWalletModal
            open={fundOpen}
            onClose={() => setFundOpen(false)}
            currentBalance={wallet.balance}
            onFunded={refreshWallet}
          />
        </>
      )}
    </div>
  );
}

function TransactionRow({ txn }: { txn: WalletTransaction }) {
  const isCredit = txn.amount > 0;
  const Icon =
    txn.type === "funding" || txn.type === "reward_credit"
      ? ArrowDownLeft
      : txn.type === "adjustment"
        ? RefreshCw
        : ArrowUpRight;

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-hover/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hover">
        <Icon className="h-4 w-4 text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">
            {TYPE_LABELS[txn.type]}
          </p>
          <Badge tone="soft" className="hidden sm:inline-flex">
            {txn.reference}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{txn.description}</p>
        <p className="mt-0.5 text-[11px] text-subtle">
          {formatDateTime(txn.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            isCredit ? "text-ink" : "text-muted"
          )}
        >
          {isCredit ? "+" : ""}
          {formatNaira(txn.amount)}
        </p>
        <p className="mt-0.5 text-[11px] tabular-nums text-subtle">
          Bal {formatNaira(txn.balanceAfter)}
        </p>
      </div>
    </div>
  );
}
