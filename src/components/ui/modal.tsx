"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  size?: "sm" | "md" | "lg";
  /** When false, backdrop clicks do not call onClose (header X still does). */
  closeOnBackdropClick?: boolean;
  /** When false, Escape does not call onClose. */
  closeOnEscape?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  contentClassName,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  const sizes = {
    sm: "sm:w-[min(calc(100vw-16px),24rem)]",
    md: "sm:w-[min(calc(100vw-16px),28rem)]",
    lg: "sm:w-[min(calc(100vw-16px),34rem)]",
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden
      />
      {/* Floating bottom sheet on mobile; floating right drawer from sm up —
          both inset from the edges like the app shell */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "absolute bottom-2 left-2 right-2 top-auto flex max-h-[85dvh] flex-col",
          "sm:bottom-2.5 sm:left-auto sm:right-2.5 sm:top-2.5 sm:max-h-none",
          "bg-surface rounded-2xl border border-line overflow-hidden",
          "shadow-[0_1px_2px_rgba(20,10,15,0.06),0_24px_64px_-16px_rgba(10,5,8,0.55)]",
          "animate-panel-in",
          sizes[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2 shrink-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-ink tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-hover text-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-2",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading,
  danger,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
