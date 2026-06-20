import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, WarningCircle } from '@phosphor-icons/react';
import { usePurchaseOrders } from '@/features/purchases/hooks/usePurchaseOrders';
import { useUpdatePurchaseOrderStatus } from '@/features/purchases/hooks/useUpdatePurchaseOrderStatus';
import { POListTable } from '@/features/purchases/components/purchase-orders/POListTable';
import { DeleteConfirmDialog } from '@/features/shared/components/DeleteConfirmDialog';
import { EmptyState } from '@/features/shared/components/EmptyState';
import type { PurchaseOrder } from '@/types/purchases';

interface PurchaseOrderListProps {
  onReceiveStock: (order: PurchaseOrder) => void;
  onViewOrder: (id: string) => void;
  onAddOrder: () => void;
}

type FilterStatus = 'all' | 'pending' | 'received' | 'cancelled';

export const PurchaseOrderList = ({ onReceiveStock, onViewOrder, onAddOrder }: PurchaseOrderListProps) => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading, error } = usePurchaseOrders();
  const updateOrderStatus = useUpdatePurchaseOrderStatus();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      order.supplier?.name?.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      order.total_usd.toFixed(2).includes(q)
    );
  });

  const handleDeleteRequest = (order: PurchaseOrder) => setDeleteTarget(order);

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

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('purchases.filterAll') },
    { key: 'pending', label: t('purchases.filterPending') },
    { key: 'received', label: t('purchases.filterReceived') },
    { key: 'cancelled', label: t('purchases.filterCancelled') },
  ];

  const handleView = (id: string) => onViewOrder(id);
  const handleReceive = (order: PurchaseOrder) => onReceiveStock(order);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/40">
            <MagnifyingGlass size={16} />
          </div>
          <label htmlFor="po-search" className="sr-only">{t('common.search')}</label>
          <input
            id="po-search"
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 transition-all duration-300 ease-out-expo"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-brand-dark rounded-xl border border-brand-border overflow-x-auto">
          {filterTabs.map((tab) => {
            const count = tab.key === 'all'
              ? orders.length
              : orders.filter((o) => o.status === tab.key).length;
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ease-out-expo active:scale-[0.97] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-gold text-brand-black shadow-sm'
                    : 'text-brand-muted hover:text-brand-light'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-mono ${isActive ? 'text-brand-black/60' : 'text-brand-muted/50'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gradient-to-r from-brand-surface-hover via-brand-dark to-brand-surface-hover rounded-xl bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-center gap-2.5"
        >
          <WarningCircle size={18} weight="fill" className="shrink-0" />
          {error.message}
        </motion.div>
      )}

      {/* Empty */}
      {!isLoading && !error && filteredOrders.length === 0 && (
        <EmptyState
          title={search ? t('common.noResults') : t('purchases.noOrders')}
          description={search ? t('common.tryDifferentSearch') : t('purchases.emptyDescription', 'Create your first purchase order to start tracking inventory')}
          action={!search ? { label: t('purchases.addOrder'), onClick: onAddOrder } : undefined}
        />
      )}

      {/* Table */}
      <AnimatePresence mode="wait">
        {!isLoading && filteredOrders.length > 0 && (
          <motion.div
            key={`${filterStatus}-${search}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <POListTable
              orders={filteredOrders}
              onView={handleView}
              onReceive={handleReceive}
              onDelete={handleDeleteRequest}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile card list */}
      <AnimatePresence mode="wait">
        {!isLoading && filteredOrders.length > 0 && (
          <motion.div
            key={`mobile-${filterStatus}-${search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden space-y-3"
          >
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
                className="bg-brand-dark rounded-xl border border-brand-border/60 p-4 hover:border-brand-gold/20 hover:shadow-[var(--shadow-hover)] transition-all duration-300 ease-out-expo"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-light truncate">
                      {order.supplier?.name || t('purchases.noSupplier')}
                    </p>
                    <p className="text-xs text-brand-muted font-mono mt-0.5">{order.id.slice(0, 8)}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono border ${
                    order.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-800/40' :
                    order.status === 'received' ? 'bg-green-900/30 text-green-300 border-green-800/40' :
                    'bg-red-900/30 text-red-300 border-red-800/40'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-brand-muted mb-3">
                  <span>{new Date(order.order_date).toLocaleDateString()}</span>
                  <span className="font-mono text-brand-light">${order.total_usd.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-brand-border/50">
                  <button
                    onClick={() => handleView(order.id)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10 rounded-lg transition-all duration-200 active:scale-[0.97]"
                  >
                    {t('common.view')}
                  </button>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReceive(order)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-green-400 bg-green-400/5 hover:bg-green-400/10 rounded-lg transition-all duration-200 active:scale-[0.97]"
                      >
                        {t('common.receive')}
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(order)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all duration-200 active:scale-[0.97]"
                      >
                        {t('common.delete')}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={t('purchases.cancelOrder')}
        message={t('purchases.cancelConfirm', { name: deleteTarget?.supplier?.name || t('purchases.noSupplier') })}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};
