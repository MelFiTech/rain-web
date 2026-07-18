import type { ConfidenceInfo, ConfidenceLevel } from "@/types";

export function getConfidenceLevel(sourceCount: number): ConfidenceLevel {
  if (sourceCount >= 10) return "very_high";
  if (sourceCount >= 5) return "high";
  if (sourceCount >= 2) return "medium";
  return "low";
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
  const labels: Record<ConfidenceLevel, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    very_high: "Very High",
  };
  return labels[level];
}

export function buildConfidence(sourceCount: number): ConfidenceInfo {
  const level = getConfidenceLevel(sourceCount);
  const label = getConfidenceLabel(level);
  const institutions =
    sourceCount === 1
      ? "1 independent institution"
      : `${sourceCount} independent institutions`;

  return {
    level,
    independentSourceCount: sourceCount,
    label,
    description: `${label} confidence — reported by ${institutions}.`,
  };
}
