import { cn } from "@/lib/utils";

/** Fixed-height scroll area for dashboard verification / network report lists. */
export function dashboardListPanelClassName(
  compact: boolean,
  options?: { centered?: boolean }
) {
  const size = compact
    ? "h-[168px] min-h-[168px] max-h-[168px]"
    : "h-[min(380px,52vh)] min-h-[min(380px,52vh)] max-h-[min(380px,52vh)]";

  return cn(
    size,
    "px-1 sm:px-1.5",
    options?.centered
      ? "flex flex-col items-center justify-center overflow-hidden"
      : "space-y-0.5 overflow-y-auto overscroll-contain no-scrollbar pb-1"
  );
}
