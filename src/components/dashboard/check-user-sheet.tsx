"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  categoryLabel,
  formatDate,
  formatDateTime,
  identifierTypeLabel,
} from "@/lib/format";
import { checkReportOnPlatform } from "@/services/platform-check";
import type { NetworkReportEvent, PlatformUserCheckResult } from "@/types";
import { CheckCircle2, Loader2, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CheckUserSheetProps {
  open: boolean;
  onClose: () => void;
  report: NetworkReportEvent | null;
}

type Phase = "idle" | "loading" | "done" | "error";

function statusLabel(status: string): string {
  if (status === "restricted") return "Restricted";
  if (status === "dormant") return "Dormant";
  return "Active";
}

function ReportContext({ report }: { report: NetworkReportEvent }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm text-ink">{report.maskedIdentifier}</p>
          <p className="mt-1 text-sm text-muted">
            Reported by {report.institutionName}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-subtle">
          {report.reference}
        </span>
      </div>
      <div className="border-t border-line pt-3 text-[13px] space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Category</span>
          <span className="font-medium text-ink">{categoryLabel(report.category)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Filed</span>
          <span className="font-medium text-ink tabular-nums">
            {formatDateTime(report.submittedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MatchResult({ result }: { result: PlatformUserCheckResult }) {
  if (!result.matched) {
    return (
      <div className="rounded-xl border border-line bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hover text-muted">
            <SearchX className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">No match on your platform</p>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              We did not find a customer record linked to this identifier in your
              system. The network report is still visible to your team for awareness.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { customer } = result;

  return (
    <div className="rounded-xl border border-line bg-card p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ok-bg text-ok-fg">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Customer found on your platform</p>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            This network report matches an existing customer in your records.
          </p>
        </div>
      </div>
      <div className="border-t border-line pt-3 text-[13px] space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Customer</span>
          <span className="font-medium text-ink">{customer.displayName}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Customer ID</span>
          <span className="font-mono text-xs text-ink">{customer.customerId}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Matched on</span>
          <span className="font-medium text-ink">
            {identifierTypeLabel(customer.matchedField)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Onboarded</span>
          <span className="font-medium text-ink tabular-nums">
            {formatDate(customer.onboardedAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted">Account status</span>
          <span className="font-medium text-ink">{statusLabel(customer.status)}</span>
        </div>
      </div>
    </div>
  );
}

export function CheckUserSheet({ open, onClose, report }: CheckUserSheetProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<PlatformUserCheckResult | null>(null);

  useEffect(() => {
    if (!open || !report) {
      setPhase("idle");
      setResult(null);
      return;
    }

    let cancelled = false;
    setPhase("loading");
    setResult(null);

    checkReportOnPlatform(report)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setPhase("done");
      })
      .catch(() => {
        if (cancelled) return;
        setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [open, report]);

  const reportRef = report?.reference;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Check user"
      description="See if this network report matches a customer on your platform"
      size="lg"
    >
      {!report ? null : (
        <div className="space-y-5 mt-1">
          <ReportContext report={report} />

          {phase === "loading" && (
            <div className="flex items-center gap-3 rounded-xl bg-hover px-4 py-4 text-sm text-muted">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              Searching your customer records…
            </div>
          )}

          {phase === "error" && (
            <div className="rounded-xl bg-hover px-4 py-3 text-sm text-foreground">
              We could not complete the check. Please try again.
            </div>
          )}

          {phase === "done" && result && <MatchResult result={result} />}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {reportRef ? (
              <Link
                href={`/reports?ref=${encodeURIComponent(reportRef)}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-hover px-4 text-sm font-medium text-ink hover:bg-active transition-colors"
              >
                View network report
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
