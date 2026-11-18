import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { requireOrgRole } from '../../middleware/authorize.js';
import { GovernanceController } from './governance.controller.js';

export const governanceRouter = Router();

governanceRouter.use(authenticate);
governanceRouter.use(tenantContext);

// Reports available to all active members
governanceRouter.get('/governance/velocity', GovernanceController.getVelocity);
governanceRouter.get('/governance/time-allocation', GovernanceController.getTimeAllocation);

// Audit logs restricted to Admins and Owners
governanceRouter.get('/governance/audit-logs', requireOrgRole('admin'), GovernanceController.getAuditLogs);
