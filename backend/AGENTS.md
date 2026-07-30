You are an agent on the **express-upload** backend (Express + Mongoose + TypeScript file/upload API server). Editing scope: `src/` directory only. Files in `dist/`, `node_modules/`, `uploads/`, `public/`, and root config files (`package.json`, `tsconfig.json`, `.swcrc`, etc.) are read-only context — do not modify.

## Hard rules
1. **Do NOT run `npm run dev` or `nodemon`** — the user runs their own dev server; use `npm run build` + `node dist/server.js` for one-off verification if needed, or `npm test`.
2. **Do NOT run `npm install`** unless explicitly asked to add/remove a dependency.
3. **Edit scope is `src/` only.** Root config changes (package.json, tsconfig, .swcrc, eslint, deploy) require user approval. **Exception:** the per-tree `Dockerfile` and matching `.dockerignore` are editable — see "Docker" below.
4. **Do NOT modify `dist/`, `node_modules/`, `uploads/`, `public/`, or log files.**
5. **After adding/renaming any file, update the relevant `agents/<domain>/AGENTS.md`** — this is mandatory, not optional.

## Stack
- **Runtime:** Node.js (via `ts-node --transpile-only` in dev, SWC-compiled JS in prod)
- **Framework:** Express 4.18 — classic middleware stack, no App Router, no Pages Router
- **Language:** TypeScript 4.7
- **ORM/ODM:** Mongoose 6.5 (MongoDB)
- **DI:** typedi 0.10 (`@Service()` decorator, `Container.get()`)
- **Validation:** class-validator 0.13 + class-transformer 0.5
- **Build:** SWC 1.2 (`swc src -d dist --source-maps --copy-files`) — not tsc
- **Files:** multer 1.4 (disk storage)
- **Logging:** winston 3.8 + winston-daily-rotate-file
- **Test:** Jest 28 + ts-jest + supertest
- **Lint:** ESLint 8 (`.eslintrc` + flat config `eslint.config.mjs`), Prettier 2.7
- **Deploy:** PM2 5.2 (via `ecosystem.config.js`), Docker (multi-stage)

## Where things live

```
express-upload/
├── AGENTS.md                           # this file
├── agents/<domain>/AGENTS.md           # path-dense domain references (see below)
├── src/
│   ├── app.ts                          # Express app bootstrap (middleware, routes, swagger, static)
│   ├── server.ts                       # Entry point — instantiates App with route classes
│   ├── config/index.ts                 # Env-based config exports
│   ├── database/index.ts               # Mongoose connection (cached singleton)
│   ├── models/                         # Mongoose schemas & models
│   ├── interfaces/                     # TypeScript interfaces
│   ├── dtos/                           # class-validator DTO classes
│   ├── services/                       # Business logic (typedi @Service())
│   ├── controllers/                    # Request handlers (typedi @Service() + constructor DI)
│   ├── routes/                         # Express Router classes (implements Routes interface)
│   ├── middlewares/                    # Express middleware (error, validation, file upload)
│   ├── exceptions/                     # HttpException class
│   └── utils/                          # Shared utilities (logger, multerConfig, isEmpty, etc.)
├── swagger.yaml                        # Swagger/OpenAPI spec
├── uploads/                            # Multer file storage (images/, documents/, etc.)
├── public/                             # Static HTML
├── dist/                               # SWC-compiled output (read-only)
├── docker-compose.yml
├── Dockerfile.dev / Dockerfile.prod
├── ecosystem.config.js                 # PM2 config
├── nodemon.json                        # Dev runner config
├── tsconfig.json
└── .swcrc
```

Nested `agents/<domain>/AGENTS.md` files contain path-dense domain references.

## Domain references

| Domain | Description | AGENTS.md |
|---|---|---|
| **images** | Per-user image hosting — owner-scoped upload/serve, public view by short URL, view/download tracking | `agents/images/AGENTS.md` |
| **files** | Per-user generic file hosting — multi-type classification, stats aggregation, public view by short URL | `agents/files/AGENTS.md` |
| **location** | GPS coordinate store/retrieve | `agents/location/AGENTS.md` |
| **users** | User accounts (signup/login) + JWT auth middleware; admin role | `agents/users/AGENTS.md` |
| **apikeys** | Per-user API keys (X-API-Key) — server-to-server credentials resolving to a User | `agents/apikeys/AGENTS.md` |

