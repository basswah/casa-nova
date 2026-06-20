import { useTranslation } from 'react-i18next';
import { Building } from '@phosphor-icons/react';
import type { Supplier } from '@/types/purchases';

interface POFormHeaderProps {
  supplierId: string;
  suppliers: Supplier[];
  onChange: (id: string) => void;
}

export const POFormHeader = ({ supplierId, suppliers, onChange }: POFormHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <label htmlFor="po-supplier" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">
        {t('purchases.supplier')}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/40">
          <Building size={16} />
        </div>
        <select
          id="po-supplier"
          value={supplierId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo appearance-none"
        >
          <option value="">{t('purchases.selectSupplier')}</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
