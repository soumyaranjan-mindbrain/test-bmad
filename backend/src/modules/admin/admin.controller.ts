import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';

export class AdminController {
  static async getTelemetry(_req: Request, res: Response, next: NextFunction) {
    try {
      const telemetry = await AdminService.getPlatformTelemetry();
      res.json({
        data: telemetry,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async listTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await AdminService.listTenants(page, limit);
      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async suspendTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reason } = req.body;
      const result = await AdminService.suspendOrganization(tenantId, reason);
      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async reactivateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await AdminService.reactivateOrganization(tenantId);
      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}
