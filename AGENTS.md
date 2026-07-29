# AGENTS.md

Root documentation index for the `express-upload` monorepo. Two deployable
trees — `backend/` (Express + Mongoose + TypeScript API on port **5601**)
and `frontend/` (Next.js Pages-Router SPA on port **3055**) — with five
cross-tree business domains.

**Edit scope.**
- **Editable:** nothing at the repo root. The user owns `backend/` and
  `frontend/` separately. Each subtree has its own `AGENTS.md` that
  defines its own edit-scope rules; read that file before touching code
  in either subtree.
- **Read-only context at the root:** this file. Do not create files at
  the repo root unless the user asks for it.

## Hard rules

1. **Do not run `npm run dev` / `nodemon` in `backend/` or `npm run dev`
   / `next dev` / `npm start` / `next build` in `frontend/`.** Each
   subtree runs its own dev server. Use `npx tsc --noEmit` (frontend)
   and `npm run build` (backend) for one-off verification.
2. **Do not run `npm install` / `bun install` in either subtree unless
   the user explicitly asks.** Lockfiles are the source of truth.
3. **Do not touch `backend/swagger.yaml` or `frontend/swagger.yaml`.**
   They are the contract the frontend codes against. Update the
   corresponding `agents/<domain>/AGENTS.md` if the wire contract
   changes instead.
4. **Do not invent cross-tree coupling.** A new endpoint must already
   be declared in `frontend/src/lib/endpoints.ts` *and* registered by a
   route class in `backend/src/server.ts`. If only one side exists, stop
   and flag it.
5. **Do not create new `agents/<domain>/AGENTS.md` files at this
   level.** Per-domain detail lives in the per-tree folders:
   `backend/agents/<domain>/AGENTS.md` and
   `frontend/agents/<domain>/AGENTS.md`. This root file is a pointer,
   not a duplicate.
6. **Edit-scope reminder.** App code lives in `backend/src/` or
   `frontend/src/`. The root, both `AGENTS.md` files inside the
   subtrees, all `node_modules/`, `dist/`, `out/`, `.next/`, lockfiles,
   and `uploads/` are out of scope. **Exception:** Docker assets
   (`Dockerfile`, `Dockerfile.*`, `docker-compose.yml`,
   `docker-compose.*.yml`, the root `.env` used by compose) and the
   matching `.dockerignore` files are editable — the user owns the
   containerization story for this repo.

## Stack (verified against `package.json` files and on-disk code)

- **Backend** — `backend/package.json`: Node + Express `^4.18.1`,
  Mongoose `^6.5.0` (MongoDB), TypeScript `^4.7.4`, typedi `^0.10.0`
  (`@Service()` + `Container.get()`), class-validator `^0.13.2`,
  multer `^1.4.5-lts.1`, winston `^3.8.1` + winston-daily-rotate-file,
  bcrypt `^5`, jsonwebtoken `^8.5.1`, cors `^2.8.5`. Build is SWC
  (`@swc/cli` + `@swc/core`), not tsc. Listens on `PORT=5601`.
- **Frontend** — `frontend/package.json`: Next.js `^16.2.10` Pages
  Router (no `src/app/`), Chakra UI `2.8.2` + `@emotion/react` +
  `framer-motion@6` + `@chakra-ui/icons`, axios `^1.8.4`,
  react-hook-form `^7.55.0`. Dev port `3055`. `next.config.js` sets
  `trailingSlash: true` and `output: 'standalone'`. TypeScript `^5`
  with `baseUrl: "src"` and `paths: { "@/*": ["*"] }`. `bun.lock` and
  `package-lock.json` both present; Bun and npm are interchangeable.
- **DB** — MongoDB at `mongodb://192.168.100.157:27017/image`
  (`backend/src/database/index.ts`). `.env` exposes `DB_HOST` /
  `DB_PORT` / `DB_DATABASE=dev`.
