import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { CreateApiKeyDto } from '@dtos/apiKey.dto';
import { AuthRequest } from '@interfaces/AuthRequest';
import { ApiKeyService } from '@services/apiKey.service';

@Service()
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  public listMyKeys = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new HttpException(401, 'Authentication required');
      const selfId = req.user._id ? req.user._id.toString() : '';
      const keys = await this.apiKeyService.listKeysForUser(selfId);
      res.status(200).json({ data: keys, message: 'list' });
    } catch (err) {
      next(err);
    }
  };

  public listAllKeys = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const keys = await this.apiKeyService.listAllKeys();
      res.status(200).json({ data: keys, message: 'list (admin)' });
    } catch (err) {
      next(err);
    }
  };

  public createKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new HttpException(401, 'Authentication required');
      const selfId = req.user._id ? req.user._id.toString() : '';
      const body = req.body as CreateApiKeyDto;
      if (!body || !body.name) {
        throw new HttpException(400, 'name is required');
      }
      const { record, rawKey } = await this.apiKeyService.createKey(selfId, body.name);
      res.status(201).json({
        data: {
          id: record._id.toString(),
          name: record.name,
          createdById: selfId,
          user: {
            id: selfId,
            name: (req.user as any).name,
            username: (req.user as any).username,
            email: (req.user as any).email,
            role: (req.user as any).role,
          },
          key: rawKey,
          createdAt: record.createdAt,
        },
        message: 'created — store the key now, it will not be shown again',
      });
    } catch (err) {
      next(err);
    }
  };

  public revokeKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new HttpException(401, 'Authentication required');
      const selfId = req.user._id ? req.user._id.toString() : '';
      await this.apiKeyService.revokeKey(req.params.id, { id: selfId, role: req.user.role });
      // return the updated public view so the dashboard can refresh
      const all = await this.apiKeyService.listAllKeys();
      const updated = all.find(k => k.id === req.params.id);
      res.status(200).json({ data: updated, message: 'revoked' });
    } catch (err) {
      next(err);
    }
  };
}
