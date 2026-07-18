"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SkeletonTable } from "@/components/ui/skeleton";
import { formatRelative, roleLabel } from "@/lib/format";
import {
  inviteTeamMember,
  listTeamMembers,
  updateMemberRole,
  updateMemberStatus,
} from "@/services/team";
import type { TeamMember, TeamRole } from "@/types";
import { Plus, UserCog } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

const ROLE_OPTIONS = [
  { value: "administrator", label: "Administrator" },
  { value: "analyst", label: "Analyst" },
  { value: "finance", label: "Finance" },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("analyst");
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);

  const [roleMember, setRoleMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<TeamRole>("analyst");
  const [roleLoading, setRoleLoading] = useState(false);

  const [deactivateMember, setDeactivateMember] = useState<TeamMember | null>(
    null
  );
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMembers(await listTeamMembers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviting(true);
    try {
      const res = await inviteTeamMember({ name, email, role });
      if (res.success) {
        setInviteOpen(false);
        setName("");
        setEmail("");
        setRole("analyst");
        await load();
      } else {
        setInviteError(res.error);
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleMember) return;
    setRoleLoading(true);
    try {
      await updateMemberRole(roleMember.id, newRole);
      setRoleMember(null);
      await load();
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateMember) return;
    setDeactivateLoading(true);
    try {
      const next =
        deactivateMember.status === "deactivated" ? "active" : "deactivated";
      await updateMemberStatus(deactivateMember.id, next);
      setDeactivateMember(null);
      await load();
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Team members"
          description="Manage who can access Rain for your institution"
          action={
            <Button onClick={() => setInviteOpen(true)}>
              <Plus className="h-4 w-4" />
              Invite
            </Button>
          }
        />

        {loading ? (
          <SkeletonTable rows={4} />
        ) : (
          <div className="space-y-1">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-hover/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-hover flex items-center justify-center text-xs font-semibold text-ink shrink-0">
                    {m.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {m.name}
                    </p>
                    <p className="text-xs text-muted truncate">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap pl-13 sm:pl-0">
                  <Badge>{roleLabel(m.role)}</Badge>
                  <Badge
                    tone={
                      m.status === "active"
                        ? "success"
                        : m.status === "invited"
                          ? "warning"
                          : "soft"
                    }
                  >
                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-subtle hidden md:inline">
                    {formatRelative(m.lastActiveAt)}
                  </span>
                  <div className="flex gap-1 ml-auto sm:ml-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRoleMember(m);
                        setNewRole(m.role);
                      }}
                      disabled={m.status === "deactivated"}
                    >
                      <UserCog className="h-3.5 w-3.5" />
                      Role
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeactivateMember(m)}
                    >
                      {m.status === "deactivated" ? "Reactivate" : "Deactivate"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite team member"
        description="They will receive an email to join your institution"
        size="sm"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
            options={ROLE_OPTIONS}
          />
          {inviteError && (
            <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">
              {inviteError}
            </p>
          )}
          <Button type="submit" className="w-full" loading={inviting}>
            Send invite
          </Button>
        </form>
      </Modal>

      <Modal
        open={!!roleMember}
        onClose={() => setRoleMember(null)}
        title="Change role"
        description={roleMember?.name}
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as TeamRole)}
            options={ROLE_OPTIONS}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRoleMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} loading={roleLoading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deactivateMember}
        onClose={() => setDeactivateMember(null)}
        onConfirm={handleDeactivate}
        loading={deactivateLoading}
        title={
          deactivateMember?.status === "deactivated"
            ? "Reactivate member?"
            : "Deactivate member?"
        }
        description={
          deactivateMember
            ? deactivateMember.status === "deactivated"
              ? `${deactivateMember.name} will regain access to Rain.`
              : `${deactivateMember.name} will lose access to Rain immediately.`
            : undefined
        }
        confirmLabel={
          deactivateMember?.status === "deactivated"
            ? "Reactivate"
            : "Deactivate"
        }
        danger={deactivateMember?.status !== "deactivated"}
      />
    </div>
  );
}
