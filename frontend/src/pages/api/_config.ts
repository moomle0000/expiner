import type { NextApiRequest, NextApiResponse } from "next";

type RuntimeConfig = {
  apiBaseUrl: string;
};

// Tiny public endpoint that re-reads the runtime env every call. Used by
// `_app.tsx` on mount to set `window.__API_BASE_URL__` so the axios
// instance picks up the URL the *container* is running with — not just
// the value baked at build time. Re-evaluated per request so an env-var
// change at container start (or a future read-from-disk mechanism)
// takes effect on the next page load without a rebuild.
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<RuntimeConfig>,
) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL.length > 0
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : "http://localhost:5601";

  // Short cache so a hot-reload in dev still gets a fresh value, but a
  // burst of mount calls doesn't slam the env.
  res.setHeader("Cache-Control", "no-cache, max-age=0");
  res.status(200).json({ apiBaseUrl });
}
