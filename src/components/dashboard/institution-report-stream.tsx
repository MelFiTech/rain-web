"use client";

import { CheckUserSheet } from "@/components/dashboard/check-user-sheet";
import { Button } from "@/components/ui/button";
import { categoryLabel, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createNetworkReportEvent } from "@/services/mock-data";
import type { NetworkReportEvent } from "@/types";
import { useEffect, useState } from "react";

const MAX_VISIBLE = 10;
const LIVE_INTERVAL_MS = 9_000;

interface InstitutionReportStreamProps {
  initialEvents: NetworkReportEvent[];
  live?: boolean;
  compact?: boolean;
}

export function InstitutionReportStream({
  initialEvents,
  live = true,
  compact = false,
}: InstitutionReportStreamProps) {
  const [events, setEvents] = useState(initialEvents);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [checkReport, setCheckReport] = useState<NetworkReportEvent | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      const next = createNetworkReportEvent();
      setEvents((prev) => [next, ...prev].slice(0, MAX_VISIBLE));
      setHighlightId(next.id);
      window.setTimeout(() => setHighlightId(null), 2400);
    }, LIVE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [live]);

  const openCheck = (event: NetworkReportEvent) => {
    setCheckReport(event);
    setSheetOpen(true);
  };

  const closeCheck = () => {
    setSheetOpen(false);
  };

  if (events.length === 0) {
    return (
      <p className="px-3 py-8 text-sm text-muted text-center">
        No network reports yet.
      </p>
    );
  }

  return (
    <>
      <div
        className={cn(
          "space-y-0.5 px-1 sm:px-1.5",
          compact
            ? "max-h-[148px] overflow-hidden"
            : "max-h-[min(380px,52vh)] overflow-y-auto overscroll-contain no-scrollbar"
        )}
        aria-live="polite"
        aria-label="Live network report stream"
      >
        {events.map((event) => (
          <StreamRow
            key={event.id}
            event={event}
            isNew={event.id === highlightId}
            onCheckUser={() => openCheck(event)}
          />
        ))}
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
  isNew,
  onCheckUser,
}: {
  event: NetworkReportEvent;
  isNew: boolean;
  onCheckUser: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-2 py-2.5 rounded-xl transition-colors hover:bg-hover",
        isNew && "animate-fade-in bg-hover/70"
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
