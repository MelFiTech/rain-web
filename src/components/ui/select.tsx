"use client";

import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, placeholder, id, ...props },
    ref
  ) => {
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
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-11 px-3.5 rounded-xl bg-hover text-foreground text-sm transition-colors appearance-none",
            "focus:outline-none focus:bg-active cursor-pointer",
            error && "ring-1 ring-neutral-400",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-neutral-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
