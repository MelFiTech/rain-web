/** Public developer API base (v1). */
export const DOCS_API_BASE =
  process.env.NEXT_PUBLIC_DOCS_API_BASE ?? "https://api.rain.ng/v1";

/** Dashboard / platform API (JWT). */
export const PLATFORM_API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:9090";

export type DocsNavChild = {
  href: string;
  label: string;
};

export type DocsNavItem = {
  href: string;
  label: string;
  children?: DocsNavChild[];
};

export const DOCS_NAV: DocsNavItem[] = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/authentication", label: "Authentication" },
  {
    href: "/docs/verify",
    label: "Verify users",
    children: [
      { href: "/docs/verify#create", label: "Create verification" },
      { href: "/docs/verify#list", label: "List verifications" },
      { href: "/docs/verify#get-one", label: "Get one verification" },
    ],
  },
  {
    href: "/docs/reports",
    label: "Submit reports",
    children: [
      { href: "/docs/reports#create", label: "Create report" },
      { href: "/docs/reports#list", label: "List reports" },
      { href: "/docs/reports#get-one", label: "Get one report" },
    ],
  },
  { href: "/docs/webhooks", label: "Webhooks" },
  { href: "/docs/errors", label: "Errors & limits" },
];
