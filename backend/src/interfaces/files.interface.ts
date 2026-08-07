import { Schema, Types } from 'mongoose';

export interface File {
  _id?: string | Types.ObjectId;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  shortUrl: string;
  downloads: number;
  views: number;
  fileType: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'executable' | 'other';
  extension: string;
  createdAt?: Date;
  updatedAt?: Date;
  // ownership
  createdBy?: Schema.Types.ObjectId | string;
  folder?: string;
  // classification (filled by file-type sniffer)
  detectedMime?: string;
  detectedExt?: string;
<<<<<<< HEAD
  // user-assigned free-text label (set on upload, used for filtering)
  category?: string;
=======
>>>>>>> origin/main
}
