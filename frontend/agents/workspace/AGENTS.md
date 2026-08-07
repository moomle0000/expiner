# Domain: workspace

Owner-scoped **folders** and **categories** management page. Folders assign where
uploads land (`X-Folder`); categories tag them (`category` form field). Everything
is scoped to the signed-in user via `createdBy` — the API never leaks another
user's folders/categories.

## Pages
- `src/pages/dashboard/workspace.tsx` — `DashboardLayout` + `PageHeader` + `WorkspacePanel`.
- `src/pages/dashboard/folder/index.tsx` — `DashboardLayout` + `PageHeader` + `FoldersPanel`.
- `src/pages/dashboard/folder/[id].tsx` — `DashboardLayout` + `FolderDetail`. Resolves the id from `router.query.id` and passes it down; the detail component renders its own dynamic `PageHeader` (so the page stays thin).
- `src/pages/dashboard/category/index.tsx` — `DashboardLayout` + `PageHeader` + `CategoriesPanel`.
- `src/pages/dashboard/category/[id].tsx` — `DashboardLayout` + `CategoryDetail` (same pattern as `folder/[id].tsx`).

## Feature components
- `src/components/dashboard/WorkspacePanel.tsx` — two-column card grid: a **Folders** manager and a **Categories** manager. Each card: add-by-name input (+ Enter key), and a per-item delete button. Delete is confirmed via `ConfirmDialog` (files already uploaded are not deleted).
- `src/components/dashboard/FoldersPanel.tsx` — grid of folder cards (icon, name, file count, total size, created date). Each card links to `/dashboard/folder/[id]`. Empty state links to the Workspace. Counts are computed client-side: `files.filter((f) => f.folder === folder.name)`.
- `src/components/dashboard/FolderDetail.tsx` — resolves the `WorkspaceFolder` by id, filters `useFiles()` for `f.folder === folder.name`, and renders `StatCard`s (files, size, downloads, views) + the shared `FileCards` grid. The **whole cards area is a hidden drop target**: no visible dropzone is rendered; dragging files over the grid shows a dashed "Drop to upload" overlay and dropping uploads them into the folder (via `useFileUpload({ folder: folder.name })`) then refreshes. Missing folder → `EmptyState` with a back link.
- `src/components/dashboard/CategoriesPanel.tsx` — same card-grid pattern as `FoldersPanel`, keyed off `f.category === category.name`, linking to `/dashboard/category/[id]`.
- `src/components/dashboard/CategoryDetail.tsx` — resolves the `WorkspaceCategory` by id; same stat + `FileCards` layout as `FolderDetail`.

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
- `FileCards`, `StatCard`, `EmptyState`, `PageHeader` — `src/components/ui/` (used by the folder/category browse + detail panels)

## Rules
- The **upload flow** in `MyFilesGrid` (see `agents/files/AGENTS.md`) renders a folder `Select` (from `useFolders`), a category `Select` (from `useCategories`), and a free-text "New category" `Input`. The selected folder is sent as the `X-Folder` header; the category is sent as the `category` form field (typed value wins over the selected one).
- Files carry the folder/category as **free-text names** (`AuthFile.folder`, `AuthFile.category`), not `_id` refs. The index/detail panels therefore match `files.filter((f) => f.folder === folder.name)` / `f.category === category.name`.
- The browse pages are user-only (dashboard). No new backend endpoints: they reuse `GET /api/folders`, `GET /api/categories`, and the existing file list endpoints via `useFiles`.
- Sidebar (user, "Workspace" section in `ResponsiveSidebar.tsx`): **Folders** → `/dashboard/folder`, **Categories** → `/dashboard/category`.
- Deleting a folder/category removes only the workspace entry — existing files keep their stored `folder`/`category` strings.
