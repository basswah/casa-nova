import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, type Easing } from 'framer-motion';
import {
  Package,
  WarningCircle,
  CurrencyDollar,
  Tag,
  MagnifyingGlass,
  Plus,
  GridFour,
} from '@phosphor-icons/react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/features/inventory/hooks/useProducts';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/inventory/hooks/useCategories';
import { ProductList } from '@/features/inventory/components/ProductList';
import { ProductForm } from '@/features/inventory/components/ProductForm';
import { CategoryManager } from '@/features/inventory/components/CategoryManager';
import { DeleteConfirmDialog } from '@/features/shared/components/DeleteConfirmDialog';
import { Skeleton } from '@/features/shared/components/Skeleton';
import { EmptyState } from '@/features/shared/components/EmptyState';
import type { Product, NewProduct } from '@/types/inventory';

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: 'danger' | 'gold';
}

const KpiCard = ({ icon, label, value, accent }: KpiCardProps) => (
  <div className={`rounded-xl border p-5 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
    accent === 'danger'
      ? 'bg-red-950/30 border-red-900/30 hover:border-red-800/50 hover:shadow-[0_8px_24px_-8px_rgba(239,68,68,0.15)]'
      : accent === 'gold'
      ? 'bg-brand-dark border-brand-border/40 hover:border-brand-gold/30 hover:shadow-[0_8px_24px_-8px_rgba(212,175,55,0.12)]'
      : 'bg-brand-dark border-brand-border/40 hover:border-brand-border/60 hover:shadow-[0_8px_24px_-8px_rgba(255,255,255,0.04)]'
  }`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
        accent === 'danger' ? 'bg-red-500/10' :
        accent === 'gold' ? 'bg-brand-gold/10' :
        'bg-brand-border/20'
      }`}>
        <span className={
          accent === 'danger' ? 'text-red-400' :
          accent === 'gold' ? 'text-brand-gold' :
          'text-brand-muted/60'
        }>{icon}</span>
      </div>
      <span className="text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest leading-none">{label}</span>
    </div>
    <p className={`text-xl md:text-2xl font-bold font-mono tracking-tight ${
      accent === 'danger' ? 'text-red-400' : 'text-brand-light'
    }`}>{value}</p>
  </div>
);

export const InventoryPage = () => {
  const { t } = useTranslation();
  const { data: products = [], isLoading, error } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { document.title = `${t('nav.title')} — ${t('inventory.title')}`; }, [t]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    lowStockCount: products.filter((p) => p.quantity <= 5).length,
    totalValueUsd: products.reduce((sum, p) => sum + p.price_usd * p.quantity, 0),
    categoryCount: new Set(products.filter((p) => p.category?.name).map((p) => p.category!.name)).size,
  }), [products]);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  }, [products, search]);

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
    <div className="min-h-[100dvh] max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-brand-light tracking-tight">{t('inventory.title')}</h1>
          <p className="text-xs md:text-sm text-brand-muted/50 mt-1 tracking-tight">
            {stats.totalProducts} {t('common.products', { defaultValue: 'Products' })}
            {search && (
              <span className="text-brand-muted/30">
                {' '}&middot;{' '}
                {t('common.results', { defaultValue: 'Results' })}: {filtered.length}
              </span>
            )}
          </p>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeSlideUp}>
          <KpiCard icon={<Package size={16} weight="duotone" />} label={t('dashboard.totalProducts')} value={stats.totalProducts} />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <KpiCard icon={<WarningCircle size={16} weight="duotone" />} label={t('inventory.lowStock')} value={stats.lowStockCount} accent={stats.lowStockCount > 0 ? 'danger' : undefined} />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <KpiCard icon={<CurrencyDollar size={16} weight="duotone" />} label="Total Value (USD)" value={`$${stats.totalValueUsd.toLocaleString()}`} accent="gold" />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <KpiCard icon={<Tag size={16} weight="duotone" />} label={t('categories.title')} value={stats.categoryCount} />
        </motion.div>
      </motion.div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/30">
            <MagnifyingGlass size={14} weight="bold" />
          </div>
          <label htmlFor="inv-search" className="sr-only">{t('common.search')}</label>
          <input
            id="inv-search"
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/60 backdrop-blur-sm border border-brand-border/40 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setCatManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-dark/60 backdrop-blur-sm border border-brand-border/40 text-brand-muted font-medium rounded-xl hover:text-brand-light hover:border-brand-gold/25 hover:bg-brand-gold/[0.03] transition-all duration-300 ease-out-expo text-sm active:scale-[0.98] whitespace-nowrap shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <GridFour size={14} weight="bold" />
            {t('categories.manageButton')}
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_28px_-6px_rgba(212,175,55,0.3)] transition-all duration-300 ease-out-expo active:scale-[0.98] whitespace-nowrap"
          >
            <Plus size={14} weight="bold" />
            {t('inventory.addProduct')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/15 border border-red-800/30 rounded-xl flex items-center gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <WarningCircle size={16} weight="duotone" className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400/80">{error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-brand-dark/60 rounded-xl border border-brand-border/30 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-7 w-14 rounded-md shrink-0" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-border/20">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-12 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-12 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border/20">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && search && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MagnifyingGlass size={32} weight="thin" className="text-brand-muted/20" />
          <p className="text-sm text-brand-muted/40">{t('inventory.noProducts')}</p>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && !search && (
        <EmptyState
          title={t('inventory.noProducts')}
          description={t('inventory.emptyDescription', 'Start by adding your first product to track inventory')}
          action={{ label: t('inventory.addProduct'), onClick: handleAdd }}
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <ProductList
          products={filtered}
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

      <CategoryManager
        open={catManagerOpen}
        onClose={() => setCatManagerOpen(false)}
        categories={categories}
        onAdd={(name) => createCategoryMutation.mutate(name)}
        onUpdate={(id, name) => updateCategoryMutation.mutate({ id, name })}
        onDelete={(id) => deleteCategoryMutation.mutate(id)}
        loading={createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={t('inventory.deleteProduct')}
        message={t('inventory.deleteConfirm', { name: deleteTarget?.name })}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        loading={deleteProductMutation.isPending}
      />
    </div>
  );
};
