"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RainMark } from "@/components/ui/logo";
import { setSession } from "@/lib/session";
import { acceptInvite, previewInvite } from "@/services/invites";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import type { AuthSession } from "@/types";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof previewInvite>
  > | null>(null);
  const [loadError, setLoadError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token.trim()) {
      setLoadError("Missing invitation token.");
      return;
    }
    void previewInvite(token).then((p) => {
      if (!p) setLoadError("This invitation is invalid or has expired.");
      else setPreview(p);
    });
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result = await acceptInvite({
      token,
      password,
      confirmPassword,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (result.session) {
      setSession(result.session as AuthSession, true);
      router.replace("/dashboard");
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <RainMark className="h-8 w-8" />
          <span className="font-geist text-xl font-semibold text-ink">Rain</span>
        </div>

        {loadError ? (
          <div>
            <h1 className="text-2xl font-semibold text-ink">Invalid invitation</h1>
            <p className="mt-2 text-sm text-muted">{loadError}</p>
            <Link href="/login" className="mt-6 inline-block text-sm text-primary">
              Go to sign in
            </Link>
          </div>
        ) : !preview ? (
          <p className="text-sm text-muted">Loading invitation…</p>
        ) : done ? (
          <div>
            <h1 className="text-2xl font-semibold text-ink">Account ready</h1>
            <p className="mt-2 text-sm text-muted">
              Your password has been set. You can sign in to Rain.
            </p>
            <Link href="/login" className="mt-6 block">
              <Button className="w-full">Sign in</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-ink">
              {preview.kind === "onboarding"
                ? "Complete Rain setup"
                : "Accept team invitation"}
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {preview.kind === "onboarding" ? (
                <>
                  Set a password for <strong>{preview.institutionName}</strong>.
                </>
              ) : (
                <>
                  Join <strong>{preview.institutionName}</strong> as{" "}
                  <strong>{preview.role}</strong>.
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-muted">
              {preview.name} · {preview.email}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input
                variant="outline"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                variant="outline"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>
                {preview.kind === "onboarding"
                  ? "Create account"
                  : "Join team"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
