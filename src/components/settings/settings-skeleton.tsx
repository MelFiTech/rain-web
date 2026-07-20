"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type SettingsSkeletonTab =
  | "profile"
  | "notifications"
  | "security"
  | "team"
  | "settlement"
  | "integrations";

const TAB_WIDTHS = [
  "w-[4.5rem]",
  "w-[6.5rem]",
  "w-[4.75rem]",
  "w-12",
  "w-[5.5rem]",
  "w-[7.25rem]",
];

export function parseSettingsSkeletonTab(
  value: string | null
): SettingsSkeletonTab {
  const ids: SettingsSkeletonTab[] = [
    "profile",
    "notifications",
    "security",
    "team",
    "settlement",
    "integrations",
  ];
  if (value && ids.includes(value as SettingsSkeletonTab)) {
    return value as SettingsSkeletonTab;
  }
  return "profile";
}

function SettingsTabsSkeleton({ activeTab }: { activeTab: SettingsSkeletonTab }) {
  const activeIndex = [
    "profile",
    "notifications",
    "security",
    "team",
    "settlement",
    "integrations",
  ].indexOf(activeTab);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
      {TAB_WIDTHS.map((w, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-9 shrink-0 rounded-lg",
            w,
            i === activeIndex && "opacity-100",
            i !== activeIndex && "opacity-55"
          )}
        />
      ))}
    </div>
  );
}

function SettingsSectionSkeleton({
  descriptionLines = 2,
  showAction,
  children,
}: {
  descriptionLines?: number;
  showAction?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-10 items-start">
      <div className="lg:sticky lg:top-0 space-y-2">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-1.5 pt-0.5">
          {Array.from({ length: descriptionLines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", i === 0 ? "w-full max-w-[280px]" : "w-[220px]")}
            />
          ))}
        </div>
        {showAction && <Skeleton className="h-8 w-[6.5rem] rounded-lg mt-2" />}
      </div>
      {children}
    </div>
  );
}

function SkeletonField({ hint }: { hint?: boolean }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-11 w-full rounded-xl" />
      {hint && <Skeleton className="h-3 w-36" />}
    </div>
  );
}

function ProfileTabSkeleton() {
  return (
    <SettingsSectionSkeleton descriptionLines={2}>
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full max-w-[240px]" />
              <Skeleton className="h-8 w-24 rounded-lg mt-1" />
            </div>
          </div>
          <SkeletonField />
          <SkeletonField />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonField />
            <SkeletonField />
          </div>
          <SkeletonField />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </Card>
    </SettingsSectionSkeleton>
  );
}

function NotificationsTabSkeleton() {
  return (
    <SettingsSectionSkeleton descriptionLines={2}>
      <Card>
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl"
            >
              <Skeleton className={cn("h-4", i % 2 === 0 ? "w-44" : "w-52")} />
              <Skeleton className="h-4 w-4 shrink-0 rounded-[4px]" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-36 rounded-xl mt-4" />
      </Card>
    </SettingsSectionSkeleton>
  );
}

function SecurityTabSkeleton() {
  return (
    <>
      <SettingsSectionSkeleton descriptionLines={2}>
        <Card>
          <div className="space-y-4">
            <SkeletonField />
            <SkeletonField hint />
            <SkeletonField />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </Card>
      </SettingsSectionSkeleton>

      <SettingsSectionSkeleton descriptionLines={2} showAction>
        <Card>
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
              >
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-36" />
                    {i === 0 && (
                      <Skeleton className="h-5 w-14 rounded-full" />
                    )}
                  </div>
                  <Skeleton className="h-3 w-full max-w-[280px]" />
                </div>
                {i !== 0 && (
                  <Skeleton className="h-8 w-16 shrink-0 rounded-lg" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </SettingsSectionSkeleton>
    </>
  );
}

export function TeamMembersListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-3.5 rounded-xl"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44 max-w-full" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap pl-13 sm:pl-0">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-3 w-14 hidden md:block" />
            <div className="flex gap-1 ml-auto sm:ml-0">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-[5.5rem] rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamTabSkeleton() {
  return (
    <SettingsSectionSkeleton descriptionLines={2}>
      <Card>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full max-w-[260px]" />
          </div>
          <Skeleton className="h-10 w-24 shrink-0 rounded-full" />
        </div>
        <TeamMembersListSkeleton />
      </Card>
    </SettingsSectionSkeleton>
  );
}

function IntegrationsTabSkeleton() {
  return (
    <>
      <SettingsSectionSkeleton descriptionLines={3}>
        <Card className="space-y-4">
          <div className="rounded-xl border border-line px-4 py-3 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-full max-w-[220px]" />
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-8 w-[4.5rem] rounded-lg" />
                <Skeleton className="h-8 w-[5.5rem] rounded-lg" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 border-t border-line pt-3">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-3 w-full max-w-[420px]" />
        </Card>
      </SettingsSectionSkeleton>

      <SettingsSectionSkeleton descriptionLines={2}>
        <Card padding="none" className="py-4 sm:py-5">
          <div className="flex items-start justify-between gap-4 px-5 sm:px-6 mb-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full max-w-[280px]" />
            </div>
            <Skeleton className="h-8 w-[7.5rem] shrink-0 rounded-lg" />
          </div>
          <div className="space-y-0.5 px-2 sm:px-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="px-3 py-3.5 rounded-xl space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full max-w-[300px]" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-5 w-28 rounded-md" />
                </div>
                <Skeleton className="h-3 w-36" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-12 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </SettingsSectionSkeleton>
    </>
  );
}

function SettlementTabSkeleton() {
  return (
    <SettingsSectionSkeleton descriptionLines={2}>
      <Card>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full max-w-md" />
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </Card>
    </SettingsSectionSkeleton>
  );
}

function tabSkeletonContent(tab: SettingsSkeletonTab) {
  switch (tab) {
    case "notifications":
      return <NotificationsTabSkeleton />;
    case "security":
      return <SecurityTabSkeleton />;
    case "team":
      return <TeamTabSkeleton />;
    case "settlement":
      return <SettlementTabSkeleton />;
    case "integrations":
      return <IntegrationsTabSkeleton />;
    case "profile":
    default:
      return <ProfileTabSkeleton />;
  }
}

export function SettingsSkeleton({ tab = "profile" }: { tab?: SettingsSkeletonTab }) {
  return (
    <div className="space-y-8">
      <SettingsTabsSkeleton activeTab={tab} />
      {tabSkeletonContent(tab)}
    </div>
  );
}
