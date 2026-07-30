# @moomle/upload-client

Tiny browser/Node client for the `express-upload` file API. Uploads with progress + cancel. **Zero runtime dependencies.** TypeScript-first, ESM, works in Next.js App Router out of the box.

Targets the unified file endpoint: `POST /api/files/upload` (field name `file`).

## Install

```bash
npm install @moomle/upload-client
```

In a Next.js project, the recommended pattern is exposing the API key via `NEXT_PUBLIC_*`:

```env
NEXT_PUBLIC_UPLOAD_BASE_URL=https://api.example.com
NEXT_PUBLIC_UPLOAD_KEY=lm_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Quick start

```tsx
'use client';

import { useState } from 'react';
import { createUploader, UploadError } from '@moomle/upload-client';

const uploader = createUploader({
  baseUrl: process.env.NEXT_PUBLIC_UPLOAD_BASE_URL!,
  apiKey: process.env.NEXT_PUBLIC_UPLOAD_KEY!,
});

export function FileUploader() {
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPercent(0);
    try {
      const uploaded = await uploader.upload(file, {
        folder: 'avatars',
        onProgress: ({ percent }) => setPercent(percent),
      });
      setViewUrl(uploader.publicUrl(uploaded.shortUrl));
    } catch (err) {
      if (err instanceof UploadError) {
        setError(`${err.status ? `[${err.status}] ` : ''}${err.message}`);
      } else {
        setError('Upload failed');
      }
    }
  }

  return (
    <div>
      <input type="file" onChange={onChange} />
      {percent > 0 && percent < 100 && <progress value={percent} max={100} />}
      {viewUrl && <a href={viewUrl}>{viewUrl}</a>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## API

### `createUploader(config)`

Returns a bound uploader.

```ts
interface UploaderConfig {
  baseUrl: string;            // required, no trailing slash
  apiKey?: string;            // sent as `X-API-Key` (server-to-server)
  token?: string;             // sent as `Authorization: Bearer <jwt>` (browser session)
  endpoint?: string;          // default '/api/files/upload'
  fetch?: typeof fetch;       // optional, for testing
}
```

`apiKey` and `token` are mutually exclusive. If both are provided, `apiKey` wins — that's the order the server checks them in too.

### `uploader.upload(file, options)`

Uploads a single `File` (or `Blob`) and returns a `UploadHandle`:

```ts
interface UploadHandle {
  promise: Promise<UploadedFile>;
  cancel(reason?: string): void;
}
```

**Options:**

| Field | Type | Notes |
|---|---|---|
| `folder` | `string` | Logical sub-folder. Sanitized server-side (no `..`, no slashes). |
| `onProgress` | `({ loaded, total, percent }) => void` | Bytes + percent (0-100). `total` may be `0` if the server omits Content-Length. |
| `fieldName` | `string` | Defaults to `'file'`. |
| `signal` | `AbortSignal` | Alternative to `.cancel()`. |
| `headers` | `Record<string,string>` | Extra headers. Auth + `X-Folder` are managed by the client and override any values you set with the same name. |

**Resolved value:** the `data` field of the server's `{ data, message }` envelope — i.e. the `UploadedFile` record with `shortUrl`, `_id`, `fileType`, `size`, etc. **Not** the full envelope. Use `result.shortUrl` directly.

### `uploader.publicUrl(shortUrl)`

Builds the absolute public view URL for a previously uploaded file. Equivalent to:

```ts
import { buildPublicUrl } from '@moomle/upload-client';
buildPublicUrl(baseUrl, shortUrl); // => 'https://api.example.com/f/abc123.png'
```

The server exposes this as `GET /f/:shortUrl.:ext?` — Cloudinary-style, with `Content-Disposition: inline` when safe, `attachment` otherwise. SVG and HTML are never served inline.

### `UploadError`

Thrown on any non-2xx response or network failure:

```ts
class UploadError extends Error {
  status: number;   // HTTP status, or 0 for network/abort
  body: unknown;    // parsed response body or null
}
```

## Auth — what to send from the browser

You have three flows, all supported by this client:

1. **API key (server-to-server, recommended for Next.js):** create a key via `POST /api/auth/keys` on the server, expose it as `NEXT_PUBLIC_*`, pass it as `apiKey`. The server resolves it to a `User` and stores the file under that user's `folderSlug`.
2. **JWT (user session):** the user logs in via `POST /auth/login`, which returns the JWT in the response body (and optionally in the `Authorization` cookie). Two ways to forward it to the API:
   - let the browser send the cookie automatically (requires `credentials: 'include'` on `fetch` — but this client uses XHR, so the cookie is sent automatically for same-origin or when `Access-Control-Allow-Credentials: true` is set on the server, which express-upload already does).
   - pass the JWT explicitly as `token` and the client adds `Authorization: Bearer <jwt>`.
3. **Hybrid:** `apiKey` takes precedence over `token`.

## Cancellable uploads

```ts
const handle = uploader.upload(file, { onProgress: console.log });

// later…
handle.cancel('user navigated away');

try {
  await handle.promise; // throws UploadError('user navigated away', 0, null)
} catch (e) {
  /* expected */
}
```

Or use the `AbortController` shape:

```ts
const ac = new AbortController();
uploader.upload(file, { signal: ac.signal });
// later…
ac.abort('reason');
```

## License

ISC
