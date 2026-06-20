import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CalendarBlank, Clock, Users, Plus } from '@phosphor-icons/react';
import { PurchaseOrderList } from '@/features/purchases/components/PurchaseOrderList';
import { PurchaseOrderForm } from '@/features/purchases/components/PurchaseOrderForm';
import { PurchaseOrderDetail } from '@/features/purchases/components/PurchaseOrderDetail';
import { usePurchaseOrders } from '@/features/purchases/hooks/usePurchaseOrders';
import { useSuppliers } from '@/features/purchases/hooks/useSuppliers';
import type { PurchaseOrder } from '@/types/purchases';

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
  const [openForm, setOpenForm] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('purchases.title')}`; }, [t]);

  const handleCloseDetail = () => setViewOrderId(null);
  const handleReceiveStock = (order: PurchaseOrder) => setReceivingOrder(order);
  const handleCloseReceive = () => setReceivingOrder(null);

  const thisMonth = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.order_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [orders]);

  const metrics = [
    {
      label: t('purchases.totalOrders'),
      value: orders.length,
      icon: FileText,
      accent: 'gold',
      desc: 'All time',
    },
    {
      label: t('purchases.thisMonth'),
      value: thisMonth.length,
      icon: CalendarBlank,
      accent: 'brand',
      desc: 'This period',
    },
    {
      label: t('purchases.filterPending'),
      value: orders.filter((o) => o.status === 'pending').length,
      icon: Clock,
      accent: 'pending',
      desc: 'Awaiting delivery',
    },
    {
      label: t('purchases.totalSuppliers'),
      value: suppliers.length,
      icon: Users,
      accent: 'muted',
      desc: 'Active vendors',
    },
  ];

  return (
    <div className="min-h-[100dvh] max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Split Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-gold tracking-tight">{t('purchases.title')}</h1>
          <p className="text-sm text-brand-muted mt-1.5 leading-relaxed">{t('purchases.subtitle', 'Manage supplier invoices and incoming stock')}</p>
        </div>
        <button
          onClick={() => setOpenForm(true)}
          className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all duration-300 ease-out-expo active:scale-[0.97] shrink-0"
        >
          <Plus size={18} weight="bold" className="group-hover:rotate-90 transition-transform duration-300 ease-out-expo" />
          {t('purchases.addOrder')}
        </button>
      </div>

      {/* Asymmetric Bento Metrics */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:1.6fr_1fr_1fr_1fr] gap-4"
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
              className={`group rounded-xl border p-5 transition-all duration-300 ease-out-expo hover:shadow-[var(--shadow-hover)] ${
                m.accent === 'gold'
                  ? 'bg-brand-dark border-brand-border/60 hover:border-brand-gold/20'
                  : 'bg-brand-dark border-brand-border/60 hover:border-brand-gold/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                  m.accent === 'gold' ? 'bg-brand-gold/10 text-brand-gold' :
                  m.accent === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                  m.accent === 'brand' ? 'bg-brand-surface-hover text-brand-light' :
                  'bg-brand-surface-hover text-brand-muted'
                }`}>
                  <Icon size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-brand-muted/70 uppercase tracking-widest">{m.label}</p>
                  <p className={`text-2xl font-bold font-mono mt-1 leading-none ${
                    m.accent === 'gold' ? 'text-brand-gold' :
                    m.accent === 'pending' ? 'text-yellow-400' :
                    'text-brand-light'
                  }`}>
                    {m.value}
                  </p>
                  <p className="text-[11px] text-brand-muted/50 mt-1.5">{m.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* List */}
      <PurchaseOrderList
        onReceiveStock={handleReceiveStock}
        onViewOrder={setViewOrderId}
        onAddOrder={() => setOpenForm(true)}
      />

      {/* Form Modal */}
      <PurchaseOrderForm open={openForm} onClose={() => setOpenForm(false)} />

      {/* Detail Modals */}
      <AnimatePresence>
        {viewOrderId && (
          <motion.div
            key="order-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PurchaseOrderDetail
              orderId={viewOrderId}
              onClose={handleCloseDetail}
              onReceiveStock={handleReceiveStock}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receivingOrder && (
          <motion.div
            key="order-receive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PurchaseOrderDetail
              orderId={receivingOrder.id}
              onClose={handleCloseReceive}
              onReceiveStock={handleReceiveStock}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
