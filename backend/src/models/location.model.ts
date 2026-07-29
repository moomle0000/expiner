import mongoose, { Document, Schema } from 'mongoose';
import { Location } from '@interfaces/location.interface';
// latitude: string;
//   longitude: string;
//   accuracy: string;
const locationSchema: Schema = new Schema(
  {
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    accuracy: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const LocationModel = mongoose.model<Location & Document>('Location', locationSchema);
