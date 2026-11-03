import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import { INDIAN_STATES, PRODUCT_UNITS, GST_RATES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useBusinessStore } from '@/stores/businessStore';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Building,
  Calendar,
  Receipt,
  UserPlus,
  Sparkles,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  gstin?: string;
  stateCode?: string;
  city?: string;
  billingAddress?: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  hsn?: string;
  unit: string;
  sellingPrice: number | string;
  gstRate: number | string;
}

interface InvoiceRow {
  productId?: string;
  productName: string;
  hsn: string;
  unit: string;
  quantity: number;
  rate: number;
  discount: number;
  gstRate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  amount: number;
}

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessStore();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Invoice Details
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState(currentBusiness?.stateCode || '27');
  const [notes, setNotes] = useState('Thank you for your business!');
  const [terms, setTerms] = useState('Payment is due within 15 days of invoice date.');

  // Items
  const [items, setItems] = useState<InvoiceRow[]>([
    {
      productName: '',
      hsn: '',
      unit: 'PCS',
      quantity: 1,
      rate: 0,
      discount: 0,
      gstRate: 18,
      taxableAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      amount: 0,
    },
  ]);

  // Tax Summary
  const [summary, setSummary] = useState({
    subtotal: 0,
    discountAmount: 0,
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalTax: 0,
    roundOff: 0,
    total: 0,
    isInterState: false,
  });

  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Quick Add Customer Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustState, setNewCustState] = useState('Maharashtra');

  // Load initial dropdowns
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
        ]);
        setCustomers(cRes.data.data.items || []);
        setProducts(pRes.data.data.items || []);
      } catch (err) {
        console.error('Failed to load customers/products', err);
      }
    }
    loadData();
  }, []);

  // Update customer selection
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c.id === custId);
    setSelectedCustomer(found || null);
    if (found?.stateCode) {
      setPlaceOfSupply(found.stateCode);
    }
  };

  // Authoritative live tax recalculation from backend GST service
  const recalculateTax = useCallback(
    async (currentItems: InvoiceRow[], pos: string) => {
      const validItems = currentItems.filter((i) => i.productName.trim() && i.rate > 0);
      if (validItems.length === 0) {
        setSummary({
          subtotal: 0,
          discountAmount: 0,
          taxableAmount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalTax: 0,
          roundOff: 0,
          total: 0,
          isInterState: false,
        });
        return;
      }

      try {
        const { data } = await api.post('/invoices/preview-tax', {
          customerId: selectedCustomerId || undefined,
          placeOfSupply: pos,
          items: validItems.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            hsn: i.hsn,
            unit: i.unit,
            quantity: i.quantity,
            rate: i.rate,
            discount: i.discount,
            gstRate: i.gstRate,
          })),
        });

        const res = data.data;
        setSummary({
          subtotal: res.subtotal,
          discountAmount: res.discountAmount,
          taxableAmount: res.taxableAmount,
          cgst: res.cgst,
          sgst: res.sgst,
          igst: res.igst,
          totalTax: res.totalTax,
          roundOff: res.roundOff,
          total: res.total,
          isInterState: res.isInterState,
        });

        // Update amounts on lines
        setItems((prev) =>
          prev.map((item, idx) => {
            const calculated = res.items[idx];
            if (!calculated) return item;
            return {
              ...item,
              taxableAmount: calculated.taxableAmount,
              cgst: calculated.cgst,
              sgst: calculated.sgst,
              igst: calculated.igst,
              amount: calculated.amount,
            };
          }),
        );
      } catch (err) {
        console.error('Tax preview calculation error', err);
      }
    },
    [selectedCustomerId],
  );

  useEffect(() => {
    recalculateTax(items, placeOfSupply);
  }, [placeOfSupply, recalculateTax]);

  // Handle line item changes
  const handleItemChange = (index: number, field: keyof InvoiceRow, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // If product selected from dropdown, fill defaults
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].productName = prod.name;
        updated[index].hsn = prod.hsn || '';
        updated[index].unit = prod.unit || 'PCS';
        updated[index].rate = Number(prod.sellingPrice);
        updated[index].gstRate = Number(prod.gstRate);
      }
    }

    setItems(updated);
    recalculateTax(updated, placeOfSupply);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productName: '',
        hsn: '',
        unit: 'PCS',
        quantity: 1,
        rate: 0,
        discount: 0,
        gstRate: 18,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Invoice must have at least one item row');
      return;
    }
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
    recalculateTax(filtered, placeOfSupply);
  };

  // Submit Handler
  const handleSaveInvoice = async (finalizeAfter: boolean) => {
    const validItems = items.filter((i) => i.productName.trim() && i.rate > 0);
    if (validItems.length === 0) {
      toast.error('Please enter at least one valid item with product name and rate');
      return;
    }

    if (finalizeAfter) setFinalizing(true);
    else setSaving(true);

    try {
      const payload = {
        customerId: selectedCustomerId || undefined,
        date: invoiceDate,
        dueDate: dueDate || undefined,
        placeOfSupply,
        notes,
        terms,
        items: validItems.map((i) => ({
          productId: i.productId || undefined,
          productName: i.productName.trim(),
          hsn: i.hsn.trim() || undefined,
          unit: i.unit,
          quantity: Number(i.quantity),
          rate: Number(i.rate),
          discount: Number(i.discount || 0),
          gstRate: Number(i.gstRate),
        })),
      };

      const { data } = await api.post('/invoices', payload);
      const createdInvoice = data.data;

      if (finalizeAfter) {
        const finRes = await api.post(`/invoices/${createdInvoice.id}/finalize`);
        toast.success(`🎉 Finalized Invoice ${finRes.data.data.invoiceNumber}`);
      } else {
        toast.success('Invoice saved as draft');
      }

      navigate('/app/invoices');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
      setFinalizing(false);
    }
  };

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    try {
      const stateObj = INDIAN_STATES.find((s) => s.name === newCustState);
      const { data } = await api.post('/customers', {
        name: newCustName.trim(),
        gstin: newCustGstin.trim().toUpperCase() || undefined,
        state: newCustState,
        stateCode: stateObj?.gstCode || '27',
      });
      const created = data.data;
      toast.success('Customer added');
      setCustomers((prev) => [...prev, created]);
      handleCustomerChange(created.id);
      setIsCustomerModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/app/invoices"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Create GST Tax Invoice
            </h1>
            <p className="text-xs text-slate-500">
              New invoice • Auto-sequential numbering upon finalization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleSaveInvoice(false)}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleSaveInvoice(true)}
            isLoading={finalizing}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Finalize Invoice
          </Button>
        </div>
      </div>

      {/* ─── Top Cards Grid: Customer & Invoice Details ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Customer Details
            </span>
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + New Customer
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
            >
              <option value="">Walk-in / Cash Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.city ? `(${c.city})` : ''} {c.gstin ? `— ${c.gstin}` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer ? (
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-200/60">
              <p className="font-bold text-slate-900">{selectedCustomer.name}</p>
              <p>
                GSTIN: <span className="font-mono font-semibold">{selectedCustomer.gstin || 'Unregistered'}</span>
              </p>
              <p>{selectedCustomer.billingAddress || 'No billing address specified'}</p>
            </div>
          ) : (
            <div className="p-3 bg-slate-50/50 rounded-xl text-xs text-slate-400 italic">
              Standard consumer / cash billing without registered party details.
            </div>
          )}
        </div>

        {/* Invoice Parameters Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Invoice Parameters
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Place of Supply (GST Jurisdiction)
            </label>
            <select
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s.gstCode} value={s.gstCode}>
                  {s.gstCode} — {s.name} {s.gstCode === currentBusiness?.stateCode ? '(Intra-state)' : '(Inter-state IGST)'}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              {summary.isInterState
                ? '⚡ Inter-state transaction: Integrated Tax (IGST) will be applied.'
                : '⚡ Intra-state transaction: Tax will be split equally between CGST and SGST.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Line Items Table Card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Invoice Items
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Line Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 w-8">#</th>
                <th className="px-3 py-2.5 min-w-[200px]">Product / Description</th>
                <th className="px-3 py-2.5 w-24">HSN</th>
                <th className="px-3 py-2.5 w-20">Qty</th>
                <th className="px-3 py-2.5 w-20">Unit</th>
                <th className="px-3 py-2.5 w-28">Rate (₹)</th>
                <th className="px-3 py-2.5 w-24">Disc (₹)</th>
                <th className="px-3 py-2.5 w-24">GST %</th>
                <th className="px-3 py-2.5 w-28 text-right">Amount (₹)</th>
                <th className="px-2 py-2.5 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40">
                  <td className="px-3 py-2 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {products.length > 0 && (
                        <select
                          value={row.productId || ''}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                        >
                          <option value="">Select pre-saved product or type custom...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Selling: ₹{p.sellingPrice})
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        required
                        placeholder="Item name / service description"
                        value={row.productName}
                        onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-medium border border-slate-200 rounded-lg"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="8536"
                      value={row.hsn}
                      onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={row.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      {PRODUCT_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-right font-semibold"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.discount}
                      onChange={(e) => handleItemChange(idx, 'discount', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg text-right"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.gstRate}
                      onChange={(e) => handleItemChange(idx, 'gstRate', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white text-center font-semibold text-blue-700"
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddItem}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Another Item
          </Button>
        </div>
      </div>

      {/* ─── Bottom Area: Notes & Authoritative Tax Breakdown ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Notes (Appears on Invoice PDF)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Live Tax Summary Panel */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Authoritative GST Summary
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Gross Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(summary.subtotal)}</span>
            </div>

            {summary.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Total Discount:</span>
                <span className="font-semibold">- {formatCurrency(summary.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
              <span>Taxable Amount:</span>
              <span>{formatCurrency(summary.taxableAmount)}</span>
            </div>

            {summary.isInterState ? (
              <div className="flex justify-between text-blue-700 bg-blue-50/60 p-2 rounded-lg">
                <span>Integrated Tax (IGST):</span>
                <span className="font-bold">{formatCurrency(summary.igst)}</span>
              </div>
            ) : (
              <div className="space-y-1 bg-slate-50 p-2 rounded-lg">
                <div className="flex justify-between">
                  <span>Central GST (CGST):</span>
                  <span className="font-semibold">{formatCurrency(summary.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>State GST (SGST):</span>
                  <span className="font-semibold">{formatCurrency(summary.sgst)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>Round-off Adjustment:</span>
              <span>{summary.roundOff >= 0 ? `+${summary.roundOff}` : summary.roundOff}</span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-200">
              <span className="text-base font-bold text-slate-900">Total Invoice Amount:</span>
              <span className="text-xl font-extrabold text-blue-600">
                {formatCurrency(summary.total)}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => handleSaveInvoice(true)}
              isLoading={finalizing}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Finalize Invoice
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => handleSaveInvoice(false)}
              isLoading={saving}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Inline Quick Add Customer Modal ──────────────────────────────────── */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Add Customer"
        maxWidth="sm"
      >
        <form onSubmit={handleQuickAddCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              required
              autoFocus
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="e.g. Royal Electricals"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
            <input
              type="text"
              maxLength={15}
              value={newCustGstin}
              onChange={(e) => setNewCustGstin(e.target.value.toUpperCase())}
              placeholder="27AABCR9912M1Z8"
              className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
            <select
              value={newCustState}
              onChange={(e) => setNewCustState(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s.gstCode} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
