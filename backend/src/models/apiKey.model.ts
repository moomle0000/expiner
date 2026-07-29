import mongoose, { Schema, Types } from 'mongoose';
import { IApiKey } from '@interfaces/apiKey.interface';

const apiKeySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const ApiKeyModel = mongoose.model<IApiKey>('ApiKey', apiKeySchema);

export type ApiKeyObjectId = Types.ObjectId;
