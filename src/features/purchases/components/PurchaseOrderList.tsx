import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { usePurchaseOrders } from '@/features/purchases/hooks/usePurchaseOrders';
import { useUpdatePurchaseOrderStatus } from '@/features/purchases/hooks/useUpdatePurchaseOrderStatus';
import { POFilterBar } from '@/features/purchases/components/purchase-orders/POFilterBar';
import { POListTable } from '@/features/purchases/components/purchase-orders/POListTable';
import { DeleteConfirmDialog } from '@/features/shared/components/DeleteConfirmDialog';
import { PurchaseOrderDetail } from '@/features/purchases/components/PurchaseOrderDetail';
import type { PurchaseOrder } from '@/types/purchases';

interface PurchaseOrderListProps {
  onReceiveStock: (order: PurchaseOrder) => void;
}

export const PurchaseOrderList = ({ onReceiveStock }: PurchaseOrderListProps) => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading, error } = usePurchaseOrders();
  const updateOrderStatus = useUpdatePurchaseOrderStatus();
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'received' | 'cancelled'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const handleViewOrder = (id: string) => {
    setViewOrderId(id);
  };

  const handleCloseDetail = () => {
    setViewOrderId(null);
  };

  const handleDeleteRequest = (order: PurchaseOrder) => {
    setDeleteTarget(order);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await updateOrderStatus.mutateAsync({ id: deleteTarget.id, status: 'cancelled' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleReceiveStock = (order: PurchaseOrder) => {
    onReceiveStock(order);
  };

  if (isLoading) {
    return <p className="text-brand-muted text-center py-8">{t('purchases.loading')}</p>;
  }

  if (error) {
    return <p className="text-red-400 text-center py-8">{t('common.error')}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-gold tracking-tight">{t('purchases.title')}</h2>
        <POFilterBar filterStatus={filterStatus} onChange={setFilterStatus} />
      </div>

      <POListTable
        orders={filteredOrders}
        onView={handleViewOrder}
        onReceive={handleReceiveStock}
        onDelete={handleDeleteRequest}
      />

      {viewOrderId && (
        <PurchaseOrderDetail
          orderId={viewOrderId}
          onClose={handleCloseDetail}
          onReceiveStock={handleReceiveStock}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={t('purchases.cancelOrder')}
        message={t('purchases.cancelConfirm', { name: deleteTarget?.supplier?.name || t('purchases.noSupplier') })}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};