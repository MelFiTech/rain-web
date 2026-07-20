import { apiGet, apiPost, isApiConfigured } from "@/lib/api-client";
import type {
  PaginatedResult,
  VerificationFilters,
  VerificationRecord,
  VerifyUserRequest,
  VerifyUserResponse,
} from "@/types";

export async function verifyUser(
  request: VerifyUserRequest
): Promise<VerifyUserResponse> {
  if (!request.identifier?.trim()) {
    return { status: "error", message: "Identifier is required." };
  }

  if (
    request.identifierType === "account_number" &&
    !request.bankCode?.trim()
  ) {
    return {
      status: "error",
      message: "Please select a bank for account number verification.",
    };
  }

  if (!isApiConfigured()) {
    return {
      status: "error",
      message:
        "Verification is unavailable until the Rain API is connected (NEXT_PUBLIC_API_URL).",
    };
  }

  return apiPost<VerifyUserResponse>("/platform/verifications/verify", request);
}

export async function listVerifications(
  filters: VerificationFilters = {}
): Promise<PaginatedResult<VerificationRecord>> {
  const empty: PaginatedResult<VerificationRecord> = {
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
  return apiGet<PaginatedResult<VerificationRecord>>(
    `/platform/verifications${qs ? `?${qs}` : ""}`
  );
}

export async function getVerification(
  id: string
): Promise<VerificationRecord | null> {
  if (!isApiConfigured()) return null;
  try {
    return await apiGet<VerificationRecord>(
      `/platform/verifications/${encodeURIComponent(id)}`
    );
  } catch {
    return null;
  }
}

export async function exportVerificationsCsv(
  filters: VerificationFilters = {}
): Promise<string> {
  if (!isApiConfigured()) {
    return "Reference,Identifier Type,Masked Identifier,Result,Confidence,Sources,Cost,Date";
  }

  const params = new URLSearchParams();
  Object.entries({ ...filters, page: 1, pageSize: 1000 }).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== "" && value !== "all") {
        params.set(key, String(value));
      }
    }
  );
  const res = await apiGet<{ csv: string }>(
    `/platform/verifications/export?${params.toString()}`
  );
  return res.csv;
}
