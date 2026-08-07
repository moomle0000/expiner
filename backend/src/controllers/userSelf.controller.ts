import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';
import { compare, hash } from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { HttpException } from '@exceptions/httpException';
import { UserModel } from '@models/users.model';
import { AuthRequest } from '@interfaces/AuthRequest';
import { MulterRequest } from '@interfaces/Multer';
import { UPLOAD_ROOT } from '@config';

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

      const body = (req.body || {}) as { name?: string; email?: string; avatar?: string | null };

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

      // avatar can only be replaced via POST /api/auth/me/avatar (multipart).
      // This PATCH supports clearing it: { "avatar": null }.
      if (body.avatar !== undefined) {
        if (body.avatar !== null) {
          throw new HttpException(400, 'avatar can only be replaced via /api/auth/me/avatar');
        }
        this.deleteAvatarFile(user.avatar);
        user.avatar = null;
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

  // POST /api/auth/me/avatar — upload/replace the current user's profile picture
  public uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new HttpException(401, 'Authentication required');
      const file = (req as MulterRequest).file;
      if (!file) throw new HttpException(400, 'No image uploaded');

      const user = await UserModel.findById(req.user._id);
      if (!user) throw new HttpException(404, 'User not found');

      // Delete the previous avatar image from disk, if any.
      if (user.avatar) {
        const previous = path.basename(user.avatar);
        const previousPath = path.join(UPLOAD_ROOT, 'avatars', previous);
        if (fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
      }

      // Remove the previous avatar image from disk, if any.
      this.deleteAvatarFile(user.avatar);

      user.avatar = `/uploads/avatars/${file.filename}`;
      await user.save();
      res.status(200).json({ data: this.sanitize(user), message: 'avatar updated' });
    } catch (err) {
      next(err);
    }
  };

  /** Deletes the on-disk file referenced by an avatar path (e.g. `/uploads/avatars/x.png`). */
  private deleteAvatarFile(avatar?: string | null): void {
    if (!avatar) return;
    const previous = path.basename(avatar);
    const previousPath = path.join(UPLOAD_ROOT, 'avatars', previous);
    if (fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
  }

  private sanitize(user: any) {
    if (!user) return user;
    const obj = typeof user.toObject === 'function' ? user.toObject() : user;
    const { password, passwordHash, __v, ...safe } = obj;
    return safe;
  }
}
