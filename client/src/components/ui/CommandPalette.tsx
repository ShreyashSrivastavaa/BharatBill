import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  PlusCircle,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  CreditCard,
  Settings,
  X,
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // handled by parent
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Create New Invoice', path: '/app/invoices/new', icon: PlusCircle, group: 'Actions' },
    { label: 'View Invoices', path: '/app/invoices', icon: FileText, group: 'Navigation' },
    { label: 'Products & Inventory', path: '/app/products', icon: Package, group: 'Navigation' },
    { label: 'Customer Directory & Ledgers', path: '/app/customers', icon: Users, group: 'Navigation' },
    { label: 'Supplier Purchases', path: '/app/purchases', icon: ShoppingCart, group: 'Navigation' },
    { label: 'Reports & Analytics', path: '/app/reports', icon: BarChart3, group: 'Navigation' },
    { label: 'Payments Received & Paid', path: '/app/payments', icon: CreditCard, group: 'Navigation' },
    { label: 'Business Profile & Settings', path: '/app/settings', icon: Settings, group: 'Navigation' },
  ];

  const filtered = query.trim()
    ? actions.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase()),
      )
    : actions;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-20 text-center">
        <div
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search bar */}
          <div className="flex items-center px-4 border-b border-slate-100">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, page or search..."
              className="w-full py-4 pl-3 pr-8 text-sm bg-transparent outline-none text-slate-900 placeholder-slate-400"
            />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching results found for "{query}"
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path + item.label}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-600 flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.group}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>
              Use <kbd className="px-1 py-0.5 bg-white border rounded">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-white border rounded">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white border rounded">ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

