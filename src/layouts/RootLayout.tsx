import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/admin/hooks/useUsers';
import { LanguageSwitcher } from '@/features/shared/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/features/shared/components/ThemeSwitcher';
import { ToastContainer } from '@/features/shared/components/Toast';
import { ShortcutsHelp } from '@/features/shared/components/ShortcutsHelp';
import { SkeletonCard } from '@/features/shared/components/Skeleton';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-brand-gold text-brand-black shadow-sm'
      : 'text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover'
  }`;

export const RootLayout = () => {
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-light flex flex-col" dir="auto">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-gold focus:text-brand-black focus:rounded-lg focus:shadow-floating">
        {t('common.skipToContent') || 'Skip to content'}
      </a>
      <ToastContainer />
      <nav className="bg-brand-dark border-b border-brand-border px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-gold tracking-tight">{t('nav.title')}</h1>
          <div className="flex gap-2 rtl:gap-1 items-center">
            <NavLink to="/" className={linkClass} end>{t('nav.home')}</NavLink>
            <NavLink to="/inventory" className={linkClass}>{t('nav.inventory')}</NavLink>
            <NavLink to="/pos" className={linkClass}>{t('nav.pos')}</NavLink>
            <NavLink to="/purchases" className={linkClass}>{t('nav.purchases')}</NavLink>
            <NavLink to="/purchases/suppliers" className={linkClass}>{t('nav.suppliers')}</NavLink>
            <NavLink to="/reports" className={linkClass}>{t('nav.reports')}</NavLink>
            <NavLink to="/sales" className={linkClass}>{t('nav.sales')}</NavLink>
            {profile?.role === 'admin' && (
              <NavLink to="/admin/users" className={linkClass}>{t('nav.users')}</NavLink>
            )}
            <NavLink to="/settings" className={linkClass}>{t('nav.settings')}</NavLink>
            <div className="flex items-center gap-2 text-xs text-brand-muted ml-2 pl-2 border-l border-brand-border">
              <span className="hidden sm:inline">{profile?.display_name || user.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-brand-muted hover:text-red-400 border border-brand-border rounded-lg transition-all duration-200"
                aria-label={t('auth.logout')}
                title={t('auth.logout')}
              >
                {t('auth.logout')}
              </button>
            </div>
            <div className="flex gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
      <main id="main-content" className="flex-1 p-6">
        <Outlet />
      </main>
      <ShortcutsHelp />
    </div>
  );
};
