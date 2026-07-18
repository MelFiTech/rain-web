import { cn } from "@/lib/utils";
import type { ConfidenceInfo, ConfidenceLevel } from "@/types";

const levelStyles: Record<ConfidenceLevel, string> = {
  low: "bg-neutral-100 text-neutral-600",
  medium: "bg-neutral-200 text-neutral-700",
  high: "bg-neutral-800 text-white",
  very_high: "bg-ink text-white",
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
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium w-fit",
          levelStyles[confidence.level]
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            confidence.level === "low" && "bg-neutral-400",
            confidence.level === "medium" && "bg-neutral-500",
            confidence.level === "high" && "bg-white/70",
            confidence.level === "very_high" && "bg-white"
          )}
        />
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
      {" confidence — reported by "}
      {confidence.independentSourceCount === 1
        ? "1 independent institution"
        : `${confidence.independentSourceCount} independent institutions`}
      .
    </p>
  );
}
