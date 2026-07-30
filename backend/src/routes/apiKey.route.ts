import { Router } from 'express';
import { Container } from 'typedi';
import { Routes } from '@interfaces/routes.interface';
import { ApiKeyController } from '@controllers/apiKey.controller';
import { authMiddleware, requireAdmin } from '@middlewares/auth.middleware';

export class ApiKeyRoute implements Routes {
  public path = '/';
  public router = Router();
  private controller = Container.get(ApiKeyController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // self — any authenticated user can list/create/revoke their own keys
    this.router.get(`${this.path}api/auth/keys`, authMiddleware, this.controller.listMyKeys);
    this.router.post(`${this.path}api/auth/keys`, authMiddleware, this.controller.createKey);
    this.router.post(`${this.path}api/auth/keys/:id/revoke`, authMiddleware, this.controller.revokeKey);

    // admin — see every key
    this.router.get(`${this.path}api/admin/keys`, authMiddleware, requireAdmin, this.controller.listAllKeys);
  }
}
