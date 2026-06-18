import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { usePurchaseOrder } from '@/features/purchases/hooks/usePurchaseOrders';
import { usePurchaseOrderItems } from '@/features/purchases/hooks/usePurchaseOrderItems';
import { useUpdatePurchaseOrderStatus } from '@/features/purchases/hooks/useUpdatePurchaseOrderStatus';
import { useReceiveStock } from '@/features/purchases/hooks/useReceiveStock';
import { PODetailInfo } from '@/features/purchases/components/purchase-orders/PODetailInfo';
import { POItemsTable } from '@/features/purchases/components/purchase-orders/POItemsTable';
import { POReceiveButton } from '@/features/purchases/components/purchase-orders/POReceiveButton';
import { useToastStore } from '@/features/shared/store/toastSlice';
import type { PurchaseOrder } from '@/types/purchases';

interface PurchaseOrderDetailProps {
  orderId: string;
  onClose: () => void;
  onReceiveStock: (order: PurchaseOrder) => void;
}

export const PurchaseOrderDetail = ({
  orderId,
  onClose,
  onReceiveStock,
}: PurchaseOrderDetailProps) => {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const { data: order, isLoading: orderLoading, error: orderError } = usePurchaseOrder(orderId);
  const { data: orderItems = [], error: itemsError } = usePurchaseOrderItems(orderId);
  const receiveStock = useReceiveStock();
  const updateStatus = useUpdatePurchaseOrderStatus();
  const [receiving, setReceiving] = useState(false);

  const handleReceiveStock = async () => {
    if (!order) return;
    setReceiving(true);
    try {
      for (const item of orderItems) {
        await receiveStock.mutateAsync({
          productId: item.product_id || '',
          quantity: item.quantity,
          unitCostUsd: item.unit_price_usd,
          unitCostSyp: item.unit_price_syp,
        });
      }
      await updateStatus.mutateAsync({ id: order.id, status: 'received' });
      onReceiveStock({ ...order, status: 'received' });
      onClose();
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('common.error'), 'error');
    } finally {
      setReceiving(false);
    }
  };

  if (orderLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)]">
        <div className="bg-brand-dark rounded-xl p-6 w-full max-w-xl shadow-floating">
          <p className="text-brand-muted text-center py-4">{t('purchases.loading')}</p>
        </div>
      </div>
    );
  }

  const error = orderError || itemsError;

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)]">
        <div className="bg-brand-dark rounded-xl p-6 w-full max-w-xl shadow-floating">
          <p className="text-red-400 text-center py-4">{t('common.noData')}</p>
          <button onClick={onClose} className="w-full py-2 bg-brand-surface-hover rounded-lg transition-all duration-200">{t('common.close')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)]">
      <div className="bg-brand-dark rounded-xl p-6 w-full max-w-2xl border border-brand-border shadow-floating max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-brand-gold tracking-tight">{t('purchases.orderDetails')}</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-gold text-2xl transition-colors">&times;</button>
        </div>

        {error && <p className="mb-2 p-2 bg-red-900/50 text-red-300 rounded-lg">{error.message}</p>}

        <PODetailInfo order={order} />

        <h3 className="text-lg font-medium text-brand-gold mb-3 border-b border-brand-border pb-2">{t('purchases.items')}</h3>
        <POItemsTable items={orderItems} />

        {order.status === 'pending' && (
          <div className="mt-6"><POReceiveButton receiving={receiving} onClick={handleReceiveStock} /></div>
        )}
      </div>
    </div>
  );
};