# upload-client

<<<<<<< HEAD
Tiny browser/Node client for the `expiner` file API. Ships as `@moomle/upload-client`.
=======
Tiny browser/Node client for the `express-upload` file API. Ships as `@moomle/upload-client`.
>>>>>>> origin/main

## Backend paths
- Source: `packages/upload-client/src/index.ts` (re-exports the public API)
- Upload core: `packages/upload-client/src/upload.ts` — `createUploader` factory; uses `XMLHttpRequest` (not `fetch`) so it can report upload progress
- URL helper: `packages/upload-client/src/url.ts` — `buildPublicUrl(baseUrl, shortUrl)` → absolute public view URL
- Types: `packages/upload-client/src/types.ts` — `UploadedFile`, `UploadOptions`, `UploadHandle`, `UploaderConfig`, `UploadError`

## Public API surface
```
createUploader(config)              → { upload(file, opts), publicUrl(shortUrl), baseUrl }
upload(file, opts)                  → UploadHandle { promise, cancel(reason?) }
buildPublicUrl(baseUrl, shortUrl)   → string  (e.g. 'https://host/f/abc123.png')
UploadError                         → Error subclass with .status, .body
```

## Build & test
- `cd packages/upload-client && npm run build` → runs `tsc -p tsconfig.json`, outputs to `dist/`
- `npm run lint` → `tsc --noEmit` (no separate linter — TS strict + `noUncheckedIndexedAccess` is the bar)
- The package has no runtime dependencies. Build is pure `tsc` (no SWC, no bundler) because consumers import the raw `.js` via the package's `exports.import` field.

## Domain-specific rules
<<<<<<< HEAD
- **Category field.** `UploadOptions.category` (optional free-text) is appended to the multipart body as a `category` form field. The server stores it and lets callers filter by it. Blank → not sent.
- **`path` is gone from responses.** The server's `FileModel` `toJSON` transform strips `path` for security; `UploadedFile.path` is typed `string | undefined` and should not be relied on.
=======
>>>>>>> origin/main
- **XHR, not fetch.** Browsers do not expose upload progress through `fetch`; the entire reason this lib exists as a custom thing (vs. just `fetch(formData)`) is progress + cancel. Do not "modernize" to fetch — it would silently regress progress callbacks.
- **Auth precedence matches the server.** `apiKey` is sent as `X-API-Key` and `token` as `Authorization: Bearer <jwt>`. If both are configured, `apiKey` wins — that mirrors `middlewares/apiKeyAuth.middleware.ts` which checks `X-API-Key` first.
- **Multer field name.** Server expects `upload.single('file')` (the unified `file.route.ts`), so the default `fieldName` is `'file'`. If you need to point at the legacy `image.route.ts` shape, pass `fieldName: 'image'` — but `image.route.ts` was removed in this repo.
- **No file size limit on the client.** Server enforces `FILE_CATEGORY_MAX_SIZE` per `fileType`. Surface server `413` via `UploadError.status`.
- **No retries.** Network blips throw `UploadError` immediately. Callers can wrap `uploader.upload` in their own retry policy if needed — keeps the lib small.

## Shared / reused pieces this domain depends on
- `agents/files/AGENTS.md` — the server route map (`POST /api/files/upload`, `GET /f/:shortUrl`)
- `src/middlewares/apiKeyAuth.middleware.ts` — auth precedence rules
- `src/utils/fileCategory.ts` — server-side `sanitizeFolder` constraints (used for `X-Folder`)
- No shared source with the backend — this is a self-contained package.

## How to consume from a Next.js app
```bash
npm install @moomle/upload-client
```
```env
NEXT_PUBLIC_UPLOAD_BASE_URL=https://api.example.com
NEXT_PUBLIC_UPLOAD_KEY=lm_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
```tsx
'use client';
import { createUploader } from '@moomle/upload-client';
const uploader = createUploader({
  baseUrl: process.env.NEXT_PUBLIC_UPLOAD_BASE_URL!,
  apiKey: process.env.NEXT_PUBLIC_UPLOAD_KEY!,
});
```
The client must run in a browser (uses `XMLHttpRequest`). In Next.js App Router, use it from a `'use client'` component or a hook — never from a Server Component.
