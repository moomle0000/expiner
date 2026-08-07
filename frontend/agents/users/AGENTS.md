# Domain: users

User records. Two views: admin can list/create/edit/delete/disable/reset-password
for any user; every authenticated user can read and update their own profile and
change their own password. Both views share the same `ProfilePanel` and
`useUsers` hook.

## Pages
- `src/pages/admin/users.tsx` — `AdminLayout` + `PageHeader` + `UsersTable`.
- `src/pages/admin/profile.tsx` — `AdminLayout` + `PageHeader` + `ProfilePanel`.
- `src/pages/dashboard/profile.tsx` — `DashboardLayout` + `PageHeader` + `ProfilePanel` (same component, gated by the layout).

## Feature components
- `src/components/admin/UsersTable.tsx` — Table of all users. Row menu: Edit / Reset password / Disable or Enable / Delete. Self-row shows a "you" chip and refuses to disable itself.
- `src/components/admin/UserFormModal.tsx` — Create + edit modal. Fields: name, username, email, password (required on create, optional on edit), role, status (Switch).
- `src/components/admin/ResetPasswordModal.tsx` — Admin-reset-password modal; success state is inline, then a "Done" button closes.
- `src/components/dashboard/ProfilePanel.tsx` — Self-service: avatar upload/remove, edit name/email, change password, read-only account facts. Used by both admin and user profile pages.

## Hook
- `src/hooks/useUsers.ts` — `useUsers` (list/create/update/delete/resetPassword/setUserStatus). Returns `{ users, loading, error, refresh, createUser, updateUser, deleteUser, resetPassword, setUserStatus }`. `UserInput` accepts `name`, `username`, `email`, `password`, `role`, `status`, `active`.

## Types
- `src/types/api.ts` — `User`, `UserRole`.

## Endpoints used (see `src/lib/endpoints.ts`)
- `GET    /users` — `ENDPOINTS.users` (list, admin-gated server-side)
- `POST   /users` — `ENDPOINTS.users` (admin create)
- `PATCH  /users/:id` — `ENDPOINTS.user(id)` (admin update — also used by `setUserStatus` to flip the `status` flag)
- `DELETE /users/:id` — `ENDPOINTS.user(id)`
- `POST   /auth/admin/reset-password` — `ENDPOINTS.adminResetPassword` — body `{ userId, newPassword }`
- `PATCH  /api/auth/me` — `ENDPOINTS.me` (self name/email; `{ avatar: null }` clears the picture)
- `POST   /api/auth/me/password` — `ENDPOINTS.mePassword` — body `{ currentPassword, newPassword }`
- `POST   /api/auth/me/avatar` — `ENDPOINTS.meAvatar` — multipart field `avatar`; returns the sanitized user

## Shared dependencies
- `AdminLayout`, `DashboardLayout` — `src/components/layouts/`
- `PageHeader`, `EmptyState`, `ConfirmDialog`, `RoleBadge`, `StatusBadge` — `src/components/ui/`
- `PasswordInput` — `src/components/ui/PasswordInput.tsx`
- `useAuth` (for the "self" check in `UsersTable`) — `src/hooks/useAuth.ts`
- `extractErrorMessage` — `src/lib/api.ts`

## Rules
- `UsersTable` refuses to disable its own row and surfaces a warning toast instead of calling the API.
- `UserFormModal` requires a password on create; on edit the password field is optional and the existing password is preserved when left blank.
- Your avatar renders via `${API_BASE_URL}${user.avatar}` — see `src/lib/endpoints.ts` `API_BASE_URL` (a re-evaluating proxy).
- `ProfilePanel` writes the updated user to `AuthContext.setUser` on a successful `PATCH /api/auth/me` so the topbar reflects the new name/email immediately.
- `setUserStatus` toggles the `status` boolean via `PATCH /users/:id` and updates the row in place — no full re-fetch.
- The "you" chip in `UsersTable` is determined by `me?._id === u._id` from `useAuth().user`.
