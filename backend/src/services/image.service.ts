import { Service } from 'typedi';
import { CreateImageDto } from '@dtos/images.dto';
import { Image } from '@interfaces/images.interface';
import { ImageModel } from '@models/image.model';
import { generateRandomString } from '@utils/util';
import { HttpException } from '@exceptions/httpException';
import { AuthRequest as AuthenticatedRequest } from '@interfaces/AuthRequest';
import { sanitizeFolder, categorize, categoryFromMime } from '@utils/fileCategory';
import { sniffFile } from '@utils/sniff';

@Service()
export class ImageService {
  // list scoped to the calling user (admin sees only their own; no cross-user reads)
  public async findAllImages(userId: string): Promise<Image[]> {
    return ImageModel.find({ createdBy: userId }).sort({ createdAt: -1 });
  }

  public async findImageById(imageId: string, userId: string): Promise<Image> {
    if (!imageId) throw new HttpException(400, 'Image ID is required');
    const findImage = await ImageModel.findOne({ _id: imageId, createdBy: userId });
    if (!findImage) throw new HttpException(404, 'Image not found');
    return findImage;
  }

  public async findImageByShortUrl(shortUrl: string, userId: string): Promise<Image> {
    if (!shortUrl) throw new HttpException(400, 'Short URL is required');
    const findImage = await ImageModel.findOne({ shortUrl, createdBy: userId });
    if (!findImage) throw new HttpException(404, 'Image not found');

    // increment views
    await ImageModel.findByIdAndUpdate(findImage._id, { $inc: { views: 1 } });
    return findImage;
  }

  public async findByShortUrlPublic(shortUrl: string): Promise<Image | null> {
    // public read by short URL — no owner check (Cloudinary-style)
    return ImageModel.findOne({ shortUrl });
  }

  public async incrementDownload(imageId: string, userId: string): Promise<Image> {
    if (!imageId) throw new HttpException(400, 'Image ID is required');
    const updated = await ImageModel.findOneAndUpdate(
      { _id: imageId, createdBy: userId },
      { $inc: { downloads: 1 } },
      { new: true },
    );
    if (!updated) throw new HttpException(404, 'Image not found');
    return updated;
  }

  public async deleteImage(imageId: string, userId: string): Promise<Image> {
    if (!imageId) throw new HttpException(400, 'Image ID is required');
    const deleted = await ImageModel.findOneAndDelete({ _id: imageId, createdBy: userId });
    if (!deleted) throw new HttpException(404, 'Image not found');
    return deleted;
  }

  public async createImageFromUpload(req: AuthenticatedRequest, file: Express.Multer.File): Promise<Image> {
    if (!file) throw new HttpException(400, 'No file uploaded');
    if (!req.user) throw new HttpException(401, 'Authentication required');

    const userId = req.user._id?.toString() || (req.user as any).id;
    const folder = sanitizeFolder((req.header('X-Folder') || '').trim()) || undefined;

    // sniff bytes (if file-type is available); fall back to client-declared mimetype
    const detected = await sniffFile(file.path);
    const effectiveMime = detected?.mime || file.mimetype;
    const effectiveExt = detected?.ext || (file.originalname.split('.').pop() || '').toLowerCase();
    const category = categorize(effectiveExt) || categoryFromMime(effectiveMime) || 'image';

    const shortUrl = generateRandomString(6);
    const createImageData: Partial<Image> = {
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: effectiveMime,
      shortUrl,
      category,
      detectedMime: detected?.mime,
      detectedExt: detected?.ext,
      createdBy: userId as any,
      folder,
    };
    const newImage = await ImageModel.create(createImageData);
    return newImage;
  }
}
