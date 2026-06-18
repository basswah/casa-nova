import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { SkeletonCard } from '@/features/shared/components/Skeleton';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const PosPage = lazy(() => import('@/pages/pos/PosPage').then(m => ({ default: m.PosPage })));
const SuppliersPage = lazy(() => import('@/pages/purchases/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const PurchaseOrdersPage = lazy(() => import('@/pages/purchases/PurchaseOrdersPage').then(m => ({ default: m.PurchaseOrdersPage })));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SalesHistoryPage = lazy(() => import('@/pages/sales/SalesHistoryPage').then(m => ({ default: m.SalesHistoryPage })));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage').then(m => ({ default: m.UsersPage })));

const PageLoader = () => (
  <div className="max-w-7xl mx-auto space-y-4 p-6">
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
      { path: 'inventory', element: <Suspense fallback={<PageLoader />}><InventoryPage /></Suspense> },
      { path: 'pos', element: <Suspense fallback={<PageLoader />}><PosPage /></Suspense> },
      { path: 'purchases/suppliers', element: <Suspense fallback={<PageLoader />}><SuppliersPage /></Suspense> },
      { path: 'purchases', element: <Suspense fallback={<PageLoader />}><PurchaseOrdersPage /></Suspense> },
      { path: 'purchases/:id', element: <Suspense fallback={<PageLoader />}><PurchaseOrdersPage /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> },
      { path: 'reports', element: <Suspense fallback={<PageLoader />}><ReportsPage /></Suspense> },
      { path: 'sales', element: <Suspense fallback={<PageLoader />}><SalesHistoryPage /></Suspense> },
      { path: 'admin/users', element: <Suspense fallback={<PageLoader />}><UsersPage /></Suspense> },
    ],
  },
]);
