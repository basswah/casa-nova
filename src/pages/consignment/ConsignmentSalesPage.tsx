import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Tag,
  MagnifyingGlass,
  Check,
  Clock,
  Package,
  Receipt,
  CaretDown,
  UserCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { useConsignmentSales, type ConsignmentSaleItem, type SupplierSettlement } from '@/features/consignment/hooks/useConsignmentSales';
import { useSettleAllForSupplier } from '@/features/consignment/hooks/useConsignmentSales';
import { EmptyState } from '@/features/shared/components/EmptyState';
import { Skeleton } from '@/features/shared/components/Skeleton';
import { useToastStore } from '@/features/shared/store/toastSlice';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const ConsignmentSalesPage = () => {
  const { t } = useTranslation();
  const { data: sales = [], isLoading, error } = useConsignmentSales();
  const settleAllMutation = useSettleAllForSupplier();
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  const settlements = useMemo<SupplierSettlement[]>(() => {
    const grouped = new Map<string, ConsignmentSaleItem[]>();

    for (const item of sales) {
      const key = item.supplier_id ?? 'unknown';
      const existing = grouped.get(key) ?? [];
      grouped.set(key, [...existing, item]);
    }

    const result: SupplierSettlement[] = [];

    for (const [supplierId, items] of grouped) {
      const supplierName = items[0]?.supplier_name ?? t('consignment.unknownSupplier', 'Unknown Supplier');
      const total_quantity = items.reduce((sum, i) => sum + i.quantity, 0);
      const total_cost_usd = items.reduce((sum, i) => sum + (i.cost_usd * i.quantity), 0);
      const total_cost_syp = items.reduce((sum, i) => sum + (i.cost_syp * i.quantity), 0);
      const settled_quantity = items.filter((i) => i.is_settled).reduce((sum, i) => sum + i.quantity, 0);
      const unsettled_quantity = items.filter((i) => !i.is_settled).reduce((sum, i) => sum + i.quantity, 0);
      const settled_cost_usd = items.filter((i) => i.is_settled).reduce((sum, i) => sum + (i.cost_usd * i.quantity), 0);
      const unsettled_cost_usd = items.filter((i) => !i.is_settled).reduce((sum, i) => sum + (i.cost_usd * i.quantity), 0);

      result.push({
        supplier_id: supplierId,
        supplier_name: supplierName,
        items,
        total_quantity,
        total_cost_usd,
        total_cost_syp,
        settled_quantity,
        unsettled_quantity,
        settled_cost_usd,
        unsettled_cost_usd,
      });
    }

    return result.sort((a, b) => b.unsettled_cost_usd - a.unsettled_cost_usd);
  }, [sales, t]);

  const filteredSettlements = useMemo(() => {
    if (!search.trim()) return settlements;
    const q = search.toLowerCase();
    return settlements.filter(
      (s) =>
        s.supplier_name.toLowerCase().includes(q) ||
        s.items.some(
          (i) =>
            i.product_name.toLowerCase().includes(q) ||
            (i.product_sku && i.product_sku.toLowerCase().includes(q)),
        ),
    );
  }, [settlements, search]);

  const totalUnsettled = useMemo(
    () => settlements.reduce((sum, s) => sum + s.unsettled_cost_usd, 0),
    [settlements],
  );

  const totalSettled = useMemo(
    () => settlements.reduce((sum, s) => sum + s.settled_cost_usd, 0),
    [settlements],
  );

  const totalItems = useMemo(() => settlements.reduce((sum, s) => sum + s.items.length, 0), [settlements]);

  const handleSettleAll = async (supplierId: string) => {
    const settlement = settlements.find((s) => s.supplier_id === supplierId);
    if (!settlement) return;

    const unsettledItems = settlement.items.filter((i) => !i.is_settled);
    if (unsettledItems.length === 0) return;

    try {
      await settleAllMutation.mutateAsync({
        supplierId,
        itemIds: unsettledItems.map((i) => i.id),
      });
      addToast(
        t('consignment.settledSuccess', {
          supplier: settlement.supplier_name,
          amount: settlement.unsettled_cost_usd.toFixed(2),
        }),
        'success',
      );
    } catch (err) {
      addToast(t('consignment.settleError'), 'error');
    }
  };

  return (
    <div className="min-h-[100dvh]">
      <div className="px-5 md:px-8 lg:px-12 pt-8 md:pt-12 pb-16 md:pb-24 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                  <Tag size={18} weight="duotone" className="text-brand-gold" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-light tracking-tight">
                  {t('consignment.title', 'Consignment Sales')}
                </h1>
              </div>
              <p className="text-sm text-brand-muted/50 ml-[46px]">
                {t('consignment.subtitle', 'Track and settle consignment sales with suppliers')}
              </p>
            </div>
          </div>
        </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <motion.div
          variants={fadeSlideUp}
          className="rounded-2xl bg-gradient-to-br from-brand-dark to-brand-dark/60 border border-brand-border/30 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-brand-border/20 flex items-center justify-center">
              <Receipt size={16} weight="duotone" className="text-brand-muted/60" />
            </div>
            <span className="text-[10px] font-medium text-brand-muted/50 uppercase tracking-wider">
              {t('consignment.totalSales', 'Total Sales')}
            </span>
          </div>
          <p className="text-2xl font-bold text-brand-light font-mono">{totalItems}</p>
        </motion.div>

        <motion.div
          variants={fadeSlideUp}
          className="rounded-2xl bg-gradient-to-br from-amber-950/40 to-amber-950/20 border border-amber-800/30 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock size={16} weight="duotone" className="text-amber-400/80" />
            </div>
            <span className="text-[10px] font-medium text-amber-400/60 uppercase tracking-wider">
              {t('consignment.unsettled', 'Unsettled')}
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-300 font-mono">
            ${totalUnsettled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          variants={fadeSlideUp}
          className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-emerald-950/20 border border-emerald-800/30 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Check size={16} weight="duotone" className="text-emerald-400/80" />
            </div>
            <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">
              {t('consignment.settled', 'Settled')}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-300 font-mono">
            ${totalSettled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          variants={fadeSlideUp}
          className="rounded-2xl bg-gradient-to-br from-brand-dark to-brand-dark/60 border border-brand-border/30 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-brand-border/20 flex items-center justify-center">
              <UserCircle size={16} weight="duotone" className="text-brand-muted/60" />
            </div>
            <span className="text-[10px] font-medium text-brand-muted/50 uppercase tracking-wider">
              {t('consignment.suppliers', 'Suppliers')}
            </span>
          </div>
          <p className="text-2xl font-bold text-brand-light font-mono">{settlements.length}</p>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
        className="mb-6"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlass size={18} weight="bold" className="text-brand-muted/40" />
          </div>
          <input
            type="text"
            placeholder={t('consignment.searchPlaceholder', 'Search by supplier or product...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-dark/50 border border-brand-border/40 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all duration-300"
          />
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-950/30 border border-red-800/40 rounded-xl flex items-center gap-3"
        >
          <WarningCircle size={20} weight="duotone" className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error.message}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-brand-dark/60 rounded-2xl border border-brand-border/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sales.length === 0 && (
        <EmptyState
          title={t('consignment.noSales', 'No consignment sales yet')}
          description={t('consignment.noSalesDesc', 'Sales of consignment products will appear here')}
        />
      )}

      {/* Supplier Settlements */}
      {!isLoading && filteredSettlements.length > 0 && (
        <div className="space-y-4">
          {filteredSettlements.map((settlement) => {
            const isExpanded = expandedSupplier === settlement.supplier_id;
            const hasUnsettled = settlement.unsettled_cost_usd > 0;

            return (
              <motion.div
                key={settlement.supplier_id}
                variants={fadeSlideUp}
                className="rounded-2xl bg-brand-dark/80 border border-brand-border/30 overflow-hidden"
              >
                {/* Supplier Header */}
                <button
                  onClick={() => setExpandedSupplier(isExpanded ? null : settlement.supplier_id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-brand-border/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hasUnsettled ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                    }`}>
                      <UserCircle size={24} weight="duotone" className={hasUnsettled ? 'text-amber-400' : 'text-emerald-400'} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-semibold text-brand-light">{settlement.supplier_name}</h3>
                      <p className="text-xs text-brand-muted/50">
                        {settlement.total_quantity} {t('consignment.items', 'items')} · {settlement.items.length} {t('consignment.sales', 'sales')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      {hasUnsettled ? (
                        <p className="text-lg font-bold text-amber-300 font-mono">
                          ${settlement.unsettled_cost_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-emerald-300 font-mono">
                          ${settlement.settled_cost_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <p className="text-[10px] text-brand-muted/50 uppercase tracking-wider">
                        {hasUnsettled ? t('consignment.due', 'Due') : t('consignment.settled', 'Settled')}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isExpanded ? 'bg-brand-border/30 rotate-180' : 'bg-brand-border/20'
                    }`}>
                      <CaretDown size={16} weight="bold" className="text-brand-muted/60" />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3, ease: easeOutExpo }}
                    className="border-t border-brand-border/20"
                  >
                    {/* Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-brand-border/20">
                            <th className="text-left px-5 py-3 text-[10px] font-semibold text-brand-muted/60 uppercase tracking-wider">
                              {t('consignment.product', 'Product')}
                            </th>
                            <th className="text-center px-3 py-3 text-[10px] font-semibold text-brand-muted/60 uppercase tracking-wider hidden sm:table-cell">
                              {t('consignment.qty', 'Qty')}
                            </th>
                            <th className="text-right px-3 py-3 text-[10px] font-semibold text-brand-muted/60 uppercase tracking-wider">
                              {t('consignment.costPrice', 'Cost Price')}
                            </th>
                            <th className="text-right px-5 py-3 text-[10px] font-semibold text-brand-muted/60 uppercase tracking-wider">
                              {t('consignment.totalCost', 'Total Cost')}
                            </th>
                            <th className="text-center px-5 py-3 text-[10px] font-semibold text-brand-muted/60 uppercase tracking-wider">
                              {t('consignment.status', 'Status')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {settlement.items.map((item, idx) => (
                            <tr
                              key={item.id}
                              className={`border-b border-brand-border/10 ${
                                idx === settlement.items.length - 1 ? 'border-0' : ''
                              }`}
                            >
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-brand-border/10 flex items-center justify-center">
                                    <Package size={14} weight="duotone" className="text-brand-muted/50" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-brand-light">{item.product_name}</p>
                                    <p className="text-[10px] text-brand-muted/40 font-mono">{item.product_sku ?? '—'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center px-3 py-3 hidden sm:table-cell">
                                <span className="text-sm font-mono text-brand-light">{item.quantity}</span>
                              </td>
                              <td className="text-right px-3 py-3">
                                <span className="text-sm font-mono text-brand-muted/70">
                                  ${item.cost_usd.toFixed(2)}
                                </span>
                              </td>
                              <td className="text-right px-5 py-3">
                                <span className="text-sm font-mono font-medium text-brand-light">
                                  ${(item.cost_usd * item.quantity).toFixed(2)}
                                </span>
                              </td>
                              <td className="text-center px-5 py-3">
                                {item.is_settled ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                                    <Check size={10} weight="bold" />
                                    {t('consignment.settled', 'Settled')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold">
                                    <Clock size={10} weight="bold" />
                                    {t('consignment.pending', 'Pending')}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="px-5 py-4 bg-brand-black/30 border-t border-brand-border/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-6 text-xs">
                          <div>
                            <span className="text-brand-muted/50">{t('consignment.settled', 'Settled')}: </span>
                            <span className="font-mono text-emerald-400 font-medium">
                              {settlement.settled_quantity} ({settlement.settled_cost_usd.toFixed(2)} USD)
                            </span>
                          </div>
                          <div>
                            <span className="text-brand-muted/50">{t('consignment.unsettled', 'Unsettled')}: </span>
                            <span className="font-mono text-amber-400 font-medium">
                              {settlement.unsettled_quantity} ({settlement.unsettled_cost_usd.toFixed(2)} USD)
                            </span>
                          </div>
                        </div>
                        {hasUnsettled && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSettleAll(settlement.supplier_id)}
                            disabled={settleAllMutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-brand-black font-semibold rounded-xl hover:shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <Check size={14} weight="bold" />
                            {t('consignment.settleAll', 'Settle All')} (${settlement.unsettled_cost_usd.toFixed(2)})
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredSettlements.length === 0 && sales.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <MagnifyingGlass size={32} weight="thin" className="text-brand-muted/25" />
          <p className="text-sm text-brand-muted/40">{t('consignment.noResults', 'No results found')}</p>
        </div>
      )}
      </div>
    </div>
  );
};
