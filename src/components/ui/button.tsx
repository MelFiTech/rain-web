"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "rounded-full text-white bg-gradient-to-b from-[#f2679e] to-[#d63f7c] ring-1 ring-black/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_2px_rgba(0,0,0,0.15),0_2px_10px_-2px_rgba(234,76,137,0.55)] hover:from-[#f47bab] hover:to-[#e04a86] active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100",
  secondary: "bg-hover text-ink hover:bg-active disabled:text-subtle",
  ghost: "bg-transparent text-foreground hover:bg-hover disabled:text-subtle",
  danger:
    "bg-ink text-background hover:opacity-85 disabled:bg-active disabled:text-subtle",
};

// Primary carries its own pill radius; the rest round by size
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const radii: Record<Size, string> = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed",
          variant !== "primary" && radii[size],
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
