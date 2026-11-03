import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Users,
  Truck,
  BarChart3,
  CreditCard,
  Sparkles,
  Settings,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', path: '/app/invoices', icon: FileText },
    { name: 'Purchases', path: '/app/purchases', icon: ShoppingCart },
    { name: 'Products', path: '/app/products', icon: Package },
    { name: 'Customers', path: '/app/customers', icon: Users },
    { name: 'Suppliers', path: '/app/suppliers', icon: Truck },
    { name: 'Reports', path: '/app/reports', icon: BarChart3 },
    { name: 'Payments', path: '/app/payments', icon: CreditCard },
    { name: 'Subscription', path: '/app/subscription', icon: Sparkles },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              ₹
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Bharat<span className="text-blue-500">Bill</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                GST BILLING SAAS
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <NavLink
            to="/app/invoices/new"
            onClick={onMobileClose}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </NavLink>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer badge */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-800/60 rounded-xl flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[11px] font-semibold text-slate-200 truncate">GST Compliant</p>
              <p className="text-[10px] text-slate-400 truncate">CGST • SGST • IGST</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

