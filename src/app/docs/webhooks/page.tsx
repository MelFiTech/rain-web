import { DocsShell } from "@/components/docs/docs-shell";
import {
  CodeBlock,
  DocLead,
  DocProse,
  DocsPager,
} from "@/components/docs/docs-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webhooks | Rain API docs",
};

export default function DocsWebhooksPage() {
  return (
    <DocsShell title="Webhooks">
      <DocLead>
        Receive HTTPS callbacks when verifications finish, reports are accepted,
        or your wallet needs attention.
      </DocLead>

      <DocProse>
        <h2>Configure endpoints</h2>
        <p>
          Add one or more HTTPS URLs in{" "}
          <strong>Settings → API &amp; webhooks</strong>. Each endpoint selects
          the event types it wants and receives a signing secret when created.
        </p>

        <h2>Event types</h2>
        <ul>
          <li>
            <code className="font-mono text-[13px]">verification.completed</code>:
            A verification you initiated has a final result.
          </li>
          <li>
            <code className="font-mono text-[13px]">report.submitted</code>:
            A report from your institution was accepted.
          </li>
          <li>
            <code className="font-mono text-[13px]">wallet.low_balance</code>:
            Wallet balance dropped below your configured threshold.
          </li>
        </ul>

        <h2>Delivery format</h2>
        <p>
          Rain POSTs a JSON body to your URL. Verify authenticity with the{" "}
          <code className="font-mono text-[13px]">Rain-Signature</code> header
          (HMAC SHA-256 of the raw body using your endpoint secret).
        </p>

        <CodeBlock title="Example payload">
          {`{
  "id": "evt_01hxyz",
  "type": "verification.completed",
  "created_at": "2026-03-20T09:15:02Z",
  "data": {
    "reference": "VER-M8K2-A1B3",
    "result": "match",
    "masked_identifier": "******8841",
    "confidence": {
      "level": "high",
      "independent_source_count": 7
    }
  }
}`}
        </CodeBlock>

        <h2>Retries</h2>
        <p>
          Endpoints must respond with <code className="font-mono text-[13px]">2xx</code>{" "}
          within 10 seconds. Failures retry with exponential backoff for up to
          72 hours. Disable or fix broken endpoints in Settings to stop
          retries.
        </p>
      </DocProse>

      <DocsPager
        prev={{ href: "/docs/reports", label: "Submit reports" }}
        next={{ href: "/docs/errors", label: "Errors & limits" }}
      />
    </DocsShell>
  );
}
