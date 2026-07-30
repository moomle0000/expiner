import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { compare, hash } from 'bcrypt';
import { HttpException } from '@exceptions/httpException';
import { UserModel } from '@models/users.model';
import { AuthRequest } from '@interfaces/AuthRequest';

const BCRYPT_ROUNDS = 10;

@Service()
export class UserSelfController {
  // GET /api/auth/me — current user info (safe view, no password hash)
  public me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new HttpException(401, 'Authentication required');
      const user = await UserModel.findById(req.user._id);
      if (!user) throw new HttpException(404, 'User not found');
      res.status(200).json({ data: this.sanitize(user), message: 'me' });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/auth/me — update name and/or email
  public updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new HttpException(401, 'Authentication required');
      const user = await UserModel.findById(req.user._id);
      if (!user) throw new HttpException(404, 'User not found');

      const body = (req.body || {}) as { name?: string; email?: string };

      if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (name.length < 2 || name.length > 64) {
          throw new HttpException(400, 'name must be between 2 and 64 characters');
        }
        user.name = name;
      }

      if (body.email !== undefined) {
        const email = String(body.email).toLowerCase().trim();
        if (!email || !email.includes('@')) {
          throw new HttpException(400, 'invalid email');
        }
        const taken = await UserModel.findOne({ email, _id: { $ne: user._id } });
        if (taken) throw new HttpException(409, 'Email already in use');
        user.email = email;
      }

      await user.save();
      res.status(200).json({ data: this.sanitize(user), message: 'updated' });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/auth/me/password — change the current user's password
  public changeMyPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new HttpException(401, 'Authentication required');
      const body = (req.body || {}) as { currentPassword?: string; newPassword?: string };
      if (!body.currentPassword || !body.newPassword) {
        throw new HttpException(400, 'currentPassword and newPassword are required');
      }
      if (String(body.newPassword).length < 8) {
        throw new HttpException(400, 'newPassword must be at least 8 characters');
      }

      const user = await UserModel.findById(req.user._id);
      if (!user) throw new HttpException(404, 'User not found');

      const ok = await compare(body.currentPassword, user.password);
      if (!ok) throw new HttpException(401, 'Current password is incorrect');

      user.password = await hash(body.newPassword, BCRYPT_ROUNDS);
      await user.save();

      res.status(200).json({ data: null, message: 'password changed' });
    } catch (err) {
      next(err);
    }
  };

  private sanitize(user: any) {
    if (!user) return user;
    const obj = typeof user.toObject === 'function' ? user.toObject() : user;
    const { password, passwordHash, __v, ...safe } = obj;
    return safe;
  }
}
