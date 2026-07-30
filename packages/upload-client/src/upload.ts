import type {
  UploadedFile,
  UploadHandle,
  UploadOptions,
  UploaderConfig,
} from './types.js';
import { UploadError } from './types.js';
import { buildPublicUrl } from './url.js';

/**
 * Create an uploader bound to a specific server + credentials.
 *
 * ```ts
 * import { createUploader } from '@moomle/upload-client';
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
export function createUploader(config: UploaderConfig) {
  const {
    baseUrl,
    apiKey,
    token,
    endpoint = '/api/files/upload',
    fetch: _fetchImpl,
  } = config;

  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error('createUploader: `baseUrl` is required');
  }

  const authHeader: Record<string, string> = {};
  // X-API-Key takes precedence — the server checks it first (see
  // `middlewares/apiKeyAuth.middleware.ts`).
  if (apiKey) {
    authHeader['X-API-Key'] = apiKey;
  } else if (token) {
    authHeader['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  return {
    /** The configured base URL. */
    baseUrl,

    /**
     * Upload a single file. Returns a `UploadHandle` whose `.promise`
     * resolves to the saved `UploadedFile`. Use `.cancel()` (or the
     * `signal` option) to abort an in-flight upload.
     */
    upload(file: Blob | File, options: UploadOptions = {}): UploadHandle {
      const {
        folder,
        onProgress,
        fieldName = 'file',
        signal: externalSignal,
        headers: extraHeaders,
      } = options;

      let aborted = false;
      let abortReason: string | undefined;
      const xhr = new XMLHttpRequest();
      const internalController = new AbortController();

      // Bridge the external AbortSignal (if any) to our XHR.
      const onExternalAbort = () => {
        aborted = true;
        abortReason = externalSignal?.reason;
        if (typeof abortReason !== 'string') abortReason = 'aborted';
        try {
          xhr.abort();
        } catch {
          /* XHR may already be settled */
        }
      };
      if (externalSignal) {
        if (externalSignal.aborted) {
          onExternalAbort();
        } else {
          externalSignal.addEventListener('abort', onExternalAbort, { once: true });
        }
      }

      const promise = new Promise<UploadedFile>((resolve, reject) => {
        if (aborted) {
          reject(new UploadError(abortReason ?? 'aborted', 0, null));
          return;
        }

        xhr.open('POST', url, true);

        // Auth headers.
        for (const [k, v] of Object.entries(authHeader)) {
          xhr.setRequestHeader(k, v);
        }
        // X-Folder sub-folder header (sanitized server-side).
        if (folder) xhr.setRequestHeader('X-Folder', folder);
        // Caller-supplied headers (last write wins on collisions with
        // managed headers — auth & X-Folder).
        if (extraHeaders) {
          for (const [k, v] of Object.entries(extraHeaders)) {
            xhr.setRequestHeader(k, v);
          }
        }

        if (onProgress) {
          xhr.upload.addEventListener('progress', (ev) => {
            if (!ev.lengthComputable) {
              onProgress({ loaded: ev.loaded, total: 0, percent: 0 });
              return;
            }
            const percent = ev.total > 0 ? Math.min(100, Math.round((ev.loaded / ev.total) * 100)) : 0;
            onProgress({ loaded: ev.loaded, total: ev.total, percent });
          });
        }

        xhr.addEventListener('load', () => {
          if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);

          const status = xhr.status;
          let body: unknown = null;
          const text = xhr.responseText;
          if (text) {
            try {
              body = JSON.parse(text);
            } catch {
              body = text;
            }
          }

          if (status >= 200 && status < 300) {
            const data = (body as { data?: UploadedFile } | null)?.data;
            if (!data) {
              reject(new UploadError('Server returned 2xx but no `data` field', status, body));
              return;
            }
            resolve(data);
          } else {
            const message =
              (body as { message?: string } | null)?.message || `Upload failed (${status})`;
            reject(new UploadError(message, status, body));
          }
        });

        xhr.addEventListener('error', () => {
          if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
          if (aborted) {
            reject(new UploadError(abortReason ?? 'aborted', 0, null));
          } else {
            reject(new UploadError('Network error', 0, null));
          }
        });

        xhr.addEventListener('abort', () => {
          if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
          reject(new UploadError(abortReason ?? 'aborted', 0, null));
        });

        // `timeout` is 0 by default which means "no timeout". Leave it.

        const form = new FormData();
        // Give the file a real name even if it's a bare Blob (e.g. from
        // a clipboard paste — `Blob` has no `.name`, `File` does).
        const fileName = (file as File).name ?? 'upload';
        form.append(fieldName, file, fileName);

        xhr.send(form);

        // Bridge internal controller too, in case someone calls .cancel().
        // (No-op if nobody's listening, but cheap.)
        void internalController;
      });

      return {
        promise,
        cancel(reason?: string) {
          if (aborted) return;
          aborted = true;
          abortReason = reason ?? 'cancelled';
          try {
            xhr.abort();
          } catch {
            /* already settled */
          }
        },
      };
    },

    /**
     * Convenience: build the absolute public view URL for a previously
     * uploaded file's `shortUrl`. Equivalent to importing `buildPublicUrl`
     * directly, but pre-bound to this uploader's `baseUrl`.
     */
    publicUrl(shortUrl: string): string {
      return buildPublicUrl(baseUrl, shortUrl);
    },
  };
}

export type Uploader = ReturnType<typeof createUploader>;
