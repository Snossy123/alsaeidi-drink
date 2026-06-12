import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiClient, clearAuthSession, getStoredToken, getStoredUser, setAuthSession } from "@/lib/apiClient";
import type { AuthUser, AuthUserType, LoginResponse } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (type: AuthUserType, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isManagerOrAbove: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient<{ user: AuthUser }>("/auth/me");
        setUser(data.user);
        setToken(storedToken);
      } catch {
        clearAuthSession();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (type: AuthUserType, email: string, password: string) => {
    const endpoint = type === "admin" ? "/auth/admin/login" : "/auth/employee/login";
    const data = await apiClient<LoginResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setAuthSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient("/auth/logout", { method: "POST" });
      }
    } catch {
      // ignore
    } finally {
      clearAuthSession();
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAdmin: user?.role === "admin",
      isManagerOrAbove: user?.role === "admin" || user?.role === "manager",
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
