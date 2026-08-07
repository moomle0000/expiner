import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}