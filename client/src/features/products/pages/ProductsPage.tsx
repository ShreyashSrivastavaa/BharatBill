import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import { PRODUCT_UNITS, GST_RATES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  hsn?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  unit: string;
  purchasePrice: number | string;
  sellingPrice: number | string;
  gstRate: number | string;
  currentStock: number | string;
  lowStockThreshold: number | string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [tab, setTab] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [counts, setCounts] = useState({ all: 0, lowStock: 0, outOfStock: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    hsn: '',
    categoryId: '',
    unit: 'PCS',
    purchasePrice: '',
    sellingPrice: '',
    gstRate: '18',
    openingStock: '0',
    lowStockThreshold: '10',
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/products/categories');
      setCategories(data.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: {
          page,
          limit: 10,
          tab,
          search: search.trim() || undefined,
          categoryId: selectedCategory || undefined,
        },
      });

      const res = data.data;
      setProducts(res.items || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 1);
      if (res.counts) {
        setCounts(res.counts);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, tab, search, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      hsn: '',
      categoryId: categories[0]?.id || '',
      unit: 'PCS',
      purchasePrice: '',
      sellingPrice: '',
      gstRate: '18',
      openingStock: '0',
      lowStockThreshold: '10',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku || '',
      hsn: p.hsn || '',
      categoryId: p.categoryId || '',
      unit: p.unit || 'PCS',
      purchasePrice: String(p.purchasePrice),
      sellingPrice: String(p.sellingPrice),
      gstRate: String(p.gstRate),
      openingStock: String(p.currentStock),
      lowStockThreshold: String(p.lowStockThreshold),
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice || !formData.purchasePrice) {
      toast.error('Please fill in product name and pricing');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        hsn: formData.hsn.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        unit: formData.unit,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        gstRate: Number(formData.gstRate),
        openingStock: Number(formData.openingStock || 0),
        lowStockThreshold: Number(formData.lowStockThreshold || 10),
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product added successfully');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      toast.success('Product archived');
      setDeleteConfirmOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to archive product');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const { data } = await api.post('/products/categories', { name: newCatName.trim() });
      toast.success('Category created');
      setCategories((prev) => [...prev, data.data]);
      setFormData((prev) => ({ ...prev, categoryId: data.data.id }));
      setNewCatName('');
      setIsCatModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Products & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your items, HSN tax classifications, stock balances and purchase costs.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Button>
      </div>

      {/* ─── Tabs & Filters Card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Top bar with Tabs + Search + Category Filter */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTab('all');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                tab === 'all'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>All Products</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => {
                setTab('low_stock');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                tab === 'low_stock'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Low Stock</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {counts.lowStock}
              </span>
            </button>

            <button
              onClick={() => {
                setTab('out_of_stock');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                tab === 'out_of_stock'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Out of Stock</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {counts.outOfStock}
              </span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, SKU, HSN..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── Table ───────────────────────────────────────────────────────────── */}
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              search
                ? `No items match "${search}". Try adjusting your filters.`
                : "You haven't added any products yet. Add your inventory items to get started."
            }
            actionLabel="Add Product"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">HSN</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-right">Purchase ₹</th>
                  <th className="px-4 py-3 text-right">Selling ₹</th>
                  <th className="px-4 py-3 text-center">GST %</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const stock = Number(p.currentStock);
                  const threshold = Number(p.lowStockThreshold);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        {p.category && (
                          <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {p.category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.sku || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.hsn || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            stock <= 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : stock <= threshold
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {stock <= threshold && <AlertTriangle className="w-3 h-3" />}
                          {stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatCurrency(p.purchasePrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[10px]">
                          {p.gstRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(p);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Archive Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* ─── Add/Edit Product Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        description="Enter product details, pricing, HSN and GST tax parameters."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Havells 2.5 Sq mm Wire (Red)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU / Item Code
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="HAV-WIR-25"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HSN / SAC Code
              </label>
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                placeholder="8544"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
              >
                {PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="120.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="160.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate (%)</label>
              <select
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
              >
                {GST_RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}% GST
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {editingProduct ? 'Current Stock' : 'Opening Stock'}
              </label>
              <input
                type="number"
                step="0.001"
                disabled={Boolean(editingProduct)}
                value={formData.openingStock}
                onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low Stock Warning Level
              </label>
              <input
                type="number"
                step="1"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={saving}>
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Inline Add Category Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Product Category"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Cables & Wires"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Archive Confirmation Dialog ─────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleArchive}
        title="Archive Product"
        message={`Are you sure you want to archive "${productToDelete?.name}"? It will no longer appear in new invoices, but historical records will be preserved.`}
        confirmLabel="Archive"
        variant="danger"
      />
    </div>
  );
}
