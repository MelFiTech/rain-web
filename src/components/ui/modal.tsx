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
  size?: "sm" | "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative w-full bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto",
          sizes[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
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
        <div className="px-6 pb-6 pt-2">{children}</div>
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
