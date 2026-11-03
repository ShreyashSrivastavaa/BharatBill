import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { Search, Building2 } from 'lucide-react';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBusinesses();
  }, [search]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/businesses?search=${encodeURIComponent(search)}`);
      const payload = res.data?.data || res.data || {};
      setBusinesses(payload.items || []);
      setTotal(payload.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load businesses', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* ─── Header & Search ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-runway-linen">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.31px] text-runway-espresso">
            All Businesses & Tenants
          </h1>
          <p className="text-xs text-runway-bark mt-0.5">
            Directory of all registered Indian merchant accounts ({total} total).
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-runway-driftwood absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search business, GSTIN, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-runway-paper border border-runway-linen rounded-runway-btn text-xs text-runway-espresso placeholder-runway-driftwood focus:outline-none focus:border-runway-espresso shadow-runway-sm"
          />
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────────────────── */}
      <div className="bg-runway-paper border border-runway-linen rounded-runway-card shadow-runway-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-runway-espresso">
            <thead className="bg-runway-cream text-runway-bark font-medium border-b border-runway-linen">
              <tr>
                <th className="px-5 py-3">Business Name</th>
                <th className="px-5 py-3">Owner Details</th>
                <th className="px-5 py-3">Location / State</th>
                <th className="px-5 py-3">GSTIN</th>
                <th className="px-5 py-3 text-center">Plan Tier</th>
                <th className="px-5 py-3 text-center">Activity</th>
                <th className="px-5 py-3 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-runway-linen">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-runway-driftwood">
                    Reading ledger entries...
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-runway-driftwood">
                    No businesses matching search criteria.
                  </td>
                </tr>
              ) : (
                businesses.map((b) => {
                  const owner = b.members?.find((m: any) => m.role === 'OWNER')?.user;
                  const currentPlan = b.subscriptions?.[0]?.plan?.name || 'Trial Starter';
                  const subStatus = b.subscriptions?.[0]?.status || 'ACTIVE';

                  return (
                    <tr key={b.id} className="hover:bg-runway-cream/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-runway-espresso">{b.name}</div>
                        {b.legalName && (
                          <div className="text-[11px] text-runway-bark">{b.legalName}</div>
                        )}
                        <div className="text-[10px] text-runway-driftwood font-mono mt-0.5">
                          ID: {b.id}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-runway-espresso">
                          {owner?.name || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-runway-bark font-mono">
                          {owner?.email || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>{b.city || '—'}</div>
                        <div className="text-[11px] text-runway-bark font-medium">
                          {b.state} ({b.stateCode})
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-runway-espresso">
                        {b.gstin ? (
                          <span className="font-medium">{b.gstin}</span>
                        ) : (
                          <span className="text-runway-driftwood">Unregistered</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-runway-badge text-[10px] font-medium bg-runway-honey text-runway-espresso">
                          {currentPlan}
                        </span>
                        <div className="text-[9px] text-runway-driftwood uppercase mt-0.5 font-mono">
                          {subStatus}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="text-[11px] font-medium text-runway-espresso">
                          {b._count?.invoices || 0} Invoices
                        </div>
                        <div className="text-[10px] text-runway-driftwood">
                          {b._count?.products || 0} Products
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-runway-driftwood text-[11px]">
                        {formatDate(b.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
