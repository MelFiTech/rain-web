import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "muted" | "strong" | "soft";
}

export function Badge({ children, className, tone = "default" }: BadgeProps) {
  const tones = {
    default: "bg-hover text-foreground",
    muted: "bg-transparent text-muted",
    strong: "bg-ink text-white",
    soft: "bg-neutral-100 text-neutral-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
