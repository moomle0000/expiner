# AGENTS.md

You are working on the **frontend** for the `expiner` media console.
This repo is a Next.js Pages-Router SPA that talks to a separate backend at
`http://localhost:5000`. The backend's contract is documented in
`swagger.yaml` at the repo root.

## Edit scope

- **Editable (you own this):** `src/`, `next.config.js`, `tsconfig.json`,
  `package.json`, `biome.json`, `.env`, and any new files in this tree.
  **Exception:** the per-tree `Dockerfile` and matching `.dockerignore`
  are editable — see "Docker" below.
- **Read-only context (do not modify):** `swagger.yaml`, `node_modules/`,
  `out/`, `.next/`, `bun.lock`, `bun.lockb`, `package-lock.json`.
- **Out of scope:** the backend (it lives in a separate repo on
  `http://localhost:5000`). Do not create, edit, or assume any backend file
  in this checkout.

## Hard rules

1. **Do not run `npm run dev`, `next dev`, `npx next dev`, `npm start`, or
   `next build`.** The user has their own dev server on port 3055 already.
   Starting a second one fails with `EADDRINUSE`. Use `npx tsc --noEmit` for
   type checks and stop there.
2. **Do not run `npm install` / `bun install` / lockfile edits** unless the
   user asks for it explicitly. The lockfile is the source of truth.
3. **Do not touch `swagger.yaml`.** It describes the external backend, not
   this codebase.
4. **Do not invent backend endpoints.** Every URL you call must already be
   declared in `src/lib/endpoints.ts` or be a literal string that matches a
   path in `swagger.yaml`.
5. **Do not delete or rename the legacy files in `src/lib/`**
   (`axiosprop.ts`, `handleImageUploads.ts`). They are not imported by
   current code but are kept on disk; treat them as read-only.
6. **Pages are thin wrappers.** All non-trivial logic lives in
   `src/components/<area>/` and `src/hooks/`. A page file longer than ~30
   lines is a smell — extract.
7. **No CSS files. No Tailwind classes in app code.** The UI is Chakra UI
   v2 only. New styling goes through the theme tokens defined in
   `src/lib/theme.ts` (ink/accent palette).
8. **Type-safe API access only.** Never call `api.get("/some/path")` with a
   string literal — add a key to `ENDPOINTS` in `src/lib/endpoints.ts` first.
   Response bodies go through `src/types/api.ts`.
9. **Edit-scope reminder:** you may freely edit anything under `src/` and
   project config, but never modify `swagger.yaml`, the lockfiles, or
   anything in `node_modules/`/`out/`/`.next/`.

## Stack (verified against `package.json` and on-disk code)

- **Framework:** Next.js `^16.2.10` (Pages Router — there is **no**
  `src/app/` directory; do not create one).
- **UI:** Chakra UI `2.8.2` + `@emotion/react` + `framer-motion@6` +
  `@chakra-ui/icons`. Fonts loaded from Google Fonts: Space Grotesk
  (headings), Inter (body), JetBrains Mono (mono).
- **Forms:** `react-hook-form`. No Zod/Yup schemas wired in.
- **HTTP:** `axios@^1.8.4`. Two instances on disk: `src/lib/api.ts` (active,
  points at `NEXT_PUBLIC_API_BASE_URL` or `http://localhost:5000`) and
  `src/lib/axiosprop.ts` (legacy, unused — see Hard rule 5).
- **Auth:** JWT in `localStorage.token`. No SSR auth. No NextAuth.
- **i18n:** `next-i18next` config present in `next.config.js` but not wired
  into any page. Default locale `en`; `ar` listed.
- **Tooling:** Biome (`biome.json`), TypeScript `^5` with
  `baseUrl: "src"` and `paths: { "@/*": ["*"] }`. ESLint also present.
- **No test runner, no CI files, no Dockerfiles.** Do not invent them.

## Where things live

