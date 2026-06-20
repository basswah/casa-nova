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
    <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-brand-dark/60 border border-brand-border/40 backdrop-blur-sm w-full sm:w-auto">
      {presets.map((preset) => {
        const range = preset.get();
        const active = isActive(range);
        return (
          <button
            key={preset.label}
            onClick={() => onChange(range)}
            className={`relative px-2.5 sm:px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ease-out-expo active:scale-[0.96] ${
              active
                ? 'bg-brand-gold/10 text-brand-gold shadow-[inset_0_1px_0_rgba(201,160,60,0.15)]'
                : 'text-brand-muted hover:text-brand-light'
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
};
