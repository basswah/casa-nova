import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, useUpdateStoreName, useUpdateStoreAddress } from '@/features/settings/hooks/useSettingsQuery';

export const StoreInfoSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const updateStoreName = useUpdateStoreName();
  const updateStoreAddress = useUpdateStoreAddress();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
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
    try {
      await updateStoreName.mutateAsync(name);
      await updateStoreAddress.mutateAsync(address);
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
            className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="si-address" className="block text-xs text-brand-muted mb-1.5 tracking-wide">{t('settings.storeAddress')}</label>
          <textarea
            id="si-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? t('common.saving') : t('common.save')}
      </button>
    </div>
  );
};