- **Auth (two layers):** JWT bearer (`Authorization: Bearer <token>`,
  also readable from the `Authorization` cookie via `cookieParser()`)
  and per-user API keys (`X-API-Key` header or `?api_key=` query). The
  file/image mutation routes accept either; user/auth/admin routes are
  JWT-only. The frontend stores the JWT in `localStorage.token` and
  syncs a safe user record in `localStorage.user`.

## Where things live

```
express-upload/                       # repo root — this file is the only doc here
├── AGENTS.md                         # you are here (root index, table of contents only)
├── backend/
│   ├── AGENTS.md                     # backend edit scope, hard rules, data flow
│   ├── agents/<domain>/AGENTS.md     # backend per-domain references
│   ├── src/
│   │   ├── app.ts                    # Express app bootstrap
│   │   ├── server.ts                 # entry — instantiates App with route classes
│   │   ├── config/index.ts           # env-based config
│   │   ├── database/index.ts         # Mongoose connection
│   │   ├── models/                   # Mongoose schemas
│   │   ├── interfaces/               # TypeScript interfaces
│   │   ├── dtos/                     # class-validator DTO classes
│   │   ├── services/                 # business logic (typedi @Service)
│   │   ├── controllers/              # request handlers (typedi DI)
│   │   ├── routes/                   # Express Router classes
│   │   ├── middlewares/              # error, auth, apiKeyAuth, validation, fileUpload
│   │   ├── exceptions/               # HttpException
│   │   ├── utils/                    # logger, multerConfig, fileCategory, sniff, util
│   │   └── scripts/                  # one-off scripts (backfill-legacy.ts)
│   ├── swagger.yaml                  # backend contract (read by /api-docs at runtime)
│   ├── uploads/                      # multer disk storage (read-only at runtime)
│   ├── public/                       # static HTML
│   ├── dist/                         # SWC build output
│   └── package.json
└── frontend/
    ├── AGENTS.md                     # frontend edit scope, hard rules, data flow
    ├── agents/<domain>/AGENTS.md     # frontend per-domain references
    ├── src/
    │   │   ├── pages/                    # Next.js Pages Router entry points
    │   │   │   └── api/_config.ts        # runtime config endpoint (NEXT_PUBLIC_API_BASE_URL)
    │   ├── components/
    │   │   ├── auth/                 # LoginForm, SignupForm
    │   │   ├── ui/                   # shared Chakra primitives
    │   │   ├── layouts/              # AdminLayout, DashboardLayout, AuthLayout, etc.
    │   │   ├── admin/                # admin feature components
    │   │   └── dashboard/            # user feature components
    │   ├── contexts/                 # AuthContext + AuthProvider
    │   ├── hooks/                    # useAuth, useFiles, useUsers, useApiKeys, useToastError
    │   ├── lib/                      # api (axios), endpoints, auth, format, theme
    │   ├── types/api.ts              # shared API types — mirror of swagger.yaml
    │   └── styles/                   # (empty)
    ├── swagger.yaml                  # frontend copy of the contract for reference
    ├── public/                       # static assets
    ├── next.config.js                # trailingSlash: true, output: 'standalone'
    └── package.json
```

Per-tree AGENTS.md files contain the per-tree detail. **No
`agents/<domain>/AGENTS.md` files exist at this root level** — see
"Domain references" below.

## Domain references

These are **EXPLICIT POINTERS, not auto-loaded.** A nested `AGENTS.md`
in a parent directory is auto-loaded by some agent harnesses; these
files live in two locations and require a deliberate `Read`. The
per-tree folder owns the per-tree file paths; the root file points at
both.

