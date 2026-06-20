import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { motion, type Easing } from 'framer-motion';
import { CurrencyDollar, Package, WarningCircle, ShoppingCart, Note, Clock } from '@phosphor-icons/react';
import { Skeleton } from '@/features/shared/components/Skeleton';

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: 'gold' | 'green' | 'red' | 'default';
}

const StatCard = ({ icon, label, value, accent = 'gold' }: StatCardProps) => (
  <div className="relative overflow-hidden rounded-3xl bg-brand-dark border border-brand-border/30 shadow-[var(--shadow-floating)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]">
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 ${
          accent === 'gold' ? 'bg-brand-gold/10' :
          accent === 'green' ? 'bg-green-500/10' :
          accent === 'red' ? 'bg-red-500/10' :
          'bg-brand-border/20'
        }`}>
          <span className={accent === 'gold' ? 'text-brand-gold' : accent === 'green' ? 'text-green-400' : accent === 'red' ? 'text-red-400' : 'text-brand-muted/60'}>
            {icon}
          </span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest mb-1.5">{label}</p>
        <p className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${
          accent === 'gold' ? 'text-brand-gold' :
          accent === 'green' ? 'text-green-400' :
          accent === 'red' ? 'text-red-400' :
          'text-brand-light'
        }`}>{value}</p>
      </div>
    </div>
  </div>
);

interface ActivityItemProps {
  icon: React.ReactNode;
  primary: string;
  secondary: string;
}

const ActivityItem = ({ icon, primary, secondary }: ActivityItemProps) => (
  <div className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl hover:bg-brand-black/30 transition-all duration-300 ease-out-expo">
    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-black/40 border border-brand-border/20 shrink-0 transition-all duration-300 ease-out-expo group-hover:border-brand-gold/30">
      <span className="text-brand-muted/40 group-hover:text-brand-gold/70 transition-colors duration-300">
        {icon}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-brand-light font-medium truncate capitalize">{primary}</p>
      <p className="text-xs text-brand-muted/50 font-mono truncate mt-0.5">{secondary}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useDashboard();

  useEffect(() => { document.title = `${t('nav.title')} — ${t('dashboard.title')}`; }, [t]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
        <div>
          <Skeleton className="h-7 w-48 rounded-md mb-2" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-brand-dark rounded-3xl p-6 border border-brand-border/30 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <Skeleton className="h-6 w-36 rounded-md mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl mb-2.5" />
            ))}
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-6 w-36 rounded-md mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl mb-2.5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] max-w-7xl mx-auto flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <WarningCircle size={48} weight="duotone" className="text-red-400/30" />
          <p className="text-red-400 text-sm font-medium">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-brand-light tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-xs md:text-sm text-brand-muted/50 mt-1 tracking-tight">
          {t('dashboard.welcome', 'Welcome back! Here\'s your business overview')}
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<CurrencyDollar size={22} weight="duotone" />}
            label={t('dashboard.todaySalesUsd')}
            value={`$${data.todaySalesUsd.toLocaleString()}`}
            accent="gold"
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<ShoppingCart size={22} weight="duotone" />}
            label={t('dashboard.todaySalesSyp')}
            value={`${data.todaySalesSyp.toLocaleString()} ل.س`}
            accent="green"
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<Package size={22} weight="duotone" />}
            label={t('dashboard.todayOrders')}
            value={String(data.todaySalesCount)}
            accent="default"
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<WarningCircle size={22} weight="duotone" />}
            label={t('dashboard.lowStock')}
            value={String(data.lowStockCount)}
            accent={data.lowStockCount > 0 ? 'red' : 'green'}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <h2 className="text-sm font-semibold text-brand-gold tracking-tight mb-4 flex items-center gap-2">
            <ShoppingCart size={16} weight="duotone" />
            {t('dashboard.recentSales')}
          </h2>
          <div className="relative overflow-hidden rounded-3xl bg-brand-dark border border-brand-border/30 shadow-[var(--shadow-floating)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] divide-y divide-brand-border/20">
            {data.recentSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <ShoppingCart size={32} weight="thin" className="text-brand-muted/20 mb-3" />
                <p className="text-sm text-brand-muted/50 text-center">{t('common.noData')}</p>
              </div>
            ) : (
              data.recentSales.map((sale) => (
                <ActivityItem
                  key={sale.id}
                  icon={<Note size={18} weight="duotone" />}
                  primary={sale.id.slice(0, 8)}
                  secondary={`$${sale.total_usd?.toFixed(2) ?? '0.00'}`}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-sm font-semibold text-brand-gold tracking-tight mb-4 flex items-center gap-2">
            <Package size={16} weight="duotone" />
            {t('dashboard.recentOrders')}
          </h2>
          <div className="relative overflow-hidden rounded-3xl bg-brand-dark border border-brand-border/30 shadow-[var(--shadow-floating)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] divide-y divide-brand-border/20">
            {data.recentPurchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <Package size={32} weight="thin" className="text-brand-muted/20 mb-3" />
                <p className="text-sm text-brand-muted/50 text-center">{t('common.noData')}</p>
              </div>
            ) : (
              data.recentPurchaseOrders.map((po) => (
                <ActivityItem
                  key={po.id}
                  icon={<Clock size={18} weight="duotone" />}
                  primary={po.id.slice(0, 8)}
                  secondary={po.status}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};