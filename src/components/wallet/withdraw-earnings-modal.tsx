"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatNaira } from "@/lib/format";
import {
  fetchSettlementBankForWithdraw,
  maskAccountNumber,
  withdrawEarnings,
} from "@/services/earnings";
import type { SettlementBankAccount, WithdrawEarningsDestination } from "@/types";
import { Building2, Wallet } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Step = "method" | "amount" | "confirm" | "success";

interface WithdrawEarningsModalProps {
  open: boolean;
  onClose: () => void;
  available: number;
  onComplete: () => void;
}

export function WithdrawEarningsModal({
  open,
  onClose,
  available,
  onComplete,
}: WithdrawEarningsModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [destination, setDestination] =
    useState<WithdrawEarningsDestination>("wallet");
  const [amount, setAmount] = useState("");
  const [settlementBank, setSettlementBank] =
    useState<SettlementBankAccount | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("method");
    setDestination("wallet");
    setAmount(String(available || ""));
    setError("");
    setReference("");
    fetchSettlementBankForWithdraw().then(setSettlementBank);
  }, [open, available]);

  const close = () => {
    if (loading) return;
    onClose();
  };

  const selectMethod = (dest: WithdrawEarningsDestination) => {
    setError("");
    if (dest === "bank" && !settlementBank) {
      setError(
        "Add your settlement bank in Settings before withdrawing to an external account."
      );
      setDestination(dest);
      setStep("method");
      return;
    }
    setDestination(dest);
    setAmount(String(available || ""));
    setStep("amount");
  };

  const goConfirm = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const n = Number(amount);
    if (!n || n < 1) {
      setError("Enter a valid amount.");
      return;
    }
    if (n > available) {
      setError(`Maximum available is ${formatNaira(available)}.`);
      return;
    }
    setStep("confirm");
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await withdrawEarnings({
        amount: Number(amount),
        destination,
      });
      if (res.success) {
        setReference(res.reference);
        setStep("success");
        onComplete();
      } else {
        setError(res.error);
        if (res.code === "no_settlement_bank") {
          setStep("method");
        } else {
          setStep("amount");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={
        step === "success"
          ? "Withdrawal submitted"
          : step === "confirm"
            ? "Confirm withdrawal"
            : step === "amount"
              ? "Withdraw earnings"
              : "Withdraw earnings"
      }
      description={
        step === "method"
          ? "Move available rewards to your Rain wallet or pay out to your settlement bank."
          : undefined
      }
      size="md"
    >
      {step === "method" && (
        <div className="space-y-3 mt-1">
          <button
            type="button"
            onClick={() => selectMethod("wallet")}
            className="flex w-full items-start gap-3 rounded-xl border border-line px-4 py-3.5 text-left hover:bg-hover transition-colors cursor-pointer"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hover">
              <Wallet className="h-4 w-4 text-muted" />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">
                Move to wallet
              </span>
              <span className="mt-0.5 block text-xs text-muted leading-relaxed">
                Instantly credit your Rain wallet for verifications.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => selectMethod("bank")}
            className="flex w-full items-start gap-3 rounded-xl border border-line px-4 py-3.5 text-left hover:bg-hover transition-colors cursor-pointer"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hover">
              <Building2 className="h-4 w-4 text-muted" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">
                Pay out to bank
              </span>
              <span className="mt-0.5 block text-xs text-muted leading-relaxed">
                {settlementBank
                  ? `${settlementBank.bankName} · ${maskAccountNumber(settlementBank.accountNumber)}`
                  : "Uses the settlement account saved in Settings."}
              </span>
            </span>
          </button>
          {error && (
            <div className="rounded-xl bg-hover px-4 py-3 text-sm text-foreground space-y-2">
              <p>{error}</p>
              {!settlementBank && (
                <Link
                  href="/settings?tab=settlement"
                  className="text-sm font-medium text-ink underline underline-offset-2"
                  onClick={close}
                >
                  Set up settlement bank
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {step === "amount" && (
        <form onSubmit={goConfirm} className="space-y-4 mt-1">
          <p className="text-sm text-muted">
            {destination === "wallet"
              ? "Amount will be added to your Rain wallet immediately."
              : settlementBank
                ? `Payout to ${settlementBank.accountName} · ${settlementBank.bankName}`
                : "Bank payout"}
          </p>
          <Input
            label="Amount (₦)"
            type="number"
            min={1}
            max={available}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button
            type="button"
            className="text-xs text-muted hover:text-foreground cursor-pointer"
            onClick={() => setAmount(String(available))}
          >
            Withdraw all ({formatNaira(available)})
          </button>
          {error && (
            <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setStep("method")}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      )}

      {step === "confirm" && (
        <div className="space-y-4 mt-1">
          <div className="rounded-xl bg-hover p-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted">Amount</span>
              <span className="font-semibold text-ink tabular-nums">
                {formatNaira(Number(amount))}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">Destination</span>
              <span className="text-ink text-right">
                {destination === "wallet"
                  ? "Rain wallet"
                  : settlementBank
                    ? `${settlementBank.bankName} (${maskAccountNumber(settlementBank.accountNumber)})`
                    : "Settlement bank"}
              </span>
            </div>
          </div>
          {error && (
            <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setStep("amount")}
              disabled={loading}
            >
              Back
            </Button>
            <Button className="flex-1" loading={loading} onClick={submit}>
              Confirm withdrawal
            </Button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 mt-1 text-center sm:text-left">
          <p className="text-sm text-muted">
            {destination === "wallet"
              ? `${formatNaira(Number(amount))} has been added to your wallet.`
              : `${formatNaira(Number(amount))} is on its way to your settlement account. Payouts typically settle within 1–2 business days.`}
          </p>
          <p className="text-xs font-mono text-subtle">{reference}</p>
          <Button className="w-full" onClick={close}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
