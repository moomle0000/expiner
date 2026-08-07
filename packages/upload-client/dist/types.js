/**
 * Public types for the upload client.
 *
 * These mirror the shape of the server response from
 * `POST /api/files/upload` and the `FileModel` schema in
 * `expiner/src/models/files.model.ts`.
 *
 * Only the fields the client cares about are typed — the server may return
 * more (e.g. `detectedMime`, `detectedExt`, `category`) and they will still
 * be present on the returned object at runtime.
 */
export class UploadError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = 'UploadError';
        this.status = status;
        this.body = body;
    }
}
//# sourceMappingURL=types.js.map