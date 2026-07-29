# files

## Backend paths
- Interface: `src/interfaces/files.interface.ts` — `File { _id?, filename, originalName, path, size, mimetype, shortUrl, downloads, views, fileType, extension, createdAt?, updatedAt?, createdBy?, folder?, detectedMime?, detectedExt? }`
- DTO: `src/dtos/files.ts` — `CreateFileDto` (class-validator, includes `fileType` enum + `extension`), `UpdateFileDto` (partial)
- Model: `src/models/files.model.ts` — `FileModel` (collection `files`, `fileType` enum: image/document/video/audio/archive/executable/other, `shortUrl` unique; compound unique on `createdBy`+`folder`+`filename` for new rows)
- Service: `src/services/file.service.ts` — `FileService` (typedi `@Service()`)
- Controller: `src/controllers/File.controller.ts` — `FileController` (typedi DI)
- Route: `src/routes/file.route.ts` — `FileRoute` (path `/`)

## Route map
```
GET    /api/files                  -> getFiles           (apiKeyAuth, owner-scoped)
GET    /api/files/type/:type       -> getFilesByType     (apiKeyAuth, owner-scoped, validates enum)
GET    /api/files/:id.:ext?        -> getFileById        (apiKeyAuth, owner-scoped, streams file)
POST   /api/files/upload           -> uploadFile         (apiKeyAuth, multer field 'file')
DELETE /api/files/:id              -> deleteFile         (apiKeyAuth, owner-scoped, removes from disk)
GET    /api/files/:id/download     -> downloadFile       (apiKeyAuth, owner-scoped, res.download)
GET    /info/:shortUrl             -> getFileByShortUrl  (apiKeyAuth, owner-scoped JSON)
GET    /f/:shortUrl.:ext?          -> viewFile           (public; Cloudinary-style; increments views)
GET    /                            -> serves public/index.html
```

## Domain-specific rules
- **Auth:** identical to images — `/api/...` and `/info/...` are gated by `apiKeyAuth` which accepts either an `X-API-Key` (or `?api_key=` query) for server-to-server, or `Authorization: Bearer <jwt>` for browser sessions. `/f/:shortUrl` is public.
- **Storage path:** `uploads/<user.folderSlug>/<X-Folder header, sanitized>/<random8hex>.<ext>` — same convention as images.
- **Classification:** `categorize(ext)` from `@utils/fileCategory` populates `fileType` (image/document/video/audio/archive/executable/other). `fileType` was previously set client-side via `getFileType(mimetype)` in the controller — that helper is no longer used.
- **Short URL:** `crypto.randomBytes(6).toString('hex')` with collision-detection loop (in service, not controller).
- **View safety:** `viewFile` uses `isInlineSafe(mime)` to choose `inline` vs `attachment` Content-Disposition. SVG/HTML never inline.
- **Legacy `getFileType` helper:** removed from controller — the service now sets `fileType` from the sniffed/categorized result. Old clients uploading without `X-Folder` still work.
- **Stats:** `getFileStats(userId)` returns totalFiles/totalDownloads/totalViews + filesByType map, all filtered by `createdBy`.
- **Disk delete:** controller `tryUnlink` swallows errors; best-effort cleanup. The DB record is removed even if the disk delete fails.

## Shared / reused pieces this domain depends on
- `@middlewares/apiKeyAuth.middleware.ts` — `apiKeyAuth`
- `@utils/multerConfig` — `upload.single('file')`
- `@utils/fileCategory` — `categorize`, `categoryFromMime`, `isInlineSafe`, `sanitizeFolder`
- `@utils/sniff` — `sniffFile(filePath)`
- `@exceptions/httpException` — `HttpException`
- `@interfaces/Multer` — `MulterRequest`
- `@interfaces/AuthRequest` — `AuthRequest`
- `src/app.ts` — route registration
- `agents/users/AGENTS.md` — User model (owns storage namespace)
- `agents/apikeys/AGENTS.md` — API-key auth flow
