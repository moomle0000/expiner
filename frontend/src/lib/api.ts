import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "./endpoints";

const api = axios.create({
  // `baseURL` is set per-request via the interceptor below so a
  // runtime-injected `window.__API_BASE_URL__` (set after mount by
  // `_app.tsx` from /api/_config) wins. Without this, axios caches
  // the build-time value forever.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Re-evaluate on every request. Cheap (no I/O).
  config.baseURL = getApiBaseUrl();

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string }>;
    const data = ax.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (ax.message) return ax.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default api;
