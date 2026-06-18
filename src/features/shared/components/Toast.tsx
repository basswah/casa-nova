import { useToastStore } from '@/features/shared/store/toastSlice';

const typeStyles: Record<string, string> = {
  success: 'bg-green-900/90 text-green-200 border-green-700',
  error: 'bg-red-900/90 text-red-200 border-red-700',
  info: 'bg-brand-dark text-brand-light border-brand-border',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg border shadow-lg flex items-center justify-between gap-3 animate-slide-in ${typeStyles[t.type]}`}
        >
          <span className="text-sm">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-current opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      ))}
    </div>
  );
};
