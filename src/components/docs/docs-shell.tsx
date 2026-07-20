"use client";

import { DocsNav } from "@/components/docs/docs-nav";
import { RainMark } from "@/components/ui/logo";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

function buildPageCopyText(title: string, body: HTMLElement): string {
  const clone = body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-docs-ignore-copy]").forEach((el) => el.remove());
  return `# ${title}\n\n${clone.innerText.replace(/\n{3,}/g, "\n\n").trim()}`;
}

export function DocsShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [pageCopied, setPageCopied] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    delete root.dataset.theme;
    return () => {
      if (previous) {
        root.dataset.theme = previous;
      } else {
        delete root.dataset.theme;
      }
    };
  }, []);

  const copyPage = async () => {
    const body = bodyRef.current;
    if (!body) return;
    try {
      await navigator.clipboard.writeText(buildPageCopyText(title, body));
      setPageCopied(true);
      window.setTimeout(() => setPageCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ colorScheme: "dark" }}>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <RainMark className="h-6 w-6" />
            <span className="text-sm font-semibold tracking-tight text-ink">
              Rain
            </span>
            <span className="hidden text-sm text-subtle sm:inline">/</span>
            <span className="hidden text-sm font-medium text-muted sm:inline">
              Docs
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-ink sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/request-access"
              className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Request access
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">
            Developer API
          </p>
          <DocsNav />
          <p className="mt-8 text-xs leading-5 text-muted">
            Manage API keys and webhooks in{" "}
            <Link href="/settings" className="text-primary hover:underline">
              Settings → API &amp; webhooks
            </Link>{" "}
            after your institution is onboarded.
          </p>
        </aside>

        <main>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h1 className="min-w-0 text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <button
              type="button"
              onClick={copyPage}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-ink"
              aria-label={pageCopied ? "Page copied" : "Copy page"}
            >
              {pageCopied ? (
                <Check className="h-4 w-4 text-ok-fg" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {pageCopied ? "Copied" : "Copy page"}
            </button>
          </div>
          <div ref={bodyRef}>{children}</div>
        </main>
      </div>
    </div>
  );
}
