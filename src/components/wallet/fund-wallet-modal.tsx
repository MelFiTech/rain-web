"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/contexts/toast-context";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  confirmMonnifyFundSession,
  createMonnifyFundSession,
  getWalletFundingQuote,
} from "@/services/wallet";
import { subscribeWalletFundSessionPaid } from "@/lib/platform-realtime";
import type { MonnifyFundSession } from "@/types";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable */
  }
}

function CopyDetailRow({
  label,
  value,
  mono,
  prominent,
  copyable = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
  prominent?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await copyText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-ink",
            mono && "font-mono tabular-nums",
            prominent
              ? "text-lg font-semibold tracking-wide"
              : "text-sm font-medium"
          )}
        >
          {value}
        </p>
      </div>
      {copyable ? (
        <button
          type="button"
          onClick={copy}
          className="mt-0.5 shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-hover hover:text-ink"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-ok-fg" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
        </button>
      ) : null}
    </div>
  );
}

function FundingQuoteBreakdown({
  creditAmount,
  fee,
  transferAmount,
  className,
}: {
  creditAmount: number;
  fee: number;
  transferAmount: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-line bg-hover/30 px-4 py-3 text-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted">Wallet credit</span>
        <span className="font-medium tabular-nums text-ink">
          {formatNaira(creditAmount)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted">Funding fee</span>
        <span className="font-medium tabular-nums text-ink">
          {formatNaira(fee)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
        <span className="font-medium text-ink">Total to transfer</span>
        <span className="text-base font-semibold tabular-nums text-ink">
          {formatNaira(transferAmount)}
        </span>
      </div>
    </div>
  );
}

function MonnifyTransferDetails({ session }: { session: MonnifyFundSession }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="border-b border-line px-4 py-3">
        <p className="text-sm font-medium text-ink">One-time transfer account</p>
        <p className="mt-0.5 text-xs text-muted leading-relaxed">
          Send{" "}
          <span className="font-semibold text-foreground">
            {formatNaira(session.amount)}
          </span>{" "}
          from your bank app ({formatNaira(session.creditAmount)} to your wallet
          plus {formatNaira(session.fee)} funding fee). Use every detail below
          exactly as shown.
        </p>
      </div>
      <div className="divide-y divide-line">
        <CopyDetailRow label="Bank" value={session.bankName} />
        <CopyDetailRow
          label="Account number"
          value={session.accountNumber}
          mono
          prominent
        />
        <CopyDetailRow label="Account name" value={session.accountName} />
        <CopyDetailRow
          label="Wallet credit"
          value={formatNaira(session.creditAmount)}
          mono
          copyable={false}
        />
        <CopyDetailRow
          label="Funding fee"
          value={formatNaira(session.fee)}
          mono
          copyable={false}
        />
        <CopyDetailRow
          label="Total to transfer"
          value={formatNaira(session.amount)}
          mono
          prominent
        />
      </div>
    </div>
  );
}

function formatSessionExpiry(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "very soon";
  const mins = Math.ceil(ms / 60_000);
  if (mins < 60) return `in ${mins} minute${mins === 1 ? "" : "s"}`;
  const hours = Math.ceil(mins / 60);
  return `in ${hours} hour${hours === 1 ? "" : "s"}`;
}

type FundStep = "amount" | "transfer" | "success";

interface FundWalletModalProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onFunded: () => void | Promise<void>;
}

