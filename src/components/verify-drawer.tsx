"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatNaira } from "@/lib/format";
import { verifyUser } from "@/services/verification";
import type { IdentifierType } from "@/types";
import {
  IDENTIFIER_TYPES,
  NIGERIAN_BANKS,
  VERIFICATION_COST,
} from "@/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface VerifyDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function VerifyDrawer({ open, onClose }: VerifyDrawerProps) {
  const router = useRouter();
  const [idType, setIdType] = useState<IdentifierType>("account_number");
  const [identifier, setIdentifier] = useState("");
  const [bank, setBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyUser({
        identifierType: idType,
        identifier,
        bankCode: bank || undefined,
      });
      if (result.status === "success") {
        setIdentifier("");
        onClose();
        router.push(`/verify?ref=${result.data.reference}`);
      } else if (result.status === "insufficient_balance") {
        setError(
          `Insufficient balance (${formatNaira(result.balance)}). Cost is ${formatNaira(result.cost)}.`
        );
      } else {
        setError(result.message);
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify User"
      description={`Check a user across the Rain network · ${formatNaira(VERIFICATION_COST)} per check`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Select
          label="Identifier type"
          value={idType}
          onChange={(e) => setIdType(e.target.value as IdentifierType)}
          options={IDENTIFIER_TYPES.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
        />
        {idType === "account_number" && (
          <Select
            label="Bank"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Select bank"
            options={NIGERIAN_BANKS.map((b) => ({ value: b, label: b }))}
          />
        )}
        <Input
          label="Identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={
            idType === "email"
              ? "user@example.com"
              : idType === "phone"
                ? "08012345678"
                : "Enter identifier"
          }
          required
        />
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-foreground"
          >
            {error}
          </div>
        )}
        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={
            !identifier.trim() || (idType === "account_number" && !bank)
          }
        >
          {loading ? "Verifying…" : "Verify User"}
        </Button>
        <p className="text-xs text-subtle leading-relaxed">
          The result opens as soon as the check completes. Your wallet is only
          charged for completed checks.
        </p>
      </form>
    </Modal>
  );
}
