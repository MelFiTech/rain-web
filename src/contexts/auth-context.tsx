"use client";

import {
  getSession,
  login as loginService,
  logout as logoutService,
  type LoginRequest,
} from "@/services/auth";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/api-client";
import type { AuthSession, User } from "@/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (
    request: LoginRequest
  ) => Promise<{ success: true } | { success: false; error: string }>;
  logout: () => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(() => {
    const session = getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      if (!window.location.pathname.startsWith("/login")) {
        router.replace("/login");
      }
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () =>
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [router]);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await loginService(request);
    if (result.success) {
      setUser(result.session.user);
      return { success: true as const };
    }
    return { success: false as const, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { AuthSession };
