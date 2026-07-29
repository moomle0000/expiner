import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { verify } from 'jsonwebtoken';
import { HttpException } from '@exceptions/httpException';
import { SECRET_KEY } from '@config';
import { UserModel } from '@models/users.model';
import { ApiKeyService } from '@services/apiKey.service';
import { AuthRequest } from '@interfaces/AuthRequest';
import { Authorization } from '@utils/Authorization';

interface JwtPayload {
  id: string;
  email?: string;
  role?: string;
  [k: string]: unknown;
}

const extractBearerToken = (req: Request): string => {
  const header = req.header('Authorization') || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (header) return header.trim();
  return (Authorization(req.header('Cookie') || req.headers.cookie) || '').trim();
};

const verifyBearer = async (req: Request): Promise<AuthRequest['user']> => {
  const token = extractBearerToken(req);
  if (!token || !SECRET_KEY) return null;
  try {
    const payload = verify(token, SECRET_KEY) as JwtPayload;
    const user = await UserModel.findById(payload.id);
    if (!user) return null;
    if (user.status === false || user.active === false) return null;
    return user as any;
  } catch {
    return null;
  }
};

const verifyApiKey = async (req: Request): Promise<{ user: AuthRequest['user'] | null; reason?: string }> => {
  const raw = (req.header('X-API-Key') || (req.query.api_key as string | undefined) || '').trim();
  if (!raw) return { user: null, reason: 'no key provided' };
  const apiKeyService = Container.get(ApiKeyService);
  const user = await apiKeyService.validateKey(raw);
  if (!user) {
    let reason = 'API key not found or revoked';
    if (/^[a-f0-9]{64}$/i.test(raw)) {
      reason = `the value sent (${raw.length} chars) looks like a SHA-256 hash, not a raw API key. Raw API keys are 48 hex characters. Mint a new key from /api/auth/keys (POST) or the dashboard.`;
    } else if (raw.length < 32 || raw.length > 128) {
      reason = `API key length is ${raw.length} chars; expected 48 hex characters. Mint a new key.`;
    } else if (!/^[a-f0-9]+$/i.test(raw)) {
      reason = 'API key contains non-hex characters. Raw API keys are lowercase hex.';
    }
    return { user: null, reason };
  }
  return { user };
};

/**
 * Accepts either an `X-API-Key` (server-to-server) or an `Authorization: Bearer <jwt>`
 * (browser session, dashboard). X-API-Key takes precedence when both are present.
 * On success, populates `req.user` with the resolved User.
 */
export const apiKeyAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const hasApiKeyHeader = !!(req.header('X-API-Key') || req.query.api_key);
    const hasBearer = !!(req.header('Authorization') || req.header('Cookie') || req.headers.cookie);

    if (hasApiKeyHeader) {
      const { user, reason } = await verifyApiKey(req);
      if (user) {
        req.user = user;
        next();
        return;
      }
      next(new HttpException(401, `Invalid API key — ${reason || 'API key not found or revoked'}`));
      return;
    }

    if (hasBearer) {
      const user = await verifyBearer(req);
      if (user) {
        req.user = user;
        next();
        return;
      }
      next(new HttpException(401, 'Invalid or expired bearer token'));
      return;
    }

    next(
      new HttpException(
        401,
        'Authentication required. Send X-API-Key header (server-to-server) or Authorization: Bearer <token> (browser session).',
      ),
    );
  } catch (err) {
    next(err);
  }
};
