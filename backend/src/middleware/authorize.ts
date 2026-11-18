import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export type OrgRole = 'owner' | 'admin' | 'member' | 'guest';

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

export function requireOrgRole(minRole: OrgRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.membership) {
      next(new AppError('Unauthorized: No active organization membership found.', 403, 'FORBIDDEN'));
      return;
    }

    const userRoleLevel = ROLE_HIERARCHY[req.membership.role as OrgRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleLevel < requiredLevel) {
      next(
        new AppError(
          `Access forbidden: Action requires at least '${minRole}' role permissions in this organization.`,
          403,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
      return;
    }

    next();
  };
}
