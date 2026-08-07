# Domain: workspace

Owner-scoped **folders** and **categories** management page. Folders assign where
uploads land (`X-Folder`); categories tag them (`category` form field). Everything
is scoped to the signed-in user via `createdBy` — the API never leaks another
user's folders/categories.

## Pages
- `src/pages/dashboard/workspace.tsx` — `DashboardLayout` + `PageHeader` + `WorkspacePanel`.

## Feature components
- `src/components/dashboard/WorkspacePanel.tsx` — two-column card grid: a **Folders** manager and a **Categories** manager. Each card: add-by-name input (+ Enter key), list of the user's items with a per-item delete button. Delete is confirmed via `ConfirmDialog` (files already uploaded are not deleted).

## Hooks
- `src/hooks/useFolders.ts` — `useFolders()` → `{ folders, loading, error, create(name), remove(id), refresh }`.
- `src/hooks/useCategories.ts` — `useCategories()` → `{ categories, loading, error, create(name), remove(id), refresh }`.

## Types
- `src/types/api.ts` — `WorkspaceFolder { _id, name, createdBy?, createdAt?, updatedAt? }`, `WorkspaceCategory { _id, name, createdBy?, createdAt?, updatedAt? }`.

## Endpoints used (see `src/lib/endpoints.ts`)
- `GET    /api/folders` — `ENDPOINTS.folders`
- `POST   /api/folders` — `ENDPOINTS.createFolder`
- `DELETE /api/folders/:id` — `ENDPOINTS.deleteFolder(id)`
- `GET    /api/categories` — `ENDPOINTS.categories`
- `POST   /api/categories` — `ENDPOINTS.createCategory`
- `DELETE /api/categories/:id` — `ENDPOINTS.deleteCategory(id)`

## Shared dependencies
- `ConfirmDialog` — `src/components/ui/`
- `extractErrorMessage` — `src/lib/api.ts`

## Rules
- The **upload flow** in `MyFilesGrid` (see `agents/files/AGENTS.md`) renders a folder `Select` (from `useFolders`), a category `Select` (from `useCategories`), and a free-text "New category" `Input`. The selected folder is sent as the `X-Folder` header; the category is sent as the `category` form field (typed value wins over the selected one).
- The workspace page is user-only (dashboard). Admins use their own dashboard space.
- Deleting a folder/category removes only the workspace entry — existing files keep their stored `folder`/`category` strings.
