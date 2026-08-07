import mongoose, { Document, Schema } from 'mongoose';
import { Image } from '@interfaces/images.interface';

const imageSchema: Schema = new Schema(
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
    // classification
    category: {
      type: String,
      enum: ['image', 'document', 'video', 'audio', 'archive', 'executable', 'other'],
      default: 'image',
    },
    detectedMime: { type: String, required: false },
    detectedExt: { type: String, required: false },
  },
  {
    timestamps: true,
<<<<<<< HEAD
    toJSON: {
      transform(_doc, ret) {
        delete ret.path;
        delete ret.__v;
        return ret;
      },
    },
=======
>>>>>>> origin/main
  },
);

// filename unique per (createdBy, folder) — sparse so legacy rows without createdBy still fit
imageSchema.index(
  { createdBy: 1, folder: 1, filename: 1 },
  { unique: true, partialFilterExpression: { createdBy: { $exists: true } } },
);
// legacy rows (no createdBy) keep a global unique constraint on filename
imageSchema.index(
  { filename: 1 },
  { unique: true, partialFilterExpression: { createdBy: { $exists: false } } },
);

export const ImageModel = mongoose.model<Image & Document>('Image', imageSchema);
