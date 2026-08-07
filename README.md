# expiner

> **The self-hostable alternative to Cloudinary — but for *every* file type.**

expiner is an open-source, Docker-ready file storage and
management service you can run on your own infrastructure. Where
Cloudinary is laser-focused on images and videos, expiner
happily accepts **anything**: PDFs, ZIP archives, design files, 3D
models, raw data dumps, executables, anything your users throw at it.

- 🗂️ **Per-user namespaces** — every account gets its own folder on disk
- 🔐 **Dual auth** — JWT for browser sessions, API keys for scripts and
  server-to-server integrations
- 🔗 **Shareable short URLs** — `/f/:shortUrl` works without any auth
- 🖼️ **Inline previews** — `Content-Disposition: inline` for safe
  MIME types, `attachment` for everything else (SVG/HTML is never
  inlined)
- 🛠️ **Admin dashboard** — user management, API key revocation, and
  per-user file inspection
- 🐳 **One-command Docker stack** — MongoDB, the API, and the Next.js
  frontend with a single `docker compose up`
- 💸 **No per-GB fees** — your files, your disk, your rules

---

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Stack](#stack)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Client library — `@moomle/upload-client`](#client-library--moomleupload-client)
- [Frontend pages](#frontend-pages)
- [Two deployment profiles](#two-deployment-profiles)
- [Public deployment](#public-deployment)
- [Operations](#operations)
- [Project layout](#project-layout)
- [Troubleshooting](#troubleshooting)
- [Security checklist](#security-checklist)
- [License](#license)

---

## Features

### For end users
- Sign up / sign in with email + password
- Drag-and-drop upload of any file type (up to **10 MB** by default)
- File library with type filters (image, document, video, audio,
  archive, executable, other)
- Download, view, and share files
- Public share links via 6-character short URLs
- Personal API keys for scripting and CI

### For admins
- User CRUD (create, list, edit, disable, delete)
- Per-user storage inspection
- API key audit and revocation
- Admin password reset for any user
- Bootstrap admin created on first boot from `.env`

### For integrators
- REST API with auto-generated Swagger UI at `/api-docs`
- Stable response envelope: `{ "data": ..., "message": "..." }` on
  success, `{ "message": "..." }` on errors
- `X-API-Key` header auth for headless / server-to-server use
- CORS allowlist with env-driven extra origin

---

## Quick start

### Prerequisites
- Docker Engine 20.10+ with Compose v2 (`docker compose ...`)
- ~1 GB free RAM for the dev stack
- Ports **3055** (frontend) and **5601** (backend) free on the host

### 1. Clone and configure

```bash
git clone https://github.com/moomle0000/expiner.git
cd expiner
cp .env.example .env
```

Open `.env` and at minimum, set:

```env
SECRET_KEY=<long-random-string>           # required
BOOTSTRAP_ADMIN_EMAIL=admin@example.com   # optional but recommended
BOOTSTRAP_ADMIN_PASSWORD=<strong-password>
```

### 2. Bring it up

```bash
docker compose -f docker-compose.mongo.yml up -d --build
```

Three containers start: MongoDB, the backend, and the frontend. First
build takes 3–5 minutes; subsequent starts are seconds.

### 3. Open it

| URL | What |
|---|---|
| http://localhost:3055 | Frontend — log in, upload, manage files |
| http://localhost:5601 | REST API root |
| http://localhost:5601/api-docs | Interactive Swagger UI |
| `localhost:27017` | MongoDB (no auth by default) |

The admin account from `BOOTSTRAP_ADMIN_*` is created on first boot.

---

## How it works

```
┌────────────┐   HTTPS   ┌──────────────┐    HTTP    ┌────────────┐
│  Browser   │ ────────► │   Frontend   │ ─────────► │  Backend   │
│            │           │  (Next.js)   │            │  (Express) │
└────────────┘           └──────────────┘            └─────┬──────┘
       ▲                                                    │
       │                                                    │ TCP
       │                                                    ▼
       │            ┌──────────────┐                 ┌────────────┐
       └────static──│  /f/:shortUrl│ ◄── public read │   MongoDB  │
       │            │   (Express)  │                 └────────────┘
       │            └──────────────┘
       │                   │
       └──────  inline  ───┘
            Content-Disposition
```

- **Authenticated requests** (browser session or `X-API-Key`):
  browser → frontend → backend (JWT in `Authorization`) → Mongo
- **Public reads** (`/f/:shortUrl`, `/i/:shortUrl`): anyone with the
  link can stream the file directly from the backend
- **Static image fallbacks** are served from `/img/`, `/photos/`, and
  `/uploads/` directly

Auth precedence: `X-API-Key` > `Authorization: Bearer <jwt>` >
`Authorization: <jwt>` cookie.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (Pages Router), Chakra UI 2, framer-motion, react-hook-form, axios |
| Backend  | Express 4, Mongoose 6, TypeScript 4 (SWC), multer, bcrypt, jsonwebtoken, winston |
| Database | MongoDB 7 |
| Infra    | Docker, docker-compose, Node 20, `output: 'standalone'` Next.js build |

---

## Configuration

All knobs live in the root `.env`. Compose reads it automatically.

| Variable | Default | Required? | Purpose |
|---|---|---|---|
| `BACKEND_PORT` | `5601` | no | Host port the API is reachable on |
| `FRONTEND_PORT` | `3055` | no | Host port the frontend is reachable on |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5601` | no | URL the browser uses to call the API. Baked into the bundle at build time; re-fetched at runtime from `/api/_config`. |
| `MONGODB_URI` | `mongodb://mongo:27017/image-upload` | **yes** (no-mongo profile) | Backend → Mongo connection string. Supports standard URI, `authSource`, and `mongodb+srv://` (Atlas). |
| `MONGO_USER` / `MONGO_PASSWORD` | _empty_ | no | Enable auth on the in-cluster Mongo. Uncomment the matching `MONGO_INITDB_ROOT_*` lines in `docker-compose.mongo.yml`. |
| `SECRET_KEY` | `change-me-...` | **yes** | JWT signing key. **Set this to a long random string in production.** |
| `JWT_EXPIRES_IN` | `7d` | no | Session lifetime. Accepts any `ms`/`jsonwebtoken` string. |
| `FRONTEND_ORIGIN` | `http://localhost:3055` | no | Appended to the CORS allowlist so the browser can call the API. |
| `BOOTSTRAP_ADMIN_EMAIL` | _empty_ | no | Creates an admin user on first boot (no-op if the email already exists). |
| `BOOTSTRAP_ADMIN_PASSWORD` | _empty_ | no | Admin password. Required if `BOOTSTRAP_ADMIN_EMAIL` is set. |
| `BOOTSTRAP_ADMIN_NAME` | `Admin` | no | Display name for the bootstrapped admin. |
| `BOOTSTRAP_USER_EMAIL` | _empty_ | no | Same as admin but creates a regular `role: user` account. |
| `BOOTSTRAP_USER_PASSWORD` | _empty_ | no | User password. |
| `BOOTSTRAP_USER_NAME` | `User` | no | Display name for the bootstrapped user. |
| `FILE_CATEGORY_MAX_SIZE` | `524288000` (500 MB) | no | Theoretical cap; the actual multer limit is in `middlewares/fileUpload.middleware.ts`. |
| `LOG_DIR` | `/app/logs` | no | Where backend logs are written (mounted to the `backend-logs` volume). |
| `UPLOAD_ROOT` | `/var/expiners` | no | Where uploaded files are stored (mounted to the `expiners` volume). |

### Generating a good `SECRET_KEY`

```bash
# 64 random bytes, base64
openssl rand -base64 64

# Or 48 random hex chars
openssl rand -hex 32
```

---

## API reference

The full contract lives in [`backend/swagger.yaml`](backend/swagger.yaml)
and is served interactively at **http://localhost:5601/api-docs**.

### Auth model

| Method | Header / Cookie | When to use |
|---|---|---|
| **API key** | `X-API-Key: <48-char-hex>` | Server-to-server (curl, scripts, CI) |
| **Bearer JWT** | `Authorization: Bearer <jwt>` | Browser session, mobile app |
| **Cookie JWT** | `Authorization: <jwt>` (cookie set by `/auth/login`) | Same-origin browser navigation |

`X-API-Key` takes precedence when both are present. Public read
endpoints (`/f/:shortUrl`, `/i/:shortUrl`) skip auth entirely.

### Response envelope

```json
// success
{ "data": { ... }, "message": "OK" }

// error
{ "message": "Validation failed" }
```

### Endpoints

#### Auth — public
| Method | Path | Notes |
|---|---|---|
| `POST` | `/auth/signup` | Create account. Returns user + JWT. |
| `POST` | `/auth/login` | Returns JWT, sets `Authorization` cookie. |
| `GET`  | `/auth/verify` | Returns the user for the token in the cookie or header. |
| `GET`  | `/auth/profile` | Returns the current user. |
| `POST` | `/auth/logout` | Clears the cookie. |
| `POST` | `/auth/admin/reset-password` | Admin-only. Reset any user's password. |

#### Profile — Bearer required
| Method | Path | Notes |
|---|---|---|
| `GET`  | `/api/auth/me` | Get current user. |
| `PUT`  | `/api/auth/me/password` | Change own password. |

#### Files — `X-API-Key` **or** Bearer
| Method | Path | Notes |
|---|---|---|
| `GET`    | `/api/files` | List current user's files. |
| `GET`    | `/api/files/type/:type` | List files of a type (`image` / `document` / etc.). |
| `GET`    | `/api/files/:id` | Stream a file (inline or attachment based on MIME). |
| `GET`    | `/api/files/:id.:ext` | Stream with explicit extension. |
| `GET`    | `/api/files/:id/download` | Force `Content-Disposition: attachment`. |
| `POST`   | `/api/files/upload` | `multipart/form-data` with `file` field. 10 MB limit. |
| `DELETE` | `/api/files/:id` | Remove file (and delete from disk). |
| `GET`    | `/info/:shortUrl` | Get file metadata by short URL. |

#### Public reads — no auth
| Method | Path | Notes |
|---|---|---|
| `GET` | `/f/:shortUrl` | Stream a publicly-shared file. |
| `GET` | `/i/:shortUrl` | Inline preview (deprecated image route). |
| `GET` | `/img/*`, `/photos/*`, `/uploads/*` | Static file mounts. |

#### API keys — Bearer required
| Method | Path | Notes |
|---|---|---|
| `POST`  | `/api/auth/keys` | Mint a new API key for the current user. |
| `GET`   | `/api/auth/keys` | List own keys. |
| `POST`  | `/api/auth/keys/:id/revoke` | Revoke one of your keys. |
| `GET`   | `/api/admin/keys` | Admin: list all keys across all users. |

#### Users (admin) — Bearer + `role=admin` required
| Method | Path | Notes |
|---|---|---|
| `GET`    | `/users` | List all users. |
| `GET`    | `/users/admin` | List only admin users. |
| `GET`    | `/users/:id` | Get one user. |
| `PUT`    | `/users/:id` | Update user fields. |
| `DELETE` | `/users/:id` | Delete a user. |

#### Locations — Bearer required
| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/locations/upload` | Store a GPS coordinate. |
| `GET`  | `/api/locations` | List current user's locations. |

### Examples

**Sign in**
```bash
curl -X POST http://localhost:5601/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme"}'
# → { "data": { "token": "...", "user": { ... } }, "message": "..." }
```

**Upload a file**
```bash
curl -X POST http://localhost:5601/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./report.pdf"
# → { "data": { "_id": "...", "filename": "...", "shortUrl": "a1b2c3", ... }, "message": "OK" }
```

**List your files**
```bash
curl http://localhost:5601/api/files \
  -H "Authorization: Bearer $TOKEN"
```

**Download a file (public short URL, no auth)**
```bash
curl -OJ http://localhost:5601/f/a1b2c3
```

**Use an API key instead of a JWT**
```bash
curl http://localhost:5601/api/files \
  -H "X-API-Key: <your-48-char-hex-key>"
```

Full schema for every request/response body is at
**http://localhost:5601/api-docs** or in
[`backend/swagger.yaml`](backend/swagger.yaml).

---

## Client library — `@moomle/upload-client`

A zero-dependency, ESM, TypeScript-first client for the file API.
Lets any web/Node project upload to an expiner server in a
few lines, with built-in progress events and cancellation.

📦 **npm**: <https://www.npmjs.com/package/@moomle/upload-client>
🛠 **Source**: [`packages/upload-client/`](packages/upload-client/)

### Install

```bash
npm install @moomle/upload-client
# or: pnpm add @moomle/upload-client
# or: yarn add @moomle/upload-client
```

### Quick start (Next.js)

In your Next.js project, expose the API key as a `NEXT_PUBLIC_*` env
var (or pass it server-side — see "Auth" below):

```env
# .env.local
NEXT_PUBLIC_UPLOAD_BASE_URL=https://files.example.com
NEXT_PUBLIC_UPLOAD_KEY=lm_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then a drop-in upload component:

```tsx
'use client';

import { useState } from 'react';
import { createUploader, UploadError } from '@moomle/upload-client';

const uploader = createUploader({
  baseUrl: process.env.NEXT_PUBLIC_UPLOAD_BASE_URL!,
  apiKey:   process.env.NEXT_PUBLIC_UPLOAD_KEY!,
});

export function FileUploader() {
  const [percent, setPercent] = useState(0);
  const [error, setError]     = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPercent(0);
    try {
      const uploaded = await uploader.upload(file, {
        folder: 'avatars',
        onProgress: ({ percent }) => setPercent(percent),
      });
      setViewUrl(uploader.publicUrl(uploaded.shortUrl));
    } catch (err) {
      if (err instanceof UploadError) {
        setError(`${err.status ? `[${err.status}] ` : ''}${err.message}`);
      } else {
        setError('Upload failed');
      }
    }
  }

  return (
    <div>
      <input type="file" onChange={onChange} />
      {percent > 0 && percent < 100 && <progress value={percent} max={100} />}
      {viewUrl && <a href={viewUrl}>{viewUrl}</a>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

The returned `uploaded` is the `data` field of the server's
`{ data, message }` envelope — i.e. the `UploadedFile` record with
`shortUrl`, `_id`, `fileType`, `size`, etc. The full API surface
(types, options, `UploadError`, `buildPublicUrl`) is documented in
[`packages/upload-client/README.md`](packages/upload-client/README.md).

### API summary

```ts
import {
  createUploader,   // main entry
  buildPublicUrl,   // (baseUrl, shortUrl) => string
  UploadError,      // thrown on non-2xx / network / abort
} from '@moomle/upload-client';

const uploader = createUploader({
  baseUrl:  'https://files.example.com',   // required
  apiKey:   'lm_live_xxxx',                 // sent as X-API-Key
  // token:  'jwt...',                     // alt: sent as Authorization: Bearer
  // endpoint: '/api/files/upload',        // default
});

const handle = uploader.upload(file, {
  folder:     'avatars',                    // server-side sub-folder
  onProgress: ({ loaded, total, percent }) => {},
  signal:     controller.signal,            // for cancellation
  headers:    { 'X-Request-Id': 'abc' },    // extra headers
  fieldName:  'file',                       // default
});

// handle.promise resolves to UploadedFile
// handle.cancel(reason) aborts the in-flight XHR

const publicUrl = uploader.publicUrl(uploaded.shortUrl);
// => 'https://files.example.com/f/abc123.png'
```

### Auth

The client supports all three auth flows:

| Flow | How | When to use |
|---|---|---|
| **API key** | `X-API-Key: <key>` | Server-to-server, static site, Next.js client component (recommended) |
| **JWT** | `Authorization: Bearer <token>` | Logged-in user, session-based |
| **Cookie** | Browser auto-sends the `Authorization` cookie set by `/auth/login` | Same-origin browser navigation |

`apiKey` and `token` are mutually exclusive — if you pass both,
`apiKey` wins (matches the server's precedence).

**Minting an API key** — sign in, then:

```bash
curl -X POST http://localhost:5601/api/auth/keys \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-app"}'
# → { "data": { "key": "lm_live_xxxxxxxxxxxxxxxx", ... }, "message": "..." }
```

Store the key in your `.env` / secret manager. The server stores only
its SHA-256 hash, so the plaintext is **only shown once** at mint time.

### Cancellable uploads

```ts
const handle = uploader.upload(file);
button.onclick = () => handle.cancel('user navigated away');

try {
  await handle.promise;
} catch (e) {
  if (e instanceof UploadError && e.status === 0) {
    // cancelled or network error
  }
}
```

### Works in any JS environment

- ✅ Next.js (App Router & Pages Router)
- ✅ Vite / CRA / Astro
- ✅ Plain `<script type="module">` (the package is ESM, zero deps)
- ✅ Node 18+ (uses the global `XMLHttpRequest` polyfill path; for
  Node you may want to pass a `fetch` impl in the config)

---

## Frontend pages

```
/                            → marketing / landing page
/login                       → sign in
/signup                      → create account

/dashboard/                  → user home
/dashboard/files/            → my files
/dashboard/files/[folder]/   → files inside a subfolder
/dashboard/profile/          → my profile, change password
/dashboard/api-keys/         → mint / revoke my API keys

/admin/                      → admin home
/admin/users/                → all users
/admin/users/[id]/           → edit one user
/admin/files/                → all files
/admin/keys/                 → all API keys
/admin/profile/              → admin profile
```

---

## Two deployment profiles

The repo ships two compose files at the root. Pick the one that
matches where your MongoDB lives.

### `docker-compose.mongo.yml` — all-in-one (recommended for dev / self-hosting)

Runs `mongo` + `backend` + `frontend` together. Mongo has no auth by
default; flip it on by uncommenting `MONGO_INITDB_ROOT_USERNAME` /
`MONGO_INITDB_ROOT_PASSWORD` in the compose file **and** setting the
matching `MONGO_USER` / `MONGO_PASSWORD` in `.env` and switching
`MONGODB_URI` to the authed form (`?authSource=admin`).

```bash
docker compose -f docker-compose.mongo.yml up -d --build
```

### `docker-compose.no-mongo.yml` — bring your own Mongo

For when you already have MongoDB elsewhere (Atlas, a sidecar, a
managed cluster, another host). You set `MONGODB_URI` in `.env` and
only `backend` + `frontend` containers start.

```bash
docker compose -f docker-compose.no-mongo.yml up -d --build
```

Examples for `MONGODB_URI`:
```
# Local LAN Mongo, no auth
mongodb://192.168.1.50:27017/image-upload

# Authed Mongo
mongodb://user:pass@host:27017/image-upload?authSource=admin

# MongoDB Atlas (use the SRV URI the Atlas UI gives you)
mongodb+srv://user:pass@cluster0.example.net/image-upload
```

`docker-compose.yml` is a thin wrapper that includes
`docker-compose.no-mongo.yml` by default — change the `include:` line
if you want the all-in-one stack to be the default.

---

## Public deployment

### 1. Point DNS at your server

Create an A (or AAAA) record for your domain pointing at the server's
public IP.

### 2. Edit `.env`

```env
NEXT_PUBLIC_API_BASE_URL=https://files.example.com
FRONTEND_ORIGIN=https://files.example.com
SECRET_KEY=<a-very-long-random-string>
```

### 3. Reverse-proxy with TLS

Put a reverse proxy in front of the stack and forward the API
prefixes to the backend, everything else to the frontend. Example
for Caddy:

```caddyfile
files.example.com {
    encode gzip

    # API + short-link routes → backend
    reverse_proxy /api/*    expiner-backend:5601
    reverse_proxy /auth/*   expiner-backend:5601
    reverse_proxy /users/*  expiner-backend:5601
    reverse_proxy /f/*      expiner-backend:5601
    reverse_proxy /info/*   expiner-backend:5601
    reverse_proxy /img/*    expiner-backend:5601
    reverse_proxy /photos/* expiner-backend:5601
    reverse_proxy /uploads/* expiner-backend:5601
    reverse_proxy /api-docs/* expiner-backend:5601

    # Everything else → frontend
    reverse_proxy expiner-frontend:3055
}
```

### 4. Rebuild only the frontend

The `NEXT_PUBLIC_API_BASE_URL` is baked into the JS bundle at build
time, so rebuild the frontend image after changing it:

```bash
docker compose -f docker-compose.mongo.yml build --no-cache frontend
docker compose -f docker-compose.mongo.yml up -d
```

The backend doesn't need rebuilding.

---

## Operations

### Common commands

| Task | Command |
|---|---|
| Start everything (all-in-one) | `docker compose -f docker-compose.mongo.yml up -d --build` |
| Start everything (external Mongo) | `docker compose -f docker-compose.no-mongo.yml up -d --build` |
| Tail all logs | `docker compose -f docker-compose.mongo.yml logs -f` |
| Tail one service | `docker compose -f docker-compose.mongo.yml logs -f backend` |
| Stop (keep data) | `docker compose -f docker-compose.mongo.yml down` |
| Stop + wipe data | `docker compose -f docker-compose.mongo.yml down -v` |
| Rebuild after code change | `docker compose -f docker-compose.mongo.yml build backend && docker compose -f docker-compose.mongo.yml up -d backend` |
| Rebuild after `.env` change | `docker compose -f docker-compose.mongo.yml up -d` (most envs read at runtime) |
| Rebuild after `NEXT_PUBLIC_API_BASE_URL` change | `docker compose -f docker-compose.mongo.yml build --no-cache frontend && docker compose -f docker-compose.mongo.yml up -d frontend` |
| Shell into backend | `docker compose -f docker-compose.mongo.yml exec backend sh` |
| Shell into Mongo | `docker compose -f docker-compose.mongo.yml exec mongo mongosh` |
| Pull fresh base image | `docker compose -f docker-compose.mongo.yml pull mongo` |

### Persisted data

| Volume | Mounted at | What's in it |
|---|---|---|
| `expiner_mongo-data` | `/data/db` | MongoDB data files |
| `expiner_expiners` | `/var/expiners` | Uploaded files |
| `expiner_backend-logs` | `/app/logs` | Winston daily-rotate logs (debug + error) |

Inspect the actual host path:
```bash
docker volume inspect expiner_expiners
```

### Backups

```bash
# Stop the backend so uploads aren't mid-write
docker compose -f docker-compose.mongo.yml stop backend

# Snapshot the uploads + mongo volumes
docker run --rm -v expiner_expiners:/data -v $(pwd):/backup \
    alpine tar czf /backup/expiners-$(date +%F).tgz -C /data .
docker run --rm -v expiner_mongo-data:/data -v $(pwd):/backup \
    alpine tar czf /backup/mongo-data-$(date +%F).tgz -C /data .

# Restart
docker compose -f docker-compose.mongo.yml start backend
```

---

## Project layout

```
expiner/
express-upload/
├── backend/                     Express + Mongoose API
│   ├── src/
│   │   ├── app.ts               Express bootstrap
│   │   ├── server.ts            Entry — wires routes + boots upload dirs
│   │   ├── config/              Env-driven config (UPLOAD_ROOT, PORT, …)
│   │   ├── database/            Mongoose connection
│   │   ├── models/              Mongoose schemas (User, File, ApiKey, …)
│   │   ├── services/            Business logic (typedi @Service)
│   │   ├── controllers/         Request handlers
│   │   ├── routes/              Express route classes
│   │   ├── middlewares/         auth, apiKey, file upload, error
│   │   ├── utils/               logger, multer, file-category sniff
│   │   └── scripts/             One-off backfill / maintenance
│   ├── Dockerfile               Multi-stage production image
│   ├── public/                  Static HTML
│   ├── swagger.yaml             API contract (source of truth)
│   └── package.json
│
├── frontend/                    Next.js Pages Router app
│   ├── src/
│   │   ├── pages/               Routes (login, dashboard, admin, api/_config)
│   │   ├── components/
│   │   │   ├── ui/              Shared Chakra primitives
│   │   │   ├── layouts/         AdminLayout, DashboardLayout, AuthLayout
│   │   │   ├── auth/            LoginForm, SignupForm
│   │   │   ├── dashboard/       MyFilesGrid, MyKeysTable, …
│   │   │   └── admin/           UsersTable, AllFilesGrid, …
│   │   ├── contexts/            AuthContext + AuthProvider
│   │   ├── hooks/               useAuth, useFiles, useApiKeys, useToastError
│   │   ├── lib/                 api (axios), endpoints, auth, format, theme
│   │   └── types/               api.ts — request/response types
│   ├── Dockerfile               Multi-stage, output: 'standalone'
│   ├── next.config.js           trailingSlash: true, output: 'standalone'
│   └── package.json
│
├── docker-compose.mongo.yml     All-in-one stack (mongo + backend + frontend)
├── docker-compose.no-mongo.yml  External-Mongo stack (backend + frontend)
├── docker-compose.yml           Wrapper (default = no-mongo)
├── packages/
│   └── upload-client/           @moomle/upload-client — JS/TS client lib
├── .env.example                 Documented template
├── Makefile                     Convenience targets
├── LICENSE
└── README.md                    (you are here)
```

### Per-tree documentation

- [`backend/AGENTS.md`](backend/AGENTS.md) — backend edit-scope rules and
  cross-tree data flow
- [`frontend/AGENTS.md`](frontend/AGENTS.md) — frontend edit-scope rules
- [`backend/agents/`](backend/agents/) — per-domain reference docs
  (auth, users, files, api-keys, location, images-deprecated)

---

## Troubleshooting

**Backend restart-loops on `npm run start`**
The build step produced no `dist/`. Force a clean build:
```bash
docker compose -f docker-compose.mongo.yml build --no-cache backend
```

**Frontend shows "Index of out/"**
The frontend is being served by a static file server instead of
`next start`. You're using an old image — rebuild it.

**Frontend hits the wrong API URL after a `.env` change**
`NEXT_PUBLIC_API_BASE_URL` is baked into the bundle at build time.
Rebuild the frontend:
```bash
docker compose -f docker-compose.mongo.yml build --no-cache frontend
docker compose -f docker-compose.mongo.yml up -d frontend
```

**`MONGODB_URI must be set in the root .env`**
You ran the no-mongo profile without defining `MONGODB_URI`. Either
add it to `.env` or switch to `docker-compose.mongo.yml`.

**`bind: address already in use`**
Another process owns port 3055 or 5601. Either stop it, or change
`FRONTEND_PORT` / `BACKEND_PORT` in `.env`.

**Backend logs say `MongooseServerSelectionError: connect ECONNREFUSED`**
Mongo isn't reachable from the backend container. Check
`docker compose -f docker-compose.mongo.yml logs mongo` and confirm
`MONGODB_URI` uses the service name `mongo` (not `localhost` or a
host IP).

**Uploads disappear after `down`**
You ran `docker compose down -v`, which removes the named volumes.
Use `docker compose down` (no `-v`) to keep data.

**CORS error in the browser console**
The frontend's origin isn't in the backend's CORS allowlist. Add it
via `FRONTEND_ORIGIN` in `.env` (e.g. `FRONTEND_ORIGIN=https://files.example.com`)
and restart the backend.

**Logs say `Cannot find module '@config'` or similar**
Path-alias issue — `dist/` was built with SWC only (which doesn't
rewrite `@config` → `config`). The prod Dockerfile runs `tsc-alias`
after `swc`. Force a clean build.

**I want to wipe everything and start over**
```bash
docker compose -f docker-compose.mongo.yml down -v
docker system prune -af       # optional: also drop dangling images
docker compose -f docker-compose.mongo.yml up -d --build
```

---

## Security checklist

Before exposing this to the public internet:

- [ ] Set `SECRET_KEY` to a long random string (`openssl rand -base64 64`)
- [ ] Change `BOOTSTRAP_ADMIN_PASSWORD` from its default
- [ ] Enable MongoDB auth (uncomment the `MONGO_INITDB_*` block in
      `docker-compose.mongo.yml` and set `MONGO_USER` / `MONGO_PASSWORD`)
- [ ] Put the stack behind a TLS-terminating reverse proxy (Caddy,
      nginx, Traefik) — never expose MongoDB (port 27017) publicly
- [ ] Set `FRONTEND_ORIGIN` to your public frontend URL
- [ ] Set `BACKEND_PORT` / `FRONTEND_PORT` to non-default values if
      you want to avoid scanners finding the stack
- [ ] Back up `expiners` and `mongo-data` volumes regularly
- [ ] Back up `express-uploads` and `mongo-data` volumes regularly
- [ ] Keep Docker Engine, MongoDB, and the Node base image up to date
      (`docker compose pull && docker compose up -d --build`)

---

## License

MIT — see [`LICENSE`](LICENSE).
