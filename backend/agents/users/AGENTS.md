# users

## Backend paths
- Interface: `src/interfaces/users.interface.ts` — `User { email, password?, username?, name?, role, status?, active?, createdby?, avatar?, folderSlug?, lastLogin? }`
- Auth interface: `src/interfaces/auth.interface.ts` — `DataStoredInToken { id }`, `TokenData { token, expiresIn }`, `RequestWithUser extends Request { user: User }`
- Request helper: `src/interfaces/AuthRequest.ts` — `AuthRequest extends Request { user?: User }`
- Model: `src/models/users.model.ts` — `UserModel` (collection `users`, `email` unique, `folderSlug` unique+sparse, `role: 'admin'|'user'`)
- Service: `src/services/users.service.ts` — `UserService` (legacy; findAllUser, findUserById, createUser, updateUser, deleteUser, adminResetPassword, ensureUser for bootstrap seeding)
- Service: `src/services/auth.service.ts` — `AuthService` (legacy; signup, login with bcrypt + jwt, verify, logout, adminResetPassword)
- Controller: `src/controllers/users.controller.ts` — `UserController`
- Controller: `src/controllers/auth.controller.ts` — `AuthController` (signup, login, verify, logout, adminResetPassword)
- Controller: `src/controllers/userSelf.controller.ts` — `UserSelfController` (self `me` / `updateMe` / `changeMyPassword` / `uploadAvatar`; uses bcrypt 10 rounds; strips `password`, `passwordHash`, `__v` in `sanitize()`)
- Route: `src/routes/users.route.ts` — `UserRoute` (path `/users`)
- Route: `src/routes/auth.route.ts` — `AuthRoute` (path `/auth`)
- Route: `src/routes/userSelf.route.ts` — `UserSelfRoute` (path `/`, mounted from `src/server.ts`; provides `/api/auth/me`, `/api/auth/me/password`, and `/api/auth/me/avatar` — avatar route runs `authMiddleware` before `uploadAvatar.single('avatar')`)
- Middleware: `src/middlewares/auth.middleware.ts` — `authMiddleware` (Bearer JWT), `requireAdmin`, `requireSelfOrAdmin`
- Global error handler: `src/middlewares/error.middleware.ts` — logs `error` level for 5xx, `warn` level for 4xx (so user-input failures like `Invalid credentials` don't show up as server errors)
- Helper: `src/utils/Authorization.ts` — extract Bearer token from a `Cookie` header
- Bootstrap seed: `src/utils/seedBootstrap.ts` — `seedBootstrapUsers()` called from `src/server.ts` after the App constructor; reads `BOOTSTRAP_ADMIN_*` / `BOOTSTRAP_USER_*` from `@config` and idempotently creates the users via `UserService.ensureUser`

## Route map
```
POST /auth/signup            -> signUp        (public)
POST /auth/login             -> logIn         (public; sets Authorization cookie + returns token)
GET  /auth/verify            -> verify        (Bearer or cookie)
GET  /auth/profile           -> verify        (alias)
POST /auth/logout            -> logOut        (clears cookie)
POST /auth/admin/reset-password -> adminResetPassword

GET    /users                -> getUsers      (own list, gated by AuthMiddleware)
GET    /users/admin          -> getUsersAdmin (admin: list by role)
GET    /users/:id            -> getUserById
POST   /users                -> createUser    (admin)
PUT    /users/:id            -> updateUser
PATCH  /users/:id            -> updateUser
DELETE /users/:id            -> deleteUser

GET   /api/auth/me            -> me          (self, Bearer JWT — current user safe view)
PATCH /api/auth/me            -> updateMe    (self, Bearer JWT — name and/or email; email uniqueness checked; also `{ avatar: null }` to clear the profile picture)
POST  /api/auth/me/password   -> changeMyPassword (self, Bearer JWT — bcrypt compare current + hash new, min 8 chars)
POST  /api/auth/me/avatar     -> uploadAvatar (self, Bearer JWT — multipart field `avatar`, JPG/PNG/GIF/WebP ≤5MB; stores under `<UPLOAD_ROOT>/avatars/` served at `/uploads/avatars/<file>`, sets `user.avatar`, deletes the previous file)
```

## Domain-specific rules
- JWT secret: `SECRET_KEY` from `@config` (re-used as `JWT_SECRET`).
- `auth.service.ts` login: payload is `{ id: user._id }` only (no role/email/folder in the token).
- `auth.middleware.ts` (the JWT one): verifies token, fetches the full `User` from DB, attaches to `req.user`. If user is `status: false` or `active: false`, returns 403.
- `passwordHash` field exists in the model but is mapped from `password` in service code (overwrite pattern). The model has `password: { required: true, default: 'defaultpassword' }` — this is a pre-existing default that should be replaced via a migration.
- `folderSlug` is auto-generated on first save (`user-<shortid>`); the auth.service.ts does not set it on signup. **Backfill existing users** with the `backfill-legacy.ts` script or a one-liner: `UserModel.updateMany({ folderSlug: { $exists: false } }, ...)`.
- `requireSelfOrAdmin` is a typed alias of the user's existing `AuthMiddleware` import in `users.route.ts` (re-exported as a named import) — see the re-export in that file.
- Two parallel User domains exist: the user's `users.service.ts` / `auth.service.ts` and the apikey-keyed JWT/role middleware in `auth.middleware.ts`. The middleware is what the rest of the app uses; the legacy services handle /auth/* and /users/* endpoints.
- `users.interface.ts` and `users.model.ts` have `createdby: ref 'Tenant'` — pre-existing field, not used by the upload pipeline.
- **Bootstrap seeding:** `seedBootstrapUsers()` runs once at startup. Set `BOOTSTRAP_ADMIN_EMAIL`+`BOOTSTRAP_ADMIN_PASSWORD` (and optionally `BOOTSTRAP_ADMIN_NAME`) to seed a role=`admin` user, and `BOOTSTRAP_USER_EMAIL`+`BOOTSTRAP_USER_PASSWORD` for a role=`user`. If the email already exists the user is left untouched (idempotent). Leave a pair empty to skip. Logged via winston as `🌱 Seeded bootstrap ...` or `🌱 Bootstrap ... already exists`. Wired into `docker-compose.no-mongo.yml` and `docker-compose.mongo.yml` (set the values in the root `.env`).
