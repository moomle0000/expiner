// src/config/index.ts
import path from 'path';

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 5601;
export const LOG_FORMAT = 'dev';
export const ORIGIN = '*';
export const CREDENTIALS = false;
export const DB_URL = 'mongodb://192.168.100.112:27017/image-share';
export const IMAGE_MAX_SIZE = 80 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
// Resolve against the project root (process.cwd()), not __dirname —
// `__dirname` changes between src/ (ts-node) and dist/ (compiled), and
// relatives like '../logs' get resolved to different absolute paths.
// This way the same default works in dev, prod, Docker, and Jest.
const DEFAULT_LOG_DIR = path.resolve(process.cwd(), 'logs');
export const LOG_DIR: string = process.env.LOG_DIR
  ? path.resolve(process.env.LOG_DIR)
  : DEFAULT_LOG_DIR;

// auth
export const SECRET_KEY = process.env.SECRET_KEY || 'change-me-in-production';
export const JWT_SECRET = process.env.JWT_SECRET || SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const BOOTSTRAP_ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL || 'moomle@gmail.com';
export const BOOTSTRAP_ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'admin123';
export const BOOTSTRAP_ADMIN_NAME = process.env.BOOTSTRAP_ADMIN_NAME || 'Admin';

export const BOOTSTRAP_USER_EMAIL = process.env.BOOTSTRAP_USER_EMAIL || 'user@gmail.com';
export const BOOTSTRAP_USER_PASSWORD = process.env.BOOTSTRAP_USER_PASSWORD || 'user123';
export const BOOTSTRAP_USER_NAME = process.env.BOOTSTRAP_USER_NAME || 'User';

// uploads
// ---------------------------------------------------------------------------
// UPLOAD_ROOT can be:
//   1. an absolute path  (e.g. /var/data/expiner/uploads)
//   2. a relative path   (resolved against the project root, NOT the cwd)
// Defaults to `<project-root>/uploads` so it works on Windows, Linux and macOS
// without any extra config.
const DEFAULT_UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
export const UPLOAD_ROOT: string = process.env.UPLOAD_ROOT
  ? path.resolve(process.env.UPLOAD_ROOT)
  : DEFAULT_UPLOAD_ROOT;

export const IMAGE_STORAGE_PATH = path.join(UPLOAD_ROOT, 'images');
export const FILE_CATEGORY_MAX_SIZE = parseInt(process.env.FILE_CATEGORY_MAX_SIZE || '524288000', 10); // 500MB default

