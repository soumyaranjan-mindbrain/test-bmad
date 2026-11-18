import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { requireOrgRole } from '../../middleware/authorize.js';
import { BillingController } from './billing.controller.js';

export const billingRouter = Router();

// Invoices receipt preview can be publicly accessed via signed or valid invoiceNumber
billingRouter.get('/billing/invoices/:invoiceNumber/receipt', BillingController.getReceiptHtml);

// All other billing operations require authentication & tenant context
billingRouter.use(authenticate);
billingRouter.use(tenantContext);

// Status viewable by any organization member
billingRouter.get('/billing/status', BillingController.getStatus);
billingRouter.get('/billing/invoices', BillingController.listInvoices);

// Mutations require owner or admin role
billingRouter.post('/billing/upgrade', requireOrgRole('admin'), BillingController.upgrade);
billingRouter.post('/billing/downgrade', requireOrgRole('owner'), BillingController.downgrade);
