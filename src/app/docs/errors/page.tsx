import { DocsShell } from "@/components/docs/docs-shell";
import {
  DocLead,
  DocProse,
  DocsPager,
} from "@/components/docs/docs-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Errors & limits | Rain API docs",
};

export default function DocsErrorsPage() {
  return (
    <DocsShell title="Errors & limits">
      <DocLead>
        Standard HTTP status codes and JSON error bodies help you handle failures
        in production integrations.
      </DocLead>

      <DocProse>
        <h2>Error shape</h2>
        <p>Most errors return:</p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-card p-4 font-mono text-[13px] text-foreground">{`{
  "error": "Human-readable summary",
  "code": "machine_code_optional",
  "request_id": "uuid"
}`}</pre>

        <h2>Common status codes</h2>
        <ul>
          <li>
            <strong>400</strong>: Malformed JSON or missing required headers.
          </li>
          <li>
            <strong>401</strong>: Missing or invalid API key.
          </li>
          <li>
            <strong>403</strong>: Key valid but not permitted for this
            operation.
          </li>
          <li>
            <strong>404</strong>: Resource not found (wrong id or reference).
          </li>
          <li>
            <strong>402</strong>: Insufficient wallet balance for a paid
            verification (see <code className="font-mono text-[13px]">code</code>{" "}
            <code className="font-mono text-[13px]">insufficient_balance</code>).
          </li>
          <li>
            <strong>422</strong>: Validation failed (see field_errors on
            reports).
          </li>
          <li>
            <strong>429</strong>: Rate limit exceeded; retry after Retry-After.
          </li>
          <li>
            <strong>500</strong>: Unexpected error; retry with idempotency key.
          </li>
        </ul>

        <h2>Rate limits</h2>
        <p>
          Default production limits are negotiated per institution during
          onboarding. Response headers include{" "}
          <code className="font-mono text-[13px]">X-RateLimit-Limit</code>,{" "}
          <code className="font-mono text-[13px]">X-RateLimit-Remaining</code>,
          and <code className="font-mono text-[13px]">X-RateLimit-Reset</code>.
        </p>

        <h2>Support</h2>
        <p>
          Include <code className="font-mono text-[13px]">request_id</code> from
          error responses when contacting Rain support. For access and key
          issues, use the email on your institution profile in Settings.
        </p>
      </DocProse>

      <DocsPager prev={{ href: "/docs/webhooks", label: "Webhooks" }} />
    </DocsShell>
  );
}
