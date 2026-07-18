"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: "filled" | "outline";
  fieldSize?: "md" | "sm";
  /** Width/layout overrides for the outer wrapper (className styles the input itself) */
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      variant = "filled",
      fieldSize = "md",
      containerClassName,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full text-foreground placeholder:text-subtle text-sm transition-colors",
            fieldSize === "sm" ? "h-9 px-3 rounded-lg" : "h-11 px-3.5 rounded-xl",
            variant === "filled"
              ? "bg-hover focus:outline-none focus:bg-active"
              : "bg-card border border-line hover:bg-hover/50 focus:outline-none focus:border-subtle",
            error && "ring-1 ring-subtle",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-muted">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
