"use client";

import { RainMark } from "@/components/ui/logo";
import { LandingDashboardPreview } from "@/components/landing/landing-dashboard-preview";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Scroll helpers                                                      */
/* ------------------------------------------------------------------ */

/* Fade-and-rise reveal once the element enters the viewport */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* Interfere-style quote: words light up as the section scrolls through */
function QuoteReveal({ text }: { text: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the quote enters the lower third, 1 by the time it reaches the upper third
        const p = (vh * 0.75 - rect.top) / (vh * 0.55);
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const words = text.split(" ");
  const lit = Math.floor(progress * words.length);

  return (
    <blockquote
      ref={ref}
      className="font-geist text-[26px] sm:text-[30px] lg:text-[34px] leading-[1.4] text-white text-center"
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="transition-opacity duration-300"
          style={{ opacity: i <= lit ? 1 : 0.2 }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </blockquote>
  );
}

/* Zoomed app screenshot pinned to the right — the content-rich left edge stays
   crisp while it dissolves into the page on its right and bottom as it runs
   off the viewport, Interfere-style. */
function FeatureShot({
  src,
  alt,
  shiftX = "0%",
  imgW = "150%",
  tall = false,
}: {
  src: string;
  alt: string;
  /** Horizontal offset so the meaningful content fills the crop */
  shiftX?: string;
  /** Display width — compensates for captures taken at narrower windows so
      the app UI renders at the same scale across shots */
  imgW?: string;
  /** Taller crop with the bottom fade pushed lower — more app visible */
  tall?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden lg:-mr-[16vw]",
        tall ? "h-[440px] sm:h-[540px]" : "h-[400px] sm:h-[460px]"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* On mobile the shot renders at 250% of the narrow container so it
          still overflows the bottom edge — otherwise the fade has nothing
          to dissolve and the image hard-stops above it */}
      <img
        src={src}
        alt={alt}
        className="absolute top-0 h-auto w-[250%] max-w-none rounded-2xl ring-1 ring-black/[0.06] shadow-[0_30px_70px_-30px_rgba(15,25,50,0.3)] sm:w-[var(--imgw)]"
        style={
          { left: shiftX, "--imgw": imgW } as React.CSSProperties
        }
      />
      {/* Dissolve into the page on the right and bottom edges */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) ${tall ? 12 : 24}%), linear-gradient(to left, #ffffff 0%, rgba(255,255,255,0) 26%)`,
        }}
      />
    </div>
  );
}

/* Bank-logo artwork sliced into hoverable tiles. Each tile is a cropped
   window onto the same PNG (pixel boxes measured against the 2000×733
   source), so the assembled grid is indistinguishable from the flat image —
   but every icon lifts individually on hover. The reflection strip at the
   bottom is a static slice, so a lifted icon leaves its reflection behind. */
const BANK_ART = { w: 2000, h: 733, src: "/landing/network-icons.png" };
/* Extra art-space pushed between the rows at layout time, so a hovering
   tile's lift never rides over the logo above it */
const BANK_ROW_GAP = 34;
const BANK_TILES: {
  cx: number;
  y0: number;
  y1: number;
  w: number;
  dy: number;
}[] = [
  // Row 1 — GTBank, Fidelity, FCMB, Sterling, FirstBank, Polaris, Zenith
  ...[319, 534, 757, 977, 1195, 1410, 1621].map((cx) => ({
    cx,
    y0: 50,
    y1: 218,
    w: 212,
    dy: 0,
  })),
  // Row 2 — Union, Ecobank, Keystone, OPay, Wema, cubes, UBA
  ...[269, 503, 738, 968, 1204, 1438, 1674].map((cx) => ({
    cx,
    y0: 218,
    y1: 398,
    w: 220,
    dy: BANK_ROW_GAP,
  })),
  // Row 3 — spiral, Moniepoint, hex, FairMoney, PalmPay, M, Heritage.
  // These tiles run to the bottom of the art so each icon lifts together
  // with its mirrored reflection instead of tearing away from it.
  ...[172, 425, 693, 961, 1222, 1489, 1750].map((cx) => ({
    cx,
    y0: 398,
    y1: 733,
    w: 250,
    dy: BANK_ROW_GAP * 2,
  })),
];

