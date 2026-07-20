"use client";

import { CardHeader } from "@/components/ui/card";
import { InstitutionReportStream } from "@/components/dashboard/institution-report-stream";
import type { NetworkReportEvent } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface LiveReportStreamCardProps {
  events: NetworkReportEvent[];
  live?: boolean;
  preview?: boolean;
}

function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok-fg opacity-35" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok-fg" />
      </span>
      <span>Live</span>
    </span>
  );
}

export function LiveReportStreamCard({
  events,
  live = true,
  preview = false,
}: LiveReportStreamCardProps) {
  return (
    <div className={preview ? "" : "py-4 sm:py-5"}>
      <CardHeader
        className="mb-3 px-3 sm:px-4"
        title="Network reports"
        action={
          <div className="flex shrink-0 items-center gap-4">
            <LiveIndicator />
            {preview ? (
              <span className="inline-flex items-center gap-1 text-sm text-muted">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </span>
            ) : (
              <Link
                href="/reports"
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        }
      />
      <InstitutionReportStream
        initialEvents={events}
        live={live}
        compact={preview}
      />
    </div>
  );
}
