import mongoose, { Schema } from 'mongoose';
import { IFolder } from '@interfaces/folder.interface';

const folderSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// A folder name is unique per user — never shared across accounts.
folderSchema.index({ createdBy: 1, name: 1 }, { unique: true });

export const FolderModel = mongoose.model<IFolder>('Folder', folderSchema);