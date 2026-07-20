"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { maskAccountNumber } from "@/services/earnings";
import {
  confirmSettlementBankChange,
  initiateSettlementBankChangeOtp,
  resolveSettlementBankAccount,
  updateSettlementBank,
} from "@/services/settings";
import type { SettlementBankAccount } from "@/types";
import { NIGERIAN_BANKS } from "@/types";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SettlementBankSettingsPanelProps {
  account: SettlementBankAccount | null;
  onUpdated: () => Promise<void>;
}

export function SettlementBankSettingsPanel({
  account,
  onUpdated,
}: SettlementBankSettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(
    account?.accountNumber ?? ""
  );
  const [otp, setOtp] = useState("");
  const [otpRequestId, setOtpRequestId] = useState("");
  const [deliveryHint, setDeliveryHint] = useState("");
  const [resolved, setResolved] = useState(false);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setBankName(account?.bankName ?? "");
    setAccountNumber(account?.accountNumber ?? "");
    setAccountName("");
    setResolved(false);
  }, [account]);

  const resetForm = () => {
    setBankName(account?.bankName ?? "");
    setAccountNumber(account?.accountNumber ?? "");
    setAccountName("");
    setOtp("");
    setOtpRequestId("");
    setDeliveryHint("");
    setResolved(false);
    setStep("details");
    setError("");
  };

  const resolveAccount = async () => {
    setError("");
    setMsg("");
    setResolving(true);
    try {
      const res = await resolveSettlementBankAccount({
        bankName,
        accountNumber,
      });
      if (res.success) {
        setAccountName(res.accountName);
        setResolved(true);
      } else {
        setResolved(false);
        setAccountName("");
        setError(res.error);
      }
    } finally {
      setResolving(false);
    }
  };

  const submit = async () => {
    setError("");
    setMsg("");
    if (!resolved || !accountName) {
      setError("Resolve account details before saving.");
      return;
    }

    setSaving(true);
    try {
      if (!account) {
        const res = await updateSettlementBank({
          accountName,
          bankName,
          accountNumber,
        });
        if (res.success) {
          setMsg("Settlement account saved.");
          setOpen(false);
          resetForm();
          await onUpdated();
        } else {
          setError(res.error);
        }
        return;
      }

      if (step === "details") {
        const otpRes = await initiateSettlementBankChangeOtp();
        if (otpRes.success) {
          setOtpRequestId(otpRes.requestId);
          setDeliveryHint(otpRes.deliveryHint);
          setStep("otp");
          setMsg("OTP sent to your email for verification.");
        }
        return;
      }

      const confirmed = await confirmSettlementBankChange({
        requestId: otpRequestId,
        otp,
        accountName,
        bankName,
        accountNumber,
      });
      if (confirmed.success) {
        setMsg("Settlement account updated.");
        setOpen(false);
        resetForm();
        await onUpdated();
      } else {
        setError(confirmed.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        {!account ? (
          <div className="rounded-xl border border-dashed border-line px-4 py-5">
            <p className="text-sm font-medium text-ink">No settlement account yet</p>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              Add one bank account for withdrawals. This is the only payout
              account used for your institution.
            </p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              Setup settlement account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-line px-4 py-3 text-sm space-y-1">
              <p className="font-medium text-ink">Current account</p>
              <p className="text-muted">
                {account.accountName} · {account.bankName}
              </p>
              <p className="font-mono text-xs text-subtle">
                {maskAccountNumber(account.accountNumber)}
              </p>
              <p className="text-xs text-subtle pt-1">
                Updated {formatDateTime(account.updatedAt)}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Change settlement account
            </Button>
          </div>
        )}
        {msg && <p className="text-sm text-muted">{msg}</p>}
      </Card>

      <Modal
        open={open}
        onClose={() => {
          if (saving || resolving) return;
          setOpen(false);
          resetForm();
        }}
        title={account ? "Change settlement account" : "Setup settlement account"}
        description={
          step === "otp"
            ? `Enter the OTP sent to ${deliveryHint}.`
            : "Enter bank details, resolve account name, then save."
        }
      >
        <div className="space-y-4">
          {step === "details" && (
            <>
              <Select
                label="Bank name"
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  setResolved(false);
                  setAccountName("");
                }}
                placeholder="Select bank"
                options={NIGERIAN_BANKS.map((b) => ({ value: b, label: b }))}
              />
              <Input
                label="Account number"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setResolved(false);
                  setAccountName("");
                }}
                placeholder="10-digit NUBAN"
                inputMode="numeric"
                required
              />
              <Button
                type="button"
                variant="secondary"
                loading={resolving}
                disabled={!bankName || accountNumber.length < 10}
                onClick={resolveAccount}
              >
                Resolve account
              </Button>
              {resolved && accountName && (
                <div className="rounded-xl border border-line px-3 py-2.5 text-sm text-ink flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {accountName}
                </div>
              )}
            </>
          )}

          {step === "otp" && (
            <Input
              label="OTP code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              inputMode="numeric"
            />
          )}

          {error && (
            <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2">
            {step === "otp" && (
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setStep("details");
                  setOtp("");
                  setError("");
                }}
                disabled={saving}
              >
                Back
              </Button>
            )}
            <Button
              className="flex-1"
              loading={saving}
              disabled={
                step === "details"
                  ? !resolved || !accountName || !bankName || accountNumber.length < 10
                  : otp.length < 6
              }
              onClick={submit}
            >
              {step === "details"
                ? account
                  ? "Continue with OTP"
                  : "Save settlement account"
                : "Verify and save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
