import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { File } from '@interfaces/files.interface';
import { FileModel } from '@models/files.model';
import { FileService } from '@services/file.service';
import { AuthRequest as AuthenticatedRequest } from '@interfaces/AuthRequest';
import { MulterRequest } from '@/interfaces/Multer';
import { isInlineSafe, categoryFromMime } from '@utils/fileCategory';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { HttpException } from '@exceptions/httpException';

const sendStoredFile = (res: Response, filePath: string, originalName: string, mimeType: string) => {
  const resolvedMime = mime.lookup(filePath) || mimeType || 'application/octet-stream';
  const headers: Record<string, string> = {
    'Content-Type': resolvedMime,
    'Cache-Control': 'public, max-age=86400',
  };
  if (isInlineSafe(resolvedMime)) {
    headers['Content-Disposition'] = `inline; filename="${originalName}"`;
  } else {
    headers['Content-Disposition'] = `attachment; filename="${originalName}"`;
  }
  res.sendFile(path.resolve(filePath), { headers }, (err) => {
    if (err) {
      if (err && (err as any).code === 'ENOENT') {
        res.status(404).send('File not found');
      } else {
        res.status(500).end();
      }
    }
  });
};

const tryUnlink = (filePath: string): void => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // best-effort cleanup
  }
};

const userIdOf = (req: AuthenticatedRequest): string => {
  if (!req.user) throw new HttpException(401, 'Authentication required');
  return req.user._id?.toString() || (req.user as any).id;
};

@Service()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  public getFiles = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const data: File[] = await this.fileService.findAllFiles(userId);
      res.status(200).json({ data, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getFilesByType = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const fileType: string = req.params.type;
      const data: File[] = await this.fileService.findFilesByType(fileType, userId);
      res.status(200).json({ data, message: 'findByType' });
    } catch (error) {
      next(error);
    }
  };

  // /api/files/:id.:ext? — owner-scoped
  public getFileById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const fileId: string = req.params.id;
      const file = await this.fileService.findFileById(fileId, userId);
      sendStoredFile(res, file.path, file.originalName, file.mimetype);
    } catch (error) {
      next(error);
    }
  };

  public getFileByShortUrl = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const shortUrl: string = req.params.shortUrl;
      const file = await this.fileService.findFileByShortUrl(shortUrl, userId);
      res.status(200).json({ data: file, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  // public — anyone with the short URL can view (Cloudinary default)
  public viewFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shortUrl: string = req.params.shortUrl;
      const file = await this.fileService.findByShortUrlPublic(shortUrl);
      if (!file) {
        res.status(404).send('File not found');
        return;
      }
      if (file._id) {
        FileModel.findByIdAndUpdate(file._id, { $inc: { views: 1 } }).catch(() => {});
      }
      sendStoredFile(res, file.path, file.originalName, file.mimetype);
    } catch (error) {
      if ((error as any)?.code === 'ENOENT') {
        res.status(404).send('File not found');
      } else {
        next(error);
      }
    }
  };

  public downloadFile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const fileId: string = req.params.id;
      const file = await this.fileService.incrementDownload(fileId, userId);
      res.download(path.resolve(file.path), file.originalName);
    } catch (error) {
      next(error);
    }
  };

  public uploadFile = async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const created: File = await this.fileService.createFileFromUpload(req as AuthenticatedRequest, req.file);
      res.status(201).json({ data: created, message: 'uploaded' });
    } catch (error) {
      if (req.file?.path) tryUnlink(req.file.path);
      next(error);
    }
  };

  public deleteFile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const fileId: string = req.params.id;
      const deleted = await this.fileService.deleteFile(fileId, userId);
      tryUnlink(deleted.path);
      res.status(200).json({ data: deleted, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
