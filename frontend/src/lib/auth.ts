import type { User } from "@/types/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const storage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(USER_KEY);
  },
  clearAll() {
    storage.clearToken();
    storage.clearUser();
  },
};
