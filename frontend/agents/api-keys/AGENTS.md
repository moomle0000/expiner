# Domain: api-keys

Per-user API keys for server-to-server auth (`X-API-Key` header). Same panel
component renders the user's own keys on `/dashboard/api-keys` and every key
across the workspace on `/admin/keys`. Admin can revoke any key; users can
revoke their own.

## Pages
- `src/pages/admin/keys.tsx` — `AdminLayout` + `PageHeader` + `ApiKeysPanel scope="all"`.
- `src/pages/dashboard/api-keys.tsx` — `DashboardLayout` + `PageHeader` + `ApiKeysPanel scope="me"`.

## Feature components
- `src/components/dashboard/ApiKeysPanel.tsx` — Table + create button + raw-key reveal banner. `scope="me"` hides the Owner column; `scope="all"` shows an Owner column with avatar, name, role badge, and email. Deleted-owner state renders "Deleted user" plus the raw `createdBy` id.
- `src/components/dashboard/CreateKeyModal.tsx` — Single-input name modal. Calls `useApiKeys().create(name)`, hands the returned `ApiKeyCreated` to the panel's `onCreated` so it can show the raw key once.

## Hook
- `src/hooks/useApiKeys.ts` — `useApiKeys(scope)` returns `{ keys, loading, error, create, revoke, refresh }`. `scope` selects `ENDPOINTS.myKeys` vs `ENDPOINTS.adminKeys`.

## Types
- `src/types/api.ts` — `ApiKeyPublic`, `ApiKeyCreated`, `ApiKeyOwnerRef`. Per backend contract: `ApiKeyPublic` carries both a raw `createdBy: string` (preserved on deleted-owner records) and a populated `user: ApiKeyOwnerRef | null` (`{ id, name, username, email, role }` or `null`).

## Endpoints used (see `src/lib/endpoints.ts`)
- `GET  /api/auth/keys` — `ENDPOINTS.myKeys` (caller's keys)
- `POST /api/auth/keys` — `ENDPOINTS.myKeys` (mint — body `{ name }`)
- `POST /api/auth/keys/:id/revoke` — `ENDPOINTS.revokeKey(id)`
- `GET  /api/admin/keys` — `ENDPOINTS.adminKeys` (every key, admin only)

## Shared dependencies
- `CopyButton`, `ConfirmDialog`, `EmptyState`, `RoleBadge` — `src/components/ui/`
- `formatRelative`, `getOwnerLabel`, `getInitials` — `src/lib/format.ts`
- `useToast` from `@chakra-ui/react` (top-right position convention is the project default)

## Rules
- The raw key from `ApiKeyCreated.key` is shown exactly once after mint. The panel displays it in a lime-bordered banner with `CopyButton`; dismissing the banner hides it permanently until the next mint.
- `revoke` is optimistic: it `POST /revoke` and flips `active: false` on the local row, no re-fetch.
- `ApiKeysPanel` with `scope="all"` is the only place the Owner column is rendered. Deleted-owner rows render an italic "Deleted user" with the raw `createdBy` id underneath.
- `getOwnerLabel(user, fallbackId)` (in `src/lib/format.ts`) is the single source of truth for owner display: `name → username → email → id → "Deleted user"`.
- `CreateKeyModal` does not cache the returned key — the parent panel owns the reveal state.
