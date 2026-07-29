const CATEGORY_MAP: Record<string, 'image' | 'document' | 'video' | 'audio' | 'archive' | 'executable' | 'other'> = {
  // images
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  ico: 'image',
  tiff: 'image',
  tif: 'image',
  avif: 'image',
  heic: 'image',
  // video
  mp4: 'video',
  mov: 'video',
  webm: 'video',
  mkv: 'video',
  avi: 'video',
  flv: 'video',
  m4v: 'video',
  // audio
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  oga: 'audio',
  flac: 'audio',
  m4a: 'audio',
  aac: 'audio',
  opus: 'audio',
  // documents
  pdf: 'document',
  doc: 'document',
  docx: 'document',
  xls: 'document',
  xlsx: 'document',
  ppt: 'document',
  pptx: 'document',
  txt: 'document',
  rtf: 'document',
  md: 'document',
  csv: 'document',
  json: 'document',
  xml: 'document',
  // archives
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  bz2: 'archive',
  xz: 'archive',
  // executables / installers
  exe: 'executable',
  msi: 'executable',
  dmg: 'executable',
  pkg: 'executable',
  deb: 'executable',
  rpm: 'executable',
  apk: 'executable',
  app: 'executable',
};

export type FileCategory = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'executable' | 'other';

export const categorize = (extOrFilename: string | null | undefined): FileCategory => {
  if (!extOrFilename) return 'other';
  const lastDot = extOrFilename.lastIndexOf('.');
  const ext = lastDot >= 0 ? extOrFilename.slice(lastDot + 1).toLowerCase() : extOrFilename.toLowerCase();
  return CATEGORY_MAP[ext] ?? 'other';
};

export const categoryFromMime = (mime: string | null | undefined): FileCategory => {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'document';
  if (mime.startsWith('text/')) return 'document';
  if (mime.includes('officedocument') || mime.includes('spreadsheet') || mime.includes('presentation')) {
    return 'document';
  }
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('tar') || mime.includes('rar') || mime.includes('7z')) {
    return 'archive';
  }
  if (mime === 'application/octet-stream' || mime.includes('executable') || mime.includes('x-msdos')) {
    return 'executable';
  }
  return 'other';
};

const INLINE_SAFE_MIMES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'application/pdf',
]);

export const isInlineSafe = (mime: string | null | undefined): boolean => {
  if (!mime) return false;
  // SVG and HTML carry stored-XSS risk; never inline them
  if (mime === 'image/svg+xml' || mime === 'text/html' || mime === 'application/xhtml+xml') return false;
  return INLINE_SAFE_MIMES.has(mime);
};

// strip a caller-supplied sub-folder of anything that could be used for path traversal,
// collapse repeated separators, cap length. Empty string is allowed (means "no sub-folder").
export const sanitizeFolder = (input: string | null | undefined): string => {
  if (!input) return '';
  let s = input
    .replace(/\\/g, '/')
    .replace(/\.\.+/g, '')
    .replace(/^[\/\s]+|[\/\s]+$/g, '');
  s = s
    .split('/')
    .map(seg => seg.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/');
  if (s.length > 128) s = s.slice(0, 128);
  return s;
};
