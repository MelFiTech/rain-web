"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useToast } from "@/contexts/toast-context";
import {
  confirmApiKeyReveal,
  initiateApiKeyRevealOtp,
  rotateApiKey,
} from "@/services/settings";
import type { ApiKeyInfo } from "@/types";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable */
  }
}

interface ApiKeySettingsPanelProps {
  apiKey: ApiKeyInfo;
  canManage: boolean;
  onUpdated: () => Promise<void>;
}

export function ApiKeySettingsPanel({
  apiKey,
  canManage,
  onUpdated,
}: ApiKeySettingsPanelProps) {
  const toast = useToast();
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpRequestId, setOtpRequestId] = useState("");
  const [deliveryHint, setDeliveryHint] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpConfirming, setOtpConfirming] = useState(false);
  const [otpError, setOtpError] = useState("");

  const displayValue = visibleKey ?? apiKey.maskedKey;
  const isRevealed = visibleKey !== null;

  const handleRotate = async () => {
    setRotating(true);
    try {
      const { fullKey } = await rotateApiKey();
      setVisibleKey(fullKey);
      setRotateOpen(false);
      toast.success(
        "New API key created. Copy it now. It will not be shown again after you hide it.",
      );
      await onUpdated();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not rotate API key.",
      );
    } finally {
      setRotating(false);
    }
  };

  const sendRevealOtp = useCallback(async () => {
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await initiateApiKeyRevealOtp();
      if (!res.success) {
        setOtpError(res.error);
        return false;
      }
      setOtpRequestId(res.requestId);
      setDeliveryHint(res.deliveryHint);
      return true;
    } finally {
      setOtpSending(false);
    }
  }, []);

  const startReveal = async () => {
    if (isRevealed) {
      setVisibleKey(null);
      return;
    }
    setOtp("");
    setOtpError("");
    setOtpRequestId("");
    setDeliveryHint("");
    setOtpOpen(true);
    await sendRevealOtp();
  };

  const confirmReveal = async () => {
    const code = otp.replace(/\D/g, "").trim();
    if (code.length < 6) {
      setOtpError("Enter the 6-digit verification code.");
      return;
    }
    if (!otpRequestId) {
      setOtpError("Request a new code and try again.");
      return;
    }
    setOtpConfirming(true);
    setOtpError("");
    try {
      const res = await confirmApiKeyReveal({
        requestId: otpRequestId,
        otp: code,
      });
      if (!res.success) {
        setOtpError(res.error);
        return;
      }
      setVisibleKey(res.fullKey);
      setOtpOpen(false);
      toast.success("API key revealed.");
    } finally {
      setOtpConfirming(false);
    }
  };

  const closeOtpModal = () => {
    if (otpConfirming) return;
    setOtpOpen(false);
    setOtpError("");
  };

  return (
    <>
      <Card className="space-y-4">
        <div className="rounded-xl border border-line px-4 py-3 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <code className="text-sm font-mono text-ink break-all">
              {displayValue}
            </code>
            <div className="flex flex-wrap gap-2 shrink-0">
              {canManage && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={otpSending && !otpOpen}
                  onClick={startReveal}
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Reveal
                    </>
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!isRevealed}
                onClick={() => {
                  if (visibleKey) {
                    void copyText(visibleKey);
                    toast.success("API key copied.");
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
              {canManage && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setRotateOpen(true)}
                >
                  Rotate key
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted border-t border-line pt-3">
            <span>Created {formatDateTime(apiKey.createdAt)}</span>
            {apiKey.lastUsedAt ? (
              <span>Last used {formatRelative(apiKey.lastUsedAt)}</span>
            ) : (
              <span>Not used yet</span>
            )}
          </div>
        </div>
        {!canManage && (
          <p className="text-xs text-subtle leading-relaxed">
            Only administrators and developers can reveal or rotate the API key.
          </p>
        )}
        <p className="text-xs text-subtle leading-relaxed">
          Send{" "}
          <code className="text-muted">Authorization: Bearer YOUR_API_KEY</code>{" "}
          on API requests. Base URL:{" "}
          <code className="text-muted">https://api.rain.ng/v1</code>
        </p>
      </Card>

      <Modal
        open={otpOpen}
        onClose={closeOtpModal}
        title="Verify to reveal API key"
        description={
          otpSending
            ? "Sending a verification code to your email…"
            : deliveryHint
              ? `Enter the 6-digit code sent to ${deliveryHint}.`
              : "Enter the verification code from your email."
        }
        size="sm"
      >
        <div className="space-y-4">
          {otpSending ? (
            <p className="text-sm text-muted">Please wait…</p>
          ) : (
            <>
              <Input
                label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError("");
                }}
                placeholder="6-digit code"
                disabled={!otpRequestId}
              />
              {otpError ? (
                <p className="text-sm text-danger" role="alert">
                  {otpError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                loading={otpSending}
                disabled={otpConfirming}
                onClick={() => void sendRevealOtp()}
              >
                Resend code
              </Button>
              <Button
                className="w-full"
                loading={otpConfirming}
                onClick={() => void confirmReveal()}
                disabled={!otpRequestId || otp.length < 6}
              >
                Confirm and reveal
              </Button>
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={rotateOpen}
        onClose={() => setRotateOpen(false)}
        onConfirm={handleRotate}
        loading={rotating}
        title="Rotate API key?"
        description="The current key stops working immediately. Update any integrations using the old key."
        confirmLabel="Rotate key"
        danger
      />
    </>
  );
}
