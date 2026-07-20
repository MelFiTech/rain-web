"use client";

import { DOCS_NAV, type DocsNavItem } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function useHash() {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return hash;
}

function NavDropdown({ item }: { item: DocsNavItem }) {
  const pathname = usePathname();
  const hash = useHash();
  const pageActive =
    item.href === "/docs"
      ? pathname === "/docs"
      : pathname.startsWith(item.href);

  const [open, setOpen] = useState(pageActive);

  useEffect(() => {
    if (pageActive) setOpen(true);
  }, [pageActive]);

  const children = item.children ?? [];

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "flex items-center rounded-lg transition-colors",
          pageActive ? "bg-hover/60" : "hover:bg-hover/40"
        )}
      >
        <Link
          href={item.href}
          className={cn(
            "min-w-0 flex-1 rounded-lg px-3 py-2 text-sm transition-colors",
            pageActive ? "font-medium text-ink" : "text-muted hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mr-1.5 rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-ink"
          aria-expanded={open}
          aria-label={open ? "Collapse section links" : "Expand section links"}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      </div>
      {open ? (
        <div className="ml-3 space-y-0.5 border-l border-line pl-2">
          {children.map((child) => {
            const childHash = child.href.includes("#")
              ? child.href.slice(child.href.indexOf("#"))
              : "";
            const childActive =
              pageActive &&
              (childHash
                ? hash === childHash ||
                  (hash === "" && childHash === "#create")
                : pathname === child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                  childActive
                    ? "bg-hover font-medium text-ink"
                    : "text-muted hover:bg-hover/80 hover:text-foreground"
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-3 space-y-0.5">
      {DOCS_NAV.map((item) => {
        if (item.children?.length) {
          return <NavDropdown key={item.href} item={item} />;
        }

        const active =
          item.href === "/docs"
            ? pathname === "/docs"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-hover font-medium text-ink"
                : "text-muted hover:bg-hover/80 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
