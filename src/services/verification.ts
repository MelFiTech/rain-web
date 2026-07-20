import { apiGet, apiPost, isApiConfigured } from "@/lib/api-client";
import type {
  IdentifierType,
  PaginatedResult,
  VerificationFilters,
  VerificationRecord,
  VerifyUserRequest,
  VerifyUserResponse,
} from "@/types";

function normalizeVerifyIdentifier(
  identifierType: IdentifierType,
  identifier: string
): string {
  const trimmed = identifier.trim();
  switch (identifierType) {
    case "email":
      return trimmed.toLowerCase();
    case "phone":
    case "bvn":
    case "nin":
    case "account_number":
      return trimmed.replace(/\D/g, "");
    default:
      return trimmed;
  }
}

function validateVerifyRequest(request: VerifyUserRequest): string | null {
  const id = normalizeVerifyIdentifier(
    request.identifierType,
    request.identifier ?? ""
  );
  if (!id) return "Identifier is required.";

  switch (request.identifierType) {
    case "account_number":
      if (!request.bankCode?.trim()) {
        return "Please select a bank for account number verification.";
      }
      if (id.length !== 10) {
        return "Enter a valid 10-digit account number.";
      }
      break;
    case "phone":
      if (id.length < 10 || id.length > 11) {
        return "Enter a valid Nigerian phone number.";
      }
      break;
    case "bvn":
    case "nin":
      if (id.length !== 11) {
        return `Enter a valid 11-digit ${request.identifierType.toUpperCase()}.`;
      }
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) {
        return "Enter a valid email address.";
      }
      break;
  }
  return null;
}

export async function verifyUser(
  request: VerifyUserRequest
): Promise<VerifyUserResponse> {
  const validationError = validateVerifyRequest(request);
  if (validationError) {
    return { status: "error", message: validationError };
  }

  if (!isApiConfigured()) {
    return {
      status: "error",
      message:
        "Verification is unavailable until the Rain API is connected (NEXT_PUBLIC_API_URL).",
    };
  }

  return apiPost<VerifyUserResponse>("/platform/verifications/verify", {
    identifierType: request.identifierType,
    identifier: normalizeVerifyIdentifier(
      request.identifierType,
      request.identifier
    ),
    bankCode: request.bankCode?.trim() || undefined,
  });
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
