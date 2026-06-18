import { useTranslation } from 'react-i18next';
import type { DateRange } from '@/types/reports';

interface DatePresetsProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const today = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const thisWeek = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return { start: start.toISOString().split('T')[0], end: today() };
};

const thisMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: start.toISOString().split('T')[0], end: today() };
};

export const DatePresets = ({ value, onChange }: DatePresetsProps) => {
  const { t } = useTranslation();

  const presets = [
    { label: t('reports.today'), get: () => ({ start: today(), end: today() }) },
    { label: t('reports.thisWeek'), get: thisWeek },
    { label: t('reports.thisMonth'), get: thisMonth },
  ];

  const isActive = (p: DateRange) => value.start === p.start && value.end === p.end;

  return (
    <div className="flex gap-2">
      {presets.map((preset) => {
        const range = preset.get();
        return (
          <button
            key={preset.label}
            onClick={() => onChange(range)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive(range) ? 'bg-brand-gold text-brand-black shadow-sm' : 'text-brand-muted hover:text-[var(--clr-text)] bg-brand-dark'
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
};