export function FundWalletModal({
  open,
  onClose,
  currentBalance,
  onFunded,
}: FundWalletModalProps) {
  const toast = useToast();
  const [step, setStep] = useState<FundStep>("amount");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<MonnifyFundSession | null>(null);
  const [creditedBalance, setCreditedBalance] = useState<number | null>(null);
  const [transferConfirmError, setTransferConfirmError] = useState("");
  const checkingRef = useRef(false);
  const fundingSettledRef = useRef(false);

  const reset = useCallback(() => {
    setStep("amount");
    setAmount("");
    setLoading(false);
    setSession(null);
    setCreditedBalance(null);
    setTransferConfirmError("");
    fundingSettledRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const close = () => {
    if (loading && step === "amount") return;
    onClose();
  };

  const awaitingPayment = step === "transfer";

  const submitAmount = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n < 100) {
      toast.error("Minimum funding amount is ₦100.");
      return;
    }
    if (n > 5_000_000) {
      toast.error("Maximum funding amount is ₦5,000,000.");
      return;
    }

    setLoading(true);
    try {
      const res = await createMonnifyFundSession({ amount: n });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setSession(res.session);
      setTransferConfirmError("");
      setStep("transfer");
    } catch {
      toast.error("Could not start Monnify checkout. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeFunding = useCallback(
    async (balance: number) => {
      if (fundingSettledRef.current) return;
      fundingSettledRef.current = true;
      setCreditedBalance(balance);
      await onFunded();
      setStep("success");
      toast.success("Wallet funded successfully.");
    },
    [onFunded, toast]
  );

  const sessionId = session?.id;

  const checkPayment = useCallback(
    async (options?: { fromSocket?: boolean }) => {
      if (!sessionId || checkingRef.current || fundingSettledRef.current) {
        return;
      }
      checkingRef.current = true;
      setLoading(true);
      if (!options?.fromSocket) {
        setTransferConfirmError("");
      }
      try {
        const res = await confirmMonnifyFundSession(sessionId);
        if (res.success) {
          await completeFunding(res.balance);
        } else if (res.status === "expired") {
          toast.error(res.error);
          setStep("amount");
          setSession(null);
        } else if (!options?.fromSocket) {
          setTransferConfirmError(
            res.error ||
              "Payment not confirmed yet. Complete the transfer, then check again in a moment."
          );
        }
      } catch {
        if (!options?.fromSocket) {
          setTransferConfirmError(
            "Could not confirm payment. Try again in a moment."
          );
        }
      } finally {
        checkingRef.current = false;
        setLoading(false);
      }
    },
    [sessionId, completeFunding, toast]
  );

  useEffect(() => {
    if (!open || step !== "transfer" || !sessionId) return;

    return subscribeWalletFundSessionPaid((payload) => {
      if (payload.sessionId !== sessionId) return;
      void checkPayment({ fromSocket: true });
    });
  }, [open, step, sessionId, checkPayment]);

  const title =
    step === "success"
      ? "Payment received"
      : step === "transfer"
        ? "Transfer to fund wallet"
        : "Fund wallet";

  const description =
    step === "amount"
      ? "Enter how much you want in your wallet. A funding fee is added to your bank transfer."
      : step === "transfer"
        ? "Send the exact total below. This account is only valid for this payment."
        : undefined;

  const amountNum = Number(amount);
  const [amountQuote, setAmountQuote] = useState<Awaited<
    ReturnType<typeof getWalletFundingQuote>
  > | null>(null);

  useEffect(() => {
    if (amountNum < 100 || amountNum > 5_000_000) {
      setAmountQuote(null);
      return;
    }
    let cancelled = false;
    void getWalletFundingQuote(amountNum).then((quote) => {
      if (!cancelled) setAmountQuote(quote);
    });
    return () => {
      cancelled = true;
    };
  }, [amountNum]);

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={description}
      size={step === "transfer" ? "md" : "sm"}
      contentClassName={step === "success" ? "justify-center" : undefined}
      closeOnBackdropClick={!awaitingPayment}
      closeOnEscape={!awaitingPayment}
    >
      {step === "amount" && (
        <form onSubmit={submitAmount} className="space-y-4">
          <Input
            label="Wallet credit (₦)"
            type="number"
            min={100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5000"
            required
          />
          {amountQuote && (
            <FundingQuoteBreakdown
              creditAmount={amountQuote.creditAmount}
              fee={amountQuote.fee}
              transferAmount={amountQuote.transferAmount}
            />
          )}
          <div className="flex flex-wrap gap-2">
            {[1000, 5000, 10000, 50000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="cursor-pointer rounded-lg bg-hover px-3 py-1.5 text-xs text-foreground hover:bg-active"
              >
                {formatNaira(v)}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!amount || Number(amount) < 100}
          >
            Continue
          </Button>
        </form>
      )}

      {step === "transfer" && session && (
        <div className="space-y-4">
          <MonnifyTransferDetails session={session} />

          <div className="flex items-start gap-2 rounded-xl bg-warn-bg/50 px-3 py-2.5 text-xs text-muted">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn-fg" />
            <p>
              Transfer the exact total shown. A different amount may delay
              crediting. This account expires{" "}
              {formatSessionExpiry(session.expiresAt)}.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => void checkPayment()}
            loading={loading}
            disabled={loading}
          >
            I&apos;ve sent the transfer
          </Button>
          {transferConfirmError ? (
            <p
              className="text-center text-sm text-danger leading-snug"
              role="alert"
            >
              {transferConfirmError}
            </p>
          ) : null}
        </div>
      )}

      {step === "success" && session && (
        <div className="flex w-full flex-col items-center justify-center gap-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ok-bg">
            <CheckCircle2 className="h-6 w-6 text-ok-fg" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">
              {formatNaira(session.creditAmount)} added to your wallet
            </p>
            <p className="mt-1 text-xs text-muted">
              Funding fee:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatNaira(session.fee)}
              </span>
              {" · "}
              Transfer total:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatNaira(session.amount)}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">
              New balance:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatNaira(creditedBalance ?? currentBalance)}
              </span>
            </p>
          </div>
          <Button className="w-full" onClick={close}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
