import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PRODUCT_UNITS, GST_RATES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Plus,
  Search,
  Truck,
  Trash2,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  city?: string;
}

interface Product {
  id: string;
  name: string;
  hsn?: string;
  unit: string;
  purchasePrice: number | string;
  gstRate: number | string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    {
      productId: '',
      productName: '',
      hsn: '',
      unit: 'PCS',
      quantity: 1,
      rate: 0,
      gstRate: 18,
    },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/purchases', {
        params: { page, limit: 10, search: search.trim() || undefined },
      });
      setPurchases(data.data.items || []);
      setTotalItems(data.data.total || 0);
      setTotalPages(data.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get('/suppliers?limit=100'),
          api.get('/products?limit=100'),
        ]);
        setSuppliers(sRes.data.data.items || []);
        setProducts(pRes.data.data.items || []);
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        productName: '',
        hsn: '',
        unit: 'PCS',
        quantity: 1,
        rate: 0,
        gstRate: 18,
      },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].productName = prod.name;
        updated[index].hsn = prod.hsn || '';
        updated[index].unit = prod.unit || 'PCS';
        updated[index].rate = Number(prod.purchasePrice);
        updated[index].gstRate = Number(prod.gstRate);
      }
    }

    setItems(updated);
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = items.filter((i) => i.productName.trim() && i.rate > 0);
    if (valid.length === 0) {
      toast.error('Please enter at least one valid item');
      return;
    }

    setSaving(true);
    try {
      await api.post('/purchases', {
        supplierId: supplierId || undefined,
        invoiceRef: invoiceRef.trim() || undefined,
        date: purchaseDate,
        notes: notes.trim() || undefined,
        items: valid.map((i) => ({
          productId: i.productId || undefined,
          productName: i.productName.trim(),
          hsn: i.hsn.trim() || undefined,
          unit: i.unit,
          quantity: Number(i.quantity),
          rate: Number(i.rate),
          gstRate: Number(i.gstRate),
        })),
      });

      toast.success('Purchase recorded & stock updated!');
      setIsModalOpen(false);
      fetchPurchases();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Supplier Purchases
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record inwards stock, track supplier invoices and input tax credits.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Record Purchase
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
              placeholder="Search purchase no, supplier or ref..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : purchases.length === 0 ? (
          <EmptyState
            title="No purchases recorded"
            description="Record your inward bills from distributors to automatically increment your inventory stock."
            actionLabel="Record Purchase"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Purchase No</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Supplier Ref</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Taxable ₹</th>
                  <th className="px-4 py-3 text-right">Total ₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">
                      {p.purchaseNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {p.snapshotSupplierName || p.supplier?.name || 'Cash Purchase'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{p.invoiceRef || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(p.taxableAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(p.total)}
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

      {/* Record Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Supplier Purchase"
        description="Records inward stock into your inventory and updates payables ledger."
        maxWidth="xl"
      >
        <form onSubmit={handleSavePurchase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
              >
                <option value="">Cash / Unregistered Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Bill / Invoice No
              </label>
              <input
                type="text"
                placeholder="e.g. HAV-9912"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase">Purchased Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="p-3 space-y-3">
              {items.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="sm:col-span-4">
                    {products.length > 0 && (
                      <select
                        value={row.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full mb-1 text-xs border rounded p-1 bg-white"
                      >
                        <option value="">Select product to auto-stock-in...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="text"
                      required
                      placeholder="Product Name"
                      value={row.productName}
                      onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                      className="w-full text-xs border rounded p-1 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full text-xs border rounded p-1 text-center font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Rate ₹"
                      value={row.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                      className="w-full text-xs border rounded p-1 text-right font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={row.gstRate}
                      onChange={(e) => handleItemChange(idx, 'gstRate', Number(e.target.value))}
                      className="w-full text-xs border rounded p-1 bg-white"
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}% GST
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={saving}>
              Record Purchase & Add Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
