import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// ─── Lazy-loaded pages ──────────────────────────────────────────────────────
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const InvoicesPage = lazy(() => import('@/features/invoices/pages/InvoicesPage'));
const CreateInvoicePage = lazy(() => import('@/features/invoices/pages/CreateInvoicePage'));
const ProductsPage = lazy(() => import('@/features/products/pages/ProductsPage'));
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'));
const SuppliersPage = lazy(() => import('@/features/suppliers/pages/SuppliersPage'));
const PurchasesPage = lazy(() => import('@/features/purchases/pages/PurchasesPage'));
const PaymentsPage = lazy(() => import('@/features/payments/pages/PaymentsPage'));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const SubscriptionPage = lazy(() => import('@/features/subscription/pages/SubscriptionPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

// ─── Admin pages (Restricted) ────────────────────────────────────────────────
const AdminOverviewPage = lazy(() => import('@/features/admin/pages/AdminOverviewPage'));
const AdminBusinessesPage = lazy(() => import('@/features/admin/pages/AdminBusinessesPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'));
const AdminSubscriptionsPage = lazy(() => import('@/features/admin/pages/AdminSubscriptionsPage'));
const AdminInvoicesPage = lazy(() => import('@/features/admin/pages/AdminInvoicesPage'));

// ─── Loading fallback ───────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            fontSize: '14px',
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />

            <Route path="/app" element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="invoices/new" element={<CreateInvoicePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Super Admin Restricted Routes (only shreyashsr2004@gmail.com and princevij04@gmail.com) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="businesses" element={<AdminBusinessesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="invoices" element={<AdminInvoicesPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
