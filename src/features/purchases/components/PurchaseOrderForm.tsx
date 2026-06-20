import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, WarningCircle } from '@phosphor-icons/react';
import { useSuppliers } from '@/features/purchases/hooks/useSuppliers';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { useCreatePurchaseOrder } from '@/features/purchases/hooks/useCreatePurchaseOrder';
import { POFormHeader } from '@/features/purchases/components/purchase-orders/POFormHeader';
import { POItemRow } from '@/features/purchases/components/purchase-orders/POItemRow';
import type { PurchaseOrderItemInput } from '@/features/purchases/hooks/useCreatePurchaseOrder';

type ItemField = 'product_id' | 'quantity' | 'unit_price_usd' | 'unit_price_syp';

interface ItemRow {
  _key: number;
  product_id: string;
  quantity: string;
  unit_price_usd: string;
  unit_price_syp: string;
}

interface PurchaseOrderFormProps {
  open: boolean;
  onClose: () => void;
}

let nextKey = 1;
const createItem = (): ItemRow => ({ _key: nextKey++, product_id: '', quantity: '', unit_price_usd: '', unit_price_syp: '' });

export const PurchaseOrderForm = ({ open, onClose }: PurchaseOrderFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    supplier_id: '',
    items: [createItem()],
  });
  const { data: suppliers = [] } = useSuppliers();
  const { data: products = [] } = useProducts();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleItemChange = (index: number, field: ItemField, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = value;
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const order = {
        supplier_id: formData.supplier_id,
        order_date: new Date().toISOString().split('T')[0],
        total_usd: 0,
        total_syp: 0,
        status: 'pending',
      };

      const items: PurchaseOrderItemInput[] = formData.items
        .filter(item => item.product_id && item.quantity && item.unit_price_usd && item.unit_price_syp)
        .map(item => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity),
          unit_price_usd: parseFloat(item.unit_price_usd),
          unit_price_syp: parseFloat(item.unit_price_syp),
        }));

      if (!formData.supplier_id) {
        throw new Error('Please select a supplier');
      }
      if (items.length === 0) {
        throw new Error('Please add at least one item');
      }

      let totalUsd = 0;
      let totalSyp = 0;
      items.forEach(item => {
        totalUsd += item.unit_price_usd * item.quantity;
        totalSyp += item.unit_price_syp * item.quantity;
      });

      await createPurchaseOrder.mutateAsync({ order: { ...order, total_usd: totalUsd, total_syp: totalSyp }, items });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-brand-dark/95 backdrop-blur-xl rounded-2xl p-5 md:p-7 w-full max-w-2xl mx-auto relative border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)] max-h-[90dvh] md:max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover transition-all duration-150 active:scale-[0.92]"
            >
              <X size={16} weight="bold" />
            </button>

            <h2 className="mb-6 text-xl font-bold text-brand-gold tracking-tight">{t('purchases.addOrder')}</h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-5 p-3.5 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-start gap-2.5"
              >
                <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
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
                      canRemove={formData.items.length > 1}
                      onItemChange={handleItemChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? t('purchases.creatingOrder') : t('purchases.createOrder')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
