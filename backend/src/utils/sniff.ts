// file-type is an ESM-only module from v17+; this CommonJS project pins to v16 or
// uses a dynamic import. If the package isn't installed, we return null and the
// upload service falls back to the client-declared mimetype.

export type SniffResult = {
  ext: string;
  mime: string;
};

let cached: ((path: string) => Promise<SniffResult | null>) | null = null;
let attempted = false;

const loadSniffer = async (): Promise<((path: string) => Promise<SniffResult | null>) | null> => {
  if (cached) return cached;
  if (attempted) return null;
  attempted = true;
  try {
    // require() works for v16 (CJS); for v17+ swap to dynamic import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('file-type');
    const ft = (mod && (mod.fileTypeFromFile || mod.default?.fileTypeFromFile)) as
      | ((path: string) => Promise<SniffResult | null>)
      | undefined;
    if (typeof ft === 'function') {
      cached = ft;
      return ft;
    }
  } catch {
    // not installed — fall back to client-provided mimetype
  }
  return null;
};

export const sniffFile = async (filePath: string): Promise<SniffResult | null> => {
  const fn = await loadSniffer();
  if (!fn) return null;
  try {
    return await fn(filePath);
  } catch {
    return null;
  }
};
