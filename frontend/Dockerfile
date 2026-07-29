# syntax=docker/dockerfile:1.7

# ---------- Stage 1: deps (build-time, all deps) ----------
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# `npm ci` falls back to `npm install` if no lockfile is committed.
# Both `bun.lock` and `package-lock.json` are present in the repo
# (per-tree AGENTS.md), so we honor whichever is canonical. We use
# `npm` here because Bun isn't a hard dependency of the build path.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---------- Stage 2: build (Next.js → .next/standalone) ----------
FROM deps AS build

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:5601
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY . .
# `output: 'standalone'` in next.config.js means `next build` writes a
# minimal `server.js` to `.next/standalone/` plus the static assets
# and public/ folder. The standalone output ships its own pruned
# `node_modules`, so we don't need a runtime install step.
RUN npm run build

# ---------- Stage 3: runtime ----------
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3055 \
    HOSTNAME=0.0.0.0

WORKDIR /app

# Standalone output copies the pruned node_modules + server.js. The
# `--chown=node:node` flags were removed because rewriting owner on
# tens of thousands of files is the slowest step in the build —
# running as `node` user doesn't require owning node_modules.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# ca-certificates for any outbound HTTPS from the Next.js server
# (e.g. API calls to the backend over https, image proxies).
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# .next/cache is the only directory Next writes to at runtime; it
# lives inside .next/ which is now read-only. The standalone build
# uses `.next/cache` for incremental data — make it writable for the
# node user. The chown is scoped to one small directory, not /app.
RUN mkdir -p /app/.next/cache \
 && chown -R node:node /app/.next/cache

USER node

EXPOSE 3055

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT+'/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
