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
            className="w-full px-3 py-2.5 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-all duration-200"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
};