const LANDING_CTA =
  "inline-flex h-10 min-w-[9.75rem] items-center justify-center rounded-full px-5 text-[13px] font-medium transition-colors";

function BankIcons() {
  const { w: W, h: H, src } = BANK_ART;
  const H2 = H + BANK_ROW_GAP * 2;
  const tile = (x0: number, y0: number, w: number, h: number, dy: number) => ({
    box: {
      left: `${(x0 / W) * 100}%`,
      top: `${((y0 + dy) / H2) * 100}%`,
      width: `${(w / W) * 100}%`,
      height: `${(h / H2) * 100}%`,
    },
    img: {
      width: `${(W / w) * 100}%`,
      left: `${(-x0 / w) * 100}%`,
      top: `${(-y0 / h) * 100}%`,
    },
  });

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${W}/${H2}` }}
      role="img"
      aria-label="Institutions Rain is built for — GTBank, Fidelity, FCMB, Sterling, FirstBank, Polaris, Zenith, Union Bank, Ecobank, Kuda, Wema, UBA, FairMoney, Moniepoint, Heritage and more"
    >
      {BANK_TILES.map((b, i) => {
        const t = tile(b.cx - b.w / 2, b.y0, b.w, b.y1 - b.y0, b.dy);
        return (
          <div
            key={i}
            className="absolute overflow-hidden transition-transform duration-300 ease-out will-change-transform hover:z-10 hover:-translate-y-2"
            style={t.box}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="absolute max-w-none"
              style={t.img}
            />
          </div>
        );
      })}
    </div>
  );
}

/* Giant RAIN wordmark closing the page — only the top half is visible; the
   rest sits below the clip, so the page looks like it continues past the
   fold. Rises up from the cut when it scrolls into view. */
function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative mt-16 h-[0.44em] overflow-hidden"
      style={{ fontSize: "clamp(120px, 21vw, 300px)" }}
      aria-hidden
    >
      <span
        className={cn(
          "block select-none text-center font-semibold leading-none tracking-[-0.03em] text-neutral-200 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          shown ? "translate-y-0" : "translate-y-full"
        )}
      >
        RAIN
      </span>
    </div>
  );
}

/* Interfere-style statement: the keyword chips cycle and the matching
   info card below brightens while the others dim. */
function Statement() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 2800);
    return () => clearInterval(id);
  }, []);

  const chip = (i: number, label: string) => (
    <>
      <span
        className={cn(
          "rounded-lg px-2 py-0.5 transition-colors duration-500",
          active === i
            ? "bg-primary text-white"
            : "bg-neutral-100 text-neutral-500"
        )}
      >
        {label}
      </span>
      <sup className="ml-0.5 font-mono text-[10px] text-neutral-400">
        0{i + 1}
      </sup>
    </>
  );

  /* Card content animates when its card takes focus: badges pop, rows
     stagger upward. */
  const badgeCls = (on: boolean) =>
    cn(
      "transition-all duration-500",
      on ? "scale-100 opacity-100" : "scale-90 opacity-60"
    );
  const row = (on: boolean, d: number) => ({
    className: cn(
      "flex items-center justify-between transition-all duration-500",
      on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-50"
    ),
    style: { transitionDelay: `${d}ms` },
  });

  const cards = [
    {
      n: "01",
      title: "Know who you're onboarding",
      body: "One network check before the account is opened.",
      graphic: (on: boolean) => (
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-neutral-600">
              ******8841
            </span>
            <span
              className={cn(
                "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200",
                badgeCls(on)
              )}
            >
              Match
            </span>
          </div>
          <div className="space-y-2 border-t border-neutral-100 pt-3 text-[13px]">
            <div {...row(on, 80)}>
              <span className="text-neutral-400">Confidence</span>
              <span
                className={cn(
                  "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200",
                  badgeCls(on)
                )}
              >
                High · 7
              </span>
            </div>
            <div {...row(on, 160)}>
              <span className="text-neutral-400">Independent institutions</span>
              <span className="font-medium text-neutral-700 tabular-nums">
                7
              </span>
            </div>
            <div {...row(on, 240)}>
              <span className="text-neutral-400">First reported</span>
              <span className="font-medium text-neutral-700">Dec 2025</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      n: "02",
      title: "One report protects everyone",
      body: "A fraudster flagged at one bank can't move to the next.",
      graphic: (on: boolean) => (
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-neutral-400">
              #RPT-2026-0841
            </span>
            <span
              className={cn(
                "rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200",
                badgeCls(on)
              )}
            >
              Mule account
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-700">
            ******3341 · Reported by PayNest MFB
          </p>
          <div className="space-y-2 border-t border-neutral-100 pt-3 text-[13px]">
            <div {...row(on, 80)}>
              <span className="text-neutral-400">Network status</span>
              <span className="font-medium text-neutral-700">
                Visible to 119 members
              </span>
            </div>
            <div {...row(on, 160)}>
              <span className="text-neutral-400">Confirmations</span>
              <span
                className={cn(
                  "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200",
                  badgeCls(on)
                )}
              >
                3 institutions
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      n: "03",
      title: "Reporting pays for itself",
      body: "Reports that confirm a check earn you credits.",
      graphic: (on: boolean) => (
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-[13px] text-neutral-400">
              Available earnings
            </span>
            <span className="text-sm font-semibold text-neutral-800 tabular-nums">
              ₦120
            </span>
          </div>
          {[
            ["******3341", "+₦20", 80],
            ["******9912", "+₦20", 160],
            ["******1188", "+₦20", 240],
          ].map(([id, amt, d]) => (
            <div
              key={id as string}
              {...row(on, d as number)}
              className={cn(row(on, d as number).className, "py-2 text-[13px]")}
            >
              <span className="font-mono text-neutral-500">{id}</span>
              <span className="font-medium text-emerald-600 tabular-nums">
                {amt}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    // z-40 keeps it above the hero's tall white gradient, which overflows
    // its wrapper on large screens
    <section className="relative z-40 bg-white px-6 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-[980px]">
        <h2 className="text-[24px] leading-[1.55] sm:text-[30px] font-medium tracking-tight text-neutral-900">
          Rain {chip(0, "verifies")} users before they get in,{" "}
          <br className="hidden sm:block" />
          {chip(1, "shares")} signals across the network,{" "}
          <br className="hidden sm:block" />
          and {chip(2, "rewards")} every report.
        </h2>
      </Reveal>

      <div className="mx-auto mt-16 grid max-w-[980px] gap-10 sm:mt-20 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.n} delay={i * 120}>
          <div
            className={cn(
              "transition-all duration-700",
              active === i ? "opacity-100" : "opacity-35"
            )}
          >
            {/* Outlined frame with padding around the graphic, whose content
                fades into the white at the bottom */}
            <div
              className={cn(
                "rounded-2xl p-1.5 ring-1 transition-all duration-700",
                active === i ? "ring-neutral-300" : "ring-neutral-200"
              )}
            >
              <div className="relative h-[180px] overflow-hidden rounded-xl bg-white ring-1 ring-neutral-100">
                {c.graphic(active === i)}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
                  aria-hidden
                />
              </div>
            </div>
            <p className="mt-6 font-mono text-xs text-neutral-400">{c.n}</p>
            <h3 className="mt-2 text-[17px] font-semibold text-neutral-900">
              {c.title}
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-neutral-500">
              {c.body}
            </p>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Landing                                                             */
/* ------------------------------------------------------------------ */

const FEATURES: {
  n: string;
  title: string;
  body: string;
  capLabel: string;
  caps: string[];
  src: string;
  alt: string;
  shiftX?: string;
  imgW?: string;
  tall?: boolean;
}[] = [
  {
    n: "01",
    title: "Verify before you onboard",
    body: "Check any account, phone, email, BVN or NIN against the whole network in seconds — and see how many independent institutions have flagged it.",
    capLabel: "Built for compliance teams",
    caps: [
      "BVN-linked lookups",
      "Confidence scoring",
      "Network-wide signals",
      "Real-time results",
    ],
    src: "/landing/feature-history.png",
    alt: "Rain verification history — results with Match and confidence badges",
    shiftX: "0%",
  },
  {
    n: "02",
    title: "Report once, protect everyone",
    body: "Structured fraud reports become network signals instantly. Multiple institutions confirming the same identity raises its confidence for everyone.",
    capLabel: "Structured intelligence",
    caps: [
      "Category tagging",
      "Independent-source count",
      "Instant propagation",
      "Audit trail",
    ],
    src: "/landing/feature-report.png",
    alt: "Reporting a user on Rain — structured fraud report form",
    shiftX: "0%",
    imgW: "108%",
    tall: true,
  },
  {
    n: "03",
    title: "Earn from your intelligence",
    body: "Every time your report contributes to another institution's verification, your wallet is credited. Good signals pay for themselves.",
    capLabel: "Wallet & payouts",
    caps: [
      "Per-signal credits",
      "Wallet & earnings",
      "CSV & PDF exports",
      "Team payouts",
    ],
    src: "/landing/feature-earnings.png",
    alt: "Rain earnings — credits for reports that confirm matches",
    shiftX: "0%",
    tall: true,
  },
];

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Network", href: "#network" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "#access" },
];

export function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const cloudBackRef = useRef<HTMLDivElement>(null);
  const cloudFrontRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* The window's transform mixes the scroll parallax with the hover tilt,
     so both handlers write through one compose step */
  const parallaxY = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });
  const applyWindowTransform = () => {
    const el = windowRef.current;
    if (!el) return;
    const { x, y } = tilt.current;
    el.style.transform = `translate3d(0, ${parallaxY.current * 0.04}px, 0) perspective(1400px) rotateX(${x}deg) rotateY(${y}deg)`;
  };

  /* Powder-style parallax: clouds rise over the window as you scroll */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const hero = heroRef.current;
        if (!hero) return;
        setScrolled(window.scrollY > 32);
        const y = Math.max(0, -hero.getBoundingClientRect().top);
        parallaxY.current = y;
        applyWindowTransform();
        if (cloudBackRef.current) {
          cloudBackRef.current.style.transform = `translate3d(${y * 0.03}px, ${-y * 0.07}px, 0)`;
        }
        if (cloudFrontRef.current) {
          cloudFrontRef.current.style.transform = `translate3d(${-y * 0.04}px, ${-y * 0.12}px, 0)`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="scroll-smooth overflow-x-clip bg-white text-neutral-900"
      style={{ colorScheme: "light", scrollBehavior: "smooth" }}
    >
      {/* Fixed nav — transparent over the hero, condenses into a floating
          glass pill once you scroll (powder-style) */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            "relative mx-auto flex items-center justify-between transition-all duration-300 ease-out",
            scrolled
              ? "mt-3 h-12 max-w-[calc(100%-24px)] rounded-full bg-white/75 pl-3.5 pr-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 backdrop-blur-xl sm:max-w-[820px] sm:pl-5"
              : "mt-0 h-16 max-w-[1200px] bg-transparent px-6"
          )}
        >
          <Link
            href="/"
            onClick={() => {
              setMenuOpen(false);
              // Already on the landing page — Next would no-op, so reset the
              // scroll to the top instead of leaving the reader where they were
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5"
          >
            <RainMark black className="h-5 w-5" />
            <span className="text-[15px] font-semibold tracking-tight text-black/90">
              Rain
            </span>
          </Link>
          {/* Absolutely centered so the asymmetric logo/actions widths can
              never pull the links off the pill's true middle */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={cn(
                  "flex h-8 items-center rounded-full px-3 text-[13px] font-medium text-black/60 transition-colors hover:text-black/90",
                  scrolled ? "hover:bg-black/5" : "hover:bg-white/30"
                )}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden shrink-0 items-center gap-1 sm:gap-1.5 md:flex">
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center rounded-full font-medium text-black/60 transition-colors hover:text-black/90 hover:bg-black/5",
                scrolled
                  ? "h-8 px-3 text-[12px]"
                  : "h-10 px-4 text-[13px]"
              )}
            >
              Sign in
            </Link>
            <Link
              href="/request-access"
              className={cn(
                "inline-flex items-center justify-center rounded-full font-medium transition-colors",
                scrolled
                  ? "h-8 whitespace-nowrap px-3.5 text-[12px] bg-neutral-900 text-white hover:bg-neutral-700"
                  : cn(
                      LANDING_CTA,
                      "min-w-[9.75rem] border border-white/50 bg-white/30 text-black/85 shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-sm hover:bg-white/50"
                    )
              )}
            >
              Request access
            </Link>
          </div>
          {/* Mobile — everything lives in the drawer */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-full text-black/80 transition-colors hover:bg-black/5 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer — floating panel, same treatment as the app's drawers */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="animate-drawer-in absolute bottom-3 right-3 top-3 flex w-[290px] flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <RainMark black className="h-5 w-5" />
                <span className="text-[15px] font-semibold tracking-tight text-black/90">
                  Rain
                </span>
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
                className="flex h-9 w-9 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3.5 text-[17px] font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
              >
                Sign in
              </Link>
              <Link
                href="/request-access"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
              >
                Request access
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* ==================== SKY + CLOUDS (Figma geometry) ==============
          Hero frame is 1193px tall and clips the sky video. The cloud images
          are siblings placed OVER it (y402 / y506, natural 3:2 size, never
          cropped — their own soft edges do the fading), then the tall white
          gradient (y1153) melts everything into the white page. */}
      <div className="relative">
      {/* All sky-composition geometry comes from the 1440 Figma frame; above
          1440 every position/size scales with the viewport (px/14.4 = vw) so
          the clouds, window and fades keep their relationship on big screens. */}
      <section
        ref={heroRef}
        className="relative h-[max(1193px,82.85vw)] overflow-hidden"
        style={{
          // Fallback while the video loads (and if it can't play)
          background:
            "linear-gradient(180deg, #79ADE3 0%, #9CC6EE 26%, #C2DEF6 52%, #E4F1FB 74%, #ffffff 100%)",
        }}
      >
        {/* Sky video */}
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src="/landing/sky.mp4" type="video/mp4" />
        </video>

        {/* Hero copy (the nav is fixed, rendered at the end of the page) */}
        {/* On wide screens the copy stays vertically centered between the
            nav and the window (window top grows at 35.28vw; the copy takes
            ~45% of that growth so the air above and below stays even) */}
        <div className="relative z-20 mx-auto flex max-w-[760px] flex-col items-center px-6 pt-[max(144px,calc(15.83vw_-_84px))] text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-black/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
              Private beta · built for banks & fintechs
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-[40px] sm:text-[56px] font-medium leading-[1.02] tracking-[-0.02em] text-black/90">
              Fraud intelligence the whole network can trust.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 max-w-[420px] text-[15px] leading-6 text-black/60">
              Rain is a secure network where verified banks and fintechs share
              fraud signals and verify users in real time.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/request-access"
                className={cn(
                  LANDING_CTA,
                  "bg-white text-black/85 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(30,60,120,0.35)] hover:shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.1),0_12px_28px_-8px_rgba(30,60,120,0.45)] transition-shadow"
                )}
              >
                Request access
              </Link>
              <Link
                href="/login"
                className={cn(
                  LANDING_CTA,
                  "border border-white/50 bg-white/25 text-black/75 backdrop-blur-sm hover:bg-white/45"
                )}
              >
                Sign in
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Dashboard window — its lower portion is swallowed by the rising
            cloud bed, so its bottom edge is never seen. */}
        {/* Dashboard window — Figma: y508, 1100×648 */}
        <div
          ref={windowRef}
          className="absolute left-4 top-[564px] z-10 h-[473px] w-[760px] overflow-hidden rounded-[14px] bg-white/35 shadow-[0_24px_48px_-12px_rgba(10,30,60,0.35)] backdrop-blur-xl backdrop-saturate-150 will-change-transform sm:left-1/2 sm:top-[max(508px,35.28vw)] sm:h-[min(60vw,max(648px,45vw))] sm:w-[min(94vw,max(1100px,76.39vw))] sm:-translate-x-1/2 sm:rounded-[20px] 2xl:top-[max(492px,34vw)]"
          onMouseMove={(e) => {
            const el = windowRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            tilt.current = { x: -(py * 4), y: px * 4 };
            applyWindowTransform();
          }}
          onMouseLeave={() => {
            tilt.current = { x: 0, y: 0 };
            const el = windowRef.current;
            if (!el) return;
            el.style.transition = "transform 0.5s ease";
            applyWindowTransform();
            setTimeout(() => {
              if (windowRef.current) windowRef.current.style.transition = "";
            }, 500);
          }}
        >
          {/* Mobile shows the desktop capture — the live preview's inner
              layout responds to the phone viewport and would collapse into
              the app's stacked mobile arrangement */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/dashboard.png"
            alt="The Rain dashboard — verification activity, report categories, and live network signals"
            className="block w-full pl-2.5 pt-1 sm:hidden"
            width={2000}
            height={1250}
          />
          <div className="hidden h-full sm:block">
            <LandingDashboardPreview />
          </div>
          {/* Shiny hairline that travels around the window edge — desktop
              only; at mobile scale it reads as a stray border */}
          <div className="edge-light hidden sm:block" aria-hidden />
        </div>

        {/* On wide screens the cloud band sits lower, so the video (and the
            window's bottom rows) would hard-stop at the hero's clipped edge —
            melt the hero's last stretch into the page white regardless of
            viewport width. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[max(280px,19.44vw)]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 55%, #ffffff 100%)",
          }}
          aria-hidden
        />
      </section>

      {/* Cloud layers — Figma nodes 41:4863 / 41:4865: same transparent asset
          twice, natural size, spilling past the hero onto the white page. */}
      <div
        ref={cloudBackRef}
        className="pointer-events-none absolute left-1/2 top-[240px] z-20 w-[max(1680px,115vw)] -translate-x-1/2 will-change-transform sm:top-[max(402px,27.92vw)] 2xl:top-[max(386px,26.64vw)]"
        aria-hidden
      >
        <div className="animate-cloud-drift-slow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/clouds.png"
            alt=""
            className="w-full"
            width={1536}
            height={1024}
          />
        </div>
      </div>
      <div
        ref={cloudFrontRef}
        className="pointer-events-none absolute left-1/2 top-[344px] z-20 w-[max(1680px,115vw)] -translate-x-1/2 will-change-transform sm:top-[max(506px,35.14vw)] 2xl:top-[max(490px,33.86vw)]"
        aria-hidden
      >
        <div className="animate-cloud-drift">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/clouds.png"
            alt=""
            className="w-full"
            width={1536}
            height={1024}
          />
        </div>
      </div>

      {/* White gradient — Figma node 42:4937: y1153, h870, fades clouds and
          sky into the white page. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[max(1090px,75.69vw)] z-30 h-[max(933px,64.79vw)] 2xl:top-[max(1074px,74.41vw)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.24) 5.415%, #ffffff 21.147%)",
        }}
        aria-hidden
      />

      {/* ============================ NETWORK ============================ */}
      <section id="network" className="relative z-40 scroll-mt-24 pb-8 pt-[160px]">
        <Reveal className="relative z-10 mx-auto max-w-[620px] px-6 text-center">
          <p className="text-sm font-medium text-primary">Who it&apos;s for</p>
          <h2 className="mt-3 text-[24px] sm:text-[30px] font-medium leading-[1.3] tracking-tight text-neutral-900">
            Built for every institution
            <br className="hidden sm:block" /> that onboards customers.
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-[15px] leading-6 text-neutral-500">
            Commercial banks, microfinance banks, and fintechs across Nigeria —
            if fraudsters can reach your onboarding flow, Rain is built for
            you.
          </p>
        </Reveal>
        {/* App-icon artwork, tight crop with reflections — sized so the icon
            field matches the old asset's footprint */}
        <Reveal delay={120} className="mx-auto mt-12 max-w-[940px] px-6">
          <BankIcons />
        </Reveal>
      </section>
      </div>

      {/* =========================== STATEMENT =========================== */}
      <Statement />

      {/* ============================== QUOTE ============================ */}
      <section className="relative z-40 bg-white px-3 pb-6 sm:px-6">
        <Reveal>
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-3xl border border-black/5 bg-[#0e0c0d]">
          {/* corner glows, Interfere-style */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(620px 360px at 10% 110%, rgba(234,76,137,0.18), transparent 70%), radial-gradient(620px 360px at 90% 110%, rgba(124,108,240,0.18), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-[820px] px-6 py-28 sm:py-32">
            <QuoteReveal text="Every fraudulent account we catch before onboarding saves us millions. Rain tells us in seconds what used to take weeks of back-and-forth between institutions." />
            <figcaption className="mt-10 flex items-center justify-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                AO
              </span>
              <span className="text-left leading-tight">
                <span className="block text-sm font-medium text-white">
                  Adaeze Okafor
                </span>
                <span className="mt-0.5 block text-sm text-white/50">
                  Head of Compliance, PayNest MFB
                </span>
              </span>
            </figcaption>
          </div>
        </div>
        </Reveal>
      </section>

      {/* ============================ FEATURES =========================== */}
      <section id="product" className="bg-white">
        <div className="mx-auto max-w-[1240px] px-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.n}>
              {/* Divider between feature blocks only — nothing touching the quote */}
              {i > 0 && <div className="h-px bg-neutral-200" />}
              <div className="grid items-stretch gap-16 py-32 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-20 lg:py-44">
                {/* Text — always left; copy sits at the top, the capability
                    table pins to the bottom of the row so the space between
                    them breathes like the reference */}
                <div className="flex flex-col">
                  <p className="font-mono text-sm text-neutral-400">{f.n}</p>
                  <h3 className="mt-4 text-[24px] sm:text-[30px] font-medium leading-[1.3] tracking-tight text-neutral-900">
                    {f.title}
                  </h3>
                  <p className="mt-5 max-w-sm text-[15px] leading-7 text-neutral-500">
                    {f.body}
                  </p>
                  <div className="mt-16 lg:mt-auto lg:pt-16">
                    <p className="text-sm font-medium text-neutral-900">
                      {f.capLabel}
                    </p>
                    <div className="mt-4 grid max-w-sm grid-cols-2 gap-x-8">
                      {f.caps.map((c) => (
                        <div key={c} className="py-2.5 text-sm text-neutral-500">
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Screenshot — always right, bleeds off, fades bottom + left */}
                <FeatureShot
                  src={f.src}
                  alt={f.alt}
                  shiftX={f.shiftX}
                  imgW={f.imgW}
                  tall={f.tall}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =============================== CTA ============================= */}
      <section id="access" className="scroll-mt-20 bg-white px-3 py-6 sm:px-6">
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-3xl bg-[#f2f7fd]">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(720px 420px at 50% 118%, rgba(234,76,137,0.5), transparent 70%), radial-gradient(1000px 520px at 50% 130%, rgba(124,108,240,0.45), transparent 75%), radial-gradient(1200px 700px at 50% 150%, rgba(155,196,240,0.8), transparent 80%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(rgba(30,40,80,0.35) 1px, transparent 1.4px)",
              backgroundSize: "14px 14px",
              maskImage:
                "radial-gradient(900px 500px at 50% 120%, black, transparent 75%)",
            }}
          />
          <Reveal className="relative flex flex-col items-center px-6 py-24 text-center sm:py-28">
            <h2 className="text-[28px] sm:text-[38px] font-semibold leading-tight tracking-tight text-neutral-900">
              Fraud intelligence for the whole network.
              <br />
              Join Rain today.
            </h2>
            <Link
              href="/request-access"
              className="mt-9 inline-flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              <RainMark white className="h-3.5 w-3.5" />
              Request access
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================= FOOTER ============================ */}
      <footer className="bg-white">
        <Reveal className="mx-auto max-w-[1200px] px-6 pb-10 pt-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <RainMark black className="h-5 w-5" />
                <span className="text-sm font-semibold text-neutral-900">
                  Rain
                </span>
              </div>
              <p className="mt-3 max-w-[220px] text-xs leading-5 text-neutral-500">
                Risk Analysis &amp; Intelligence Network for banks and fintechs.
              </p>
            </div>
            {/* Only links that actually go somewhere */}
            <nav className="flex items-center gap-6">
              <a
                href="#product"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Product
              </a>
              <a
                href="#network"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Who it&apos;s for
              </a>
              <Link
                href="/docs"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                API docs
              </Link>
              <Link
                href="/request-access"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Request access
              </Link>
            </nav>
          </div>
          <div className="mt-12 flex items-center justify-between border-t border-neutral-200 pt-6">
            <p className="text-xs text-neutral-400">
              © 2026 Rain — Risk Analysis &amp; Intelligence Network
            </p>
            <Link
              href="/login"
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </Reveal>
        <FooterWordmark />
      </footer>
    </div>
  );
}