| Domain | One-line description | Backend ref | Frontend ref |
|---|---|---|---|
| **auth** | Sign-up, sign-in, session verify, sign-out, self profile read. | [`backend/agents/users/AGENTS.md`](backend/agents/users/AGENTS.md) | [`frontend/agents/auth/AGENTS.md`](frontend/agents/auth/AGENTS.md) |
| **users** | Admin user CRUD + self profile + password change + status toggle. | [`backend/agents/users/AGENTS.md`](backend/agents/users/AGENTS.md) | [`frontend/agents/users/AGENTS.md`](frontend/agents/users/AGENTS.md) |
| **files** | Per-user file hosting — upload, list-by-type, stream, download, delete, public short-URL read. | [`backend/agents/files/AGENTS.md`](backend/agents/files/AGENTS.md) | [`frontend/agents/files/AGENTS.md`](frontend/agents/files/AGENTS.md) |
| **api-keys** | Per-user X-API-Key mint/list/revoke (own + admin-all). | [`backend/agents/apikeys/AGENTS.md`](backend/agents/apikeys/AGENTS.md) | [`frontend/agents/api-keys/AGENTS.md`](frontend/agents/api-keys/AGENTS.md) |
| **location** | GPS coordinate store/retrieve — backend stub, no UI. | [`backend/agents/location/AGENTS.md`](backend/agents/location/AGENTS.md) | [`frontend/agents/locations/AGENTS.md`](frontend/agents/locations/AGENTS.md) |

Notes on the table:
- The `images` domain that used to live at `/api/images` is
  **deprecated.** Uploads now flow through the `files` domain; the
  legacy `ImageModel` exists only for `backend/src/scripts/backfill-legacy.ts`.
  See `backend/agents/images/AGENTS.md` for the full deprecation note.
  No new work should target it.
- `auth` and `users` share a backend file
  (`backend/agents/users/AGENTS.md`) because the JWT auth middleware,
  the `/auth/*` route, the `/users/*` admin route, and the
  `/api/auth/me` self route are all under the same `users` domain on
  the server side. The frontend intentionally splits them.

## Cross-cutting / shared infrastructure (not a domain)

These pieces are reused by multiple domains. Listed once here, not
duplicated per domain.

### API contract
- **Two copies of `swagger.yaml`** — `backend/swagger.yaml` is the
  source of truth and is served at `http://localhost:5601/api-docs`
  via `swagger-ui-express`; `frontend/swagger.yaml` is a sibling copy
  the frontend team uses for reference. **Do not modify either.**
  When a request/response shape changes, update the relevant
  per-tree `agents/<domain>/AGENTS.md` (and the implementation).

### Backend
- **App bootstrap** — `backend/src/app.ts`. Loads middleware
  (cookieParser → cors allowlist → express.json → static mounts at
  `/img`, `/photos`, `/uploads` → route registration → swagger at
  `/api-docs` → public static). `backend/src/server.ts` instantiates
  the `App` with the route array (Location, File, Auth, User, ApiKey,
  UserSelf) and calls `listen()`.
- **CORS allowlist** — `http://localhost:3055`, `http://localhost:5173`,
  `https://srv-bs2.lmstream.xyz`, `https://rentease.lmstream.xyz`,
  `https://srv-expiner.lmstream.xyz`, plus `FRONTEND_ORIGIN` from
  env. `credentials: true`. (Not `*` — the per-tree backend
  `AGENTS.md` is stale on this point.)
- **Auth middleware (two flavors):**
  - `backend/src/middlewares/auth.middleware.ts` —
    `authMiddleware(req,res,next)` reads `Authorization: Bearer
    <token>`, verifies with `SECRET_KEY`/`JWT_SECRET`, fetches the
    full `User` from `UserModel`, attaches to `req.user`. Rejects
    with 403 if `status: false` or `active: false`. Helpers:
    `requireAdmin`, `requireSelfOrAdmin`.
  - `backend/src/middlewares/apiKeyAuth.middleware.ts` —
    `apiKeyAuth(req,res,next)` accepts **either** an `X-API-Key`
    header (or `?api_key=` query, server-to-server) **or** an
    `Authorization: Bearer <jwt>` (browser session). `X-API-Key`
    takes precedence. Either way resolves to a `User` and populates
    `req.user`.
  - Image/file routes use `apiKeyAuth`; user/auth/admin/self routes
    use `authMiddleware`. Public reads (`/i/:shortUrl`, `/f/:shortUrl`)
    skip both.
