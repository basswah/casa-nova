import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/rootStore';
import { SkeletonCard } from '@/features/shared/components/Skeleton';
import { EmptyState } from '@/features/shared/components/EmptyState';
import { useTranslation } from 'react-i18next';

export const ProtectedLayout = () => {
  const { user, loading } = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 p-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    return <EmptyState title={t('auth.redirecting')} icon="🔐" />;
  }

  return <Outlet />;
};