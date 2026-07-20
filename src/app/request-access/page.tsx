"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RainMark } from "@/components/ui/logo";
import Link from "next/link";
import { FormEvent, useState } from "react";

/* Only company-domain emails are accepted — requests from personal
   mailboxes can't be tied to an institution */
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

/* Request access — institutions apply before they can sign in. Mirrors the
   sign-in screen: inset surface container over the halftone dark stage. */
export default function RequestAccessPage() {
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cac, setCac] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const complete =
    companyName.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    cac.trim();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isCompanyEmail(email)) {
      setError(
        "Use your company email address — personal domains like Gmail or Yahoo aren't accepted."
      );
      return;
    }
    setError("");
    setLoading(true);
    // No backend yet — acknowledge the request locally
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative h-screen flex overflow-hidden bg-[#0e0c0d]">
      {/* Endless halftone dots — oversized past every edge so the pattern
          clips mid-dot at the viewport and never shows a trailing gap */}
      <div className="absolute -inset-3.5 halftone" aria-hidden />

      {/* Left — request form, inset surface container like the app shell */}
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
                  Thanks, {firstName.trim()}. Our team will verify{" "}
                  {companyName.trim()} and reach out at {email.trim()} with
                  next steps.
                </p>
                <p className="mt-8 text-sm text-muted">
                  Already have access?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-ink hover:text-primary transition-colors"
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
                  Tell us about your institution — we verify every member
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
                    placeholder="e.g. PayNest Microfinance Bank"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      variant="outline"
                      label="First name"
                      name="given-name"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                    />
                    <Input
                      variant="outline"
                      label="Last name"
                      name="family-name"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>

                  <Input
                    variant="outline"
                    label="Company email"
                    type="email"
                    name="email"
                    autoComplete="work email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@institution.ng"
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
                    size="lg"
                    loading={loading}
                    disabled={!complete}
                  >
                    {loading ? "Submitting…" : "Request access"}
                  </Button>
                </form>

                <Link href="/login" className="mt-3 block">
                  <Button type="button" variant="secondary" className="w-full" size="lg">
                    Sign in
                  </Button>
                </Link>
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
