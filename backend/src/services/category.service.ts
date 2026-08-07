import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { ICategory } from '@interfaces/category.interface';
import { CategoryModel } from '@models/category.model';

const sanitizeName = (raw: string): string => (raw || '').trim();

@Service()
export class CategoryService {
  public async listCategories(createdBy: string): Promise<ICategory[]> {
    return CategoryModel.find({ createdBy }).sort({ name: 1 });
  }

  public async createCategory(createdBy: string, name: string): Promise<ICategory> {
    const clean = sanitizeName(name);
    if (!clean) throw new HttpException(400, 'Category name is required');

    const existing = await CategoryModel.findOne({ createdBy, name: clean });
    if (existing) throw new HttpException(409, `Category "${clean}" already exists`);

    return CategoryModel.create({ name: clean, createdBy: createdBy as any });
  }

  public async deleteCategory(categoryId: string, createdBy: string): Promise<ICategory> {
    if (!categoryId) throw new HttpException(400, 'Category ID is required');
    const deleted = await CategoryModel.findOneAndDelete({ _id: categoryId, createdBy });
    if (!deleted) throw new HttpException(404, 'Category not found');
    return deleted;
  }
}