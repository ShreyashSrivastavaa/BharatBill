import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/invoices');
      setInvoices(res.data.items || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load global invoices', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="pb-2 border-b border-runway-linen">
        <h1 className="text-2xl font-semibold tracking-[-0.31px] text-runway-espresso">
          Global Invoices Ledger
        </h1>
        <p className="text-xs text-runway-bark mt-0.5">
          Audit journal of all GST invoices generated across the BharatBill platform ({total} total).
        </p>
      </div>

      <div className="bg-runway-paper border border-runway-linen rounded-runway-card shadow-runway-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-runway-espresso">
            <thead className="bg-runway-cream text-runway-bark font-medium border-b border-runway-linen">
              <tr>
                <th className="px-5 py-3">Invoice No</th>
                <th className="px-5 py-3">Business / Tenant</th>
                <th className="px-5 py-3">Customer Name</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Taxable</th>
                <th className="px-5 py-3 text-right">Total (₹)</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-runway-linen">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-runway-driftwood">
                    Reading invoice journal...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-runway-driftwood">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-runway-cream/50 transition">
                    <td className="px-5 py-3.5 font-mono font-semibold text-runway-espresso">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-runway-espresso">{inv.business?.name}</div>
                      <div className="text-[10px] text-runway-driftwood font-mono">
                        {inv.business?.state}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-runway-bark">
                        {inv.snapshotCustomerName || inv.customer?.name || 'Walk-in'}
                      </div>
                      <div className="text-[10px] text-runway-driftwood font-mono">
                        {inv.snapshotCustomerGstin || inv.customer?.gstin || 'Unregistered'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-runway-bark text-[11px]">
                      {formatDate(inv.date)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-runway-bark">
                      {formatCurrency(inv.taxableAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-runway-espresso">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-runway-badge text-[10px] font-medium font-mono ${
                          inv.status === 'FINALIZED'
                            ? 'bg-runway-honey text-runway-espresso'
                            : 'bg-runway-linen text-runway-bark'
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
    </div>
  );
}