- **Shared utils** — `backend/src/utils/`
  - `multerConfig.ts` — multer disk storage, no file filter,
    per-user destination (`<UPLOAD_ROOT>/<req.user.folderSlug>/<X-Folder
    header, sanitized>/`). Falls back to `anonymous` if no user.
  - `fileCategory.ts` — `categorize(ext)`, `categoryFromMime(mime)`,
    `isInlineSafe(mime)` (SVG/HTML never inline),
    `sanitizeFolder(input)` (path-traversal-safe).
  - `sniff.ts` — `sniffFile(path)`, dynamic `require('file-type')`
    with graceful fallback.
  - `util.ts` — `isEmpty(val)`, `generateRandomString(length)` (crypto
    hex).
  - `logger.ts` — winston with daily rotate (debug + error).
- **Error/validation middleware** —
  `backend/src/middlewares/error.middleware.ts` is the global handler
  (logs via winston, returns `{ message }`). `validation.middleware.ts`
  exists but is **not wired into any route** — dead code, treat as
  read-only.
- **DI** — typedi `@Service()` on services and controllers, `Container.get()`
  in route classes, constructor injection in controllers. `@`-path
  aliases: `@config`, `@database`, `@models/*`, `@services/*`,
  `@controllers/*`, `@routes/*`, `@interfaces/*`, `@dtos/*`,
  `@exceptions/*`, `@middlewares/*`, `@utils/*`, `@/*`.
- **Path aliases on the frontend** — `@/*` → `src/*`. No relative
  imports across folder boundaries.
- **Docker assets** — `backend/Dockerfile` (multi-stage SWC build →
  `node dist/server.js` on slim Node 20, runs as `app` user, exposes
  `5601`), `frontend/Dockerfile` (multi-stage matching Next.js
  `output: 'standalone'`, bakes `NEXT_PUBLIC_API_BASE_URL` as a
  build-arg and reads it again at runtime via `pages/api/_config.ts`),
  and `docker-compose.yml` at the repo root that brings up
  `mongo` + `backend` + `frontend`. The root `.env` (next to
  `docker-compose.yml`) is auto-loaded by compose. Per-tree
  `.dockerignore` files are already in place and exclude the
  Dockerfile itself. See each per-tree `AGENTS.md` for stage
  details.
- **Build / run commands (per tree)**
  - Backend: `npm run dev` (nodemon, user-owned), `npm run build`
    (SWC), `npm test` (Jest), `npm run lint`, `npm run lint:fix`.
  - Frontend: `npm run dev` (next dev, user-owned), `npm run build`
    (next build, user-owned), `npm run lint` (biome + tsc --noEmit),
    `npm run format` (biome).

### Frontend
- **Auth context** — `frontend/src/contexts/AuthContext.tsx`.
  `AuthProvider` mounted once in `frontend/src/pages/_app.tsx`.
  Hydrates from `localStorage.token` on mount by calling
  `GET /auth/verify`. 401 silently clears local storage and resolves
  to `null` — no toast.
- **API surface** — `frontend/src/lib/api.ts` (axios instance with a
  request interceptor that re-evaluates `baseURL` per call, plus
  `extractErrorMessage`), `frontend/src/lib/endpoints.ts` (URL map —
  the only place a literal URL string belongs; exposes
  `getApiBaseUrl()` and a re-evaluating `API_BASE_URL` proxy getter),
  `frontend/src/pages/api/_config.ts` (runtime config endpoint —
  returns the current `NEXT_PUBLIC_API_BASE_URL` so the frontend
  picks up Docker env changes without a rebuild),
  `frontend/src/lib/auth.ts` (`storage` localStorage helpers),
  `frontend/src/lib/format.ts` (`formatBytes`, `formatDate`,
  `formatRelative`, `getInitials`, `getOwnerLabel`),
  `frontend/src/lib/theme.ts` (Chakra theme tokens — `ink`, `brand`,
  `accent.{lime,magenta,cyan,amber}`). `frontend/src/lib/axiosprop.ts`
  and `frontend/src/lib/handleImageUploads.ts` are legacy and not
  imported — do not delete, treat as read-only.
