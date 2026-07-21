"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RainMark } from "@/components/ui/logo";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inactivityNotified, setInactivityNotified] = useState(false);

  useEffect(() => {
    if (inactivityNotified) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "inactivity") {
      setInactivityNotified(true);
      toast.error("You were signed out after a period of inactivity.");
      router.replace("/login", { scroll: false });
    }
  }, [inactivityNotified, router, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const submittedEmail = String(
      new FormData(form).get("email") ?? email,
    ).trim();
    const submittedPassword = String(
      new FormData(form).get("password") ?? password,
    );
    setLoading(true);
    try {
      const result = await login({
        email: submittedEmail,
        password: submittedPassword,
        rememberMe,
      });
      if (result.success) {
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RainMark className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div
      data-theme="dark"
      className="relative h-screen flex overflow-hidden bg-[#0e0c0d]"
    >
      {/* Endless halftone dots — oversized past every edge so the pattern
          clips mid-dot at the viewport and never shows a trailing gap */}
      <div className="absolute -inset-3.5 halftone" aria-hidden />

      {/* Left — sign-in form, inset surface container like the app shell */}
      <div className="relative flex-1 flex p-2 sm:p-2.5">
        <div className="flex-1 flex flex-col min-w-0 bg-surface rounded-2xl border border-line shadow-[0_1px_2px_rgba(20,10,15,0.03),0_12px_32px_-12px_rgba(20,10,15,0.08)] overflow-y-auto px-6 sm:px-12 py-8 sm:py-10 animate-fade-in">
        <div className="w-full max-w-[400px] mx-auto flex items-center gap-2.5">
          <RainMark className="h-8 w-8" />
          <span className="font-geist text-xl font-semibold tracking-tight text-ink">
            Rain
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full max-w-[400px] mx-auto py-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Sign in
          </h1>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Access your institution dashboard on Rain, the Risk Analysis
            &amp; Intelligence Network.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              variant="outline"
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.ng"
              required
            />

            <div className="relative">
              <Input
                variant="outline"
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[34px] p-1 text-muted hover:text-foreground cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm text-muted">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                onClick={() =>
                  toast.error(
                    "Password reset is handled by your institution admin. Contact support if needed.",
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={!email.trim() || !password}
            >
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New institution?{" "}
            <Link
              href="/request-access"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Request access
            </Link>
          </p>
        </div>

        </div>
      </div>

      {/* Right — testimonial (dots continue behind; soft shadow hugs the text only) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <figure className="relative max-w-xl px-10 text-center">
          <div
            className="absolute -inset-x-24 -inset-y-16"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(14,12,13,0.97) 30%, rgba(14,12,13,0.7) 58%, rgba(14,12,13,0) 78%)",
            }}
          />
          <blockquote className="relative font-geist text-lg xl:text-xl leading-snug text-white">
            &ldquo;Every fraudulent account we catch before onboarding saves us
            millions. Rain tells us in seconds what used to take weeks of
            back-and-forth between institutions.&rdquo;
          </blockquote>
          <figcaption className="relative mt-10 flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-xs font-semibold">
              AO
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-medium text-white">
                Adaeze Okafor
              </span>
              <span className="block text-sm text-white/50 mt-0.5">
                Head of Compliance, PayNest MFB
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
