import { useTranslation } from 'react-i18next';
import { useState } from 'react';
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
      const order: { supplier_id: string | null; order_date: string; total_usd: number; total_syp: number; status: string } = {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)]">
      <div className="bg-brand-dark rounded-xl p-6 w-full max-w-2xl relative border border-brand-border shadow-floating max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-brand-muted hover:text-brand-gold transition-colors text-xl leading-none"
        >
          ×
        </button>
        <h2 className="mb-6 text-center text-2xl font-bold text-brand-gold tracking-tight">{t('purchases.addOrder')}</h2>

        {error && (
          <p className="mb-2 p-2 bg-red-900/50 text-red-300 rounded-lg">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <POFormHeader
            supplierId={formData.supplier_id}
            suppliers={suppliers}
            onChange={handleSupplierChange}
          />

          <>
            <label className="block text-sm font-medium text-brand-gold mb-1 tracking-wide uppercase">{t('purchases.items')}</label>
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
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm text-brand-gold hover:text-[var(--clr-gold-hover)] transition-colors font-medium"
              >
                + {t('purchases.addItem')}
              </button>
            </div>
          </>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-50 shadow-sm active:scale-[0.98]"
          >
            {loading ? t('purchases.creatingOrder') : t('purchases.createOrder')}
          </button>
        </form>
      </div>
    </div>
  );
};