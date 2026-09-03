import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Phone, Sparkle } from '@phosphor-icons/react';
import { useCreateSupplier, useUpdateSupplier } from '@/features/purchases/hooks/useSuppliers';
import { useToastStore } from '@/features/shared/store/toastSlice';
import type { Supplier } from '@/types/purchases';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export const SupplierForm = ({ open, onClose, supplier }: SupplierFormProps) => {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const isEdit = !!supplier;
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (open && !initialized.current) {
      setName(supplier?.name ?? '');
      setContactInfo(supplier?.contact_info ?? '');
      initialized.current = true;
    }
    if (!open) {
      initialized.current = false;
    }
  }, [open, supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && supplier) {
        await updateSupplier.mutateAsync({ ...supplier, name, contact_info: contactInfo || null });
      } else {
        await createSupplier.mutateAsync({ name, contact_info: contactInfo || null });
      }
      onClose();
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('common.error'), 'error');
    }
  };

  const loading = createSupplier.isPending || updateSupplier.isPending;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sf-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            key="sf-content"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="bg-brand-dark/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 w-full max-w-md mx-auto relative border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-brand-muted/40 hover:text-brand-light hover:bg-brand-border/20 transition-all duration-200 active:scale-[0.9]"
            >
              <X size={18} weight="bold" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--clr-gold)]/10 border border-[var(--clr-gold)]/20 flex items-center justify-center">
                <Building size={22} weight="duotone" className="text-brand-gold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-light tracking-tight" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                  {t(isEdit ? 'supplierForm.editSupplier' : 'supplierForm.newSupplier')}
                </h2>
                <p className="text-[11px] text-brand-muted/40 mt-0.5">
                  {isEdit ? t('common.update', { defaultValue: 'Update supplier details' }) : t('common.create', { defaultValue: 'Add a new supplier' })}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Supplier Name */}
              <div>
                <label htmlFor="sf-name" className="block text-xs font-medium text-brand-muted/70 mb-2 tracking-wide uppercase" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                  {t('supplierForm.supplierName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/30">
                    <Building size={15} />
                  </div>
                  <input
                    id="sf-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-3 bg-brand-black/40 border border-brand-border/30 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 focus:border-brand-gold/40 hover:border-brand-gold/20 transition-all duration-300"
                    style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label htmlFor="sf-contact" className="block text-xs font-medium text-brand-muted/70 mb-2 tracking-wide uppercase" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                  {t('supplierForm.contactInfo')} ({t('common.optional')})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted/30">
                    <Phone size={15} />
                  </div>
                  <input
                    id="sf-contact"
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-brand-black/40 border border-brand-border/30 rounded-xl text-sm text-brand-light placeholder-brand-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 focus:border-brand-gold/40 hover:border-brand-gold/20 transition-all duration-300"
                    style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 bg-[var(--clr-gold)] text-brand-black font-bold rounded-xl text-sm tracking-wide flex items-center justify-center gap-2.5 hover:shadow-[0_0_28px_-6px_rgba(212,175,55,0.3)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Sparkle size={16} weight="fill" />
                    {isEdit ? t('supplierForm.updateSupplier') : t('supplierForm.addSupplier')}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
