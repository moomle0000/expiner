// Shared API types matching swagger.yaml

export type UserRole = "admin" | "user" | "landlord";

export type FileCategory =
  | "image"
  | "document"
  | "video"
  | "audio"
  | "archive"
  | "executable"
  | "other";

export interface User {
  _id: string;
  email: string;
  username?: string;
  name?: string;
  role: UserRole;
  status?: boolean;
  active?: boolean;
  folderSlug?: string;
  lastLogin?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthFile {
  _id: string;
  filename: string;
  originalName: string;
  path?: string;
  size: number;
  mimetype: string;
  shortUrl: string;
  downloads: number;
  views: number;
  fileType?: FileCategory;
  extension?: string;
  /** User-assigned free-text label (set on upload, used for filtering). */
  category?: string;
  detectedMime?: string;
  detectedExt?: string;
  createdBy?: string;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyOwnerRef {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  role?: UserRole;
}

export interface ApiKeyPublic {
  id: string;
  name: string;
  /** Raw owner id, kept even if the user is later deleted. */
  createdBy: string;
  /** Populated owner. `null` when the owner has been deleted. */
  user: ApiKeyOwnerRef | null;
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKeyPublic {
  key: string;
}

export interface Envelope<T> {
  data: T;
  message?: string;
}

export interface LoginResponse {
  data: User;
  message?: string;
  token: string;
}

/** A user's own upload folder (stored as the `folder` name on AuthFile). */
export interface WorkspaceFolder {
  _id: string;
  name: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A user's own free-text category label. */
export interface WorkspaceCategory {
  _id: string;
  name: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
