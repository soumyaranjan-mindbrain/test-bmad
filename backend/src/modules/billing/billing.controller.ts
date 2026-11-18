import { Request, Response, NextFunction } from 'express';
import { BillingService } from './billing.service.js';

export class BillingController {
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.org!._id.toString();
      const result = await BillingService.getSubscriptionStatus(orgId);
      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async upgrade(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.org!._id.toString();
      const { planKey, paymentMethod } = req.body;
      const result = await BillingService.upgradePlan(orgId, planKey, paymentMethod);
      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async downgrade(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.org!._id.toString();
      const { retainedProjectIds } = req.body;
      const result = await BillingService.gracefulDowngrade(orgId, retainedProjectIds || []);
      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.org!._id.toString();
      const invoices = await BillingService.listInvoices(orgId);
      res.json({
        data: invoices,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReceiptHtml(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceNumber = Array.isArray(req.params.invoiceNumber) 
        ? req.params.invoiceNumber[0] 
        : req.params.invoiceNumber;

      const invoice = await BillingService.getInvoiceReceipt(invoiceNumber);
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Simulated Receipt - ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 650px; margin: 0 auto; padding: 32px; position: relative; overflow: hidden; }
    .watermark { position: absolute; top: 40%; left: -20px; right: -20px; font-size: 32px; font-weight: 900; color: rgba(239, 68, 68, 0.15); text-align: center; transform: rotate(-25deg); pointer-events: none; border: 4px dashed rgba(239, 68, 68, 0.2); padding: 10px; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 700; color: #818cf8; }
    .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
    .label { color: #94a3b8; }
    .value { font-weight: 600; }
    .total { border-top: 2px solid #334155; padding-top: 16px; margin-top: 20px; font-size: 18px; font-weight: 700; }
    .disclaimer { margin-top: 30px; font-size: 12px; color: #f59e0b; text-align: center; border: 1px dashed #d97706; padding: 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="watermark">SIMULATED TEST RECEIPT - NOT A LEGAL TAX INVOICE</div>
    <div class="header">
      <div>
        <div class="title">TaskFlow Billing</div>
        <div style="font-size: 12px; color: #94a3b8;">Simulated Billing Division</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 14px; font-weight: 600;">${invoice.invoiceNumber}</div>
        <div style="font-size: 12px; color: #94a3b8;">${new Date(invoice.createdAt).toLocaleDateString()}</div>
      </div>
    </div>

    <div class="row">
      <span class="label">Plan Subscription</span>
      <span class="value">TaskFlow ${invoice.planKey.toUpperCase()} Tier</span>
    </div>
    <div class="row">
      <span class="label">Allocated Seats</span>
      <span class="value">${invoice.seatCount} seats</span>
    </div>
    <div class="row">
      <span class="label">Payment Method</span>
      <span class="value">${invoice.paymentMethod.brand} ending in ${invoice.paymentMethod.last4}</span>
    </div>
    <div class="row">
      <span class="label">Status</span>
      <span class="value" style="color: #34d399;">PAID (SIMULATED)</span>
    </div>

    <div class="row total">
      <span>Total Paid</span>
      <span>$${(invoice.amountCents / 100).toFixed(2)} USD</span>
    </div>

    <div class="disclaimer">
      ⚠️ SIMULATION ENVIRONMENT NOTICE: No real funds or credit cards were debited. This document serves strictly as an automated test artifact.
    </div>
  </div>
</body>
</html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      next(err);
    }
  }
}
