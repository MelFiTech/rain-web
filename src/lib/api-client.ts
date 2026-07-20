import { clearSession, getSession } from "@/lib/session";

/** Fired after session is cleared due to API 401 (AuthProvider navigates to login). */
export const AUTH_SESSION_EXPIRED_EVENT = "rain:auth-session-expired";

function handleUnauthorized(path: string): void {
  if (typeof window === "undefined") return;
  if (path.includes("/platform/auth/login")) return;
  if (!getSession()?.token) return;

  clearSession();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

export class ApiNotConfiguredError extends Error {
  readonly code = "API_NOT_CONFIGURED" as const;

  constructor() {
    super(
      "Rain API is not configured. Set NEXT_PUBLIC_API_URL in your environment."
    );
    this.name = "ApiNotConfiguredError";
  }
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function isApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
}

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (!base) throw new ApiNotConfiguredError();
  return base;
}

function buildHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getSession()?.token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function parseErrorMessage(res: Response): Promise<{
  message: string;
  fieldErrors?: Record<string, string>;
}> {
  try {
    const body = (await res.json()) as {
      message?: string;
      error?: string;
      field_errors?: Record<string, string>;
      fieldErrors?: Record<string, string>;
    };
    return {
      message: body.message || body.error || res.statusText || "Request failed",
      fieldErrors: body.field_errors ?? body.fieldErrors,
    };
  } catch {
    return { message: res.statusText || "Request failed" };
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init.headers),
  });

  if (!res.ok) {
    const { message, fieldErrors } = await parseErrorMessage(res);
    if (res.status === 401) {
      handleUnauthorized(path);
    }
    throw new ApiRequestError(message, res.status, fieldErrors);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}
