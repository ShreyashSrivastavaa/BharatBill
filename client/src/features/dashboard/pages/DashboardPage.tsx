import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useBusinessStore } from '@/stores/businessStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  FileText,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { currentBusiness, financialYear } = useBusinessStore();
  const [period, setPeriod] = useState('this-month');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (currentBusiness) {
      loadDashboard();
    }
  }, [currentBusiness, period]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/dashboard?period=${period}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback / default data structure if loading or zero records
  const kpis = dashboardData?.kpis || {
    totalSales: 0,
    salesChangePercent: 0,
    totalPurchases: 0,
    purchasesChangePercent: 0,
    receivables: 0,
    payables: 0,
    salesCount: 0,
    purchasesCount: 0,
    totalProducts: 0,
    lowStockCount: 0,
  };

  const chartData = dashboardData?.salesChartData?.length
    ? dashboardData.salesChartData
    : [
        { date: 'Day 1', sales: 0, purchases: 0 },
        { date: 'Day 5', sales: 0, purchases: 0 },
        { date: 'Day 10', sales: 0, purchases: 0 },
      ];

  const recentInvoices = dashboardData?.recentInvoices || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      {/* ─── Page Header with Period Filter ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Business Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview for {currentBusiness?.name || 'Your Business'} • Financial Year {financialYear}
          </p>
        </div>

        {/* Period Selector Filter */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-transparent pr-4 py-1 focus:outline-none cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
      </div>

      {/* ─── 4 Primary KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sales
            </span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {formatCurrency(kpis.totalSales)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-medium">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {kpis.salesChangePercent >= 0 ? `+${kpis.salesChangePercent}%` : `${kpis.salesChangePercent}%`}
              </span>
              <span className="text-slate-400">vs prev period</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Purchases */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Purchases
            </span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {formatCurrency(kpis.totalPurchases)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span>{kpis.purchasesCount} bills recorded</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Receivables */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Receivables (To Collect)
            </span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-emerald-700 font-mono">
              {formatCurrency(kpis.receivables)}
            </div>
            <div className="mt-1 text-xs text-slate-400">Customer balance due</div>
          </div>
        </div>

        {/* KPI 4: Payables */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Payables (To Pay)
            </span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-rose-600 font-mono">
              {formatCurrency(kpis.payables)}
            </div>
            <div className="mt-1 text-xs text-slate-400">Supplier balance due</div>
          </div>
        </div>
      </div>

      {/* ─── Sales Overview Chart + Quick Actions ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchases Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Sales & Purchase Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live turnover metrics across the period</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span className="text-slate-600">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-600">Purchases</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  labelStyle={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  name="Sales"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#purchaseGrad)"
                  name="Purchases"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Quick Actions</h2>
            <p className="text-xs text-slate-400 mb-4">Fast shortcuts for daily shop activities</p>

            <div className="space-y-2">
              <Link
                to="/app/invoices/new"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800">Create GST Invoice</div>
                    <div className="text-[11px] text-slate-400">Generate tax bill for customer</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </Link>

              <Link
                to="/app/payments"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800">Record Payment</div>
                    <div className="text-[11px] text-slate-400">Cash, UPI, or Bank entry</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/app/purchases"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800">Record Purchase</div>
                    <div className="text-[11px] text-slate-400">Add inventory bill</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </Link>

              <Link
                to="/app/products"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800">Add Product</div>
                    <div className="text-[11px] text-slate-400">Item catalog & stock</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Active Products: <strong className="text-slate-800">{kpis.totalProducts}</strong></span>
            <span>Low Stock: <strong className="text-rose-600">{kpis.lowStockCount}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── Recent Invoices & Low Stock Inventory ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Invoices</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest generated tax bills</p>
            </div>
            <Link
              to="/app/invoices"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Invoice No</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No invoices recorded yet. Click "Create GST Invoice" to begin.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3.5 font-mono font-medium text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900">
                          {inv.snapshotCustomerName || inv.customer?.name || 'Walk-in Customer'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inv.customer?.city || 'Local'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.date)}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            inv.status === 'FINALIZED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Low Stock Alerts</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                {lowStockProducts.length} items
              </span>
            </div>

            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  All inventory items are currently above their reorder thresholds.
                </div>
              ) : (
                lowStockProducts.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border border-rose-100 bg-rose-50/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">SKU: {p.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-600 font-mono">
                        {p.currentStock} {p.unit} left
                      </div>
                      <div className="text-[10px] text-slate-400">Min: {p.lowStockThreshold}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/app/products"
            className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
          >
            Manage Inventory & Reorder <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
