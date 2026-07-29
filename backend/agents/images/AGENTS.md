# images

**Status: domain deprecated.** The dedicated `/api/images` route was removed; image uploads are now served exclusively by the **`files`** domain (`/api/files/...`). The `ImageRoute` was a redundant mirror of `FileRoute` and has been deleted. Upload images via `POST /api/files/upload` with field name `file`; the `FileService` will classify them as `fileType: 'image'` automatically.

The legacy `Image` model, `ImageService`, and `ImageController` still exist in `src/models/image.model.ts`, `src/services/image.service.ts`, and `src/controllers/image.controller.ts` (used by the backfill script `src/scripts/backfill-legacy.ts` to assign legacy rows to the `legacy` user). They are no longer wired into any route.

## Backend paths
- Interface: `src/interfaces/images.interface.ts` — `Image { _id, filename, originalName, path, size, mimetype, shortUrl, downloads, views, createdAt, createdBy?, folder?, category?, detectedMime?, detectedExt? }`
- DTO: `src/dtos/images.dto.ts` — `CreateImageDto` (class-validator; not bound by validation middleware)
- Model: `src/models/image.model.ts` — `ImageModel` (collection `images`, `shortUrl` unique; `createdBy` + `folder` + `filename` compound-unique for new rows; legacy rows without `createdBy` keep a global filename-unique partial index)
- Service: `src/services/image.service.ts` — `ImageService` (typedi `@Service()`) — **not wired into any route; used only by `scripts/backfill-legacy.ts`**
- Controller: `src/controllers/image.controller.ts` — `ImageController` (typedi DI) — **not wired into any route**

## Route map
**No image-specific routes are registered.** All image upload/serve flows now live under the `files` domain. See `agents/files/AGENTS.md` for the active route map.

The static HTML pages previously served from `image.route.ts` (`/auth`, `/admin`, `/dashboard`) are now served by `express.static('../public')` registered in `src/app.ts`.

## Domain-specific rules
- **Use the files domain for new work.** Any feature previously targeting `/api/images/...` should be rebuilt against `/api/files/...` (the `fileType: 'image'` enum value distinguishes images from other uploads).
- **The legacy `Image` collection** is read-only from the app's perspective. New uploads do not write to it. The backfill script at `src/scripts/backfill-legacy.ts` is the only active consumer of `ImageModel`.

## Shared / reused pieces this domain depends on
- `@models/image.model` — `ImageModel` (used only by backfill script)
- `src/scripts/backfill-legacy.ts` — assigns every pre-existing `Image` row to a `legacy` user
