"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("compliance@paynest.ng");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ email, password, rememberMe });
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-xl bg-ink text-white flex items-center justify-center font-semibold">
          R
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-[400px] animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white text-lg font-semibold mb-4">
            R
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Rain
          </h1>
          <p className="mt-1.5 text-sm text-muted text-center">
            Risk Analysis &amp; Intelligence Network
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ink tracking-tight mb-1">
            Sign in
          </h2>
          <p className="text-sm text-muted mb-6">
            Access your institution dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
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
                  className="h-4 w-4 rounded accent-ink"
                />
                <span className="text-sm text-muted">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                onClick={() =>
                  setError(
                    "Password reset is handled by your institution admin. Contact support if needed."
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl bg-hover px-4 py-3 text-sm text-foreground"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-subtle">
          Demo: compliance@paynest.ng / password123
        </p>
      </div>
    </div>
  );
}
