import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { AuthRequest } from '@interfaces/AuthRequest';
import { CategoryService } from '@services/category.service';

const selfIdOf = (req: AuthRequest): string => {
  if (!req.user) throw new HttpException(401, 'Authentication required');
  return req.user._id ? req.user._id.toString() : (req.user as any).id;
};

@Service()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  public list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = selfIdOf(req);
      const data = await this.categoryService.listCategories(userId);
      res.status(200).json({ data, message: 'list' });
    } catch (err) {
      next(err);
    }
  };

  public create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = selfIdOf(req);
      const name: string = req.body?.name;
      const created = await this.categoryService.createCategory(userId, name);
      res.status(201).json({ data: created, message: 'created' });
    } catch (err) {
      next(err);
    }
  };

  public remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = selfIdOf(req);
      const deleted = await this.categoryService.deleteCategory(req.params.id, userId);
      res.status(200).json({ data: deleted, message: 'deleted' });
    } catch (err) {
      next(err);
    }
  };
}