import { cn } from "@/lib/utils";
import type { VerificationRecommendation } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldX,
} from "lucide-react";

const severityStyles: Record<
  VerificationRecommendation["severity"],
  { box: string; icon: string }
> = {
  none: {
    box: "border-line bg-hover",
    icon: "text-muted",
  },
  low: {
    box: "border-amber-200/80 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30",
    icon: "text-amber-700 dark:text-amber-400",
  },
  medium: {
    box: "border-amber-300/80 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/40",
    icon: "text-amber-800 dark:text-amber-300",
  },
  high: {
    box: "border-orange-300/80 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/30",
    icon: "text-orange-800 dark:text-orange-300",
  },
  critical: {
    box: "border-red-300/80 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40",
    icon: "text-red-800 dark:text-red-400",
  },
};

function RecommendationIcon({
  action,
  className,
}: {
  action: VerificationRecommendation["action"];
  className?: string;
}) {
  if (action === "proceed") {
    return <CheckCircle2 className={className} aria-hidden />;
  }
  if (action === "decline") {
    return <ShieldX className={className} aria-hidden />;
  }
  return <ShieldAlert className={className} aria-hidden />;
}

export function RecommendationPanel({
  recommendation,
  className,
  compact,
}: {
  recommendation: VerificationRecommendation;
  className?: string;
  compact?: boolean;
}) {
  const styles = severityStyles[recommendation.severity];

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        styles.box,
        compact && "p-3",
        className,
      )}
      role="status"
    >
      <div className="flex gap-3">
        <div className={cn("mt-0.5 shrink-0", styles.icon)}>
          {recommendation.severity === "critical" ||
          recommendation.severity === "high" ? (
            <AlertTriangle className="h-5 w-5" aria-hidden />
          ) : (
            <RecommendationIcon
              action={recommendation.action}
              className="h-5 w-5"
            />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{recommendation.title}</p>
            <span className="rounded-full bg-card/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              {recommendation.action.replace(/_/g, " ")}
            </span>
          </div>
          {!compact && (
            <p className="text-sm leading-relaxed text-muted">
              {recommendation.summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function recommendationActionLabel(
  recommendation: VerificationRecommendation,
): string {
  return recommendation.title;
}
