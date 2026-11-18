import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { AppError } from '../utils/errors.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError('Invalid or expired access token.', 401, 'INVALID_TOKEN'));
    }
  }
}
