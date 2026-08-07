# Domain: files

Owner-scoped file upload, list-by-type, stream, download, delete. Public read by
short URL. The same `MyFilesGrid` is reused on the admin "all files" page and
the user "my files" page — the API is owner-scoped on the server side, so an
admin sees their own files through the same hook.

## Pages
- `src/pages/admin/files.tsx` — `AdminLayout` + `PageHeader` + `MyFilesGrid`.
- `src/pages/dashboard/files/index.tsx` — `DashboardLayout` + `PageHeader` + `MyFilesGrid`.

## Feature components
- `src/components/dashboard/MyFilesGrid.tsx` — upload controls (folder `Select`, category `Select` + free-text "New category" input) + Dropzone + type filter chips + a category filter `Select` (options derived from loaded files) + the shared `FileCards` grid.
- `src/components/ui/FileCards.tsx` — shared **file-manager** grid/table. Extract of the grid markup formerly inline in `MyFilesGrid`; reused by `MyFilesGrid`, `FolderDetail`, and `CategoryDetail` (see `agents/workspace/AGENTS.md`). Props: `{ files, onRemove(id), emptyTitle?, emptyDescription? }`. Includes a toolbar: search-by-name (`originalName`/`filename`), upload-date preset filter (today / 7d / 30d / this year), explicit `from`/`to` date-range inputs (override the preset when set), sort (newest / oldest / name A–Z / largest first), and a grid ⇄ list (table) view toggle. Cards and table rows both show the absolute upload date (`formatDate`) plus relative time, a category `Tag`, download/open/delete menu, and the copyable public link. Delete is confirmed via `ConfirmDialog`; "Clear filters" resets search/date/sort. Empty-list vs no-match states are distinguished.
- `src/components/ui/FileDropzone.tsx` — Drag-and-drop and click-to-browse. Multipart upload via `POST /api/files/upload` with an optional `X-Folder` header and an optional `category` form field. Single toast covers the whole batch. Upload logic is shared via `useFileUpload` so hidden drop-target surfaces (e.g. `FolderDetail`) upload identically.
- `src/hooks/useFileUpload.ts` — shared upload hook `useFileUpload({ folder?, category? })` → `{ upload(files), uploading }`. `upload` POSTs each file to `/api/files/upload` (multipart, `X-Folder` + `category`) and returns the created `AuthFile[]`; one success/error toast per batch.
- `src/components/ui/FileIcon.tsx` — File-type → icon + color mapping. Helper `fileCategoryOf(mime)` for callers.

## Hook
- `src/hooks/useFiles.ts` — `useFiles(initialType?)` returns `{ files, loading, error, type, setType, category, setCategory, remove, refresh }`. Switching `type` re-fetches `/api/files/type/:type`; switching `category` (free-text) re-fetches `/api/files?category=<label>`; both `"all"` hit `/api/files`. Category takes precedence over type when both are non-"all".

## Types
- `src/types/api.ts` — `AuthFile`, `FileCategory`. `FileCategory` enum values: `image | document | video | audio | archive | executable | other`. `AuthFile.category` is a **user-assigned free-text `string`** (not the enum) — set on upload, used for filtering.

## Endpoints used (see `src/lib/endpoints.ts`)
- `GET    /api/files` — `ENDPOINTS.files`
- `GET    /api/files?category=<label>` — `ENDPOINTS.filesByCategory(category)`
- `GET    /api/files/type/:type` — `ENDPOINTS.filesByType(type)`
- `POST   /api/files/upload` — `ENDPOINTS.fileUpload` (multipart, field `file`, optional `X-Folder` header)
- `DELETE /api/files/:id` — `ENDPOINTS.deleteFile(id)`
- `GET    /api/files/:id<ext?>` — `ENDPOINTS.file(id, ext?)` (auth'd stream — used as image preview src)
- `GET    /api/files/:id/download` — `ENDPOINTS.fileDownload(id)`
- `GET    /f/:shortUrl<ext?>` — `ENDPOINTS.publicFile(shortUrl, ext?)` (no auth, used for the copyable public link)

## Shared dependencies
- `CopyButton`, `ConfirmDialog`, `EmptyState` — `src/components/ui/`
- `formatBytes`, `formatRelative` — `src/lib/format.ts`
- `API_BASE_URL` — `src/lib/endpoints.ts` (used to build absolute stream/download/public URLs)

## Rules
- Image previews use the auth'd stream URL (`/api/files/:id<ext?>`) with the bearer cookie; non-image files render a `FileIcon` keyed off the detected `mimetype`.
- The copyable "public" link is always `${API_BASE_URL}/f/:shortUrl<ext?>` — this is the no-auth variant and increments the `views` counter.
- The "Download" link is `${API_BASE_URL}/api/files/:id/download` and increments the `downloads` counter.
- The dropzone uploads sequentially inside a single function call and emits one success toast per batch, not per file.
- The dropzone's `X-Folder` header is only sent when the `folder` prop is non-empty.
- Folder/category options for the upload row come from `useFolders` / `useCategories` (see `agents/workspace/AGENTS.md`).
- File-type filter chips map 1:1 to `FileCategory` enum values; "all" is a UI-only state that maps to `ENDPOINTS.files`.
