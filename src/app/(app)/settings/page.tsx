"use client";

import { SettlementBankSettingsPanel } from "@/components/settings/settlement-bank-settings-panel";
import { ApiKeySettingsPanel } from "@/components/settings/api-key-settings-panel";
import { TeamSettingsPanel } from "@/components/settings/team-settings-panel";
import { WebhooksSettingsPanel } from "@/components/settings/webhooks-settings-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  parseSettingsSkeletonTab,
  SettingsSkeleton,
  ApiKeySettingsCardSkeleton,
  NotificationsSettingsCardSkeleton,
  ProfileSettingsCardSkeleton,
  SessionsListCardSkeleton,
  SettlementSettingsCardSkeleton,
  WebhooksSettingsCardSkeleton,
} from "@/components/settings/settings-skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { ApiRequestError } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { canManageIntegrationSettings } from "@/lib/integration-roles";
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
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";

type SettingsTab =
  | "profile"
  | "notifications"
  | "security"
  | "team"
  | "settlement"
  | "integrations";

const TAB_IDS: SettingsTab[] = [
  "profile",
  "notifications",
  "security",
  "team",
  "settlement",
  "integrations",
];

function parseTab(value: string | null): SettingsTab {
  if (value && TAB_IDS.includes(value as SettingsTab)) {
    return value as SettingsTab;
  }
  return "profile";
}

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "team", label: "Team" },
  { id: "settlement", label: "Settlement bank" },
  { id: "integrations", label: "API & webhooks" },
];

/* Two-column settings row: sticky context on the left, the card fills the rest */
function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-10 items-start">
      <div className="lg:sticky lg:top-0">
        <h3 className="text-base font-semibold text-ink tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 text-sm text-muted leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <SettingsSkeleton tab={parseSettingsSkeletonTab(null)} />
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<SettingsTab>(() =>
    parseTab(searchParams.get("tab"))
  );
  const { logout, user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);

  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  const canManageIntegration =
    !!user && canManageIntegrationSettings(user.role);

  const load = useCallback(async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
      setName(data.profile.name);
      setEmail(data.profile.email);
      setPhone(data.profile.phone || "");
      setAddress(data.profile.address || "");
      setContactName(data.profile.contactName || "");
      setPrefs(data.notificationPreferences);
    } catch (e) {
      if (!(e instanceof ApiRequestError && e.status === 401)) {
        toast.error(
          e instanceof Error ? e.message : "Could not load settings.",
        );
      }
    }
  }, [toast]);

  useEffect(() => {
    const inst = user?.institution;
    if (!inst || settings) return;
    setName((v) => v || inst.name);
    setEmail((v) => v || inst.email);
    setPhone((v) => v || inst.phone || "");
    setAddress((v) => v || inst.address || "");
    setContactName((v) => v || inst.contactName || "");
  }, [user?.institution, settings]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  const selectTab = (next: SettingsTab) => {
    setTab(next);
    router.replace(`/settings?tab=${next}`, { scroll: false });
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({
        name,
        email,
        phone,
        address,
        contactName,
      });
      toast.success("Profile updated.");
      await load();
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        toast.success("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error);
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const savePrefs = async () => {
    if (!prefs) return;
    setPrefsSaving(true);
    try {
      await updateNotificationPreferences(prefs);
      toast.success("Preferences saved.");
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

  const settingsReady = settings !== null;
  const prefsReady = prefs !== null;
  const profileFormReady = settingsReady || Boolean(user?.institution);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTab(t.id)}
            className={cn(
              "h-9 px-4 rounded-lg text-sm transition-colors cursor-pointer shrink-0",
              tab === t.id
                ? "bg-card border border-line text-ink font-medium"
                : "border border-transparent text-muted hover:text-foreground hover:bg-hover/60"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "team" && (
        <SettingsSection
          title="Team"
          description="Invite colleagues and control roles for your institution on Rain."
        >
          <TeamSettingsPanel />
        </SettingsSection>
      )}

      {tab === "settlement" && (
        <SettingsSection
          title="Settlement bank"
          description="Bank account for earnings payouts. Withdrawals to your bank always use this account."
        >
          {settingsReady ? (
            <SettlementBankSettingsPanel
              account={settings!.settlementBank}
              onUpdated={() => load()}
            />
          ) : (
            <SettlementSettingsCardSkeleton />
          )}
        </SettingsSection>
      )}

      {tab === "integrations" && (
        <>
          <SettingsSection
            title="API key"
            description={
              <>
                Authenticate server-to-server requests to the Rain API. Keep keys
                secret and rotate them if exposed.{" "}
                <Link
                  href="/docs"
                  className="text-primary hover:underline"
                >
                  Read the API docs
                </Link>
                .
              </>
            }
          >
            {settingsReady ? (
              <ApiKeySettingsPanel
                apiKey={settings!.developer.apiKey}
                canManage={canManageIntegration}
                onUpdated={() => load()}
              />
            ) : (
              <ApiKeySettingsCardSkeleton />
            )}
          </SettingsSection>

          <SettingsSection
            title="Webhooks"
            description="Rain POSTs signed events to your HTTPS endpoints when activity occurs on your account."
          >
            {settingsReady ? (
              <WebhooksSettingsPanel
                webhooks={settings!.developer.webhooks}
                canManage={canManageIntegration}
                onUpdated={() => load()}
              />
            ) : (
              <WebhooksSettingsCardSkeleton />
            )}
          </SettingsSection>
        </>
      )}

      {tab === "profile" && (
      <SettingsSection
        title="Institution profile"
        description="Details visible to other institutions on the Rain network."
      >
      {profileFormReady ? (
      <Card>
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
          <Button
            type="submit"
            loading={profileSaving}
            disabled={!name.trim() || !email.trim()}
          >
            Save profile
          </Button>
        </form>
      </Card>
      ) : (
        <ProfileSettingsCardSkeleton />
      )}
      </SettingsSection>
      )}

      {tab === "security" && (
      <SettingsSection
        title="Change password"
        description="Use at least 8 characters. You'll stay signed in on this device."
      >
      <Card>
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
          <Button
            type="submit"
            loading={passwordSaving}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update password
          </Button>
        </form>
      </Card>
      </SettingsSection>
      )}

      {tab === "notifications" && (
      <SettingsSection
        title="Notification preferences"
        description="Choose how Rain keeps you and your compliance team informed."
      >
      {prefsReady ? (
      <Card>
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
                className="checkbox"
              />
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={savePrefs} loading={prefsSaving}>
          Save preferences
        </Button>
      </Card>
      ) : (
        <NotificationsSettingsCardSkeleton />
      )}
      </SettingsSection>
      )}

      {tab === "security" && (
      <SettingsSection
        title="Login sessions"
        description="Devices currently signed in to your account."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLogoutAllOpen(true)}
            disabled={!settingsReady}
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out all
          </Button>
        }
      >
      {settingsReady ? (
      <Card>
        <div className="space-y-1">
          {settings!.sessions.map((s) => (
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
      ) : (
        <SessionsListCardSkeleton />
      )}
      </SettingsSection>
      )}

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
