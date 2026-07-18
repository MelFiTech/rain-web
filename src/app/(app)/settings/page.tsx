"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { SkeletonForm } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { formatRelative } from "@/lib/format";
import {
  changePassword,
  fetchSettings,
  logoutAllSessions,
  logoutSession,
  updateNotificationPreferences,
  updateProfile,
} from "@/services/settings";
import type {
  InstitutionSettings,
  NotificationPreferences,
} from "@/types";
import { Building2, LogOut, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState("");

  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      setSettings(data);
      setName(data.profile.name);
      setEmail(data.profile.email);
      setPhone(data.profile.phone || "");
      setAddress(data.profile.address || "");
      setContactName(data.profile.contactName || "");
      setPrefs(data.notificationPreferences);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileSaving(true);
    try {
      await updateProfile({
        name,
        email,
        phone,
        address,
        contactName,
      });
      setProfileMsg("Profile updated.");
      await load();
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");
    setPasswordSaving(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        setPasswordMsg("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(res.error);
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const savePrefs = async () => {
    if (!prefs) return;
    setPrefsSaving(true);
    setPrefsMsg("");
    try {
      await updateNotificationPreferences(prefs);
      setPrefsMsg("Preferences saved.");
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleLogoutSession = async (id: string) => {
    await logoutSession(id);
    await load();
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await logoutAllSessions();
      setLogoutAllOpen(false);
      await logout();
      router.push("/login");
    } finally {
      setLogoutAllLoading(false);
    }
  };

  if (loading || !settings || !prefs) {
    return (
      <div className="max-w-2xl space-y-6">
        <Card>
          <SkeletonForm />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader
          title="Institution profile"
          description="Details visible on your Rain account"
        />
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-16 w-16 rounded-2xl bg-hover flex items-center justify-center">
              <Building2 className="h-7 w-7 text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Institution logo</p>
              <p className="text-xs text-muted mt-0.5">
                Logo upload will be available when backend storage is connected
              </p>
              <Button type="button" variant="secondary" size="sm" className="mt-2" disabled>
                Upload logo
              </Button>
            </div>
          </div>
          <Input
            label="Institution name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Contact name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {profileMsg && (
            <p className="text-sm text-muted">{profileMsg}</p>
          )}
          <Button type="submit" loading={profileSaving}>
            Save profile
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <form onSubmit={savePassword} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            hint="At least 8 characters"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {passwordError && (
            <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">
              {passwordError}
            </p>
          )}
          {passwordMsg && (
            <p className="text-sm text-muted">{passwordMsg}</p>
          )}
          <Button type="submit" loading={passwordSaving}>
            Update password
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Notification preferences"
          description="Choose how you want to be notified"
        />
        <div className="space-y-3">
          {(
            [
              ["emailVerificationResults", "Email verification results"],
              ["emailEarnings", "Email earnings notifications"],
              ["emailTeamActivity", "Email team activity"],
              ["emailLowBalance", "Email low balance alerts"],
              ["inAppNotifications", "In-app notifications"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-hover cursor-pointer"
            >
              <span className="text-sm text-foreground">{label}</span>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) =>
                  setPrefs((p) => (p ? { ...p, [key]: e.target.checked } : p))
                }
                className="h-4 w-4 rounded accent-ink"
              />
            </label>
          ))}
        </div>
        {prefsMsg && (
          <p className="mt-3 text-sm text-muted">{prefsMsg}</p>
        )}
        <Button className="mt-4" onClick={savePrefs} loading={prefsSaving}>
          Save preferences
        </Button>
      </Card>

      <Card>
        <CardHeader
          title="Login sessions"
          description="Devices currently signed in to your account"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLogoutAllOpen(true)}
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out all
            </Button>
          }
        />
        <div className="space-y-1">
          {settings.sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-hover/50"
            >
              <div className="h-9 w-9 rounded-xl bg-hover flex items-center justify-center shrink-0">
                <Monitor className="h-4 w-4 text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink truncate">
                    {s.device}
                  </p>
                  {s.current && <Badge tone="strong">Current</Badge>}
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {s.location} · {s.ipAddress} · {formatRelative(s.lastActiveAt)}
                </p>
              </div>
              {!s.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLogoutSession(s.id)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <ConfirmDialog
        open={logoutAllOpen}
        onClose={() => setLogoutAllOpen(false)}
        onConfirm={handleLogoutAll}
        loading={logoutAllLoading}
        title="Log out all sessions?"
        description="You will be signed out on every device, including this one."
        confirmLabel="Log out all"
        danger
      />
    </div>
  );
}
