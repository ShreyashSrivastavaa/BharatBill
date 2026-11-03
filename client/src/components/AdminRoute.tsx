import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const SUPER_ADMIN_EMAILS = [
  'shreyashsr2004@gmail.com',
  'princevij04@gmail.com',
];

export default function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAuthorized = SUPER_ADMIN_EMAILS.includes(userEmail);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-3">
            403 • Unauthorized
          </span>

          <h1 className="text-xl font-bold text-white mb-2">Super Admin Access Only</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The platform admin control center is strictly restricted to designated platform administrators.
            Your account (<strong className="text-slate-200">{user?.email}</strong>) does not have access privileges.
          </p>

          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Business Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
