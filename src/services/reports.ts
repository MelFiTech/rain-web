import { buildConfidence } from "@/lib/confidence";
import {
  maskAccountNumber,
  maskBvnOrNin,
  maskEmail,
  maskPhone,
} from "@/lib/masking";
import { delay, generateId, generateReference } from "@/lib/utils";
import type {
  PaginatedResult,
  ReportFilters,
  ReportRecord,
  SubmitReportRequest,
} from "@/types";
import { MOCK_REPORTS } from "./mock-data";

export async function submitReport(
  request: SubmitReportRequest
): Promise<
  | { success: true; report: ReportRecord }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  await delay(1000);

  const fieldErrors: Record<string, string> = {};

  const hasIdentifier = Boolean(
    request.accountNumber?.trim() ||
      request.phone?.trim() ||
      request.email?.trim() ||
      request.bvn?.trim() ||
      request.nin?.trim()
  );

  if (!hasIdentifier) {
    fieldErrors.identifier =
      "At least one identifier is required (account, phone, email, BVN, or NIN).";
  }

  if (!request.category) {
    fieldErrors.category = "Report category is required.";
  }

  if (!request.description?.trim() || request.description.trim().length < 10) {
    fieldErrors.description =
      "Please provide a short description (at least 10 characters).";
  }

  if (!request.incidentDate) {
    fieldErrors.incidentDate = "Incident date is required.";
  }

  if (request.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const report: ReportRecord = {
    id: generateId("rpt"),
    reference: generateReference("RPT"),
    fullName: request.fullName?.trim() || undefined,
    bank: request.bank?.trim() || undefined,
    maskedAccountNumber: request.accountNumber
      ? maskAccountNumber(request.accountNumber)
      : undefined,
    maskedPhone: request.phone ? maskPhone(request.phone) : undefined,
    maskedEmail: request.email ? maskEmail(request.email) : undefined,
    maskedBvn: request.bvn ? maskBvnOrNin(request.bvn) : undefined,
    maskedNin: request.nin ? maskBvnOrNin(request.nin) : undefined,
    category: request.category,
    description: request.description.trim(),
    incidentDate: request.incidentDate,
    amountInvolved: request.amountInvolved,
    independentSourceCount: 1,
    confidence: buildConfidence(1),
    earningsGenerated: 0,
    submittedAt: new Date().toISOString(),
  };

  MOCK_REPORTS.unshift(report);
  return { success: true, report };
}

export async function listReports(
  filters: ReportFilters = {}
): Promise<PaginatedResult<ReportRecord>> {
  await delay(600);

  let data = [...MOCK_REPORTS];
  const {
    search = "",
    category = "all",
    confidence = "all",
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 10,
  } = filters;

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (r) =>
        r.reference.toLowerCase().includes(q) ||
        r.fullName?.toLowerCase().includes(q) ||
        r.maskedAccountNumber?.toLowerCase().includes(q) ||
        r.maskedPhone?.toLowerCase().includes(q) ||
        r.maskedEmail?.toLowerCase().includes(q)
    );
  }

  if (category !== "all") {
    data = data.filter((r) => r.category === category);
  }

  if (confidence !== "all") {
    data = data.filter((r) => r.confidence.level === confidence);
  }

  if (dateFrom) {
    data = data.filter((r) => r.submittedAt >= dateFrom);
  }
  if (dateTo) {
    data = data.filter((r) => r.submittedAt <= `${dateTo}T23:59:59Z`);
  }

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    data: data.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getReport(id: string): Promise<ReportRecord | null> {
  await delay(400);
  return MOCK_REPORTS.find((r) => r.id === id || r.reference === id) ?? null;
}

export function getPrimaryMaskedIdentifier(report: ReportRecord): string {
  return (
    report.maskedAccountNumber ||
    report.maskedPhone ||
    report.maskedEmail ||
    report.maskedBvn ||
    report.maskedNin ||
    report.fullName ||
    "—"
  );
}
