import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import { INDIAN_STATES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  address?: string;
  pincode?: string;
  totalPurchases: number;
  totalPaid: number;
  payables: number;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    stateCode: '27',
    pincode: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers', {
        params: {
          page,
          limit: 10,
          search: search.trim() || undefined,
        },
      });

      const res = data.data;
      setSuppliers(res.items || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      gstin: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      gstin: s.gstin || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      city: s.city || '',
      state: s.state || 'Maharashtra',
      stateCode: s.stateCode || '27',
      pincode: s.pincode || '',
    });
    setIsModalOpen(true);
  };

  const handleStateChange = (stateName: string) => {
    const found = INDIAN_STATES.find((s) => s.name === stateName);
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      stateCode: found ? found.gstCode : prev.stateCode,
    }));
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter supplier trade name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        gstin: formData.gstin ? formData.gstin.trim().toUpperCase() : undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state,
        stateCode: formData.stateCode,
        pincode: formData.pincode.trim() || undefined,
      };

      if (editingSupplier) {
        await api.patch(`/suppliers/${editingSupplier.id}`, payload);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/suppliers', payload);
        toast.success('Supplier added successfully');
      }

      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await api.delete(`/suppliers/${supplierToDelete.id}`);
      toast.success('Supplier removed');
      setDeleteConfirmOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove supplier');
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Supplier & Vendor Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your distributors, manufacturers, GSTIN details, and track pending payables.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Supplier
        </Button>
      </div>

      {/* ─── Table Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search Bar */}
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
              placeholder="Search by name, GSTIN, phone or city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <span className="text-xs text-slate-500 hidden sm:block">
            Total Suppliers: <span className="font-semibold text-slate-800">{totalItems}</span>
          </span>
        </div>

        {/* Table Content */}
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : suppliers.length === 0 ? (
          <EmptyState
            title="No suppliers yet"
            description={
              search
                ? `No suppliers match "${search}". Try a different keyword.`
                : "Add your distributors and suppliers to log purchases and track input tax credit."
            }
            actionLabel="Add Supplier"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Total Purchases</th>
                  <th className="px-4 py-3 text-right">Payables (To Pay)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => {
                  const isPending = s.payables > 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {s.city ? `${s.city}, ` : ''}{s.state || ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {s.gstin ? (
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            <strong className="text-blue-700">{s.gstin.slice(0, 2)}</strong>
                            {s.gstin.slice(2)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Unregistered</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800">{s.phone || '—'}</p>
                        {s.email && <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{s.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {formatCurrency(s.totalPurchases)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block font-bold text-xs ${
                            isPending ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          {formatCurrency(s.payables)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSupplierToDelete(s);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Supplier"
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

      {/* ─── Add/Edit Supplier Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        description="Enter supplier company details and dispatch address."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier / Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Havells India Distributor"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN (15 Characters)
              </label>
              <input
                type="text"
                maxLength={15}
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="27AABCH1234N1ZQ"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9819054321"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="orders@havellsdist.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <select
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.gstCode} value={s.name}>
                    {s.name} ({s.gstCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Gala 5, Bhiwandi Warehouse Zone"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="421302"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={saving}>
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Dialog ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Supplier"
        message={`Are you sure you want to remove "${supplierToDelete?.name}"? Historical purchase records will remain intact.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
