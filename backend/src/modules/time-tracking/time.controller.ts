import { Request, Response, NextFunction } from 'express';
import { TimeTrackingService } from './time.service.js';
import { startTimerSchema, stopTimerSchema, manualTimeEntrySchema } from './time.schemas.js';

export class TimeTrackingController {
  static async startTimer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = startTimerSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const userId = req.user!.userId;

      const timer = await TimeTrackingService.startTimer(orgId, userId, validatedInput);

      res.status(200).json({
        success: true,
        data: {
          timer,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const timer = await TimeTrackingService.getActiveTimer(userId);

      res.status(200).json({
        success: true,
        data: {
          timer,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async stopTimer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = stopTimerSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const userId = req.user!.userId;

      const timeEntry = await TimeTrackingService.stopTimer(orgId, userId, validatedInput);

      res.status(201).json({
        success: true,
        data: {
          message: 'Stopwatch timer stopped and flushed to timesheet.',
          timeEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = manualTimeEntrySchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const userId = req.user!.userId;

      const timeEntry = await TimeTrackingService.createManualEntry(orgId, userId, validatedInput);

      res.status(201).json({
        success: true,
        data: {
          timeEntry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listUserEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const userId = req.user!.userId;

      const entries = await TimeTrackingService.listUserTimeEntries(orgId, userId);

      res.status(200).json({
        success: true,
        data: {
          entries,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
