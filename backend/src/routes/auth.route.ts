import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';

export class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, this.auth.signUp);
    this.router.post(`${this.path}/login`, this.auth.logIn);
    this.router.get(`${this.path}/verify`, this.auth.verify);
    this.router.get(`${this.path}/profile`, this.auth.verify);
    this.router.post(`${this.path}/verify`, this.auth.verify);
    this.router.post(`${this.path}/logout`, this.auth.logOut);
    this.router.post(`${this.path}/admin/reset-password`, this.auth.adminResetPassword);
  }
}
