import {
  apiGet,
  apiPost,
  isApiConfigured,
} from "@/lib/api-client";
import { getSession, setSession, clearSession } from "@/lib/session";
import type { AuthSession, User } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type LoginResult =
  | { success: true; session: AuthSession }
  | { success: false; error: string };

type LoginResponse =
  | { success: true; session: AuthSession }
  | { success: false; error: string };

export async function login(request: LoginRequest): Promise<LoginResult> {
  if (!request.email || !request.password) {
    return { success: false, error: "Email and password are required." };
  }

  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "Rain API is not configured. Set NEXT_PUBLIC_API_URL in your environment.",
    };
  }

  try {
    const result = await apiPost<LoginResponse>("/platform/auth/login", {
      email: request.email.trim(),
      password: request.password,
    });
    if (!result.success || !("session" in result) || !result.session) {
      return {
        success: false,
        error:
          ("error" in result && result.error) ||
          "Invalid email or password. Please try again.",
      };
    }
    setSession(result.session, Boolean(request.rememberMe));
    return { success: true, session: result.session };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Invalid email or password. Please try again.";
    return { success: false, error: message };
  }
}

export async function logout(): Promise<void> {
  if (isApiConfigured()) {
    try {
      await apiPost("/platform/auth/logout");
    } catch {
      /* clear local session even if logout request fails */
    }
  }
  clearSession();
}

export async function getCurrentUser(): Promise<User | null> {
  const local = getSession()?.user;
  if (!isApiConfigured()) {
    return local ?? null;
  }

  try {
    const res = await apiGet<{ user: User }>("/platform/auth/me");
    return res.user;
  } catch {
    return local ?? null;
  }
}

export { getSession, isAuthenticated } from "@/lib/session";