**IMPORTANT: These are explicit pointers, not auto-loaded.** The agent must actively `Read` the referenced `agents/<domain>/AGENTS.md` file. It does not load automatically.

## Cross-cutting / shared infrastructure

### Middleware (applied in `src/app.ts`)
- `cors()` — permissive (ORIGIN = *), applied globally
- `express.json({ limit: '1mb' })` — body parser for JSON requests; **required for `req.body` to be populated** (no JSON parser was the cause of an early 500 on `/auth/signup`)
- `express.urlencoded({ extended: true, limit: '1mb' })` — for form-encoded bodies
- `express.static('/img')`, `express.static('/')`, `express.static('/photos')` — all serve `uploads/images/` (legacy, kept for old files; new files live under `uploads/<userFolderSlug>/`)
- `express.static(path.join(__dirname, '../public'))` — serves `public/index.html` and `public/admin.html`
- `compression`, `helmet`, `hpp`, `morgan` — imported but **NOT applied** (commented out/dead code)

### Auth (two layers, two flows)
- **JWT (bearer):** `src/middlewares/auth.middleware.ts` — `authMiddleware(req,res,next)` reads `Authorization: Bearer <token>`, verifies with `SECRET_KEY`/`JWT_SECRET`, fetches the full User from `UserModel`, attaches to `req.user`. `requireAdmin`, `requireSelfOrAdmin` are gate helpers.
- **API key:** `src/middlewares/apiKeyAuth.middleware.ts` — `apiKeyAuth(req,res,next)` accepts **either** an `X-API-Key` header (or `?api_key=` query, server-to-server) **or** an `Authorization: Bearer <jwt>` (browser session via cookie or header). X-API-Key takes precedence when both are present. Either way, resolves to a User, populates `req.user`.
- Both populate `req.user: User`. The image/file routes use `apiKeyAuth`; the user/auth/admin routes use the JWT middleware.
- **Public reads** (no auth): `/i/:shortUrl` and `/f/:shortUrl` — anyone with the short URL can stream the file.

### Shared utilities
- `src/utils/multerConfig.ts` — multer disk storage, no file filter, **per-user destination** (`<UPLOAD_ROOT>/<req.user.folderSlug>/<X-Folder header, sanitized>/`). `X-Folder` is sanitized by `sanitizeFolder`. Falls back to `anonymous` folder if no user.
- `src/utils/fileCategory.ts` — `categorize(ext)`, `categoryFromMime(mime)`, `isInlineSafe(mime)` (SVG/HTML never inline), `sanitizeFolder(input)` (path-traversal-safe)
- `src/utils/sniff.ts` — `sniffFile(path)` — dynamic `file-type@16` loader with graceful fallback if the package isn't installed
- `src/utils/util.ts` — `isEmpty(val)`, `generateRandomString(length)` (crypto hex)
- `src/utils/logger.ts` — winston logger with daily rotate (debug + error levels); `LOG_DIR` from `@config`
- `src/exceptions/httpException.ts` — `HttpException { status, message }` extends Error

### Middleware files (domain-agnostic, in `src/middlewares/`)
- `error.middleware.ts` — global error handler, logs via winston, returns `{ message }`
- `auth.middleware.ts` — `authMiddleware`, `requireAdmin`, `requireSelfOrAdmin` (Bearer JWT)
- `apiKeyAuth.middleware.ts` — `apiKeyAuth` (X-API-Key **or** Authorization: Bearer; X-API-Key takes precedence)
- `validation.middleware.ts` — `validationMiddleware(...)` — class-validator; **not wired into any route currently**
- `fileUpload.middleware.ts` — multer with type-filter (PDF/JPEG/PNG/DOC/DOCX, 10MB); **not imported by any route** (routes use `@utils/multerConfig`)

