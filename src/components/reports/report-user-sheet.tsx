"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabel, formatDate, formatNaira } from "@/lib/format";
import { submitReport } from "@/services/reports";
import type { ReportCategory, ReportRecord, SubmitReportRequest } from "@/types";
import { NIGERIAN_BANKS, REPORT_CATEGORIES } from "@/types";
import { AlertCircle, CheckCircle2, FileWarning } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Step = "form" | "review" | "loading" | "success";

const emptyForm: SubmitReportRequest = {
  fullName: "",
  bank: "",
  accountNumber: "",
  phone: "",
  email: "",
  bvn: "",
  nin: "",
  category: "scam",
  description: "",
  incidentDate: "",
  amountInvolved: undefined,
};

interface ReportUserSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (report: ReportRecord) => void | Promise<void>;
}

export function ReportUserSheet({
  open,
  onClose,
  onSubmitted,
}: ReportUserSheetProps) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<SubmitReportRequest>({ ...emptyForm });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportRecord | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("form");
      setForm({ ...emptyForm });
      setFieldErrors({});
      setError("");
      setReport(null);
    }
  }, [open]);

  const update = <K extends keyof SubmitReportRequest>(
    key: K,
    value: SubmitReportRequest[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => {
      const next = { ...e };
      delete next[key as string];
      delete next.identifier;
      return next;
    });
  };

  const validateLocal = (): boolean => {
    const errors: Record<string, string> = {};
    const hasId = Boolean(
      form.accountNumber?.trim() ||
        form.phone?.trim() ||
        form.email?.trim() ||
        form.bvn?.trim() ||
        form.nin?.trim()
    );
    if (!hasId) {
      errors.identifier =
        "At least one identifier is required (account, phone, email, BVN, or NIN).";
    }
    if (!form.category) errors.category = "Category is required.";
    if (!form.description?.trim() || form.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }
    if (!form.incidentDate) errors.incidentDate = "Incident date is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goReview = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (validateLocal()) setStep("review");
  };

  const confirmSubmit = async () => {
    setStep("loading");
    setError("");
    try {
      const res = await submitReport({
        ...form,
        amountInvolved: form.amountInvolved
          ? Number(form.amountInvolved)
          : undefined,
      });
      if (res.success) {
        setReport(res.report);
        setStep("success");
        await onSubmitted?.(res.report);
      } else {
        setFieldErrors(res.fieldErrors || {});
        setError(res.error);
        setStep("form");
      }
    } catch {
      setError("Failed to submit report. Please try again.");
      setStep("form");
    }
  };

  const reset = () => {
    setForm({ ...emptyForm });
    setReport(null);
    setFieldErrors({});
    setError("");
    setStep("form");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (step === "loading") return;
        onClose();
      }}
      title={
        step === "success"
          ? "Report submitted"
          : step === "review"
            ? "Review report"
            : step === "loading"
              ? "Submitting report"
              : "Report user"
      }
      description={
        step === "form"
          ? "Share risk intelligence with verified institutions on Rain."
          : step === "review"
            ? "Confirm details before submission."
            : undefined
      }
      size="lg"
    >
      {step === "loading" && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-hover">
            <FileWarning className="h-5 w-5 animate-pulse text-muted" />
          </div>
          <p className="text-sm font-medium text-ink">Submitting report…</p>
          <p className="mt-1 text-sm text-muted">
            Securely recording your submission
          </p>
          <div className="mx-auto mt-6 h-1 w-32 rounded-full skeleton" />
        </div>
      )}

      {step === "success" && report && (
        <div className="space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hover">
            <CheckCircle2 className="h-5 w-5 text-ink" />
          </div>
          <p className="text-sm text-muted">
            Your report has been recorded. Multiple reports from your institution
            for the same user still count as one independent source.
          </p>
          <div className="rounded-xl bg-hover p-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Reference</span>
              <span className="font-mono font-medium text-ink">
                {report.reference}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Category</span>
              <span className="text-ink">{categoryLabel(report.category)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Confidence</span>
              <span className="text-ink">{report.confidence.label}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/reports?id=${report.id}`} className="flex-1">
              <Button variant="secondary" className="w-full" onClick={onClose}>
                View report
              </Button>
            </Link>
            <Button className="flex-1" onClick={reset}>
              Submit another
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="space-y-3 text-sm">
            {[
              ["Full name", form.fullName || "—"],
              ["Bank", form.bank || "—"],
              ["Account number", form.accountNumber || "—"],
              ["Phone", form.phone || "—"],
              ["Email", form.email || "—"],
              ["BVN", form.bvn || "—"],
              ["NIN", form.nin || "—"],
              ["Category", categoryLabel(form.category)],
              ["Incident date", form.incidentDate ? formatDate(form.incidentDate) : "—"],
              [
                "Amount involved",
                form.amountInvolved
                  ? formatNaira(Number(form.amountInvolved))
                  : "—",
              ],
              ["Description", form.description],
            ].map(([label, value]) => (
              <div
                key={label as string}
                className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"
              >
                <span className="shrink-0 text-muted">{label}</span>
                <span className="break-all text-ink sm:text-right">{value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-hover px-4 py-3 text-xs text-muted">
            Submit accurate information only. Multiple reports from your
            institution for the same user will still count as one independent
            source.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStep("form")}>
              Back
            </Button>
            <Button onClick={confirmSubmit}>Confirm submission</Button>
          </div>
        </div>
      )}

      {step === "form" && (
        <div>
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-hover px-4 py-3 text-sm text-muted">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Submit accurate information only. Multiple reports from your
              institution for the same user will still count as one independent
              source.
            </p>
          </div>

          <form onSubmit={goReview} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full name (optional)"
                value={form.fullName || ""}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="As known to your institution"
              />
              <Select
                label="Bank"
                value={form.bank || ""}
                onChange={(e) => update("bank", e.target.value)}
                placeholder="Select bank"
                options={NIGERIAN_BANKS.map((b) => ({ value: b, label: b }))}
              />
              <Input
                label="Bank account number"
                value={form.accountNumber || ""}
                onChange={(e) => update("accountNumber", e.target.value)}
                placeholder="10-digit account number"
                inputMode="numeric"
              />
              <Input
                label="Phone number"
                value={form.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="08012345678"
              />
              <Input
                label="Email address"
                type="email"
                value={form.email || ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="user@example.com"
                error={fieldErrors.email}
              />
              <Input
                label="BVN"
                value={form.bvn || ""}
                onChange={(e) => update("bvn", e.target.value)}
                placeholder="11-digit BVN"
                inputMode="numeric"
              />
              <Input
                label="NIN"
                value={form.nin || ""}
                onChange={(e) => update("nin", e.target.value)}
                placeholder="11-digit NIN"
                inputMode="numeric"
              />
              <Select
                label="Report category"
                value={form.category}
                onChange={(e) =>
                  update("category", e.target.value as ReportCategory)
                }
                options={REPORT_CATEGORIES.filter(
                  (c) => c.value !== "fraud"
                ).map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
                error={fieldErrors.category}
              />
              <Input
                label="Incident date"
                type="date"
                value={form.incidentDate}
                onChange={(e) => update("incidentDate", e.target.value)}
                error={fieldErrors.incidentDate}
              />
              <Input
                label="Amount involved (optional)"
                type="number"
                min={0}
                value={form.amountInvolved ?? ""}
                onChange={(e) =>
                  update(
                    "amountInvolved",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="0"
              />
            </div>

            <Textarea
              label="Short description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the incident briefly (min. 10 characters)"
              error={fieldErrors.description}
            />

            {fieldErrors.identifier && (
              <div className="rounded-xl bg-hover px-4 py-3 text-sm text-foreground">
                {fieldErrors.identifier}
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-hover px-4 py-3 text-sm text-foreground">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={
                !(
                  form.accountNumber?.trim() ||
                  form.phone?.trim() ||
                  form.email?.trim() ||
                  form.bvn?.trim() ||
                  form.nin?.trim()
                ) ||
                !form.category ||
                (form.description?.trim().length ?? 0) < 10 ||
                !form.incidentDate
              }
            >
              Review report
            </Button>
          </form>
        </div>
      )}
    </Modal>
  );
}
