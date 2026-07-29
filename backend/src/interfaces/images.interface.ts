import { Schema, Types } from 'mongoose';

export interface Image {
  _id: string | Types.ObjectId;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  shortUrl: string;
  createdAt: Date;
  downloads: number;
  views: number;
  // ownership
  createdBy?: Schema.Types.ObjectId | string;
  folder?: string;
  // classification (filled by file-type sniffer)
  category?: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'executable' | 'other';
  detectedMime?: string;
  detectedExt?: string;
}
