import { useTranslation } from 'react-i18next';
import type { Supplier } from '@/types/purchases';

interface SupplierActionsProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierActions = ({ supplier, onEdit, onDelete }: SupplierActionsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <button
        onClick={() => onEdit(supplier)}
        className="text-brand-gold hover:text-[var(--clr-gold-hover)] mr-2 transition-all duration-200 active:scale-[0.98]"
      >
        {t('common.edit')}
      </button>
      <button
        onClick={() => onDelete(supplier)}
        className="text-red-400 hover:text-red-300 transition-all duration-200 active:scale-[0.98]"
      >
        {t('common.delete')}
      </button>
    </>
  );
};
