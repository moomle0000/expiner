# apikeys

## Backend paths
- Interface: `src/interfaces/apiKey.interface.ts` — `IApiKey { name, keyHash, createdBy (ref User), active, lastUsedAt }`. Public view: `ApiKeyPublic { id, name, createdById, user: { id, name, username, email, role } | null, active, lastUsedAt, createdAt }` — the `user` block is denormalised from the populated `createdBy` ref so list endpoints can render rows without N+1 lookups.
- DTO: `src/dtos/apiKey.dto.ts` — `CreateApiKeyDto { name }`
- Model: `src/models/apiKey.model.ts` — `ApiKeyModel` (collection `apikeys`, `keyHash` unique + indexed, `createdBy` indexed)
- Service: `src/services/apiKey.service.ts` — `ApiKeyService`
- Controller: `src/controllers/apiKey.controller.ts` — `ApiKeyController`
- Route: `src/routes/apiKey.route.ts` — `ApiKeyRoute`

## Route map
```
GET  /api/auth/keys                -> listMyKeys (own keys, requires Bearer token)
POST /api/auth/keys                -> createKey (own key, requires Bearer token; returns raw key ONCE)
POST /api/auth/keys/:id/revoke     -> revokeKey (own key, or admin)
GET  /api/admin/keys               -> listAllKeys (admin only)
```

## Domain-specific rules
- Raw key: 24 random bytes (48 hex chars) via `generateRandomString(24)` from `@utils/util`.
- Stored as `sha256(rawKey)`, deterministic — no bcrypt, no salt. Lookup is `findOne({ keyHash, active: true })`.
- Raw key is returned exactly once in the `POST /api/auth/keys` response and never again.
- `lastUsedAt` is updated in the background on each successful `validateKey` (fire-and-forget, never blocks the request).
- A `User` can hold any number of keys — multiple keys per user is supported; storage folder is taken from the **user**, not the key.
- Self-revoke is allowed; admin can revoke any key; revoke sets `active: false` (soft delete).
- List endpoints (`listKeysForUser`, `listAllKeys`) populate the `createdBy` ref with `name username email role` and flatten it into `user: { id, name, username, email, role } | null`. If the owner was deleted, `user` is `null` and `createdById` is still set.
- `apiKeyAuth` middleware (`src/middlewares/apiKeyAuth.middleware.ts`) accepts the key from `X-API-Key` header or `?api_key=` query param. The same middleware also accepts `Authorization: Bearer <jwt>` (or session cookie) as a fallback for browser-based calls; X-API-Key takes precedence when both are present.
