import { model, Schema, Document, Types, ObjectId } from 'mongoose';
import { User } from '@interfaces/users.interface';

const UserSchema: Schema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: 'defaultpassword' },
    username: String,
    name: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    status: { type: Boolean, default: true },
    createdby: { type: Schema.Types.ObjectId, ref: 'Tenant', required: false },

    // added for api-key/per-user storage namespace
    folderSlug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      sparse: true,
      default: function (this: any) {
        return 'user-' + new Types.ObjectId().toString().slice(-8);
      },
    },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// Performance indexes for user queries
UserSchema.index({ createdby: 1 });
UserSchema.index({ role: 1 });

export const UserModel = model<User>('User', UserSchema);
