import { DocsShell } from "@/components/docs/docs-shell";
import {
  Callout,
  CodeBlock,
  DocLead,
  DocProse,
  DocsPager,
} from "@/components/docs/docs-ui";
import { DOCS_API_BASE } from "@/lib/docs";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Introduction | Rain API docs",
  description:
    "Integrate Rain into your onboarding and fraud workflows with verifications and network reports.",
};

export default function DocsIntroductionPage() {
  return (
    <DocsShell title="Introduction">
      <DocLead>
        The Rain API lets your systems verify customers against the network and
        submit structured fraud reports without using the dashboard UI.
      </DocLead>

      <DocProse>
        <h2>What you can build</h2>
        <ul>
          <li>
            <strong>Pre-onboarding checks</strong>: Send BVN or NIN (via{" "}
            <code className="font-mono text-[13px]">identifier_type</code>),
            email, and optional profile fields to see if a customer is flagged
            or clean on the network.
          </li>
          <li>
            <strong>Case management hooks</strong>: File reports from your
            internal tools when analysts confirm fraud.
          </li>
          <li>
            <strong>Automation</strong>: Receive webhooks when verifications
            complete or reports are accepted.
          </li>
        </ul>

        <h2>Base URL</h2>
        <p>
          All HTTPS requests use versioned paths under{" "}
          <code className="rounded bg-hover px-1.5 py-0.5 font-mono text-[13px] text-foreground">
            {DOCS_API_BASE}
          </code>
          .
        </p>

        <Callout title="Local development">
          Run the Rain API at{" "}
          <code className="font-mono text-[13px]">http://localhost:3001</code>{" "}
          and set{" "}
          <code className="font-mono text-[13px]">
            NEXT_PUBLIC_DOCS_API_BASE=http://localhost:3001/v1
          </code>{" "}
          so examples below match your machine. Production uses{" "}
          <code className="font-mono text-[13px]">https://api.rain.ng/v1</code>.
        </Callout>

        <h2>Quick start</h2>
        <ol>
          <li>
            <Link href="/request-access" className="text-primary hover:underline">
              Request access
            </Link>{" "}
            for your institution.
          </li>
          <li>
            Create or rotate an API key under{" "}
            <Link href="/settings" className="text-primary hover:underline">
              Settings → API &amp; webhooks
            </Link>
            .
          </li>
          <li>
            Call <Link href="/docs/verify">POST /verifications</Link> or{" "}
            <Link href="/docs/reports">POST /reports</Link> from your backend.
          </li>
        </ol>

        <CodeBlock title="curl">
          {`curl -sS -X POST ${DOCS_API_BASE}/verifications \\
  -H "Authorization: Bearer rain_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier_type": "bvn",
    "identifier": "22222222222",
    "email": "customer@example.com"
  }'`}
        </CodeBlock>

        <h2>Conventions</h2>
        <ul>
          <li>JSON request and response bodies with UTF-8.</li>
          <li>
            Timestamps are ISO 8601 UTC strings (
            <code className="font-mono text-[13px]">2026-03-20T14:22:00Z</code>
            ).
          </li>
          <li>
            Identifiers you send are never echoed in full; responses use masked
            values only.
          </li>
        </ul>
      </DocProse>

      <DocsPager
        next={{ href: "/docs/authentication", label: "Authentication" }}
      />
    </DocsShell>
  );
}
