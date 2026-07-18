"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { formatDateTime, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchWallet, fundWallet } from "@/services/wallet";
import type { WalletState, WalletTransaction } from "@/types";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Plus,
  RefreshCw,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

type FundStep = "amount" | "review" | "checkout" | "success";

const TYPE_LABELS: Record<WalletTransaction["type"], string> = {
  funding: "Wallet funding",
  verification_charge: "Verification charge",
  reward_credit: "Reward credit",
  adjustment: "Adjustment",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundOpen, setFundOpen] = useState(false);
  const [fundStep, setFundStep] = useState<FundStep>("amount");
  const [amount, setAmount] = useState("");
  const [fundError, setFundError] = useState("");
  const [funding, setFunding] = useState(false);
  const [fundRef, setFundRef] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWallet();
      setWallet(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openFund = () => {
    setFundOpen(true);
    setFundStep("amount");
    setAmount("");
    setFundError("");
    setFundRef("");
  };

  const goReview = (e: FormEvent) => {
    e.preventDefault();
    setFundError("");
    const n = Number(amount);
    if (!n || n < 100) {
      setFundError("Minimum funding amount is ₦100.");
      return;
    }
    if (n > 5_000_000) {
      setFundError("Maximum funding amount is ₦5,000,000.");
      return;
    }
    setFundStep("review");
  };

  const goCheckout = () => setFundStep("checkout");

  const completePayment = async () => {
    setFunding(true);
    setFundError("");
    try {
      const res = await fundWallet({ amount: Number(amount) });
      if (res.success) {
        setFundRef(res.reference);
        setFundStep("success");
        await load();
      } else {
        setFundError(res.error);
        setFundStep("amount");
      }
    } catch {
      setFundError("Payment failed. Please try again.");
      setFundStep("amount");
    } finally {
      setFunding(false);
    }
  };

  if (loading || !wallet) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  const isLow = wallet.balance < wallet.lowBalanceThreshold;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Available balance
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
                {formatNaira(wallet.balance)}
              </p>
            </div>
            <Button onClick={openFund} size="lg">
              <Plus className="h-4 w-4" />
              Fund wallet
            </Button>
          </div>
          {isLow && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-hover px-4 py-3 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-muted" />
              <p className="text-muted">
                Low balance warning — your wallet is below{" "}
                {formatNaira(wallet.lowBalanceThreshold)}. Fund your wallet to
                continue running verifications.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Quick tip
          </p>
          <p className="mt-3 text-sm text-foreground leading-relaxed">
            Each verification costs ₦50. Keep a healthy balance so checks are
            never interrupted during compliance reviews.
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Transaction history" />
        <div className="space-y-1">
          {wallet.transactions.map((txn) => (
            <TransactionRow key={txn.id} txn={txn} />
          ))}
          {wallet.transactions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              No transactions yet.
            </p>
          )}
        </div>
      </Card>

      <Modal
        open={fundOpen}
        onClose={() => !funding && setFundOpen(false)}
        title={
          fundStep === "success"
            ? "Payment successful"
            : fundStep === "checkout"
              ? "Complete payment"
              : fundStep === "review"
                ? "Review funding"
                : "Fund wallet"
        }
        description={
          fundStep === "amount"
            ? "Add funds via Monnify (mock checkout)"
            : undefined
        }
        size="sm"
      >
        {fundStep === "amount" && (
          <form onSubmit={goReview} className="space-y-4">
            <Input
              label="Amount (₦)"
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              required
            />
            <div className="flex flex-wrap gap-2">
              {[1000, 5000, 10000, 50000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  className="px-3 py-1.5 text-xs rounded-lg bg-hover hover:bg-active text-foreground cursor-pointer"
                >
                  {formatNaira(v)}
                </button>
              ))}
            </div>
            {fundError && (
              <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">
                {fundError}
              </p>
            )}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        )}

        {fundStep === "review" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-hover p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Amount</span>
                <span className="font-semibold text-ink tabular-nums">
                  {formatNaira(Number(amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment method</span>
                <span className="text-ink">Monnify (mock)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">New balance</span>
                <span className="text-ink tabular-nums">
                  {formatNaira(wallet.balance + Number(amount))}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setFundStep("amount")}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={goCheckout}>
                Continue to payment
              </Button>
            </div>
          </div>
        )}

        {fundStep === "checkout" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hover">
              <CreditCard className="h-6 w-6 text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                Monnify checkout (mock)
              </p>
              <p className="mt-1 text-sm text-muted">
                Paying {formatNaira(Number(amount))} — no real charge will be
                made.
              </p>
            </div>
            <div className="rounded-xl bg-hover p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Merchant</span>
                <span className="text-ink">Rain</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Amount</span>
                <span className="font-semibold text-ink">
                  {formatNaira(Number(amount))}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              loading={funding}
              onClick={completePayment}
            >
              Pay {formatNaira(Number(amount))}
            </Button>
            <button
              type="button"
              onClick={() => setFundStep("review")}
              className="text-sm text-muted hover:text-foreground cursor-pointer"
              disabled={funding}
            >
              Cancel
            </button>
          </div>
        )}

        {fundStep === "success" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hover">
              <CheckCircle2 className="h-6 w-6 text-ink" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {formatNaira(Number(amount))} added to your wallet
              </p>
              <p className="mt-1 text-xs text-muted font-mono">{fundRef}</p>
            </div>
            <Button className="w-full" onClick={() => setFundOpen(false)}>
              Done
            </Button>
          </div>
        )}
      </Modal>
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
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-hover/50">
      <div className="h-9 w-9 rounded-xl bg-hover flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink truncate">
            {TYPE_LABELS[txn.type]}
          </p>
          <Badge tone="soft" className="hidden sm:inline-flex">
            {txn.reference}
          </Badge>
        </div>
        <p className="text-xs text-muted mt-0.5 truncate">{txn.description}</p>
        <p className="text-[11px] text-subtle mt-0.5">
          {formatDateTime(txn.createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            isCredit ? "text-ink" : "text-muted"
          )}
        >
          {isCredit ? "+" : ""}
          {formatNaira(txn.amount)}
        </p>
        <p className="text-[11px] text-subtle tabular-nums mt-0.5">
          Bal {formatNaira(txn.balanceAfter)}
        </p>
      </div>
    </div>
  );
}
