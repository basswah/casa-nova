import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UsersTable } from '@/features/admin/components/UsersTable';
import { UserFormModal } from '@/features/admin/components/UserFormModal';
import { useUsers } from '@/features/admin/hooks/useUsers';
import type { AdminUser } from '@/types/user-management';

export const UsersPage = () => {
  const { t } = useTranslation();
  const { users, loading, error, refresh } = useUsers();
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('users.title')}`; }, [t]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-gold tracking-tight">{t('users.title')}</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm font-semibold text-brand-black bg-brand-gold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all active:scale-[0.98]"
        >
          {t('users.addUser')}
        </button>
      </div>

      <UsersTable users={users} loading={loading} error={error} onEdit={setEditUser} onRefresh={refresh} />

      {(showAdd || editUser) && (
        <UserFormModal
          editUser={showAdd ? null : editUser}
          onClose={() => { setShowAdd(false); setEditUser(null); }}
          onSaved={() => { setShowAdd(false); setEditUser(null); refresh(); }}
        />
      )}
    </div>
  );
};
