import type {
  IdentifierType,
  NetworkReportEvent,
  PlatformCustomerRecord,
  PlatformUserCheckResult,
} from "@/types";

const CHECK_DELAY_MS = 850;

function inferIdentifierType(masked: string): IdentifierType {
  if (masked.includes("@")) return "email";
  if (masked.includes("+234") || masked.startsWith("0")) return "phone";
  return "account_number";
}

/** Mock platform customers keyed by trailing token in the masked identifier. */
const PLATFORM_BY_KEY: Record<string, Omit<PlatformCustomerRecord, "matchedField" | "maskedIdentifier">> = {
  "8841": {
    customerId: "CUS-10294",
    displayName: "Chidi M.",
    onboardedAt: "2024-08-12T10:00:00.000Z",
    status: "active",
  },
  "3341": {
    customerId: "CUS-08817",
    displayName: "Adaeze O.",
    onboardedAt: "2025-01-03T14:22:00.000Z",
    status: "active",
  },
  "4321": {
    customerId: "CUS-07602",
    displayName: "Tunde B.",
    onboardedAt: "2023-11-20T09:15:00.000Z",
    status: "restricted",
  },
  "4412": {
    customerId: "CUS-09133",
    displayName: "Fatima K.",
    onboardedAt: "2025-06-01T11:40:00.000Z",
    status: "active",
  },
  finmail: {
    customerId: "CUS-06441",
    displayName: "Emeka T.",
    onboardedAt: "2024-03-18T16:05:00.000Z",
    status: "dormant",
  },
};

function lookupPlatformCustomer(
  maskedIdentifier: string
): PlatformCustomerRecord | null {
  const field = inferIdentifierType(maskedIdentifier);
  const lower = maskedIdentifier.toLowerCase();

  if (lower.includes("finmail")) {
    const base = PLATFORM_BY_KEY.finmail;
    return {
      ...base,
      matchedField: "email",
      maskedIdentifier,
    };
  }

  const digits = maskedIdentifier.replace(/\D/g, "");
  const suffix = digits.slice(-4);
  const base = PLATFORM_BY_KEY[suffix];
  if (!base) return null;

  return {
    ...base,
    matchedField: field,
    maskedIdentifier,
  };
}

export async function checkReportOnPlatform(
  report: NetworkReportEvent
): Promise<PlatformUserCheckResult> {
  await new Promise((r) => setTimeout(r, CHECK_DELAY_MS));

  const checkedAt = new Date().toISOString();
  const customer = lookupPlatformCustomer(report.maskedIdentifier);

  if (customer) {
    return {
      matched: true,
      customer,
      reportReference: report.reference,
      checkedAt,
    };
  }

  return {
    matched: false,
    reportReference: report.reference,
    checkedAt,
  };
}
