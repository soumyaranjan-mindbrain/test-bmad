import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';

export async function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || !req.user.userId) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(req.user.userId).lean();
    if (!user || !user.isSuperAdmin) {
      throw new AppError('Access forbidden: Super Administrator credentials required.', 403, 'SUPER_ADMIN_REQUIRED');
    }

    next();
  } catch (error) {
    next(error);
  }
}
