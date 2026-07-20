"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/contexts/auth-context";
import { formatDateTime, formatNaira } from "@/lib/format";
import {
  approveEarningsWithdrawal,
  listEarningsWithdrawals,
  rejectEarningsWithdrawal,
  type EarningsWithdrawalAdminRecord,
} from "@/services/admin-earnings-withdrawals";
import { maskAccountNumber } from "@/services/earnings";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AdminEarningsWithdrawalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<EarningsWithdrawalAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending_approval");
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEarningsWithdrawals(
        filter === "all" ? undefined : filter,
      );
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && user && !user.isPlatformAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.isPlatformAdmin) void load();
  }, [user, load]);

  const approve = async (id: string) => {
    setActingId(id);
    setMessage("");
    const result = await approveEarningsWithdrawal(id);
    setActingId(null);
    if (!result.success) {
      setMessage(result.error ?? "Approve failed.");
      return;
    }
    setMessage(
      "Approved. Payout queued. Monnify transfer runs within the configured 1 to 2 hour window.",
    );
    void load();
  };

  const reject = async (id: string) => {
    const reason = window.prompt("Rejection reason (optional):") ?? undefined;
    setActingId(id);
    setMessage("");
    const result = await rejectEarningsWithdrawal(id, reason);
    setActingId(null);
    if (!result.success) {
      setMessage(result.error ?? "Reject failed.");
      return;
    }
    setMessage("Rejected. Earnings returned to the institution.");
    void load();
  };

  if (authLoading || !user?.isPlatformAdmin) {
    return <div className="p-8 text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings withdrawals"
        description="Review bank payout requests from institutions. Approve to queue Monnify transfer (typically within 1–2 hours after approval)."
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            "pending_approval",
            "queued",
            "processing",
            "completed",
            "rejected",
            "failed",
            "all",
          ] as const
        ).map((s) => (
          <Button
            key={s}
            type="button"
            variant={filter === s ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === "all"
              ? "All"
              : s === "pending_approval"
                ? "Pending approval"
                : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {message && <p className="text-sm text-primary">{message}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading withdrawals…</p>
      ) : rows.length === 0 ? (
        <Card className="p-6 text-sm text-muted">No withdrawals in this view.</Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Card className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-ink">{r.institutionName}</h2>
                    <Badge tone="soft">{r.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {formatNaira(r.amount)} · {r.institutionEmail}
                  </p>
                  {r.settlementBank && (
                    <p className="text-xs text-muted mt-1">
                      {r.settlementBank.bankName} · {r.settlementBank.accountName}{" "}
                      · {maskAccountNumber(r.settlementBank.accountNumber)}
                    </p>
                  )}
                  <p className="text-xs text-muted mt-1">
                    Requested {formatDateTime(r.createdAt)}
                    {r.reviewedAt && (
                      <>
                        {" "}
                        · Reviewed {formatDateTime(r.reviewedAt)}
                        {r.reviewedByEmail ? ` by ${r.reviewedByEmail}` : ""}
                      </>
                    )}
                  </p>
                  {r.rejectionReason && (
                    <p className="text-xs text-destructive mt-1">
                      {r.rejectionReason}
                    </p>
                  )}
                </div>
                {r.status === "pending_approval" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      loading={actingId === r.id}
                      onClick={() => approve(r.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={actingId === r.id}
                      onClick={() => reject(r.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
