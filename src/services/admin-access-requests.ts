import { apiGet, apiPost, isApiConfigured } from "@/lib/api-client";

export type AccessRequestRecord = {
  id: string;
  companyName: string;
  email: string;
  cacNumber: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedByEmail?: string;
  rejectionReason?: string;
  institutionId?: string;
};

export async function listAccessRequests(
  status?: string
): Promise<AccessRequestRecord[]> {
  if (!isApiConfigured()) return [];
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiGet<AccessRequestRecord[]>(
    `/platform/admin/access-requests${qs}`
  );
}

export async function approveAccessRequest(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    await apiPost(`/platform/admin/access-requests/${encodeURIComponent(id)}/approve`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not approve request.",
    };
  }
}

export async function rejectAccessRequest(
  id: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    await apiPost(
      `/platform/admin/access-requests/${encodeURIComponent(id)}/reject`,
      { reason }
    );
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not reject request.",
    };
  }
}
