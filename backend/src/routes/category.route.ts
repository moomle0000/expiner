import { Router } from 'express';
import { Container } from 'typedi';
import { Routes } from '@interfaces/routes.interface';
import { CategoryController } from '@controllers/category.controller';
import { apiKeyAuth } from '@middlewares/apiKeyAuth.middleware';

export class CategoryRoute implements Routes {
  public path = '/';
  public router = Router();
  private controller = Container.get(CategoryController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // owner-scoped: a user only sees/creates/deletes their own categories
    this.router.get(`${this.path}api/categories`, apiKeyAuth, this.controller.list);
    this.router.post(`${this.path}api/categories`, apiKeyAuth, this.controller.create);
    this.router.delete(`${this.path}api/categories/:id`, apiKeyAuth, this.controller.remove);
  }
}