import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useBusinessStore } from '@/stores/businessStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Check, ShieldCheck, Zap, Sparkles, AlertCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: string[];
  maxInvoicesPerMonth: number | null;
  maxUsers: number;
  sortOrder: number;
}

interface CurrentSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  trialEndsAt: string | null;
  plan: Plan;
}

export default function SubscriptionPage() {
  const { currentBusiness } = useBusinessStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSubscriptionData();
  }, [currentBusiness]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.allSettled([
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/current'),
      ]);

      if (plansRes.status === 'fulfilled') {
        const val = (plansRes.value as any).data?.data || (plansRes.value as any).data || [];
        setPlans(Array.isArray(val) ? val : []);
      }
      if (subRes.status === 'fulfilled') {
        const sub = (subRes.value as any).data?.data || (subRes.value as any).data;
        setCurrentSub(sub || null);
      }
    } catch (err) {
      console.error('Failed to load subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePlan = async (plan: Plan) => {
    try {
      setCheckoutLoading(plan.id);
      setSuccessMsg('');
      const res = await api.post('/subscriptions/checkout', { planId: plan.id });
      // Gateway abstraction in test mode
      setSuccessMsg(
        `Test Gateway Checkout Initiated! Order ID: ${res.data.orderId}. In production, this opens Razorpay standard modal.`
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Subscription & Billing
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Simple, transparent pricing tailored for Indian business owners. No hidden charges.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── Active Plan Banner ──────────────────────────────────────── */}
      {currentSub && (
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
                Current Active Plan
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentSub.status}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1">{currentSub.plan.name} Plan</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Renews / Valid through: {formatDate(currentSub.endDate || currentSub.trialEndsAt || '')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{formatCurrency(currentSub.plan.price)}</span>
            <span className="text-xs text-slate-400"> / month</span>
          </div>
        </div>
      )}

      {/* ─── Plan Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-400">Loading plan details...</div>
        ) : (
          plans.map((p) => {
            const isCurrent = currentSub?.plan.id === p.id;
            const isPopular = p.code === 'BUSINESS';

            return (
              <div
                key={p.id}
                className={`relative bg-white rounded-2xl border p-6 flex flex-col justify-between transition shadow-sm ${
                  isPopular
                    ? 'border-blue-500 shadow-blue-50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatCurrency(p.price)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Features
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span>
                          {p.maxInvoicesPerMonth ? `${p.maxInvoicesPerMonth} Invoices/mo` : 'Unlimited Invoices'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span>{p.maxUsers} Business User(s)</span>
                      </li>
                      {(p.features as string[]).map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    disabled={isCurrent || checkoutLoading === p.id}
                    onClick={() => handleChoosePlan(p)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isCurrent
                      ? 'Current Plan'
                      : checkoutLoading === p.id
                      ? 'Preparing...'
                      : `Choose ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
