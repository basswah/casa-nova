import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { SkeletonCard } from '@/features/shared/components/Skeleton';
import { PageErrorBoundary } from '@/features/shared/components/ErrorBoundary';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const PosPage = lazy(() => import('@/pages/pos/PosPage').then(m => ({ default: m.PosPage })));
const SuppliersPage = lazy(() => import('@/pages/purchases/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const PurchaseOrdersPage = lazy(() => import('@/pages/purchases/PurchaseOrdersPage').then(m => ({ default: m.PurchaseOrdersPage })));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SalesHistoryPage = lazy(() => import('@/pages/sales/SalesHistoryPage').then(m => ({ default: m.SalesHistoryPage })));
const ReturnsHistoryPage = lazy(() => import('@/pages/sales/ReturnsHistoryPage').then(m => ({ default: m.ReturnsHistoryPage })));
const ConsignmentSalesPage = lazy(() => import('@/pages/consignment/ConsignmentSalesPage').then(m => ({ default: m.ConsignmentSalesPage })));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage').then(m => ({ default: m.UsersPage })));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));

const PageLoader = () => (
  <div className="max-w-7xl mx-auto space-y-4 p-6">
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

const wrapPage = (name: string, Component: React.LazyExoticComponent<React.FC>) => (
  <PageErrorBoundary pageName={name}>
    <Suspense fallback={<PageLoader />}><Component /></Suspense>
  </PageErrorBoundary>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: wrapPage('login', LoginPage),
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: wrapPage('dashboard', DashboardPage) },
      { path: 'inventory', element: wrapPage('inventory', InventoryPage) },
      { path: 'pos', element: wrapPage('pos', PosPage) },
      { path: 'purchases/suppliers', element: wrapPage('suppliers', SuppliersPage) },
      { path: 'purchases', element: wrapPage('purchases', PurchaseOrdersPage) },
      { path: 'purchases/:id', element: wrapPage('purchase-detail', PurchaseOrdersPage) },
      { path: 'settings', element: wrapPage('settings', SettingsPage) },
      { path: 'reports', element: wrapPage('reports', ReportsPage) },
      { path: 'sales', element: wrapPage('sales', SalesHistoryPage) },
      { path: 'consignment', element: wrapPage('consignment', ConsignmentSalesPage) },
      { path: 'returns', element: wrapPage('returns', ReturnsHistoryPage) },
      { path: 'admin/users', element: wrapPage('users', UsersPage) },
      { path: 'profile', element: wrapPage('profile', ProfilePage) },
    ],
  },
]);
