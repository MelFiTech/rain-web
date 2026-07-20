"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RainMark } from "@/components/ui/logo";
import { useToast } from "@/contexts/toast-context";
import {
  isPasswordPolicyCompliant,
  PASSWORD_POLICY_MESSAGE,
} from "@/lib/password-policy";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { submitAccessRequest } from "@/services/access-request";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
]);

function isCompanyEmail(value: string) {
  const domain = value.trim().toLowerCase().split("@")[1];
  return !!domain && domain.includes(".") && !FREE_EMAIL_DOMAINS.has(domain);
}

export default function RequestAccessPage() {
  const toast = useToast();
  const [companyName, setCompanyName] = useState("");
  const [cac, setCac] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const complete =
    companyName.trim() && cac.trim() && email.trim() && password;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isCompanyEmail(email)) {
      toast.error(
        "Use your company email address. Personal domains like Gmail or Yahoo aren't accepted.",
      );
      return;
    }
    if (!isPasswordPolicyCompliant(password)) {
      toast.error(PASSWORD_POLICY_MESSAGE);
      return;
    }
    setLoading(true);
    const result = await submitAccessRequest({
      companyName: companyName.trim(),
      cacNumber: cac.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="relative h-screen flex overflow-hidden bg-[#0e0c0d]">
      <div className="absolute -inset-3.5 halftone" aria-hidden />

      <div className="relative flex-1 flex p-2 sm:p-2.5">
        <div className="flex-1 flex flex-col min-w-0 bg-surface rounded-2xl border border-line shadow-[0_1px_2px_rgba(20,10,15,0.03),0_12px_32px_-12px_rgba(20,10,15,0.08)] overflow-y-auto px-6 sm:px-12 py-8 sm:py-10 animate-fade-in">
          <div className="w-full max-w-[400px] mx-auto flex items-center gap-2.5">
            <RainMark className="h-8 w-8" />
            <span className="font-geist text-xl font-semibold tracking-tight text-ink">
              Rain
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center w-full max-w-[400px] mx-auto py-10">
            {submitted ? (
              <div className="animate-fade-in">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
                  <svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                </span>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
                  Request received
                </h1>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  We received your request for {companyName.trim()}. Our team
                  will verify your institution and email {email.trim()} when
                  your account is approved. Sign in with the password you chose.
                </p>
                <p className="mt-8 text-center text-sm text-muted">
                  Already have access?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
                  Request access
                </h1>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  Tell us about your institution. We verify every member
                  before they join the network.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <Input
                    variant="outline"
                    label="Company name"
                    name="company"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Microfinance Bank"
                    required
                  />

                  <Input
                    variant="outline"
                    label="Company CAC number"
                    name="cac"
                    value={cac}
                    onChange={(e) => setCac(e.target.value)}
                    placeholder="RC 0000000"
                    required
                  />

                  <Input
                    variant="outline"
                    label="Company email"
                    type="email"
                    name="email"
                    autoComplete="work email"
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
                      name="new-password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-[34px] p-1 text-muted hover:text-foreground cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <p className="text-xs text-muted leading-relaxed">
                      {PASSWORD_POLICY_MESSAGE}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={loading}
                    disabled={!complete}
                  >
                    {loading ? "Submitting…" : "Request access"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                  Already have access?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>

          <div className="w-full max-w-[400px] mx-auto flex items-center justify-center gap-4 text-xs text-muted">
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Support
            </span>
          </div>
        </div>
      </div>

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
