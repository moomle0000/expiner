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
export function buildPublicUrl(baseUrl, shortUrl) {
    if (!shortUrl) {
        throw new Error('buildPublicUrl: shortUrl is empty');
    }
    const cleanBase = baseUrl.replace(/\/+$/, '');
    // The server stores shortUrl as just the slug, e.g. "abc123.png". We just
    // join. If the slug is somehow already a full URL, return as-is.
    if (/^https?:\/\//i.test(shortUrl)) {
        return shortUrl;
    }
    return `${cleanBase}/f/${shortUrl}`;
}
//# sourceMappingURL=url.js.map