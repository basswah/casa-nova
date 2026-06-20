import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, type Easing } from 'framer-motion';
import { X, WarningCircle } from '@phosphor-icons/react';
import { productSchema, type ProductFormData } from '@/features/inventory/validations/productSchema';
import type { Product, NewProduct, UpdateProduct } from '@/types/inventory';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';

function generateSku(): string {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GEN-${random}`;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: NewProduct | UpdateProduct) => void;
  loading?: boolean;
  error?: string | null;
}

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];
const easeOutBack: Easing = [0.34, 1.56, 0.64, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export const ProductForm = ({ open, onClose, product, onSubmit, loading, error }: ProductFormProps) => {
  const { t } = useTranslation();
  const isEdit = !!product;
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: settings } = useSettings();
  const exchangeRate = settings?.exchangeRate ?? 0;
  const skuRef = useRef(generateSku());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', category_id: '', price_usd: 0, cost_usd: 0, quantity: 0 },
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
          }
        : { name: '', category_id: '', price_usd: 0, cost_usd: 0, quantity: 0 },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const currentSku = isEdit ? (product.sku ?? '') : skuRef.current;
  const watchPriceUsd = watch('price_usd');
  const watchCostUsd = watch('cost_usd');
  const computedPriceSyp = exchangeRate > 0 ? watchPriceUsd * exchangeRate : 0;
  const computedCostSyp = exchangeRate > 0 ? watchCostUsd * exchangeRate : 0;

  const handleFormSubmit = (data: ProductFormData) => {
    const payload = {
      ...data,
      sku: isEdit ? product.sku : skuRef.current,
      category_id: data.category_id || null,
      price_syp: computedPriceSyp,
      cost_syp: computedCostSyp,
    };
    onSubmit(payload);
    if (!isEdit) reset();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-brand-black/60 border border-brand-border/40 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';
  const displayClass = 'w-full px-3 py-2.5 bg-brand-black/60 border border-brand-border/40 rounded-xl text-sm text-brand-muted/60 flex items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';
  const labelClass = 'block text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest mb-1.5';
  const errorClass = 'text-red-400/80 text-[11px] mt-1';

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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.35, ease: easeOutBack }}
            className="relative w-full max-w-lg bg-brand-dark/95 backdrop-blur-sm rounded-xl md:rounded-2xl border border-brand-border/30 shadow-[var(--shadow-floating)] max-h-[90vh] overflow-y-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center justify-between p-5 pb-0">
              <h2 className="text-sm font-bold text-brand-gold tracking-tight">
                {t(isEdit ? 'productForm.editProduct' : 'productForm.newProduct')}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted/40 hover:text-brand-light hover:bg-brand-black/40 transition-all duration-150 active:scale-[0.9]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-900/15 border border-red-800/30 rounded-xl flex items-start gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <WarningCircle size={16} weight="duotone" className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-400/80">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(handleFormSubmit)}>
                <motion.div className="space-y-4" variants={stagger} initial="initial" animate="animate">
                  <motion.div variants={fadeSlideUp}>
                    <label htmlFor="pf-name" className={labelClass}>{t('productForm.productName')}</label>
                    <input id="pf-name" {...register('name')} className={inputClass} placeholder={t('productForm.productName')} />
                    {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                  </motion.div>

                  <motion.div variants={fadeSlideUp}>
                    <label htmlFor="pf-sku" className={labelClass}>{t('inventory.sku')}</label>
                    <input id="pf-sku" value={currentSku} className={`${inputClass} opacity-40 cursor-not-allowed`} disabled />
                  </motion.div>

                  <motion.div variants={fadeSlideUp}>
                    <label htmlFor="pf-category" className={labelClass}>{t('inventory.category')}</label>
                    <select id="pf-category" {...register('category_id')} className={`${inputClass} capitalize`} disabled={categoriesLoading}>
                      <option value="">{t('productForm.selectCategory')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div variants={fadeSlideUp} className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pf-price-usd" className={labelClass}>{t('inventory.priceUsd')}</label>
                      <input id="pf-price-usd" type="number" step="0.01" {...register('price_usd', { valueAsNumber: true })} className={`${inputClass} font-mono`} placeholder="0.00" />
                      {errors.price_usd && <p className={errorClass}>{errors.price_usd.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>{t('inventory.priceSyp')}</label>
                      <div className={`${displayClass} font-mono h-[42px]`}>
                        {exchangeRate > 0 ? computedPriceSyp.toLocaleString() : t('common.noData')}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeSlideUp} className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pf-cost-usd" className={labelClass}>{t('inventory.costUsd')}</label>
                      <input id="pf-cost-usd" type="number" step="0.01" {...register('cost_usd', { valueAsNumber: true })} className={`${inputClass} font-mono`} placeholder="0.00" />
                      {errors.cost_usd && <p className={errorClass}>{errors.cost_usd.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>{t('inventory.costSyp')}</label>
                      <div className={`${displayClass} font-mono h-[42px]`}>
                        {exchangeRate > 0 ? computedCostSyp.toLocaleString() : t('common.noData')}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeSlideUp}>
                    <label htmlFor="pf-qty" className={labelClass}>{t('productForm.quantity')}</label>
                    <input id="pf-qty" type="number" {...register('quantity', { valueAsNumber: true })} className={`${inputClass} font-mono`} placeholder="0" />
                    {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
                  </motion.div>

                  <motion.div variants={fadeSlideUp} className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl text-sm tracking-wide hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_28px_-6px_rgba(212,175,55,0.3)] transition-all duration-300 ease-out-expo disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                      {loading || isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t('common.saving')}
                        </span>
                      ) : isEdit ? t('productForm.updateProduct') : t('productForm.addProduct')}
                    </button>
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
