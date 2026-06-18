import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/features/inventory/hooks/useProducts';
import { ProductList } from '@/features/inventory/components/ProductList';
import { ProductForm } from '@/features/inventory/components/ProductForm';
import { DeleteConfirmDialog } from '@/features/shared/components/DeleteConfirmDialog';
import { SkeletonTable } from '@/features/shared/components/Skeleton';
import { EmptyState } from '@/features/shared/components/EmptyState';
import type { Product, NewProduct } from '@/types/inventory';

export const InventoryPage = () => {
  const { t } = useTranslation();
  const { data: products = [], isLoading, error } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('inventory.title')}`; }, [t]);

  const handleAdd = useCallback(() => {
    setEditingProduct(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingProduct(null);
  }, []);

  const handleDeleteRequest = useCallback((product: Product) => {
    setDeleteTarget(product);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    deleteProductMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteProductMutation]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-gold tracking-tight">{t('inventory.title')}</h1>
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          {t('inventory.addProduct')}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm">
          {error.message}
        </div>
      )}

      {isLoading && <SkeletonTable rows={5} />}

      {!isLoading && !error && products.length === 0 && (
        <EmptyState
          title={t('inventory.noProducts')}
          action={{ label: t('inventory.addProduct'), onClick: handleAdd }}
        />
      )}

      {!isLoading && products.length > 0 && (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      <ProductForm
        open={formOpen}
        onClose={handleCloseForm}
        product={editingProduct}
        onSubmit={(data) => {
          if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, payload: data });
          } else {
            createProductMutation.mutate(data as NewProduct);
          }
          handleCloseForm();
        }}
        loading={createProductMutation.isPending || updateProductMutation.isPending}
        error={createProductMutation.error?.message || updateProductMutation.error?.message}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={t('inventory.deleteProduct')}
        message={t('inventory.deleteConfirm', { name: deleteTarget?.name })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteProductMutation.isPending}
      />
    </div>
  );
};
