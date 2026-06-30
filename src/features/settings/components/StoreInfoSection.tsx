import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, useUpdateStoreName, useUpdateStoreAddress } from '@/features/settings/hooks/useSettingsQuery';
import { useToastStore } from '@/features/shared/store/toastSlice';

export const StoreInfoSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const updateStoreName = useUpdateStoreName();
  const updateStoreAddress = useUpdateStoreAddress();
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      setName(settings.storeName);
      setAddress(settings.storeAddress);
      initialized.current = true;
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateStoreName.mutateAsync(name);
      await updateStoreAddress.mutateAsync(address);
      addToast(t('settings.storeInfoUpdated', 'Store info updated successfully'), 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.error');
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-brand-dark rounded-xl p-5 border border-brand-border">
      <h3 className="text-sm font-semibold text-brand-gold mb-4">{t('settings.storeInfo')}</h3>
      <div className="space-y-3 mb-4">
        <div>
          <label htmlFor="si-name" className="block text-xs text-brand-muted mb-1.5 tracking-wide">{t('settings.storeName')}</label>
          <input
            id="si-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo"
          />
        </div>
        <div>
          <label htmlFor="si-address" className="block text-xs text-brand-muted mb-1.5 tracking-wide">{t('settings.storeAddress')}</label>
          <textarea
            id="si-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo resize-none"
          />
        </div>
      </div>
      {error && (
        <p className="text-red-400/80 text-xs mb-3">{error}</p>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? t('common.saving') : t('common.save')}
      </button>
    </div>
  );
};
