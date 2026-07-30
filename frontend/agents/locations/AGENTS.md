# Domain: locations

GPS coordinate storage. The backend exposes `GET /api/locations` and
`POST /api/locations/upload`. **No UI exists in this repo** for this domain.
The swagger spec notes that the create service constructs a Mongoose document
without calling `.save()`, so the upload endpoint is effectively a stub.

## Pages
- (none)

## Feature components
- (none)

## Hook
- (none)

## Types
- (none — would live in `src/types/api.ts` as `Location`, `LocationInput` if implemented)

## Endpoints used (see `src/lib/endpoints.ts`)
- `GET  /api/locations` — `ENDPOINTS.locations` (declared but unused)
- `POST /api/locations/upload` — not declared in `endpoints.ts` yet

## Shared dependencies
- (none)

## Rules
- Treat this domain as deferred until the backend's `createLocations` actually persists the document. Any frontend work here should start by reading `swagger.yaml` at the repo root to confirm the contract hasn't changed.
- If implementing, follow the standard chain documented in the root `AGENTS.md` Step 8: types → hook → component → page → nav update → this file.
