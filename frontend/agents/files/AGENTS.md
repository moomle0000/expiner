# Domain: files

Owner-scoped file upload, list-by-type, stream, download, delete. Public read by
short URL. The same `MyFilesGrid` is reused on the admin "all files" page and
the user "my files" page — the API is owner-scoped on the server side, so an
admin sees their own files through the same hook.

## Pages
- `src/pages/admin/files.tsx` — `AdminLayout` + `PageHeader` + `MyFilesGrid`.
- `src/pages/dashboard/files.tsx` — `DashboardLayout` + `PageHeader` + `MyFilesGrid`.

## Feature components
<<<<<<< HEAD
- `src/components/dashboard/MyFilesGrid.tsx` — upload controls (folder `Select`, category `Select` + free-text "New category" input) + Dropzone + type filter chips + a category filter `Select` (options derived from loaded files) + card grid. Each card: image preview (or `FileIcon`), a category `Tag` when set, per-file menu (Download / Open / Delete), public URL with `CopyButton`. Delete is confirmed via `ConfirmDialog`.
- `src/components/ui/FileDropzone.tsx` — Drag-and-drop and click-to-browse. Multipart upload via `POST /api/files/upload` with an optional `X-Folder` header and an optional `category` form field. Single toast covers the whole batch.
- `src/components/ui/FileIcon.tsx` — File-type → icon + color mapping. Helper `fileCategoryOf(mime)` for callers.

## Hook
- `src/hooks/useFiles.ts` — `useFiles(initialType?)` returns `{ files, loading, error, type, setType, category, setCategory, remove, refresh }`. Switching `type` re-fetches `/api/files/type/:type`; switching `category` (free-text) re-fetches `/api/files?category=<label>`; both `"all"` hit `/api/files`. Category takes precedence over type when both are non-"all".

## Types
- `src/types/api.ts` — `AuthFile`, `FileCategory`. `FileCategory` enum values: `image | document | video | audio | archive | executable | other`. `AuthFile.category` is a **user-assigned free-text `string`** (not the enum) — set on upload, used for filtering.

## Endpoints used (see `src/lib/endpoints.ts`)
- `GET    /api/files` — `ENDPOINTS.files`
- `GET    /api/files?category=<label>` — `ENDPOINTS.filesByCategory(category)`
=======
- `src/components/dashboard/MyFilesGrid.tsx` — Dropzone + type filter chips + card grid. Each card: image preview (or `FileIcon`), per-file menu (Download / Open / Delete), public URL with `CopyButton`. Delete is confirmed via `ConfirmDialog`.
- `src/components/ui/FileDropzone.tsx` — Drag-and-drop and click-to-browse. Multipart upload via `POST /api/files/upload` with `X-Folder` header. Single toast covers the whole batch.
- `src/components/ui/FileIcon.tsx` — File-type → icon + color mapping. Helper `fileCategoryOf(mime)` for callers.

## Hook
- `src/hooks/useFiles.ts` — `useFiles(initialType?)` returns `{ files, loading, error, type, setType, remove, refresh }`. Switching `type` re-fetches `/api/files/type/:type`; "all" hits `/api/files`.

## Types
- `src/types/api.ts` — `AuthFile`, `FileCategory`. `FileCategory` enum values: `image | document | video | audio | archive | executable | other`.

## Endpoints used (see `src/lib/endpoints.ts`)
- `GET    /api/files` — `ENDPOINTS.files`
>>>>>>> origin/main
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
<<<<<<< HEAD
- Folder/category options for the upload row come from `useFolders` / `useCategories` (see `agents/workspace/AGENTS.md`).
=======
>>>>>>> origin/main
- File-type filter chips map 1:1 to `FileCategory` enum values; "all" is a UI-only state that maps to `ENDPOINTS.files`.
