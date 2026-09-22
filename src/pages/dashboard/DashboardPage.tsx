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
  accent?: 'gold' | 'green' | 'danger' | 'success' | 'default';
}

const StatCard = ({ icon, label, value, accent = 'gold' }: StatCardProps) => {
  const accentStyles = {
    gold: {
      container: 'bg-brand-dark/60 border-brand-border/20',
      icon: 'text-brand-gold/80',
      iconBg: 'bg-brand-gold/10',
      value: 'text-brand-gold',
      label: 'text-brand-muted/50',
    },
    green: {
      container: 'bg-brand-dark/60 border-brand-border/20',
      icon: 'text-emerald-400/80',
      iconBg: 'bg-emerald-500/10',
      value: 'text-emerald-400',
      label: 'text-brand-muted/50',
    },
    danger: {
      container: 'bg-brand-dark/60 border-brand-border/20',
      icon: 'text-red-400/80',
      iconBg: 'bg-red-500/10',
      value: 'text-red-400',
      label: 'text-brand-muted/50',
    },
    success: {
      container: 'bg-brand-dark/60 border-brand-border/20',
      icon: 'text-emerald-400/80',
      iconBg: 'bg-emerald-500/10',
      value: 'text-emerald-400',
      label: 'text-brand-muted/50',
    },
    default: {
      container: 'bg-brand-dark/60 border-brand-border/20',
      icon: 'text-brand-muted/60',
      iconBg: 'bg-brand-border/10',
      value: 'text-brand-light',
      label: 'text-brand-muted/50',
    },
  };

  const style = accentStyles[accent];

  return (
    <motion.div
      variants={fadeSlideUp}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl bg-brand-dark/60 border border-brand-border/20 p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-brand-gold/20 hover:shadow-[0_8px_32px_-12px_rgba(201,160,60,0.15)]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center`}>
          <span className={style.icon}>{icon}</span>
        </div>
      </div>
      <p className={`text-[10px] md:text-[11px] font-semibold uppercase tracking-wider ${style.label} mb-1`}>
        {label}
      </p>
      <p className={`text-xl md:text-2xl font-bold font-mono tracking-tight ${style.value}`}>
        {value}
      </p>
    </motion.div>
  );
};

interface ActivityItemProps {
  icon: React.ReactNode;
  primary: string;
  secondary: string;
}

const ActivityItem = ({ icon, primary, secondary }: ActivityItemProps) => (
  <div className="group flex items-center gap-3 px-4 py-3.5 hover:bg-brand-black/30 transition-all duration-200 border-b border-brand-border/10 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-brand-black/40 border border-brand-border/20 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:border-brand-gold/30">
      <span className="text-brand-muted/40 group-hover:text-brand-gold/70 transition-colors duration-200">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-brand-light font-medium truncate capitalize">{primary}</p>
      <p className="text-xs text-brand-muted/50 font-mono truncate">{secondary}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useDashboard();

  useEffect(() => { document.title = `${t('nav.title')} — ${t('dashboard.title')}`; }, [t]);

  if (isLoading) {
    return (
      <div className="px-5 md:px-8 lg:px-12 pt-8 md:pt-12 pb-16 md:pb-24 max-w-[1600px] mx-auto">
        <div className="mb-8 md:mb-12">
          <Skeleton className="h-7 w-48 rounded-md mb-2" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-brand-dark/60 border border-brand-border/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg mb-2" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <Skeleton className="h-6 w-36 rounded-md mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl mb-2.5" />
            ))}
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-6 w-36 rounded-md mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl mb-2.5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-5 md:px-8 lg:px-12 pt-8 md:pt-12 pb-16 md:pb-24 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-red-900/15 border border-red-800/20 flex items-center justify-center">
              <WarningCircle size={28} weight="duotone" className="text-red-400/60" />
            </div>
            <p className="text-sm text-red-400/80 font-medium">{t('common.error')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 lg:px-12 pt-8 md:pt-12 pb-16 md:pb-24 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-light tracking-tight mb-2">{t('dashboard.title')}</h1>
        <p className="text-sm text-brand-muted/50">
          {t('dashboard.welcome', "Welcome back! Here's your business overview")}
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<CurrencyDollar size={20} weight="duotone" />}
            label={t('dashboard.todaySalesUsd')}
            value={`$${data.todaySalesUsd.toLocaleString()}`}
            accent="gold"
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<ShoppingCart size={20} weight="duotone" />}
            label={t('dashboard.todaySalesSyp')}
            value={`${data.todaySalesSyp.toLocaleString()} ل.س`}
            accent="green"
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<Package size={20} weight="duotone" />}
            label={t('dashboard.todayOrders')}
            value={String(data.todaySalesCount)}
            accent="default"
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <StatCard
            icon={<WarningCircle size={20} weight="duotone" />}
            label={t('dashboard.lowStock')}
            value={String(data.lowStockCount)}
            accent={data.lowStockCount > 0 ? 'danger' : 'success'}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <h2 className="text-sm font-semibold text-brand-gold tracking-tight mb-4 flex items-center gap-2">
            <ShoppingCart size={15} weight="duotone" />
            {t('dashboard.recentSales')}
          </h2>
          <div className="rounded-2xl bg-brand-dark/60 border border-brand-border/20 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {data.recentSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <ShoppingCart size={28} weight="thin" className="text-brand-muted/20 mb-2" />
                <p className="text-sm text-brand-muted/50 text-center">{t('common.noData')}</p>
              </div>
            ) : (
              data.recentSales.map((sale) => (
                <ActivityItem
                  key={sale.id}
                  icon={<Note size={16} weight="duotone" />}
                  primary={sale.id.slice(0, 8)}
                  secondary={`$${sale.total_usd?.toFixed(2) ?? '0.00'}`}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-sm font-semibold text-brand-gold tracking-tight mb-4 flex items-center gap-2">
            <Package size={15} weight="duotone" />
            {t('dashboard.recentOrders')}
          </h2>
          <div className="rounded-2xl bg-brand-dark/60 border border-brand-border/20 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {data.recentPurchaseOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <Package size={28} weight="thin" className="text-brand-muted/20 mb-2" />
                <p className="text-sm text-brand-muted/50 text-center">{t('common.noData')}</p>
              </div>
            ) : (
              data.recentPurchaseOrders.map((po) => (
                <ActivityItem
                  key={po.id}
                  icon={<Clock size={16} weight="duotone" />}
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