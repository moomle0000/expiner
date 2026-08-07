/**
 * Public types for the upload client.
 *
 * These mirror the shape of the server response from
 * `POST /api/files/upload` and the `FileModel` schema in
<<<<<<< HEAD
 * `expiner/src/models/files.model.ts`.
=======
 * `express-upload/src/models/files.model.ts`.
>>>>>>> origin/main
 *
 * Only the fields the client cares about are typed — the server may return
 * more (e.g. `detectedMime`, `detectedExt`, `category`) and they will still
 * be present on the returned object at runtime.
 */

export type FileType =
  | 'image'
  | 'document'
  | 'video'
  | 'audio'
  | 'archive'
  | 'executable'
  | 'other';

export interface UploadedFile {
  _id: string;
  filename: string;
  originalName: string;
<<<<<<< HEAD
  /**
   * Server filesystem path. NOT returned by the server anymore — it is
   * stripped from serialized responses for security. Typed as optional so
   * consumers know it may be absent.
   */
  path?: string;
=======
  path: string;
>>>>>>> origin/main
  size: number;
  mimetype: string;
  shortUrl: string;
  downloads: number;
  views: number;
  fileType: FileType;
  extension: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  folder?: string;
  detectedMime?: string;
  detectedExt?: string;
<<<<<<< HEAD
  /** User-assigned free-text label, set at upload time. */
  category?: string;
=======
>>>>>>> origin/main

  // Allow extra fields the server may add in the future.
  [key: string]: unknown;
}

export interface UploadResponse {
  data: UploadedFile;
  message: string;
}

export interface UploadOptions {
  /**
   * Optional logical sub-folder on the server. Sanitized by the server
   * (`sanitizeFolder` in `utils/fileCategory.ts`) — must not contain `..`,
   * `/`, `\\`, or anything outside `[A-Za-z0-9._-]`.
   */
  folder?: string;

  /**
<<<<<<< HEAD
   * Optional free-text category label. Sent as a multipart form field
   * named `category` (the server stores it alongside the file and lets
   * callers filter by it later). Trimmed/dropped if it ends up empty.
   */
  category?: string;

  /**
=======
>>>>>>> origin/main
   * Progress callback. `loaded` and `total` are in bytes. `total` may be
   * `0` if the server did not send a Content-Length header.
   */
  onProgress?: (event: { loaded: number; total: number; percent: number }) => void;

  /**
   * Custom field name. Defaults to `'file'` (matches the server's
   * `upload.single('file')`). Most users will not need to change this.
   */
  fieldName?: string;

  /**
   * AbortSignal for cancellation. Alternative to the `cancel()` method on
   * the returned handle. Either one is enough.
   */
  signal?: AbortSignal;

  /**
   * Extra headers to send with the request. Useful for things like
   * `X-Request-Id`. The auth header (`X-API-Key` or `Authorization`) and
   * `X-Folder` are managed by this client and will overwrite any values
   * passed here with the same name.
   */
  headers?: Record<string, string>;
}

export interface UploaderConfig {
<<<<<<< HEAD
  /** Base URL of the expiner server, no trailing slash. */
=======
  /** Base URL of the express-upload server, no trailing slash. */
>>>>>>> origin/main
  baseUrl: string;

  /**
   * API key. If provided, sent as `X-API-Key` header (server-to-server).
   * Mutually exclusive with `token` — if both are provided, `apiKey` wins.
   */
  apiKey?: string;

  /**
   * JWT for browser session auth. Sent as `Authorization: Bearer <token>`.
   * Only needed if you're NOT using the httpOnly cookie flow.
   */
  token?: string;

  /**
   * Override the upload endpoint path. Defaults to `/api/files/upload`.
   * Field name defaults to `'file'`.
   */
  endpoint?: string;

  /**
   * Optional fetch implementation. Defaults to the global `fetch` (Node 18+,
   * Next.js, modern browsers). Exposed mainly for testing.
   */
  fetch?: typeof fetch;
}

export interface UploadHandle {
  /** The in-flight or settled upload. */
  promise: Promise<UploadedFile>;

  /** Cancel the upload. No-op if already settled. */
  cancel: (reason?: string) => void;
}

export class UploadError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'UploadError';
    this.status = status;
    this.body = body;
  }
}
