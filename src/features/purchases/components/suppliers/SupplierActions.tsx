import { useTranslation } from 'react-i18next';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import type { Supplier } from '@/types/purchases';

interface SupplierActionsProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierActions = ({ supplier, onEdit, onDelete }: SupplierActionsProps) => {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={() => onEdit(supplier)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
      >
        <PencilSimple size={13} />
        {t('common.edit')}
      </button>
      <button
        onClick={() => onDelete(supplier)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
      >
        <Trash size={13} />
        {t('common.delete')}
      </button>
    </span>
  );
};
