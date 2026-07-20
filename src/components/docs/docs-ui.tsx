import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export { CodeBlock } from "@/components/docs/code-block";
export { DocCodeTabs } from "@/components/docs/doc-code-tabs";

export function DocProse({ children }: { children: ReactNode }) {
  return (
    <div className="doc-prose max-w-none text-[15px] leading-7 text-muted [&_a]:text-primary [&_a]:hover:underline [&_h2]:scroll-mt-24 [&_h2]:border-b [&_h2]:border-line [&_h2]:pb-2 [&_h2]:pt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_h2:first-child]:pt-0 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_li]:mt-1.5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-3 [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  );
}

export function DocLead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[17px] leading-7 text-muted">{children}</p>
  );
}

export function Endpoint({
  method,
  path,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
}) {
  const tone =
    method === "GET"
      ? "bg-info-bg text-info-fg ring-info-fg/25"
      : method === "POST"
        ? "bg-ok-bg text-ok-fg ring-ok-fg/25"
        : "bg-violet-bg text-violet-fg ring-violet-fg/25";

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 font-mono text-sm">
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1",
          tone
        )}
      >
        {method}
      </span>
      <span className="text-ink">{path}</span>
    </div>
  );
}

export function Callout({
  title,
  children,
  variant = "info",
  bordered = true,
}: {
  title?: string;
  children: ReactNode;
  variant?: "info" | "warn";
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-6 rounded-xl px-4 py-3 text-sm leading-6",
        bordered && "border",
        variant === "info" && "bg-info-bg/40 text-foreground",
        variant === "info" && bordered && "border-info-fg/20",
        variant === "warn" && "bg-warn-bg/40 text-foreground",
        variant === "warn" && bordered && "border-warn-fg/20"
      )}
    >
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
      <div className={title ? "mt-1 text-muted" : "text-muted"}>{children}</div>
    </div>
  );
}

export function ParamTable({
  rows,
}: {
  rows: {
    name: string;
    type: string;
    required?: boolean;
    description: string;
  }[];
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-line bg-hover/50 text-xs font-medium uppercase tracking-wider text-subtle">
          <tr>
            <th className="px-4 py-2.5">Field</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.name} className="align-top">
              <td className="px-4 py-3 font-mono text-[13px] text-ink">
                {row.name}
                {row.required ? (
                  <span className="ml-1.5 text-[10px] font-sans font-medium uppercase text-primary">
                    required
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 font-mono text-[12px] text-subtle">
                {row.type}
              </td>
              <td className="px-4 py-3 text-muted">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocsPager({
  prev,
  next,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <nav
      className="mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-8 text-sm"
      data-docs-ignore-copy
    >
      {prev ? (
        <Link href={prev.href} className="text-muted hover:text-ink">
          ← {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="text-muted hover:text-ink">
          {next.label} →
        </Link>
      ) : null}
    </nav>
  );
}
