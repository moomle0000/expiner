# location

## Backend paths
- Interface: `src/interfaces/location.interface.ts` — `Location { latitude?, longitude?, accuracy? }`
- Model: `src/models/location.model.ts` — `LocationModel` (Mongoose, collection: `locations`, all fields optional strings)
- Service: `src/services/location.service.ts` — `LocationService` (typedi `@Service()`)
- Controller: `src/controllers/location.controller.ts` — `LocationController` (typedi DI)
- Route: `src/routes/location.route.ts` — `LocationRoute` (path `/`)

## Route map
```
GET  /api/locations         -> getLocations (all, sorted createdAt desc)
POST /api/locations/upload  -> uploadLocation (reads req.body directly, no multer file consumed)
```

## Domain-specific rules
- `createLocations` uses `new LocationModel(data)` + `.save()` is never called — the document is never persisted to MongoDB (missing `.save()` call)
- `createLocations` swallows all exceptions with empty `catch {}`
- Controller imports `MulterRequest` but never uses `req.file` — multer middleware is included in route but irrelevant
- No validation, no DTO, no error throwing — dead simple CRUD that currently cannot write to DB
