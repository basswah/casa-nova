import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, WarningCircle } from '@phosphor-icons/react';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';
import { useCreatePurchaseReturn } from '@/features/purchases/hooks/usePurchaseReturns';
import { useToastStore } from '@/features/shared/store/toastSlice';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface PurchaseReturnFormProps {
  open: boolean;
  onClose: () => void;
}

const inputClass = 'w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo';

export const PurchaseReturnForm = ({ open, onClose }: PurchaseReturnFormProps) => {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const exchangeRate = settings?.exchangeRate ?? 0;
  const createReturn = useCreatePurchaseReturn();

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [priceUsd, setPriceUsd] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);

  const handleProductChange = (id: string) => {
    setProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setPriceUsd(String(prod.cost_usd || 0));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!productId) throw new Error(t('returns.selectProduct', 'Please select a product'));

      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1) throw new Error(t('shortages.invalidQuantity', 'Quantity must be at least 1'));

      const priceUsdNum = parseFloat(priceUsd) || 0;

      await createReturn.mutateAsync({
        product_id: productId,
        po_id: null,
        quantity: qty,
        unit_price_usd: priceUsdNum,
        unit_price_syp: Math.round(priceUsdNum * exchangeRate),
        reason: reason.trim() || null,
        created_by: user?.id ?? null,
      });

      addToast(t('returns.created', 'Return recorded successfully'), 'success');
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProductId('');
    setQuantity('1');
    setPriceUsd('');
    setReason('');
    setError(null);
    onClose();
  };

  const totalUsd = (parseFloat(priceUsd) || 0) * (parseInt(quantity) || 0);
  const totalSyp = totalUsd * exchangeRate;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ret-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            key="ret-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="bg-brand-dark/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-lg mx-auto relative border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)] max-h-[90dvh] md:max-h-[85dvh] overflow-y-auto"
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
              {t('returns.addReturn', 'Record Purchase Return')}
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
                <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('returns.product', 'Product')} *</label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('returns.selectProduct', 'Select product')}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {t('common.stock')}: {p.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('common.quantity')} *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity ?? 9999}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('returns.refundUsd', 'Refund (USD)')} *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div className="bg-brand-black/30 rounded-xl border border-brand-border/50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('returns.totalRefund', 'Total Refund')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono text-brand-gold">${totalUsd.toFixed(2)}</span>
                  <span className="text-sm font-mono text-brand-muted/60">{totalSyp.toLocaleString()} SYP</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('returns.reason', 'Reason')}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('returns.reasonPlaceholder', 'Why is this being returned?')}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !productId}
                className="w-full py-3.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? t('common.saving') : t('returns.submitReturn', 'Record Return')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
