import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '@/lib/admin-api';
import type { AdminUser } from '@/types/user-management';

interface UserFormModalProps {
  editUser: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

export const UserFormModal = ({ editUser, onClose, onSaved }: UserFormModalProps) => {
  const { t } = useTranslation();
  const isEdit = !!editUser;
  const [email, setEmail] = useState(editUser?.email || '');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(editUser?.profile?.display_name || '');
  const [role, setRole] = useState<'admin' | 'cashier' | 'manager'>(editUser?.profile?.role || 'cashier');
  const [isActive, setIsActive] = useState(editUser?.profile?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        await adminApi.updateUser({
          id: editUser!.id,
          ...(email !== editUser!.email ? { email } : {}),
          ...(password ? { password } : {}),
          displayName: displayName || email.split('@')[0],
          role,
          isActive,
        });
      } else {
        if (!password) { throw new Error(t('users.passwordRequired')); }
        await adminApi.createUser({ email, password, displayName: displayName || email.split('@')[0], role });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-brand-dark rounded-xl p-6 w-full max-w-md border border-brand-border shadow-[var(--shadow-floating)]" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-brand-gold mb-4">
          {isEdit ? t('users.editUser') : t('users.addUser')}
        </h3>

        {error && (
          <div className="p-3 mb-4 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="uf-email" className="block text-xs text-brand-muted mb-1.5">{t('users.email')}</label>
            <input
              id="uf-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          <div>
            <label htmlFor="uf-name" className="block text-xs text-brand-muted mb-1.5">{t('users.displayName')}</label>
            <input
              id="uf-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {!isEdit && (
            <div>
              <label htmlFor="uf-password" className="block text-xs text-brand-muted mb-1.5">{t('users.password')}</label>
              <input
                id="uf-password"
                type="password"
                required={!isEdit}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
          )}

          <div>
            <label htmlFor="uf-role" className="block text-xs text-brand-muted mb-1.5">{t('users.role')}</label>
            <select
              id="uf-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'cashier' | 'manager')}
              className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-brand-muted">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-brand-border bg-brand-black"
              />
              {t('users.active')}
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm text-brand-muted border border-brand-border rounded-lg hover:bg-brand-surface-hover transition-all disabled:opacity-40"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-brand-black bg-brand-gold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all disabled:opacity-40"
            >
              {saving ? t('common.saving') : (isEdit ? t('common.save') : t('users.addUser'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
