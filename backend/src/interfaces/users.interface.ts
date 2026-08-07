import { Schema, Types } from "mongoose";

export type UserRole = 'admin' | 'user';

export interface User {
  _id?: string | Types.ObjectId;
  email: string;
  password?: string;
  username?: string;
  name?: string;
  role?: UserRole;
  status?: boolean;
  active?: boolean;
  createdby?: string | Schema.Types.ObjectId;
  folderSlug?: string;
  lastLogin?: Date;
  lastLoginAt?: Date;
  /** URL path of the uploaded profile picture (e.g. `/uploads/avatars/<file>`). */
  avatar?: string;
}
