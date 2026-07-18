import { delay } from "@/lib/utils";
import type { AuthSession, User } from "@/types";
import { MOCK_USER } from "./mock-data";

const AUTH_KEY = "rain_auth_session";

const VALID_CREDENTIALS = {
  email: "compliance@paynest.ng",
  password: "password123",
};

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type LoginResult =
  | { success: true; session: AuthSession }
  | { success: false; error: string };

function createSession(user: User): AuthSession {
  return {
    user,
    token: `mock_token_${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function login(request: LoginRequest): Promise<LoginResult> {
  await delay(900);

  if (!request.email || !request.password) {
    return { success: false, error: "Email and password are required." };
  }

  const email = request.email.trim().toLowerCase();
  if (
    email !== VALID_CREDENTIALS.email ||
    request.password !== VALID_CREDENTIALS.password
  ) {
    return {
      success: false,
      error: "Invalid email or password. Please try again.",
    };
  }

  const session = createSession(MOCK_USER);
  if (typeof window !== "undefined") {
    const storage = request.rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_KEY, JSON.stringify(session));
    if (request.rememberMe) {
      sessionStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }

  return { success: true, session };
}

export async function logout(): Promise<void> {
  await delay(200);
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(200);
  return getSession()?.user ?? null;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
