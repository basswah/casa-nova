import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSuppliers, useDeleteSupplier } from '@/features/purchases/hooks/useSuppliers';
import { SupplierForm } from '@/features/purchases/components/SupplierForm';
import { SupplierTable } from '@/features/purchases/components/suppliers/SupplierTable';
import { DeleteConfirmDialog } from '@/features/shared/components/DeleteConfirmDialog';
import type { Supplier } from '@/types/purchases';

export const SupplierList = () => {
  const { t } = useTranslation();
  const { data: suppliers = [], isLoading, error } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const [openForm, setOpenForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setEditingSupplier(null);
    setOpenForm(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingSupplier(null);
  };

  const handleDeleteRequest = (supplier: Supplier) => {
    setDeleteTarget(supplier);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSupplier.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <p className="text-brand-muted text-center py-8">{t('suppliers.loading')}</p>;
  }

  if (error) {
    return <p className="text-red-400">{t('common.error')}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-brand-gold tracking-tight">{t('suppliers.title')}</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          {t('suppliers.addSupplier')}
        </button>
      </div>

      <SupplierTable suppliers={suppliers} onEdit={handleEdit} onDelete={handleDeleteRequest} />

      <SupplierForm
        open={openForm}
        onClose={handleCloseForm}
        supplier={editingSupplier}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={t('suppliers.deleteSupplier')}
        message={t('suppliers.deleteConfirm', { name: deleteTarget?.name })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};
