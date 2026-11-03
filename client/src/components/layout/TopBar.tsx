import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessStore } from '@/stores/businessStore';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Building,
  Calendar,
  LogOut,
  User,
  Plus,
  Check,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { SUPER_ADMIN_EMAILS } from '@/components/AdminRoute';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export function TopBar({ onOpenMobileMenu, onOpenCommandPalette }: TopBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentBusiness, businesses, setCurrentBusiness, financialYear, setFinancialYear } =
    useBusinessStore();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [fyDropdownOpen, setFyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const bizRef = useRef<HTMLDivElement>(null);
  const fyRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bizRef.current && !bizRef.current.contains(e.target as Node)) {
        setBizDropdownOpen(false);
      }
      if (fyRef.current && !fyRef.current.contains(e.target as Node)) {
        setFyDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const financialYears = ['2026-27', '2025-26', '2024-25'];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Mobile hamburger & Business switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Business Selector */}
        <div className="relative" ref={bizRef}>
          <button
            onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
              {currentBusiness?.name ? currentBusiness.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block truncate max-w-[140px]">
                {currentBusiness?.name || 'Select Business'}
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-mono">
                {currentBusiness?.gstin || 'Unregistered'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {bizDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                My Businesses
              </div>
              {businesses.map((biz) => {
                const isSelected = biz.id === currentBusiness?.id;
                return (
                  <button
                    key={biz.id}
                    onClick={() => {
                      setCurrentBusiness(biz);
                      setBizDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{biz.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{biz.gstin || 'No GSTIN'}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
              <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                <button
                  onClick={() => {
                    setBizDropdownOpen(false);
                    navigate('/onboarding');
                  }}
                  className="w-full flex items-center gap-2 p-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Business
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Financial Year Selector */}
        <div className="relative hidden md:block" ref={fyRef}>
          <button
            onClick={() => setFyDropdownOpen(!fyDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>FY {financialYear}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {fyDropdownOpen && (
            <div className="absolute left-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
              {financialYears.map((fy) => (
                <button
                  key={fy}
                  onClick={() => {
                    setFinancialYear(fy);
                    setFyDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                    fy === financialYear ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>FY {fy}</span>
                  {fy === financialYear && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar trigger (Ctrl+K) */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search invoices, customers, products...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-300 rounded shadow-xs text-slate-500">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications & User Avatar Menu */}
      <div className="flex items-center gap-3">
        {/* Super Admin Quick Link */}
        {user?.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase().trim()) && (
          <button
            onClick={() => navigate('/admin')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-bold transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin Panel</span>
          </button>
        )}

        {/* Notification Bell */}
        <button className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {/* User Avatar Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-semibold text-slate-900 block leading-tight">
                {user?.name || 'My Account'}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {user?.email || ''}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Building className="w-4 h-4 text-slate-400" />
                  Business Profile
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/app/subscription');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Manage Subscription
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

