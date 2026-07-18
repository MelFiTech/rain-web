"use client";

import { ConfidenceBadge } from "@/components/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonCards } from "@/components/ui/skeleton";
import {
  categoryLabel,
  formatDate,
  formatDateTime,
  formatNaira,
} from "@/lib/format";
import { fetchDashboard } from "@/services/dashboard";
import { verifyUser } from "@/services/verification";
import type {
  DashboardSummary,
  IdentifierType,
  VerificationRecord,
} from "@/types";
import {
  IDENTIFIER_TYPES,
  NIGERIAN_BANKS,
  VERIFICATION_COST,
} from "@/types";
import {
  ArrowRight,
  Banknote,
  ClipboardList,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quick verify
  const [idType, setIdType] = useState<IdentifierType>("account_number");
  const [identifier, setIdentifier] = useState("");
  const [bank, setBank] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await fetchDashboard();
      setData(summary);
    } catch {
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleQuickVerify = async (e: FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifying(true);
    try {
      const result = await verifyUser({
        identifierType: idType,
        identifier,
        bankCode: bank || undefined,
      });
      if (result.status === "success") {
        router.push(`/verify?ref=${result.data.reference}`);
      } else if (result.status === "insufficient_balance") {
        setVerifyError(
          `Insufficient balance (${formatNaira(result.balance)}). Cost is ${formatNaira(result.cost)}.`
        );
      } else {
        setVerifyError(result.message);
      }
    } catch {
      setVerifyError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={4} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <p className="text-sm text-muted">{error || "No data"}</p>
        <Button className="mt-4" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }

  const stats = [
    {
      label: "Wallet balance",
      value: formatNaira(data.walletBalance),
      icon: Wallet,
      href: "/wallet",
    },
    {
      label: "Total verifications",
      value: data.totalVerifications.toLocaleString(),
      icon: Search,
      href: "/history",
    },
    {
      label: "Users reported",
      value: data.usersReported.toLocaleString(),
      icon: ClipboardList,
      href: "/reports",
    },
    {
      label: "Total earnings",
      value: formatNaira(data.totalEarnings),
      icon: Banknote,
      href: "/earnings",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:bg-hover/40 transition-colors h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-hover flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader
            title="Quick verification"
            description={`Cost: ${formatNaira(VERIFICATION_COST)} per check`}
          />
          <form onSubmit={handleQuickVerify} className="space-y-3">
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
            {verifyError && (
              <p className="text-sm text-muted bg-hover rounded-xl px-3 py-2">
                {verifyError}
              </p>
            )}
            <Button type="submit" className="w-full" loading={verifying}>
              Verify User
            </Button>
          </form>
        </Card>

        <Card className="xl:col-span-2" padding="md">
          <CardHeader
            title="Recent verifications"
            action={
              <Link
                href="/history"
                className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="space-y-1">
            {data.recentVerifications.map((v) => (
              <VerificationRow key={v.id} record={v} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Recent reports"
            action={
              <Link
                href="/reports"
                className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="space-y-1">
            {data.recentReports.map((r) => (
              <Link
                key={r.id}
                href={`/reports?id=${r.id}`}
                className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-hover transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {r.maskedAccountNumber ||
                      r.maskedPhone ||
                      r.maskedEmail ||
                      r.fullName ||
                      r.reference}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {categoryLabel(r.category)} · {formatDate(r.submittedAt)}
                  </p>
                </div>
                <ConfidenceBadge confidence={r.confidence} />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent earnings"
            description="₦20 when your report contributes to a verification"
            action={
              <Link
                href="/earnings"
                className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="space-y-1">
            {data.recentEarnings.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-hover/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {e.maskedIdentifier}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {e.reportReference} · {formatDate(e.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink tabular-nums">
                  +{formatNaira(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function VerificationRow({ record }: { record: VerificationRecord }) {
  return (
    <Link
      href={`/history?id=${record.id}`}
      className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-hover transition-colors"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink truncate">
            {record.maskedIdentifier}
          </p>
          <Badge tone={record.result === "match" ? "strong" : "soft"}>
            {record.result === "match" ? "Match" : "No match"}
          </Badge>
        </div>
        <p className="text-xs text-muted mt-0.5">
          {formatNaira(record.amountCharged)} ·{" "}
          {formatDateTime(record.createdAt)}
        </p>
      </div>
      {record.confidence ? (
        <ConfidenceBadge confidence={record.confidence} />
      ) : (
        <span className="text-xs text-subtle">—</span>
      )}
    </Link>
  );
}
