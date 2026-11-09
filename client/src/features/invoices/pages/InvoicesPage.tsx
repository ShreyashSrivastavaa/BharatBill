import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Printer,
  Download,
  Ban,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  financialYear: string;
  date: string;
  dueDate?: string;
  status: 'DRAFT' | 'FINALIZED' | 'CANCELLED';
  subtotal: number | string;
  discountAmount: number | string;
  taxableAmount: number | string;
  cgst: number | string;
  sgst: number | string;
  igst: number | string;
  roundOff: number | string;
  total: number | string;
  amountPaid: number | string;
  snapshotBusinessName?: string;
  snapshotBusinessGstin?: string;
  snapshotBusinessAddress?: string;
  snapshotBusinessState?: string;
  snapshotBusinessStateCode?: string;
  snapshotCustomerName?: string;
  snapshotCustomerGstin?: string;
  snapshotCustomerAddress?: string;
  customer?: { id: string; name: string; city?: string; gstin?: string };
  items?: any[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusTab, setStatusTab] = useState<'ALL' | 'FINALIZED' | 'DRAFT' | 'CANCELLED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // View / Print Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Cancel Confirmation
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/invoices', {
        params: {
          page,
          limit: 10,
          search: search.trim() || undefined,
          status: statusTab === 'ALL' ? undefined : statusTab,
        },
      });

      const res = data.data;
      setInvoices(res.items || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, search]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleViewInvoice = async (inv: Invoice) => {
    setViewLoading(true);
    try {
      const { data } = await api.get(`/invoices/${inv.id}`);
      setSelectedInvoice(data.data);
    } catch (err) {
      toast.error('Failed to load invoice details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoiceToCancel) return;
    try {
      await api.post(`/invoices/${invoiceToCancel.id}/cancel`);
      toast.success('Invoice cancelled and inventory restored');
      setCancelConfirmOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber || 'invoice'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice PDF downloaded');
    } catch (err: any) {
      toast.error('Failed to download invoice PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            GST Tax Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, finalize, search, print, and track sales invoices.
          </p>
        </div>

        <Link to="/app/invoices/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* ─── Table Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Top Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5">
            {(['ALL', 'FINALIZED', 'DRAFT', 'CANCELLED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusTab(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusTab === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'ALL' ? 'All Invoices' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by invoice no or customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description={
              search
                ? `No invoices match "${search}". Try adjusting your search query.`
                : "Generate your first GST invoice to get started."
            }
            actionLabel="Create Invoice"
            onAction={() => window.location.assign('/app/invoices/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Taxable ₹</th>
                  <th className="px-4 py-3 text-right">Total ₹</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {inv.snapshotCustomerName || inv.customer?.name || 'Walk-in Customer'}
                      </p>
                      {inv.snapshotCustomerGstin && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          {inv.snapshotCustomerGstin}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(inv.taxableAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'FINALIZED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'DRAFT'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View & Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {inv.status === 'FINALIZED' && (
                          <button
                            onClick={() => {
                              setInvoiceToCancel(inv);
                              setCancelConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Invoice"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* ─── Printable Indian GST Tax Invoice View Modal ─────────────────────── */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          description={`Issued on ${formatDate(selectedInvoice.date)} • GST Tax Invoice Format`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Top Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedInvoice.status === 'FINALIZED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedInvoice.status === 'DRAFT'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Status: {selectedInvoice.status}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePrint}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print
                </Button>
                {selectedInvoice.status === 'FINALIZED' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setInvoiceToCancel(selectedInvoice);
                      setCancelConfirmOpen(true);
                    }}
                    leftIcon={<Ban className="w-4 h-4" />}
                  >
                    Cancel Invoice
                  </Button>
                )}
              </div>
            </div>

            {/* Printable Tax Invoice Paper Box */}
            <div className="p-6 bg-white border border-slate-300 rounded-2xl shadow-inner text-xs space-y-4 print:p-0 print:border-none">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedInvoice.snapshotBusinessName || 'Sharma Traders'}
                  </h2>
                  <p className="text-slate-600">
                    {selectedInvoice.snapshotBusinessAddress || 'Shop 12, APMC Market, Vashi'}
                  </p>
                  <p className="font-semibold text-slate-800">
                    GSTIN:{' '}
                    <span className="font-mono text-blue-700">
                      {selectedInvoice.snapshotBusinessGstin || '27AADCB2230M1Z2'}
                    </span>{' '}
                    • State Code: {selectedInvoice.snapshotBusinessStateCode || '27'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded text-xs uppercase tracking-wider block mb-1">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-slate-500">Date: {formatDate(selectedInvoice.date)}</p>
                  {selectedInvoice.dueDate && (
                    <p className="text-slate-500">Due: {formatDate(selectedInvoice.dueDate)}</p>
                  )}
                </div>
              </div>

              {/* Billed To */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Billed To / Buyer Details:
                </p>
                <p className="font-bold text-slate-900">
                  {selectedInvoice.snapshotCustomerName || selectedInvoice.customer?.name || 'Walk-in Customer'}
                </p>
                <p className="text-slate-600">
                  {selectedInvoice.snapshotCustomerAddress || (selectedInvoice.customer as any)?.billingAddress || 'Local Counter Delivery'}
                </p>
                <p className="font-semibold text-slate-700">
                  Buyer GSTIN:{' '}
                  <span className="font-mono">
                    {selectedInvoice.snapshotCustomerGstin || selectedInvoice.customer?.gstin || 'Unregistered'}
                  </span>
                </p>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                    <tr>
                      <th className="p-2 w-8">#</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 w-16">HSN</th>
                      <th className="p-2 w-16 text-center">Qty</th>
                      <th className="p-2 w-20 text-right">Rate</th>
                      <th className="p-2 w-16 text-center">GST %</th>
                      <th className="p-2 w-24 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items?.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 text-slate-400 font-bold">{i + 1}</td>
                        <td className="p-2 font-medium text-slate-900">{it.productName}</td>
                        <td className="p-2 font-mono text-slate-500">{it.hsn || '—'}</td>
                        <td className="p-2 text-center font-bold">
                          {Number(it.quantity)} {it.unit}
                        </td>
                        <td className="p-2 text-right">{formatCurrency(it.rate)}</td>
                        <td className="p-2 text-center">{it.gstRate}%</td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {formatCurrency(it.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount:</span>
                    <span>{formatCurrency(selectedInvoice.taxableAmount)}</span>
                  </div>
                  {Number(selectedInvoice.cgst) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>CGST:</span>
                      <span>{formatCurrency(selectedInvoice.cgst)}</span>
                    </div>
                  )}
                  {Number(selectedInvoice.sgst) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>SGST:</span>
                      <span>{formatCurrency(selectedInvoice.sgst)}</span>
                    </div>
                  )}
                  {Number(selectedInvoice.igst) > 0 && (
                    <div className="flex justify-between text-blue-700 font-semibold">
                      <span>IGST:</span>
                      <span>{formatCurrency(selectedInvoice.igst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Cancel Confirmation Dialog ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleCancelInvoice}
        title="Cancel Invoice"
        message={`Are you sure you want to cancel invoice "${invoiceToCancel?.invoiceNumber}"? This action will reverse stock deductions and permanently mark the invoice as CANCELLED.`}
        confirmLabel="Yes, Cancel Invoice"
        variant="danger"
      />
    </div>
  );
}
