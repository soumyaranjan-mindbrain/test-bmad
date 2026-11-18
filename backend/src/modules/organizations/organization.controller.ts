import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service.js';
import { createOrganizationSchema } from './organization.schemas.js';

export class OrganizationController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createOrganizationSchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await OrganizationService.createOrganization(userId, validatedInput);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listUserOrganizations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const organizations = await OrganizationService.getUserOrganizations(userId);

      res.status(200).json({
        success: true,
        data: {
          organizations,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // tenantContext middleware guarantees req.org and req.membership are attached
      res.status(200).json({
        success: true,
        data: {
          organization: req.org,
          membership: req.membership,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
