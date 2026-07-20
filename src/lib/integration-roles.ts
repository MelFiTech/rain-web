import type { TeamRole } from "@/types";

export function canManageIntegrationSettings(role: TeamRole): boolean {
  return role === "administrator" || role === "developer";
}
