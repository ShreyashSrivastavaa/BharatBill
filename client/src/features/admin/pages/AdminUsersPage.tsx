import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data.items || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* ─── Header & Search ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-runway-linen">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.31px] text-runway-espresso">
            All Registered Users
          </h1>
          <p className="text-xs text-runway-bark mt-0.5">
            Master roster of user accounts registered on BharatBill ({total} total).
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-runway-driftwood absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-runway-paper border border-runway-linen rounded-runway-btn text-xs text-runway-espresso placeholder-runway-driftwood focus:outline-none focus:border-runway-espresso shadow-runway-sm"
          />
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────────────────── */}
      <div className="bg-runway-paper border border-runway-linen rounded-runway-card shadow-runway-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-runway-espresso">
            <thead className="bg-runway-cream text-runway-bark font-medium border-b border-runway-linen">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email & Status</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Business Memberships</th>
                <th className="px-5 py-3 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-runway-linen">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-runway-driftwood">
                    Reading ledger entries...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-runway-driftwood">
                    No users matching search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-runway-cream/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-runway-espresso">{u.name}</div>
                      <div className="text-[10px] text-runway-driftwood font-mono mt-0.5">
                        ID: {u.id}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-runway-espresso">{u.email}</div>
                      <div className="flex items-center gap-1 text-[10px] text-runway-bark mt-0.5">
                        {u.isEmailVerified ? (
                          <span className="text-emerald-700 font-medium">Verified Account</span>
                        ) : (
                          <span className="text-runway-driftwood">Standard Registration</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-runway-bark">
                      {u.phone || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.memberships?.length === 0 ? (
                        <span className="text-runway-driftwood">None</span>
                      ) : (
                        <div className="space-y-1">
                          {u.memberships.map((m: any) => (
                            <div key={m.id} className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded-runway-badge text-[10px] font-medium bg-runway-linen text-runway-bark border border-runway-stone">
                                {m.role}
                              </span>
                              <span className="text-runway-espresso font-medium">
                                {m.business?.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-runway-driftwood text-[11px]">
                      {formatDate(u.createdAt)}
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
