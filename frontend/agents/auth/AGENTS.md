# Domain: auth

Sign-up, sign-in, session verification, sign-out. Self-service profile read.
Backend contract documented in `swagger.yaml` at the repo root; this repo
is frontend-only — there are no model/service/controller files here.

## Pages
- `src/pages/login.tsx` — `AuthLayout` + `LoginForm`. Honors `?next=` query param.
- `src/pages/signup.tsx` — `AuthLayout` + `SignupForm`. Auto-signs in and routes to `/dashboard`.
- `src/pages/index.tsx` — Role-based redirect (`/admin` if `isAdmin`, else `/dashboard`, else `/login`).

## Feature components
- `src/components/auth/LoginForm.tsx` — react-hook-form, `useAuth().login`. Routes by role on success.
- `src/components/auth/SignupForm.tsx` — react-hook-form, `useAuth().signup`. Always routes to `/dashboard` (signup creates `role: "user"`).

## Context
- `src/contexts/AuthContext.tsx` — `AuthProvider`, `AuthContextValue`. Owns the JWT in memory, syncs to `localStorage.token` and `localStorage.user`. Exposes `login`, `signup`, `logout`, `refresh`, `setUser`, `isAdmin`.

## Hook
- `src/hooks/useAuth.ts` — Thin wrapper over `AuthContext`.

## Types
- `src/types/api.ts` — `User`, `UserRole`, `LoginResponse`.

## Endpoints used (see `src/lib/endpoints.ts`)
- `POST /auth/login` — `ENDPOINTS.login`
- `POST /auth/signup` — `ENDPOINTS.signup`
- `POST /auth/logout` — `ENDPOINTS.logout`
- `GET  /auth/verify` — `ENDPOINTS.verify` (called on app mount by `AuthContext.refresh`)

## Shared dependencies
- `AuthLayout` — `src/components/layouts/AuthLayout.tsx`
- `PasswordInput` — `src/components/ui/PasswordInput.tsx`
- `extractErrorMessage` — `src/lib/api.ts`

## Rules
- `AuthContext.refresh` is the only place that reads `localStorage.token`; it is called once on mount in `_app.tsx`.
- A 401 from `/auth/verify` on mount is silently swallowed and clears local storage — never surfaced as a toast.
- The login `?next=` query param is honored, but only if the value is a same-origin path; the page should not allow open redirects.
- After signup the user is always routed to `/dashboard`; the `role: "user"` default is set server-side.
- `useAuth().isAdmin` is derived purely from `user?.role === "admin"`.
