"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/contexts/auth-context";
import {
  approveAccessRequest,
  listAccessRequests,
  rejectAccessRequest,
  type AccessRequestRecord,
} from "@/services/admin-access-requests";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AdminAccessRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<AccessRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAccessRequests(filter === "all" ? undefined : filter);
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
    const result = await approveAccessRequest(id);
    setActingId(null);
    if (!result.success) {
      setMessage(result.error ?? "Approve failed.");
      return;
    }
    setMessage("Approved. Institution can sign in with the password from their access request.");
    void load();
  };

  const reject = async (id: string) => {
    const reason = window.prompt("Rejection reason (optional):") ?? undefined;
    setActingId(id);
    setMessage("");
    const result = await rejectAccessRequest(id, reason);
    setActingId(null);
    if (!result.success) {
      setMessage(result.error ?? "Reject failed.");
      return;
    }
    setMessage("Request rejected. Applicant notified by email.");
    void load();
  };

  if (authLoading || !user?.isPlatformAdmin) {
    return (
      <div className="p-8 text-sm text-muted">Loading…</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access requests"
        description="Review institutions applying to join the Rain network. Approving creates their institution and sends a setup link."
      />

      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <Button
            key={s}
            type="button"
            variant={filter === s ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {message && <p className="text-sm text-primary">{message}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading requests…</p>
      ) : rows.length === 0 ? (
        <Card className="p-6 text-sm text-muted">No requests in this view.</Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Card className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-ink">{r.companyName}</h2>
                    <Badge tone="soft">{r.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {r.email} · CAC {r.cacNumber}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    CAC {r.cacNumber} · Submitted {formatDateTime(r.createdAt)}
                  </p>
                  {r.rejectionReason && (
                    <p className="text-xs text-muted mt-1">
                      Reason: {r.rejectionReason}
                    </p>
                  )}
                </div>
                {r.status === "pending" && (
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
