import mongoose, { Document, Schema } from 'mongoose';
import { File } from '@interfaces/files.interface';

const fileSchema: Schema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['image', 'document', 'video', 'audio', 'archive', 'executable', 'other'],
    },
    extension: {
      type: String,
      required: true,
    },
    // ownership
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    folder: {
      type: String,
      required: false,
      default: null,
    },
    // classification (filled by file-type sniffer; overrides mimetype/extension when present)
    detectedMime: { type: String, required: false },
    detectedExt: { type: String, required: false },
<<<<<<< HEAD
    // user-assigned free-text label (set on upload, used for filtering)
    category: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.path;
        delete ret.__v;
        return ret;
      },
    },
=======
  },
  {
    timestamps: true,
>>>>>>> origin/main
  },
);

fileSchema.index(
  { createdBy: 1, folder: 1, filename: 1 },
  { unique: true, partialFilterExpression: { createdBy: { $exists: true } } },
);
fileSchema.index(
  { filename: 1 },
  { unique: true, partialFilterExpression: { createdBy: { $exists: false } } },
);

export const FileModel = mongoose.model<File & Document>('File', fileSchema);
