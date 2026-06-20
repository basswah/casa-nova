import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Phone } from '@phosphor-icons/react';
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            key="sf-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="bg-brand-dark/95 backdrop-blur-xl rounded-2xl p-5 md:p-7 w-full max-w-md mx-auto relative border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} type="button" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover transition-all duration-150 active:scale-[0.92]">
              <X size={16} weight="bold" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-5">
              <Building size={24} weight="duotone" />
            </div>

            <h2 className="mb-6 text-xl font-bold text-brand-gold tracking-tight">
              {t(isEdit ? 'supplierForm.editSupplier' : 'supplierForm.newSupplier')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="sf-name" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('supplierForm.supplierName')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted/40">
                    <Building size={15} />
                  </div>
                  <input id="sf-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo" />
                </div>
              </div>
              <div>
                <label htmlFor="sf-contact" className="block text-xs font-medium text-brand-muted mb-1.5 tracking-wide">{t('supplierForm.contactInfo')} ({t('common.optional')})</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted/40">
                    <Phone size={15} />
                  </div>
                  <input id="sf-contact" type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]">
                {loading ? t('common.saving') : isEdit ? t('supplierForm.updateSupplier') : t('supplierForm.addSupplier')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
