import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Download,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  amountCents: number;
  status: 'simulated_success' | 'failed';
  planKey: string;
  seatCount: number;
  paymentMethod: {
    brand: string;
    last4: string;
  };
  createdAt: string;
}

export const BillingPortal: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<'pro' | 'business'>('pro');
  
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [billingFeedback, setBillingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      _id: 'inv-1',
      invoiceNumber: 'SIM-INV-2026-515581',
      amountCents: 1200,
      status: 'simulated_success',
      planKey: 'pro',
      seatCount: 1,
      paymentMethod: { brand: 'Visa', last4: '4242' },
      createdAt: new Date().toISOString(),
    }
  ]);

  const handleSimulatedUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = cardNumber.replace(/\s+/g, '');
    const last4 = sanitized.slice(-4);

    if (last4 === '0002') {
      setBillingFeedback({
        type: 'error',
        message: 'Simulated payment failed: Insufficient funds (Declined by simulated issuer).'
      });
      return;
    }

    if (last4 === '0003') {
      setBillingFeedback({
        type: 'error',
        message: 'Simulated payment failed: Card expired.'
      });
      return;
    }

    const newInvoice: InvoiceItem = {
      _id: `inv-${Date.now()}`,
      invoiceNumber: `SIM-INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      amountCents: selectedPlanForUpgrade === 'pro' ? 1200 : 2500,
      status: 'simulated_success',
      planKey: selectedPlanForUpgrade,
      seatCount: 1,
      paymentMethod: { brand: 'Visa', last4: last4 || '4242' },
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
    setCurrentPlan(selectedPlanForUpgrade);
    setBillingFeedback({
      type: 'success',
      message: `Successfully upgraded to TaskFlow ${selectedPlanForUpgrade.toUpperCase()} tier!`
    });

    setTimeout(() => {
      setIsCheckoutOpen(false);
      setBillingFeedback(null);
    }, 1500);
  };

  const handleGracefulDowngrade = () => {
    if (confirm('Downgrade to Free Starter tier? Excess projects beyond 3 will be set to read-only archive with zero data loss.')) {
      setCurrentPlan('free');
      alert('Plan successfully transitioned to Free. Excess projects archived with full data preservation.');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Simulation Warning Banner in Light Mode */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-3 text-amber-800 text-xs font-semibold shadow-2xs">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
        <span>SIMULATION ENVIRONMENT: No real financial charges occur. Use test card ending in 4242 for success, 0002 for declined payment.</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Nexus Engineering</span>
            <span>/</span>
            <span className="text-indigo-600">Subscriptions & Licenses</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Plan Quotas & Simulated Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your workspace plan tier, seat allocations, and simulated billing transactions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200">
            Active Tier: {currentPlan}
          </span>
        </div>
      </div>

      {/* Tier Pricing Cards in Pure Light Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className={`p-6 rounded-2xl border transition-all ${
          currentPlan === 'free' 
            ? 'bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-md' 
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900">Free Starter</h3>
            {currentPlan === 'free' && (
              <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-200">Current</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">$0 <span className="text-xs font-normal text-slate-500">/ month</span></div>
          <p className="text-xs text-slate-500 mb-6">For small engineering squads kicking off early agile sprints.</p>

          <ul className="space-y-3 text-xs text-slate-600 mb-6">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Up to 5 team members</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 3 active projects</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Interactive Kanban Boards</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Manual time tracking</li>
          </ul>

          {currentPlan !== 'free' && (
            <button
              onClick={handleGracefulDowngrade}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-200"
            >
              Downgrade to Free
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`p-6 rounded-2xl border relative transition-all ${
          currentPlan === 'pro' 
            ? 'bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-md' 
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}>
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Most Popular
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900">Pro Team</h3>
            {currentPlan === 'pro' && (
              <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-200">Current</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">$12 <span className="text-xs font-normal text-slate-500">/ seat / month</span></div>
          <p className="text-xs text-slate-500 mb-6">Designed for scale-ups needing automated time locks and real-time sync.</p>

          <ul className="space-y-3 text-xs text-slate-600 mb-6">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Unlimited projects & members</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Active Stopwatch Lock with live sync</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Full Calendar & Timeline views</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Subtask DFS cycle protection</li>
          </ul>

          <button
            onClick={() => {
              setSelectedPlanForUpgrade('pro');
              setIsCheckoutOpen(true);
            }}
            disabled={currentPlan === 'pro'}
            className={`w-full py-2.5 text-xs font-semibold rounded-lg transition ${
              currentPlan === 'pro' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Business Plan */}
        <div className={`p-6 rounded-2xl border transition-all ${
          currentPlan === 'business' 
            ? 'bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-md' 
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900">Business Enterprise</h3>
            {currentPlan === 'business' && (
              <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-200">Current</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">$25 <span className="text-xs font-normal text-slate-500">/ seat / month</span></div>
          <p className="text-xs text-slate-500 mb-6">Advanced governance, immutable audit logging, and custom roles.</p>

          <ul className="space-y-3 text-xs text-slate-600 mb-6">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Everything in Pro tier</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Custom RBAC/PBAC role builder</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Immutable audit logging engine</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Super Admin multi-tenant controls</li>
          </ul>

          <button
            onClick={() => {
              setSelectedPlanForUpgrade('business');
              setIsCheckoutOpen(true);
            }}
            disabled={currentPlan === 'business'}
            className={`w-full py-2.5 text-xs font-semibold rounded-lg transition ${
              currentPlan === 'business' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
            }`}
          >
            {currentPlan === 'business' ? 'Current Plan' : 'Upgrade to Business'}
          </button>
        </div>
      </div>

      {/* Billing Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Simulated Payment History</h3>
          </div>
          <span className="text-xs text-slate-500">{invoices.length} transactions recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Card</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 uppercase font-bold text-indigo-600">{inv.planKey}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">${(inv.amountCents / 100).toFixed(2)} USD</td>
                  <td className="py-3 px-4">{inv.paymentMethod.brand} *{inv.paymentMethod.last4}</td>
                  <td className="py-3 px-4">
                    {inv.status === 'simulated_success' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-red-200">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`http://localhost:5000/api/v1/billing/invoices/${inv.invoiceNumber}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Simulated Checkout</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold uppercase">
                {selectedPlanForUpgrade} Plan
              </span>
            </div>

            {billingFeedback && (
              <div className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                billingFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {billingFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />}
                {billingFeedback.message}
              </div>
            )}

            <form onSubmit={handleSimulatedUpgrade} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated Card Number</label>
                <input 
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="4242 4242 4242 4242"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tip: End in 4242 for success, 0002 for declined payment.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration</label>
                  <input 
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVC</label>
                  <input 
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span>Plan Charge ({selectedPlanForUpgrade.toUpperCase()}):</span>
                  <span className="font-semibold text-slate-900">
                    {selectedPlanForUpgrade === 'pro' ? '$12.00 USD' : '$25.00 USD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Simulated Tax (0%):</span>
                  <span className="font-semibold text-slate-900">$0.00 USD</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confirm Simulated Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
