import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ExchangeRateSection } from '@/features/settings/components/ExchangeRateSection';
import { StoreInfoSection } from '@/features/settings/components/StoreInfoSection';

export const SettingsPage = () => {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t('nav.title')} — ${t('settings.title')}`; }, [t]);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-brand-gold tracking-tight">{t('settings.title')}</h2>
      <ExchangeRateSection />
      <StoreInfoSection />
    </div>
  );
};