```
src/
├── pages/              Next.js Pages Router entry points
│   ├── _app.tsx        Mounts ChakraProvider + AuthProvider; loads fonts
│   ├── index.tsx       Role-based redirect
│   ├── login.tsx       Public
│   ├── signup.tsx      Public
│   ├── admin/          Admin-only (gated by AdminLayout)
│   └── dashboard/      User-facing (gated by DashboardLayout)
├── components/
│   ├── auth/           LoginForm, SignupForm
│   ├── ui/             Reusable Chakra primitives (PageHeader, StatCard,
│   │                   EmptyState, FileDropzone, FileIcon, CopyButton,
│   │                   PasswordInput, ConfirmDialog, RoleBadge, StatusBadge)
│   ├── layouts/        AdminLayout, DashboardLayout, AuthLayout, Sidebar,
│   │                   Topbar, NavItem
│   ├── admin/          Admin-only feature components
│   └── dashboard/      User-facing feature components
├── contexts/           AuthContext, AuthProvider
├── hooks/              useAuth, useFiles, useUsers, useApiKeys, useToastError
├── lib/                api (axios), endpoints (URL map), auth (storage),
│                       format (bytes/dates/initials/owner label), theme
│                       (Chakra theme), axiosprop (legacy, read-only),
│                       handleImageUploads (legacy, read-only)
├── types/api.ts        Shared API types (User, AuthFile, ApiKeyPublic, ...)
└── styles/             (empty)
```

Path-dense domain references live under `agents/<domain>/AGENTS.md` —
**explicit pointers, not auto-loaded** (see Domain references below).

## Domain references

These are **explicit pointers, not auto-loaded.** You must actively open the
file before writing code in that domain. A nested `AGENTS.md` in a parent
directory is auto-loaded by some agent harnesses; these are not — they live
under `agents/` and require a deliberate read.

| Domain | Description | File |
|---|---|---|
| auth | Sign-up, sign-in, session verify, sign-out, self-profile read. | `agents/auth/AGENTS.md` |
| users | Admin user CRUD + self profile + password change + status toggle. | `agents/users/AGENTS.md` |
| files | Upload, list-by-type, stream, download, delete, public short-URL read. | `agents/files/AGENTS.md` |
| api-keys | Mint, list (own + all), revoke, raw-key reveal. | `agents/api-keys/AGENTS.md` |
| locations | Backend-only stub; no UI exists yet. | `agents/locations/AGENTS.md` |

## Cross-cutting / shared infrastructure (not a domain)

These pieces are used by multiple domains. They are listed once here, not
duplicated per domain.

- **Auth context** — `src/contexts/AuthContext.tsx` (`AuthProvider`,
  `AuthContextValue`). Mounted once in `src/pages/_app.tsx`. Hydrates from
  `localStorage.token` on mount by calling `GET /auth/verify`.
- **Layouts** — `src/components/layouts/`
  - `AuthLayout` — login + signup split-panel
  - `AdminLayout` — admin shell, gates `isAdmin`, redirects non-admins to
    `/dashboard` and unauthenticated users to `/login`. Owns the
    `navOpen` state for the mobile drawer.
  - `DashboardLayout` — user shell, gates `isAuthenticated`. Owns the
    `navOpen` state for the mobile drawer.
  - `ResponsiveSidebar` — fixed 260px sidebar on `lg+`, left-anchored
    Chakra `Drawer` below `lg`. Single source of truth for nav
    sections via `getSidebarSections({ role })`.
  - `MobileDrawer` + `HamburgerButton` — the Chakra `Drawer` wrapper
    used by `ResponsiveSidebar` and the hamburger button embedded in
    the topbar (only visible below `lg`).
  - `Sidebar` — legacy single-breakpoint shim; no longer wired into
    the app. Safe to remove in a follow-up; do not reintroduce.
  - `Topbar` — breadcrumb title slot + hamburger on the left
    (below `lg`) + avatar menu + sign-out. Accepts an optional
    `onOpenNav` callback to flip the drawer state owned by the
    surrounding layout.
  - `NavItem` — active-state-aware link used inside
    `ResponsiveSidebar`. Renders `minH: 44px` on mobile/tablet
    (below `md`) for proper touch targets; `onNavigate` callback
    closes the drawer after a tap.
