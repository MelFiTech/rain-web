import { DocsShell } from "@/components/docs/docs-shell";
import {
  Callout,
  CodeBlock,
  DocLead,
  DocProse,
  DocsPager,
} from "@/components/docs/docs-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Rain API docs",
};

export default function DocsAuthenticationPage() {
  return (
    <DocsShell title="Authentication">
      <DocLead>
        Server-to-server calls authenticate with a secret API key issued per
        institution.
      </DocLead>

      <DocProse>
        <h2>API keys</h2>
        <p>
          Keys are shown once when created or rotated in the dashboard. Store
          them in a secrets manager. Never commit keys to source control or expose
          them in mobile or browser clients.
        </p>
        <ul>
          <li>
            Prefix: <code className="font-mono text-[13px]">rain_live_</code>
          </li>
          <li>Format: Bearer token in the Authorization header</li>
        </ul>

        <CodeBlock title="Authorization header">
          {`Authorization: Bearer rain_live_xxxxxxxxxxxxxxxx`}
        </CodeBlock>

        <Callout variant="warn" title="Rotate if exposed" bordered={false}>
          If a key leaks, rotate it immediately in Settings. The previous key
          stops working as soon as rotation completes.
        </Callout>

        <h2>Idempotency</h2>
        <p>
          For POST requests that create resources (verifications, reports), send
          an optional idempotency key so retries do not create duplicate
          resources:
        </p>
        <CodeBlock title="Idempotency-Key">
          {`Idempotency-Key: onboarding-check-9f2a1c8b`}
        </CodeBlock>
        <p>
          Reuse the same key only when retrying the same logical operation.
          Keys expire after 24 hours.
        </p>

        <h2>Request tracing</h2>
        <p>
          You may pass <code className="font-mono text-[13px]">X-Request-Id</code>{" "}
          with a UUID; Rain echoes it on responses and webhook deliveries for
          support correlation.
        </p>
      </DocProse>

      <DocsPager
        prev={{ href: "/docs", label: "Introduction" }}
        next={{ href: "/docs/verify", label: "Verify users" }}
      />
    </DocsShell>
  );
}
