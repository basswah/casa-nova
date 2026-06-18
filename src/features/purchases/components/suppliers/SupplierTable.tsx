import { useTranslation } from 'react-i18next';
import type { Supplier } from '@/types/purchases';
import { SupplierActions } from './SupplierActions';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierTable = ({ suppliers, onEdit, onDelete }: SupplierTableProps) => {
  const { t } = useTranslation();
  if (suppliers.length === 0) {
    return <p className="text-brand-muted text-center py-8">{t('suppliers.noSuppliers')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y divide-brand-border">
        <thead className="bg-brand-dark">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.name')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('suppliers.contactInfo')}</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="bg-brand-black divide-y divide-brand-border">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-brand-surface-hover transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm">{supplier.name}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-brand-muted">{supplier.contact_info ?? '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                <SupplierActions supplier={supplier} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
