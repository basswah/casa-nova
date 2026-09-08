import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  CurrencyDollar,
  UsersThree,
  TrendUp,
  Receipt,
  ListChecks,
  ArrowCounterClockwise,
  Sparkle,
} from '@phosphor-icons/react';
import { usePurchaseOrders } from '@/features/purchases/hooks/usePurchaseOrders';
import { useSuppliers } from '@/features/purchases/hooks/useSuppliers';
import { useCreatePurchaseInvoice } from '@/features/purchases/hooks/useCreatePurchaseInvoice';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToastStore } from '@/features/shared/store/toastSlice';
import { PurchaseInvoiceList } from '@/features/purchases/components/PurchaseInvoiceList';
import { PurchaseInvoiceDetail } from '@/features/purchases/components/PurchaseInvoiceDetail';
import { PurchaseNeedsList } from '@/features/purchases/components/PurchaseNeedsList';
import { PurchaseNeedForm } from '@/features/purchases/components/PurchaseNeedForm';
import { PurchaseReturnsList } from '@/features/purchases/components/PurchaseReturnsList';
import { PurchaseReturnForm } from '@/features/purchases/components/PurchaseReturnForm';
import { PurchaseOrderForm } from '@/features/purchases/components/PurchaseOrderForm';

const ease = [0.16, 1, 0.3, 1] as const;

const page = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease },
  },
};

const tabs = [
  { key: 'invoices' as const, icon: Receipt, labelKey: 'purchases.invoices' },
  { key: 'shortages' as const, icon: ListChecks, labelKey: 'purchases.shortages' },
  { key: 'returns' as const, icon: ArrowCounterClockwise, labelKey: 'purchases.returns' },
] as const;

