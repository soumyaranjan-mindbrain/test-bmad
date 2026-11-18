import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { organizationRouter } from './modules/organizations/organization.routes.js';
import { invitationRouter } from './modules/invitations/invitation.routes.js';
import { projectRouter } from './modules/projects/project.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { commentRouter } from './modules/comments/comment.routes.js';
import { attachmentRouter } from './modules/attachments/attachment.routes.js';
import { timeTrackingRouter } from './modules/time-tracking/time.routes.js';
import { dependencyRouter } from './modules/dependencies/dependency.routes.js';
import { billingRouter } from './modules/billing/billing.routes.js';
import { governanceRouter } from './modules/governance/governance.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Base Health Check
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'TaskFlow Modular Monolith API',
    },
  });
});

// Domain Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/organizations', organizationRouter);
app.use('/api/v1/invitations', invitationRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1', taskRouter);
app.use('/api/v1', commentRouter);
app.use('/api/v1', attachmentRouter);
app.use('/api/v1', timeTrackingRouter);
app.use('/api/v1', dependencyRouter);
app.use('/api/v1', billingRouter);
app.use('/api/v1', governanceRouter);
app.use('/api/v1', adminRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);
