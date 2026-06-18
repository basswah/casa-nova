import { useTranslation } from 'react-i18next';
import type { Supplier } from '@/types/purchases';

interface POFormHeaderProps {
  supplierId: string;
  suppliers: Supplier[];
  onChange: (id: string) => void;
}

export const POFormHeader = ({ supplierId, suppliers, onChange }: POFormHeaderProps) => {
  const { t } = useTranslation();
  return (
    <>
      <label htmlFor="po-supplier" className="block text-sm font-medium text-brand-gold mb-1 tracking-wide">{t('purchases.supplier')}</label>
      <select
        id="po-supplier"
        value={supplierId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-[var(--clr-text)] focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200"
      >
        <option value="">{t('purchases.selectSupplier')}</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </>
  );
};
