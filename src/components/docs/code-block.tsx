"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({
  title,
  children,
}: {
  title?: string;
  children: string;
}) {
  const text = children.trim();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-[#0a0909] text-[13px] leading-6 text-neutral-100 shadow-sm ring-1 ring-white/5">
      <div
        className={cn(
          "flex items-center gap-3 border-b border-white/10 px-3 py-2",
          !title && "justify-end"
        )}
      >
        {title ? (
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-neutral-400">
            {title}
          </span>
        ) : null}
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
          aria-label={copied ? "Copied" : "Copy code"}
          title={copied ? "Copied" : "Copy"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code>{text}</code>
      </pre>
    </div>
  );
}
