import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)]">
      <div className="bg-brand-dark rounded-xl p-6 w-full max-w-md relative border border-brand-border shadow-floating">
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-muted hover:text-brand-gold transition-colors text-xl leading-none">&times;</button>
        <h2 className="mb-6 text-center text-2xl font-bold text-brand-gold tracking-tight">
          {t(isEdit ? 'supplierForm.editSupplier' : 'supplierForm.newSupplier')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sf-name" className="block text-sm font-medium text-brand-gold mb-1 tracking-wide">{t('supplierForm.supplierName')}</label>
            <input id="sf-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-[var(--clr-text)] focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200" />
          </div>
          <div>
            <label htmlFor="sf-contact" className="block text-sm font-medium text-brand-gold mb-1 tracking-wide">{t('supplierForm.contactInfo')} ({t('common.optional')})</label>
            <input id="sf-contact" type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-[var(--clr-text)] focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-50 shadow-sm active:scale-[0.98]">
            {loading ? t('common.saving') : isEdit ? t('supplierForm.updateSupplier') : t('supplierForm.addSupplier')}
          </button>
        </form>
      </div>
    </div>
  );
};
