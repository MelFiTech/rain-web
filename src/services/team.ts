import { apiGet, apiPatch, apiPost, isApiConfigured } from "@/lib/api-client";
import type { MemberStatus, TeamMember, TeamRole } from "@/types";

export async function listTeamMembers(): Promise<TeamMember[]> {
  if (!isApiConfigured()) return [];
  return apiGet<TeamMember[]>("/platform/team/members");
}

export async function inviteTeamMember(input: {
  name: string;
  email: string;
  role: TeamRole;
}): Promise<
  | { success: true; member: TeamMember }
  | { success: false; error: string }
> {
  if (!input.name.trim() || !input.email.trim()) {
    return { success: false, error: "Name and email are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "Team management is unavailable until the Rain API is connected (NEXT_PUBLIC_API_URL).",
    };
  }

  try {
    const member = await apiPost<TeamMember>("/platform/team/members/invite", input);
    return { success: true, member };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Could not send invite. Try again.",
    };
  }
}

export async function updateMemberRole(
  id: string,
  role: TeamRole
): Promise<{ success: boolean; error?: string }> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    await apiPatch(`/platform/team/members/${encodeURIComponent(id)}`, { role });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not update role.",
    };
  }
}

export async function updateMemberStatus(
  id: string,
  status: MemberStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isApiConfigured()) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    await apiPatch(`/platform/team/members/${encodeURIComponent(id)}`, { status });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not update member.",
    };
  }
}
