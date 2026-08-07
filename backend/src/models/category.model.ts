import mongoose, { Schema } from 'mongoose';
import { ICategory } from '@interfaces/category.interface';

const categorySchema: Schema = new Schema(
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

// A category name is unique per user — never shared across accounts.
categorySchema.index({ createdBy: 1, name: 1 }, { unique: true });

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);