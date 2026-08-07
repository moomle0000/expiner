import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { AuthService } from '@services/auth.service';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { DataStoredInToken } from '@/interfaces/auth.interface';
import { Authorization } from '@utils/Authorization';
export class AuthController {
  public auth = Container.get(AuthService);

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.body;
      const signUpUserData: User = await this.auth.signup(userData);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    const userData = req.body;

    try {
      const { cookie, findUser, tokenData } = await this.auth.login(userData);
      res.setHeader('Set-Cookie', [cookie]);
      // findUser.email
      res.status(200).json({ data: findUser, message: 'login', token: tokenData.token });
    } catch (err) {
      next(err);
    }
  };

  public verify = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      // Resolve the JWT from, in order of preference:
      //   1) `Authorization: Bearer <token>` header (programmatic / mobile clients)
      //   2) `req.cookies.Authorization` populated by `cookie-parser` (browser session)
      //   3) Hand-parse `req.headers.cookie` as a last-resort fallback
      // All three eventually land in `this.auth.verify`, which expects a raw
      // JWT string (no `Bearer ` prefix), so strip the prefix here.
      const extractToken = (raw: string | undefined): string | undefined => {
        if (!raw) return undefined;
        const trimmed = raw.trim();
        if (/^Bearer\s+/i.test(trimmed)) return trimmed.replace(/^Bearer\s+/i, '').trim();
        return trimmed;
      };

      const headerToken = extractToken(req.headers.authorization as string | undefined);
      const cookieToken = extractToken((req.cookies && req.cookies.Authorization) || Authorization(req.headers.cookie));
      const token = headerToken || cookieToken;

      const user = await this.auth.verify(token);

      if (typeof user === 'string') {
        res.status(401).json({ message: user });
        return;
      }
      res.status(200).json({ data: user, message: 'verified' });
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

  public logOut = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      await this.auth.logout(req.user);
      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: null, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      // await this.auth.requestPasswordReset(email);

      res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      // await this.auth.resetPassword(token, newPassword);

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  };

  // ===== ADMIN PASSWORD RESET =====
  public adminResetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = req.headers.authorization || Authorization(req.headers.cookie);
      const decoded = verify(tokens, SECRET_KEY) as DataStoredInToken;
      const adminId = decoded.id; // Admin's ID (from authenticated request)
      const { userId, newPassword } = req.body;

      await this.auth.adminResetPassword(adminId, userId, newPassword);

      res.status(200).json({ message: 'User password reset successfully by admin' });
    } catch (error) {
      next(error);
    }
  };
}
