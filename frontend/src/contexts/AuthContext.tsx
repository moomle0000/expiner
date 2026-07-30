import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { storage } from "@/lib/auth";
import type { User } from "@/types/api";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: { name: string; username: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
  setUser: (u: User | null) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) storage.setUser(u);
    else storage.clearUser();
  }, []);

  const refresh = useCallback(async (): Promise<User | null> => {
    const t = storage.getToken();
    if (!t) {
      setLoading(false);
      return null;
    }
    setToken(t);
    try {
      const res = await api.get(ENDPOINTS.verify);
      const u = res.data?.data as User | undefined;
      if (u) {
        setUser(u);
        return u;
      }
      return null;
    } catch (err) {
      // 401 here is normal on first load — don't surface it
      void extractErrorMessage(err, "");
      storage.clearAll();
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post(ENDPOINTS.login, { email, password });
      const { data, token: jwt } = res.data as { data: User; token: string };
      storage.setToken(jwt);
      setToken(jwt);
      setUser(data);
      return data;
    },
    [setUser],
  );

  const signup = useCallback(
    async (payload: { name: string; username: string; email: string; password: string }) => {
      const res = await api.post(ENDPOINTS.signup, payload);
      const { data, token: jwt } = res.data as { data: User; token: string };
      storage.setToken(jwt);
      setToken(jwt);
      setUser(data);
      return data;
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    try {
      await api.post(ENDPOINTS.logout);
    } catch {
      // ignore
    }
    storage.clearAll();
    setToken(null);
    setUser(null);
  }, [setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin",
      loading,
      login,
      signup,
      logout,
      refresh,
      setUser,
    }),
    [user, token, loading, login, signup, logout, refresh, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
