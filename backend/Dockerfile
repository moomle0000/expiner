# syntax=docker/dockerfile:1.7

# ---------- Stage 1: install ALL deps (incl. devDeps for SWC build) ----------
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# Build tooling needed by some npm packages (node-gyp, bcrypt).
# `bcrypt` is a hard dep of the backend (`package.json` line 22) and it
# needs node-gyp → python3 + build-essential at install time.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 build-essential ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
# `npm ci` is the reproducible, lockfile-driven install. Falls back to
# `npm install` only if no lockfile is present (CI will fail loudly on
# the lockfile path, which is what we want).
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---------- Stage 2: prod-only deps (no devDeps) ----------
FROM node:20-bookworm-slim AS prod-deps

WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ---------- Stage 3: build (SWC → dist/) ----------
FROM deps AS build

COPY . .
# `npm run build` is `swc src -d dist --source-maps --copy-files`
RUN npm run build

# ---------- Stage 4: runtime ----------
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=5601 \
    LOG_DIR=/app/logs \
<<<<<<< HEAD
    UPLOAD_ROOT=/var/expiners
=======
    UPLOAD_ROOT=/var/express-uploads
>>>>>>> origin/main

WORKDIR /app

# ca-certificates for outbound HTTPS (e.g. fetch to external services).
# node_modules comes from prod-deps stage — keeps the layer cached and
# avoids reinstalling.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules
# Compiled output.
COPY --from=build /app/dist ./dist
# swagger.yaml is read at runtime by src/app.ts via `path.join(__dirname, '..', 'swagger.yaml')`.
COPY --from=build /app/swagger.yaml ./swagger.yaml
# `package.json` is needed at runtime for a few things (e.g. version
# stamp). It's tiny — not worth the chown cost of bundling it with
# node_modules.
COPY package.json ./

# Non-root runtime user. Only chown the small writable dirs (logs,
# uploads) and the few app files the user needs to write to at runtime
# (none today, but `dist/` is what we ship). The fat `node_modules`
# stays owned by root — Node doesn't care.
RUN groupadd --system app && useradd --system --gid app --home /app app \
<<<<<<< HEAD
 && mkdir -p /app/logs /var/expiners \
 && chown -R app:app /app/logs /var/expiners /app/dist /app/swagger.yaml /app/package.json
=======
 && mkdir -p /app/logs /var/express-uploads \
 && chown -R app:app /app/logs /var/express-uploads /app/dist /app/swagger.yaml /app/package.json
>>>>>>> origin/main
USER app

EXPOSE 5601

# Lightweight healthcheck against the swagger endpoint; if Mongo is
# unreachable the /api-docs page still renders, so this only proves
# the Node process is alive.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT+'/api-docs',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
