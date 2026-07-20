import { DocsShell } from "@/components/docs/docs-shell";
import {
  Callout,
  CodeBlock,
  DocCodeTabs,
  DocLead,
  DocProse,
  DocsPager,
  Endpoint,
  ParamTable,
} from "@/components/docs/docs-ui";
import { DOCS_API_BASE } from "@/lib/docs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify users | Rain API docs",
};

export default function DocsVerifyPage() {
  return (
    <DocsShell title="Verify users">
      <DocLead>
        Cross-reference a customer during onboarding: pass their BVN or NIN (via{" "}
        <code className="font-mono text-[13px]">identifier_type</code>), their
        email, and any optional profile fields. Rain returns whether the network
        has flagged them or they appear clean, with confidence when multiple
        institutions agree.
      </DocLead>

      <DocProse>
        <h2 id="create" className="scroll-mt-24">
          Create a verification
        </h2>
        <Endpoint method="POST" path="/verifications" />

        <p>
          Use this at onboarding before you activate an account.{" "}
          <code className="font-mono text-[13px]">identifier_type</code> must be{" "}
          <code className="font-mono text-[13px]">bvn</code> or{" "}
          <code className="font-mono text-[13px]">nin</code>. The matching{" "}
          <code className="font-mono text-[13px]">identifier</code> and{" "}
          <code className="font-mono text-[13px]">email</code> are required.
          Phone, bank account, and other fields are optional but improve
          matching when you have them.
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
              description:
                "11-digit BVN or NIN value (normalized server-side).",
            },
            {
              name: "email",
              type: "string",
              required: true,
              description: "Customer email used for cross-reference.",
            },
            {
              name: "phone",
              type: "string",
              description: "Optional. E.164 or local Nigerian mobile format.",
            },
            {
              name: "account_number",
              type: "string",
              description: "Optional. 10-digit NUBAN if collected at onboarding.",
            },
            {
              name: "bank_code",
              type: "string",
              description:
                "Optional. NIP bank code when account_number is provided.",
            },
            {
              name: "full_name",
              type: "string",
              description: "Optional. Customer name if already collected.",
            },
          ]}
        />

        <CodeBlock title="Request">
          {`POST ${DOCS_API_BASE}/verifications
Content-Type: application/json
Authorization: Bearer rain_live_...

{
  "identifier_type": "bvn",
  "identifier": "22222222222",
  "email": "adaora.okafor@mail.ng",
  "phone": "+2348031234567"
}`}
        </CodeBlock>

        <DocCodeTabs
          heading="Response"
          codeTitle="201 Created"
          tabs={[
            {
              id: "match",
              label: "Match",
              code: `{
  "id": "ver_01hxyz",
  "reference": "VER-M8K2-A1B3",
  "identifier_type": "bvn",
  "masked_identifier": "*******2222",
  "result": "match",
  "confidence": {
    "level": "high",
    "independent_source_count": 7,
    "label": "High · 7",
    "description": "7 independent institutions reported this identifier."
  },
  "independent_source_count": 7,
  "total_reports": 12,
  "categories": ["fraud", "mule_account"],
  "first_reported_at": "2025-12-01T10:00:00Z",
  "most_recent_report_at": "2026-03-20T09:15:00Z",
  "created_at": "2026-03-20T09:15:02Z"
}`,
            },
            {
              id: "no_match",
              label: "No match",
              code: `{
  "id": "ver_01habc",
  "reference": "VER-T9X1-C4D2",
  "identifier_type": "nin",
  "masked_identifier": "*******1188",
  "result": "no_match",
  "confidence": null,
  "independent_source_count": 0,
  "created_at": "2026-03-20T09:16:11Z"
}`,
            },
          ]}
        />

        <Callout title="Interpret results">
          A <code className="font-mono text-[13px]">no_match</code> means Rain
          has no qualifying network signal. It is not a guarantee that the customer is
          safe. Combine with your own KYC, device, and transaction rules.
        </Callout>

        <h2 id="list" className="scroll-mt-24">
          List verifications
        </h2>
        <Endpoint method="GET" path="/verifications" />
        <p>
          Paginated history for your institution. Supports{" "}
          <code className="font-mono text-[13px]">page</code>,{" "}
          <code className="font-mono text-[13px]">page_size</code>,{" "}
          <code className="font-mono text-[13px]">result</code>,{" "}
          <code className="font-mono text-[13px]">confidence</code>,{" "}
          <code className="font-mono text-[13px]">search</code>, and date
          filters.
        </p>

        <CodeBlock title="Request">
          {`GET ${DOCS_API_BASE}/verifications?page=1&page_size=10&result=match
Authorization: Bearer rain_live_...`}
        </CodeBlock>

        <CodeBlock title="200 OK">
          {`{
  "data": [
    {
      "id": "ver_01hxyz",
      "reference": "VER-M8K2-A1B3",
      "identifier_type": "bvn",
      "masked_identifier": "*******2222",
      "result": "match",
      "confidence": {
        "level": "high",
        "independent_source_count": 7,
        "label": "High · 7",
        "description": "7 independent institutions reported this identifier."
      },
      "independent_source_count": 7,
      "created_at": "2026-03-20T09:15:02Z"
    },
    {
      "id": "ver_01habc",
      "reference": "VER-T9X1-C4D2",
      "identifier_type": "nin",
      "masked_identifier": "*******1188",
      "result": "no_match",
      "confidence": null,
      "independent_source_count": 0,
      "created_at": "2026-03-19T14:22:11Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 10,
  "total_pages": 5
}`}
        </CodeBlock>

        <h2 id="get-one" className="scroll-mt-24">
          Get one verification
        </h2>
        <Endpoint method="GET" path="/verifications/{id_or_reference}" />
        <p>
          Fetch a single record by Rain id (e.g.{" "}
          <code className="font-mono text-[13px]">ver_01hxyz</code>) or
          reference (e.g.{" "}
          <code className="font-mono text-[13px]">VER-M8K2-A1B3</code>).
        </p>

        <CodeBlock title="Request">
          {`GET ${DOCS_API_BASE}/verifications/VER-M8K2-A1B3
Authorization: Bearer rain_live_...`}
        </CodeBlock>

        <CodeBlock title="200 OK">
          {`{
  "id": "ver_01hxyz",
  "reference": "VER-M8K2-A1B3",
  "identifier_type": "bvn",
  "masked_identifier": "*******2222",
  "result": "match",
  "confidence": {
    "level": "high",
    "independent_source_count": 7,
    "label": "High · 7",
    "description": "7 independent institutions reported this identifier."
  },
  "independent_source_count": 7,
  "total_reports": 12,
  "categories": ["fraud", "mule_account"],
  "first_reported_at": "2025-12-01T10:00:00Z",
  "most_recent_report_at": "2026-03-20T09:15:00Z",
  "created_at": "2026-03-20T09:15:02Z"
}`}
        </CodeBlock>
      </DocProse>

      <DocsPager
        prev={{ href: "/docs/authentication", label: "Authentication" }}
        next={{ href: "/docs/reports", label: "Submit reports" }}
      />
    </DocsShell>
  );
}
