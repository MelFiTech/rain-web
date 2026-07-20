"use client";

import { Skeleton, SkeletonCards, SkeletonTable } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type WalletSkeletonTab = "wallet" | "earnings";

function WalletTabsSkeleton({ active }: { active: WalletSkeletonTab }) {
  return (
    <div className="flex items-center gap-1.5">
      <Skeleton
        className={cn(
          "h-9 w-16 rounded-lg shrink-0",
          active === "wallet" ? "opacity-100" : "opacity-55"
        )}
      />
      <Skeleton
        className={cn(
          "h-9 w-[5.5rem] rounded-lg shrink-0",
          active === "earnings" ? "opacity-100" : "opacity-55"
        )}
      />
    </div>
  );
}

export function WalletPageSkeleton({ tab = "wallet" }: { tab?: WalletSkeletonTab }) {
  return (
    <div className="space-y-6">
      <WalletTabsSkeleton active={tab} />
      {tab === "earnings" ? (
        <>
          <SkeletonCards count={4} />
          <SkeletonTable rows={5} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full rounded-2xl lg:col-span-2" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <SkeletonTable rows={5} />
        </>
      )}
    </div>
  );
}
