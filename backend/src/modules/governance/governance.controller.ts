import { Request, Response, NextFunction } from 'express';
import { GovernanceReportsService } from './governance.service.js';

export class GovernanceController {
  static async getVelocity(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.org!._id.toString();
      const velocity = await GovernanceReportsService.getTeamVelocity(orgId);
      res.json({
        data: velocity,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTimeAllocation(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.org!._id.toString();
      const allocation = await GovernanceReportsService.getTimeAllocation(orgId);
      res.json({
        data: allocation,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.org!._id.toString();
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await GovernanceReportsService.getAuditLogs(orgId, limit);
      res.json({
        data: logs,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}
