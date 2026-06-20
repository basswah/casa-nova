import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, type Easing } from 'framer-motion';
import {
  Receipt,
  MagnifyingGlass,
  CaretDown,
  Check,
  X as XIcon,
  ArrowCounterClockwise,
  Wallet,
  CurrencyDollar,
  ShoppingCart,
} from '@phosphor-icons/react';
import { useSalesOrders, useSalesOrderItems } from '@/features/sales/hooks/useSalesOrders';
import { useCreateReturn } from '@/features/sales/hooks/useCreateReturn';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { useToastStore } from '@/features/shared/store/toastSlice';
import { EmptyState } from '@/features/shared/components/EmptyState';
import { Skeleton } from '@/features/shared/components/Skeleton';
import type { SalesOrder, SalesOrderItem } from '@/types/sales';

interface SelectedItem {
  itemId: string;
  productId: string;
  maxQty: number;
  priceUsd: number;
  priceSyp: number;
}

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const SalesHistoryPage = () => {
  const { t } = useTranslation();
  const { data: orders = [], isLoading } = useSalesOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem[]>>({});
  const [batchTarget, setBatchTarget] = useState<{ soId: string } | null>(null);
  const [batchReason, setBatchReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [returnError, setReturnError] = useState<string | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const activeOrders = useMemo(
    () => orders.filter((o) => showCancelled || o.status === 'completed'),
    [orders, showCancelled],
  );

  const filteredOrders = activeOrders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      new Date(order.order_date).toLocaleDateString().includes(q) ||
      order.total_usd.toFixed(2).includes(q) ||
      order.total_syp.toLocaleString().includes(q)
    );
  });

  const totalUsd = activeOrders.reduce((s, o) => s + o.total_usd, 0);
  const totalSyp = activeOrders.reduce((s, o) => s + o.total_syp, 0);

  const createReturn = useCreateReturn();
  const { data: allProducts } = useProducts();
  const addToast = useToastStore((s) => s.addToast);

  const productNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allProducts) {
      for (const p of allProducts) {
        map.set(p.id, p.name);
      }
    }
    return map;
  }, [allProducts]);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('sales.title')}`; }, [t]);

  const handleToggleItem = (orderId: string, item: SalesOrderItem) => {
    setSelectedItems((prev) => {
      const current = prev[orderId] ?? [];
      const exists = current.find((s) => s.itemId === item.id);
      if (exists) {
        const filtered = current.filter((s) => s.itemId !== item.id);
        if (filtered.length === 0) {
          const rest = { ...prev };
          delete rest[orderId];
          return rest;
        }
        return { ...prev, [orderId]: filtered };
      }
      return {
        ...prev,
        [orderId]: [
          ...current,
          {
            itemId: item.id,
            productId: item.product_id!,
            maxQty: item.quantity,
            priceUsd: item.unit_price_usd,
            priceSyp: item.unit_price_syp,
          },
        ],
      };
    });
  };

  const handleBatchReturn = (
    onSuccess?: () => void,
  ) => {
    if (!batchTarget) return;
    const items = selectedItems[batchTarget.soId];
    if (!items || items.length === 0) return;

    setReturnError(null);

    createReturn.mutate({
      so_id: batchTarget.soId,
      reason: batchReason,
      items: items.map((s) => ({
        item_id: s.itemId,
        product_id: s.productId,
        quantity: s.maxQty,
        unit_price_usd: s.priceUsd,
        unit_price_syp: s.priceSyp,
      })),
    }, {
      onSuccess: () => {
        addToast(t('sales.returnSuccess', { defaultValue: 'Return completed successfully' }), 'success');
        onSuccess?.();
      },
      onError: (err) => {
        setReturnError(err instanceof Error ? err.message : t('common.error'));
      },
    });
  };

  const handleSingleReturn = (soId: string, item: SelectedItem) => {
    setSelectedItems((prev) => {
      const existing = prev[soId] ?? [];
      if (existing.some((s) => s.itemId === item.itemId)) return prev;
      return { ...prev, [soId]: [...existing, item] };
    });
    setBatchTarget({ soId });
  };

  const clearBatch = () => {
    setBatchTarget(null);
    setBatchReason('');
    setReturnError(null);
  };

  const handleExpandedChange = (orderId: string | null) => {
    setExpandedId(orderId);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-56 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full sm:w-56 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-brand-dark/60 rounded-xl border border-brand-border/30 p-5 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-brand-dark/60 rounded-xl border border-brand-border/30 p-5 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
                <Skeleton className="h-6 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-light tracking-tight">
              {t('sales.title')}
            </h1>
            <p className="text-xs md:text-sm text-brand-muted/50 mt-1 tracking-tight">
              {orders.length} {t('common.orders', { defaultValue: 'Orders' })} &middot; ${totalUsd.toFixed(2)} {t('common.total', { defaultValue: 'Total' })}
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/30">
              <MagnifyingGlass size={14} weight="bold" />
            </div>
            <label htmlFor="sales-search" className="sr-only">{t('common.search')}</label>
            <input
              id="sales-search"
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/60 backdrop-blur-sm border border-brand-border/40 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none" htmlFor="show-cancelled">
            <button
              id="show-cancelled"
              role="switch"
              aria-checked={showCancelled}
              onClick={() => setShowCancelled((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-all duration-300 ease-out-expo ${
                showCancelled ? 'bg-brand-gold' : 'bg-brand-border/30'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-brand-black transition-all duration-300 ease-out-expo ${
                  showCancelled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest">
              {t('sales.showCancelled', { defaultValue: 'Show returned' })}
            </span>
          </label>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeSlideUp}
            className="rounded-xl border border-brand-border/40 bg-brand-dark p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-gold/10">
                <ShoppingCart size={16} weight="duotone" className="text-brand-gold" />
              </div>
              <span className="text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest">{t('common.orders', { defaultValue: 'Orders' })}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold font-mono text-brand-light tracking-tight">{orders.length}</p>
            <p className="text-[10px] text-brand-muted/40 mt-1 tracking-tight">{t('common.total', { defaultValue: 'Total' })}</p>
          </motion.div>

          <motion.div
            variants={fadeSlideUp}
            className="rounded-xl border border-brand-border/40 bg-brand-dark p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-900/20">
                <CurrencyDollar size={16} weight="duotone" className="text-green-400" />
              </div>
              <span className="text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest">USD</span>
            </div>
            <p className="text-xl md:text-2xl font-bold font-mono text-brand-light tracking-tight">${totalUsd.toFixed(2)}</p>
            <p className="text-[10px] text-brand-muted/40 mt-1 tracking-tight">{t('reports.totalUsd')}</p>
          </motion.div>

          <motion.div
            variants={fadeSlideUp}
            className="rounded-xl border border-brand-border/40 bg-brand-dark p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-gold/10">
                <Wallet size={16} weight="duotone" className="text-brand-gold" />
              </div>
              <span className="text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest">SYP</span>
            </div>
            <p className="text-xl md:text-2xl font-bold font-mono text-brand-light tracking-tight">{totalSyp.toLocaleString()}</p>
            <p className="text-[10px] text-brand-muted/40 mt-1 tracking-tight">{t('reports.totalSyp')}</p>
          </motion.div>
        </motion.div>

        {!isLoading && filteredOrders.length === 0 && (
          <EmptyState title={t('sales.noOrders')} />
        )}

        {filteredOrders.length > 0 && (
          <motion.div
            className="space-y-3"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onToggle={() => handleExpandedChange(expandedId === order.id ? null : order.id)}
                selectedItems={selectedItems[order.id] ?? []}
                onToggleItem={(item) => handleToggleItem(order.id, item)}
                onReturn={(item) => handleSingleReturn(order.id, item)}
                onBatchReturn={() => setBatchTarget({ soId: order.id })}
                productNameMap={productNameMap}
              />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {batchTarget && selectedItems[batchTarget.soId]?.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={clearBatch} />
            <motion.div
              className="relative w-full max-w-md bg-brand-dark/95 backdrop-blur-sm rounded-xl md:rounded-2xl border border-brand-border/30 shadow-[var(--shadow-floating)] max-h-[85vh] overflow-y-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            >
              <div className="flex items-center justify-between p-5 pb-4 border-b border-brand-border/20">
                <div className="flex items-center gap-2.5">
                  <ArrowCounterClockwise size={18} weight="duotone" className="text-brand-gold" />
                  <h2 className="text-sm font-bold text-brand-light tracking-tight">{t('sales.returnTitle')}</h2>
                </div>
                <button
                  onClick={clearBatch}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted/40 hover:text-brand-light hover:bg-brand-black/40 transition-all duration-150 active:scale-[0.9]"
                >
                  <XIcon size={16} weight="bold" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {selectedItems[batchTarget.soId].map((s) => (
                  <div
                    key={s.itemId}
                    className="flex justify-between items-center bg-brand-black/30 rounded-lg md:rounded-xl p-3.5 border border-brand-border/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-brand-light/80 truncate">{productNameMap.get(s.productId) ?? s.productId.slice(0, 8)}</p>
                      <p className="text-[10px] text-brand-muted/50 mt-0.5">
                        {t('common.quantity')}: <span className="font-mono text-brand-light/60">{s.maxQty}</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono text-brand-light font-semibold tabular-nums">${s.priceUsd.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5 space-y-4">
                <div>
                  <label htmlFor="batch-reason" className="block text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest mb-1.5">
                    {t('sales.returnReason')}
                  </label>
                  <input
                    id="batch-reason"
                    type="text"
                    value={batchReason}
                    onChange={(e) => setBatchReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-brand-black/60 border border-brand-border/40 rounded-lg md:rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    placeholder={t('common.optional', { defaultValue: 'Optional' })}
                  />
                </div>
                <div className="space-y-3">
                  {returnError && (
                    <div className="bg-red-900/15 border border-red-800/30 rounded-lg px-3.5 py-2.5">
                      <p className="text-[11px] text-red-400/80 leading-relaxed">{returnError}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-brand-muted/50 leading-relaxed tracking-tight">
                    {t('sales.returnWarning', { defaultValue: 'Products will be returned to stock and the invoice total will be adjusted.' })}
                  </p>
                  <button
                    onClick={() => {
                      handleBatchReturn(() => {
                        clearBatch();
                        setSelectedItems((prev) => {
                          const rest = { ...prev };
                          delete rest[batchTarget.soId];
                          return rest;
                        });
                        setReturnError(null);
                      });
                    }}
                    disabled={createReturn.isPending}
                    className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-xl text-sm tracking-wide hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_28px_-6px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 transition-all duration-300 ease-out-expo disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:-translate-y-0 active:scale-[0.97]"
                  >
                    {createReturn.isPending ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t('common.saving')}
                      </span>
                    ) : t('sales.confirmReturn')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface OrderCardProps {
  order: SalesOrder;
  expanded: boolean;
  onToggle: () => void;
  selectedItems: SelectedItem[];
  onToggleItem: (item: SalesOrderItem) => void;
  onReturn: (item: SelectedItem) => void;
  onBatchReturn: () => void;
  productNameMap: Map<string, string>;
}

const OrderCard = ({ order, expanded, onToggle, selectedItems, onToggleItem, onReturn, onBatchReturn, productNameMap }: OrderCardProps) => {
  const { t } = useTranslation();
  const { data: items = [] } = useSalesOrderItems(order.id);
  const activeItems = useMemo(() => items.filter((item) => item.quantity > 0), [items]);
  const allReturned = items.length > 0 && activeItems.length === 0;

  return (
    <motion.div
      variants={fadeSlideUp}
      className="rounded-xl border border-brand-border/40 bg-brand-dark overflow-hidden transition-all duration-300 ease-out-expo hover:border-brand-gold/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-brand-black/20 transition-colors duration-200"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-brand-gold/5 border border-brand-border/30 flex items-center justify-center">
            <Receipt size={16} weight="duotone" className="text-brand-gold/70" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs md:text-sm text-brand-muted/60 tracking-tight">
              {new Date(order.order_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-xs md:text-sm text-brand-muted/40 mt-0.5">
              <span className="text-brand-light font-medium font-mono">${order.total_usd.toFixed(2)}</span>
              <span className="mx-1.5 text-brand-muted/20">/</span>
              <span className="font-mono text-brand-muted/60">{order.total_syp.toLocaleString()} SYP</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium leading-none tracking-tight ${
            order.status === 'completed'
              ? 'bg-green-900/15 text-green-400/80 border border-green-800/30'
              : 'bg-red-900/15 text-red-400/80 border border-red-800/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              order.status === 'completed' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            {order.status === 'completed' ? t('sales.completed') : t('sales.cancelled')}
          </span>
          {allReturned && (
            <span className="text-[10px] font-medium text-brand-muted/40 uppercase tracking-wider">
              {t('sales.returned', { defaultValue: 'Returned' })}
            </span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: easeOutExpo }}
            className="text-brand-muted/30"
          >
            <CaretDown size={16} weight="bold" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && items.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="border-t border-brand-border/20 overflow-hidden"
          >
            {allReturned ? (
              <div className="px-4 md:px-5 py-6 text-center">
                <p className="text-xs text-brand-muted/40">{t('sales.allReturned', { defaultValue: 'All items have been returned.' })}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 md:px-5 py-3 bg-brand-black/20">
                  <span className="text-[10px] text-brand-muted/50 uppercase tracking-widest font-medium">
                    {t('common.selectItems')}
                  </span>
                  <button
                    onClick={onBatchReturn}
                    disabled={selectedItems.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-brand-black bg-brand-gold rounded-lg hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_16px_-4px_rgba(212,175,55,0.3)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.97]"
                  >
                    <ArrowCounterClockwise size={12} weight="bold" />
                    {t('sales.returnSelected', { count: selectedItems.length })}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-black/30">
                        <th className="px-2 md:px-3 py-3 text-center w-10">
                          <span className="sr-only">{t('common.select')}</span>
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">{t('common.name')}</th>
                        <th className="px-3 md:px-4 py-3 text-center text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">{t('common.quantity')}</th>
                        <th className="hidden sm:table-cell px-3 md:px-4 py-3 text-right text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">{t('common.price')}</th>
                        <th className="px-3 md:px-4 py-3 text-right text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/20">
                      {activeItems.map((item, idx) => {
                        const isSelected = selectedItems.some((s) => s.itemId === item.id);
                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors duration-150 ${isSelected ? 'bg-brand-gold/5' : 'hover:bg-brand-black/20'}`}
                            style={{ animation: `fade-slide-up 0.3s ease-out ${idx * 0.04}s both` }}
                          >
                            <td className="px-2 md:px-3 py-3 text-center">
                              <button
                                onClick={() => onToggleItem(item)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 active:scale-[0.9] ${
                                  isSelected
                                    ? 'bg-brand-gold border-brand-gold'
                                    : 'border-brand-border/50 hover:border-brand-gold/50'
                                }`}
                              >
                                {isSelected && <Check size={12} weight="bold" className="text-brand-black" />}
                              </button>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-brand-light/80 font-medium truncate max-w-[140px] md:max-w-[200px]">
                              {productNameMap.get(item.product_id ?? '') ?? item.product_id}
                            </td>
                            <td className="px-3 md:px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-md bg-brand-black/40 text-[11px] font-mono text-brand-light/80 font-medium leading-none px-1.5">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="hidden sm:table-cell px-3 md:px-4 py-3 text-right">
                              <span className="text-xs md:text-sm font-mono text-brand-light/70 tabular-nums">
                                ${item.unit_price_usd.toFixed(2)} / {item.unit_price_syp.toFixed(2)} SYP
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right">
                              <button
                                onClick={() => onReturn({
                                  itemId: item.id,
                                  productId: item.product_id!,
                                  maxQty: item.quantity,
                                  priceUsd: item.unit_price_usd,
                                  priceSyp: item.unit_price_syp,
                                })}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-brand-gold bg-brand-gold/8 rounded-lg hover:bg-brand-gold/15 transition-all duration-150 active:scale-[0.95]"
                              >
                                <ArrowCounterClockwise size={11} weight="bold" />
                                {t('sales.return')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
