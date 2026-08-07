// API base URL resolution order (re-evaluated every call — NOT at module load):
//   1. window.__API_BASE_URL__         set at runtime by _app.tsx after fetching
//                                      /api/_config (which itself reads the
//                                      container's env var). This is the value
//                                      that wins in production / Docker.
//   2. process.env.NEXT_PUBLIC_API_BASE_URL
//                                      baked into the bundle at build time
//                                      (NEXT_PUBLIC_* is inlined by Next.js).
//                                      Useful for the SSR pass and as a fallback
//                                      if the /api/_config fetch is in flight.
//   3. http://localhost:5601           final fallback so a fresh clone doesn't
//                                      crash. (Was localhost:5000; the backend
//                                      listens on 5601 per backend/src/app.ts.)
//
// Why a function and not a const: the original module-level `resolveApiBaseUrl()`
// ran once when webpack imported the module, before `_app.tsx`'s effect had a
// chance to set `window.__API_BASE_URL__`. The axios instance cached that early
// value forever. A getter re-evaluates on every read, so the runtime-injected
// value wins once `_app.tsx` finishes its mount-time fetch.

declare global {
  interface Window {
    __API_BASE_URL__?: string;
  }
}

const FALLBACK_API_BASE_URL = "http://localhost:5601";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_BASE_URL &&
    process.env.NEXT_PUBLIC_API_BASE_URL.length > 0
  ) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return FALLBACK_API_BASE_URL;
}

// Re-evaluating getter — existing callers that read `API_BASE_URL` keep
// working and pick up the runtime-injected value on every access. Cheap
// (no I/O, just a few conditional checks). The Proxy handles toString
// / valueOf / Symbol.toPrimitive so template-literal and string-concat
// use (e.g. `${API_BASE_URL}/f/...`) get the current value, not a
// function reference.
function toStringOrValue(): string {
  return getApiBaseUrl();
}
export const API_BASE_URL: string = new Proxy(
  {} as string,
  {
    get(_target, prop) {
      if (
        prop === "toString" ||
        prop === "valueOf" ||
        prop === Symbol.toPrimitive
      ) {
        return () => toStringOrValue();
      }
      return getApiBaseUrl();
    },
  },
) as unknown as string;

export const ENDPOINTS = {
  signup: "/auth/signup",
  login: "/auth/login",
  logout: "/auth/logout",
  verify: "/auth/verify",
  profile: "/auth/profile",
  adminResetPassword: "/auth/admin/reset-password",

  me: "/api/auth/me",
  mePassword: "/api/auth/me/password",

  myKeys: "/api/auth/keys",
  revokeKey: (id: string) => `/api/auth/keys/${id}/revoke`,

<<<<<<< HEAD
  folders: "/api/folders",
  createFolder: "/api/folders",
  deleteFolder: (id: string) => `/api/folders/${id}`,

  categories: "/api/categories",
  createCategory: "/api/categories",
  deleteCategory: (id: string) => `/api/categories/${id}`,

  files: "/api/files",
  filesByType: (type: string) => `/api/files/type/${type}`,
  filesByCategory: (category: string) => `/api/files?category=${encodeURIComponent(category)}`,
=======
  files: "/api/files",
  filesByType: (type: string) => `/api/files/type/${type}`,
>>>>>>> origin/main
  file: (id: string, ext?: string) =>
    ext ? `/api/files/${id}.${ext}` : `/api/files/${id}`,
  fileDownload: (id: string) => `/api/files/${id}/download`,
  fileUpload: "/api/files/upload",
  deleteFile: (id: string) => `/api/files/${id}`,

  infoByShortUrl: (shortUrl: string) => `/info/${shortUrl}`,
  publicFile: (shortUrl: string, ext?: string) =>
    ext ? `/f/${shortUrl}.${ext}` : `/f/${shortUrl}`,

  adminKeys: "/api/admin/keys",
  users: "/users",
  user: (id: string) => `/users/${id}`,
  adminUserList: "/users/admin",
  locations: "/api/locations",

  // Runtime config endpoint — see `pages/api/_config.ts`. The only
  // API path that resolves against the frontend's own origin (not
  // the backend), so it lives here for centralization.
  runtimeConfig: "/api/_config",
} as const;
