import { cn } from "@/lib/utils";
import type { ConfidenceInfo, ConfidenceLevel } from "@/types";

const levelStyles: Record<ConfidenceLevel, string> = {
  low: "bg-hover text-muted",
  medium: "bg-info-bg text-info-fg",
  high: "bg-warn-bg text-warn-fg",
  very_high: "bg-bad-bg text-bad-fg",
};

interface ConfidenceBadgeProps {
  confidence: ConfidenceInfo;
  showDescription?: boolean;
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  showDescription = false,
  className,
}: ConfidenceBadgeProps) {
  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-fit whitespace-nowrap",
          levelStyles[confidence.level]
        )}
      >
        {confidence.label}
        <span className="opacity-70">· {confidence.independentSourceCount}</span>
      </span>
      {showDescription && (
        <p className="text-xs text-muted leading-relaxed">
          {confidence.description}
        </p>
      )}
    </div>
  );
}

export function ConfidenceText({ confidence }: { confidence: ConfidenceInfo }) {
  return (
    <p className="text-sm text-muted">
      <span className="font-medium text-foreground">{confidence.label}</span>
      {" confidence, reported by "}
      {confidence.independentSourceCount === 1
        ? "1 independent institution"
        : `${confidence.independentSourceCount} independent institutions`}
      .
    </p>
  );
}
