"use client";

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full min-h-[100px] px-3.5 py-3 rounded-xl bg-hover text-foreground placeholder:text-subtle text-sm transition-colors resize-y",
            "focus:outline-none focus:bg-active",
            error && "ring-1 ring-neutral-400",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-neutral-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