- **Shared hooks** — `src/hooks/`
  - `useAuth` — context wrapper, the only public auth accessor
  - `useToastError` — wraps `extractErrorMessage` for consistent error toasts
- **Shared UI primitives** — `src/components/ui/` (PageHeader, StatCard,
  EmptyState, FileDropzone, FileIcon, CopyButton, PasswordInput,
  ConfirmDialog, RoleBadge, StatusBadge). Add new ones here, not in
  feature folders, so they can be reused.
- **API surface** — `src/lib/api.ts` (axios instance + `extractErrorMessage`),
  `src/lib/endpoints.ts` (URL map; the only place a literal URL string
  belongs; exposes `getApiBaseUrl()` and an `API_BASE_URL` proxy getter
  that re-evaluates per call), `src/lib/auth.ts` (`storage` localStorage
  helpers), `src/lib/format.ts` (`formatBytes`, `formatDate`,
  `formatRelative`, `getInitials`, `getOwnerLabel`),
  `src/lib/theme.ts` (Chakra theme tokens — `ink`, `brand`,
  `accent.{lime,magenta,cyan,amber}`).
- **Types** — `src/types/api.ts` is the single source of truth for
  request/response shapes; mirror `swagger.yaml` here.

## Data flow

A typical request (e.g. "list my files") flows like this:

```
[UI click in <MyFilesGrid>]
        │
        ▼
[useFiles() hook in src/hooks/useFiles.ts]
        │  calls ENDPOINTS.files via the shared axios instance
        ▼
[lib/api.ts axios interceptor] ── attaches `Authorization: Bearer <token>`
        │  from localStorage.token
        ▼
[HTTP request to http://localhost:5000/api/files]
        │  backend validates JWT (or X-API-Key), returns { data: [...], message }
        ▼
[axios resolves] ── typed cast via src/types/api.ts
        ▼
[useFiles updates state: setFiles(res.data.data)]
        ▼
[<MyFilesGrid> re-renders cards from state]
```

For destructive actions (delete user, revoke key, delete file) the
component triggers a `ConfirmDialog` and then either:

- **Optimistic local mutation** (used by `useApiKeys.revoke` and
  `useUsers.setUserStatus` / `useUsers.deleteUser`): patch state in place
  after the API resolves, no re-fetch.
- **Server-authoritative** (used by `useFiles.remove`): drop the row from
  state after the API resolves.

For uploads (`FileDropzone` → `POST /api/files/upload`) the form is
`multipart/form-data` with field `file`, optionally an `X-Folder` header.
One toast covers the whole batch regardless of file count.

For session bootstrap, `AuthContext.refresh` is called once from
`AuthProvider` on mount. A 401 response is treated as "no session" — it
clears local storage and resolves to `null` without surfacing an error.

## Adding a new feature (canonical pattern)

Follow these steps in order. Skip none. Add a final note at the end.

0. **Read the domain file first.** Find your domain in the Domain
   references table above and open `agents/<domain>/AGENTS.md`. If the
   feature spans more than one domain, read every file that applies. If no
   existing domain fits, **stop and flag it to the user** — do not invent
   a new domain silently.
1. **Add or update the type** in `src/types/api.ts`. Mirror the shape
   declared in `swagger.yaml` at the repo root.
2. **Add the URL** to `ENDPOINTS` in `src/lib/endpoints.ts`. Never pass
   string-literal URLs to `api.*`.
3. **Add or extend the hook** in `src/hooks/`. Follow the existing
   pattern: `useCallback`-wrapped mutators, local state for `loading` /
   `error` / data, optimistic updates where safe.
4. **Build the feature component** under
   `src/components/<admin|dashboard>/`. Co-locate any modals/dialogs in
   the same folder. Pull shared pieces from `src/components/ui/`.
5. **Add the page** under `src/pages/<admin|dashboard>/`. The page is a
   thin composition of layout + `PageHeader` + the feature component.
