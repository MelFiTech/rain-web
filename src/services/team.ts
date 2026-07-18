import { delay, generateId } from "@/lib/utils";
import type { MemberStatus, TeamMember, TeamRole } from "@/types";
import { teamStore } from "./mock-data";

export async function listTeamMembers(): Promise<TeamMember[]> {
  await delay(500);
  return [...teamStore.members];
}

export async function inviteTeamMember(input: {
  name: string;
  email: string;
  role: TeamRole;
}): Promise<
  | { success: true; member: TeamMember }
  | { success: false; error: string }
> {
  await delay(800);

  if (!input.name.trim() || !input.email.trim()) {
    return { success: false, error: "Name and email are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  if (
    teamStore.members.some(
      (m) => m.email.toLowerCase() === input.email.toLowerCase()
    )
  ) {
    return {
      success: false,
      error: "A team member with this email already exists.",
    };
  }

  const member: TeamMember = {
    id: generateId("tm"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: "invited",
    lastActiveAt: new Date().toISOString(),
  };

  teamStore.members = [member, ...teamStore.members];
  return { success: true, member };
}

export async function updateMemberRole(
  id: string,
  role: TeamRole
): Promise<{ success: boolean; error?: string }> {
  await delay(500);
  const member = teamStore.members.find((m) => m.id === id);
  if (!member) return { success: false, error: "Member not found." };
  member.role = role;
  return { success: true };
}

export async function updateMemberStatus(
  id: string,
  status: MemberStatus
): Promise<{ success: boolean; error?: string }> {
  await delay(500);
  const member = teamStore.members.find((m) => m.id === id);
  if (!member) return { success: false, error: "Member not found." };
  member.status = status;
  return { success: true };
}
