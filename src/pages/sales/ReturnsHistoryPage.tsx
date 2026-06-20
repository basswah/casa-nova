import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, type Easing } from 'framer-motion';
import {
  Receipt,
  ArrowLeft,
  MagnifyingGlass,
  CurrencyDollar,
  Wallet,
  ArrowCounterClockwise,
  CalendarBlank,
  Hash,
  Tag,
} from '@phosphor-icons/react';
import { useReturns } from '@/features/sales/hooks/useReturns';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { Skeleton } from '@/features/shared/components/Skeleton';
import { EmptyState } from '@/features/shared/components/EmptyState';

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const ReturnsHistoryPage = () => {
  const { t } = useTranslation();
  const { data: returns = [], isLoading } = useReturns();
  const { data: allProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const productNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allProducts) {
      for (const p of allProducts) map.set(p.id, p.name);
    }
    return map;
  }, [allProducts]);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('returns.title')}`; }, [t]);

  const filteredReturns = useMemo(() => {
    if (!searchQuery) return returns;
    const q = searchQuery.toLowerCase();
    return returns.filter((r) => {
      const name = productNameMap.get(r.product_id) ?? '';
      return (
        r.so_id.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        new Date(r.created_at).toLocaleDateString().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    });
  }, [returns, searchQuery, productNameMap]);

  const totalCount = filteredReturns.length;
  const totalUsd = useMemo(
    () => filteredReturns.reduce((s, r) => s + r.unit_price_usd * r.quantity, 0),
    [filteredReturns],
  );
  const totalSyp = useMemo(
    () => filteredReturns.reduce((s, r) => s + r.unit_price_syp * r.quantity, 0),
    [filteredReturns],
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 min-h-[100dvh]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/sales"
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-brand-muted/50 hover:text-brand-gold transition-colors duration-200 mb-2 tracking-wide uppercase"
            >
              <ArrowLeft size={12} weight="bold" />
              {t('returns.backToSales', { defaultValue: 'Back to Sales' })}
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-brand-light tracking-tight">
              {t('returns.title')}
            </h1>
            <p className="text-xs md:text-sm text-brand-muted/50 mt-1 tracking-tight">
              {totalCount} {t('returns.records', { defaultValue: 'Records' })} &middot; ${totalUsd.toFixed(2)} {t('common.total', { defaultValue: 'Total' })}
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/30">
              <MagnifyingGlass size={14} weight="bold" />
            </div>
            <label htmlFor="returns-search" className="sr-only">{t('common.search')}</label>
            <input
              id="returns-search"
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/60 backdrop-blur-sm border border-brand-border/40 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            />
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-brand-dark/60 rounded-xl border border-brand-border/30 p-5 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-7 w-28 rounded-lg" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-brand-dark/60 rounded-xl border border-brand-border/30 p-4 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-24 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filteredReturns.length === 0 ? (
          <EmptyState title={t('returns.noReturns', { defaultValue: 'No returns recorded yet' })} />
        ) : (
          <>
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
                    <ArrowCounterClockwise size={16} weight="duotone" className="text-brand-gold" />
                  </div>
                  <span className="text-[10px] font-medium text-brand-muted/60 uppercase tracking-widest">{t('returns.returns')}</span>
                </div>
                <p className="text-xl md:text-2xl font-bold font-mono text-brand-light tracking-tight">{totalCount}</p>
                <p className="text-[10px] text-brand-muted/40 mt-1 tracking-tight">{t('returns.totalReturns', { defaultValue: 'Total Returns' })}</p>
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

            <div className="hidden md:block rounded-xl border border-brand-border/40 bg-brand-dark overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-black/30">
                      <th className="px-4 py-3 text-left text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">
                        <span className="inline-flex items-center gap-1.5"><CalendarBlank size={12} weight="bold" />{t('returns.returnDate')}</span>
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">
                        <span className="inline-flex items-center gap-1.5"><CalendarBlank size={12} weight="bold" />{t('returns.saleDate')}</span>
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">
                        <span className="inline-flex items-center gap-1.5"><Hash size={12} weight="bold" />{t('returns.invoice')}</span>
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">
                        <span className="inline-flex items-center gap-1.5"><Tag size={12} weight="bold" />{t('common.name')}</span>
                      </th>
                      <th className="px-4 py-3 text-center text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">{t('common.quantity')}</th>
                      <th className="px-4 py-3 text-right text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">USD</th>
                      <th className="px-4 py-3 text-right text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">SYP</th>
                      <th className="px-4 py-3 text-right text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest">{t('returns.reason')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/20">
                    {filteredReturns.map((r, idx) => (
                      <tr
                        key={r.id}
                        className="hover:bg-brand-black/20 transition-colors duration-150"
                        style={{ animation: `fade-slide-up 0.3s ease-out ${idx * 0.03}s both` }}
                      >
                        <td className="px-4 py-3 text-xs text-brand-muted/60 font-mono whitespace-nowrap">{formatDate(r.created_at)}</td>
                        <td className="px-4 py-3 text-xs text-brand-muted/60 font-mono whitespace-nowrap">
                          {r.sales_orders?.order_date ? formatDate(r.sales_orders.order_date) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/sales`}
                            className="text-xs font-mono text-brand-gold/80 hover:text-brand-gold transition-colors truncate max-w-[100px] inline-block"
                          >
                            {r.so_id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-light/80 font-medium truncate max-w-[160px]">
                          {productNameMap.get(r.product_id) ?? r.product_id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-md bg-brand-black/40 text-[11px] font-mono text-brand-light/80 font-medium leading-none px-1.5">
                            {r.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-mono text-brand-light/70 tabular-nums">
                          ${(r.unit_price_usd * r.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-mono text-brand-muted/60 tabular-nums">
                          {(r.unit_price_syp * r.quantity).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-[10px] text-brand-muted/40 italic max-w-[120px] truncate">
                          {r.reason || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {filteredReturns.map((r, idx) => (
                <motion.div
                  key={r.id}
                  variants={fadeSlideUp}
                  initial="initial"
                  animate="animate"
                  className="rounded-xl border border-brand-border/40 bg-brand-dark p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  style={{ animation: `fade-slide-up 0.3s ease-out ${idx * 0.04}s both` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-gold/8 flex items-center justify-center">
                        <Receipt size={12} weight="duotone" className="text-brand-gold" />
                      </div>
                      <Link to="/sales" className="text-xs font-mono text-brand-gold/80 hover:text-brand-gold transition-colors">
                        #{r.so_id.slice(0, 8)}
                      </Link>
                    </div>
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-md bg-brand-black/40 text-[10px] font-mono text-brand-light/80 font-medium px-1.5">
                      {r.quantity}x
                    </span>
                  </div>
                  <p className="text-sm font-medium text-brand-light/80 truncate mb-2">
                    {productNameMap.get(r.product_id) ?? r.product_id.slice(0, 8)}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-brand-muted/50">
                    <span>{t('returns.returnDate')}: {formatDate(r.created_at)}</span>
                    <span>{t('returns.saleDate')}: {r.sales_orders?.order_date ? formatDate(r.sales_orders.order_date) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/20">
                    <div className="flex gap-3">
                      <span className="text-xs font-mono text-brand-light font-semibold">${(r.unit_price_usd * r.quantity).toFixed(2)}</span>
                      <span className="text-xs font-mono text-brand-muted/60">{(r.unit_price_syp * r.quantity).toLocaleString()} SYP</span>
                    </div>
                    {r.reason && (
                      <span className="text-[10px] text-brand-muted/40 italic truncate max-w-[100px]">{r.reason}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