6. **Wire the route into `Sidebar`** by editing
   `src/components/layouts/Sidebar.tsx`. Add the new item to the correct
   `SidebarSection` for the role (admin or user) and import the icon.
7. **Update `agents/<domain>/AGENTS.md`** with every new path you added
   or changed, plus any rules that emerged while building. **Not
   optional** — the next agent reads this file before touching the
   domain.

## Project-wide structural conventions

- **Pages are thin wrappers, components hold logic.** A page file is
  layout + `PageHeader` + one feature component + `Head`. Anything more
  is a smell.
- **One hook per feature, co-located in `src/hooks/`.** Hooks own the
  fetch + mutation state; components own presentation.
- **Endpoints are centralized.** `src/lib/endpoints.ts` is the only
  place a URL string is allowed. `src/lib/api.ts` is the only axios
  instance used by current code.
- **Response envelope is `{ data, message }` on success and
  `{ message }` on error.** `extractErrorMessage` in `src/lib/api.ts`
  reads `.message` from both shapes.
- **Chakra is the only UI system.** No `.css` / `.scss` / `.module.css`
  files; no Tailwind class strings in app code (the legacy
  `tailwind.config.ts` exists but is unused by current code — do not
  reintroduce it). Theme tokens live in `src/lib/theme.ts`.
- **TypeScript `paths` alias is `@/*` → `src/*`.** All imports use the
  alias; do not use relative paths across folder boundaries.
- **Trailing slashes are on** (`next.config.js` → `trailingSlash: true`).
  Every route is `/login/`, `/admin/users/`, etc. Internal `Link`
  components and `router.replace` calls should not include a trailing
  slash — Next adds it.

## Docker

- `Dockerfile` — multi-stage build that matches `output: 'standalone'`
  in `next.config.js`. Stage 1 installs deps; stage 2 runs
  `next build` (which writes `.next/standalone/server.js` plus
  `.next/static/` and the `public/` folder); stage 3 ships a slim
  Node 20 image containing only the standalone output + static assets.
  The standalone output includes its own pruned `node_modules`; the
  runtime stage does **not** reinstall prod deps.
- `NEXT_PUBLIC_API_BASE_URL` resolution: docker-compose passes it as
  both a **build-arg** (baked into the bundle for the SSR pass and
  the first client paint) and a **runtime env var** (read by
  `src/pages/api/_config.ts` per request, then injected into
  `window.__API_BASE_URL__` by `_app.tsx` on mount). The axios
  request interceptor (`src/lib/api.ts`) re-evaluates
  `getApiBaseUrl()` on every call, so a runtime env change takes
  effect on the next browser reload — the image does **not** need
  to be rebuilt for runtime changes.
- `.dockerignore` excludes `node_modules`, `.next`, the lockfiles, and
  the Dockerfile itself.
- `docker-compose.yml` at the repo root builds this image and
  forwards host port `3055` → container port `3055`. The browser
  reaches the backend over the public URL set in
  `NEXT_PUBLIC_API_BASE_URL`, not the Docker network alias.

### Runtime API base URL
- `src/pages/api/_config.ts` — `GET /api/_config` returns
  `{ apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5601' }`.
  Re-reads the env on every request, so an env change at container
  start takes effect on the next page load. No DB / no auth — pure
  config relay.
- `src/lib/endpoints.ts` — `getApiBaseUrl()` resolves the URL on
  every call (in this order): `window.__API_BASE_URL__`, then
  `process.env.NEXT_PUBLIC_API_BASE_URL`, then a hardcoded fallback
  of `http://localhost:5601`. The `API_BASE_URL` const is a Proxy
  that re-evaluates on every read so existing call sites
  (`MyFilesGrid` etc.) keep working and pick up the runtime value
  automatically.
- `src/lib/api.ts` — axios instance with a request interceptor that
  re-sets `config.baseURL = getApiBaseUrl()` per request and
  attaches the `Authorization: Bearer <token>` from
  `localStorage.token`. `baseURL` is intentionally **not** set at
  axios creation — see comment in the file for why.
