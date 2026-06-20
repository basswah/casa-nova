import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SupplierList } from '@/features/purchases/components/SupplierList';

export const SuppliersPage = () => {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t('nav.title')} — ${t('suppliers.title')}`; }, [t]);
  return (
    <div className="min-h-[100dvh] max-w-7xl mx-auto">
      <SupplierList />
    </div>
  );
};