- **Layouts** — `frontend/src/components/layouts/`
  - `AuthLayout` — login + signup split-panel.
  - `AdminLayout` — admin shell, gates `isAdmin`, redirects
    non-admins to `/dashboard` and unauthenticated users to `/login`.
  - `DashboardLayout` — user shell, gates `isAuthenticated`.
  - `ResponsiveSidebar` + `MobileDrawer` + `Topbar` + `NavItem` —
    the active sidebar/topbar chain. `Sidebar.tsx` is a legacy
    single-breakpoint shim, not wired in.
- **Shared hooks** — `frontend/src/hooks/`
  - `useAuth` — context wrapper, the only public auth accessor.
  - `useToastError` — wraps `extractErrorMessage` for consistent
    error toasts.
- **Shared UI primitives** — `frontend/src/components/ui/`
  (PageHeader, StatCard, EmptyState, FileDropzone, FileIcon,
  CopyButton, PasswordInput, ConfirmDialog, RoleBadge, StatusBadge).
  Add new ones here, not in feature folders, so they can be reused.
- **Types** — `frontend/src/types/api.ts` is the single source of
  truth for request/response shapes; mirror `swagger.yaml` here.

## Data flow

End-to-end for a typical request (e.g. "user opens the dashboard and
loads their files"):

```
[Browser → http://localhost:3055/]
        │  on first paint, _app.tsx's useEffect runs
        ▼
[GET /api/_config]  →  frontend/src/pages/api/_config.ts
        │  reads process.env.NEXT_PUBLIC_API_BASE_URL at request time
        │  returns { apiBaseUrl }
        ▼
[_app.tsx] sets window.__API_BASE_URL__ = apiBaseUrl
        │  every subsequent axios call uses it via getApiBaseUrl()
        ▼
[Browser → http://localhost:3055/dashboard/files/]
        │
        ▼
[Next.js Pages Router]
  frontend/src/pages/dashboard/files.tsx
        │  composition: DashboardLayout + PageHeader + <MyFilesGrid>
        │  no logic in the page file
        ▼
[DashboardLayout] ─ gates isAuthenticated (else → /login/)
        │  mounts <ResponsiveSidebar> + <Topbar> + children
        ▼
[<MyFilesGrid> (frontend/src/components/dashboard/MyFilesGrid.tsx)]
        │  on mount, calls useFiles()
        ▼
[useFiles() in frontend/src/hooks/useFiles.ts]
        │  GET ENDPOINTS.files  →  "/api/files"
        │  via the shared axios instance in frontend/src/lib/api.ts
        ▼
[axios interceptor in frontend/src/lib/api.ts]
        │  sets config.baseURL = getApiBaseUrl()  (re-evaluated per call)
        │  attaches "Authorization: Bearer <token>" from localStorage.token
        ▼
[HTTP → http://localhost:5601/api/files]
        │
        ▼
[Express app — backend/src/app.ts]
        │  cookieParser → cors(allowlist) → express.json → route table
        ▼
[FileRoute — backend/src/routes/file.route.ts]
        │  path '/' + concat '/api/files'
        │  middleware chain: apiKeyAuth → controller method
        ▼
[apiKeyAuth — backend/src/middlewares/apiKeyAuth.middleware.ts]
        │  reads X-API-Key (or Bearer) → sha256 → ApiKeyModel.findOne
        │  populates req.user = User { id, role, folderSlug, ... }
        ▼
[FileController.getFiles — backend/src/controllers/File.controller.ts]
        │  delegates to FileService.getFiles(req.user.id)
        │  on error: next(error) → error.middleware.ts
        ▼
[FileService — backend/src/services/file.service.ts]
        │  business logic, owner-scope filter (createdBy = req.user.id)
        │  calls FileModel.find(...)
        ▼
[FileModel — backend/src/models/files.model.ts]
        │  Mongoose ODM
        ▼
[MongoDB at mongodb://192.168.100.157:27017/image]
        │
        ▼
[Response envelope: { data: [...], message: "..." }]
        │
        ▼
[axios resolves → typed cast via frontend/src/types/api.ts → AuthFile]
        │
        ▼
[useFiles setFiles(res.data.data)]
        │
        ▼
[<MyFilesGrid> re-renders cards from state]
```

Cross-cutting touchpoints in this flow:
- **Auth layer (two options):** `apiKeyAuth` for image/file mutation
  routes; `authMiddleware` for user/auth/admin/self routes. Public
  reads (`/f/:shortUrl`, `/i/:shortUrl`) skip both.
- **File middleware ordering:** `apiKeyAuth` MUST run before
  `upload.single(...)` in the route definition, otherwise `req.user`
  is undefined when multer computes the destination.
- **Sniff step:** `backend/src/utils/sniff.ts` does a dynamic
  `require('file-type')` after the file lands. Falls back silently
  to the client-declared mimetype if the package is missing.
- **Short URL generation:** `generateRandomString(6)` (crypto hex) for
  images; `crypto.randomBytes(6).toString('hex')` with a collision
  loop for files.
- **Content-Disposition:** the public view routes use `isInlineSafe(mime)`
  to choose `inline` vs `attachment`. SVG/HTML never inline.
- **Disk cleanup:** only `files` and `images` controllers `unlink` the
  file on delete. `location` does not store files.
- **Session bootstrap:** `AuthContext.refresh` is called once from
  `AuthProvider` on mount. A 401 from `/auth/verify` clears local
  storage and resolves to `null` without surfacing an error.
- **API base URL resolution:** the frontend's `getApiBaseUrl()` (in
  `src/lib/endpoints.ts`) checks `window.__API_BASE_URL__` first,
  then `process.env.NEXT_PUBLIC_API_BASE_URL`, then a hardcoded
  `http://localhost:5601` fallback. `_app.tsx` fetches
  `GET /api/_config` on mount and sets the window global from
  it; the axios request interceptor re-evaluates per call. In
  Docker, `NEXT_PUBLIC_API_BASE_URL` is set both as a build-arg
  (baked) and a runtime env (read per request), so a container-start
  env change takes effect on the next browser reload without a
  rebuild.
