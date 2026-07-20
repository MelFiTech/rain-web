const API_BASE = () =>
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";

export type InvitePreview = {
  kind: "team" | "onboarding";
  name: string;
  email: string;
  role: string;
  institutionName: string;
};

export async function previewInvite(
  token: string
): Promise<InvitePreview | null> {
  const base = API_BASE();
  if (!base || !token.trim()) return null;
  try {
    const res = await fetch(
      `${base}/public/invites/preview?token=${encodeURIComponent(token.trim())}`
    );
    if (!res.ok) return null;
    return (await res.json()) as InvitePreview;
  } catch {
    return null;
  }
}

export async function acceptInvite(input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<
  | {
      success: true;
      session?: {
        user: unknown;
        token: string;
        expiresAt: string;
      };
      message?: string;
    }
  | { success: false; error: string }
> {
  const base = API_BASE();
  if (!base) {
    return { success: false, error: "Rain API is not configured." };
  }
  try {
    const res = await fetch(`${base}/public/invites/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await res.json()) as {
      success?: boolean;
      session?: { user: unknown; token: string; expiresAt: string };
      message?: string;
      error?: string;
    };
    if (!res.ok) {
      return {
        success: false,
        error: body.message ?? body.error ?? "Could not accept invitation.",
      };
    }
    if (body.session) {
      return { success: true, session: body.session };
    }
    return { success: true, message: body.message };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not accept invitation.",
    };
  }
}
