import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, WarningCircle } from '@phosphor-icons/react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4">
        <div className="bg-brand-dark/95 backdrop-blur-xl rounded-2xl p-5 md:p-7 w-full max-w-2xl mx-auto border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)] animate-pulse">
          <div className="h-6 w-48 bg-brand-surface-hover rounded-xl mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-brand-surface-hover rounded-xl" />
            ))}
          </div>
          <div className="h-8 bg-brand-surface-hover rounded-xl mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-brand-surface-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const error = orderError || itemsError;

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4">
        <div className="bg-brand-dark/95 backdrop-blur-xl rounded-2xl p-5 md:p-7 w-full max-w-md mx-auto border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)] text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/10 flex items-center justify-center">
            <WarningCircle size={28} weight="fill" className="text-red-400" />
          </div>
          <p className="text-brand-muted mb-5">{t('common.noData')}</p>
          <button onClick={onClose} className="px-5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-muted hover:bg-brand-surface-hover transition-all duration-300 ease-out-expo">{t('common.close')}</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
        className="bg-brand-dark/95 backdrop-blur-xl rounded-2xl p-5 md:p-7 w-full max-w-2xl mx-auto border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)] max-h-[90dvh] md:max-h-[85dvh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover transition-all duration-150 active:scale-[0.92]"
        >
          <X size={16} weight="bold" />
        </button>

        <h2 className="mb-6 text-xl font-bold text-brand-gold tracking-tight">
          {t('purchases.orderDetails')}
        </h2>

        {error && (
          <div className="mb-5 p-3.5 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-start gap-2.5">
            <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
            <span>{error.message}</span>
          </div>
        )}

        <PODetailInfo order={order} />

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-brand-gold tracking-wide uppercase mb-4">
            {t('purchases.items')}
            <span className="text-brand-muted font-mono text-xs ml-2">({orderItems.length})</span>
          </h3>
          <POItemsTable items={orderItems} />
        </div>

        {order.status === 'pending' && (
          <div className="mt-6 pt-6 border-t border-brand-border/50">
            <POReceiveButton receiving={receiving} onClick={handleReceiveStock} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
