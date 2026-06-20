import { useTranslation } from 'react-i18next';
import type { AdminUser } from '@/types/user-management';

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  onEdit: (user: AdminUser) => void;
  onRefresh: () => void;
}

export const UsersTable = ({ users, loading, error, onEdit, onRefresh }: UsersTableProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-brand-surface-hover rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onRefresh} className="px-4 py-2 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-gold hover:bg-brand-surface-hover transition-all duration-200">{t('common.retry')}</button>
      </div>
    );
  }

  if (users.length === 0) {
    return <p className="text-brand-muted text-center py-12">{t('users.noUsers')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border">
      <table className="min-w-full divide-y divide-brand-border">
        <thead className="bg-brand-black">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('users.displayName')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('users.email')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('users.role')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.status')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border bg-brand-dark">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-brand-surface-hover transition-colors">
              <td className="px-4 py-3 text-sm text-brand-light font-medium">
                {user.profile?.display_name || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-brand-muted font-mono">{user.email || '-'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.profile?.role === 'admin' ? 'bg-brand-gold/20 text-brand-gold' :
                  user.profile?.role === 'manager' ? 'bg-blue-900/30 text-blue-400' :
                  'bg-brand-surface-hover text-brand-muted'
                }`}>
                  {user.profile?.role || 'cashier'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 text-sm ${user.profile?.is_active !== false ? 'text-green-400' : 'text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.profile?.is_active !== false ? 'bg-green-400' : 'bg-red-400'}`} />
                  {user.profile?.is_active !== false ? t('users.active') : t('users.inactive')}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onEdit(user)}
                  className="text-xs text-brand-muted hover:text-brand-gold transition-colors"
                >
                  {t('common.edit')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