- **Response envelope:** backend uses
  `res.status(code).json({ data, message })`; frontend's
  `extractErrorMessage` reads `.message` from both success
  (`{ data, message }`) and error (`{ message }`) shapes.

## Canonical "adding a new feature" pattern

Follow these steps in order. Skip none. The last step is mandatory.

0. **Identify the domain.** Use the Domain references table above.
   Read **both** per-tree files for the domain
   (`backend/agents/<domain>/AGENTS.md` and
   `frontend/agents/<domain>/AGENTS.md`) before writing any code.
   If the feature spans multiple domains, read all of them. If it
   fits no existing domain, stop and flag to the user — do not
   invent a new domain silently. If the feature is in the `location`
   domain, treat the backend as deferred (its create service
   doesn't persist).
1. **Wire the contract.** If the feature adds a new endpoint, the
   path must already appear in `backend/swagger.yaml` and be
   registered by a route class in `backend/src/server.ts`. Mirror
   the request/response shape in `frontend/src/types/api.ts` and add
   a key to `ENDPOINTS` in `frontend/src/lib/endpoints.ts`. (No new
   endpoint? Skip to step 2.)
2. **Backend — interface.** `backend/src/interfaces/<name>.interface.ts`
   for the new shape.
3. **Backend — DTO.** `backend/src/dtos/<name>.ts` (class-validator
   decorated class). (DTOs are written but the validation middleware
   is dead code; controllers still parse `req.body` directly.)
4. **Backend — model.** `backend/src/models/<name>.model.ts` (Mongoose
   schema + model). If the model needs a per-user namespace, follow
   the `(createdBy, folder, filename)` compound-unique pattern.
5. **Backend — service.** `backend/src/services/<name>.service.ts`
   (typedi `@Service()`).
6. **Backend — controller.** `backend/src/controllers/<name>.controller.ts`
   (typedi `@Service()`, constructor injection, arrow-function
   methods).
7. **Backend — route.** `backend/src/routes/<name>.route.ts` (class
   implementing `Routes`, uses `Container.get()`).
8. **Backend — register.** Add `new <Name>Route()` to the array in
   `backend/src/server.ts`. If the route needs auth, pick the right
   middleware: `authMiddleware` for user/admin/self flows,
   `apiKeyAuth` for file/image mutations, neither for public reads.
   `apiKeyAuth` must run before `upload.single(...)`.
9. **Frontend — hook.** `frontend/src/hooks/use<Name>.ts` following
   the existing pattern: `useCallback`-wrapped mutators, local
   state for `loading` / `error` / data, optimistic updates where
   safe.
10. **Frontend — feature component.** `frontend/src/components/<admin|dashboard>/`
    with any co-located modals/dialogs. Pull shared pieces from
    `frontend/src/components/ui/`.
11. **Frontend — page.** `frontend/src/pages/<admin|dashboard>/`
    as a thin composition of layout + `PageHeader` + the feature
    component. Pages are wrappers; anything more than ~30 lines is a
    smell — extract.
12. **Frontend — nav.** Add the new item to the correct
    `SidebarSection` for the role (admin or user) in
    `frontend/src/components/layouts/ResponsiveSidebar.tsx` (the
    active one — `Sidebar.tsx` is legacy).
13. **Update the per-tree `agents/<domain>/AGENTS.md` files.** Add
    every path you created or changed on each side, plus any new
    rules that emerged. **Not optional.** Both files in the pair
    must be updated; the next agent reads them before touching the
    domain again.

## Project-wide structural conventions

- **Per-tree ownership.** The backend dev and the frontend dev do not
  share files. A change that touches both trees is expected —
  the `users` and `api-keys` domains are cross-stack by nature — but
  the two `AGENTS.md` files at the roots of each tree define the
  per-tree edit scope and hard rules. Read both before touching
  either tree.
- **Backend structure: typed, layered, DI'd.** `interface → dto → model
  → service → controller → route → server.ts` is the canonical
  chain. Skipping a layer (e.g. putting logic in a route) is a smell.
- **Frontend structure: pages are thin, components hold logic, hooks
  own state.** Pages are layout + `PageHeader` + one feature
  component. New UI primitives go in `frontend/src/components/ui/`,
  not in feature folders.
- **Endpoints are centralized** in `frontend/src/lib/endpoints.ts`
  and live in route classes in `backend/src/routes/`. No string
  literals for URLs in component code; no ad-hoc `app.get(...)` calls
  outside route classes.
- **Response envelope** is `{ data, message }` on success and
  `{ message }` on error, both directions. `extractErrorMessage` in
  `frontend/src/lib/api.ts` is the only error reader.
- **Chakra is the only UI system** in the frontend. No `.css` /
  `.scss` / `.module.css` files; no Tailwind class strings in app
  code (the legacy `frontend/tailwind.config.ts` exists but is unused
  by current code). Theme tokens live in `frontend/src/lib/theme.ts`.
- **No test runner is configured** in either tree. Do not add one
  by default. If the user asks for tests, surface that decision
  first.
- **Trailing slashes are on** (`frontend/next.config.js` →
  `trailingSlash: true`). Every route is `/login/`, `/admin/users/`,
  etc. Internal `Link` components and `router.replace` calls should
  not include a trailing slash — Next adds it.
