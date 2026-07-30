import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { verify } from 'jsonwebtoken';
import { HttpException } from '@exceptions/httpException';
import { SECRET_KEY } from '@config';
import { UserModel } from '@models/users.model';
import { User } from '@interfaces/users.interface';
import { AuthRequest } from '@interfaces/AuthRequest';
import { Authorization } from '@utils/Authorization';

interface JwtPayload {
  id: string;
  email?: string;
  role?: string;
  [k: string]: unknown;
}

const extractToken = (req: Request): string => {
  const header = req.header('Authorization') || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (header) return header.trim();
  return (Authorization(req.header('Cookie') || req.headers.cookie) || '').trim();
};

export const authMiddleware = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      next(new HttpException(401, 'Missing bearer token (Authorization: Bearer <token>) or session cookie'));
      return;
    }
    if (!SECRET_KEY) {
      next(new HttpException(500, 'JWT secret is not configured'));
      return;
    }
    let payload: JwtPayload;
    try {
      payload = verify(token, SECRET_KEY) as JwtPayload;
    } catch (err) {
      next(new HttpException(401, 'Invalid or expired token'));
      return;
    }
    const user = await UserModel.findById(payload.id);
    if (!user) {
      next(new HttpException(401, 'User not found'));
      return;
    }
    if (user.status === false || user.active === false) {
      next(new HttpException(403, 'Account is disabled'));
      return;
    }
    req.user = user as User;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new HttpException(401, 'Authentication required'));
    return;
  }
  if (req.user.role !== 'admin') {
    next(new HttpException(403, 'Admin role required'));
    return;
  }
  next();
};

export const requireSelfOrAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new HttpException(401, 'Authentication required'));
    return;
  }
  const targetId = req.params.id;
  const selfId = req.user._id ? req.user._id.toString() : '';
  if (req.user.role === 'admin' || selfId === targetId) {
    next();
    return;
  }
  next(new HttpException(403, 'You can only act on your own account'));
};
