import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

  // Realistic sample data for Phase 2 UI shell (wired to API in Phase 6)
  const salesChartData = [
    { date: '01 Nov', sales: 45000, purchases: 32000 },
    { date: '05 Nov', sales: 78000, purchases: 45000 },
    { date: '10 Nov', sales: 124000, purchases: 62000 },
    { date: '15 Nov', sales: 198000, purchases: 110000 },
    { date: '20 Nov', sales: 265000, purchases: 145000 },
    { date: '25 Nov', sales: 340000, purchases: 210000 },
    { date: '30 Nov', sales: 485000, purchases: 290000 },
  ];

  const recentInvoices = [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-000348',
      customerName: 'Metro Electronics & Appliances',
      city: 'Pune',
      date: new Date('2026-11-02'),
      total: 45200,
      status: 'PAID',
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-000347',
      customerName: 'Gupta Hardware Mart',
      city: 'Thane',
      date: new Date('2026-11-01'),
      total: 18500,
      status: 'PARTIAL',
    },
    {
      id: 'inv-3',
      invoiceNumber: 'INV-000346',
      customerName: 'Kalyan Traders',
      city: 'Mumbai',
      date: new Date('2026-10-31'),
      total: 82400,
      status: 'UNPAID',
    },
    {
      id: 'inv-4',
      invoiceNumber: 'INV-000345',
      customerName: 'Royal Electricals',
      city: 'Nashik',
      date: new Date('2026-10-29'),
      total: 12600,
      status: 'PAID',
    },
  ];

  const lowStockProducts = [
    { id: 'p1', name: 'Anchor Roma Switch 6A', sku: 'ELE-SW-01', stock: 4, threshold: 20, unit: 'PCS' },
    { id: 'p2', name: 'Havells 2.5 Sq mm Wire (Red)', sku: 'HAV-WIR-25', stock: 2, threshold: 10, unit: 'BOX' },
    { id: 'p3', name: 'Philips 9W LED Bulb', sku: 'PHI-LED-09', stock: 8, threshold: 25, unit: 'PCS' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header with Period Filter ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Business Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back to <span className="font-semibold text-slate-800">{currentBusiness?.name || 'Your Business'}</span> • Financial Year FY {financialYear}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-xl shadow-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="today">Today</option>
              <option value="this-month">This Month (Nov 2026)</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter (Q3)</option>
              <option value="this-fy">This Financial Year (FY 26-27)</option>
            </select>
          </div>

          <Link
            to="/app/invoices/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* ─── 4 Primary KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Sales</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-950 mt-2">
            {formatCurrency(1248500)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Purchases</span>
            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-950 mt-2">
            {formatCurrency(812300)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>42 supplier bills recorded</span>
          </div>
        </div>

        {/* Receivables (To Collect) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Receivables (To Collect)</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {formatCurrency(185400)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-amber-700 font-semibold">8 customer bills</span>
            <span>pending collection</span>
          </div>
        </div>

        {/* Payables (To Pay) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Payables (To Pay)</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {formatCurrency(94200)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>To 4 suppliers due this week</span>
          </div>
        </div>
      </div>

      {/* ─── Middle Grid: Sales Overview Chart + Quick Actions ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales & Purchase Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Daily turnover for current month</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600 font-medium">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-600 font-medium">Purchases</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#purchGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Quick Actions</h2>
            <p className="text-xs text-slate-500 mb-4">Fast shortcuts for daily counter trade</p>

            <div className="space-y-2">
              <Link
                to="/app/invoices/new"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 text-blue-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    Create Invoice
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </Link>

              <Link
                to="/app/products"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-200/70 text-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    Add New Product
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </Link>

              <Link
                to="/app/customers"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-200/70 text-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    Add Customer
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </Link>

              <Link
                to="/app/purchases"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-200/70 text-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    Record Purchase
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </Link>

              <Link
                to="/app/payments"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-200/70 text-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    Record Payment
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Press <kbd className="px-1 py-0.5 bg-slate-100 border rounded text-slate-600">Ctrl K</kbd> anytime to open quick search
            </span>
          </div>
        </div>
      </div>

      {/* ─── Bottom Grid: Recent Invoices + Low Stock Alerts ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Invoices</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest tax invoices created</p>
            </div>
            <Link
              to="/app/invoices"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View all invoices
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{inv.customerName}</p>
                      <p className="text-[10px] text-slate-400">{inv.city}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'PARTIAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/app/invoices`}
                        className="p-1 text-slate-400 hover:text-blue-600 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"
                        title="View invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Low Stock Alerts</h2>
                  <p className="text-[10px] text-slate-400">Items below minimum reorder level</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                {lowStockProducts.length} items
              </span>
            </div>

            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-bold text-rose-600">
                      {p.stock} {p.unit}
                    </p>
                    <p className="text-[10px] text-slate-500">Min: {p.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/app/products"
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Manage Inventory
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
