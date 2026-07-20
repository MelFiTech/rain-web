"use client";

import { CodeBlock } from "@/components/docs/code-block";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface DocCodeTab {
  id: string;
  label: string;
  code: string;
}

export function DocCodeTabs({
  heading = "Response",
  codeTitle = "201 Created",
  tabs,
  defaultTabId,
}: {
  heading?: string;
  codeTitle?: string;
  tabs: DocCodeTab[];
  defaultTabId?: string;
}) {
  const [active, setActive] = useState(defaultTabId ?? tabs[0]?.id ?? "");

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  if (!current) return null;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-ink">{heading}</span>
        <div
          className="inline-flex rounded-lg border border-line bg-card p-0.5"
          role="tablist"
          aria-label={heading}
        >
          {tabs.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  selected
                    ? "bg-hover text-ink"
                    : "text-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div role="tabpanel" className="mt-3">
        <CodeBlock title={codeTitle}>{current.code}</CodeBlock>
      </div>
    </div>
  );
}
