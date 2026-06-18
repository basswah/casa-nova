import { useTranslation } from 'react-i18next';

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
      className="w-full py-2.5 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-50 shadow-sm active:scale-[0.98]"
    >
      {receiving ? t('purchases.receivingStock') : t('purchases.receiveStock')}
    </button>
  );
};
