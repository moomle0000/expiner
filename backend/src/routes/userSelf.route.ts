import { Router } from 'express';
import { Container } from 'typedi';
import { Routes } from '@interfaces/routes.interface';
import { UserSelfController } from '@controllers/userSelf.controller';
import { authMiddleware } from '@middlewares/auth.middleware';

export class UserSelfRoute implements Routes {
  public path = '/';
  public router = Router();
  private controller = Container.get(UserSelfController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}api/auth/me`, authMiddleware, this.controller.me);
    this.router.patch(`${this.path}api/auth/me`, authMiddleware, this.controller.updateMe);
    this.router.post(`${this.path}api/auth/me/password`, authMiddleware, this.controller.changeMyPassword);
  }
}
