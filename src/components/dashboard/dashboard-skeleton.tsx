import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-[18px] w-11 shrink-0 rounded-sm" />
      </div>
    </Card>
  );
}

function SectionHeaderSkeleton({
  titleWidth,
  description = false,
  action,
}: {
  titleWidth: string;
  description?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-3">
      <div>
        <Skeleton className={`h-4 ${titleWidth}`} />
        {description ? (
          <Skeleton className="mt-1.5 h-3 w-48 max-w-full" />
        ) : null}
      </div>
      {action}
    </div>
  );
}

function ListCardSkeleton({
  titleWidth = "w-36",
  rows = 5,
  withDescription = false,
  tallRows = false,
  showAction = true,
}: {
  titleWidth?: string;
  rows?: number;
  withDescription?: boolean;
  tallRows?: boolean;
  showAction?: boolean;
}) {
  return (
    <Card padding="none" className="py-4 sm:py-5">
      <div className="px-3 sm:px-4">
        <SectionHeaderSkeleton
          titleWidth={titleWidth}
          description={withDescription}
          action={
            showAction ? (
              <Skeleton className="h-4 w-14 shrink-0" />
            ) : undefined
          }
        />
      </div>
      <div className="space-y-0.5 px-1 sm:px-1.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-xl"
          >
            {tallRows ? (
              <>
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-40 max-w-full" />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Skeleton className="hidden h-3 w-10 sm:block" />
                  <Skeleton className="h-6 w-[4.5rem] rounded-full" />
                </div>
              </>
            ) : (
              <>
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4 max-w-[200px]" />
                  <Skeleton className="h-3 w-1/2 max-w-[140px]" />
                </div>
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3">
        <Card
          padding="none"
          className="relative flex flex-col overflow-hidden xl:col-span-2"
        >
          <div className="relative shrink-0 px-5 pt-5 sm:px-6 sm:pt-6">
            <SectionHeaderSkeleton
              titleWidth="w-40"
              description
              action={
                <Skeleton className="h-7 w-[11rem] shrink-0 rounded-full" />
              }
            />
            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-line px-3 py-2.5 space-y-2"
                >
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              ))}
            </div>
          </div>
          <CardContent className="relative flex min-h-[280px] flex-1 flex-col gap-3 px-3 pb-4 pt-0 sm:px-4 sm:pb-5">
            <Skeleton className="min-h-[240px] w-full flex-1 rounded-xl" />
            <div className="shrink-0 border-t border-line pt-3 space-y-1.5">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <SectionHeaderSkeleton titleWidth="w-36" description />
          <div className="space-y-4">
            <Skeleton className="h-[72px] w-full rounded-2xl" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-3.5 flex-1 max-w-[120px]" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
            <Skeleton className="h-[72px] w-full rounded-2xl" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListCardSkeleton titleWidth="w-40" rows={5} tallRows />
        <Card padding="none" className="py-4 sm:py-5">
          <div className="px-3 sm:px-4">
            <SectionHeaderSkeleton
              titleWidth="w-36"
              action={
                <div className="flex items-center gap-4 shrink-0">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-14" />
                </div>
              }
            />
          </div>
          <div className="space-y-0.5 px-1 sm:px-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-xl"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-full max-w-[240px]" />
                  <Skeleton className="h-3 w-40 max-w-full" />
                </div>
                <Skeleton className="h-3 w-10 shrink-0 hidden sm:block" />
                <Skeleton className="h-8 w-[5.5rem] shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
