import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { TimeTrackingController } from './time.controller.js';

export const timeTrackingRouter = Router();

// All time-tracking routes require authentication and tenant workspace scope
timeTrackingRouter.use(authenticate);
timeTrackingRouter.use(tenantContext);

// Active Stopwatch Timer Controls (Single-Active-Timer Lock)
timeTrackingRouter.get('/time-tracking/timer/active', TimeTrackingController.getActive);
timeTrackingRouter.post('/time-tracking/timer/start', TimeTrackingController.startTimer);
timeTrackingRouter.post('/time-tracking/timer/stop', TimeTrackingController.stopTimer);

// Manual Timesheet Logging
timeTrackingRouter.post('/time-tracking/entries', TimeTrackingController.createManual);
timeTrackingRouter.get('/time-tracking/entries', TimeTrackingController.listUserEntries);
