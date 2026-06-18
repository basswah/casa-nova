import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { PurchaseOrderList } from '@/features/purchases/components/PurchaseOrderList';
import { PurchaseOrderForm } from '@/features/purchases/components/PurchaseOrderForm';
import { PurchaseOrderDetail } from '@/features/purchases/components/PurchaseOrderDetail';
import type { PurchaseOrder } from '@/types/purchases';

export const PurchaseOrdersPage = () => {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('purchases.title')}`; }, [t]);

  const handleCloseDetail = () => {
    setViewOrderId(null);
  };

  const handleReceiveStock = (order: PurchaseOrder) => {
    setReceivingOrder(order);
  };

  const handleCloseReceive = () => {
    setReceivingOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-gold tracking-tight">{t('purchases.title')}</h1>
        <button
          onClick={() => setOpenForm(true)}
          className="px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          {t('purchases.addOrder')}
        </button>
      </div>

      <PurchaseOrderList
        onReceiveStock={handleReceiveStock}
      />

      <PurchaseOrderForm
        open={openForm}
        onClose={() => setOpenForm(false)}
      />

      {viewOrderId && (
        <PurchaseOrderDetail
          orderId={viewOrderId}
          onClose={handleCloseDetail}
          onReceiveStock={handleReceiveStock}
        />
      )}

      {receivingOrder && (
        <PurchaseOrderDetail
          orderId={receivingOrder.id}
          onClose={handleCloseReceive}
          onReceiveStock={handleReceiveStock}
        />
      )}
    </div>
  );
};