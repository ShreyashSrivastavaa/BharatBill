import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PAYMENT_METHODS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  ShoppingCart,
  Calendar,
} from 'lucide-react';

interface Payment {
  id: string;
  direction: 'RECEIVED' | 'MADE';
  amount: number | string;
  method: string;
  date: string;
  reference?: string;
  notes?: string;
  invoice?: { id: string; invoiceNumber: string; snapshotCustomerName?: string };
  purchase?: { id: string; purchaseNumber: string; snapshotSupplierName?: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Invoices & Purchases for linking
  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direction, setDirection] = useState<'RECEIVED' | 'MADE'>('RECEIVED');
  const [invoiceId, setInvoiceId] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments', {
        params: { page, limit: 10, search: search.trim() || undefined },
      });
      setPayments(data.data.items || []);
      setTotalItems(data.data.total || 0);
      setTotalPages(data.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    async function loadLinkable() {
      try {
        const [invRes, purRes] = await Promise.all([
          api.get('/invoices?status=FINALIZED&limit=50'),
          api.get('/purchases?limit=50'),
        ]);
        setInvoices(invRes.data.data.items || []);
        setPurchases(purRes.data.data.items || []);
      } catch (err) {
        console.error('Failed to load linkable entities', err);
      }
    }
    loadLinkable();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    if (direction === 'RECEIVED' && !invoiceId) {
      toast.error('Please select an invoice to apply this customer payment to');
      return;
    }
    if (direction === 'MADE' && !purchaseId) {
      toast.error('Please select a purchase bill to apply this supplier payment to');
      return;
    }

    setSaving(true);
    try {
      await api.post('/payments', {
        direction,
        invoiceId: direction === 'RECEIVED' ? invoiceId : undefined,
        purchaseId: direction === 'MADE' ? purchaseId : undefined,
        amount: Number(amount),
        method,
        date: paymentDate,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      toast.success('Payment recorded successfully!');
      setIsModalOpen(false);
      setAmount('');
      setReference('');
      setNotes('');
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Payments & Khata Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer payments received and supplier payouts made via UPI, Cash or Bank.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Payment
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference, invoice or party..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No payments recorded"
            description="Log received payments against customer invoices or payments made to suppliers."
            actionLabel="Record Payment"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Linked Record</th>
                  <th className="px-4 py-3">Party Name</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const isReceived = p.direction === 'RECEIVED';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isReceived
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isReceived ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> Received
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-rose-600" /> Paid
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {p.invoice ? p.invoice.invoiceNumber : p.purchase ? p.purchase.purchaseNumber : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.invoice?.snapshotCustomerName || p.purchase?.snapshotSupplierName || 'Direct Counter'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {p.method}
                        </span>
                        {p.reference && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Ref: {p.reference}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(p.date)}</td>
                      <td
                        className={`px-4 py-3 text-right font-bold text-sm ${
                          isReceived ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Payment Transaction"
        description="Records customer collection or supplier payout, automatically reconciling outstanding balance."
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setDirection('RECEIVED')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                direction === 'RECEIVED'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Payment Received (From Buyer)
            </button>
            <button
              type="button"
              onClick={() => setDirection('MADE')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                direction === 'MADE'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Payment Made (To Supplier)
            </button>
          </div>

          {direction === 'RECEIVED' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Customer Invoice *
              </label>
              <select
                value={invoiceId}
                onChange={(e) => {
                  setInvoiceId(e.target.value);
                  const inv = invoices.find((i) => i.id === e.target.value);
                  if (inv) {
                    const due = Number(inv.total) - Number(inv.amountPaid || 0);
                    if (due > 0) setAmount(String(due));
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
              >
                <option value="">Select Invoice...</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.snapshotCustomerName || 'Walk-in'} (Total: ₹{inv.total}, Paid: ₹{inv.amountPaid || 0})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Supplier Purchase *
              </label>
              <select
                value={purchaseId}
                onChange={(e) => {
                  setPurchaseId(e.target.value);
                  const pur = purchases.find((p) => p.id === e.target.value);
                  if (pur) {
                    const due = Number(pur.total) - Number(pur.amountPaid || 0);
                    if (due > 0) setAmount(String(due));
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
              >
                <option value="">Select Purchase...</option>
                {purchases.map((pur) => (
                  <option key={pur.id} value={pur.id}>
                    {pur.purchaseNumber} — {pur.snapshotSupplierName || 'Supplier'} (Total: ₹{pur.total}, Paid: ₹{pur.amountPaid || 0})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Mode
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference / Txn ID
              </label>
              <input
                type="text"
                placeholder="e.g. UPI 4302910492"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={saving}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
