import { Router } from 'express';
import { UserController } from '@controllers/users.controller';

import { Routes } from '@interfaces/routes.interface';

import { authMiddleware as AuthMiddleware } from '@middlewares/auth.middleware';
export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.get(`${this.path}`, AuthMiddleware, this.user.getUsers);
    this.router.get(`${this.path}/admin`, AuthMiddleware, this.user.getUsersAdmin);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.user.getUserById);
    this.router.post(`${this.path}`, AuthMiddleware, this.user.createUser);
    this.router.put(`${this.path}/:id`, AuthMiddleware, this.user.updateUser);
    this.router.patch(`${this.path}/:id`, AuthMiddleware, this.user.updateUser);
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.user.deleteUser);
    // setting route

    
  }
}
