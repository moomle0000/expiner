import { Router } from 'express';
import { FileController } from '@/controllers/File.controller';
import { Routes } from '@interfaces/routes.interface';
import { upload } from '@utils/multerConfig';
import { Container } from 'typedi';
import path from 'path';
import { apiKeyAuth } from '@middlewares/apiKeyAuth.middleware';

export class FileRoute implements Routes {
  public path = '/';
  public router = Router();
  private fileController = Container.get(FileController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // authenticated — owner-scoped
    this.router.get(`${this.path}api/files`, apiKeyAuth, this.fileController.getFiles);
    this.router.get(`${this.path}api/files/type/:type`, apiKeyAuth, this.fileController.getFilesByType);
    this.router.get(`${this.path}api/files/:id.:ext?`, apiKeyAuth, this.fileController.getFileById);
    this.router.post(`${this.path}api/files/upload`, apiKeyAuth, upload.single('file'), this.fileController.uploadFile);
    this.router.delete(`${this.path}api/files/:id`, apiKeyAuth, this.fileController.deleteFile);
    this.router.get(`${this.path}api/files/:id/download`, apiKeyAuth, this.fileController.downloadFile);
    this.router.get(`${this.path}info/:shortUrl`, apiKeyAuth, this.fileController.getFileByShortUrl);

    // public view endpoint
    this.router.get(`${this.path}f/:shortUrl.:ext?`, this.fileController.viewFile);

    this.router.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, '../../public/index.html'));
    });
  }
}
