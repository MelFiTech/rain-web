import { ApiRequestError, apiGet, apiPost, isApiConfigured } from "@/lib/api-client";
import {
  nationalIdDigits,
  validateNationalIdField,
} from "@/lib/national-id";
import type {
  PaginatedResult,
  ReportFilters,
  ReportRecord,
  SubmitReportRequest,
} from "@/types";

/** Shared client validation for report submit (form + API call). */
export function validateReportRequest(
  request: SubmitReportRequest
): Record<string, string> {
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

  if (request.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  const bvn = nationalIdDigits(request.bvn);
  const nin = nationalIdDigits(request.nin);
  const account = request.accountNumber?.replace(/\D/g, "") ?? "";
  const phone = request.phone?.replace(/\D/g, "") ?? "";

  const bvnError = validateNationalIdField(request.bvn, "BVN");
  if (bvnError) fieldErrors.bvn = bvnError;
  const ninError = validateNationalIdField(request.nin, "NIN");
  if (ninError) fieldErrors.nin = ninError;
  if (account && account.length !== 10) {
    fieldErrors.accountNumber = "Account number must be 10 digits.";
  }
  if (phone && (phone.length < 10 || phone.length > 11)) {
    fieldErrors.phone = "Enter a valid Nigerian phone number.";
  }

  return fieldErrors;
}

function firstFieldErrorMessage(fieldErrors: Record<string, string>): string {
  const first = Object.values(fieldErrors)[0];
  return first ?? "Please fix the highlighted fields.";
}

export async function submitReport(
  request: SubmitReportRequest
): Promise<
  | { success: true; report: ReportRecord }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  const fieldErrors = validateReportRequest(request);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: firstFieldErrorMessage(fieldErrors),
      fieldErrors,
    };
  }

  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "Report submission is unavailable until the Rain API is connected (NEXT_PUBLIC_API_URL).",
    };
  }

  try {
    const payload = {
      ...request,
      fullName: request.fullName?.trim() || undefined,
      bank: request.bank?.trim() || undefined,
      accountNumber: request.accountNumber?.replace(/\D/g, "") || undefined,
      phone: request.phone?.replace(/\D/g, "") || undefined,
      email: request.email?.trim().toLowerCase() || undefined,
      bvn: nationalIdDigits(request.bvn) || undefined,
      nin: nationalIdDigits(request.nin) || undefined,
      description: request.description.trim(),
    };
    const result = await apiPost<{
      success: boolean;
      report?: ReportRecord;
      error?: string;
      fieldErrors?: Record<string, string>;
    }>("/platform/reports", payload);
    if (!result.success || !result.report) {
      return {
        success: false,
        error: result.error ?? "Could not submit report. Try again.",
        fieldErrors: result.fieldErrors,
      };
    }
    return { success: true, report: result.report };
  } catch (e) {
    if (e instanceof ApiRequestError && e.fieldErrors) {
      return {
        success: false,
        error: e.message,
        fieldErrors: e.fieldErrors,
      };
    }
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Could not submit report. Try again.",
    };
  }
}

export async function listReports(
  filters: ReportFilters = {}
): Promise<PaginatedResult<ReportRecord>> {
  const empty: PaginatedResult<ReportRecord> = {
    data: [],
    total: 0,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 10,
    totalPages: 1,
  };

  if (!isApiConfigured()) {
    return empty;
  }

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return apiGet<PaginatedResult<ReportRecord>>(
    `/platform/reports${qs ? `?${qs}` : ""}`
  );
}

export async function getReport(id: string): Promise<ReportRecord | null> {
  if (!isApiConfigured()) return null;
  try {
    return await apiGet<ReportRecord>(
      `/platform/reports/${encodeURIComponent(id)}`
    );
  } catch {
    return null;
  }
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
