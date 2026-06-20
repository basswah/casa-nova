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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm" onClick={onClose}>
      <div className="bg-brand-dark rounded-2xl p-7 w-full max-w-md mx-4 border border-brand-border/50 shadow-[var(--shadow-floating)] relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover transition-all duration-150 active:scale-[0.92]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-6 text-xl font-bold text-brand-gold tracking-tight">
          {isEdit ? t('users.editUser') : t('users.addUser')}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="uf-email" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('users.email')}</label>
            <input
              id="uf-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo"
            />
          </div>

          <div>
            <label htmlFor="uf-name" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('users.displayName')}</label>
            <input
              id="uf-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo"
            />
          </div>

          {!isEdit && (
            <div>
              <label htmlFor="uf-password" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('users.password')}</label>
              <input
                id="uf-password"
                type="password"
                required={!isEdit}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo"
              />
            </div>
          )}

          <div>
            <label htmlFor="uf-role" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('users.role')}</label>
            <select
              id="uf-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'cashier' | 'manager')}
              className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo"
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-brand-gold w-4 h-4 rounded cursor-pointer"
              />
              {t('users.active')}
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-brand-muted bg-brand-dark border border-brand-border hover:bg-brand-surface-hover transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
            >
              {saving ? t('common.saving') : (isEdit ? t('common.save') : t('users.addUser'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
