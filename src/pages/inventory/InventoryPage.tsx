import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WarningCircle,
  CurrencyDollar,
  Tag,
  MagnifyingGlass,
  GridFour,
  TagSimple,
  Cube,
  TrendUp,
  Archive,
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

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  accent?: 'default' | 'gold' | 'danger' | 'success';
  delay?: number;
}

const KpiCard = ({ icon, label, value, trend, accent = 'default' }: KpiCardProps) => {
  const accentStyles = {
    default: {
      container: 'bg-gradient-to-br from-brand-dark/90 to-brand-dark/60 border border-brand-border/30',
      icon: 'text-brand-muted/60',
      iconBg: 'bg-brand-border/10',
      value: 'text-brand-light',
      label: 'text-brand-muted/50',
    },
    gold: {
      container: 'bg-gradient-to-br from-brand-gold/8 to-brand-gold/3 border border-brand-gold/20',
      icon: 'text-brand-gold/80',
      iconBg: 'bg-brand-gold/10',
      value: 'text-brand-light',
      label: 'text-brand-gold/60',
    },
    danger: {
      container: 'bg-gradient-to-br from-red-950/40 to-red-950/20 border border-red-800/30',
      icon: 'text-red-400/80',
      iconBg: 'bg-red-500/10',
      value: 'text-red-300',
      label: 'text-red-400/60',
    },
    success: {
      container: 'bg-gradient-to-br from-emerald-950/40 to-emerald-950/20 border border-emerald-800/30',
      icon: 'text-emerald-400/80',
      iconBg: 'bg-emerald-500/10',
      value: 'text-emerald-300',
      label: 'text-emerald-400/60',
    },
  };

  const style = accentStyles[accent];

  return (
    <motion.div
      variants={fadeSlideUp}
      className={`relative overflow-hidden rounded-2xl ${style.container} p-5 backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/30 hover:shadow-[0_8px_32px_-12px_rgba(201,160,60,0.15)]`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-gold/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center`}>
            <span className={style.icon}>{icon}</span>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
              <TrendUp size={12} weight="bold" className={trend < 0 ? 'rotate-180' : ''} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className={`text-2xl md:text-3xl font-bold ${style.value} tracking-tight mb-1`}>{value}</p>
          <p className={`text-[11px] font-medium uppercase tracking-wider ${style.label}`}>{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

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
  const [consignmentFilter, setConsignmentFilter] = useState<'all' | 'consignment' | 'regular'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('inventory.title')}`; }, [t]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    outOfStockCount: products.filter((p) => p.quantity === 0).length,
    totalValueUsd: products.filter((p) => !p.is_consignment).reduce((sum, p) => sum + p.price_usd * p.quantity, 0),
    categoryCount: new Set(products.filter((p) => p.category?.name).map((p) => p.category!.name)).size,
    consignmentCount: products.filter((p) => p.is_consignment).length,
    regularCount: products.filter((p) => !p.is_consignment).length,
  }), [products]);

  const filtered = useMemo(() => {
    let result = products;

    if (consignmentFilter === 'consignment') {
      result = result.filter((p) => p.is_consignment);
    } else if (consignmentFilter === 'regular') {
      result = result.filter((p) => !p.is_consignment);
    }

    if (!search) return result;
    const q = search.toLowerCase();
    return result.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  }, [products, search, consignmentFilter]);

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
    <div className="min-h-[100dvh] max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="pt-8 pb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/20 flex items-center justify-center">
                <Archive size={20} weight="duotone" className="text-brand-gold" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-light tracking-tight">
                {t('inventory.title')}
              </h1>
            </div>
            <p className="text-sm text-brand-muted/50 ml-[52px]">
              {filtered.length > 0 && (
                <span>
                  {filtered.length} {t('common.products', { defaultValue: 'Products' })}
                  {search && ` matching "${search}"`}
                </span>
              )}
              {filtered.length === 0 && stats.totalProducts > 0 && 'No products match your filter'}
              {stats.totalProducts === 0 && 'Start by adding your first product'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCatManagerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-dark/80 backdrop-blur-sm border border-brand-border/40 text-brand-muted font-medium rounded-xl hover:text-brand-light hover:border-brand-gold/30 transition-all duration-300 text-sm"
            >
              <GridFour size={16} weight="bold" />
              {t('categories.manageButton')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-gold to-amber-400" />
              <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/10 to-transparent" />
              <span className="relative text-sm font-bold text-brand-black tracking-wide">
                {t('inventory.addProduct')}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <KpiCard
          icon={<Cube size={20} weight="duotone" />}
          label={t('dashboard.totalProducts')}
          value={stats.totalProducts}
          delay={0}
        />
        <KpiCard
          icon={<WarningCircle size={20} weight="duotone" />}
          label={t('inventory.outOfStock', 'Out of Stock')}
          value={stats.outOfStockCount}
          accent={stats.outOfStockCount > 0 ? 'danger' : 'default'}
          delay={0.1}
        />
        <KpiCard
          icon={<CurrencyDollar size={20} weight="duotone" />}
          label={t('inventory.totalValueUsd', 'Total Value')}
          value={`$${stats.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          accent="gold"
          delay={0.2}
        />
        <KpiCard
          icon={<TagSimple size={20} weight="duotone" />}
          label={t('inventory.filterConsignment', 'Consignment')}
          value={stats.consignmentCount}
          delay={0.3}
        />
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
        className="relative mb-6"
      >
        <div className="relative flex flex-col sm:flex-row gap-3 p-4 bg-brand-dark/50 backdrop-blur-xl border border-brand-border/30 rounded-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlass size={18} weight="bold" className={`transition-colors duration-300 ${isSearchFocused ? 'text-brand-gold' : 'text-brand-muted/40'}`} />
            </div>
            <input
              id="inv-search"
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-3 bg-brand-black/40 border border-brand-border/40 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/40 hover:border-brand-gold/20 transition-all duration-300"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-muted/40 hover:text-brand-light transition-colors"
              >
                <span className="text-[10px] font-mono bg-brand-border/30 px-1.5 py-0.5 rounded">ESC</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 sm:pl-4 sm:border-l sm:border-brand-border/30">
            <div className="flex items-center bg-brand-black/30 rounded-xl p-1 gap-1">
              <FilterButton
                active={consignmentFilter === 'all'}
                onClick={() => setConsignmentFilter('all')}
                count={stats.totalProducts}
              >
                {t('inventory.filterAll', 'All')}
              </FilterButton>
              <FilterButton
                active={consignmentFilter === 'consignment'}
                onClick={() => setConsignmentFilter('consignment')}
                count={stats.consignmentCount}
                accent="amber"
                icon={<Tag size={12} weight="bold" />}
              >
                {t('inventory.filterConsignment', 'Consignment')}
              </FilterButton>
              <FilterButton
                active={consignmentFilter === 'regular'}
                onClick={() => setConsignmentFilter('regular')}
                count={stats.regularCount}
              >
                {t('inventory.filterRegular', 'Regular')}
              </FilterButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-950/30 border border-red-800/40 rounded-xl flex items-center gap-3"
          >
            <WarningCircle size={20} weight="duotone" className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-brand-dark/60 rounded-2xl border border-brand-border/20 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-brand-border/20">
                <div className="space-y-1.5">
                  <Skeleton className="h-2 w-12 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-2 w-12 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border/20">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filtered.length === 0 && search && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-brand-dark/60 border border-brand-border/30 flex items-center justify-center">
            <MagnifyingGlass size={32} weight="thin" className="text-brand-muted/25" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-brand-light/70 mb-1">No results found</p>
            <p className="text-sm text-brand-muted/40">Try a different search term</p>
          </div>
          <button
            onClick={() => setSearch('')}
            className="text-sm text-brand-gold hover:text-brand-gold/80 transition-colors"
          >
            Clear search
          </button>
        </motion.div>
      )}

      {!isLoading && !error && products.length === 0 && !search && (
        <EmptyState
          title={t('inventory.noProducts')}
          description={t('inventory.emptyDescription', 'Start by adding your first product to track inventory')}
          action={{ label: t('inventory.addProduct'), onClick: handleAdd }}
        />
      )}

      {/* Product Grid */}
      {!isLoading && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ProductList
            products={filtered}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        </motion.div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        open={formOpen}
        onClose={handleCloseForm}
        product={editingProduct}
        onSubmit={async (data) => {
          try {
            if (editingProduct) {
              await updateProductMutation.mutateAsync({ id: editingProduct.id, payload: data });
            } else {
              await createProductMutation.mutateAsync(data as NewProduct);
            }
            handleCloseForm();
          } catch {
            // Error is already displayed via error prop
          }
        }}
        loading={createProductMutation.isPending || updateProductMutation.isPending}
        error={createProductMutation.error?.message || updateProductMutation.error?.message}
      />

      {/* Category Manager */}
      <CategoryManager
        open={catManagerOpen}
        onClose={() => setCatManagerOpen(false)}
        categories={categories}
        onAdd={(name) => createCategoryMutation.mutate(name)}
        onUpdate={(id, name) => updateCategoryMutation.mutate({ id, name })}
        onDelete={(id) => deleteCategoryMutation.mutate(id)}
        loading={createCategoryMutation.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending}
      />

      {/* Delete Confirmation */}
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

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count?: number;
  accent?: 'default' | 'amber';
  icon?: React.ReactNode;
}

const FilterButton = ({ children, active, onClick, count, accent = 'default', icon }: FilterButtonProps) => {
  const activeStyles = {
    default: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
    amber: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
  };

  const inactiveStyles = {
    default: 'text-brand-muted/60 hover:text-brand-light hover:bg-brand-border/10 border-transparent',
    amber: 'text-brand-muted/60 hover:text-amber-300 hover:bg-amber-900/15 border-transparent',
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
        active ? activeStyles[accent] : inactiveStyles[accent]
      }`}
    >
      {icon}
      {children}
      {count !== undefined && count > 0 && (
        <span className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded-md ${
          active ? 'bg-brand-gold/20 text-brand-gold' : 'bg-brand-border/20 text-brand-muted/50'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};
