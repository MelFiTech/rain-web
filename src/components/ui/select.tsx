"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  variant?: "filled" | "outline" | "ghost";
  fieldSize?: "md" | "sm";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options,
      placeholder,
      id,
      variant = "filled",
      fieldSize = "md",
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    return (
      // Width overrides ride on the wrapper so the chevron stays inside the field
      <div className={cn(!className && "w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full text-foreground text-sm transition-colors appearance-none",
              "focus:outline-none cursor-pointer",
              fieldSize === "sm"
                ? "h-9 pl-3 pr-8 rounded-lg"
                : "h-11 pl-3.5 pr-9 rounded-xl",
              variant === "filled"
                ? "bg-hover focus:bg-active"
                : variant === "ghost"
                  ? "bg-transparent border border-transparent text-muted hover:text-foreground hover:bg-hover/60 focus:border-line"
                  : "bg-card border border-line hover:bg-hover/50 focus:border-subtle",
              error && "ring-1 ring-subtle"
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-subtle",
              fieldSize === "sm" ? "right-2.5 h-3.5 w-3.5" : "right-3 h-4 w-4"
            )}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-muted">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
