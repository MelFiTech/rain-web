import { apiPost, isApiConfigured } from "@/lib/api-client";
import type { NetworkReportEvent, PlatformUserCheckResult } from "@/types";

export async function checkReportOnPlatform(
  report: NetworkReportEvent
): Promise<PlatformUserCheckResult> {
  if (!isApiConfigured()) {
    return {
      matched: false,
      reportReference: report.reference,
      checkedAt: new Date().toISOString(),
    };
  }

  return apiPost<PlatformUserCheckResult>("/platform/check-report", {
    reportId: report.id,
    reference: report.reference,
    maskedIdentifier: report.maskedIdentifier,
  });
}
