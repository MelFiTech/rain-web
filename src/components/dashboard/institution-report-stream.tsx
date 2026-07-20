"use client";

import { CheckUserSheet } from "@/components/dashboard/check-user-sheet";
import { dashboardListPanelClassName } from "@/components/dashboard/dashboard-list-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { categoryLabel, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NetworkReportEvent } from "@/types";
import { Radio } from "lucide-react";
import { useEffect, useState } from "react";

const MAX_VISIBLE = 10;

interface InstitutionReportStreamProps {
  initialEvents: NetworkReportEvent[];
  compact?: boolean;
}

export function InstitutionReportStream({
  initialEvents,
  compact = false,
}: InstitutionReportStreamProps) {
  const [events, setEvents] = useState(initialEvents);
  const [checkReport, setCheckReport] = useState<NetworkReportEvent | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setEvents(initialEvents.slice(0, MAX_VISIBLE));
  }, [initialEvents]);

  const openCheck = (event: NetworkReportEvent) => {
    setCheckReport(event);
    setSheetOpen(true);
  };

  const closeCheck = () => {
    setSheetOpen(false);
  };

  const isEmpty = events.length === 0;

  return (
    <>
      <div
        className={dashboardListPanelClassName(compact, { centered: isEmpty })}
        aria-live="polite"
        aria-label="Live network report stream"
      >
        {isEmpty ? (
          <EmptyState
            icon={Radio}
            title="No network reports yet"
            description={
              compact
                ? "Live reports from member institutions will appear here."
                : "Reports filed across the Rain network will show up here."
            }
            className="py-0"
          />
        ) : (
          events.map((event) => (
            <StreamRow
              key={event.id}
              event={event}
              onCheckUser={() => openCheck(event)}
            />
          ))
        )}
      </div>

      <CheckUserSheet
        open={sheetOpen}
        onClose={closeCheck}
        report={checkReport}
      />
    </>
  );
}

function StreamRow({
  event,
  onCheckUser,
}: {
  event: NetworkReportEvent;
  onCheckUser: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-2 py-2.5 rounded-xl transition-colors hover:bg-hover"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">
          {event.maskedIdentifier}
          <span className="font-normal text-muted"> · Reported by </span>
          <span className="font-normal text-ink">{event.institutionName}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted truncate">
          {categoryLabel(event.category)}
          <span className="text-subtle"> · </span>
          <span className="font-mono text-[11px] text-subtle">
            {event.reference}
          </span>
          <span className="text-subtle sm:hidden">
            {" "}
            · {formatRelative(event.submittedAt)}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="hidden text-xs text-subtle tabular-nums sm:block">
          {formatRelative(event.submittedAt)}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="whitespace-nowrap"
          onClick={onCheckUser}
        >
          Check user
        </Button>
      </div>
    </div>
  );
}
