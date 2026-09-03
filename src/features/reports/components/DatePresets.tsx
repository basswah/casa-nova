import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CaretDown, ArrowRight, X } from '@phosphor-icons/react';
import { useAvailableMonths } from '@/features/reports/hooks/useReports';
import type { DateRange } from '@/types/reports';

interface DatePresetsProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const dayStart = () => new Date().toISOString().split('T')[0];

const thisWeek = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return { start: start.toISOString().split('T')[0], end: dayStart() };
};

const thisMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: start.toISOString().split('T')[0], end: dayStart() };
};

const fullYear = (y = new Date().getFullYear()) => {
  return { start: `${y}-01-01`, end: `${y}-12-31` };
};

const monthRange = (y: number, m: number) => {
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
};

const MONTHS_KEYS = [
  'reports.january', 'reports.february', 'reports.march', 'reports.april',
  'reports.may', 'reports.june', 'reports.july', 'reports.august',
  'reports.september', 'reports.october', 'reports.november', 'reports.december',
];

const spring = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };
const quickExit = { duration: 0.15, ease: [0.4, 0, 1, 1] as [number, number, number, number] };

const backdropVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: quickExit },
};

const sheetVar = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: spring },
  exit: { y: '100%', transition: spring },
};

const dropdownVar = {
  hidden: { opacity: 0, y: -4, scaleY: 0.96 },
  visible: { opacity: 1, y: 0, scaleY: 1, transition: spring },
  exit: { opacity: 0, y: -4, scaleY: 0.96, transition: quickExit },
};

