import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, WarningCircle } from '@phosphor-icons/react';
import { useSuppliers } from '@/features/purchases/hooks/useSuppliers';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';
import { POFormHeader } from '@/features/purchases/components/purchase-orders/POFormHeader';
import { POItemRow } from '@/features/purchases/components/purchase-orders/POItemRow';
import { NewProductModal } from '@/features/purchases/components/purchase-orders/NewProductModal';

interface ItemRow {
  _key: number;
  product_id: string;
  product_name: string;
  quantity: string;
  unit_price_usd: string;
}

interface PurchaseOrderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (order: { supplier_id: string; order_date: string; total_usd: number; total_syp: number; status: string }, items: { product_id: string | null; product_name: string; quantity: number; unit_price_usd: number; unit_price_syp: number }[]) => void;
}

let nextKey = 1;
const createItem = (): ItemRow => ({ _key: nextKey++, product_id: '', product_name: '', quantity: '', unit_price_usd: '' });

export const PurchaseOrderForm = ({ open, onClose, onSubmit }: PurchaseOrderFormProps) => {
  const { t } = useTranslation();
  const { data: suppliers = [] } = useSuppliers();
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const exchangeRate = settings?.exchangeRate ?? 0;

  const [formData, setFormData] = useState({
    supplier_id: '',
    items: [createItem()],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);

  const handleSupplierChange = (supplier_id: string) => {
    setFormData(prev => ({ ...prev, supplier_id }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, createItem()],
    }));
  };

  const handleRemoveItem = (key: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((i) => i._key !== key),
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleNewProductCreated = (product: { id: string; name: string }) => {
    setFormData(prev => {
      const lastKey = prev.items.length > 0 ? prev.items[prev.items.length - 1]._key : 0;
      const emptyIndex = prev.items.findIndex(i => !i.product_id && !i.product_name);
      if (emptyIndex >= 0) {
        const newItems = [...prev.items];
        newItems[emptyIndex] = { ...newItems[emptyIndex], product_id: product.id, product_name: product.name };
        return { ...prev, items: newItems };
      }
      return { ...prev, items: [...prev.items, { _key: lastKey + 1, product_id: product.id, product_name: product.name, quantity: '', unit_price_usd: '' }] };
    });
    setShowNewProduct(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!formData.supplier_id) {
        throw new Error(t('purchases.selectSupplier', 'Please select a supplier'));
      }

      const items = formData.items
        .filter(item => item.product_name && item.quantity && item.unit_price_usd)
        .map(item => ({
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: parseInt(item.quantity),
          unit_price_usd: parseFloat(item.unit_price_usd),
          unit_price_syp: Math.round(parseFloat(item.unit_price_usd) * exchangeRate),
        }));

      if (items.length === 0) {
        throw new Error(t('purchases.addAtLeastOne', 'Please add at least one item'));
      }

      let totalUsd = 0;
      let totalSyp = 0;
      items.forEach(item => {
        totalUsd += item.unit_price_usd * item.quantity;
        totalSyp += item.unit_price_syp * item.quantity;
      });

      onSubmit(
        {
          supplier_id: formData.supplier_id,
          order_date: new Date().toISOString().split('T')[0],
          total_usd: totalUsd,
          total_syp: totalSyp,
          status: 'received',
        },
        items,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const totalSyp = formData.items.reduce((sum, item) => {
    const qty = parseInt(item.quantity) || 0;
    const price = parseFloat(item.unit_price_usd) || 0;
    return sum + qty * price * exchangeRate;
  }, 0);

  const totalUsd = formData.items.reduce((sum, item) => {
    const qty = parseInt(item.quantity) || 0;
    const price = parseFloat(item.unit_price_usd) || 0;
    return sum + qty * price;
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            key="form-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="bg-brand-dark/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-3xl mx-auto relative border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)] max-h-[90dvh] md:max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover transition-all duration-150 active:scale-[0.92]"
            >
              <X size={18} weight="bold" />
            </button>

            <h2 className="mb-6 text-xl md:text-2xl font-bold text-brand-gold tracking-tight">{t('purchases.addInvoice')}</h2>

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <POFormHeader
                supplierId={formData.supplier_id}
                suppliers={suppliers}
                onChange={handleSupplierChange}
              />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-brand-gold tracking-wide uppercase">{t('purchases.items')}</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-medium text-brand-gold hover:text-[var(--clr-gold-hover)] transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} weight="bold" />
                    {t('purchases.addItem')}
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <POItemRow
                      key={item._key}
                      item={item}
                      index={index}
                      products={products}
                      exchangeRate={exchangeRate}
                      canRemove={formData.items.length > 1}
                      onItemChange={handleItemChange}
                      onRemove={handleRemoveItem}
                      onNewProduct={() => setShowNewProduct(true)}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-brand-black/30 rounded-xl border border-brand-border/50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.total')} USD</span>
                  <span className="text-lg font-bold font-mono text-brand-gold">${totalUsd.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.total')} SYP</span>
                  <span className="text-lg font-bold font-mono text-brand-light">{totalSyp.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? t('common.saving') : t('purchases.createInvoice')}
              </button>
            </form>

            <NewProductModal
              open={showNewProduct}
              onClose={() => setShowNewProduct(false)}
              onCreated={handleNewProductCreated}
              exchangeRate={exchangeRate}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
