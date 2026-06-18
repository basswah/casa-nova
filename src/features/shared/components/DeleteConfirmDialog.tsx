import { useTranslation } from 'react-i18next';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-brand-dark rounded-xl p-6 w-full max-w-sm relative border border-brand-border shadow-[var(--shadow-floating)]">
        <h3 className="text-lg font-bold text-brand-gold mb-2">{title}</h3>
        <p className="text-brand-muted text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-brand-muted bg-brand-black border border-brand-border hover:bg-brand-surface-hover transition-all duration-200 disabled:opacity-40"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
          >
            {loading ? t('common.deleting') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};
