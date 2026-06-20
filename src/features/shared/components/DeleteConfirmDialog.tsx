import { AnimatePresence, motion, type Easing } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { WarningCircle, Trash, X } from '@phosphor-icons/react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string | React.ReactNode;
  loading?: boolean;
}

const easeOutBack: Easing = [0.34, 1.56, 0.64, 1];

export const DeleteConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }: DeleteConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.35, ease: easeOutBack }}
            className="relative w-full max-w-sm bg-brand-dark/95 backdrop-blur-sm rounded-xl md:rounded-2xl border border-brand-border/30 shadow-[var(--shadow-floating)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-900/20 border border-red-800/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <WarningCircle size={18} weight="duotone" className="text-red-400" />
                </div>
                <h2 className="text-sm font-bold text-brand-light tracking-tight">
                  {title ?? t('common.deleteConfirmTitle')}
                </h2>
                <button
                  onClick={onClose}
                  className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted/40 hover:text-brand-light hover:bg-brand-black/40 transition-all duration-150 active:scale-[0.9]"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <p className="text-sm text-brand-muted/70 leading-relaxed mb-6">
                {message ?? t('common.deleteConfirmMessage')}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-brand-black/60 border border-brand-border/30 text-brand-muted/60 rounded-xl text-sm font-medium hover:text-brand-light hover:border-brand-border/60 transition-all duration-200 ease-out-expo active:scale-[0.97] disabled:opacity-40"
                  disabled={loading}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 hover:shadow-[0_0_28px_-6px_rgba(239,68,68,0.3)] transition-all duration-300 ease-out-expo disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center justify-center gap-2"
                >
                  <Trash size={16} weight="duotone" />
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : t('common.delete')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
