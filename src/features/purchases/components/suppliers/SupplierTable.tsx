import { useTranslation } from 'react-i18next';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import type { Supplier } from '@/types/purchases';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierTable = ({ suppliers, onEdit, onDelete }: SupplierTableProps) => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:block overflow-x-auto rounded-xl border border-brand-border/60 bg-brand-dark">
      <table className="min-w-full divide-y divide-brand-border/50">
        <thead>
          <tr className="bg-brand-black/60 backdrop-blur-sm">
            <th className="px-5 py-3.5 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.name')}</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('suppliers.contactInfo')}</th>
            <th className="px-5 py-3.5 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/50">
          {suppliers.map((supplier, index) => (
            <tr
              key={supplier.id}
              className="group hover:bg-brand-surface-hover transition-all duration-200 ease-out-expo"
              style={{ animation: `fade-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`, animationDelay: `${0.03 + index * 0.035}s` }}
            >
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-surface-hover flex items-center justify-center text-sm font-semibold text-brand-muted group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all duration-200">
                    {supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-light">{supplier.name}</p>
                    <p className="text-xs text-brand-muted/60 font-mono mt-0.5">{supplier.id.slice(0, 8)}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="text-sm text-brand-muted">{supplier.contact_info || '-'}</span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onEdit(supplier)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
                  >
                    <PencilSimple size={14} />
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => onDelete(supplier)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
                  >
                    <Trash size={14} />
                    {t('common.delete')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
