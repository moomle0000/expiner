import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { File } from '@interfaces/files.interface';
import { FileModel } from '@models/files.model';
import { CreateFileDto } from '@dtos/files';
import { AuthRequest as AuthenticatedRequest } from '@interfaces/AuthRequest';
import { sanitizeFolder, categorize, categoryFromMime } from '@utils/fileCategory';
import { sniffFile } from '@utils/sniff';
import crypto from 'crypto';

@Service()
export class FileService {
  public async findAllFiles(userId: string): Promise<File[]> {
    return FileModel.find({ createdBy: userId }).sort({ createdAt: -1 });
  }

  public async findFileById(fileId: string, userId: string): Promise<File> {
    if (!fileId) throw new HttpException(400, 'File ID is required');
    const findFile = await FileModel.findOne({ _id: fileId, createdBy: userId });
    if (!findFile) throw new HttpException(404, 'File not found');
    return findFile;
  }

  public async findFileByShortUrl(shortUrl: string, userId: string): Promise<File> {
    if (!shortUrl) throw new HttpException(400, 'Short URL is required');
    const findFile = await FileModel.findOne({ shortUrl, createdBy: userId });
    if (!findFile) throw new HttpException(404, 'File not found');
    return findFile;
  }

  public async findByShortUrlPublic(shortUrl: string): Promise<File | null> {
    return FileModel.findOne({ shortUrl });
  }

  public async findFilesByType(fileType: string, userId: string): Promise<File[]> {
    const validTypes = ['image', 'document', 'video', 'audio', 'archive', 'executable', 'other'];
    if (!validTypes.includes(fileType)) {
      throw new HttpException(400, 'Invalid file type');
    }
    return FileModel.find({ fileType, createdBy: userId }).sort({ createdAt: -1 });
  }

  public async createFileFromUpload(req: AuthenticatedRequest, file: Express.Multer.File): Promise<File> {
    if (!file) throw new HttpException(400, 'No file uploaded');
    if (!req.user) throw new HttpException(401, 'Authentication required');

    const userId = req.user._id?.toString() || (req.user as any).id;
    const folder = sanitizeFolder((req.header('X-Folder') || '').trim()) || undefined;

    // generate a unique short URL (collision loop)
    let shortUrl = '';
    let unique = false;
    while (!unique) {
      shortUrl = crypto.randomBytes(6).toString('hex');
      const existing = await FileModel.findOne({ shortUrl });
      if (!existing) unique = true;
    }

    // sniff bytes
    const detected = await sniffFile(file.path);
    const effectiveMime = detected?.mime || file.mimetype;
    const effectiveExt = detected?.ext || (file.originalname.split('.').pop() || '').toLowerCase();
    const fileType = categorize(effectiveExt) || categoryFromMime(effectiveMime) || 'other';

    const created = await FileModel.create({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: effectiveMime,
      shortUrl,
      fileType,
      extension: '.' + effectiveExt,
      detectedMime: detected?.mime,
      detectedExt: detected?.ext,
      createdBy: userId as any,
      folder,
    });
    return created;
  }

  public async deleteFile(fileId: string, userId: string): Promise<File> {
    if (!fileId) throw new HttpException(400, 'File ID is required');
    const deleted = await FileModel.findOneAndDelete({ _id: fileId, createdBy: userId });
    if (!deleted) throw new HttpException(404, 'File not found');
    return deleted;
  }

  public async incrementDownload(fileId: string, userId: string): Promise<File> {
    if (!fileId) throw new HttpException(400, 'File ID is required');
    const updated = await FileModel.findOneAndUpdate(
      { _id: fileId, createdBy: userId },
      { $inc: { downloads: 1 } },
      { new: true },
    );
    if (!updated) throw new HttpException(404, 'File not found');
    return updated;
  }

  public async incrementViews(fileId: string, userId: string): Promise<File> {
    if (!fileId) throw new HttpException(400, 'File ID is required');
    const updated = await FileModel.findOneAndUpdate(
      { _id: fileId, createdBy: userId },
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!updated) throw new HttpException(404, 'File not found');
    return updated;
  }

  public async getFileStats(userId: string): Promise<any> {
    const filter = { createdBy: userId };
    const totalFiles = await FileModel.countDocuments(filter);
    const totalDownloads = await FileModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$downloads' } } },
    ]);
    const totalViews = await FileModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);
    const filesByType = await FileModel.aggregate([
      { $match: filter },
      { $group: { _id: '$fileType', count: { $sum: 1 } } },
    ]);

    return {
      totalFiles,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      filesByType: filesByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }
}
