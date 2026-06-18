import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ShortcutsHelp = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setShow(true);
      }
      if (e.key === 'Escape') {
        setShow(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-brand-dark rounded-xl p-6 w-full max-w-sm relative shadow-[var(--shadow-floating)]">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-brand-muted hover:text-brand-gold transition-colors duration-150 text-lg leading-none"
          aria-label={t('common.close')}
        >
          ×
        </button>
        <h2 className="mb-4 text-lg font-bold text-brand-gold">{t('common.shortcuts')}</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-brand-muted">Alt+1</span>
            <span className="text-brand-light">{t('nav.inventory')}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-brand-muted">Alt+2</span>
            <span className="text-brand-light">{t('nav.pos')}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-brand-muted">Alt+3</span>
            <span className="text-brand-light">{t('nav.purchases')}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-brand-muted">Alt+4</span>
            <span className="text-brand-light">{t('nav.sales')}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-brand-muted">Alt+5</span>
            <span className="text-brand-light">{t('nav.reports')}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-brand-muted">Alt+6</span>
            <span className="text-brand-light">{t('nav.settings')}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-brand-muted">Alt+7</span>
            <span className="text-brand-light">{t('nav.users')}</span>
          </li>
        </ul>
        <p className="text-xs text-brand-muted mt-4">{t('common.pressEsc')}</p>
      </div>
    </div>
  );
};