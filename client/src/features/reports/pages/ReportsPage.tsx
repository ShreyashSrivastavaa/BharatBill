import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useBusinessStore } from '@/stores/businessStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  FileText,
  Download,
  IndianRupee,
  TrendingUp,
  Receipt,
  Users,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface GstReportData {
  b2b?: {
    count: number;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
  b2c?: {
    count: number;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
  hsnSummary?: Array<{
    hsnCode: string;
    description: string;
    quantity: number;
    unit: string;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  }>;
  totalTaxLiability?: number;
  outwardSupply?: {
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    totalInvoiceValue: number;
  };
  inputTaxCredit?: {
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    totalPurchaseValue: number;
  };
  netGstPayable?: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
}

export default function ReportsPage() {
  const { currentBusiness } = useBusinessStore();
  const [activeTab, setActiveTab] = useState<'gst' | 'sales'>('gst');
  const [loading, setLoading] = useState(false);
  const [gstData, setGstData] = useState<GstReportData | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    if (currentBusiness) {
      loadReport();
    }
  }, [currentBusiness, activeTab]);

  const loadReport = async () => {
    try {
      setLoading(true);
      if (activeTab === 'gst') {
        const res = await api.get('/reports/gst');
        const payload = res.data?.data || res.data || {};
        setGstData(payload);
      } else if (activeTab === 'sales') {
        const res = await api.get('/invoices?pageSize=50');
        const items = res.data?.data?.items || res.data?.items || [];
        setSalesData(items);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadSalesCsv = () => {
    if (!currentBusiness) return;
    window.open(`/api/v1/reports/export/sales`, '_blank');
  };

  const b2b = gstData?.b2b || { count: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
  const b2c = gstData?.b2c || { count: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
  const hsnSummary = gstData?.hsnSummary || [];
  const totalTaxLiability = gstData?.totalTaxLiability ?? (b2b.cgst + b2b.sgst + b2b.igst + b2c.cgst + b2c.sgst + b2c.igst);

  return (
    <div className="space-y-6">
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            GST & Business Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GSTR-1 compliant sales breakup, HSN summary, and data export for chartered accountants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadSalesCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Sales (CSV)
          </button>
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('gst')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'gst'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          GST Summary (GSTR-1 Ready)
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'sales'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Sales Register
        </button>
      </div>

      {/* ─── GST Summary Tab ────────────────────────────────────────── */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Computing GST liabilities...</div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      B2B Invoices (Registered)
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {b2b.count} bills
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(b2b.taxable)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tax: {formatCurrency(b2b.cgst + b2b.sgst + b2b.igst)}
                  </p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      B2C Invoices (Retail/Consumer)
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                      {b2c.count} bills
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(b2c.taxable)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tax: {formatCurrency(b2c.cgst + b2c.sgst + b2c.igst)}
                  </p>
                </div>

                <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Total GST Liability
                  </span>
                  <p className="mt-2 text-2xl font-bold text-blue-900">
                    {formatCurrency(totalTaxLiability)}
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    Net Output Tax to be filed
                  </p>
                </div>
              </div>

              {/* HSN Summary Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      HSN / SAC Summary (Section 12 of GSTR-1)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Required table for CA return filing
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">HSN Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-right">Qty / Unit</th>
                        <th className="px-4 py-3 text-right">Taxable Value</th>
                        <th className="px-4 py-3 text-right">CGST</th>
                        <th className="px-4 py-3 text-right">SGST</th>
                        <th className="px-4 py-3 text-right">IGST</th>
                        <th className="px-4 py-3 text-right">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {hsnSummary.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                            No finalized invoice items recorded in this period.
                          </td>
                        </tr>
                      ) : (
                        hsnSummary.map((hsn, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono font-medium text-slate-900">
                              {hsn.hsnCode}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {hsn.description}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {hsn.quantity} {hsn.unit}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-medium">
                              {formatCurrency(hsn.taxableValue)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-600">
                              {formatCurrency(hsn.cgst)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-600">
                              {formatCurrency(hsn.sgst)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-600">
                              {formatCurrency(hsn.igst)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                              {formatCurrency(hsn.totalTax)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Sales Register Tab ─────────────────────────────────────── */}
      {activeTab === 'sales' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Sales Register</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit list of all invoices with GST breakups
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3 text-right">Taxable</th>
                  <th className="px-4 py-3 text-right">CGST</th>
                  <th className="px-4 py-3 text-right">SGST</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No sales records found.
                    </td>
                  </tr>
                ) : (
                  salesData.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(inv.date)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {inv.customer?.name || 'Walk-in'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {inv.customer?.gstin || 'Unregistered'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(inv.taxableAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {formatCurrency(inv.cgst)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {formatCurrency(inv.sgst)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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
      )}
    </div>
  );
}
