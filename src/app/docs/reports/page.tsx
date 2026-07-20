import { DocsShell } from "@/components/docs/docs-shell";
import {
  CodeBlock,
  DocLead,
  DocProse,
  DocsPager,
  Endpoint,
  ParamTable,
} from "@/components/docs/docs-ui";
import { DOCS_API_BASE } from "@/lib/docs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit reports | Rain API docs",
};

const REPORT_CATEGORIES = `fraud | scam | mule_account | identity_theft | chargeback_abuse | loan_fraud | suspicious_transaction | other`;

export default function DocsReportsPage() {
  return (
    <DocsShell title="Submit reports">
      <DocLead>
        File structured intelligence when your team confirms suspicious
        activity. Reports propagate to the network and can earn rewards when they
        help other members verify matches.
      </DocLead>

      <DocProse>
        <h2 id="create" className="scroll-mt-24">
          Create a report
        </h2>
        <Endpoint method="POST" path="/reports" />

        <p>
          Required identity fields match verifications: pass{" "}
          <code className="font-mono text-[13px]">identifier_type</code> as{" "}
          <code className="font-mono text-[13px]">bvn</code> or{" "}
          <code className="font-mono text-[13px]">nin</code>, the corresponding{" "}
          <code className="font-mono text-[13px]">identifier</code>, and{" "}
          <code className="font-mono text-[13px]">email</code>. All other
          customer attributes are optional.
        </p>

        <ParamTable
          rows={[
            {
              name: "identifier_type",
              type: "string",
              required: true,
              description: "Must be bvn or nin.",
            },
            {
              name: "identifier",
              type: "string",
              required: true,
              description: "11-digit BVN or NIN value.",
            },
            {
              name: "email",
              type: "string",
              required: true,
              description: "Subject email address.",
            },
            {
              name: "category",
              type: "string",
              required: true,
              description: REPORT_CATEGORIES,
            },
            {
              name: "description",
              type: "string",
              required: true,
              description: "Narrative (minimum 10 characters).",
            },
            {
              name: "incident_date",
              type: "string",
              required: true,
              description: "Date of incident (YYYY-MM-DD).",
            },
            {
              name: "full_name",
              type: "string",
              description: "Optional. Subject name if known.",
            },
            {
              name: "bank",
              type: "string",
              description: "Optional. Bank name when reporting an account.",
            },
            {
              name: "account_number",
              type: "string",
              description: "Optional. 10-digit NUBAN when applicable.",
            },
            {
              name: "phone",
              type: "string",
              description: "Optional. E.164 or local Nigerian mobile format.",
            },
            {
              name: "amount_involved",
              type: "integer",
              description: "Optional estimated loss tied to the incident.",
            },
          ]}
        />

        <CodeBlock title="Request">
          {`POST ${DOCS_API_BASE}/reports
Content-Type: application/json
Authorization: Bearer rain_live_...

{
  "identifier_type": "nin",
  "identifier": "12345678901",
  "email": "suspect@mail.ng",
  "category": "mule_account",
  "description": "Customer received multiple inbound transfers and immediately moved funds off-platform via P2P.",
  "incident_date": "2026-03-18",
  "phone": "+2348012345678"
}`}
        </CodeBlock>

        <CodeBlock title="201 Created">
          {`{
  "id": "rpt_01hxyz",
  "reference": "RPT-2026-0841",
  "identifier_type": "nin",
  "masked_identifier": "*******8901",
  "masked_email": "s***@mail.ng",
  "masked_phone": "+234 80* *** 5678",
  "category": "mule_account",
  "description": "Customer received multiple inbound transfers...",
  "incident_date": "2026-03-18",
  "independent_source_count": 1,
  "confidence": {
    "level": "low",
    "independent_source_count": 1,
    "label": "Low · 1",
    "description": "1 independent institution reported this identifier."
  },
  "earnings_generated": 0,
  "submitted_at": "2026-03-20T10:02:00Z"
}`}
        </CodeBlock>

        <h2>Validation errors</h2>
        <p>
          Invalid payloads return <code className="font-mono text-[13px]">422</code>{" "}
          with a top-level message and per-field errors:
        </p>
        <CodeBlock title="422 Unprocessable Entity">
          {`{
  "error": "Please fix the highlighted fields.",
  "field_errors": {
    "identifier_type": "identifier_type must be bvn or nin.",
    "email": "Email is required.",
    "description": "Please provide a short description (at least 10 characters).",
    "incident_date": "Incident date is required."
  }
}`}
        </CodeBlock>

        <h2 id="list" className="scroll-mt-24">
          List reports
        </h2>
        <Endpoint method="GET" path="/reports" />
        <p>
          Filter by category, confidence, search, and date range. Your
          institution only sees reports it submitted.
        </p>

        <CodeBlock title="Request">
          {`GET ${DOCS_API_BASE}/reports?page=1&page_size=10&category=mule_account
Authorization: Bearer rain_live_...`}
        </CodeBlock>

        <CodeBlock title="200 OK">
          {`{
  "data": [
    {
      "id": "rpt_01hxyz",
      "reference": "RPT-2026-0841",
      "identifier_type": "nin",
      "masked_identifier": "*******8901",
      "masked_email": "s***@mail.ng",
      "category": "mule_account",
      "incident_date": "2026-03-18",
      "independent_source_count": 1,
      "submitted_at": "2026-03-20T10:02:00Z"
    }
  ],
  "total": 18,
  "page": 1,
  "page_size": 10,
  "total_pages": 2
}`}
        </CodeBlock>

        <h2 id="get-one" className="scroll-mt-24">
          Get one report
        </h2>
        <Endpoint method="GET" path="/reports/{id_or_reference}" />
        <p>
          Fetch a single report by id or reference (e.g.{" "}
          <code className="font-mono text-[13px]">RPT-2026-0841</code>).
        </p>

        <CodeBlock title="Request">
          {`GET ${DOCS_API_BASE}/reports/RPT-2026-0841
Authorization: Bearer rain_live_...`}
        </CodeBlock>

        <CodeBlock title="200 OK">
          {`{
  "id": "rpt_01hxyz",
  "reference": "RPT-2026-0841",
  "identifier_type": "nin",
  "masked_identifier": "*******8901",
  "masked_email": "s***@mail.ng",
  "masked_phone": "+234 80* *** 5678",
  "category": "mule_account",
  "description": "Customer received multiple inbound transfers...",
  "incident_date": "2026-03-18",
  "independent_source_count": 1,
  "confidence": {
    "level": "low",
    "independent_source_count": 1,
    "label": "Low · 1",
    "description": "1 independent institution reported this identifier."
  },
  "earnings_generated": 0,
  "submitted_at": "2026-03-20T10:02:00Z"
}`}
        </CodeBlock>
      </DocProse>

      <DocsPager
        prev={{ href: "/docs/verify", label: "Verify users" }}
        next={{ href: "/docs/webhooks", label: "Webhooks" }}
      />
    </DocsShell>
  );
}
