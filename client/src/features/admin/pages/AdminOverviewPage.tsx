import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  Users,
  Building2,
  FileText,
  IndianRupee,
  CreditCard,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin platform stats', err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {
    totalUsers: 0,
    totalBusinesses: 0,
    totalInvoices: 0,
    totalPurchases: 0,
    totalPayments: 0,
    totalGrossRevenue: 0,
    totalGstCollected: 0,
    activeSubscriptionsCount: 0,
  };

  return (
    <div className="space-y-8 max-w-[1200px]">
      {/* ─── Page Title Stack ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-runway-linen">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-runway-badge text-[12px] font-medium bg-runway-honey text-runway-espresso">
              Platform Master Ledger
            </span>
            <span className="text-xs text-runway-driftwood">•</span>
            <span className="text-xs text-runway-driftwood">Live System Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.61px] text-runway-espresso">
            Executive Summary
          </h1>
          <p className="text-xs sm:text-sm text-runway-bark mt-1">
            Kraft paper ledger under amber desk lamp. Full-fidelity aggregate data across all registered Indian merchants.
          </p>
        </div>

        {/* Amber CTA Button */}
        <button
          onClick={loadStats}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-runway-amber hover:bg-runway-gold text-runway-espresso text-xs font-medium rounded-runway-btn transition shadow-runway-cta disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 stroke-[2] ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Reading Ledger...' : 'Refresh Numbers'}</span>
        </button>
      </div>

      {/* ─── Metric Tiles (Pure Paper on Cream) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Platform Users */}
        <div className="bg-runway-paper rounded-runway-card border border-runway-linen p-6 shadow-runway-sm">
          <div className="flex items-center justify-between text-runway-driftwood text-xs">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-runway-espresso stroke-[1.5]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold tracking-tight text-runway-espresso font-mono">
              {kpis.totalUsers}
            </div>
            <div className="mt-1 text-xs text-runway-bark flex items-center gap-1">
              <span className="text-runway-terracotta font-medium">Registered</span>
              <span>across platform</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Businesses */}
        <div className="bg-runway-paper rounded-runway-card border border-runway-linen p-6 shadow-runway-sm">
          <div className="flex items-center justify-between text-runway-driftwood text-xs">
            <span>Active Tenants</span>
            <Building2 className="w-4 h-4 text-runway-espresso stroke-[1.5]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold tracking-tight text-runway-espresso font-mono">
              {kpis.totalBusinesses}
            </div>
            <div className="mt-1 text-xs text-runway-bark">
              Shops, traders & firms
            </div>
          </div>
        </div>

        {/* Metric 3: Total Platform GMV */}
        <div className="bg-runway-paper rounded-runway-card border border-runway-linen p-6 shadow-runway-sm">
          <div className="flex items-center justify-between text-runway-driftwood text-xs">
            <span>Platform Billing GMV</span>
            <IndianRupee className="w-4 h-4 text-runway-espresso stroke-[1.5]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold tracking-tight text-runway-espresso font-mono">
              {formatCurrency(kpis.totalGrossRevenue)}
            </div>
            <div className="mt-1 text-xs text-runway-bark">
              Invoiced turnover
            </div>
          </div>
        </div>

        {/* Metric 4: Active Subscriptions */}
        <div className="bg-runway-paper rounded-runway-card border border-runway-linen p-6 shadow-runway-sm">
          <div className="flex items-center justify-between text-runway-driftwood text-xs">
            <span>SaaS Subscriptions</span>
            <CreditCard className="w-4 h-4 text-runway-espresso stroke-[1.5]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold tracking-tight text-runway-espresso font-mono">
              {kpis.activeSubscriptionsCount}
            </div>
            <div className="mt-1 text-xs text-runway-bark">
              Active & trialing plans
            </div>
          </div>
        </div>
      </div>

      {/* ─── Two Side-by-Side Dashboard Cards ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Businesses */}
        <div className="bg-runway-paper rounded-runway-card border border-runway-linen p-6 shadow-runway-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-runway-linen">
              <div>
                <h3 className="font-semibold text-sm text-runway-espresso">
                  Recently Onboarded Businesses
                </h3>
                <p className="text-xs text-runway-driftwood">Latest verified merchant tenants</p>
              </div>
              <Link
                to="/admin/businesses"
                className="text-xs font-medium text-runway-espresso hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.recentBusinesses || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-runway-driftwood">
                  No businesses recorded yet.
                </div>
              ) : (
                data?.recentBusinesses.map((b: any) => {
                  const owner = b.members?.find((m: any) => m.role === 'OWNER')?.user;
                  const plan = b.subscriptions?.[0]?.plan?.name || 'Starter (Trial)';

                  return (
                    <div
                      key={b.id}
                      className="p-3 bg-runway-cream/60 rounded-runway-card border border-runway-stone flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-runway-espresso">
                          {b.name}
                        </div>
                        <div className="text-[11px] text-runway-bark">
                          Owner: {owner?.name || 'Unknown'} • {owner?.email || '—'}
                        </div>
                        <div className="text-[10px] text-runway-driftwood font-mono mt-0.5">
                          GSTIN: {b.gstin || 'Unregistered'} • {b.state}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-runway-badge text-[10px] font-medium bg-runway-honey text-runway-espresso">
                          {plan}
                        </span>
                        <div className="text-[10px] text-runway-driftwood mt-1">
                          {b._count?.invoices || 0} bills
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="bg-runway-paper rounded-runway-card border border-runway-linen p-6 shadow-runway-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-runway-linen">
              <div>
                <h3 className="font-semibold text-sm text-runway-espresso">
                  Recently Registered Users
                </h3>
                <p className="text-xs text-runway-driftwood">Direct subscriber registrations</p>
              </div>
              <Link
                to="/admin/users"
                className="text-xs font-medium text-runway-espresso hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.recentUsers || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-runway-driftwood">
                  No users recorded yet.
                </div>
              ) : (
                data?.recentUsers.map((u: any) => (
                  <div
                    key={u.id}
                    className="p-3 bg-runway-cream/60 rounded-runway-card border border-runway-stone flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-runway-espresso">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-runway-bark font-mono">
                        {u.email}
                      </div>
                      <div className="text-[10px] text-runway-driftwood mt-0.5">
                        {u.memberships?.length || 0} business membership(s)
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-runway-driftwood">
                      {formatDate(u.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
