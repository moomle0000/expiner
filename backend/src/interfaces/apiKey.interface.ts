import { Document, Types } from 'mongoose';

export interface IApiKey extends Document {
  _id: Types.ObjectId;
  name: string;
  keyHash: string;
  createdBy: Types.ObjectId;
  active: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Public, denormalised view of an API key. `createdBy` is flattened into
// a small `user` object so the admin list endpoint can render a row without
// making N follow-up lookups. `createdById` is also kept so the dashboard
// can still use the raw id for actions (revoke, etc.).
export type ApiKeyPublic = {
  id: string;
  name: string;
  createdById: string;
  user: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
    role?: 'admin' | 'user' | 'landlord';
  } | null;
  active: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
};

