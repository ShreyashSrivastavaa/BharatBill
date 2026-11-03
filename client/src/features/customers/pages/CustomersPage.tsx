import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { INDIAN_STATES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  FileText,
  CreditCard,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  billingAddress?: string;
  pincode?: string;
  totalSales: number;
  totalPaid: number;
  outstanding: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Ledger / Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerDetails, setLedgerDetails] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    phone: '',
    email: '',
    billingAddress: '',
    city: '',
    state: 'Maharashtra',
    stateCode: '27',
    pincode: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', {
        params: {
          page,
          limit: 10,
          search: search.trim() || undefined,
        },
      });

      const res = data.data;
      setCustomers(res.items || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      gstin: '',
      phone: '',
      email: '',
      billingAddress: '',
      city: '',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      gstin: c.gstin || '',
      phone: c.phone || '',
      email: c.email || '',
      billingAddress: c.billingAddress || '',
      city: c.city || '',
      state: c.state || 'Maharashtra',
      stateCode: c.stateCode || '27',
      pincode: c.pincode || '',
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

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        gstin: formData.gstin ? formData.gstin.trim().toUpperCase() : undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        billingAddress: formData.billingAddress.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state,
        stateCode: formData.stateCode,
        pincode: formData.pincode.trim() || undefined,
      };

      if (editingCustomer) {
        await api.patch(`/customers/${editingCustomer.id}`, payload);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', payload);
        toast.success('Customer added successfully');
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await api.delete(`/customers/${customerToDelete.id}`);
      toast.success('Customer removed');
      setDeleteConfirmOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleViewLedger = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setLedgerLoading(true);
    try {
      const { data } = await api.get(`/customers/${cust.id}`);
      setLedgerDetails(data.data);
    } catch (err) {
      toast.error('Failed to load customer ledger');
    } finally {
      setLedgerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your buyers, party GSTINs, billing addresses, and track outstanding receivables.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Customer
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
            Total Customers: <span className="font-semibold text-slate-800">{totalItems}</span>
          </span>
        </div>

        {/* Table Content */}
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers yet"
            description={
              search
                ? `No customers match "${search}". Try a different keyword.`
                : "Add your regular clients and buyers so you can issue GST invoices in seconds."
            }
            actionLabel="Add Customer"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Total Sales</th>
                  <th className="px-4 py-3 text-right">Outstanding (Due)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const isDue = c.outstanding > 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewLedger(c)}
                          className="text-left group font-semibold text-slate-900 hover:text-blue-600"
                        >
                          <p className="group-hover:underline">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {c.city ? `${c.city}, ` : ''}{c.state || ''}
                          </p>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {c.gstin ? (
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            <strong className="text-blue-700">{c.gstin.slice(0, 2)}</strong>
                            {c.gstin.slice(2)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Unregistered</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800">{c.phone || '—'}</p>
                        {c.email && <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{c.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {formatCurrency(c.totalSales)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block font-bold text-xs ${
                            isDue ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {formatCurrency(c.outstanding)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewLedger(c)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Ledger & Invoices"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setCustomerToDelete(c);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Customer"
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

      {/* ─── Add/Edit Customer Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        description="Enter customer trade details and billing tax address."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer / Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Metro Electronics & Appliances"
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
                placeholder="27AABCM8821N1Z5"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9822012345"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="billing@metroelectronics.com"
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
                placeholder="Pune"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
              <textarea
                rows={2}
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                placeholder="Shop No. 4, MG Road, Camp"
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
                placeholder="411001"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={saving}>
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Customer Ledger Details Modal ───────────────────────────────────── */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={selectedCustomer.name}
          description="Customer profile, recent invoice history & outstanding udhaar summary."
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Quick summary stats */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Invoiced</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {formatCurrency(ledgerDetails?.totalSales ?? selectedCustomer.totalSales)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Payments Received</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">
                  {formatCurrency(ledgerDetails?.totalPaid ?? selectedCustomer.totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Outstanding Due</p>
                <p
                  className={`text-base font-bold mt-0.5 ${
                    (ledgerDetails?.outstanding ?? selectedCustomer.outstanding) > 0
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {formatCurrency(ledgerDetails?.outstanding ?? selectedCustomer.outstanding)}
                </p>
              </div>
            </div>

            {/* Invoices List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Recent Invoices
              </h4>
              {ledgerLoading ? (
                <p className="text-xs text-slate-400 py-4 text-center">Loading ledger records...</p>
              ) : !ledgerDetails?.invoices || ledgerDetails.invoices.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-xl border border-dashed">
                  No invoices created for this customer yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {ledgerDetails.invoices.map((inv: any) => (
                    <div key={inv.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-mono font-bold text-blue-600">{inv.invoiceNumber}</span>
                        <span className="text-slate-500 ml-3">{formatDate(inv.date)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-900">{formatCurrency(inv.total)}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'FINALIZED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Delete Confirmation Dialog ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Customer"
        message={`Are you sure you want to remove "${customerToDelete?.name}"? Historical invoices and ledgers will not be affected.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
