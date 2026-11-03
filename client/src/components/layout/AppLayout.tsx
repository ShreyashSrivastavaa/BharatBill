import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from '../ui/CommandPalette';
import { useBusinessStore } from '@/stores/businessStore';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AppLayout() {
  const navigate = useNavigate();
  const { currentBusiness, businesses, setCurrentBusiness, setBusinesses } = useBusinessStore();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(!currentBusiness);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const { data } = await api.get('/businesses/my');
        const list = data.data || [];
        setBusinesses(list);

        if (list.length === 0) {
          navigate('/onboarding');
        } else if (!currentBusiness) {
          setCurrentBusiness(list[0]);
        }
      } catch (error) {
        console.error('Failed to load user businesses:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!currentBusiness || businesses.length === 0) {
      loadBusinesses();
    }
  }, [currentBusiness, businesses.length, navigate, setCurrentBusiness, setBusinesses]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Navy) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main app area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top bar */}
        <TopBar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
