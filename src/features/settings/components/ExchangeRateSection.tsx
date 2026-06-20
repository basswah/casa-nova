import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, useUpdateExchangeRate } from '@/features/settings/hooks/useSettingsQuery';

export const ExchangeRateSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const updateExchangeRate = useUpdateExchangeRate();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      setValue(settings.exchangeRate.toString());
      initialized.current = true;
    }
  }, [settings]);

  const handleSave = async () => {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate <= 0) return;
    setSaving(true);
    try {
      await updateExchangeRate.mutateAsync(rate);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-brand-dark rounded-xl p-5 border border-brand-border">
      <h3 className="text-sm font-semibold text-brand-gold mb-3">{t('settings.exchangeRate')}</h3>
      <p className="text-sm text-brand-muted mb-3">{t('settings.rateDescription')}</p>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="er-rate" className="sr-only">{t('settings.exchangeRate')}</label>
          <input
            id="er-rate"
            type="number"
            step="1"
            min="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
};
