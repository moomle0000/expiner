# workspace

Owner-scoped **folders** and **categories** for a single account. These back the
frontend "Workspace" page and drive where uploads land (folder) and how they are
tagged (category). Every row is scoped to `createdBy` — no cross-user mixing.

## Backend paths
- Folder interface: `src/interfaces/folder.interface.ts` — `IFolder { _id, name, createdBy, createdAt?, updatedAt? }`
- Folder model: `src/models/folder.model.ts` — `FolderModel`; unique `{ createdBy, name }`; `name` trimmed
- Folder service: `src/services/folder.service.ts` — `FolderService` (`listFolders`, `createFolder`, `deleteFolder`; owner-scoped)
- Folder controller: `src/controllers/folder.controller.ts` — `FolderController` (typedi DI)
- Folder route: `src/routes/folder.route.ts` — `FolderRoute` (path `/`)
- Category interface: `src/interfaces/category.interface.ts` — `ICategory { _id, name, createdBy, createdAt?, updatedAt? }`
- Category model: `src/models/category.model.ts` — `CategoryModel`; unique `{ createdBy, name }`.
- Category service: `src/services/category.service.ts` — `CategoryService` (`listCategories`, `createCategory`, `deleteCategory`; owner-scoped)
- Category controller: `src/controllers/category.controller.ts` — `CategoryController`
- Category route: `src/routes/category.route.ts` — `CategoryRoute` (path `/`)
- Registered in `src/server.ts` (`FolderRoute`, `CategoryRoute`).

## Route map
```
GET    /api/folders        -> listFolders    (apiKeyAuth, owner-scoped, sorted by name)
POST   /api/folders        -> createFolder   (apiKeyAuth, body { name })
DELETE /api/folders/:id    -> deleteFolder   (apiKeyAuth, owner-scoped)

GET    /api/categories     -> listCategories (apiKeyAuth, owner-scoped, sorted by name)
POST   /api/categories     -> createCategory (apiKeyAuth, body { name })
DELETE /api/categories/:id -> deleteCategory (apiKeyAuth, owner-scoped)
```

## Domain-specific rules
- **Auth:** `apiKeyAuth` (accepts `X-API-Key` or `Authorization: Bearer <jwt>`), matching the files routes. Just like files, the user is resolved server-side and all queries filter `createdBy = req.user`.
- **Isolation:** folder and category names are unique per `createdBy` (compound unique index). A user can never see or delete another user's folders/categories — `findOneAndDelete({ _id, createdBy })` and `find({ createdBy })` are the only access paths.
- **Upload folder ownership:** `FileService.createFileFromUpload` now validates that a non-`anonymous` `X-Folder` name belongs to this user's `FolderModel`; otherwise it throws `400` ("create it in Workspace first"). This keeps storage namespaces from ever crossing users.
- **Categories stay free-text on upload:** unlike folders, an upload's `category` is not validated against `Category` — the UI offers existing categories but also lets the user type a new one (matching the "select or type" requirement).
- **Create/delete errors:** duplicate `(createdBy, name)` → `409`; missing resource / wrong owner → `404`.

## Shared / reused pieces this domain depends on
- `@middlewares/apiKeyAuth.middleware.ts` — `apiKeyAuth`
- `@exceptions/httpException` — `HttpException`
- `@interfaces/AuthRequest` — `AuthRequest`
- `src/server.ts` — route registration
- `agents/files/AGENTS.md` — the folder-ownership check lives in `file.service.ts`