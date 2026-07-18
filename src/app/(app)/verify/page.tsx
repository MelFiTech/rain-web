"use client";

import {
  ConfidenceBadge,
  ConfidenceText,
} from "@/components/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  categoryLabel,
  formatDate,
  formatDateTime,
  formatNaira,
  identifierTypeLabel,
} from "@/lib/format";
import { getVerification, verifyUser } from "@/services/verification";
import { getWalletBalance } from "@/services/wallet";
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
  Printer,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";

type Step = "form" | "confirm" | "loading" | "result" | "insufficient";

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("form");
  const [idType, setIdType] = useState<IdentifierType>("account_number");
  const [identifier, setIdentifier] = useState("");
  const [bank, setBank] = useState("");
  const [result, setResult] = useState<VerificationRecord | null>(null);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadByRef = useCallback(async (ref: string) => {
    const record = await getVerification(ref);
    if (record) {
      setResult(record);
      setStep("result");
    }
  }, []);

  useEffect(() => {
    setBalance(getWalletBalance());
    const ref = searchParams.get("ref");
    const id = searchParams.get("id");
    if (ref || id) {
      loadByRef(ref || id || "");
    }
  }, [searchParams, loadByRef]);

  const openConfirm = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Please enter an identifier.");
      return;
    }
    if (idType === "account_number" && !bank) {
      setError("Please select a bank.");
      return;
    }
    setConfirmOpen(true);
  };

  const runVerification = async () => {
    setConfirmOpen(false);
    setStep("loading");
    setError("");
    try {
      const res = await verifyUser({
        identifierType: idType,
        identifier,
        bankCode: bank || undefined,
      });
      setBalance(getWalletBalance());
      if (res.status === "success") {
        setResult(res.data);
        setStep("result");
      } else if (res.status === "insufficient_balance") {
        setBalance(res.balance);
        setStep("insufficient");
      } else {
        setError(res.message);
        setStep("form");
      }
    } catch {
      setError("Verification failed. Please try again.");
      setStep("form");
    }
  };

  const reset = () => {
    setStep("form");
    setResult(null);
    setIdentifier("");
    setBank("");
    setError("");
    setBalance(getWalletBalance());
  };

  if (step === "loading") {
    return (
      <Card className="max-w-lg mx-auto text-center py-16">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-hover flex items-center justify-center mb-4">
          <Search className="h-5 w-5 text-muted animate-pulse" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Verifying user…</h2>
        <p className="mt-2 text-sm text-muted">
          Checking Rain network for matching reports
        </p>
        <div className="mt-6 mx-auto h-1 w-32 rounded-full skeleton" />
      </Card>
    );
  }

  if (step === "insufficient") {
    return (
      <Card className="max-w-lg mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hover mb-4">
          <Wallet className="h-5 w-5 text-muted" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Insufficient balance</h2>
        <p className="mt-2 text-sm text-muted">
          Your wallet does not have enough funds for this verification.
        </p>
        <div className="mt-6 space-y-3 rounded-xl bg-hover p-4">
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
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Link href="/wallet" className="flex-1">
            <Button className="w-full">Fund wallet</Button>
          </Link>
          <Button variant="secondary" className="flex-1" onClick={reset}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  if (step === "result" && result) {
    return <ResultView result={result} onAgain={reset} />;
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader
          title="Verify a user"
          description="Check whether other institutions have reported this identity"
        />
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

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-hover px-4 py-3 text-sm text-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            Continue
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-center text-xs text-subtle">
        Tip: try ending an identifier with 9 for a match, or use{" "}
        <code className="text-muted">fraud@test.ng</code>
      </p>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm verification"
        description="You will be charged for this check"
        size="sm"
      >
        <div className="space-y-3 rounded-xl bg-hover p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Type</span>
            <span className="text-ink">{identifierTypeLabel(idType)}</span>
          </div>
          {bank && (
            <div className="flex justify-between">
              <span className="text-muted">Bank</span>
              <span className="text-ink">{bank}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Cost</span>
            <span className="font-semibold text-ink">
              {formatNaira(VERIFICATION_COST)}
            </span>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={runVerification}>Confirm &amp; verify</Button>
        </div>
      </Modal>
    </div>
  );
}

function ResultView({
  result,
  onAgain,
}: {
  result: VerificationRecord;
  onAgain: () => void;
}) {
  const isMatch = result.result === "match";

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const lines = [
      "Rain Verification Result",
      `Reference: ${result.reference}`,
      `Identifier: ${result.maskedIdentifier}`,
      `Result: ${isMatch ? "Reports found" : "No reports found"}`,
      result.confidence
        ? `Confidence: ${result.confidence.description}`
        : "",
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
    <Card className="max-w-xl mx-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hover mb-4">
        {isMatch ? (
          <AlertCircle className="h-5 w-5 text-ink" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-muted" />
        )}
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-ink">
        {isMatch ? "Reports found" : "No reports found"}
      </h2>

      {!isMatch && (
        <p className="mt-2 text-sm text-muted">
          No matching reports currently exist on Rain for this identifier.
        </p>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="soft">{identifierTypeLabel(result.identifierType)}</Badge>
          <span className="text-sm font-medium text-ink font-mono">
            {result.maskedIdentifier}
          </span>
        </div>

        {isMatch && result.confidence && (
          <div className="rounded-xl bg-hover p-4 space-y-3">
            <ConfidenceBadge
              confidence={result.confidence}
              showDescription
            />
            <div className="grid grid-cols-2 gap-3 text-sm pt-1">
              <div>
                <p className="text-xs text-muted">Independent institutions</p>
                <p className="font-medium text-ink mt-0.5">
                  {result.independentSourceCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total reports</p>
                <p className="font-medium text-ink mt-0.5">
                  {result.totalReports ?? result.independentSourceCount}
                </p>
              </div>
              {result.categories && (
                <div className="col-span-2">
                  <p className="text-xs text-muted">Categories</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.categories.map((c) => (
                      <Badge key={c}>{categoryLabel(c)}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.firstReportedAt && (
                <div>
                  <p className="text-xs text-muted">First reported</p>
                  <p className="font-medium text-ink mt-0.5">
                    {formatDate(result.firstReportedAt)}
                  </p>
                </div>
              )}
              {result.mostRecentReportAt && (
                <div>
                  <p className="text-xs text-muted">Most recent</p>
                  <p className="font-medium text-ink mt-0.5">
                    {formatDate(result.mostRecentReportAt)}
                  </p>
                </div>
              )}
              {result.matchingIdentifiers && (
                <div className="col-span-2">
                  <p className="text-xs text-muted">Matching identifiers</p>
                  <p className="font-mono text-sm text-ink mt-0.5">
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
            <p className="font-medium text-ink mt-0.5 font-mono text-xs sm:text-sm">
              {result.reference}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Amount charged</p>
            <p className="font-medium text-ink mt-0.5 tabular-nums">
              {formatNaira(result.amountCharged)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted">Date &amp; time</p>
            <p className="font-medium text-ink mt-0.5">
              {formatDateTime(result.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-2 no-print">
        {isMatch && (
          <>
            <Button variant="secondary" onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </>
        )}
        <Button onClick={onAgain} className="flex-1">
          Run another verification
        </Button>
      </div>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <Card className="max-w-xl mx-auto">
          <div className="h-40 skeleton rounded-xl" />
        </Card>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
