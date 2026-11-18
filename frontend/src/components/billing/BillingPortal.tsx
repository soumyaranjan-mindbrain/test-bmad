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
  
  // Checkout test inputs
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

    // Success
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
    <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100">
      {/* Simulation Warning Banner */}
      <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-300 text-xs font-semibold">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
        <span>SIMULATION ENVIRONMENT: No real financial charges occur. Use test card ending in 4242 for success, 0002 for declined payment.</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Subscription & Plan Quotas</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage your organization plan tier, seat allocations, and simulated billing transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Active Tier: {currentPlan}
          </span>
        </div>
      </div>

      {/* Tier Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {/* Free Plan */}
        <div className={`p-6 rounded-2xl border transition-all ${
          currentPlan === 'free' 
            ? 'bg-slate-800/80 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg' 
            : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Free Starter</h3>
            {currentPlan === 'free' && (
              <span className="text-[10px] font-bold uppercase bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Current</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">$0 <span className="text-xs font-normal text-slate-400">/ month</span></div>
          <p className="text-xs text-slate-400 mb-6">For small engineering squads kicking off early agile sprints.</p>

          <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 5 team members</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 3 active projects</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Interactive Kanban Boards</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Manual time tracking</li>
          </ul>

          {currentPlan !== 'free' && (
            <button
              onClick={handleGracefulDowngrade}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition border border-slate-700"
            >
              Downgrade to Free
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`p-6 rounded-2xl border relative transition-all ${
          currentPlan === 'pro' 
            ? 'bg-slate-800/80 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg' 
            : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
        }`}>
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Most Popular
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Pro Team</h3>
            {currentPlan === 'pro' && (
              <span className="text-[10px] font-bold uppercase bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Current</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">$12 <span className="text-xs font-normal text-slate-400">/ seat / month</span></div>
          <p className="text-xs text-slate-400 mb-6">Designed for scale-ups needing automated time locks and real-time sync.</p>

          <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Unlimited projects & members</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Active Stopwatch Lock with live sync</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Full Calendar & Timeline views</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Subtask DFS cycle protection</li>
          </ul>

          <button
            onClick={() => {
              setSelectedPlanForUpgrade('pro');
              setIsCheckoutOpen(true);
            }}
            disabled={currentPlan === 'pro'}
            className={`w-full py-2 text-xs font-semibold rounded-lg transition ${
              currentPlan === 'pro' 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
            }`}
          >
            {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Business Plan */}
        <div className={`p-6 rounded-2xl border transition-all ${
          currentPlan === 'business' 
            ? 'bg-slate-800/80 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg' 
            : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Business Enterprise</h3>
            {currentPlan === 'business' && (
              <span className="text-[10px] font-bold uppercase bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Current</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">$25 <span className="text-xs font-normal text-slate-400">/ seat / month</span></div>
          <p className="text-xs text-slate-400 mb-6">Advanced governance, immutable audit logging, and custom roles.</p>

          <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Everything in Pro tier</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Custom RBAC/PBAC role builder</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Immutable audit logging engine</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-400" /> Super Admin multi-tenant controls</li>
          </ul>

          <button
            onClick={() => {
              setSelectedPlanForUpgrade('business');
              setIsCheckoutOpen(true);
            }}
            disabled={currentPlan === 'business'}
            className={`w-full py-2 text-xs font-semibold rounded-lg transition ${
              currentPlan === 'business' 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
            }`}
          >
            {currentPlan === 'business' ? 'Current Plan' : 'Upgrade to Business'}
          </button>
        </div>
      </div>

      {/* Billing Invoices Table */}
      <div className="mt-8 bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Simulated Payment History</h3>
          </div>
          <span className="text-xs text-slate-400">{invoices.length} transactions recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
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
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-medium text-white">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 uppercase font-semibold text-indigo-400">{inv.planKey}</td>
                  <td className="py-3 px-4 font-semibold text-white">${(inv.amountCents / 100).toFixed(2)} USD</td>
                  <td className="py-3 px-4">{inv.paymentMethod.brand} *{inv.paymentMethod.last4}</td>
                  <td className="py-3 px-4">
                    {inv.status === 'simulated_success' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[11px] font-semibold border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`http://localhost:5000/api/v1/billing/invoices/${inv.invoiceNumber}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Simulated Checkout</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                {selectedPlanForUpgrade} Plan
              </span>
            </div>

            {billingFeedback && (
              <div className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                billingFeedback.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-300 border border-red-500/30'
              }`}>
                {billingFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {billingFeedback.message}
              </div>
            )}

            <form onSubmit={handleSimulatedUpgrade} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Simulated Card Number</label>
                <input 
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="4242 4242 4242 4242"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tip: End in 4242 for success, 0002 for declined.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expiration</label>
                  <input 
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CVC</label>
                  <input 
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between mb-1">
                  <span>Plan Charge ({selectedPlanForUpgrade.toUpperCase()}):</span>
                  <span className="font-semibold text-white">
                    {selectedPlanForUpgrade === 'pro' ? '$12.00 USD' : '$25.00 USD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Simulated Tax (0%):</span>
                  <span className="font-semibold text-white">$0.00 USD</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
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
