import { buildConfidence } from "@/lib/confidence";
import { maskIdentifier } from "@/lib/masking";
import { delay, generateId, generateReference } from "@/lib/utils";
import type {
  PaginatedResult,
  ReportCategory,
  VerificationFilters,
  VerificationRecord,
  VerifyUserRequest,
  VerifyUserResponse,
} from "@/types";
import { VERIFICATION_COST } from "@/types";
import { MATCH_TRIGGERS, MOCK_VERIFICATIONS, walletStore } from "./mock-data";
import { deductWallet } from "./wallet";

export async function verifyUser(
  request: VerifyUserRequest
): Promise<VerifyUserResponse> {
  await delay(1200);

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

  if (walletStore.balance < VERIFICATION_COST) {
    return {
      status: "insufficient_balance",
      balance: walletStore.balance,
      cost: VERIFICATION_COST,
    };
  }

  const normalized = request.identifier.trim().toLowerCase().replace(/\s/g, "");
  const isMatch =
    MATCH_TRIGGERS.some((t) => normalized.includes(t.toLowerCase())) ||
    normalized.endsWith("9") ||
    normalized.includes("fraud");

  deductWallet(VERIFICATION_COST, "verification_charge", "User verification");

  const masked = maskIdentifier(request.identifierType, request.identifier);
  const reference = generateReference("VER");

  let record: VerificationRecord;

  if (isMatch) {
    const sourceCount = normalized.includes("veryhigh")
      ? 12
      : normalized.includes("high")
        ? 7
        : normalized.endsWith("9")
          ? 3
          : 1;

    record = {
      id: generateId("ver"),
      reference,
      identifierType: request.identifierType,
      maskedIdentifier: masked,
      result: "match",
      confidence: buildConfidence(sourceCount),
      independentSourceCount: sourceCount,
      totalReports: sourceCount + Math.floor(Math.random() * 3),
      categories: (["fraud", "scam"] as ReportCategory[]).slice(
        0,
        sourceCount > 2 ? 2 : 1
      ),
      firstReportedAt: "2025-12-01T10:00:00Z",
      mostRecentReportAt: new Date().toISOString(),
      matchingIdentifiers: [masked],
      amountCharged: VERIFICATION_COST,
      createdAt: new Date().toISOString(),
    };
  } else {
    record = {
      id: generateId("ver"),
      reference,
      identifierType: request.identifierType,
      maskedIdentifier: masked,
      result: "no_match",
      confidence: null,
      independentSourceCount: 0,
      amountCharged: VERIFICATION_COST,
      createdAt: new Date().toISOString(),
    };
  }

  MOCK_VERIFICATIONS.unshift(record);
  return { status: "success", data: record };
}

export async function listVerifications(
  filters: VerificationFilters = {}
): Promise<PaginatedResult<VerificationRecord>> {
  await delay(600);

  let data = [...MOCK_VERIFICATIONS];
  const {
    search = "",
    result = "all",
    confidence = "all",
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 10,
  } = filters;

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (v) =>
        v.reference.toLowerCase().includes(q) ||
        v.maskedIdentifier.toLowerCase().includes(q)
    );
  }

  if (result !== "all") {
    data = data.filter((v) => v.result === result);
  }

  if (confidence !== "all") {
    data = data.filter((v) => v.confidence?.level === confidence);
  }

  if (dateFrom) {
    data = data.filter((v) => v.createdAt >= dateFrom);
  }
  if (dateTo) {
    data = data.filter((v) => v.createdAt <= `${dateTo}T23:59:59Z`);
  }

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);

  return { data: pageData, total, page, pageSize, totalPages };
}

export async function getVerification(
  id: string
): Promise<VerificationRecord | null> {
  await delay(400);
  return (
    MOCK_VERIFICATIONS.find((v) => v.id === id || v.reference === id) ?? null
  );
}

export async function exportVerificationsCsv(
  filters: VerificationFilters = {}
): Promise<string> {
  await delay(500);
  const { data } = await listVerifications({ ...filters, page: 1, pageSize: 1000 });
  const header =
    "Reference,Identifier Type,Masked Identifier,Result,Confidence,Sources,Cost,Date";
  const rows = data.map((v) =>
    [
      v.reference,
      v.identifierType,
      v.maskedIdentifier,
      v.result,
      v.confidence?.label ?? "N/A",
      v.independentSourceCount,
      v.amountCharged,
      v.createdAt,
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
