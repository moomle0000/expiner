/**
 * @lmstream/upload-client
 *
 * Tiny browser/Node client for the express-upload file API.
 * Uploads with progress + cancel. Zero runtime dependencies.
 *
 * ```ts
 * import { createUploader } from '@lmstream/upload-client';
 *
 * const uploader = createUploader({
 *   baseUrl: 'https://api.example.com',
 *   apiKey: process.env.NEXT_PUBLIC_UPLOAD_KEY!,
 * });
 *
 * const file = await uploader.upload(fileInput.files[0]!, {
 *   folder: 'avatars',
 *   onProgress: ({ percent }) => setProgress(percent),
 * });
 *
 * // Server returns: { data: { _id, shortUrl, ... }, message: 'uploaded' }
 * // `file` is the inner `data` object.
 * const viewUrl = uploader.publicUrl(file.shortUrl);
 * // => 'https://api.example.com/f/abc123.png'
 * ```
 */
export { createUploader } from './upload.js';
export { buildPublicUrl } from './url.js';
export { UploadError } from './types.js';
export type { UploadedFile, UploadResponse, UploadOptions, UploadHandle, UploaderConfig, FileType, } from './types.js';
export type { Uploader } from './upload.js';
//# sourceMappingURL=index.d.ts.map