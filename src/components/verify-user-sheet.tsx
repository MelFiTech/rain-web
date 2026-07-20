"use client";

import { RecommendationPanel } from "@/components/recommendation-panel";
import {
  ConfidenceBadge,
  ConfidenceText,
} from "@/components/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/contexts/toast-context";
import { Select } from "@/components/ui/select";
import {
  categoryLabel,
  formatDate,
  formatDateTime,
  formatNaira,
  identifierTypeLabel,
} from "@/lib/format";
import { resolveVerificationRecommendation } from "@/lib/recommendation";
import { getVerification, verifyUser } from "@/services/verification";
import { fetchWalletBalance } from "@/services/wallet";
import type { IdentifierType, VerificationRecord } from "@/types";
import {
  IDENTIFIER_TYPES,
  NIGERIAN_BANKS,
  VERIFICATION_COST,
} from "@/types";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  Printer,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Step = "form" | "confirm" | "loading" | "result" | "insufficient";

interface VerifyUserSheetProps {
  open: boolean;
  onClose: () => void;
  initialRef?: string | null;
}

export function VerifyUserSheet({
  open,
  onClose,
  initialRef,
}: VerifyUserSheetProps) {
  const [step, setStep] = useState<Step>("form");
  const [idType, setIdType] = useState<IdentifierType>("account_number");
  const [identifier, setIdentifier] = useState("");
  const [bank, setBank] = useState("");
  const [result, setResult] = useState<VerificationRecord | null>(null);
  const toast = useToast();
  const [balance, setBalance] = useState(0);

  const reset = useCallback(() => {
    setStep("form");
    setResult(null);
    setIdentifier("");
    setBank("");
    void fetchWalletBalance().then(setBalance);
  }, []);

  const close = () => {
    if (step === "loading") return;
    onClose();
  };

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(reset, 200);
      return () => window.clearTimeout(t);
    }
    void fetchWalletBalance().then(setBalance);
    if (initialRef) {
      void getVerification(initialRef).then((record) => {
        if (record) {
          setResult(record);
          setStep("result");
        }
      });
    }
  }, [open, initialRef, reset]);

  const openConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter an identifier.");
      return;
    }
    if (idType === "account_number" && !bank) {
      toast.error("Please select a bank.");
      return;
    }
    setStep("confirm");
  };

  const runVerification = async () => {
    setStep("loading");
    try {
      const res = await verifyUser({
        identifierType: idType,
        identifier,
        bankCode: bank || undefined,
      });
      const bal = await fetchWalletBalance();
      setBalance(bal);
      if (res.status === "success") {
        setResult(res.data);
        setStep("result");
      } else if (res.status === "insufficient_balance") {
        setBalance(res.balance);
        setStep("insufficient");
      } else {
        toast.error(res.message);
        setStep("form");
      }
    } catch {
      toast.error("Verification failed. Please try again.");
      setStep("form");
    }
  };

  const title =
    step === "loading"
      ? "Verifying user"
      : step === "confirm"
        ? "Confirm verification"
        : step === "result"
          ? "Verification result"
          : step === "insufficient"
            ? "Insufficient balance"
            : "Verify user";

  const description =
    step === "form"
      ? `Check a user across the Rain network · ${formatNaira(VERIFICATION_COST)} per check`
      : step === "confirm"
        ? "You will be charged for this check"
        : step === "loading"
          ? "Checking Rain network for matching reports"
          : undefined;

  const modalSize =
    step === "result" || step === "insufficient" ? "lg" : "md";

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={description}
      size={modalSize}
      contentClassName={
        step === "loading"
          ? "flex flex-1 flex-col items-center justify-center"
          : undefined
      }
    >
      {step === "form" && (
        <form onSubmit={openConfirm} className="space-y-4">
          <Select
            label="Identifier type"
            value={idType}
            onChange={(e) => setIdType(e.target.value as IdentifierType)}
            options={IDENTIFIER_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
          />
          {idType === "account_number" && (
            <Select
              label="Bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Select bank"
              options={NIGERIAN_BANKS.map((b) => ({ value: b, label: b }))}
            />
          )}
          <Input
            label="Identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={
              idType === "email"
                ? "user@example.com"
                : idType === "phone"
                  ? "08012345678"
                  : idType === "bvn" || idType === "nin"
                    ? "11-digit number"
                    : "10-digit account number"
            }
            required
          />

          <div className="flex items-center justify-between rounded-xl bg-hover px-4 py-3">
            <span className="text-sm text-muted">Verification cost</span>
            <span className="text-sm font-semibold text-ink tabular-nums">
              {formatNaira(VERIFICATION_COST)}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !identifier.trim() || (idType === "account_number" && !bank)
            }
          >
            Continue
          </Button>
          <p className="text-xs text-subtle leading-relaxed">
            Your wallet is only charged for completed checks.
          </p>
        </form>
      )}

      {step === "confirm" && (
        <div className="space-y-5">
          <div className="space-y-3 rounded-xl bg-hover p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted">Type</span>
              <span className="text-ink">{identifierTypeLabel(idType)}</span>
            </div>
            {bank && (
              <div className="flex justify-between gap-4">
                <span className="text-muted">Bank</span>
                <span className="text-ink">{bank}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted">Identifier</span>
              <span className="truncate font-mono text-ink">{identifier}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <span className="text-muted">Cost</span>
              <span className="font-semibold text-ink tabular-nums">
                {formatNaira(VERIFICATION_COST)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setStep("form")}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={runVerification}>
              Confirm &amp; verify
            </Button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
          <p className="mt-4 text-sm text-muted">
            This usually takes a few seconds…
          </p>
        </div>
      )}

      {step === "insufficient" && (
        <div className="space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hover">
            <Wallet className="h-5 w-5 text-muted" />
          </div>
          <p className="text-sm text-muted">
            Your wallet does not have enough funds for this verification.
          </p>
          <div className="space-y-3 rounded-xl bg-hover p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Current balance</span>
              <span className="font-medium text-ink tabular-nums">
                {formatNaira(balance)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Verification cost</span>
              <span className="font-medium text-ink tabular-nums">
                {formatNaira(VERIFICATION_COST)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/wallet" className="flex-1" onClick={onClose}>
              <Button className="w-full">Fund wallet</Button>
            </Link>
            <Button variant="secondary" className="flex-1" onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <ResultBody result={result} onAgain={reset} />
      )}
    </Modal>
  );
}

function ResultBody({
  result,
  onAgain,
}: {
  result: VerificationRecord;
  onAgain: () => void;
}) {
  const isMatch = result.result === "match";
  const recommendation = resolveVerificationRecommendation(result);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const lines = [
      "Rain Verification Result",
      `Reference: ${result.reference}`,
      `Identifier: ${result.maskedIdentifier}`,
      `Result: ${isMatch ? "Reports found" : "No reports found"}`,
      `Recommendation: ${recommendation.title} (${recommendation.action})`,
      recommendation.summary,
      result.confidence ? `Confidence: ${result.confidence.description}` : "",
      `Amount charged: ${formatNaira(result.amountCharged)}`,
      `Date: ${formatDateTime(result.createdAt)}`,
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover">
          {isMatch ? (
            <AlertCircle className="h-5 w-5 text-ink" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-muted" />
          )}
        </div>
        <div>
          <p className="text-base font-semibold text-ink">
            {isMatch ? "Reports found" : "No reports found"}
          </p>
          {!isMatch && (
            <p className="mt-1 text-sm text-muted">
              No matching reports currently exist on Rain for this identifier.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="soft">{identifierTypeLabel(result.identifierType)}</Badge>
        <span className="font-mono text-sm font-medium text-ink">
          {result.maskedIdentifier}
        </span>
      </div>

      <RecommendationPanel recommendation={recommendation} />

      {isMatch && result.confidence && (
        <div className="space-y-3 rounded-xl bg-hover p-4">
          <ConfidenceBadge confidence={result.confidence} showDescription />
          <div className="grid grid-cols-2 gap-3 pt-1 text-sm">
            <div>
              <p className="text-xs text-muted">Independent institutions</p>
              <p className="mt-0.5 font-medium text-ink">
                {result.independentSourceCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Total reports</p>
              <p className="mt-0.5 font-medium text-ink">
                {result.totalReports ?? result.independentSourceCount}
              </p>
            </div>
            {result.categories && (
              <div className="col-span-2">
                <p className="text-xs text-muted">Categories</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {result.categories.map((c) => (
                    <Badge key={c}>{categoryLabel(c)}</Badge>
                  ))}
                </div>
              </div>
            )}
            {result.firstReportedAt && (
              <div>
                <p className="text-xs text-muted">First reported</p>
                <p className="mt-0.5 font-medium text-ink">
                  {formatDate(result.firstReportedAt)}
                </p>
              </div>
            )}
            {result.mostRecentReportAt && (
              <div>
                <p className="text-xs text-muted">Most recent</p>
                <p className="mt-0.5 font-medium text-ink">
                  {formatDate(result.mostRecentReportAt)}
                </p>
              </div>
            )}
            {result.matchingIdentifiers && (
              <div className="col-span-2">
                <p className="text-xs text-muted">Matching identifiers</p>
                <p className="mt-0.5 font-mono text-sm text-ink">
                  {result.matchingIdentifiers.join(" · ")}
                </p>
              </div>
            )}
          </div>
          <ConfidenceText confidence={result.confidence} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">Reference</p>
          <p className="mt-0.5 font-mono text-xs font-medium text-ink sm:text-sm">
            {result.reference}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Amount charged</p>
          <p className="mt-0.5 font-medium tabular-nums text-ink">
            {formatNaira(result.amountCharged)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted">Date &amp; time</p>
          <p className="mt-0.5 font-medium text-ink">
            {formatDateTime(result.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {isMatch && (
          <>
            <button
              type="button"
              onClick={handlePrint}
              title="Print report"
              aria-label="Print report"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-card text-muted transition-colors hover:bg-hover hover:text-foreground"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              title="Download report"
              aria-label="Download report"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-card text-muted transition-colors hover:bg-hover hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </button>
          </>
        )}
        <Button onClick={onAgain} className="flex-1 whitespace-nowrap">
          Run another verification
        </Button>
      </div>
    </div>
  );
}