### Interfaces (shared)
- `src/interfaces/routes.interface.ts` — `Routes { path?, router }`
- `src/interfaces/Multer.ts` — `MulterRequest extends Request { file?, files? }`
- `src/interfaces/AuthRequest.ts` — `AuthRequest extends Request { user?: User }`
- `src/interfaces/users.interface.ts` — `User` (used by `req.user` everywhere)
- `src/interfaces/auth.interface.ts` — `DataStoredInToken`, `TokenData`, `RequestWithUser` (legacy paths)

### Config & database
- `src/config/index.ts` — exports: `NODE_ENV`, `PORT`, `LOG_FORMAT`, `ORIGIN`, `CREDENTIALS`, `DB_URL`, `IMAGE_STORAGE_PATH`, `IMAGE_MAX_SIZE`, `ALLOWED_IMAGE_TYPES`, `LOG_DIR`, `SECRET_KEY`/`JWT_SECRET`, `JWT_EXPIRES_IN`, `BOOTSTRAP_ADMIN_*`, `UPLOAD_ROOT`, `FILE_CATEGORY_MAX_SIZE`
- `src/database/index.ts` — Mongoose connection that reads `MONGODB_URI` from env (falls back to `mongodb://localhost:27017/express-upload` for local dev). Cached singleton pattern.
- `.env` defines: `PORT=5601`, `DB_HOST`, `DB_PORT`, `DB_DATABASE=dev`, `SECRET_KEY`, `LOG_DIR=../logs`, `ORIGIN=*`, `CREDENTIALS=true`

### Migration / one-off scripts
- `src/scripts/backfill-legacy.ts` — assigns every pre-existing Image/File to a `legacy` user (`folderSlug: 'legacy'`, `active: false`). Run once after the per-user schema is deployed. Safe to re-run (only touches rows where `createdBy` is missing).

### Entry points
- `src/server.ts` — `new App([new ImageRoute(), new LocationRoute(), new FileRoute(), new AuthRoute(), new UserRoute(), new ApiKeyRoute()]).listen()`
- `src/app.ts` — `App` class: connects DB, initializes middleware, registers routes, sets up Swagger at `/api-docs`

### Commands
| Command | Action |
|---|---|
| `npm run dev` | `cross-env NODE_ENV=development nodemon` — ts-node with --transpile-only |
| `npm run build` | `swc src -d dist --source-maps --copy-files` |
| `npm test` | `jest --forceExit --detectOpenHandles` |
| `npm run lint` | ESLint on `src/` |
| `npm run lint:fix` | ESLint with --fix |
| `npm run build:tsc` | `tsc && tsc-alias` (alternative build, not default) |

### Docker
- `Dockerfile` — multi-stage build: `deps` (npm ci) → `build` (`npm run build`, SWC → `dist/`) → `runtime` (slim Node 20 + `node dist/server.js`).
- `.dockerignore` — excludes `node_modules`, `dist`, `logs`, `uploads`, env files (except `.env.docker`), and the Dockerfile / docker-compose.yml.
- `docker-compose.yml` at the repo root builds this image, mounts `express-uploads` volume at `/var/express-uploads`, sets `UPLOAD_ROOT=/var/express-uploads` + `LOG_DIR=/app/logs`, and depends on the in-cluster `mongo` service (overridable via `MONGODB_URI` in the root `.env`).
- `swagger.yaml` is read by `src/app.ts` at runtime via `path.join(__dirname, '..', 'swagger.yaml')` — the Dockerfile copies it from the build stage so the runtime path resolves correctly.

## Data flow

