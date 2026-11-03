import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/subscriptions');
      const payload = res.data?.data || res.data || [];
      setSubscriptions(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="pb-2 border-b border-runway-linen">
        <h1 className="text-2xl font-semibold tracking-[-0.31px] text-runway-espresso">
          Subscriptions & Billing Ledger
        </h1>
        <p className="text-xs text-runway-bark mt-0.5">
          Active and historical SaaS subscription plans across merchant businesses.
        </p>
      </div>

      <div className="bg-runway-paper border border-runway-linen rounded-runway-card shadow-runway-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-runway-espresso">
            <thead className="bg-runway-cream text-runway-bark font-medium border-b border-runway-linen">
              <tr>
                <th className="px-5 py-3">Business (Tenant)</th>
                <th className="px-5 py-3">Plan Tier</th>
                <th className="px-5 py-3 text-right">Price (₹/mo)</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3">Start Date</th>
                <th className="px-5 py-3">Renewal / End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-runway-linen">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-runway-driftwood">
                    Reading subscription records...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-runway-driftwood">
                    No subscriptions recorded yet.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-runway-cream/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-runway-espresso">{s.business?.name}</div>
                      <div className="text-[10px] text-runway-driftwood font-mono">
                        ID: {s.business?.id}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-runway-espresso">{s.plan?.name}</span>
                      <div className="text-[10px] text-runway-driftwood">
                        Code: {s.plan?.code}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-runway-espresso">
                      {formatCurrency(s.plan?.price || 0)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-runway-badge text-[10px] font-medium font-mono ${
                          s.status === 'ACTIVE'
                            ? 'bg-runway-honey text-runway-espresso'
                            : s.status === 'TRIALING'
                            ? 'bg-runway-linen text-runway-bark'
                            : 'bg-runway-terracotta/20 text-runway-terracotta'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-runway-bark text-[11px]">
                      {formatDate(s.startDate)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-runway-bark text-[11px]">
                      {formatDate(s.endDate || s.trialEndsAt || '')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
