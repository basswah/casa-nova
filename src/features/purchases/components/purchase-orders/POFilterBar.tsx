import { useTranslation } from 'react-i18next';

type FilterStatus = 'all' | 'pending' | 'received' | 'cancelled';

interface POFilterBarProps {
  filterStatus: FilterStatus;
  onChange: (status: FilterStatus) => void;
}

const filters: FilterStatus[] = ['all', 'pending', 'received', 'cancelled'];

const filterLabels: Record<FilterStatus, string> = {
  all: 'filterAll',
  pending: 'filterPending',
  received: 'filterReceived',
  cancelled: 'filterCancelled',
};

export const POFilterBar = ({ filterStatus, onChange }: POFilterBarProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex space-x-2">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filterStatus === f ? 'bg-brand-gold text-brand-black shadow-sm' : 'text-brand-muted hover:text-[var(--clr-text)] bg-brand-dark'
          }`}
        >
          {t(`purchases.${filterLabels[f]}`)}
        </button>
      ))}
    </div>
  );
};
