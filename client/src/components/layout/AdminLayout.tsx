import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  FileText,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'All Businesses', to: '/admin/businesses', icon: Building2 },
    { label: 'All Users', to: '/admin/users', icon: Users },
    { label: 'Subscriptions', to: '/admin/subscriptions', icon: CreditCard },
    { label: 'Global Invoices', to: '/admin/invoices', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-runway-cream text-runway-espresso flex flex-col font-sans selection:bg-runway-honey selection:text-runway-espresso">
      {/* ─── Top Announcement Banner ─────────────────────────────────── */}
      <div className="bg-runway-espresso text-white text-[12px] py-1.5 px-4 text-center tracking-tight flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-runway-amber animate-pulse" />
        <span>Runway Financial Ledger • Restricted Super Admin Platform Access</span>
      </div>

      {/* ─── Top Header Bar ─────────────────────────────────────────── */}
      <header className="bg-runway-paper border-b border-runway-linen px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-runway-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-runway-espresso hover:bg-runway-cream rounded-runway-btn"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-runway-btn bg-runway-amber text-runway-espresso flex items-center justify-center shadow-runway-cta">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-runway-espresso">
                bharatbill
              </span>
              <span className="px-2 py-0.5 rounded-runway-badge text-[11px] font-medium bg-runway-honey text-runway-espresso">
                Admin Ledger
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-runway-cream rounded-runway-btn border border-runway-linen text-[12px] text-runway-bark">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-mono text-[11px]">{user?.email}</span>
          </div>

          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-runway-paper hover:bg-runway-cream text-runway-espresso border border-runway-espresso rounded-runway-btn text-xs font-medium transition shadow-runway-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Business App</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-1.5 text-runway-driftwood hover:text-runway-terracotta hover:bg-runway-cream rounded-runway-btn transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1200px] w-full mx-auto">
        {/* ─── Desktop Left Navigation ────────────────────────────────── */}
        <aside className="hidden md:flex w-56 flex-col justify-between py-6 pr-6 border-r border-runway-linen">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-runway-driftwood">
              Ledger Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-runway-btn text-xs font-medium transition ${
                      isActive
                        ? 'bg-runway-linen text-runway-espresso font-semibold'
                        : 'text-runway-bark hover:text-runway-espresso hover:bg-runway-linen/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-runway-espresso stroke-[1.5]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="p-3 bg-runway-paper rounded-runway-card border border-runway-linen shadow-runway-sm text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-runway-espresso flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>PostgreSQL Cluster</span>
            </div>
            <p className="text-[10px] text-runway-driftwood leading-tight">
              Kraft Ledger Theme Active.
              Access strictly verified for platform architects.
            </p>
          </div>
        </aside>

        {/* ─── Mobile Menu ────────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-24 bg-runway-cream z-50 p-6 space-y-2 border-b border-runway-linen">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-runway-btn text-sm transition ${
                      isActive
                        ? 'bg-runway-linen text-runway-espresso font-semibold'
                        : 'text-runway-bark'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-runway-espresso" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* ─── Content Area ───────────────────────────────────────────── */}
        <main className="flex-1 py-6 px-4 sm:px-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
