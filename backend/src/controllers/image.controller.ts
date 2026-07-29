import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { Image } from '@interfaces/images.interface';
import { ImageModel } from '@models/image.model';
import { ImageService } from '@services/image.service';
import { AuthRequest as AuthenticatedRequest } from '@interfaces/AuthRequest';
import { MulterRequest } from '@/interfaces/Multer';
import { isInlineSafe } from '@utils/fileCategory';
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
        res.status(404).send('Image not found');
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
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  public getImages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const data: Image[] = await this.imageService.findAllImages(userId);
      res.status(200).json({ data, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  // /api/images/:id.:ext? — owner-scoped
  public getImageById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const imageId: string = req.params.id;
      const image = await this.imageService.findImageById(imageId, userId);
      sendStoredFile(res, image.path, image.originalName, image.mimetype);
    } catch (error) {
      next(error);
    }
  };

  public getImageByShortUrl = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const shortUrl: string = req.params.shortUrl;
      const image = await this.imageService.findImageByShortUrl(shortUrl, userId);
      res.status(200).json({ data: image, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  // public — anyone with the short URL can view (Cloudinary default)
  public viewImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shortUrl: string = req.params.shortUrl;
      const image = await this.imageService.findByShortUrlPublic(shortUrl);
      if (!image) {
        res.status(404).send('Image not found');
        return;
      }
      if (image._id) {
        // fire-and-forget view increment
        ImageModel.findByIdAndUpdate(image._id, { $inc: { views: 1 } }).catch(() => {});
      }
      sendStoredFile(res, image.path, image.originalName, image.mimetype);
    } catch (error) {
      if ((error as any)?.code === 'ENOENT') {
        res.status(404).send('Image not found');
      } else {
        next(error);
      }
    }
  };

  public downloadImage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const imageId: string = req.params.id;
      const image = await this.imageService.incrementDownload(imageId, userId);
      res.download(path.resolve(image.path), image.originalName);
    } catch (error) {
      next(error);
    }
  };

  public uploadImage = async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const created: Image = await this.imageService.createImageFromUpload(req as AuthenticatedRequest, req.file);
      res.status(201).json({ data: created, message: 'uploaded' });
    } catch (error) {
      if (req.file?.path) tryUnlink(req.file.path);
      next(error);
    }
  };

  public deleteImage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = userIdOf(req);
      const imageId: string = req.params.id;
      const deleted = await this.imageService.deleteImage(imageId, userId);
      tryUnlink(deleted.path);
      res.status(200).json({ data: deleted, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
