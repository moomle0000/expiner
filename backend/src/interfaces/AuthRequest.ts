import { Request } from 'express';
import { User } from '@interfaces/users.interface';

export interface AuthRequest extends Request {
  user?: User;
}
