import { NextFunction, Request, Response } from 'express';
import { logger } from '@utils/logger';

export const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const line = `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`;

    if (status >= 500) {
      logger.error(line);
    } else {
      logger.warn(line);
    }
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};
