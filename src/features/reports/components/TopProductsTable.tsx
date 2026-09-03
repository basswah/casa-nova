import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBar, Medal, Trophy, Crown, Medal as MedalIcon } from '@phosphor-icons/react';
import type { TopProduct } from '@/types/reports';

interface TopProductsTableProps {
  data?: TopProduct[];
  loading: boolean;
  compact?: boolean;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const rowVariant = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: easeOutExpo } },
};

const RANK_STYLES = [
  { bg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10', text: 'text-amber-400', icon: Crown, border: 'border-amber-500/20' },
  { bg: 'bg-gradient-to-br from-slate-400/15 to-slate-500/5', text: 'text-slate-300', icon: Trophy, border: 'border-slate-400/15' },
  { bg: 'bg-gradient-to-br from-orange-700/15 to-orange-800/5', text: 'text-orange-400/80', icon: MedalIcon, border: 'border-orange-700/15' },
];

export const TopProductsTable = ({ data, loading, compact }: TopProductsTableProps) => {
  const { t } = useTranslation();

  if (loading) {
    if (compact) {
      return (
        <div className="rounded-2xl bg-brand-dark/50 backdrop-blur-sm border border-brand-border/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-brand-border/10 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-2xl bg-brand-dark/50 backdrop-blur-sm border border-brand-border/20 p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-border/20 animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-40 bg-brand-border/20 rounded-lg animate-pulse" />
            <div className="h-3 w-56 bg-brand-border/15 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-brand-border/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) {
    if (compact) {
      return (
        <div className="rounded-2xl bg-brand-dark/50 backdrop-blur-sm border border-brand-border/20 flex flex-col items-center justify-center text-center py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-brand-dark/60 border border-brand-border/30 flex items-center justify-center text-brand-muted/25 mb-3">
            <ChartBar size={20} weight="duotone" />
          </div>
          <p className="text-xs text-brand-muted/50" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>{t('reports.noSales')}</p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl bg-brand-dark/50 backdrop-blur-sm border border-brand-border/20 flex flex-col items-center justify-center text-center py-16 md:py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="w-16 h-16 rounded-2xl bg-brand-dark/60 border border-brand-border/30 flex items-center justify-center text-brand-muted/25 mb-4">
          <ChartBar size={28} weight="duotone" />
        </div>
        <p className="text-sm text-brand-muted/50" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>{t('reports.noSales')}</p>
      </div>
    );
  }

  // Compact bento view — top 3 products only
  if (compact) {
    return (
      <div className="rounded-2xl bg-brand-dark/50 backdrop-blur-sm border border-brand-border/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <AnimatePresence>
          {data.slice(0, 3).map((p, i) => {
            const rankStyle = RANK_STYLES[i] || null;
            const RankIcon = rankStyle?.icon;
            return (
              <motion.div
                key={p.productId}
                variants={rowVariant}
                initial="initial"
                animate="animate"
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 py-3 border-b border-brand-border/10 last:border-0 last:pb-0 first:pt-0"
              >
                {rankStyle ? (
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${rankStyle.bg} border ${rankStyle.border} ${rankStyle.text} shrink-0`}>
                    {RankIcon && <RankIcon size={14} weight="fill" />}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-border/8 text-brand-muted/40 shrink-0">
                    <span className="text-[10px] font-mono font-bold">#{i + 1}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-brand-light/90 leading-snug truncate" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                    {p.productName}
                  </p>
                  <p className="text-[10px] text-brand-muted/40 font-mono mt-0.5">
                    {p.quantitySold} {t('reports.sold')} · ${p.totalUsd.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // Full table view
  return (
    <div className="rounded-2xl bg-brand-dark/50 backdrop-blur-sm border border-brand-border/20 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-border/15">
          <thead>
            <tr className="bg-brand-black/30 backdrop-blur-sm">
              <th className="hidden sm:table-cell px-4 md:px-5 py-3.5 text-left w-14">
                <span className="sr-only">{t('reports.rank')}</span>
                <Medal size={14} weight="duotone" className="text-brand-muted/30" />
              </th>
              <th className="px-4 md:px-5 py-3.5 text-left text-[10px] md:text-[11px] font-medium text-brand-muted/50 uppercase tracking-wider" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                {t('reports.product')}
              </th>
              <th className="px-4 md:px-5 py-3.5 text-right text-[10px] md:text-[11px] font-medium text-brand-muted/50 uppercase tracking-wider" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                {t('reports.sold')}
              </th>
              <th className="px-4 md:px-5 py-3.5 text-right text-[10px] md:text-[11px] font-medium text-brand-muted/50 uppercase tracking-wider" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                {t('reports.totalUsd')}
              </th>
              <th className="hidden md:table-cell px-4 md:px-5 py-3.5 text-right text-[10px] md:text-[11px] font-medium text-brand-muted/50 uppercase tracking-wider" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                {t('reports.totalSyp')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/10">
            <AnimatePresence>
              {data.map((p, i) => {
                const rankStyle = RANK_STYLES[i] || null;
                const RankIcon = rankStyle?.icon;

                return (
                  <motion.tr
                    key={p.productId}
                    variants={rowVariant}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: i * 0.05 }}
                    className="group/row transition-all duration-300 hover:bg-brand-border/5"
                  >
                    {/* Rank */}
                    <td className="hidden sm:table-cell px-4 md:px-5 py-4">
                      {rankStyle ? (
                        <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${rankStyle.bg} border ${rankStyle.border} ${rankStyle.text}`}>
                          {RankIcon && <RankIcon size={14} weight="fill" />}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-border/8 text-brand-muted/40">
                          <span className="text-[10px] font-mono font-bold">#{i + 1}</span>
                        </div>
                      )}
                    </td>

                    {/* Product */}
                    <td className="px-4 md:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                          rankStyle
                            ? `${rankStyle.bg} ${rankStyle.text}`
                            : 'bg-brand-border/10 text-brand-muted/50'
                        }`}>
                          {p.productName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-light/90 group-hover/row:text-brand-gold transition-colors duration-300 leading-snug truncate" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                            {p.productName}
                          </p>
                          {p.sku && (
                            <p className="hidden md:block text-[10px] font-mono text-brand-muted/35 mt-0.5">{p.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="px-4 md:px-5 py-4 text-right">
                      <span className="text-sm font-mono font-medium text-brand-light/80 tabular-nums">{p.quantitySold}</span>
                    </td>

                    {/* USD */}
                    <td className="px-4 md:px-5 py-4 text-right">
                      <span className="text-sm font-mono text-brand-gold tabular-nums">${p.totalUsd.toFixed(2)}</span>
                    </td>

                    {/* SYP */}
                    <td className="hidden md:table-cell px-4 md:px-5 py-4 text-right">
                      <span className="text-sm font-mono text-brand-light/60 tabular-nums">{p.totalSyp.toLocaleString()} ل.س</span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
