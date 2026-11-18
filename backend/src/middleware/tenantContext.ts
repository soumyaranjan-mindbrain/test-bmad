import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Organization, IOrganization } from '../models/Organization.js';
import { OrganizationMember, IOrganizationMember } from '../models/OrganizationMember.js';
import { AppError } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Request {
      org?: IOrganization;
      membership?: IOrganizationMember;
    }
  }
}

export async function tenantContext(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const orgIdHeader = req.headers['x-organization-id'] as string;

    if (!orgIdHeader) {
      throw new AppError('Organization context required. Missing x-organization-id header.', 400, 'MISSING_ORG_CONTEXT');
    }

    if (!mongoose.Types.ObjectId.isValid(orgIdHeader)) {
      throw new AppError('Invalid organization identifier format.', 400, 'INVALID_ORG_ID');
    }

    if (!req.user) {
      throw new AppError('Authentication must precede tenant context verification.', 401, 'UNAUTHORIZED');
    }

    // 1. Fetch organization
    const org = await Organization.findOne({
      _id: orgIdHeader,
      isDeleted: false,
    });

    if (!org) {
      throw new AppError('Organization not found or has been removed.', 404, 'ORGANIZATION_NOT_FOUND');
    }

    if (org.status === 'suspended') {
      throw new AppError('This workspace has been suspended. Please contact organization owner.', 403, 'ORGANIZATION_SUSPENDED');
    }

    // 2. Fetch membership for current user in this organization
    const membership = await OrganizationMember.findOne({
      organizationId: org._id,
      userId: req.user.userId,
      status: 'active',
    });

    if (!membership && !req.user.isSuperAdmin) {
      throw new AppError('Access denied. You are not an active member of this organization.', 403, 'FORBIDDEN_TENANT_ACCESS');
    }

    req.org = org;
    if (membership) {
      req.membership = membership;
    }

    next();
  } catch (error) {
    next(error);
  }
}