export const PurchaseOrdersPage = () => {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const { data: orders = [] } = usePurchaseOrders();
  const { data: suppliers = [] } = useSuppliers();
  const createInvoice = useCreatePurchaseInvoice();
  const { user } = useAuth();
  const addToast = useToastStore((s) => s.addToast);

  const [openForm, setOpenForm] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'shortages' | 'returns'>('invoices');
  const [openNeedForm, setOpenNeedForm] = useState(false);
  const [openReturnForm, setOpenReturnForm] = useState(false);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('purchases.title')}`; }, [t]);

  const handleCloseDetail = () => setViewOrderId(null);

  const thisMonth = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.order_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [orders]);

  const totalValue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total_usd || 0), 0),
    [orders],
  );

  const metrics = [
    {
      label: t('purchases.totalInvoices'),
      value: orders.length,
      icon: ShoppingCart,
      gradient: 'from-amber-500/20 to-yellow-600/5',
      iconColor: 'text-amber-400',
      span: 'col-span-1',
    },
    {
      label: t('purchases.thisMonth'),
      value: thisMonth.length,
      icon: TrendUp,
      gradient: 'from-blue-500/20 to-cyan-600/5',
      iconColor: 'text-blue-400',
      span: 'col-span-1',
    },
    {
      label: t('purchases.totalSuppliers'),
      value: suppliers.length,
      icon: UsersThree,
      gradient: 'from-purple-500/20 to-violet-600/5',
      iconColor: 'text-purple-400',
      span: 'col-span-1',
    },
    {
      label: t('purchases.totalValue'),
      value: `$${totalValue.toLocaleString()}`,
      icon: CurrencyDollar,
      gradient: 'from-emerald-500/20 to-green-600/5',
      iconColor: 'text-emerald-400',
      span: 'col-span-1',
    },
  ];

  const handleCreateInvoice = async (
    order: { supplier_id: string; order_date: string; total_usd: number; total_syp: number; status: string },
    items: { product_id: string | null; product_name: string; quantity: number; unit_price_usd: number; unit_price_syp: number }[],
  ) => {
    if (!user?.id) {
      addToast(t('common.error'), 'error');
      return;
    }
    try {
      await createInvoice.mutateAsync({
        order: { ...order },
        items: items.map((item) => ({ ...item })),
        userId: user.id,
      });
      setOpenForm(false);
      addToast(t('purchases.invoiceCreated', 'Invoice created and stock updated'), 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('common.error'), 'error');
    }
  };

  const handleAdd = () => {
    if (activeTab === 'invoices') setOpenForm(true);
    else if (activeTab === 'shortages') setOpenNeedForm(true);
    else setOpenReturnForm(true);
  };

  const addLabel = activeTab === 'invoices'
    ? t('purchases.addInvoice')
    : activeTab === 'shortages'
    ? t('shortages.addNeed', 'Add Need')
    : t('returns.addReturn', 'Record Return');

  return (
    <main className="min-h-[100dvh] overflow-x-hidden">
      <motion.div
        variants={page}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Ambient Background */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-gold/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="px-5 md:px-8 lg:px-12 pt-8 md:pt-12 pb-16 md:pb-24 max-w-[1600px] mx-auto">
        {/* Hero Header */}
        <motion.section
          variants={fadeUp}
          className="relative px-4 md:px-8 pt-10 md:pt-16 pb-8 md:pb-12 max-w-7xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <motion.div
                variants={scaleIn}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 mb-5"
              >
                <Sparkle size={14} weight="fill" className="text-brand-gold" />
                <span className="text-[11px] font-semibold text-brand-gold uppercase tracking-widest">
                  {t('purchases.title')}
                </span>
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-brand-light leading-[1.1] tracking-tight">
                {t('purchases.subtitle', 'Manage supplier invoices and incoming stock')}
              </h1>

              <p className="mt-3 text-sm md:text-base text-brand-muted/60 max-w-lg leading-relaxed">
                {t('purchases.pageDescription', 'Track purchases, monitor shortages, and manage returns from a single dashboard.')}
              </p>
            </div>

            <motion.button
              variants={scaleIn}
              onClick={handleAdd}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px -4px rgba(201, 160, 60, 0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="shrink-0 h-12 px-6 bg-brand-gold text-brand-black font-semibold rounded-2xl flex items-center gap-2.5 transition-colors duration-300 hover:bg-[var(--clr-gold-hover)]"
            >
              <Plus size={20} weight="bold" />
              {addLabel}
            </motion.button>
          </div>
        </motion.section>

        {/* Metrics Bento Grid */}
        <motion.section
          variants={fadeUp}
          className="px-4 md:px-8 pb-6 md:pb-8 max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  variants={scaleIn}
                  whileHover={prefersReduced ? {} : { y: -4, transition: { duration: 0.3, ease } }}
                  className={`relative group overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br ${m.gradient} backdrop-blur-sm p-5 md:p-6 cursor-default`}
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.03] to-transparent" />

                  <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/[0.06] mb-4 ${m.iconColor}`}>
                      <Icon size={20} weight="duotone" />
                    </div>
                    <p className="text-[11px] font-medium text-brand-muted/50 uppercase tracking-widest mb-1">
                      {m.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold font-mono text-brand-light tracking-tight">
                      {m.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Tab Navigation */}
        <motion.section
          variants={fadeUp}
          className="px-4 md:px-8 pb-6 md:pb-8 max-w-7xl mx-auto"
        >
          <div className="inline-flex p-1 rounded-2xl bg-brand-dark/80 backdrop-blur-xl border border-white/[0.06]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-300 ease-out-expo
                    ${isActive
                      ? 'text-brand-black'
                      : 'text-brand-muted hover:text-brand-light'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-gold rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Icon size={16} weight={isActive ? 'fill' : 'duotone'} />
                    {t(tab.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Content */}
        <motion.section
          variants={fadeUp}
          className="px-4 md:px-8 pb-16 md:pb-24 max-w-7xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'invoices' && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
              >
                <PurchaseInvoiceList
                  onView={setViewOrderId}
                  onAddInvoice={() => setOpenForm(true)}
                />
              </motion.div>
            )}
            {activeTab === 'shortages' && (
              <motion.div
                key="shortages"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
              >
                <PurchaseNeedsList />
              </motion.div>
            )}
            {activeTab === 'returns' && (
              <motion.div
                key="returns"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
              >
                <PurchaseReturnsList />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
        </div>
      </motion.div>

      {/* Modals */}
      <PurchaseOrderForm open={openForm} onClose={() => setOpenForm(false)} onSubmit={handleCreateInvoice} />
      <PurchaseNeedForm open={openNeedForm} onClose={() => setOpenNeedForm(false)} />
      <PurchaseReturnForm open={openReturnForm} onClose={() => setOpenReturnForm(false)} />
      <PurchaseInvoiceDetail orderId={viewOrderId} onClose={handleCloseDetail} />
    </main>
  );
};
