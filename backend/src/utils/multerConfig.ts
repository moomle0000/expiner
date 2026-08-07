import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { UPLOAD_ROOT } from '@config';
import { sanitizeFolder } from '@utils/fileCategory';
import { AuthRequest } from '@interfaces/AuthRequest';

const baseUploadDir = path.isAbsolute(UPLOAD_ROOT)
  ? UPLOAD_ROOT
  : path.join(process.cwd(), UPLOAD_ROOT);

const ensureDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(baseUploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const user = (req as AuthRequest).user;
    const folderSlug = user?.folderSlug || 'anonymous';

    // optional caller-supplied sub-folder via X-Folder header (sanitized, no traversal)
    const headerFolder = (req.header('X-Folder') || '').trim();
    const subFolder = sanitizeFolder(headerFolder);

    const userDir = path.join(baseUploadDir, folderSlug);
    const finalDir = subFolder ? path.join(userDir, subFolder) : userDir;
    ensureDir(finalDir);

    // store the resolved folder on req so the controller can persist it to the DB
    (req as AuthRequest & { _resolvedUploadDir?: string })._resolvedUploadDir = finalDir;

    cb(null, finalDir);
  },
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${unique}${extension}`);
  },
});

// accept all file types (no filter) — classification is done after upload via file-type sniff
const fileFilter = (_req: any, _file: multer.File, cb: multer.FileFilterCallback) => {
  cb(null, true);
};

export const upload = multer({ storage, fileFilter });
export const uploadMultiple = multer({ storage, fileFilter });

// --- Avatar (profile picture) upload ---
// Stored under <UPLOAD_ROOT>/avatars/ and served at /uploads/avatars/<file>
// via the `/uploads` static mount in app.ts. Indexed on the user record as
// `user.avatar = "/uploads/avatars/<file>"` (a URL path, not a filesystem path).
const AVATAR_DIR = path.join(baseUploadDir, 'avatars');
ensureDir(AVATAR_DIR);

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${extension}`);
  },
});

const ALLOWED_AVATAR_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const avatarFileFilter = (_req: any, file: multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_AVATAR_MIMES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  const err = new Error('Only JPG, PNG, GIF or WebP images are allowed') as any;
  err.status = 400;
  cb(err);
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
