import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Package } from '@phosphor-icons/react';
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export const PurchaseOrdersPage = () => {
  const { t } = useTranslation();
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

  const metrics = [
    {
      label: t('purchases.totalInvoices'),
      value: orders.length,
      icon: ShoppingCart,
      accent: 'gold',
      desc: 'All time',
    },
    {
      label: t('purchases.thisMonth'),
      value: thisMonth.length,
      icon: Package,
      accent: 'brand',
      desc: 'This period',
    },
    {
      label: t('purchases.totalSuppliers'),
      value: suppliers.length,
      icon: Package,
      accent: 'muted',
      desc: 'Active vendors',
    },
    {
      label: t('purchases.totalValue'),
      value: `$${orders.reduce((sum, o) => sum + (o.total_usd || 0), 0).toLocaleString()}`,
      icon: ShoppingCart,
      accent: 'green',
      desc: 'Invoices total',
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

    const orderData = {
      supplier_id: order.supplier_id,
      order_date: order.order_date,
      total_usd: order.total_usd,
      total_syp: order.total_syp,
      status: order.status,
    };

    const itemsData = items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price_usd: item.unit_price_usd,
      unit_price_syp: item.unit_price_syp,
    }));

    try {
      await createInvoice.mutateAsync({ order: orderData, items: itemsData, userId: user.id });
      setOpenForm(false);
      addToast(t('purchases.invoiceCreated', 'Invoice created and stock updated'), 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('common.error'), 'error');
    }
  };

  return (
    <div className="min-h-[100dvh] max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-lg">
          <h1 className="text-xl md:text-2xl font-bold text-brand-light tracking-tight">{t('purchases.title')}</h1>
          <p className="text-xs md:text-sm text-brand-muted/50 mt-1 tracking-tight">
            {t('purchases.subtitle', 'Manage supplier invoices and incoming stock')}
          </p>
        </div>
        {activeTab === 'invoices' && (
          <button
            onClick={() => setOpenForm(true)}
            className="shrink-0 px-4 py-2 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo active:scale-[0.97] flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            {t('purchases.addInvoice')}
          </button>
        )}
        {activeTab === 'shortages' && (
          <button
            onClick={() => setOpenNeedForm(true)}
            className="shrink-0 px-4 py-2 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo active:scale-[0.97] flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            {t('shortages.addNeed', 'Add Need')}
          </button>
        )}
        {activeTab === 'returns' && (
          <button
            onClick={() => setOpenReturnForm(true)}
            className="shrink-0 px-4 py-2 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo active:scale-[0.97] flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            {t('returns.addReturn', 'Record Return')}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 p-1 bg-brand-dark rounded-xl border border-brand-border overflow-x-auto">
        {(['invoices', 'shortages', 'returns'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-all duration-200 ease-out-expo active:scale-[0.97] ${
              activeTab === tab
                ? 'bg-brand-gold text-brand-black shadow-sm'
                : 'text-brand-muted hover:text-brand-light hover:bg-white/5'
            }`}
          >
            {tab === 'invoices' && t('purchases.invoices')}
            {tab === 'shortages' && t('purchases.shortages')}
            {tab === 'returns' && t('purchases.returns')}
          </button>
        ))}
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              variants={staggerItem}
              className="relative overflow-hidden rounded-3xl bg-brand-dark border border-brand-border/30 shadow-[var(--shadow-floating)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                    m.accent === 'gold'
                      ? 'bg-brand-gold/10 text-brand-gold'
                      : m.accent === 'green'
                      ? 'bg-green-500/10 text-green-400'
                      : m.accent === 'brand'
                      ? 'bg-brand-surface-hover text-brand-light'
                      : 'bg-brand-surface-hover text-brand-muted'
                  }`}>
                    <Icon size={22} weight="duotone" />
                  </div>
                </div>
                <p className="text-[10px] font-medium text-brand-muted/50 uppercase tracking-widest mb-1.5">{m.label}</p>
                <p className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${
                  m.accent === 'gold'
                    ? 'text-brand-gold'
                    : m.accent === 'green'
                    ? 'text-green-400'
                    : 'text-brand-light'
                }`}>
                  {m.value}
                </p>
                <p className="text-[11px] text-brand-muted/50 mt-1.5">{m.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'invoices' ? (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <PurchaseInvoiceList
              onView={setViewOrderId}
              onAddInvoice={() => setOpenForm(true)}
            />
          </motion.div>
        ) : activeTab === 'shortages' ? (
          <motion.div
            key="shortages"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <PurchaseNeedsList />
          </motion.div>
        ) : (
          <motion.div
            key="returns"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <PurchaseReturnsList />
          </motion.div>
        )}
      </AnimatePresence>

      <PurchaseOrderForm open={openForm} onClose={() => setOpenForm(false)} onSubmit={handleCreateInvoice} />
      <PurchaseNeedForm open={openNeedForm} onClose={() => setOpenNeedForm(false)} />
      <PurchaseReturnForm open={openReturnForm} onClose={() => setOpenReturnForm(false)} />
      <PurchaseInvoiceDetail orderId={viewOrderId} onClose={handleCloseDetail} />
    </div>
  );
};
