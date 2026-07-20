"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { formatNaira } from "@/lib/format";
import {
  fetchPlatformPricing,
  updateWalletFundingFee,
} from "@/services/pricing";
import type { PlatformPricing } from "@/services/pricing";
import { FormEvent, useEffect, useState } from "react";

export function PricingSettingsPanel() {
  const toast = useToast();
  const [pricing, setPricing] = useState<PlatformPricing | null>(null);
  const [feeInput, setFeeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchPlatformPricing().then((p) => {
      setPricing(p);
      setFeeInput(String(p.walletFundingFee));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fee = Number(feeInput);
    if (!Number.isFinite(fee) || fee < 0 || fee > 50_000) {
      toast.error("Fee must be between ₦0 and ₦50,000.");
      return;
    }
    setSaving(true);
    const result = await updateWalletFundingFee(fee);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setPricing(result.pricing);
    toast.success("Wallet funding fee updated.");
  };

  if (loading || !pricing) {
    return (
      <Card className="p-6 text-sm text-muted">Loading platform pricing…</Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">Verification cost</dt>
          <dd className="font-medium text-ink mt-0.5">
            {formatNaira(pricing.verificationCost)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Match reward</dt>
          <dd className="font-medium text-ink mt-0.5">
            {formatNaira(pricing.rewardAmount)}
          </dd>
        </div>
      </dl>

      <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-line">
        <Input
          variant="outline"
          label="Wallet funding fee (₦)"
          type="number"
          min={0}
          max={50000}
          value={feeInput}
          onChange={(e) => setFeeInput(e.target.value)}
        />
        <Button type="submit" loading={saving}>
          Save funding fee
        </Button>
      </form>
    </Card>
  );
}
