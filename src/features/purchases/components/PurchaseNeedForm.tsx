import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, WarningCircle } from '@phosphor-icons/react';
import { useCreatePurchaseNeed, useUpdatePurchaseNeed } from '@/features/purchases/hooks/usePurchaseNeeds';
import { useToastStore } from '@/features/shared/store/toastSlice';
import type { PurchaseNeed } from '@/types/purchases';

interface PurchaseNeedFormProps {
  open: boolean;
  onClose: () => void;
  editItem?: PurchaseNeed | null;
}

const inputClass = 'w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo';

export const PurchaseNeedForm = ({ open, onClose, editItem }: PurchaseNeedFormProps) => {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const createNeed = useCreatePurchaseNeed();
  const updateNeed = useUpdatePurchaseNeed();

  const [name, setName] = useState(editItem?.name ?? '');
  const [quantity, setQuantity] = useState(String(editItem?.quantity ?? 1));
  const [notes, setNotes] = useState(editItem?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error(t('shortages.nameRequired', 'Name is required'));

      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1) throw new Error(t('shortages.invalidQuantity', 'Quantity must be at least 1'));

      if (editItem) {
        await updateNeed.mutateAsync({
          id: editItem.id,
          payload: { name: name.trim(), quantity: qty, notes: notes.trim() || null },
        });
        addToast(t('shortages.updated', 'Updated successfully'), 'success');
      } else {
        await createNeed.mutateAsync({
          name: name.trim(),
          quantity: qty,
          notes: notes.trim() || null,
          status: 'pending',
          created_by: null,
        });
        addToast(t('shortages.created', 'Added to shortages'), 'success');
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setQuantity('1');
    setNotes('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pn-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--clr-overlay)] backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            key="pn-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
            className="bg-brand-dark/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-md mx-auto relative border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.1),0_8px_32px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              type="button"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-light hover:bg-brand-surface-hover transition-all duration-150 active:scale-[0.92]"
            >
              <X size={18} weight="bold" />
            </button>

            <h2 className="mb-6 text-xl md:text-2xl font-bold text-brand-gold tracking-tight">
              {editItem ? t('shortages.editNeed', 'Edit Need') : t('shortages.addNeed', 'Add Need')}
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-5 p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm flex items-start gap-2.5"
              >
                <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('shortages.itemName', 'Item Name')} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('shortages.itemNamePlaceholder', 'e.g. Coca-Cola 330ml')}
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('common.quantity')} *</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-brand-muted mb-1.5 tracking-wide uppercase">{t('shortages.notes', 'Notes')}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('shortages.notesPlaceholder', 'Optional notes...')}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3.5 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_20px_-4px_rgba(212,175,55,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? t('common.saving') : editItem ? t('common.save') : t('shortages.addToList', 'Add to List')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
