import { useTranslation } from 'react-i18next';
import { Spinner, Check } from '@phosphor-icons/react';

interface POReceiveButtonProps {
  receiving: boolean;
  onClick: () => void;
}

export const POReceiveButton = ({ receiving, onClick }: POReceiveButtonProps) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      disabled={receiving}
      className="group w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-500 hover:shadow-[0_0_24px_-4px_rgba(34,197,94,0.25)] transition-all duration-300 ease-out-expo disabled:opacity-40 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500/40 inline-flex items-center justify-center gap-2"
    >
      {receiving ? (
        <>
          <Spinner size={18} className="animate-spin" />
          {t('purchases.receivingStock')}
        </>
      ) : (
        <>
          <Check size={18} weight="bold" className="group-hover:scale-110 transition-transform duration-200" />
          {t('purchases.receiveStock')}
        </>
      )}
    </button>
  );
};