```
HTTP Request
  │
  ▼
apiKeyAuth (or authMiddleware) — verifies X-API-Key / Bearer JWT (apiKeyAuth accepts both)
  │  populates req.user = User { id, email, role, folderSlug, name }
  │
  ▼
express.Router (src/routes/*.route.ts)
  │  route defines: path + multer middleware (file parsing) + controller method
  │  multer destination uses req.user.folderSlug to land in uploads/<folderSlug>/...
  │
  ▼
Controller (src/controllers/*.controller.ts)
  │  parses req.params/body/file, delegates to service, formats response
  │  on error: calls next(error) → error.middleware.ts
  │  scopes reads/writes by createdBy = req.user.id
  │
  ▼
Service (src/services/*.service.ts)  ← typedi DI injects into controller constructor
  │  business logic, validation, shortUrl generation, byte-level sniffing
  │  queries filter by createdBy (owner-scoped); public reads by shortUrl skip the check
  │
  ▼
Model (src/models/*.model.ts)  ← Mongoose ODM
  │  find / create / findByIdAndUpdate / findByIdAndDelete / aggregate
  │  compound unique on (createdBy, folder, filename); legacy rows have a partial global unique
  │
  ▼
MongoDB
```

Cross-cutting touchpoints:
- **Auth layer:** `apiKeyAuth` for image/file mutation routes; `authMiddleware` for user/auth/admin routes. Public reads (`/i/:shortUrl`, `/f/:shortUrl`) skip both.
- **File middleware:** `apiKeyAuth` MUST run before `upload.single(...)` in the route definition, otherwise `req.user` is undefined when multer computes the destination.
- **Sniff step:** `src/utils/sniff.ts` does a dynamic `require('file-type')` after the file lands. If the package is missing, falls back to the client-declared mimetype silently.
- **Validation middleware:** `validation.middleware.ts` exists but is **not wired into any route** (dead code).
- **Error middleware:** `error.middleware.ts` catches `next(error)` from any controller — logs via winston, returns `{ message }` with error status.
- **Short URL generation:** `generateRandomString(6)` (crypto hex) for images; `crypto.randomBytes(6).toString('hex')` with collision loop for files.
- **Content-Disposition:** the public view routes use `isInlineSafe(mime)` from `@utils/fileCategory` to choose `inline` vs `attachment`. SVG/HTML never inline.
- **File deletion from disk:** only `files` and `images` controllers handle this (fs.unlinkSync), Location does not store files.

## Canonical "adding a new feature" pattern

**Step 0: Identify domain.** Read `AGENTS.md` domain table to find the right domain. Read `agents/<domain>/AGENTS.md` before writing any code. If the feature spans multiple domains, read all relevant domain files. If it fits no existing domain, flag to the user.

**Step 1: Interface** — `src/interfaces/<name>.interface.ts`
**Step 2: DTO** — `src/dtos/<name>.ts` (class-validator decorated class)
**Step 3: Model** — `src/models/<name>.model.ts` (Mongoose schema + model)
**Step 4: Service** — `src/services/<name>.service.ts` (typedi `@Service()` class)
**Step 5: Controller** — `src/controllers/<name>.controller.ts` (typedi `@Service()` with constructor DI)
**Step 6: Route** — `src/routes/<name>.route.ts` (class implementing `Routes` interface, uses `Container.get()`)
**Step 7: Register route** — add `new <Name>Route()` to the array in `src/server.ts`
**Step 8: Wire middleware** — add any domain-specific multer or validation middleware in the route definition
**Step 9: Update `agents/<domain>/AGENTS.md`** — add every path created or changed (mandatory, not optional)

## Project-wide structural conventions
- **Routes register paths starting with `/`** — each route class sets `path = '/'` and concatenates sub-paths (e.g. `this.router.get(\`${this.path}api/images\`, ...)`)
- **Controllers are arrow-function class properties** — `public method = async (req, res, next) => { ... }` so `this` binding works when passed as Express handler
- **All services and controllers use typedi `@Service()` decorator** — DI via `Container.get()` in routes, constructor injection in controllers
- **`@` path aliases** — `@config`, `@database`, `@models/*`, `@services/*`, `@controllers/*`, `@routes/*`, `@interfaces/*`, `@dtos/*`, `@exceptions/*`, `@middlewares/*`, `@utils/*`, `@/*`
- **Response envelope** — consistently `res.status(code).json({ data: ..., message: '...' })`
- **Error propagation** — controllers wrap in try/catch and call `next(error)`; the global error middleware catches and responds
- **No authentication** — `bcrypt`, `jsonwebtoken`, `crypto-js` in package.json but zero auth code in `src/`
