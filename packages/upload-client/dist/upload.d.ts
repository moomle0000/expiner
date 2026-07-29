import type { UploadHandle, UploadOptions, UploaderConfig } from './types.js';
/**
 * Create an uploader bound to a specific server + credentials.
 *
 * ```ts
 * import { createUploader } from '@lmstream/upload-client';
 *
 * const upload = createUploader({
 *   baseUrl: 'https://api.example.com',
 *   apiKey: process.env.NEXT_PUBLIC_UPLOAD_KEY!,
 * });
 *
 * const file = await upload.upload(fileInput.files[0]!);
 * console.log(file.shortUrl);
 * ```
 */
export declare function createUploader(config: UploaderConfig): {
    /** The configured base URL. */
    baseUrl: string;
    /**
     * Upload a single file. Returns a `UploadHandle` whose `.promise`
     * resolves to the saved `UploadedFile`. Use `.cancel()` (or the
     * `signal` option) to abort an in-flight upload.
     */
    upload(file: Blob | File, options?: UploadOptions): UploadHandle;
    /**
     * Convenience: build the absolute public view URL for a previously
     * uploaded file's `shortUrl`. Equivalent to importing `buildPublicUrl`
     * directly, but pre-bound to this uploader's `baseUrl`.
     */
    publicUrl(shortUrl: string): string;
};
export type Uploader = ReturnType<typeof createUploader>;
//# sourceMappingURL=upload.d.ts.map