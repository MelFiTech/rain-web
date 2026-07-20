import { ApiRequestError, isApiConfigured } from "@/lib/api-client";

export type SubmitAccessRequestInput = {
  companyName: string;
  cacNumber: string;
  email: string;
  password: string;
};

export async function submitAccessRequest(
  input: SubmitAccessRequestInput
): Promise<
  | { success: true; reference: string }
  | { success: false; error: string }
> {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (!base) {
    return {
      success: false,
      error:
        "Rain API is not configured. Set NEXT_PUBLIC_API_URL in your environment.",
    };
  }

  try {
    const res = await fetch(`${base}/public/access-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      let message = "Could not submit your request. Try again.";
      try {
        const body = (await res.json()) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
        if (Array.isArray(message)) {
          message = message.join(" ");
        }
      } catch {
        /* ignore */
      }
      return { success: false, error: message };
    }
    const data = (await res.json()) as { success: boolean; reference: string };
    if (!data.success || !data.reference) {
      return { success: false, error: "Could not submit your request." };
    }
    return { success: true, reference: data.reference };
  } catch (e) {
    if (e instanceof ApiRequestError) {
      return { success: false, error: e.message };
    }
    const message =
      e instanceof Error ? e.message : "Could not submit your request.";
    if (message === "Failed to fetch" || message.includes("NetworkError")) {
      return {
        success: false,
        error:
          "Could not reach the Rain API. Check that NEXT_PUBLIC_API_URL is correct and the API allows your site (CORS / WEB_APP_URL).",
      };
    }
    return { success: false, error: message };
  }
}

/** @deprecated use isApiConfigured from api-client for dashboard calls */
export function isAccessApiConfigured(): boolean {
  return isApiConfigured() || Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
}
