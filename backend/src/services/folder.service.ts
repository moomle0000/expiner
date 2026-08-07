import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { IFolder } from '@interfaces/folder.interface';
import { FolderModel } from '@models/folder.model';

const sanitizeName = (raw: string): string => (raw || '').trim();

@Service()
export class FolderService {
  public async listFolders(createdBy: string): Promise<IFolder[]> {
    return FolderModel.find({ createdBy }).sort({ name: 1 });
  }

  public async createFolder(createdBy: string, name: string): Promise<IFolder> {
    const clean = sanitizeName(name);
    if (!clean) throw new HttpException(400, 'Folder name is required');

    const existing = await FolderModel.findOne({ createdBy, name: clean });
    if (existing) throw new HttpException(409, `Folder "${clean}" already exists`);

    return FolderModel.create({ name: clean, createdBy: createdBy as any });
  }

  public async deleteFolder(folderId: string, createdBy: string): Promise<IFolder> {
    if (!folderId) throw new HttpException(400, 'Folder ID is required');
    const deleted = await FolderModel.findOneAndDelete({ _id: folderId, createdBy });
    if (!deleted) throw new HttpException(404, 'Folder not found');
    return deleted;
  }
}