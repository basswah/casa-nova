import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, WarningCircle } from '@phosphor-icons/react';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import { useCreateCategory } from '@/features/inventory/hooks/useCategories';
import { useCreateProduct } from '@/features/inventory/hooks/useProducts';
import { useToastStore } from '@/features/shared/store/toastSlice';

interface NewProductModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (product: { id: string; name: string }) => void;
  exchangeRate: number;
}

const inputClass = 'w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo';

export const NewProductModal = ({ open, onClose, onCreated, exchangeRate }: NewProductModalProps) => {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const createProduct = useCreateProduct();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costUsd, setCostUsd] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const costSyp = (parseFloat(costUsd) || 0) * exchangeRate;
  const priceSyp = (parseFloat(priceUsd) || 0) * exchangeRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error(t('purchases.nameRequired', 'Product name is required'));

      let finalCategoryId = categoryId;

      if (showNewCategory && newCategoryName.trim()) {
        const cat = await createCategory.mutateAsync(newCategoryName.trim());
        finalCategoryId = cat.id;
      }

      const product = await createProduct.mutateAsync({
        name: name.trim(),
        sku: null,
        category_id: finalCategoryId || null,
        price_usd: parseFloat(priceUsd) || 0,
        price_syp: priceSyp,
        cost_usd: parseFloat(costUsd) || 0,
        cost_syp: costSyp,
        quantity: 0,
      });

      onCreated({ id: product.id, name: product.name });
      addToast(t('purchases.productCreated', 'Product created successfully'), 'success');
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCategoryId('');
    setCostUsd('');
    setPriceUsd('');
    setNewCategoryName('');
    setShowNewCategory(false);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="np-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            key="np-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="bg-brand-dark/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-lg mx-auto relative border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              type="button"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover transition-all duration-150 active:scale-[0.92]"
            >
              <X size={18} weight="bold" />
            </button>

            <h2 className="mb-6 text-xl md:text-2xl font-bold text-brand-gold tracking-tight">
              {t('purchases.addNewProduct', 'Add New Product')}
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-5 p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-start gap-2.5"
              >
                <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('purchases.productName')} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('purchases.enterProductName', 'Enter product name')}
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('inventory.category')}</label>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder={t('purchases.enterCategoryName', 'Category name')}
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }}
                      className="px-3 py-2 text-xs font-medium text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover rounded-xl transition-all duration-200"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className={`${inputClass} flex-1`}
                    >
                      <option value="">{t('purchases.selectCategory', 'Select category')}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-3 py-2 text-xs font-medium text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 rounded-xl transition-all duration-200"
                    >
                      + {t('purchases.newCategory', 'New')}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('purchases.costUsd', 'Cost (USD)')} *</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={costUsd}
                    onChange={(e) => setCostUsd(e.target.value)}
                    placeholder="0.00"
                    className={`${inputClass} font-mono`}
                  />
                  <p className="text-[10px] text-brand-muted/50 mt-1 font-mono">
                    {costSyp > 0 ? `${costSyp.toLocaleString()} SYP` : '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('purchases.priceUsd', 'Price (USD)')} *</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="0.00"
                    className={`${inputClass} font-mono`}
                  />
                  <p className="text-[10px] text-brand-muted/50 mt-1 font-mono">
                    {priceSyp > 0 ? `${priceSyp.toLocaleString()} SYP` : '—'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? t('common.saving') : t('purchases.createAndAdd', 'Create & Add to Invoice')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
