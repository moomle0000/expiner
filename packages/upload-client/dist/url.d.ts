/**
 * Build the absolute public view URL for an uploaded file.
 *
 * The server exposes a Cloudinary-style public endpoint at
 *   GET /f/:shortUrl.:ext?
 * which serves the file with `Content-Disposition: inline` (when safe)
 * or `attachment`. This helper resolves a short URL like `abc123.png`
 * to `https://your-host/f/abc123.png`.
 *
 * The server response only stores the relative `shortUrl` (just the
 * slug, no path) so the client is responsible for prefixing the host.
 */
export declare function buildPublicUrl(baseUrl: string, shortUrl: string): string;
//# sourceMappingURL=url.d.ts.map