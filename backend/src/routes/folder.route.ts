import { Router } from 'express';
import { Container } from 'typedi';
import { Routes } from '@interfaces/routes.interface';
import { FolderController } from '@controllers/folder.controller';
import { apiKeyAuth } from '@middlewares/apiKeyAuth.middleware';

export class FolderRoute implements Routes {
  public path = '/';
  public router = Router();
  private controller = Container.get(FolderController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // owner-scoped: a user only ever sees/creates/deletes their own folders
    this.router.get(`${this.path}api/folders`, apiKeyAuth, this.controller.list);
    this.router.post(`${this.path}api/folders`, apiKeyAuth, this.controller.create);
    this.router.delete(`${this.path}api/folders/:id`, apiKeyAuth, this.controller.remove);
  }
}