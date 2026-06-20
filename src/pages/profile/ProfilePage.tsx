import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/admin/hooks/useUsers';
import { SkeletonCard } from '@/features/shared/components/Skeleton';

const roleBadgeClass = (role: string) => {
  const base = 'px-2 py-0.5 text-[11px] font-medium rounded-md';
  if (role === 'admin') return `${base} bg-brand-gold/20 text-brand-gold`;
  if (role === 'manager') return `${base} bg-blue-500/20 text-blue-400`;
  return `${base} bg-brand-surface-hover text-brand-muted`;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${t('nav.title')} — ${t('profile.title')}`;
  }, [t]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-32 rounded-lg skeleton-pulse bg-brand-surface-hover" />
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = (profile?.display_name || user.email || '?').charAt(0).toUpperCase();
  const displayName = profile?.display_name || user.email || '';
  const role = profile?.role || 'cashier';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-brand-gold tracking-tight">{t('profile.title')}</h2>

      <div className="bg-brand-dark rounded-xl border border-brand-border p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-surface-hover flex items-center justify-center text-xl sm:text-2xl font-bold text-brand-muted shrink-0">
          {initials}
        </div>
        <div className="text-center sm:text-left space-y-1.5">
          <h3 className="text-lg font-semibold text-brand-light">{displayName}</h3>
          <p className="text-sm text-brand-muted">{user.email}</p>
          <span className={roleBadgeClass(role)}>
            {t(`users.${role}`, { defaultValue: role })}
          </span>
          {profile?.created_at && (
            <p className="text-xs text-brand-muted/60 pt-1">
              {t('profile.memberSince')} {formatDate(profile.created_at)}
            </p>
          )}
        </div>
      </div>

      <div className="bg-brand-dark rounded-xl border border-brand-border p-6 sm:p-8 space-y-5">
        <h4 className="text-sm font-semibold text-brand-muted uppercase tracking-wider">{t('profile.accountDetails')}</h4>
        <div className="space-y-3 divide-y divide-brand-border">
          <div className="flex items-center justify-between pt-0">
            <span className="text-sm text-brand-muted">{t('users.displayName')}</span>
            <span className="text-sm text-brand-light font-medium">{profile?.display_name || '—'}</span>
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm text-brand-muted">{t('auth.email')}</span>
            <span className="text-sm text-brand-light font-mono">{user.email}</span>
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm text-brand-muted">{t('users.role')}</span>
            <span className={roleBadgeClass(role)}>{t(`users.${role}`, { defaultValue: role })}</span>
          </div>
          {profile?.created_at && (
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-brand-muted">{t('profile.memberSince')}</span>
              <span className="text-sm text-brand-light">{formatDate(profile.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-6 py-3 bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20 rounded-lg text-sm font-medium transition-all duration-200"
        >
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
};
