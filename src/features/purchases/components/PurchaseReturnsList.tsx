import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, Trash, WarningCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { usePurchaseReturns, useDeletePurchaseReturn } from '@/features/purchases/hooks/usePurchaseReturns';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { EmptyState } from '@/features/shared/components/EmptyState';
import { useToastStore } from '@/features/shared/store/toastSlice';

export const PurchaseReturnsList = () => {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const { data: returns = [], isLoading, error } = usePurchaseReturns();
  const { data: allProducts } = useProducts();
  const deleteReturn = useDeletePurchaseReturn();
  const [search, setSearch] = useState('');

  const productNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allProducts) {
      for (const p of allProducts) map.set(p.id, p.name);
    }
    return map;
  }, [allProducts]);

  const filtered = useMemo(() => {
    if (!search) return returns;
    const q = search.toLowerCase();
    return returns.filter((r) => {
      const prodName = productNameMap.get(r.product_id ?? '') ?? '';
      return prodName.toLowerCase().includes(q) || (r.reason?.toLowerCase().includes(q) ?? false);
    });
  }, [returns, search, productNameMap]);

  const handleDelete = async (ret: typeof returns[0]) => {
    const prodName = productNameMap.get(ret.product_id ?? '') ?? t('returns.unknownProduct', 'Unknown');
    if (!confirm(t('returns.deleteConfirm', 'Delete return for "{{name}}"?', { name: prodName }))) return;
    try {
      await deleteReturn.mutateAsync(ret);
      addToast(t('returns.deleted', 'Return deleted'), 'success');
    } catch {
      addToast(t('common.error'), 'error');
    }
  };

  const totalUsd = filtered.reduce((sum, r) => sum + (r.unit_price_usd * r.quantity), 0);
  const totalSyp = filtered.reduce((sum, r) => sum + (r.unit_price_syp * r.quantity), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {returns.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-red-400/10 text-red-400 text-xs font-bold font-mono rounded-lg border border-red-400/20">
              ${totalUsd.toFixed(2)} USD
            </span>
            <span className="px-2.5 py-1 bg-brand-dark text-brand-muted text-xs font-bold font-mono rounded-lg border border-brand-border">
              {totalSyp.toLocaleString()} SYP
            </span>
          </div>
        )}

        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/40">
            <MagnifyingGlass size={16} />
          </div>
          <label htmlFor="ret-search" className="sr-only">{t('common.search')}</label>
          <input
            id="ret-search"
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 hover:border-brand-gold/20 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 transition-all duration-300 ease-out-expo"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gradient-to-r from-brand-surface-hover via-brand-dark to-brand-surface-hover rounded-xl bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"
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

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          title={search ? t('common.noResults') : t('returns.noReturns', 'No purchase returns yet')}
          description={search ? t('common.tryDifferentSearch') : t('returns.noReturnsDesc', 'Record a return when you send products back to a supplier')}
        />
      )}

      <AnimatePresence mode="wait">
        {!isLoading && filtered.length > 0 && (
          <motion.div
            key={search}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2"
          >
            {filtered.map((ret, index) => {
              const prodName = productNameMap.get(ret.product_id ?? '') ?? t('returns.unknownProduct', 'Unknown');
              const totalLineUsd = ret.unit_price_usd * ret.quantity;
              const totalLineSyp = ret.unit_price_syp * ret.quantity;

              return (
                <motion.div
                  key={ret.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group bg-brand-dark rounded-xl border border-brand-border/40 p-4 flex items-center gap-4 transition-all duration-300 ease-out-expo hover:border-red-400/30 hover:shadow-[var(--shadow-hover)]"
                >
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-red-400/10 flex items-center justify-center">
                    <ArrowCounterClockwise size={20} weight="duotone" className="text-red-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-light truncate">{prodName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-brand-muted/50 font-mono">
                        ×{ret.quantity} @ ${ret.unit_price_usd.toFixed(2)}
                      </span>
                      {ret.reason && (
                        <span className="text-xs text-brand-muted/40 truncate">— {ret.reason}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold font-mono text-red-400">−${totalLineUsd.toFixed(2)}</p>
                    <p className="text-xs font-mono text-brand-muted/50">{totalLineSyp.toLocaleString()} SYP</p>
                  </div>

                  <button
                    onClick={() => handleDelete(ret)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 active:scale-90 opacity-0 group-hover:opacity-100"
                  >
                    <Trash size={14} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
