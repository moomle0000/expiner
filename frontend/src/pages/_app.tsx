import { useEffect } from "react";
import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import Head from "next/head";
import theme from "@/lib/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ENDPOINTS } from "@/lib/endpoints";

export default function App({ Component, pageProps }: AppProps) {
  // Resolve the API base URL at runtime, every page load.
  //
  // Priority (highest first):
  //   1. window.__API_BASE_URL__  set by the effect below from
  //                                GET /api/_config — this is the URL
  //                                the *container* is running with, so
  //                                a docker-compose env-var change
  //                                takes effect on the next reload
  //                                without rebuilding the image.
  //   2. process.env.NEXT_PUBLIC_API_BASE_URL  baked at build time
  //                                (NEXT_PUBLIC_* is inlined by Next.js).
  //   3. http://localhost:5601    final fallback in `endpoints.ts`.
  //
  // The effect fires once per app load. While it's in flight, callers
  // fall back to the build-time value. Once it resolves, every axios
  // request from then on uses the runtime value (the request
  // interceptor re-evaluates `getApiBaseUrl()` per call).
  useEffect(() => {
    let cancelled = false;
    // Use the raw `fetch` API (not `api`) because the axios request
    // interceptor would set baseURL to the build-time backend URL —
    // pointing this same-origin call at the wrong host. Same-origin
    // fetch always hits the Next.js server.
    fetch(ENDPOINTS.runtimeConfig)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { apiBaseUrl?: string } | null) => {
        if (cancelled || !data) return;
        const url = data.apiBaseUrl;
        if (url && typeof url === "string" && url.length > 0) {
          window.__API_BASE_URL__ = url;
        }
      })
      .catch(() => {
        // Silent: the build-time / fallback value is good enough for
        // a local dev environment that doesn't define the env var.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // For the first client paint, before the effect above resolves,
  // callers see the build-time / fallback value. After it resolves,
  // `getApiBaseUrl()` (in `endpoints.ts`) returns the runtime value.

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </Head>

      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}
