import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, type Easing } from 'framer-motion';
import { X, WarningCircle, Tag, Package, CurrencyCircleDollar } from '@phosphor-icons/react';
import { productSchema, type ProductFormData } from '@/features/inventory/validations/productSchema';
import type { Product, NewProduct, UpdateProduct } from '@/types/inventory';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import { useSuppliers } from '@/features/purchases/hooks/useSuppliers';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';

function generateSku(): string {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GEN-${random}`;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: NewProduct | UpdateProduct) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];
const easeOutBack: Easing = [0.34, 1.56, 0.64, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const ProductForm = ({ open, onClose, product, onSubmit, loading, error }: ProductFormProps) => {
  const { t } = useTranslation();
  const isEdit = !!product;
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();
  const { data: settings } = useSettings();
  const exchangeRate = settings?.exchangeRate ?? 0;
  const skuRef = useRef(generateSku());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', category_id: '', price_usd: 0, cost_usd: 0, quantity: 0, is_consignment: false, supplier_id: null },
  });

  useEffect(() => {
    if (!open) return;
    skuRef.current = generateSku();
    reset(
      product
        ? {
            name: product.name,
            category_id: product.category_id ?? '',
            price_usd: product.price_usd,
            cost_usd: product.cost_usd,
            quantity: product.quantity,
            is_consignment: product.is_consignment,
            supplier_id: product.supplier_id ?? null,
          }
        : { name: '', category_id: '', price_usd: 0, cost_usd: 0, quantity: 0, is_consignment: false, supplier_id: null },
    );
  }, [open, product?.id, reset]);

  const currentSku = isEdit ? (product.sku ?? '') : skuRef.current;
  const watchPriceUsd = watch('price_usd');
  const watchCostUsd = watch('cost_usd');
  const watchIsConsignment = watch('is_consignment');
  const computedPriceSyp = exchangeRate > 0 ? watchPriceUsd * exchangeRate : 0;
  const computedCostSyp = exchangeRate > 0 ? watchCostUsd * exchangeRate : 0;

  const handleFormSubmit = (data: ProductFormData) => {
    const payload = {
      ...data,
      sku: isEdit ? product.sku : skuRef.current,
      category_id: data.category_id || null,
      supplier_id: data.is_consignment ? (data.supplier_id || null) : null,
      price_syp: computedPriceSyp,
      cost_syp: computedCostSyp,
    };
    onSubmit(payload);
    if (!isEdit) reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.4, ease: easeOutBack }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-brand-dark to-brand-black rounded-2xl border border-brand-border/40 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-5">
              {/* Gradient accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold/60 via-brand-gold to-brand-gold/60" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-gold/15 to-brand-gold/5 border border-brand-gold/20 flex items-center justify-center">
                    <Package size={20} weight="duotone" className="text-brand-gold" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-light tracking-tight">
                      {t(isEdit ? 'productForm.editProduct' : 'productForm.newProduct')}
                    </h2>
                    <p className="text-[11px] text-brand-muted/50">
                      {isEdit ? 'Update product information' : 'Fill in the product details'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-brand-muted/40 hover:text-brand-light hover:bg-brand-border/20 transition-all duration-200"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 pb-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3.5 bg-red-950/30 border border-red-800/40 rounded-xl flex items-center gap-3"
                >
                  <WarningCircle size={18} weight="duotone" className="text-red-400 shrink-0" />
                  <span className="text-sm text-red-300">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(handleFormSubmit)}>
                <motion.div className="space-y-5" variants={stagger} initial="initial" animate="animate">
                  {/* Product Name */}
                  <motion.div variants={fadeSlideUp}>
                    <label htmlFor="pf-name" className="block text-[11px] font-semibold text-brand-muted/70 uppercase tracking-wider mb-2">
                      {t('productForm.productName')}
                    </label>
                    <input
                      id="pf-name"
                      {...register('name')}
                      className="w-full px-4 py-3 bg-brand-black/50 border border-brand-border/50 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all duration-300"
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="mt-1.5 text-[11px] text-red-400">{errors.name.message}</p>}
                  </motion.div>

                  {/* SKU (Read-only) */}
                  <motion.div variants={fadeSlideUp}>
                    <label className="block text-[11px] font-semibold text-brand-muted/70 uppercase tracking-wider mb-2">
                      {t('inventory.sku')}
                    </label>
                    <div className="w-full px-4 py-3 bg-brand-border/10 border border-brand-border/30 rounded-xl text-sm text-brand-muted/60 font-mono">
                      {currentSku}
                    </div>
                  </motion.div>

                  {/* Category */}
                  <motion.div variants={fadeSlideUp}>
                    <label htmlFor="pf-category" className="block text-[11px] font-semibold text-brand-muted/70 uppercase tracking-wider mb-2">
                      {t('inventory.category')}
                    </label>
                    <select
                      id="pf-category"
                      {...register('category_id')}
                      className="w-full px-4 py-3 bg-brand-black/50 border border-brand-border/50 rounded-xl text-sm text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all duration-300 capitalize"
                      disabled={categoriesLoading}
                    >
                      <option value="">{t('productForm.selectCategory')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Pricing Section */}
                  <motion.div variants={fadeSlideUp}>
                    <div className="flex items-center gap-2 mb-3">
                      <CurrencyCircleDollar size={14} weight="duotone" className="text-brand-gold/60" />
                      <span className="text-[11px] font-semibold text-brand-muted/70 uppercase tracking-wider">
                        {t('inventory.priceUsd', 'Pricing')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-brand-black/30 rounded-xl border border-brand-border/20">
                      <div>
                        <label htmlFor="pf-price-usd" className="block text-[10px] text-brand-muted/50 mb-1.5">{t('inventory.priceUsd')}</label>
                        <input
                          id="pf-price-usd"
                          type="number"
                          step="0.01"
                          {...register('price_usd', { valueAsNumber: true })}
                          className="w-full px-3 py-2.5 bg-brand-black/60 border border-brand-border/40 rounded-lg text-sm text-brand-light font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all"
                          placeholder="0.00"
                        />
                        {errors.price_usd && <p className="mt-1 text-[10px] text-red-400">{errors.price_usd.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] text-brand-muted/50 mb-1.5">{t('inventory.priceSyp')}</label>
                        <div className="w-full px-3 py-2.5 bg-brand-border/10 border border-brand-border/30 rounded-lg text-sm text-brand-muted/60 font-mono">
                          {exchangeRate > 0 ? computedPriceSyp.toLocaleString() : '—'}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="pf-cost-usd" className="block text-[10px] text-brand-muted/50 mb-1.5">{t('inventory.costUsd')}</label>
                        <input
                          id="pf-cost-usd"
                          type="number"
                          step="0.01"
                          {...register('cost_usd', { valueAsNumber: true })}
                          className="w-full px-3 py-2.5 bg-brand-black/60 border border-brand-border/40 rounded-lg text-sm text-brand-light font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all"
                          placeholder="0.00"
                        />
                        {errors.cost_usd && <p className="mt-1 text-[10px] text-red-400">{errors.cost_usd.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] text-brand-muted/50 mb-1.5">{t('inventory.costSyp')}</label>
                        <div className="w-full px-3 py-2.5 bg-brand-border/10 border border-brand-border/30 rounded-lg text-sm text-brand-muted/60 font-mono">
                          {exchangeRate > 0 ? computedCostSyp.toLocaleString() : '—'}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quantity */}
                  <motion.div variants={fadeSlideUp}>
                    <label htmlFor="pf-qty" className="block text-[11px] font-semibold text-brand-muted/70 uppercase tracking-wider mb-2">
                      {t('productForm.quantity')}
                    </label>
                    <input
                      id="pf-qty"
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-brand-black/50 border border-brand-border/50 rounded-xl text-sm text-brand-light font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all duration-300"
                      placeholder="0"
                    />
                    {errors.quantity && <p className="mt-1.5 text-[11px] text-red-400">{errors.quantity.message}</p>}
                  </motion.div>

                  {/* Consignment Toggle */}
                  <motion.div variants={fadeSlideUp}>
                    <div className="flex items-center justify-between p-4 bg-brand-black/40 border border-brand-border/30 rounded-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                          watchIsConsignment ? 'bg-amber-500/15' : 'bg-brand-border/20'
                        }`}>
                          <Tag size={18} weight="duotone" className={watchIsConsignment ? 'text-amber-400' : 'text-brand-muted/50'} />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-brand-light">{t('productForm.isConsignment', 'Consignment')}</span>
                          <p className="text-[10px] text-brand-muted/50">{t('productForm.consignmentHint', 'بضاعة برسم البيع')}</p>
                        </div>
                      </div>
                      <Controller
                        name="is_consignment"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={field.value}
                            onClick={() => field.onChange(!field.value)}
                            className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:ring-offset-2 focus:ring-offset-brand-dark ${
                              field.value
                                ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_16px_-4px_rgba(245,158,11,0.5)]'
                                : 'bg-brand-border/40 hover:bg-brand-border/60'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 ease-out ${
                                field.value ? 'translate-x-6 scale-110' : 'translate-x-0'
                              }`}
                            />
                            <span className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-300 ${field.value ? 'opacity-100' : 'opacity-0'}`}>
                              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                            </span>
                          </button>
                        )}
                      />
                    </div>
                  </motion.div>

                  {/* Supplier Select (Conditional) */}
                  <AnimatePresence>
                    {watchIsConsignment && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: easeOutExpo }}
                      >
                        <label htmlFor="pf-supplier" className="block text-[11px] font-semibold text-brand-muted/70 uppercase tracking-wider mb-2">
                          {t('productForm.supplier', 'Supplier')}
                        </label>
                        <select
                          id="pf-supplier"
                          {...register('supplier_id')}
                          className="w-full px-4 py-3 bg-brand-black/50 border border-brand-border/50 rounded-xl text-sm text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all duration-300 capitalize"
                          disabled={suppliersLoading}
                        >
                          <option value="">{t('productForm.selectSupplier', 'Select supplier')}</option>
                          {suppliers.map((sup) => (
                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                          ))}
                        </select>
                        {errors.supplier_id && <p className="mt-1.5 text-[11px] text-red-400">{errors.supplier_id.message}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.div variants={fadeSlideUp} className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={loading || isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="relative w-full py-3.5 rounded-xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold to-amber-400" />
                      <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/15 to-transparent" />
                      <div className="relative flex items-center justify-center gap-2">
                        {loading || isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-brand-black" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm font-bold text-brand-black">{t('common.saving')}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-brand-black tracking-wide">
                            {isEdit ? t('productForm.updateProduct') : t('productForm.addProduct')}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
