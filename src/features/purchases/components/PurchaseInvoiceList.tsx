import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, WarningCircle } from '@phosphor-icons/react';
import { usePurchaseOrders } from '@/features/purchases/hooks/usePurchaseOrders';
import { useUpdatePurchaseOrderStatus } from '@/features/purchases/hooks/useUpdatePurchaseOrderStatus';
import { EmptyState } from '@/features/shared/components/EmptyState';
import type { PurchaseOrder } from '@/types/purchases';

interface PurchaseInvoiceListProps {
  onView: (id: string) => void;
  onAddInvoice: () => void;
}

type FilterStatus = 'all' | 'received' | 'cancelled';

export const PurchaseInvoiceList = ({ onView, onAddInvoice }: PurchaseInvoiceListProps) => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading, error } = usePurchaseOrders();
  const updateOrderStatus = useUpdatePurchaseOrderStatus();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

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

  const handleDeleteRequest = (order: PurchaseOrder) => {
    if (confirm(t('purchases.cancelConfirm', 'Cancel this invoice?'))) {
      updateOrderStatus.mutateAsync({ id: order.id, status: 'cancelled' }).catch(() => {});
    }
  };

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('purchases.filterAll') },
    { key: 'received', label: t('purchases.filterReceived') },
    { key: 'cancelled', label: t('purchases.filterCancelled') },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/40">
            <MagnifyingGlass size={16} />
          </div>
          <label htmlFor="inv-search" className="sr-only">{t('common.search')}</label>
          <input
            id="inv-search"
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 transition-all duration-300 ease-out-expo"
          />
        </div>

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

      {!isLoading && !error && filteredOrders.length === 0 && (
        <EmptyState
          title={search ? t('common.noResults') : t('purchases.noInvoices')}
          description={search ? t('common.tryDifferentSearch') : t('purchases.emptyDescription', 'Create your first invoice to start tracking incoming stock')}
          action={!search ? { label: t('purchases.addInvoice'), onClick: onAddInvoice } : undefined}
        />
      )}

      <AnimatePresence mode="wait">
        {!isLoading && filteredOrders.length > 0 && (
          <motion.div
            key={`${filterStatus}-${search}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
                  onClick={() => onView(order.id)}
                  className="bg-brand-dark rounded-2xl border border-brand-border/40 p-5 hover:border-brand-gold/30 hover:shadow-[var(--shadow-hover)] transition-all duration-300 ease-out-expo cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-brand-muted/60">{order.id.slice(0, 8)}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold font-mono border ${
                          order.status === 'received' ? 'bg-green-900/20 text-green-400 border-green-800/30' :
                          order.status === 'cancelled' ? 'bg-red-900/20 text-red-400 border-red-800/30' :
                          'bg-yellow-900/20 text-yellow-400 border-yellow-800/30'
                        }`}>
                          {t(`purchases.status.${order.status}`, order.status)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-brand-light truncate">
                        {order.supplier?.name || t('purchases.noSupplier')}
                      </p>
                      <p className="text-xs text-brand-muted/60 font-mono mt-0.5">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-medium text-brand-muted/60 uppercase tracking-wider">{t('common.total')} (USD)</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-brand-gold tracking-tight">
                      ${order.total_usd.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-medium text-brand-muted/60 uppercase tracking-wider">{t('common.total')} (SYP)</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-brand-light">
                      {order.total_syp.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-brand-border/50">
                    <button
                      onClick={() => onView(order.id)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10 rounded-xl transition-all duration-200 active:scale-[0.97]"
                    >
                      {t('common.view')}
                    </button>
                    {order.status === 'received' && (
                      <button
                        onClick={() => handleDeleteRequest(order)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-xl transition-all duration-200 active:scale-[0.97]"
                      >
                        {t('common.cancel')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
