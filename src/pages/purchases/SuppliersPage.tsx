import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';
import { SupplierList } from '@/features/purchases/components/SupplierList';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const fadeSlideUp = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: easeOutExpo } },
};

export const SuppliersPage = () => {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t('nav.title')} — ${t('suppliers.title')}`; }, [t]);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--clr-gold)]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
      </div>

      <div className="px-5 md:px-8 lg:px-12 pt-10 md:pt-16 pb-16 md:pb-24 max-w-[1600px] mx-auto">
        {/* Hero Header */}
        <motion.div
          initial="initial"
          animate="animate"
          className="mb-10 md:mb-14"
        >
          <motion.div variants={fadeSlideUp} className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--clr-gold)]/10 border border-[var(--clr-gold)]/20 text-[var(--clr-gold)] text-[11px] font-medium tracking-wide">
              <Sparkle size={12} weight="fill" />
              {t('suppliers.title')}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeSlideUp}
            className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-brand-light tracking-tight leading-[1.15] mb-3"
            style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
          >
            {t('suppliers.title')}
          </motion.h1>

          <motion.p
            variants={fadeSlideUp}
            className="text-sm md:text-base text-brand-muted/60 max-w-lg leading-relaxed"
          >
            {t('suppliers.subtitle', 'Manage your vendor partners and supplier information')}
          </motion.p>
        </motion.div>

        <SupplierList />
      </div>
    </div>
  );
};
