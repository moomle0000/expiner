# Docker usage — express-upload

This repo ships **three** Compose files at the root:

| File | What's inside | Use when |
|---|---|---|
| `docker-compose.yml` | Forwards to `docker-compose.no-mongo.yml` (external Mongo) | You run MongoDB somewhere else (Atlas, another host, a sidecar) |
| `docker-compose.no-mongo.yml` | `backend` + `frontend` | Default. You supply `MONGODB_URI` from `.env` |
| `docker-compose.mongo.yml` | `mongo` + `backend` + `frontend` | All-in-one dev/local. Mongo runs in the stack |

The backend and frontend live in `backend/Dockerfile` and
`frontend/Dockerfile` respectively — both are multi-stage builds. The
frontend uses Next.js `output: 'standalone'`.

---

## 1. Prerequisites

- Docker Engine 20.10+ and Docker Compose v2 (`docker compose ...`)
- A root `.env` file next to the compose files (compose auto-loads it)
- MongoDB reachable from the backend container (external) **or** no
  external Mongo at all (in-cluster)

---

## 2. Root `.env` template

The compose files read these from the root `.env`:

```env
# --- Required for docker-compose.no-mongo.yml (external Mongo) ---
# Example: mongodb://user:pass@host:27017/image
MONGODB_URI=mongodb://192.168.100.157:27017/image

# --- Optional auth on the in-cluster mongo (docker-compose.mongo.yml) ---
# MONGO_USER=
# MONGO_PASSWORD=

# --- App secrets (change for any non-local deployment) ---
SECRET_KEY=change-me-in-real-deployments
JWT_EXPIRES_IN=7d

# --- Bootstrap users (seeded at backend startup if set) ---
# Admin: created with role=admin if no user with this email exists.
# Regular user: created with role=user if no user with this email exists.
# Both are idempotent — restart the backend any number of times.
# Leave any *_PASSWORD empty to skip seeding that user.
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=change-me
BOOTSTRAP_ADMIN_NAME=Admin
BOOTSTRAP_USER_EMAIL=user@example.com
BOOTSTRAP_USER_PASSWORD=change-me
BOOTSTRAP_USER_NAME=User

# --- CORS / ports ---
FRONTEND_ORIGIN=http://localhost:3055
BACKEND_PORT=5601
FRONTEND_PORT=3055

# --- Frontend → Backend URL (baked at build time + read at runtime) ---
NEXT_PUBLIC_API_BASE_URL=http://localhost:5601
```

`MONGODB_URI` is **required** by `docker-compose.no-mongo.yml` and
**optional** in `docker-compose.mongo.yml` (falls back to
`mongodb://mongo:27017/image-upload`).

---

## 3. Common workflows

### 3.1 Start the stack (external Mongo, default)

```bash
docker compose up -d
```

This uses `docker-compose.yml` → `docker-compose.no-mongo.yml` and
brings up `backend` + `frontend`.

### 3.2 Start the stack with in-cluster Mongo

```bash
docker compose -f docker-compose.mongo.yml up -d
```

Brings up `mongo` + `backend` + `frontend`. Backend waits for Mongo's
healthcheck before starting.

### 3.3 View logs

```bash
# All services
docker compose logs -f

# One service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

### 3.4 Stop the stack

```bash
# Stop containers, keep volumes (uploads + logs + mongo data persist)
docker compose down

# Stop + delete volumes (full reset)
docker compose down -v
```

For the Mongo variant, use the same flags with `-f docker-compose.mongo.yml`.

### 3.5 Rebuild a single service

When you change code, config, or build-args:

```bash
# Backend
docker compose build backend
docker compose up -d backend

# Frontend (e.g. after changing NEXT_PUBLIC_API_BASE_URL)
docker compose build frontend
docker compose up -d frontend
```

**No-cache rebuild** — use when a build-arg changed and you want to
guarantee the new value is baked in (not picked up from cache):

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

### 3.6 Re-pull a base image

```bash
docker compose pull mongo       # only relevant for docker-compose.mongo.yml
```

### 3.7 Open a shell in a container

```bash
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec mongo mongosh
```

---

## 4. How `NEXT_PUBLIC_API_BASE_URL` works

The frontend Dockerfile declares the URL as a **build-arg** (line 18 of
`frontend/Dockerfile`). It's read at build time and baked into the
JavaScript bundle. The compose file also passes it as a **runtime env
var**, which is read per request by `frontend/src/pages/api/_config.ts`
and re-injected into `window.__API_BASE_URL__` on every browser load.

| Change type | Steps |
|---|---|
| **Runtime-only** (e.g. just `docker compose up -d` with a new env) | No rebuild. Browser picks it up on the next reload because `_app.tsx` re-fetches `/api/_config`. |
| **Build-time** (truly need a different URL in the SSR pass / first paint) | Set `NEXT_PUBLIC_API_BASE_URL` in the root `.env`, then `docker compose build --no-cache frontend && docker compose up -d frontend`. |

---

## 5. Persisted data

| Volume | Mounted at | Survives `down`? | Survives `down -v`? |
|---|---|---|---|
| `express-uploads` | `/var/express-uploads` (backend) | Yes | No |
| `backend-logs` | `/app/logs` (backend) | Yes | No |
| `mongo-data` (Mongo variant only) | `/data/db` (mongo) | Yes | No |

To inspect uploads on the host:

```bash
docker volume inspect express-upload_express-uploads
```

---

## 6. Troubleshooting

- **`MONGODB_URI must be set in the root .env`** — you ran
  `docker-compose.no-mongo.yml` (or the default) without defining
  `MONGODB_URI`. Add it to the root `.env` or switch to
  `docker-compose.mongo.yml`.
- **Backend won't start in the Mongo variant** — check
  `docker compose logs mongo`. The backend waits for the healthcheck
  (`db.adminCommand('ping').ok`); if Mongo is unhealthy it never starts.
- **Frontend shows the old API URL after a `.env` change** — you changed
  `NEXT_PUBLIC_API_BASE_URL` but didn't rebuild. Run
  `docker compose build --no-cache frontend && docker compose up -d frontend`.
- **Port already in use** — change `BACKEND_PORT` / `FRONTEND_PORT` in
  the root `.env` and bring the stack up again.
- **Reset everything** (uploads, logs, mongo data, images) —
  `docker compose down -v` then `docker compose build --no-cache`.

---

## 7. Quick reference

```bash
# Default (external Mongo)
docker compose up -d
docker compose logs -f
docker compose down

# All-in-one (in-cluster Mongo)
docker compose -f docker-compose.mongo.yml up -d
docker compose -f docker-compose.mongo.yml down -v

# Rebuild after changing NEXT_PUBLIC_API_BASE_URL
docker compose build --no-cache frontend
docker compose up -d frontend
```