export const DatePresets = ({ value, onChange }: DatePresetsProps) => {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'month' | 'year'>('month');
  const { data: availableMonths = [] } = useAvailableMonths();
  const triggerRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const curMonth = new Date().getMonth();

  const availableYears = useMemo(() => {
    const s = new Set<number>();
    s.add(currentYear);
    for (const m of availableMonths) s.add(m.year);
    return Array.from(s).sort((a, b) => b - a);
  }, [availableMonths, currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(curMonth);
  const yrRef = useRef(currentYear);
  const moRef = useRef(curMonth);

  const availMonthsForYear = useMemo(
    () => availableMonths.filter((m) => m.year === selectedYear).map((m) => m.month),
    [availableMonths, selectedYear]
  );

  const hasSelection = pickerMode === 'month' ? availMonthsForYear.includes(selectedMonth) : true;

  const close = useCallback(() => setShowPicker(false), []);

  const handleApply = useCallback(() => {
    if (pickerMode === 'month') {
      if (!availMonthsForYear.includes(moRef.current)) return;
      onChange(monthRange(yrRef.current, moRef.current));
    } else {
      onChange(fullYear(yrRef.current));
    }
    close();
  }, [pickerMode, availMonthsForYear, onChange, close]);

  const handleYearClick = useCallback((y: number) => {
    setSelectedYear(y);
    yrRef.current = y;
  }, []);

  const handleMonthClick = useCallback((m: number) => {
    setSelectedMonth(m);
    moRef.current = m;
  }, []);

  const quickPresets = [
    { label: t('reports.today'), get: () => ({ start: dayStart(), end: dayStart() }) },
    { label: t('reports.thisWeek'), get: thisWeek },
    { label: t('reports.thisMonth'), get: thisMonth },
    { label: t('reports.fullYear', 'Full Year'), get: () => fullYear() },
  ];

  const isActive = (p: DateRange) => value.start === p.start && value.end === p.end;

  const quickPresetRange = (preset: (typeof quickPresets)[number]) => {
    const r = preset.get();
    return { range: r, active: isActive(r) };
  };

  // Click outside (desktop only)
  useEffect(() => {
    if (!showPicker) return;

    const handleOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        desktopRef.current && !desktopRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showPicker, close]);

  const pickerContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-sm font-semibold text-brand-light tracking-tight"
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        >
          {t('reports.selectPeriod', 'Select Period')}
        </span>
        <button
          onClick={close}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-muted/50 hover:text-brand-light/80 hover:bg-brand-border/10 transition-all duration-200 active:scale-90"
          aria-label={t('reports.close', 'Close')}
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-brand-black/40 rounded-xl mb-5">
        <button
          onClick={() => setPickerMode('month')}
          className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            pickerMode === 'month'
              ? 'bg-[var(--clr-gold)]/15 text-brand-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
              : 'text-brand-muted/50 hover:text-brand-light/70'
          }`}
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        >
          {t('reports.byMonth', 'By Month')}
        </button>
        <button
          onClick={() => setPickerMode('year')}
          className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            pickerMode === 'year'
              ? 'bg-[var(--clr-gold)]/15 text-brand-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
              : 'text-brand-muted/50 hover:text-brand-light/70'
          }`}
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        >
          {t('reports.byYear', 'By Year')}
        </button>
      </div>

      {/* Year selector */}
      <div className="mb-5">
        <label className="block text-[10px] font-medium text-brand-muted/40 uppercase tracking-wider mb-2.5 px-0.5">
          {t('reports.year', 'Year')}
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory -mx-2 px-2">
          {availableYears.map((y) => (
            <button
              key={y}
              onClick={() => handleYearClick(y)}
              className={`snap-start shrink-0 px-4 py-2.5 text-xs font-mono font-medium rounded-xl transition-all duration-200 ${
                selectedYear === y
                  ? 'bg-[var(--clr-gold)]/15 text-brand-gold border border-[var(--clr-gold)]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                  : 'text-brand-muted/50 hover:text-brand-light/80 hover:bg-brand-border/10 border border-transparent'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Month grid (month mode) */}
      {pickerMode === 'month' && (
        <div className="mb-5">
          <label className="block text-[10px] font-medium text-brand-muted/40 uppercase tracking-wider mb-2.5 px-0.5">
            {t('reports.month', 'Month')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MONTHS_KEYS.map((key, i) => {
              const hasData = availMonthsForYear.includes(i);
              const sel = selectedMonth === i;
              return (
                <button
                  key={i}
                  onClick={() => { if (hasData) handleMonthClick(i); }}
                  disabled={!hasData}
                  className={`py-2.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                    sel && hasData
                      ? 'bg-[var(--clr-gold)]/15 text-brand-gold border border-[var(--clr-gold)]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                      : hasData
                        ? 'text-brand-muted/70 hover:text-brand-light/80 hover:bg-brand-border/10 border border-transparent cursor-pointer'
                        : 'text-brand-muted/15 border border-transparent cursor-not-allowed line-through'
                  }`}
                  style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
                >
                  {t(key)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state (month mode, no data) */}
      {pickerMode === 'month' && availMonthsForYear.length === 0 && (
        <div className="text-center py-5 mb-2">
          <p className="text-xs text-brand-muted/40">
            {t('reports.noSalesInYear', 'No sales data for this year')}
          </p>
        </div>
      )}

      {/* Apply button */}
      <button
        onClick={handleApply}
        disabled={!hasSelection}
        className="w-full py-3 bg-[var(--clr-gold)] text-brand-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_24px_-4px_rgba(212,175,55,0.35)] transition-all duration-300 active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none"
        style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
      >
        {pickerMode === 'month'
          ? `${t('reports.viewMonth', 'View Month')} — ${t(MONTHS_KEYS[selectedMonth])} ${selectedYear}`
          : `${t('reports.viewYear', 'View Year')} — ${selectedYear}`
        }
        <ArrowRight size={15} weight="bold" />
      </button>
    </>
  );

  return (
    <div className="relative" ref={triggerRef}>
      {/* Trigger bar */}
      <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-brand-dark/60 backdrop-blur-xl border border-brand-border/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_8px_-2px_rgba(0,0,0,0.15)]">
        <Calendar size={14} weight="duotone" className="text-brand-muted/30 mx-1.5 shrink-0" />
        {quickPresets.map((preset) => {
          const { range, active } = quickPresetRange(preset);
          return (
            <button
              key={preset.label}
              onClick={() => onChange(range)}
              className={`relative px-3 sm:px-4 py-2 text-xs font-medium rounded-xl transition-all duration-300 ${
                active
                  ? 'bg-[var(--clr-gold)]/15 text-brand-gold border border-[var(--clr-gold)]/20'
                  : 'text-brand-muted/60 hover:text-brand-light/80 hover:bg-brand-border/10 border border-transparent'
              }`}
              style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`px-3 sm:px-4 py-2 text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
            showPicker
              ? 'bg-[var(--clr-gold)]/15 text-brand-gold border border-[var(--clr-gold)]/20'
              : 'text-brand-muted/60 hover:text-brand-light/80 hover:bg-brand-border/10 border border-transparent'
          }`}
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        >
          {t('reports.customRange', 'Custom')}
          <CaretDown size={12} weight="bold" className={`transition-transform duration-300 ${showPicker ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Picker panel */}
      <AnimatePresence>
        {showPicker && (
          <>
            {/* Mobile: full-screen bottom sheet */}
            <motion.div
              key="mobile-backdrop"
              variants={backdropVar}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[60] sm:hidden bg-black/50 backdrop-blur-sm"
              onClick={close}
            />
            <motion.div
              key="mobile-sheet"
              variants={sheetVar}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 inset-x-0 z-[61] sm:hidden max-h-[85vh] rounded-t-3xl bg-brand-dark/95 backdrop-blur-xl border border-brand-border/20 shadow-[0_-8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div className="w-10 h-1 rounded-full bg-brand-border/30 mx-auto mt-3 mb-1" />
              <div className="overflow-y-auto px-6 pb-8 pt-4">
                {pickerContent}
              </div>
            </motion.div>

            {/* Desktop: positioned dropdown */}
            <motion.div
              key="desktop-dropdown"
              ref={desktopRef}
              variants={dropdownVar}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="hidden sm:block absolute top-full mt-2 right-0 w-80 bg-brand-dark/95 backdrop-blur-xl rounded-2xl border border-brand-border/25 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] p-5 z-50 origin-top-right"
            >
              {pickerContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
